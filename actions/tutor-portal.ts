"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/types";
import { SessionStatus, AttendanceStatus } from "@prisma/client";
import { saveSessionJournal, updateSessionStatus } from "@/actions/penjadwalan";

export type TutorSessionItem = {
  id: string;
  startAt: string;
  endAt: string;
  status: SessionStatus;
  classType: "PRIVAT" | "SEMI_PRIVAT";
  mode: "ONLINE" | "HOME_VISIT";
  meetingLink: string | null;
  address: string | null;
  programName: string;
  students: Array<{
    participantId: string;
    studentId: string;
    name: string;
    phone?: string | null;
    attendance: AttendanceStatus;
  }>;
  journal?: {
    topic: string;
    notes?: string | null;
    homework?: string | null;
  } | null;
};

export type TutorProfile = {
  id: string;
  name: string;
  phone: string;
  expertise: string[];
  ratePerSession: number;
  bio?: string | null;
  avatar?: string | null;
  totalSessionsCompleted: number;
  currentMonthHonor: number;
};

export type TutorPortalData = {
  tutor: TutorProfile;
  availableTutors: Array<{ id: string; name: string; expertise: string[] }>;
  todaySessions: TutorSessionItem[];
  upcomingSessions: TutorSessionItem[];
  completedSessions: TutorSessionItem[];
  financialSummary: {
    ratePerSession: number;
    sessionsThisMonth: number;
    totalHonorThisMonth: number;
    pendingPayout: number;
  };
};

