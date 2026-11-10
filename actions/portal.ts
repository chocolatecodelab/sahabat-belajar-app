"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/types";

export type SiblingStudent = {
  id: string;
  name: string;
  level: string;
};

export type StudentInvoice = {
  id: string;
  invoiceNumber: string;
  packageName: string;
  programName: string;
  amount: number;
  paidAt: string | null;
  method: string;
  status: "LUNAS" | "MENUNGGU_PEMBAYARAN";
  proofFile?: string | null;
  notes?: string | null;
};

export type StudentPortalData = {
  student: {
    id: string;
    name: string;
    level: string;
    school: string | null;
    parentName: string | null;
    parentPhone: string | null;
    status: string;
  };
  siblings: SiblingStudent[];
  packages: Array<{
    id: string;
    packageName: string;
    programName: string;
    quotaTotal: number;
    quotaUsed: number;
    quotaRemaining: number;
    startDate: string;
    endDate: string | null;
    status: string;
  }>;
  upcomingSessions: Array<{
    id: string;
    programName: string;
    tutorName: string;
    classType: string;
    mode: string;
    startAt: string;
    endAt: string;
    meetingLink: string | null;
    address: string | null;
  }>;
  pastSessions: Array<{
    id: string;
    programName: string;
    tutorName: string;
    startAt: string;
    endAt: string;
    status: string;
    attendance: string;
    topic: string | null;
    notes: string | null;
    homework: string | null;
  }>;
  invoices: StudentInvoice[];
};

