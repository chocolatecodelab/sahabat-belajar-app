"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { ActionResponse } from "@/types";
import { revalidatePath } from "next/cache";
import { SessionStatus, AttendanceStatus } from "@prisma/client";

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
        message: "Kelas semi-privat maksimal 5 peserta. Peserta ke-6 ditolak (BR-3).",
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
          message: `Bentrok jadwal! Tutor ${tutorName} sudah memiliki sesi lain pada rentang waktu tersebut (BR-2).`,
        };
      }

      // BR-2: Deteksi Bentrok Jadwal Siswa
      for (const studentId of input.studentIds) {
        const { data: studentConflicts } = await supabaseAdmin
          .from("SessionParticipant")
          .select("id, student:Student(name), session:Session(startAt, endAt, status)")
          .eq("studentId", studentId)
          .limit(10);

        const hasConflict = (studentConflicts || []).some((sc: any) => {
          if (!sc.session || sc.session.status === "DIBATALKAN") return false;
          const sStart = new Date(sc.session.startAt).getTime();
          const sEnd = new Date(sc.session.endAt).getTime();
          return sStart < currentEnd.getTime() && sEnd > currentStart.getTime();
        });

        if (hasConflict) {
          return {
            success: false,
            message: `Bentrok jadwal! Salah satu siswa sudah memiliki sesi lain pada jam tersebut (BR-2).`,
          };
        }
      }

      // Cari paket aktif untuk masing-masing siswa
      const participantData = await Promise.all(
        input.studentIds.map(async (studentId) => {
          const { data: activePkgs } = await supabaseAdmin
            .from("StudentPackage")
            .select("id")
            .eq("studentId", studentId)
            .in("status", ["AKTIF", "HAMPIR_HABIS"])
            .order("createdAt", { ascending: false })
            .limit(1);

          return {
            studentId,
            studentPackageId: activePkgs?.[0]?.id || null,
            attendance: "HADIR",
            quotaDeducted: false,
          };
        })
      );

      const now = new Date().toISOString();
      const { data: session, error: sessionError } = await supabaseAdmin
        .from("Session")
        .insert({
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
      const participantsWithSession = participantData.map((p) => ({
        ...p,
        sessionId: session.id,
        updatedAt: now,
      }));

      await supabaseAdmin
        .from("SessionParticipant")
        .insert(participantsWithSession);

      createdSessionIds.push(session.id);
    }

    revalidatePath("/dashboard/jadwal");
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
      .order("startAt", { ascending: true });

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

    if (!sessions || sessions.length === 0) {
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
                updatedAt: now,
              })
              .eq("id", p.id);
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
                updatedAt: now,
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
    const now = new Date().toISOString();

    // Upsert journal
    await supabaseAdmin
      .from("SessionJournal")
      .upsert({
        sessionId,
        topic: data.topic.trim(),
        notes: data.notes?.trim() || null,
        homework: data.homework?.trim() || null,
        updatedAt: now,
      });

    // Update attendances if provided
    if (data.attendances && data.attendances.length > 0) {
      for (const att of data.attendances) {
        await supabaseAdmin
          .from("SessionParticipant")
          .update({ attendance: att.attendance, updatedAt: now })
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