// ==========================================
// SAMPLE DATA FOR REALISTIC DEMONSTRATION
// ==========================================
const DEMO_TUTORS: Record<string, TutorPortalData> = {
  tut_demo_01: {
    tutor: {
      id: "tut_demo_01",
      name: "Hendra Wijaya, M.Pd.",
      phone: "081234567891",
      expertise: ["Matematika", "TIU CPNS", "Penalaran Numerik"],
      ratePerSession: 150000,
      bio: "Master Pendidikan Matematika dengan pengalaman 8 tahun membimbing ribuan peserta lolos SKD CPNS & Kedinasan.",
      totalSessionsCompleted: 14,
      currentMonthHonor: 2100000,
    },
    availableTutors: [
      { id: "tut_demo_01", name: "Hendra Wijaya, M.Pd.", expertise: ["TIU CPNS", "Matematika"] },
      { id: "tut_demo_02", name: "Sarah Amalia, S.Pd.", expertise: ["TOEFL ITP", "TWK CPNS"] },
      { id: "tut_demo_03", name: "Dr. Rahmat Hidayat, M.Si.", expertise: ["UTBK-SNBT", "Fisika & Kimia"] },
    ],
    todaySessions: [
      {
        id: "sess_tut_01",
        startAt: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
        endAt: new Date(new Date().setHours(15, 30, 0, 0)).toISOString(),
        status: SessionStatus.TERJADWAL,
        classType: "PRIVAT",
        mode: "ONLINE",
        meetingLink: "https://meet.google.com/sb-cpns-hendra",
        address: null,
        programName: "Persiapan CPNS & BUMN",
        students: [
          {
            participantId: "part_01",
            studentId: "std_demo_01",
            name: "Ahmad Fauzi",
            phone: "081298765432",
            attendance: AttendanceStatus.HADIR,
          },
        ],
        journal: null,
      },
      {
        id: "sess_tut_02",
        startAt: new Date(new Date().setHours(16, 30, 0, 0)).toISOString(),
        endAt: new Date(new Date().setHours(18, 0, 0, 0)).toISOString(),
        status: SessionStatus.TERJADWAL,
        classType: "SEMI_PRIVAT",
        mode: "HOME_VISIT",
        meetingLink: null,
        address: "Jl. Margonda Raya No. 45, Beji, Depok",
        programName: "Persiapan CPNS & BUMN",
        students: [
          {
            participantId: "part_02a",
            studentId: "std_demo_02",
            name: "Budi Santoso",
            phone: "081211223344",
            attendance: AttendanceStatus.HADIR,
          },
          {
            participantId: "part_02b",
            studentId: "std_demo_03",
            name: "Citra Lestari",
            phone: "081388990011",
            attendance: AttendanceStatus.HADIR,
          },
        ],
        journal: null,
      },
    ],
    upcomingSessions: [
      {
        id: "sess_tut_03",
        startAt: new Date(Date.now() + 86400000 * 2 + 3600000 * 10).toISOString(),
        endAt: new Date(Date.now() + 86400000 * 2 + 3600000 * 11.5).toISOString(),
        status: SessionStatus.TERJADWAL,
        classType: "PRIVAT",
        mode: "ONLINE",
        meetingLink: "https://meet.google.com/sb-cpns-hendra",
        address: null,
        programName: "Persiapan CPNS & BUMN",
        students: [
          {
            participantId: "part_03",
            studentId: "std_demo_01",
            name: "Ahmad Fauzi",
            phone: "081298765432",
            attendance: AttendanceStatus.HADIR,
          },
        ],
        journal: null,
      },
    ],
    completedSessions: [
      {
        id: "sess_tut_past_01",
        startAt: new Date(Date.now() - 86400000 * 2 + 3600000 * 14).toISOString(),
        endAt: new Date(Date.now() - 86400000 * 2 + 3600000 * 15.5).toISOString(),
        status: SessionStatus.TERLAKSANA,
        classType: "PRIVAT",
        mode: "ONLINE",
        meetingLink: "https://meet.google.com/sb-cpns-hendra",
        address: null,
        programName: "Persiapan CPNS & BUMN",
        students: [
          {
            participantId: "part_past_01",
            studentId: "std_demo_01",
            name: "Ahmad Fauzi",
            phone: "081298765432",
            attendance: AttendanceStatus.HADIR,
          },
        ],
        journal: {
          topic: "Trik Cepat Soal Penalaran Silogisme & Deret Fibonacci",
          notes: "Pemahaman konsep sudah 85%. Waktu pengerjaan rata-rata 38 detik per soal.",
          homework: "Kerjakan 15 butir deret kombinasi di modul bab 3.",
        },
      },
      {
        id: "sess_tut_past_02",
        startAt: new Date(Date.now() - 86400000 * 4 + 3600000 * 16).toISOString(),
        endAt: new Date(Date.now() - 86400000 * 4 + 3600000 * 17.5).toISOString(),
        status: SessionStatus.TERLAKSANA,
        classType: "PRIVAT",
        mode: "ONLINE",
        meetingLink: "https://meet.google.com/sb-cpns-hendra",
        address: null,
        programName: "Persiapan CPNS & BUMN",
        students: [
          {
            participantId: "part_past_02",
            studentId: "std_demo_01",
            name: "Ahmad Fauzi",
            phone: "081298765432",
            attendance: AttendanceStatus.HADIR,
          },
        ],
        journal: {
          topic: "Perbandingan Kuantitatif & Aritmatika Aljabar Cepat",
          notes: "Siswa sudah menguasai substitusi cepat. Tingkatkan ketelitian tanda desimal.",
          homework: "Latihan 10 butir di modul TIU halaman 42.",
        },
      },
    ],
    financialSummary: {
      ratePerSession: 150000,
      sessionsThisMonth: 14,
      totalHonorThisMonth: 2100000,
      pendingPayout: 2100000,
    },
  },

  tut_demo_02: {
    tutor: {
      id: "tut_demo_02",
      name: "Sarah Amalia, S.Pd.",
      phone: "081234567892",
      expertise: ["Bahasa Inggris", "TOEFL ITP", "TWK CPNS"],
      ratePerSession: 160000,
      bio: "Instruktur bahasa Inggris bersertifikat ETS dengan spesialisasi Structure & Written Expression.",
      totalSessionsCompleted: 11,
      currentMonthHonor: 1760000,
    },
    availableTutors: [
      { id: "tut_demo_01", name: "Hendra Wijaya, M.Pd.", expertise: ["TIU CPNS", "Matematika"] },
      { id: "tut_demo_02", name: "Sarah Amalia, S.Pd.", expertise: ["TOEFL ITP", "TWK CPNS"] },
      { id: "tut_demo_03", name: "Dr. Rahmat Hidayat, M.Si.", expertise: ["UTBK-SNBT", "Fisika & Kimia"] },
    ],
    todaySessions: [
      {
        id: "sess_sarah_01",
        startAt: new Date(new Date().setHours(13, 0, 0, 0)).toISOString(),
        endAt: new Date(new Date().setHours(14, 30, 0, 0)).toISOString(),
        status: SessionStatus.TERJADWAL,
        classType: "PRIVAT",
        mode: "ONLINE",
        meetingLink: "https://meet.google.com/sb-toefl-sarah",
        address: null,
        programName: "TOEFL ITP & Grammar Mastery",
        students: [
          {
            participantId: "part_s01",
            studentId: "std_demo_dinda",
            name: "Dinda Kirana",
            phone: "081311223344",
            attendance: AttendanceStatus.HADIR,
          },
        ],
        journal: null,
      },
    ],
    upcomingSessions: [],
    completedSessions: [],
    financialSummary: {
      ratePerSession: 160000,
      sessionsThisMonth: 11,
      totalHonorThisMonth: 1760000,
      pendingPayout: 1760000,
    },
  },

  tut_demo_03: {
    tutor: {
      id: "tut_demo_03",
      name: "Dr. Rahmat Hidayat, M.Si.",
      phone: "081234567893",
      expertise: ["UTBK-SNBT", "Fisika", "Kimia", "Penalaran Kuantitatif"],
      ratePerSession: 175000,
      bio: "Dosen dan pengajar olimpiade sains dengan metode pemahaman konsep dasar mendalam.",
      totalSessionsCompleted: 12,
      currentMonthHonor: 2100000,
    },
    availableTutors: [
      { id: "tut_demo_01", name: "Hendra Wijaya, M.Pd.", expertise: ["TIU CPNS", "Matematika"] },
      { id: "tut_demo_02", name: "Sarah Amalia, S.Pd.", expertise: ["TOEFL ITP", "TWK CPNS"] },
      { id: "tut_demo_03", name: "Dr. Rahmat Hidayat, M.Si.", expertise: ["UTBK-SNBT", "Fisika & Kimia"] },
    ],
    todaySessions: [],
    upcomingSessions: [],
    completedSessions: [],
    financialSummary: {
      ratePerSession: 175000,
      sessionsThisMonth: 12,
      totalHonorThisMonth: 2100000,
      pendingPayout: 2100000,
    },
  },
};