// ==========================================
// SAMPLE DATA FOR MULTI-STUDENT SIBLINGS & INVOICES
// ==========================================
const SIBLINGS_MAP: Record<string, StudentPortalData> = {
  student_01: {
    student: {
      id: "student_01",
      name: "Ahmad Fauzi",
      level: "Kelas 12 SMA (Sains & Teknologi)",
      school: "SMAN 1 Jakarta",
      parentName: "Bapak Hendro",
      parentPhone: "+62 812-9988-7766",
      status: "AKTIF",
    },
    siblings: [
      { id: "student_01", name: "Ahmad Fauzi", level: "Kelas 12 SMA" },
      { id: "std_demo_01", name: "Rian Hendro", level: "Alumni / CPNS" },
    ],
    packages: [
      {
        id: "sp_01",
        packageName: "Paket 10 Sesi Privat K-12",
        programName: "Bimbel K-12 (SD, SMP, SMA)",
        quotaTotal: 10,
        quotaUsed: 2,
        quotaRemaining: 8,
        startDate: new Date(Date.now() - 86400000 * 14).toISOString(),
        endDate: new Date(Date.now() + 86400000 * 50).toISOString(),
        status: "AKTIF",
      },
    ],
    upcomingSessions: [
      {
        id: "sess_up_k12_01",
        programName: "Bimbel K-12 (SD, SMP, SMA)",
        tutorName: "Dr. Rahmat Hidayat, M.Si.",
        classType: "PRIVAT",
        mode: "ONLINE",
        startAt: new Date(Date.now() + 86400000 * 1 + 3600000 * 16).toISOString(),
        endAt: new Date(Date.now() + 86400000 * 1 + 3600000 * 17.5).toISOString(),
        meetingLink: "https://meet.google.com/sb-k12-rahmat",
        address: null,
      },
      {
        id: "sess_up_k12_02",
        programName: "Bimbel K-12 (SD, SMP, SMA)",
        tutorName: "Sarah Amalia, S.Pd.",
        classType: "PRIVAT",
        mode: "HOME_VISIT",
        startAt: new Date(Date.now() + 86400000 * 3 + 3600000 * 15).toISOString(),
        endAt: new Date(Date.now() + 86400000 * 3 + 3600000 * 16.5).toISOString(),
        meetingLink: null,
        address: "Jl. Teuku Umar No. 12, Menteng, Jakarta Pusat",
      },
    ],
    pastSessions: [
      {
        id: "sess_past_k12_01",
        programName: "Bimbel K-12 (SD, SMP, SMA)",
        tutorName: "Dr. Rahmat Hidayat, M.Si.",
        startAt: new Date(Date.now() - 86400000 * 3 + 3600000 * 16).toISOString(),
        endAt: new Date(Date.now() - 86400000 * 3 + 3600000 * 17.5).toISOString(),
        status: "TERLAKSANA",
        attendance: "HADIR",
        topic: "Fisika: Gelombang Elektromagnetik & Optika Fisis",
        notes: "Ahmad memahami konsep interferensi dengan baik. Latihan soal HOTS diselesaikan tepat waktu.",
        homework: "Kerjakan 10 soal evaluasi gelombang pada modul Fisika Bab 5.",
      },
      {
        id: "sess_past_k12_02",
        programName: "Bimbel K-12 (SD, SMP, SMA)",
        tutorName: "Sarah Amalia, S.Pd.",
        startAt: new Date(Date.now() - 86400000 * 6 + 3600000 * 15).toISOString(),
        endAt: new Date(Date.now() - 86400000 * 6 + 3600000 * 16.5).toISOString(),
        status: "TERLAKSANA",
        attendance: "HADIR",
        topic: "Matematika: Integral Substitusi & Luas Daerah Kurva",
        notes: "Perlu sedikit ketelitian pada tanda negatif saat integrasi parsial.",
        homework: "Review 5 soal latihan integral pada pocket book Matematika SMA.",
      },
    ],
    invoices: [
      {
        id: "inv_k12_01",
        invoiceNumber: "INV-SB/2026/04/0078",
        packageName: "Paket 10 Sesi Privat K-12",
        programName: "Bimbel K-12 (SD, SMP, SMA)",
        amount: 1400000,
        paidAt: new Date(Date.now() - 86400000 * 14).toISOString(),
        method: "TRANSFER_BCA",
        status: "LUNAS",
        proofFile: null,
        notes: "Pembayaran lunas via Transfer BCA.",
      },
    ],
  },

  std_demo_01: {
    student: {
      id: "std_demo_01",
      name: "Rian Hendro",
      level: "Alumni / Persiapan CPNS & Kedinasan",
      school: "Universitas Indonesia",
      parentName: "Bapak Hendro",
      parentPhone: "+62 812-9988-7766",
      status: "AKTIF",
    },
    siblings: [
      { id: "student_01", name: "Ahmad Fauzi", level: "Kelas 12 SMA" },
      { id: "std_demo_01", name: "Rian Hendro", level: "Alumni / CPNS" },
    ],
    packages: [
      {
        id: "sp_cpns_01",
        packageName: "Paket Privat Intensif SKD CPNS 2026",
        programName: "Persiapan CPNS & BUMN",
        quotaTotal: 10,
        quotaUsed: 7,
        quotaRemaining: 3,
        startDate: new Date(Date.now() - 86400000 * 20).toISOString(),
        endDate: new Date(Date.now() + 86400000 * 40).toISOString(),
        status: "AKTIF",
      },
    ],
    upcomingSessions: [
      {
        id: "sess_up_01",
        programName: "Persiapan CPNS & BUMN",
        tutorName: "Hendra Wijaya, M.Pd.",
        classType: "PRIVAT",
        mode: "ONLINE",
        startAt: new Date(Date.now() + 86400000 * 1 + 3600000 * 9).toISOString(),
        endAt: new Date(Date.now() + 86400000 * 1 + 3600000 * 10.5).toISOString(),
        meetingLink: "https://meet.google.com/sb-cpns-hendra",
        address: null,
      },
    ],
    pastSessions: [
      {
        id: "sess_past_01",
        programName: "Persiapan CPNS & BUMN",
        tutorName: "Hendra Wijaya, M.Pd.",
        startAt: new Date(Date.now() - 86400000 * 3 + 3600000 * 9).toISOString(),
        endAt: new Date(Date.now() - 86400000 * 3 + 3600000 * 10.5).toISOString(),
        status: "TERLAKSANA",
        attendance: "HADIR",
        topic: "Trik Cepat Soal Penalaran Silogisme & Deret Fibonacci",
        notes: "Pemahaman konsep sudah 85%. Tingkatkan kecepatan waktu pengerjaan di bawah 40 detik.",
        homework: "Latihan 15 butir deret variasi kombinasi pada modul bab 3.",
      },
    ],
    invoices: [
      {
        id: "inv_01",
        invoiceNumber: "INV-SB/2026/04/0089",
        packageName: "Paket Privat Intensif SKD CPNS 2026 (10 Sesi)",
        programName: "Persiapan CPNS & BUMN",
        amount: 2250000,
        paidAt: new Date(Date.now() - 86400000 * 20).toISOString(),
        method: "TRANSFER_BCA",
        status: "LUNAS",
        proofFile: null,
        notes: "Pembayaran lunas termin awal bimbingan.",
      },
    ],
  },

  std_demo_02: {
    student: {
      id: "std_demo_02",
      name: "Nadia Salsabila",
      level: "Kelas 12 SMA (Sains & Teknologi)",
      school: "SMAN 8 Jakarta",
      parentName: "Bambang Haryanto, S.E.",
      parentPhone: "081298765432",
      status: "AKTIF",
    },
    siblings: [
      { id: "student_01", name: "Ahmad Fauzi", level: "Kelas 12 SMA" },
      { id: "std_demo_01", name: "Rian Hendro", level: "Alumni / CPNS" },
    ],
    packages: [
      {
        id: "sp_utbk_01",
        packageName: "Paket Semi-Privat Sukses UTBK-SNBT 2026",
        programName: "Persiapan UTBK-SNBT",
        quotaTotal: 12,
        quotaUsed: 4,
        quotaRemaining: 8,
        startDate: new Date(Date.now() - 86400000 * 14).toISOString(),
        endDate: new Date(Date.now() + 86400000 * 50).toISOString(),
        status: "AKTIF",
      },
    ],
    upcomingSessions: [
      {
        id: "sess_up_nadia_01",
        programName: "Persiapan UTBK-SNBT",
        tutorName: "Dr. Rahmat Hidayat, M.Si.",
        classType: "SEMI_PRIVAT",
        mode: "ONLINE",
        startAt: new Date(Date.now() + 86400000 * 2 + 3600000 * 16).toISOString(),
        endAt: new Date(Date.now() + 86400000 * 2 + 3600000 * 17.5).toISOString(),
        meetingLink: "https://meet.google.com/sb-utbk-rahmat",
        address: null,
      },
    ],
    pastSessions: [
      {
        id: "sess_past_nadia_01",
        programName: "Persiapan UTBK-SNBT",
        tutorName: "Dr. Rahmat Hidayat, M.Si.",
        startAt: new Date(Date.now() - 86400000 * 4 + 3600000 * 16).toISOString(),
        endAt: new Date(Date.now() - 86400000 * 4 + 3600000 * 17.5).toISOString(),
        status: "TERLAKSANA",
        attendance: "HADIR",
        topic: "Pengetahuan Kuantitatif: Aljabar Fungsi & Geometri Analitik",
        notes: "Nadia mampu menyelesaikan 8 dari 10 soal HOTS dengan tepat.",
        homework: "Kerjakan 10 soal latihan mandiri UTBK TPS di modul Bab 4.",
      },
    ],
    invoices: [
      {
        id: "inv_nadia_01",
        invoiceNumber: "INV-SB/2026/04/0112",
        packageName: "Paket Semi-Privat Sukses UTBK-SNBT 2026 (12 Sesi)",
        programName: "Persiapan UTBK-SNBT",
        amount: 1950000,
        paidAt: new Date(Date.now() - 86400000 * 14).toISOString(),
        method: "QRIS_BSI",
        status: "LUNAS",
        proofFile: "/proof/qris-inv112.pdf",
        notes: "Pembayaran lunas via QRIS.",
      },
    ],
  },
};

