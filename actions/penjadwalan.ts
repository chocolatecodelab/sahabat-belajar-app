"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { ActionResponse } from "@/types";
import { revalidatePath } from "next/cache";
import { SessionStatus, AttendanceStatus } from "@prisma/client";
import { requireStaffOrAdmin, requireOperationalOrTutor } from "@/lib/auth";
import { notifySessionScheduled, notifyLowQuotaAlert } from "@/lib/notifications";

export type CreateSessionInput = {
  tutorId: string;
  programId: string;
  classType: "PRIVAT" | "SEMI_PRIVAT";
  mode: "ONLINE" | "HOME_VISIT";
  startAt: string | Date; // ISO string or Date
  endAt: string | Date;
  studentIds: string[]; // 1 for PRIVAT, 2-5 for SEMI_PRIVAT
  meetingLink?: string;
  address?: string;
  recurrenceWeeks?: number; // C3: Sesi berulang mingguan
};

export async function createSession(
  input: CreateSessionInput
): Promise<ActionResponse<{ sessionIds: string[] }>> {
  try {
    await requireStaffOrAdmin();
    const startDate = new Date(input.startAt);
    const endDate = new Date(input.endAt);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate >= endDate) {
      return {
        success: false,
        message: "Waktu mulai dan selesai sesi tidak valid.",
      };
    }

    // BR-3: Batasan semi-privat maksimal 5 peserta
    if (input.studentIds.length === 0) {
      return { success: false, message: "Pilih minimal 1 siswa untuk sesi bimbingan." };
    }
    if (input.classType === "PRIVAT" && input.studentIds.length > 1) {
      return { success: false, message: "Kelas privat hanya untuk 1 siswa." };
    }
    if (input.studentIds.length > 5) {
      return {
        success: false,
        message: "Kelas semi-privat maksimal 5 peserta. Peserta ke-6 ditolak.",
      };
    }

    const weeks = input.recurrenceWeeks && input.recurrenceWeeks > 1 ? input.recurrenceWeeks : 1;
    const recurrenceId = weeks > 1 ? `rec_${Date.now()}` : null;
    const createdSessionIds: string[] = [];

    for (let w = 0; w < weeks; w++) {
      const currentStart = new Date(startDate.getTime() + w * 7 * 24 * 60 * 60 * 1000);
      const currentEnd = new Date(endDate.getTime() + w * 7 * 24 * 60 * 60 * 1000);

      // BR-2: Deteksi Bentrok Jadwal Tutor
      const { data: tutorConflicts } = await supabaseAdmin
        .from("Session")
        .select("id, tutor:Tutor(name)")
        .eq("tutorId", input.tutorId)
        .neq("status", "DIBATALKAN")
        .lt("startAt", currentEnd.toISOString())
        .gt("endAt", currentStart.toISOString())
        .limit(1);

      if (tutorConflicts && tutorConflicts.length > 0) {
        const tutorName = (tutorConflicts[0] as any).tutor?.name || "Tutor";
        return {
          success: false,
          message: `Bentrok jadwal! Tutor ${tutorName} sudah memiliki sesi lain pada rentang waktu tersebut.`,
        };
      }

      // BR-2: Deteksi Bentrok Jadwal Siswa (Batch Query Tanpa Limit 10 - QA-FUNC-004 & QA-PERF-001)
      const { data: studentConflicts } = await supabaseAdmin
        .from("SessionParticipant")
        .select("id, studentId, student:Student(name), session:Session!inner(id, startAt, endAt, status)")
        .in("studentId", input.studentIds)
        .neq("session.status", "DIBATALKAN")
        .lt("session.startAt", currentEnd.toISOString())
        .gt("session.endAt", currentStart.toISOString())
        .limit(1);

      if (studentConflicts && studentConflicts.length > 0) {
        const studentName = (studentConflicts[0] as any).student?.name || "Salah satu siswa";
        return {
          success: false,
          message: `Bentrok jadwal! ${studentName} sudah memiliki sesi lain pada jam tersebut.`,
        };
      }

      // Cari paket aktif untuk masing-masing siswa secara batch (QA-PERF-001)
      const { data: allActivePkgs } = await supabaseAdmin
        .from("StudentPackage")
        .select("id, studentId, createdAt")
        .in("studentId", input.studentIds)
        .in("status", ["AKTIF", "HAMPIR_HABIS"])
        .order("createdAt", { ascending: false });

      const participantData = input.studentIds.map((studentId) => {
        const matchedPkg = (allActivePkgs || []).find((pkg: any) => pkg.studentId === studentId);
        return {
          studentId,
          studentPackageId: matchedPkg?.id || null,
          attendance: "HADIR",
          quotaDeducted: false,
        };
      });

      const now = new Date().toISOString();
      const sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const { data: session, error: sessionError } = await supabaseAdmin
        .from("Session")
        .insert({
          id: sessionId,
          tutorId: input.tutorId,
          programId: input.programId,
          classType: input.classType,
          mode: input.mode,
          startAt: currentStart.toISOString(),
          endAt: currentEnd.toISOString(),
          meetingLink: input.meetingLink || null,
          address: input.address || null,
          status: "TERJADWAL",
          recurrenceId,
          updatedAt: now,
        })
        .select("id")
        .single();

      if (sessionError) throw sessionError;

      // Insert participants
      const participantsWithSession = participantData.map((p, pIdx) => ({
        id: 'spart_' + Date.now() + '_' + pIdx + '_' + Math.random().toString(36).substring(2, 7),
        ...p,
        sessionId: session.id,
      }));

      const { error: partErr } = await supabaseAdmin
        .from("SessionParticipant")
        .insert(participantsWithSession);

      if (partErr) throw partErr;

      createdSessionIds.push(session.id);
    }

    // Trigger otomatis notifikasi WA & Email jadwal sesi baru ke Siswa/Ortu & Tutor
    try {
      const [{ data: tutorInfo }, { data: programInfo }, { data: studentsInfo }] = await Promise.all([
        supabaseAdmin.from("Tutor").select("name, phone").eq("id", input.tutorId).maybeSingle(),
        supabaseAdmin.from("Program").select("name").eq("id", input.programId).maybeSingle(),
        supabaseAdmin.from("Student").select("name, parentPhone").in("id", input.studentIds),
      ]);

      await notifySessionScheduled({
        sessionId: createdSessionIds[0] || "sess_new",
        programName: programInfo?.name || "Program Bimbingan Belajar",
        classType: input.classType,
        mode: input.mode,
        startAt: startDate,
        endAt: endDate,
        meetingLink: input.meetingLink || null,
        address: input.address || null,
        tutorName: tutorInfo?.name || "Tutor Sahabat Belajar",
        tutorPhone: tutorInfo?.phone || null,
        students: (studentsInfo || []).map((s: any) => ({
          name: s.name,
          parentPhone: s.parentPhone,
          email: null,
        })),
      });
    } catch (notifErr) {
      console.error("createSession notification trigger error:", notifErr);
    }

    revalidatePath("/dashboard/jadwal");
    revalidatePath("/dashboard/pengaturan/notifikasi");
    revalidatePath("/dashboard");

    return {
      success: true,
      message:
        weeks > 1
          ? `Berhasil membuat ${weeks} sesi berulang mingguan tanpa bentrok.`
          : "Sesi bimbingan berhasil dijadwalkan.",
      data: { sessionIds: createdSessionIds },
    };
  } catch (error: any) {
    console.error("createSession error:", error);
    return {
      success: false,
      message: "Gagal membuat sesi jadwal.",
    };
  }
}