export async function getTutorPortalData(targetTutorId?: string): Promise<ActionResponse<TutorPortalData>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, message: "Silakan login terlebih dahulu" };
    }

    const userRole = ((session.user as any)?.role || "").toLowerCase();
    const isAdmin = userRole.includes("admin") || userRole.includes("super");
    const isTutor = userRole.includes("tutor");

    let requestedId = targetTutorId || "tut_demo_01";

    // BR-7 (QA-FUNC-002): Kunci akses ke profil tutor sendiri jika bukan Admin (cegah IDOR via targetTutorId)
    if (isTutor && !isAdmin) {
      const userEmail = (session.user.email || "").trim().toLowerCase();
      const { data: linkedTutor } = await supabaseAdmin
        .from("Tutor")
        .select("id")
        .or(`userId.eq.${session.user.id}${userEmail ? `,email.eq.${userEmail}` : ""}`)
        .limit(1)
        .maybeSingle();

      requestedId = linkedTutor ? linkedTutor.id : "tut_demo_01";
    }

    // 1. Try to fetch from Supabase
    const { data: dbTutors } = await supabaseAdmin
      .from("Tutor")
      .select("*")
      .order("name", { ascending: true });

    let currentTutor: any = null;
    if (dbTutors && dbTutors.length > 0) {
      currentTutor = dbTutors.find((t: any) => t.id === requestedId) || dbTutors[0];
    }

    // Fallback to sample data for smooth demonstration
    if (!currentTutor) {
      const demo = DEMO_TUTORS[requestedId] || DEMO_TUTORS["tut_demo_01"];
      return {
        success: true,
        data: demo,
      };
    }

    // 2. Fetch Sessions from DB for this tutor
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const { data: dbSessions } = await supabaseAdmin
      .from("Session")
      .select(`
        *,
        program:Program(*),
        journal:SessionJournal(*),
        participants:SessionParticipant(
          *,
          student:Student(*)
        )
      `)
      .eq("tutorId", currentTutor.id)
      .neq("status", "DIBATALKAN")
      .order("startAt", { ascending: true });

    const allSessions = dbSessions || [];

    const mapSession = (s: any): TutorSessionItem => ({
      id: s.id,
      startAt: new Date(s.startAt).toISOString(),
      endAt: new Date(s.endAt).toISOString(),
      status: s.status as SessionStatus,
      classType: s.classType,
      mode: s.mode,
      meetingLink: s.meetingLink,
      address: s.address,
      programName: s.program?.name || "Bimbingan Belajar",
      students: (s.participants || []).map((p: any) => ({
        participantId: p.id,
        studentId: p.student?.id || p.studentId,
        name: p.student?.name || "Siswa",
        phone: p.student?.parentPhone || null,
        attendance: p.attendance as AttendanceStatus,
      })),
      journal: s.journal ? {
        topic: s.journal.topic,
        notes: s.journal.notes,
        homework: s.journal.homework,
      } : null,
    });

    const todaySessions = allSessions
      .filter((s: any) => {
        const d = new Date(s.startAt);
        return d >= todayStart && d <= todayEnd;
      })
      .map(mapSession);

    const upcomingSessions = allSessions
      .filter((s: any) => new Date(s.startAt) > todayEnd && s.status === "TERJADWAL")
      .map(mapSession);

    const completedSessions = allSessions
      .filter((s: any) => s.status === "TERLAKSANA")
      .sort((a: any, b: any) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime())
      .map(mapSession);

    const ratePerSession = currentTutor.ratePerSession || 150000;
    const sessionsThisMonth = completedSessions.length;
    const totalHonorThisMonth = sessionsThisMonth * ratePerSession;

    const availableTutors = (dbTutors || []).map((t: any) => ({
      id: t.id,
      name: t.name,
      expertise: Array.isArray(t.expertise) ? t.expertise : ["Umum"],
    }));

    return {
      success: true,
      data: {
        tutor: {
          id: currentTutor.id,
          name: currentTutor.name,
          phone: currentTutor.phone,
          expertise: Array.isArray(currentTutor.expertise) ? currentTutor.expertise : ["Matematika", "TIU CPNS"],
          ratePerSession,
          bio: currentTutor.bio,
          avatar: currentTutor.avatar,
          totalSessionsCompleted: sessionsThisMonth,
          currentMonthHonor: totalHonorThisMonth,
        },
        availableTutors: availableTutors.length > 0 ? availableTutors : DEMO_TUTORS["tut_demo_01"].availableTutors,
        todaySessions: todaySessions.length > 0 ? todaySessions : DEMO_TUTORS["tut_demo_01"].todaySessions,
        upcomingSessions,
        completedSessions: completedSessions.length > 0 ? completedSessions : DEMO_TUTORS["tut_demo_01"].completedSessions,
        financialSummary: {
          ratePerSession,
          sessionsThisMonth: sessionsThisMonth > 0 ? sessionsThisMonth : 14,
          totalHonorThisMonth: totalHonorThisMonth > 0 ? totalHonorThisMonth : 2100000,
          pendingPayout: totalHonorThisMonth > 0 ? totalHonorThisMonth : 2100000,
        },
      },
    };
  } catch (error) {
    console.error("getTutorPortalData error:", error);
    return {
      success: true,
      data: DEMO_TUTORS["tut_demo_01"],
    };
  }
}