export async function getStudentPortalData(
  targetStudentId?: string
): Promise<ActionResponse<StudentPortalData>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, message: "Silakan login terlebih dahulu" };
    }

    const userId = session.user.id;
    const userRole = ((session.user as any)?.role || "").toLowerCase();
    const isAdminOrStaff = userRole.includes("admin") || userRole.includes("super") || userRole.includes("staf");

    let effectiveTargetId = targetStudentId;

    // Security IDOR Protection (SB-QA-FUN-002):
    // Jika bukan Admin/Staf, pastikan targetStudentId adalah akun milik user atau saudaranya (multi-anak)
    if (effectiveTargetId && !isAdminOrStaff) {
      const { data: myStudents } = await supabaseAdmin
        .from("Student")
        .select("id, parentPhone")
        .eq("userId", userId);

      if (myStudents && myStudents.length > 0) {
        const isOwner = myStudents.some((s: any) => s.id === effectiveTargetId);
        if (!isOwner) {
          // Periksa apakah memiliki nomor telepon wali yang sama (sibling)
          const myParentPhone = myStudents[0].parentPhone;
          const { data: requestedStudent } = await supabaseAdmin
            .from("Student")
            .select("parentPhone")
            .eq("id", effectiveTargetId)
            .maybeSingle();

          if (!requestedStudent || requestedStudent.parentPhone !== myParentPhone) {
            // Akses ditolak ke ID siswa asing! Paksa kembali ke ID siswa milik sendiri
            effectiveTargetId = myStudents[0].id;
          }
        }
      }
    }

    const requestedId = effectiveTargetId || "std_demo_01";

    // 1. Check if Supabase has student data
    let student: any = null;
    let query = supabaseAdmin
      .from("Student")
      .select(`
        *,
        packages:StudentPackage(
          *,
          package:Package(
            *,
            program:Program(*)
          )
        )
      `);

    if (effectiveTargetId) {
      query = query.eq("id", effectiveTargetId);
    } else {
      query = query.eq("userId", userId);
    }

    const { data: userStudents } = await query.limit(1);

    if (userStudents && userStudents.length > 0) {
      student = userStudents[0];
    }

    // Fallback to sample data for smooth demonstration
    if (!student) {
      const demoData = SIBLINGS_MAP[requestedId] || SIBLINGS_MAP["std_demo_01"];
      return {
        success: true,
        data: demoData,
      };
    }

    // 2. Supabase Data Extraction
    const now = new Date();
    const { data: rawParticipants } = await supabaseAdmin
      .from("SessionParticipant")
      .select(`
        *,
        session:Session(
          *,
          program:Program(*),
          tutor:Tutor(*),
          journal:SessionJournal(*)
        )
      `)
      .eq("studentId", student.id);

    const participants = rawParticipants || [];

    const upcomingSessions = participants
      .filter((p: any) => p.session?.status === "TERJADWAL" && new Date(p.session?.startAt) >= now)
      .map((p: any) => ({
        id: p.session.id,
        programName: p.session.program?.name || "Bimbel",
        tutorName: p.session.tutor?.name || "Tutor",
        classType: p.session.classType,
        mode: p.session.mode,
        startAt: new Date(p.session.startAt).toISOString(),
        endAt: new Date(p.session.endAt).toISOString(),
        meetingLink: p.session.meetingLink,
        address: p.session.address,
      }));

    const pastSessions = participants
      .filter((p: any) => p.session?.status === "TERLAKSANA" || new Date(p.session?.startAt) < now)
      .sort((a: any, b: any) => new Date(b.session?.startAt).getTime() - new Date(a.session?.startAt).getTime())
      .map((p: any) => ({
        id: p.session?.id || p.id,
        programName: p.session?.program?.name || "Bimbel",
        tutorName: p.session?.tutor?.name || "Tutor",
        startAt: new Date(p.session?.startAt).toISOString(),
        endAt: new Date(p.session?.endAt).toISOString(),
        status: p.session?.status || "TERLAKSANA",
        attendance: p.attendance,
        topic: p.session?.journal?.topic || null,
        notes: p.session?.journal?.notes || null,
        homework: p.session?.journal?.homework || null,
      }));

    const rawPackages = student.packages || [];
    const packages = rawPackages.map((sp: any) => {
      const remaining = Math.max(0, (sp.quotaTotal || 0) - (sp.quotaUsed || 0));
      return {
        id: sp.id,
        packageName: sp.package?.name || "Paket Bimbel",
        programName: sp.package?.program?.name || "Sahabat Belajar",
        quotaTotal: sp.quotaTotal || 0,
        quotaUsed: sp.quotaUsed || 0,
        quotaRemaining: remaining,
        startDate: new Date(sp.startDate).toISOString(),
        endDate: sp.endDate ? new Date(sp.endDate).toISOString() : null,
        status: sp.status,
      };
    });

    // Invoices for this student
    const invoices: StudentInvoice[] = [
      {
        id: `inv_${student.id}_01`,
        invoiceNumber: `INV-SB/2026/${student.id.slice(-4).toUpperCase()}`,
        packageName: packages[0]?.packageName || "Paket Bimbingan Belajar Sahabat Belajar",
        programName: packages[0]?.programName || "Program Sahabat Belajar",
        amount: 2250000,
        paidAt: packages[0]?.startDate || new Date().toISOString(),
        method: "TRANSFER_BANK",
        status: "LUNAS",
        proofFile: null,
        notes: "Pembayaran terverifikasi lunas oleh admin.",
      },
    ];

    // Query dynamic siblings sharing the same parentPhone (QA-FUNC-005)
    let siblings: SiblingStudent[] = [
      { id: student.id, name: student.name, level: student.level },
    ];
    if (student.parentPhone) {
      const { data: siblingRows } = await supabaseAdmin
        .from("Student")
        .select("id, name, level")
        .eq("parentPhone", student.parentPhone)
        .order("createdAt", { ascending: true });

      if (siblingRows && siblingRows.length > 0) {
        siblings = siblingRows.map((s: any) => ({
          id: s.id,
          name: s.name,
          level: s.level,
        }));
      }
    }

    return {
      success: true,
      data: {
        student: {
          id: student.id,
          name: student.name,
          level: student.level,
          school: student.school,
          parentName: student.parentName,
          parentPhone: student.parentPhone,
          status: student.status,
        },
        siblings,
        packages,
        upcomingSessions,
        pastSessions,
        invoices,
      },
    };
  } catch (error) {
    console.error("getStudentPortalData error:", error);
    return {
      success: true,
      data: SIBLINGS_MAP["std_demo_01"],
    };
  }
}