export async function getSessions(params?: {
  startDate?: Date | string;
  endDate?: Date | string;
  tutorId?: string;
  studentId?: string;
  status?: SessionStatus;
}) {
  try {
    await requireOperationalOrTutor();
    let query = supabaseAdmin
      .from("Session")
      .select(`
        *,
        tutor:Tutor(id, name, phone),
        program:Program(id, name, category),
        participants:SessionParticipant(
          *,
          student:Student(id, name, parentPhone),
          studentPackage:StudentPackage(*)
        ),
        journal:SessionJournal(*)
      `)
      .order("startAt", { ascending: true })
      .limit(250);

    if (params?.status) {
      query = query.eq("status", params.status);
    }
    if (params?.tutorId) {
      query = query.eq("tutorId", params.tutorId);
    }
    if (params?.startDate) {
      query = query.gte("startAt", new Date(params.startDate).toISOString());
    }
    if (params?.endDate) {
      query = query.lte("startAt", new Date(params.endDate).toISOString());
    }

    const { data: sessions, error } = await query;
    if (error) throw error;

    // QA-REGR-001: Hanya kembalikan sesi demo jika tidak ada filter spesifik yang sedang aktif
    const hasActiveFilter = Boolean(params?.status || params?.tutorId || params?.studentId);
    if ((!sessions || sessions.length === 0) && !hasActiveFilter) {
      const today14 = new Date(new Date().setHours(14, 0, 0, 0)).toISOString();
      const today1530 = new Date(new Date().setHours(15, 30, 0, 0)).toISOString();
      const today16 = new Date(new Date().setHours(16, 0, 0, 0)).toISOString();
      const today1730 = new Date(new Date().setHours(17, 30, 0, 0)).toISOString();
      const tomorrow10 = new Date(new Date(Date.now() + 86400000).setHours(10, 0, 0, 0)).toISOString();
      const tomorrow1130 = new Date(new Date(Date.now() + 86400000).setHours(11, 30, 0, 0)).toISOString();

      return [
        {
          id: "sess_demo_01",
          startAt: today14,
          endAt: today1530,
          status: "TERJADWAL",
          classType: "PRIVAT",
          mode: "ONLINE",
          meetingLink: "https://meet.google.com/sb-cpns-hendra",
          address: null,
          program: { id: "prog_01", name: "Persiapan CPNS & BUMN", category: "CPNS_BUMN" },
          tutor: { id: "tut_demo_01", name: "Hendra Wijaya, M.Pd.", phone: "081234567891" },
          participants: [
            { id: "part_01", studentId: "std_demo_01", attendance: "HADIR", quotaDeducted: false, student: { id: "std_demo_01", name: "Ahmad Fauzi", parentPhone: "081298765432" } }
          ],
          journal: null,
        },
        {
          id: "sess_demo_02",
          startAt: today16,
          endAt: today1730,
          status: "TERJADWAL",
          classType: "SEMI_PRIVAT",
          mode: "HOME_VISIT",
          meetingLink: null,
          address: "Jl. Boulevard Barat Raya No. 45, Kelapa Gading, Jakarta Utara",
          program: { id: "prog_03", name: "UTBK-SNBT Masuk PTN", category: "K12" },
          tutor: { id: "tut_demo_03", name: "Dr. Rahmat Hidayat, M.Si.", phone: "081234567893" },
          participants: [
            { id: "part_02", studentId: "std_demo_02", attendance: "HADIR", quotaDeducted: false, student: { id: "std_demo_02", name: "Budi Santoso", parentPhone: "081345678901" } },
            { id: "part_03", studentId: "std_demo_03", attendance: "HADIR", quotaDeducted: false, student: { id: "std_demo_03", name: "Citra Kirana", parentPhone: "081398761234" } },
          ],
          journal: null,
        },
        {
          id: "sess_demo_03",
          startAt: tomorrow10,
          endAt: tomorrow1130,
          status: "TERJADWAL",
          classType: "PRIVAT",
          mode: "ONLINE",
          meetingLink: "https://meet.google.com/sb-toefl-sarah",
          address: null,
          program: { id: "prog_04", name: "TOEFL / IELTS Preparation", category: "TOEFL_IELTS" },
          tutor: { id: "tut_demo_02", name: "Sarah Amalia, S.Pd.", phone: "081234567892" },
          participants: [
            { id: "part_04", studentId: "std_demo_04", attendance: "HADIR", quotaDeducted: false, student: { id: "std_demo_04", name: "Dina Permata", parentPhone: "081512345678" } }
          ],
          journal: null,
        },
      ];
    }

    return sessions || [];
  } catch (error) {
    console.error("getSessions error:", error);
    return [];
  }
}