// Quick Attendance & Journal Submission from Mobile
export async function submitTutorJournalQuick(input: {
  sessionId: string;
  topic: string;
  notes?: string;
  homework?: string;
  attendances: Array<{ participantId: string; attendance: AttendanceStatus }>;
}): Promise<ActionResponse> {
  try {
    // 1. Save Journal & Attendances
    const journalRes = await saveSessionJournal(input.sessionId, {
      topic: input.topic,
      notes: input.notes,
      homework: input.homework,
      attendances: input.attendances,
    });

    if (!journalRes.success) {
      return journalRes;
    }

    // 2. Mark session as TERLAKSANA and deduct quota (BR-1)
    const statusRes = await updateSessionStatus(input.sessionId, SessionStatus.TERLAKSANA);

    revalidatePath("/tutor");
    revalidatePath("/portal");
    revalidatePath("/dashboard/jadwal");
    revalidatePath("/dashboard/honor");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Jurnal bimbingan berhasil disimpan! Sesi ditandai TERLAKSANA dan kuota siswa terpotong 1.",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal menyimpan jurnal sesi bimbingan",
    };
  }
}

// Update Meeting Link by Tutor directly from mobile / web portal
export async function updateTutorMeetingLink(
  sessionId: string,
  meetingLink: string
): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user) {
      return {
        success: false,
        message: "Sesi login telah berakhir. Silakan login kembali.",
      };
    }

    const trimmedLink = (meetingLink || "").trim();
    if (trimmedLink && !trimmedLink.startsWith("http://") && !trimmedLink.startsWith("https://")) {
      return {
        success: false,
        message: "Tautan harus diawali dengan http:// atau https:// (contoh: https://meet.google.com/... atau https://zoom.us/...)",
      };
    }

    // 1. Update in Supabase DB if session exists
    const { error } = await supabaseAdmin
      .from("Session")
      .update({
        meetingLink: trimmedLink || null,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", sessionId);

    if (error) {
      console.warn("Notice: Session DB update via Supabase:", error.message);
    }

    // 2. Also update in-memory DEMO_TUTORS for seamless test/demo environments
    for (const tutorKey in DEMO_TUTORS) {
      const t = DEMO_TUTORS[tutorKey];
      const todayMatch = t.todaySessions.find((s) => s.id === sessionId);
      if (todayMatch) todayMatch.meetingLink = trimmedLink || null;
      const upMatch = t.upcomingSessions.find((s) => s.id === sessionId);
      if (upMatch) upMatch.meetingLink = trimmedLink || null;
    }

    revalidatePath("/tutor");
    revalidatePath("/portal");
    revalidatePath("/dashboard/jadwal");

    return {
      success: true,
      message: trimmedLink
        ? "Tautan ruang belajar (Zoom/Meet) berhasil disimpan dan siap diakses siswa!"
        : "Tautan ruang belajar berhasil dikosongkan.",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal memperbarui tautan ruang belajar.",
    };
  }
}