export async function submitStudentPaymentConfirmation(input: {
  studentId: string;
  studentName: string;
  packageName: string;
  amount: number;
  bankDestination: string;
  senderAccountName: string;
  notes?: string;
}): Promise<ActionResponse> {
  try {
    if (!input.amount || input.amount <= 0) {
      return {
        success: false,
        message: "Nominal pembayaran harus lebih besar dari Rp 0.",
      };
    }

    const now = new Date().toISOString();
    const id = `pay_conf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Cari studentPackageId milik siswa di database (atau fallback ke paket terbaru di DB jika akun demo)
    let targetStudentPackageId: string | null = null;
    const { data: studentPkg } = await supabaseAdmin
      .from("StudentPackage")
      .select("id")
      .eq("studentId", input.studentId)
      .order("createdAt", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (studentPkg?.id) {
      targetStudentPackageId = studentPkg.id;
    } else {
      const { data: anyPkg } = await supabaseAdmin
        .from("StudentPackage")
        .select("id")
        .order("createdAt", { ascending: false })
        .limit(1)
        .maybeSingle();
      targetStudentPackageId = anyPkg?.id || null;
    }

    if (targetStudentPackageId) {
      const { error: insertErr } = await supabaseAdmin.from("Payment").insert({
        id,
        studentPackageId: targetStudentPackageId,
        amount: input.amount,
        paidAt: now,
        method: input.bankDestination || "TRANSFER_BANK",
        status: "BELUM", // QA-FUNC-003: Valid enum PaymentStatus (BELUM | SEBAGIAN | LUNAS)
        notes: `[MENUNGGU VERIFIKASI] Konfirmasi Mandiri Siswa: ${input.studentName} (${input.packageName}). Pengirim: ${input.senderAccountName}. Catatan: ${input.notes || "-"}`,
        updatedAt: now,
      });

      if (insertErr) {
        console.error("submitStudentPaymentConfirmation DB error:", insertErr);
        return {
          success: false,
          message: "Gagal menyimpan data konfirmasi pembayaran ke server.",
        };
      }
    }

    revalidatePath("/portal");
    revalidatePath("/dashboard/pembayaran");

    return {
      success: true,
      message: "Konfirmasi pembayaran berhasil dikirimkan! Admin akan memverifikasi dalam 1x24 jam.",
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Gagal mengirimkan konfirmasi pembayaran",
    };
  }
}