// BR-1: Eksekusi pengurangan kuota saat sesi Terlaksana
export async function updateSessionStatus(
  sessionId: string,
  newStatus: SessionStatus,
  cancelReason?: string
): Promise<ActionResponse> {
  try {
    await requireOperationalOrTutor();
    const { data: session, error: sessErr } = await supabaseAdmin
      .from("Session")
      .select("*, participants:SessionParticipant(*)")
      .eq("id", sessionId)
      .single();

    if (sessErr || !session) {
      return { success: false, message: "Sesi tidak ditemukan." };
    }

    const now = new Date().toISOString();

    // 1. Update status sesi
    await supabaseAdmin
      .from("Session")
      .update({
        status: newStatus,
        cancelReason: cancelReason || null,
        updatedAt: now,
      })
      .eq("id", sessionId);

    // 2. BR-1: Jika status diubah menjadi TERLAKSANA, potong kuota peserta hadir
    if (newStatus === ("TERLAKSANA" as any)) {
      for (const p of session.participants || []) {
        if (!p.quotaDeducted && p.studentPackageId && p.attendance === "HADIR") {
          const { data: currentPkg } = await supabaseAdmin
            .from("StudentPackage")
            .select("*")
            .eq("id", p.studentPackageId)
            .single();

          if (currentPkg) {
            const newQuotaUsed = (currentPkg.quotaUsed || 0) + 1;
            let newPkgStatus = currentPkg.status;

            if (newQuotaUsed >= currentPkg.quotaTotal) {
              newPkgStatus = "HABIS";
            } else if (currentPkg.quotaTotal - newQuotaUsed <= 2) {
              newPkgStatus = "HAMPIR_HABIS";
            }

            await supabaseAdmin
              .from("StudentPackage")
              .update({
                quotaUsed: newQuotaUsed,
                status: newPkgStatus,
                updatedAt: now,
              })
              .eq("id", p.studentPackageId);

            await supabaseAdmin
              .from("SessionParticipant")
              .update({
                quotaDeducted: true,
              })
              .eq("id", p.id);

            // Trigger otomatis peringatan kuota kritis jika sisa kuota <= 2 sesi atau habis
            const quotaRemaining = Math.max(0, currentPkg.quotaTotal - newQuotaUsed);
            if (quotaRemaining <= 2) {
              try {
                const [{ data: stInfo }, { data: pkgInfo }] = await Promise.all([
                  supabaseAdmin.from("Student").select("name, parentPhone").eq("id", p.studentId).maybeSingle(),
                  supabaseAdmin.from("Package").select("name").eq("id", currentPkg.packageId).maybeSingle(),
                ]);
                await notifyLowQuotaAlert({
                  studentName: stInfo?.name || "Siswa Sahabat Belajar",
                  parentPhone: stInfo?.parentPhone || null,
                  packageName: pkgInfo?.name || "Paket Bimbingan Belajar",
                  quotaTotal: currentPkg.quotaTotal,
                  quotaUsed: newQuotaUsed,
                  quotaRemaining,
                });
              } catch (lowQuotaErr) {
                console.error("lowQuotaAlert trigger error:", lowQuotaErr);
              }
            }
          }
        }
      }
    } else if (session.status === ("TERLAKSANA" as any) && newStatus !== ("TERLAKSANA" as any)) {
      // 2b. BR-1 Quota Rollback (SB-QA-FUN-005): Pulihkan kuota jika sesi yang sebelumnya terlaksana dibatalkan/dijadwalkan ulang
      for (const p of session.participants || []) {
        if (p.quotaDeducted && p.studentPackageId) {
          const { data: currentPkg } = await supabaseAdmin
            .from("StudentPackage")
            .select("*")
            .eq("id", p.studentPackageId)
            .single();

          if (currentPkg) {
            const newQuotaUsed = Math.max(0, (currentPkg.quotaUsed || 0) - 1);
            let newPkgStatus = "AKTIF";
            if (currentPkg.quotaTotal - newQuotaUsed <= 2) {
              newPkgStatus = "HAMPIR_HABIS";
            }

            await supabaseAdmin
              .from("StudentPackage")
              .update({
                quotaUsed: newQuotaUsed,
                status: newPkgStatus,
                updatedAt: now,
              })
              .eq("id", p.studentPackageId);

            await supabaseAdmin
              .from("SessionParticipant")
              .update({
                quotaDeducted: false,
              })
              .eq("id", p.id);
          }
        }
      }
    }

    revalidatePath("/dashboard/jadwal");
    revalidatePath("/dashboard/paket");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Status sesi berhasil diubah menjadi ${newStatus}.`,
    };
  } catch (error: any) {
    console.error("updateSessionStatus error:", error);
    return {
      success: false,
      message: "Gagal memperbarui status sesi.",
    };
  }
}

export async function saveSessionJournal(
  sessionId: string,
  data: {
    topic: string;
    notes?: string;
    homework?: string;
    attendances?: Array<{ participantId: string; attendance: AttendanceStatus }>;
  }
): Promise<ActionResponse> {
  try {
    await requireOperationalOrTutor();
    const now = new Date().toISOString();
    const journalId = 'jnl_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    // Upsert journal
    await supabaseAdmin
      .from("SessionJournal")
      .upsert({
        id: journalId,
        sessionId,
        topic: data.topic.trim(),
        notes: data.notes?.trim() || null,
        homework: data.homework?.trim() || null,
        updatedAt: now,
      }, { onConflict: "sessionId" });

    // Update attendances if provided
    if (data.attendances && data.attendances.length > 0) {
      for (const att of data.attendances) {
        await supabaseAdmin
          .from("SessionParticipant")
          .update({ attendance: att.attendance })
          .eq("id", att.participantId);
      }
    }

    revalidatePath("/dashboard/jadwal");

    return {
      success: true,
      message: "Jurnal pertemuan dan absensi berhasil disimpan.",
    };
  } catch (error: any) {
    console.error("saveSessionJournal error:", error);
    return {
      success: false,
      message: "Gagal menyimpan jurnal sesi.",
    };
  }
}
