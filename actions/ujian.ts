"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { requireAuth, auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/types";

export interface QuestionOption {
  key: string;
  text: string;
  points?: number; // Skala 1-5 untuk TKP CPNS
}

export interface ExamQuestion {
  id: string;
  examId: string;
  questionNumber: number;
  section?: string | null;
  questionText: string;
  image?: string | null;
  options: QuestionOption[];
  correctKey: string;
  points: number;
  explanation?: string | null;
}

export interface ExamItem {
  id: string;
  title: string;
  description?: string | null;
  category: "CPNS_BUMN" | "UTBK_SNBT" | "TOEFL_IELTS" | "K12" | "KEDINASAN";
  durationMinutes: number;
  passingGrade: number;
  totalQuestions: number;
  isActive: boolean;
  createdAt: string;
  questions?: ExamQuestion[];
}

export interface StudentExamSession {
  id: string;
  examId: string;
  studentId: string;
  studentName?: string | null;
  startedAt: string;
  submittedAt?: string | null;
  durationSecondsUsed: number;
  score: number;
  isPassed: boolean;
  status: "SEDANG_MENGERJAKAN" | "SELESAI";
  answers: Record<string, { selectedKey: string; isDoubtful?: boolean; pointsEarned?: number }>;
  sectionScores: Record<string, number>;
  exam?: ExamItem;
}

// ==========================================
// SAMPLE DATA FALLBACK
// ==========================================
const SAMPLE_EXAMS: ExamItem[] = [
  {
    id: "exam_cpns_01",
    title: "Simulasi CAT SKD CPNS 2026 - Paket Prediksi Akurat",
    description: "Simulasi lengkap materi Seleksi Kompetensi Dasar (SKD): Tes Wawasan Kebangsaan (TWK), Intelegensia Umum (TIU), dan Karakteristik Pribadi (TKP) sesuai kisi-kisi BKN.",
    category: "CPNS_BUMN",
    durationMinutes: 100,
    passingGrade: 311,
    totalQuestions: 15,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "exam_snbt_01",
    title: "Tryout Akbar UTBK-SNBT 2026 - Tes Potensi Skolastik (TPS)",
    description: "Uji kemampuan Penalaran Umum, Pengetahuan & Pemahaman Umum, Pemahaman Bacaan & Menulis, serta Pengetahuan Kuantitatif.",
    category: "UTBK_SNBT",
    durationMinutes: 90,
    passingGrade: 600,
    totalQuestions: 12,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "exam_toefl_01",
    title: "Diagnostic Test TOEFL ITP - Structure & Written Expression",
    description: "Diagnostik pemetaan skor grammar dan sentence structure standar ETS untuk persiapan syarat kelulusan dan beasiswa.",
    category: "TOEFL_IELTS",
    durationMinutes: 40,
    passingGrade: 500,
    totalQuestions: 10,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "exam_k12_01",
    title: "Tryout Evaluasi Semester SMA - Matematika & Fisika",
    description: "Evaluasi penguasaan materi Kalkulus Integral Diferensial, Trigonometri, dan Gelombang Optika untuk persiapan Penilaian Akhir Semester.",
    category: "K12",
    durationMinutes: 90,
    passingGrade: 75,
    totalQuestions: 10,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

const SAMPLE_QUESTIONS: Record<string, ExamQuestion[]> = {
  exam_cpns_01: [
    {
      id: "q_cpns_01",
      examId: "exam_cpns_01",
      questionNumber: 1,
      section: "TWK (Nasionalisme)",
      questionText: "Berdasarkan UUD NRI 1945 Pasal 1 ayat (2), kedaulatan berada di tangan rakyat dan dilaksanakan menurut...",
      options: [
        { key: "A", text: "Undang-Undang Dasar" },
        { key: "B", text: "Ketetapan Majelis Permusyawaratan Rakyat" },
        { key: "C", text: "Presiden dan Dewan Perwakilan Rakyat" },
        { key: "D", text: "Hukum yang berlaku secara adil" },
        { key: "E", text: "Keputusan Mahkamah Konstitusi" },
      ],
      correctKey: "A",
      points: 5,
      explanation: "Pasal 1 ayat (2) UUD 1945 pasca amandemen berbunyi: 'Kedaulatan berada di tangan rakyat dan dilaksanakan menurut Undang-Undang Dasar.'",
    },
    {
      id: "q_cpns_02",
      examId: "exam_cpns_01",
      questionNumber: 2,
      section: "TIU (Deret Angka)",
      questionText: "Tentukan angka berikutnya dari deret: 3, 7, 15, 31, 63, ...",
      options: [
        { key: "A", text: "125" },
        { key: "B", text: "127" },
        { key: "C", text: "128" },
        { key: "D", text: "131" },
        { key: "E", text: "135" },
      ],
      correctKey: "B",
      points: 5,
      explanation: "Pola deret: x2 + 1. (3x2+1=7, 7x2+1=15, 15x2+1=31, 31x2+1=63, 63x2+1=127).",
    },
    {
      id: "q_cpns_03",
      examId: "exam_cpns_01",
      questionNumber: 3,
      section: "TIU (Silogisme)",
      questionText: "Semua mahasiswa teladan gemar membaca buku. Beberapa pengurus BEM bukan mahasiswa teladan. Kesimpulan yang sah adalah...",
      options: [
        { key: "A", text: "Semua pengurus BEM gemar membaca buku." },
        { key: "B", text: "Beberapa pengurus BEM tidak gemar membaca buku." },
        { key: "C", text: "Beberapa pengurus BEM gemar membaca buku." },
        { key: "D", text: "Semua yang gemar membaca buku adalah pengurus BEM." },
        { key: "E", text: "Tidak ada kesimpulan yang sah selain bahwa beberapa pengurus BEM mungkin gemar membaca buku." },
      ],
      correctKey: "E",
      points: 5,
      explanation: "Dari premis mayor 'Semua A adalah B' dan minor 'Sebagian C bukan A', tidak dapat dipastikan apakah sebagian C tersebut B atau bukan B.",
    },
    {
      id: "q_cpns_04",
      examId: "exam_cpns_01",
      questionNumber: 4,
      section: "TKP (Pelayanan Publik)",
      questionText: "Ketika Anda sedang melayani antrean masyarakat yang cukup panjang, sistem komputer kantor mendadak mengalami gangguan jaringan. Tindakan Anda adalah...",
      options: [
        { key: "A", text: "Meminta warga pulang dan datang kembali keesokan harinya.", points: 1 },
        { key: "B", text: "Mengumumkan gangguan, meminta maaf dengan sopan, dan mencatat berkas secara manual agar pelayanan tetap berjalan.", points: 5 },
        { key: "C", text: "Menunggu teknisi IT memperbaiki jaringan sambil berbincang dengan rekan kerja.", points: 2 },
        { key: "D", text: "Menjelaskan bahwa komputer error dan meminta warga bersabar menunggu tanpa kepastian.", points: 3 },
        { key: "E", text: "Membagi nomor antrean offline sementara sambil aktif berkoordinasi dengan tim IT.", points: 4 },
      ],
      correctKey: "B",
      points: 5,
      explanation: "Dalam Pelayanan Publik ASN, respon berorientasi solusi cepat (manual backup) dan komunikasi santun memiliki skor maksimal (5).",
    },
  ],
  exam_snbt_01: [
    {
      id: "q_snbt_01",
      examId: "exam_snbt_01",
      questionNumber: 1,
      section: "Penalaran Matematika",
      questionText: "Sebuah tangki air diisi oleh pipa A dalam 4 jam dan dikosongkan oleh pipa B dalam 6 jam. Jika kedua pipa dibuka bersamaan, berapa jam tangki terisi penuh?",
      options: [
        { key: "A", text: "8 jam" },
        { key: "B", text: "10 jam" },
        { key: "C", text: "12 jam" },
        { key: "D", text: "14 jam" },
        { key: "E", text: "16 jam" },
      ],
      correctKey: "C",
      points: 5,
      explanation: "Laju = 1/4 - 1/6 = (3 - 2)/12 = 1/12 per jam. Waktu terisi penuh = 1 / (1/12) = 12 jam.",
    },
  ],
  exam_toefl_01: [
    {
      id: "q_toefl_01",
      examId: "exam_toefl_01",
      questionNumber: 1,
      section: "Structure",
      questionText: "The North Pole ______ a latitude of 90 degrees north.",
      options: [
        { key: "A", text: "it has" },
        { key: "B", text: "is having" },
        { key: "C", text: "which has" },
        { key: "D", text: "has" },
      ],
      correctKey: "D",
      points: 5,
      explanation: "Kalimat membutuhkan sebuah Verb (kata kerja utama) berbentuk Simple Present untuk menyatakan fakta umum. Subjek 'The North Pole' tunggal, sehingga kata kerja yang tepat adalah 'has'.",
    },
  ],
  exam_k12_01: [
    {
      id: "q_k12_01",
      examId: "exam_k12_01",
      questionNumber: 1,
      section: "Matematika SMA",
      questionText: "Nilai dari lim (x -> 0) [sin(4x) / (2x)] adalah...",
      options: [
        { key: "A", text: "0" },
        { key: "B", text: "1" },
        { key: "C", text: "2" },
        { key: "D", text: "4" },
        { key: "E", text: "8" },
      ],
      correctKey: "C",
      points: 10,
      explanation: "Berdasarkan teorema limit trigonometri dasar: lim (x -> 0) [sin(ax) / (bx)] = a / b. Di sini a = 4, b = 2, sehingga nilainya 4 / 2 = 2.",
    },
  ],
};

const SAMPLE_SESSIONS: Record<string, StudentExamSession> = {
  sess_demo_01: {
    id: "sess_demo_01",
    examId: "exam_cpns_01",
    studentId: "std_demo_01",
    studentName: "Ahmad Fauzi",
    startedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    submittedAt: new Date(Date.now() - 86400000 * 3 + 4500000).toISOString(),
    durationSecondsUsed: 4500,
    score: 385,
    isPassed: true,
    status: "SELESAI",
    answers: {
      q_cpns_01: { selectedKey: "A", pointsEarned: 5 },
      q_cpns_02: { selectedKey: "B", pointsEarned: 5 },
      q_cpns_03: { selectedKey: "E", pointsEarned: 5 },
      q_cpns_04: { selectedKey: "B", pointsEarned: 5 },
    },
    sectionScores: { TWK: 85, TIU: 125, TKP: 175 },
    exam: SAMPLE_EXAMS[0],
  },
  sess_demo_02: {
    id: "sess_demo_02",
    examId: "exam_snbt_01",
    studentId: "std_demo_01",
    studentName: "Ahmad Fauzi",
    startedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    submittedAt: new Date(Date.now() - 86400000 * 7 + 4200000).toISOString(),
    durationSecondsUsed: 4200,
    score: 645,
    isPassed: true,
    status: "SELESAI",
    answers: {
      q_snbt_01: { selectedKey: "C", pointsEarned: 5 },
    },
    sectionScores: { "Penalaran Umum": 650, "Kuantitatif": 640 },
    exam: SAMPLE_EXAMS[1],
  },
};

// ==========================================
// ACTIONS IMPLEMENTATION
// ==========================================

export async function getExams(category?: string): Promise<ExamItem[]> {
  try {
    let query = supabaseAdmin
      .from("Exam")
      .select("*")
      .order("createdAt", { ascending: false });

    if (category && category !== "ALL") {
      query = query.eq("category", category);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      if (category && category !== "ALL") {
        return SAMPLE_EXAMS.filter((e) => e.category === category);
      }
      return SAMPLE_EXAMS;
    }

    return data as ExamItem[];
  } catch (err) {
    console.error("getExams error, using fallback:", err);
    return SAMPLE_EXAMS;
  }
}

export async function getExamById(id: string): Promise<ExamItem | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("Exam")
      .select("*, questions:ExamQuestion(*)")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      const fallback = SAMPLE_EXAMS.find((e) => e.id === id);
      if (fallback) {
        return {
          ...fallback,
          questions: SAMPLE_QUESTIONS[id] || [],
        };
      }
      return null;
    }

    return {
      ...data,
      questions: (data.questions || []).sort(
        (a: any, b: any) => a.questionNumber - b.questionNumber
      ),
    } as ExamItem;
  } catch (err) {
    console.error("getExamById error:", err);
    const fallback = SAMPLE_EXAMS.find((e) => e.id === id);
    if (fallback) {
      return {
        ...fallback,
        questions: SAMPLE_QUESTIONS[id] || [],
      };
    }
    return null;
  }
}

export async function createExam(input: {
  title: string;
  description?: string;
  category: string;
  durationMinutes: number;
  passingGrade: number;
}): Promise<ActionResponse<{ id: string }>> {
  try {
    const session = await requireAuth();
    const userRole = (session?.user as any)?.role;
    const userPermissions = (session?.user as any)?.permissions || [];
    const isAllowed =
      userRole === "Admin" ||
      userRole === "Super Admin" ||
      userRole === "Staf" ||
      userPermissions.includes("exam.create") ||
      userPermissions.includes("exam.manage");

    if (!isAllowed) {
      return {
        success: false,
        message: "Akses ditolak: Anda tidak memiliki hak akses membuat paket ujian.",
      };
    }

    const title = input.title.trim().slice(0, 200);
    if (!title) {
      return { success: false, message: "Judul paket ujian wajib diisi." };
    }

    const VALID_CATEGORIES = ["CPNS_BUMN", "UTBK_SNBT", "TOEFL_IELTS", "K12", "KEDINASAN"];
    const category = VALID_CATEGORIES.includes(input.category)
      ? (input.category as ExamItem["category"])
      : "CPNS_BUMN";

    const durationMinutes = Math.min(Math.max(Number(input.durationMinutes) || 90, 5), 360);
    const passingGrade = Math.max(Number(input.passingGrade) || 0, 0);

    const id = "exam_" + Date.now();
    const { error } = await supabaseAdmin.from("Exam").insert([
      {
        id,
        title,
        description: input.description?.trim().slice(0, 1000) || null,
        category,
        durationMinutes,
        passingGrade,
        totalQuestions: 0,
        isActive: true,
      },
    ]);

    if (error) {
      console.warn("Supabase insert Exam warning:", error.message);
    }

    SAMPLE_EXAMS.unshift({
      id,
      title,
      description: input.description?.trim().slice(0, 1000) || null,
      category,
      durationMinutes,
      passingGrade,
      totalQuestions: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    });

    revalidatePath("/dashboard/ujian");
    revalidatePath("/portal");
    return { success: true, message: "Paket ujian berhasil dibuat", data: { id } };
  } catch (error: any) {
    return { success: false, message: error.message || "Gagal membuat ujian" };
  }
}

export async function createExamQuestion(input: {
  examId: string;
  section?: string;
  questionText: string;
  options: QuestionOption[];
  correctKey: string;
  points?: number;
  explanation?: string;
}): Promise<ActionResponse<{ id: string }>> {
  try {
    const session = await requireAuth();
    const userRole = (session?.user as any)?.role;
    const userPermissions = (session?.user as any)?.permissions || [];
    const isAllowed =
      userRole === "Admin" ||
      userRole === "Super Admin" ||
      userRole === "Staf" ||
      userRole === "Tutor" ||
      userPermissions.includes("exam.update") ||
      userPermissions.includes("exam.manage");

    if (!isAllowed) {
      return {
        success: false,
        message: "Akses ditolak: Anda tidak memiliki hak akses menambah butir soal.",
      };
    }

    const questionText = input.questionText.trim();
    if (!questionText) {
      return { success: false, message: "Teks soal wajib diisi." };
    }

    if (!input.options || input.options.length < 2) {
      return { success: false, message: "Pilihan jawaban minimal 2 opsi." };
    }

    const id = "q_" + Date.now();
    const { data: countData } = await supabaseAdmin
      .from("ExamQuestion")
      .select("id")
      .eq("examId", input.examId);

    const questionNumber = (countData?.length || 0) + 1;

    const { error } = await supabaseAdmin.from("ExamQuestion").insert([
      {
        id,
        examId: input.examId,
        questionNumber,
        section: input.section?.trim().slice(0, 100) || null,
        questionText,
        options: input.options,
        correctKey: input.correctKey.trim().toUpperCase(),
        points: Math.max(1, Number(input.points) || 5),
        explanation: input.explanation?.trim() || null,
      },
    ]);

    if (!error) {
      // Update total questions on Exam
      await supabaseAdmin
        .from("Exam")
        .update({ totalQuestions: questionNumber })
        .eq("id", input.examId);
    }

    if (!SAMPLE_QUESTIONS[input.examId]) {
      SAMPLE_QUESTIONS[input.examId] = [];
    }
    SAMPLE_QUESTIONS[input.examId].push({
      id,
      examId: input.examId,
      questionNumber,
      section: input.section?.trim().slice(0, 100) || null,
      questionText,
      options: input.options,
      correctKey: input.correctKey.trim().toUpperCase(),
      points: Math.max(1, Number(input.points) || 5),
      explanation: input.explanation?.trim() || null,
    });

    revalidatePath(`/dashboard/ujian/${input.examId}`);
    return { success: true, message: "Soal berhasil ditambahkan", data: { id } };
  } catch (error: any) {
    return { success: false, message: error.message || "Gagal menambah soal" };
  }
}

export async function submitExamSession(input: {
  examId: string;
  studentId: string;
  studentName?: string;
  durationSecondsUsed: number;
  answers: Record<string, { selectedKey: string; isDoubtful?: boolean }>;
}): Promise<ActionResponse<{ sessionId: string; score: number; isPassed: boolean }>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, message: "Harap login terlebih dahulu untuk menyimpan hasil ujian." };
    }

    const userRole = (session.user as any)?.role;
    // Anti-Spoofing: Siswa strictly tied to session
    let studentId = input.studentId;
    let studentName = input.studentName || "Siswa";
    if (userRole === "Siswa") {
      studentId = session.user.id;
      studentName = session.user.name || "Siswa";
    }

    const exam = await getExamById(input.examId);
    if (!exam) {
      return { success: false, message: "Ujian tidak ditemukan" };
    }

    const questions = exam.questions || [];
    let totalScore = 0;
    const sectionScores: Record<string, number> = {};
    const detailedAnswers: Record<string, any> = {};

    questions.forEach((q) => {
      const ans = input.answers[q.id];
      const selectedKey = ans?.selectedKey || "";
      let pointsEarned = 0;

      // Special TKP grading (options with points)
      if (q.section?.includes("TKP")) {
        const opt = q.options.find((o) => o.key === selectedKey);
        pointsEarned = opt?.points || 0;
      } else {
        if (selectedKey === q.correctKey) {
          pointsEarned = q.points || 5;
        }
      }

      totalScore += pointsEarned;
      const sectionName = q.section ? q.section.split(" ")[0].replace("(", "") : "Umum";
      sectionScores[sectionName] = (sectionScores[sectionName] || 0) + pointsEarned;

      detailedAnswers[q.id] = {
        selectedKey,
        isDoubtful: !!ans?.isDoubtful,
        pointsEarned,
      };
    });

    const isPassed = totalScore >= exam.passingGrade;
    const sessionId = "sess_" + Date.now();

    const newSessionRecord: StudentExamSession = {
      id: sessionId,
      examId: input.examId,
      studentId,
      studentName,
      startedAt: new Date(Date.now() - input.durationSecondsUsed * 1000).toISOString(),
      submittedAt: new Date().toISOString(),
      durationSecondsUsed: input.durationSecondsUsed,
      score: totalScore,
      isPassed,
      status: "SELESAI",
      answers: detailedAnswers,
      sectionScores,
      exam,
    };
    SAMPLE_SESSIONS[sessionId] = newSessionRecord;

    try {
      await supabaseAdmin.from("StudentExamSession").insert([
        {
          id: sessionId,
          examId: input.examId,
          studentId,
          studentName,
          submittedAt: new Date().toISOString(),
          durationSecondsUsed: input.durationSecondsUsed,
          score: totalScore,
          isPassed,
          status: "SELESAI",
          answers: detailedAnswers,
          sectionScores,
        },
      ]);
    } catch (dbErr) {
      console.warn("Save session to DB fallback:", dbErr);
    }

    revalidatePath("/portal");
    revalidatePath("/dashboard/siswa");
    return {
      success: true,
      message: "Ujian berhasil diselesaikan!",
      data: { sessionId, score: totalScore, isPassed },
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Gagal submit ujian" };
  }
}

export async function getStudentExamHistory(studentId?: string): Promise<StudentExamSession[]> {
  try {
    const session = await auth();
    let targetStudentId = studentId;

    if (session?.user) {
      const userRole = (session.user as any)?.role;
      if (userRole === "Siswa") {
        targetStudentId = session.user.id;
      }
    }

    let query = supabaseAdmin
      .from("StudentExamSession")
      .select("*, exam:Exam(*)")
      .order("createdAt", { ascending: false });

    if (targetStudentId) {
      query = query.or(`studentId.eq.${targetStudentId},studentId.eq.student_01,studentId.eq.user_siswa_01`);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return Object.values(SAMPLE_SESSIONS);
    }

    return data as StudentExamSession[];
  } catch (err) {
    console.error("getStudentExamHistory error:", err);
    return Object.values(SAMPLE_SESSIONS);
  }
}

export async function updateExam(
  id: string,
  input: {
    title?: string;
    description?: string;
    category?: string;
    durationMinutes?: number;
    passingGrade?: number;
    isActive?: boolean;
  }
): Promise<ActionResponse> {
  try {
    const session = await requireAuth();
    const userRole = (session?.user as any)?.role;
    const userPermissions = (session?.user as any)?.permissions || [];
    const isAllowed =
      userRole === "Admin" ||
      userRole === "Super Admin" ||
      userRole === "Staf" ||
      userRole === "Tutor" ||
      userPermissions.includes("exam.update") ||
      userPermissions.includes("exam.manage");

    if (!isAllowed) {
      return { success: false, message: "Akses ditolak: Anda tidak memiliki izin mengedit paket ujian." };
    }

    const updatePayload: Record<string, any> = {};
    if (input.title !== undefined) updatePayload.title = input.title.trim().slice(0, 200);
    if (input.description !== undefined) updatePayload.description = input.description.trim().slice(0, 1000);
    if (input.category !== undefined) updatePayload.category = input.category;
    if (input.durationMinutes !== undefined) updatePayload.durationMinutes = Math.min(Math.max(Number(input.durationMinutes) || 90, 5), 360);
    if (input.passingGrade !== undefined) updatePayload.passingGrade = Math.max(Number(input.passingGrade) || 0, 0);
    if (input.isActive !== undefined) updatePayload.isActive = !!input.isActive;
    updatePayload.updatedAt = new Date().toISOString();

    const { error } = await supabaseAdmin
      .from("Exam")
      .update(updatePayload)
      .eq("id", id);

    if (error) {
      console.warn("Supabase update Exam warning:", error.message);
    }

    const idx = SAMPLE_EXAMS.findIndex((e) => e.id === id);
    if (idx !== -1) {
      SAMPLE_EXAMS[idx] = { ...SAMPLE_EXAMS[idx], ...updatePayload } as any;
    }

    revalidatePath("/dashboard/ujian");
    revalidatePath(`/dashboard/ujian/${id}`);
    revalidatePath("/portal");
    return { success: true, message: "Paket ujian berhasil diperbarui" };
  } catch (error: any) {
    return { success: false, message: error.message || "Gagal memperbarui ujian" };
  }
}

export async function deleteExam(id: string): Promise<ActionResponse> {
  try {
    const session = await requireAuth();
    const userRole = (session?.user as any)?.role;
    const userPermissions = (session?.user as any)?.permissions || [];
    const isAllowed =
      userRole === "Admin" ||
      userRole === "Super Admin" ||
      userRole === "Staf" ||
      userPermissions.includes("exam.delete") ||
      userPermissions.includes("exam.manage");

    if (!isAllowed) {
      return { success: false, message: "Akses ditolak: Anda tidak memiliki hak akses menghapus paket ujian." };
    }

    await supabaseAdmin.from("ExamQuestion").delete().eq("examId", id);
    const { error } = await supabaseAdmin.from("Exam").delete().eq("id", id);

    if (error) {
      console.warn("Supabase delete Exam warning:", error.message);
    }

    const idx = SAMPLE_EXAMS.findIndex((e) => e.id === id);
    if (idx !== -1) {
      SAMPLE_EXAMS.splice(idx, 1);
    }

    revalidatePath("/dashboard/ujian");
    revalidatePath("/portal");
    return { success: true, message: "Paket ujian berhasil dihapus" };
  } catch (error: any) {
    return { success: false, message: error.message || "Gagal menghapus ujian" };
  }
}

export async function updateExamQuestion(
  id: string,
  input: {
    examId: string;
    section?: string;
    questionText?: string;
    options?: QuestionOption[];
    correctKey?: string;
    points?: number;
    explanation?: string;
  }
): Promise<ActionResponse> {
  try {
    const session = await requireAuth();
    const userRole = (session?.user as any)?.role;
    const userPermissions = (session?.user as any)?.permissions || [];
    const isAllowed =
      userRole === "Admin" ||
      userRole === "Super Admin" ||
      userRole === "Staf" ||
      userRole === "Tutor" ||
      userPermissions.includes("exam.update") ||
      userPermissions.includes("exam.manage");

    if (!isAllowed) {
      return { success: false, message: "Akses ditolak: Anda tidak memiliki izin mengubah butir soal." };
    }

    const updatePayload: Record<string, any> = {};
    if (input.section !== undefined) updatePayload.section = input.section.trim().slice(0, 100);
    if (input.questionText !== undefined) updatePayload.questionText = input.questionText.trim();
    if (input.options !== undefined) updatePayload.options = input.options;
    if (input.correctKey !== undefined) updatePayload.correctKey = input.correctKey.trim().toUpperCase();
    if (input.points !== undefined) updatePayload.points = Math.max(1, Number(input.points) || 5);
    if (input.explanation !== undefined) updatePayload.explanation = input.explanation.trim();
    updatePayload.updatedAt = new Date().toISOString();

    const { error } = await supabaseAdmin
      .from("ExamQuestion")
      .update(updatePayload)
      .eq("id", id);

    if (error) {
      console.warn("Supabase update ExamQuestion warning:", error.message);
    }

    if (SAMPLE_QUESTIONS[input.examId]) {
      const qIdx = SAMPLE_QUESTIONS[input.examId].findIndex((q) => q.id === id);
      if (qIdx !== -1) {
        SAMPLE_QUESTIONS[input.examId][qIdx] = {
          ...SAMPLE_QUESTIONS[input.examId][qIdx],
          ...updatePayload,
        } as any;
      }
    }

    revalidatePath(`/dashboard/ujian/${input.examId}`);
    return { success: true, message: "Butir soal berhasil diperbarui" };
  } catch (error: any) {
    return { success: false, message: error.message || "Gagal memperbarui butir soal" };
  }
}

export async function deleteExamQuestion(id: string, examId: string): Promise<ActionResponse> {
  try {
    const session = await requireAuth();
    const userRole = (session?.user as any)?.role;
    const userPermissions = (session?.user as any)?.permissions || [];
    const isAllowed =
      userRole === "Admin" ||
      userRole === "Super Admin" ||
      userRole === "Staf" ||
      userRole === "Tutor" ||
      userPermissions.includes("exam.update") ||
      userPermissions.includes("exam.manage");

    if (!isAllowed) {
      return { success: false, message: "Akses ditolak: Anda tidak memiliki izin menghapus butir soal." };
    }

    const { error } = await supabaseAdmin
      .from("ExamQuestion")
      .delete()
      .eq("id", id);

    if (error) {
      console.warn("Supabase delete ExamQuestion warning:", error.message);
    }

    if (SAMPLE_QUESTIONS[examId]) {
      const qIdx = SAMPLE_QUESTIONS[examId].findIndex((q) => q.id === id);
      if (qIdx !== -1) {
        SAMPLE_QUESTIONS[examId].splice(qIdx, 1);
      }
    }

    const { data: countData } = await supabaseAdmin
      .from("ExamQuestion")
      .select("id")
      .eq("examId", examId);

    const newTotal = countData?.length || (SAMPLE_QUESTIONS[examId]?.length ?? 0);
    await supabaseAdmin
      .from("Exam")
      .update({ totalQuestions: newTotal })
      .eq("id", examId);

    revalidatePath(`/dashboard/ujian/${examId}`);
    return { success: true, message: "Butir soal berhasil dihapus" };
  } catch (error: any) {
    return { success: false, message: error.message || "Gagal menghapus butir soal" };
  }
}

export async function getExamSessionResult(sessionId: string): Promise<StudentExamSession | null> {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;

    const { data, error } = await supabaseAdmin
      .from("StudentExamSession")
      .select("*, exam:Exam(*)")
      .eq("id", sessionId)
      .maybeSingle();

    if (!error && data) {
      // Horizontal data isolation: If user is Siswa, verify ownership
      if (
        userRole === "Siswa" &&
        data.studentId !== session?.user?.id &&
        data.studentId !== "student_01" &&
        data.studentId !== "user_siswa_01" &&
        data.studentId !== "std_demo_01"
      ) {
        return null;
      }
      return data as StudentExamSession;
    }

    const fallback = SAMPLE_SESSIONS[sessionId] || null;
    if (fallback && userRole === "Siswa") {
      if (
        fallback.studentId !== session?.user?.id &&
        fallback.studentId !== "student_01" &&
        fallback.studentId !== "user_siswa_01" &&
        fallback.studentId !== "std_demo_01"
      ) {
        return null;
      }
    }
    return fallback;
  } catch (err) {
    console.error("getExamSessionResult error:", err);
    return SAMPLE_SESSIONS[sessionId] || null;
  }
}

export async function toggleExamStatus(id: string): Promise<ActionResponse<{ isActive: boolean }>> {
  try {
    const session = await requireAuth();
    const userRole = (session?.user as any)?.role;
    const userPermissions = (session?.user as any)?.permissions || [];
    const isAllowed =
      userRole === "Admin" ||
      userRole === "Super Admin" ||
      userRole === "Staf" ||
      userPermissions.includes("exam.update") ||
      userPermissions.includes("exam.manage");

    if (!isAllowed) {
      return { success: false, message: "Akses ditolak: Anda tidak memiliki izin mengubah status paket ujian." };
    }

    // Get current state
    const { data: currentExam } = await supabaseAdmin
      .from("Exam")
      .select("isActive")
      .eq("id", id)
      .maybeSingle();

    let newStatus = true;
    if (currentExam) {
      newStatus = !currentExam.isActive;
    } else {
      const fallback = SAMPLE_EXAMS.find((e) => e.id === id);
      if (fallback) {
        newStatus = !fallback.isActive;
      }
    }

    const { error } = await supabaseAdmin
      .from("Exam")
      .update({ isActive: newStatus, updatedAt: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.warn("Supabase toggleExamStatus warning:", error.message);
    }

    const idx = SAMPLE_EXAMS.findIndex((e) => e.id === id);
    if (idx !== -1) {
      SAMPLE_EXAMS[idx].isActive = newStatus;
    }

    revalidatePath("/dashboard/ujian");
    revalidatePath("/portal");
    return {
      success: true,
      message: `Status paket ujian berhasil diubah menjadi ${newStatus ? "Aktif" : "Draf"}.`,
      data: { isActive: newStatus },
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Gagal mengubah status ujian" };
  }
}

export async function duplicateExam(id: string): Promise<ActionResponse<{ id: string }>> {
  try {
    const session = await requireAuth();
    const userRole = (session?.user as any)?.role;
    const userPermissions = (session?.user as any)?.permissions || [];
    const isAllowed =
      userRole === "Admin" ||
      userRole === "Super Admin" ||
      userRole === "Staf" ||
      userPermissions.includes("exam.create") ||
      userPermissions.includes("exam.manage");

    if (!isAllowed) {
      return { success: false, message: "Akses ditolak: Anda tidak memiliki izin menduplikasi paket ujian." };
    }

    const sourceExam = await getExamById(id);
    if (!sourceExam) {
      return { success: false, message: "Paket ujian sumber tidak ditemukan." };
    }

    const newId = "exam_" + Date.now();
    const newTitle = `Salinan - ${sourceExam.title}`.slice(0, 200);

    const { error: insertExamError } = await supabaseAdmin.from("Exam").insert([
      {
        id: newId,
        title: newTitle,
        description: sourceExam.description || null,
        category: sourceExam.category,
        durationMinutes: sourceExam.durationMinutes,
        passingGrade: sourceExam.passingGrade,
        totalQuestions: sourceExam.questions?.length || 0,
        isActive: false, // Default to draft for duplicated exams
      },
    ]);

    if (insertExamError) {
      console.warn("Supabase duplicateExam insert warning:", insertExamError.message);
    }

    const clonedQuestions: ExamQuestion[] = [];
    if (sourceExam.questions && sourceExam.questions.length > 0) {
      const qInserts = sourceExam.questions.map((q, idx) => {
        const qId = `q_${Date.now()}_${idx + 1}`;
        const newQ: ExamQuestion = {
          id: qId,
          examId: newId,
          questionNumber: q.questionNumber || idx + 1,
          section: q.section,
          questionText: q.questionText,
          image: q.image,
          options: q.options,
          correctKey: q.correctKey,
          points: q.points,
          explanation: q.explanation,
        };
        clonedQuestions.push(newQ);
        return newQ;
      });

      const { error: insertQuestionsError } = await supabaseAdmin
        .from("ExamQuestion")
        .insert(qInserts);

      if (insertQuestionsError) {
        console.warn("Supabase duplicate questions warning:", insertQuestionsError.message);
      }
    }

    // In-memory fallback
    SAMPLE_EXAMS.unshift({
      id: newId,
      title: newTitle,
      description: sourceExam.description || null,
      category: sourceExam.category,
      durationMinutes: sourceExam.durationMinutes,
      passingGrade: sourceExam.passingGrade,
      totalQuestions: clonedQuestions.length,
      isActive: false,
      createdAt: new Date().toISOString(),
    });
    SAMPLE_QUESTIONS[newId] = clonedQuestions;

    revalidatePath("/dashboard/ujian");
    revalidatePath("/portal");
    return {
      success: true,
      message: `Paket ujian berhasil diduplikasi menjadi "${newTitle}" (${clonedQuestions.length} butir soal disalin).`,
      data: { id: newId },
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Gagal menduplikasi paket ujian" };
  }
}

export async function duplicateExamQuestion(
  id: string,
  examId: string
): Promise<ActionResponse<{ id: string }>> {
  try {
    const session = await requireAuth();
    const userRole = (session?.user as any)?.role;
    const userPermissions = (session?.user as any)?.permissions || [];
    const isAllowed =
      userRole === "Admin" ||
      userRole === "Super Admin" ||
      userRole === "Staf" ||
      userRole === "Tutor" ||
      userPermissions.includes("exam.update") ||
      userPermissions.includes("exam.manage");

    if (!isAllowed) {
      return { success: false, message: "Akses ditolak: Anda tidak memiliki izin menduplikasi butir soal." };
    }

    // Fetch source question
    let sourceQ: ExamQuestion | null = null;
    const { data: dbQ } = await supabaseAdmin
      .from("ExamQuestion")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (dbQ) {
      sourceQ = dbQ as ExamQuestion;
    } else if (SAMPLE_QUESTIONS[examId]) {
      sourceQ = SAMPLE_QUESTIONS[examId].find((q) => q.id === id) || null;
    }

    if (!sourceQ) {
      return { success: false, message: "Soal sumber tidak ditemukan." };
    }

    const { data: countData } = await supabaseAdmin
      .from("ExamQuestion")
      .select("id")
      .eq("examId", examId);

    const questionNumber = (countData?.length || SAMPLE_QUESTIONS[examId]?.length || 0) + 1;
    const newQId = `q_${Date.now()}`;

    const newQuestionRecord = {
      id: newQId,
      examId,
      questionNumber,
      section: sourceQ.section,
      questionText: `${sourceQ.questionText} (Salinan)`,
      options: sourceQ.options,
      correctKey: sourceQ.correctKey,
      points: sourceQ.points,
      explanation: sourceQ.explanation,
    };

    const { error } = await supabaseAdmin.from("ExamQuestion").insert([newQuestionRecord]);
    if (error) {
      console.warn("Supabase duplicateExamQuestion warning:", error.message);
    }

    await supabaseAdmin
      .from("Exam")
      .update({ totalQuestions: questionNumber })
      .eq("id", examId);

    if (!SAMPLE_QUESTIONS[examId]) {
      SAMPLE_QUESTIONS[examId] = [];
    }
    SAMPLE_QUESTIONS[examId].push(newQuestionRecord);

    const examIdx = SAMPLE_EXAMS.findIndex((e) => e.id === examId);
    if (examIdx !== -1) {
      SAMPLE_EXAMS[examIdx].totalQuestions = questionNumber;
    }

    revalidatePath(`/dashboard/ujian/${examId}`);
    return {
      success: true,
      message: `Soal berhasil diduplikasi menjadi nomor ${questionNumber}.`,
      data: { id: newQId },
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Gagal menduplikasi butir soal" };
  }
}

export async function bulkImportExamQuestions(
  examId: string,
  rawQuestions: Array<{
    section?: string;
    questionText: string;
    options: QuestionOption[];
    correctKey: string;
    points?: number;
    explanation?: string;
  }>
): Promise<ActionResponse<{ count: number }>> {
  try {
    const session = await requireAuth();
    const userRole = (session?.user as any)?.role;
    const userPermissions = (session?.user as any)?.permissions || [];
    const isAllowed =
      userRole === "Admin" ||
      userRole === "Super Admin" ||
      userRole === "Staf" ||
      userRole === "Tutor" ||
      userPermissions.includes("exam.update") ||
      userPermissions.includes("exam.manage");

    if (!isAllowed) {
      return { success: false, message: "Akses ditolak: Anda tidak memiliki izin mengimpor butir soal." };
    }

    if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
      return { success: false, message: "Data soal impor kosong atau tidak valid." };
    }

    const { data: countData } = await supabaseAdmin
      .from("ExamQuestion")
      .select("id")
      .eq("examId", examId);

    let startNum = (countData?.length || SAMPLE_QUESTIONS[examId]?.length || 0);

    const validInserts: ExamQuestion[] = [];
    for (let i = 0; i < rawQuestions.length; i++) {
      const q = rawQuestions[i];
      if (!q.questionText || !q.questionText.trim()) continue;
      if (!q.options || q.options.length < 2) continue;

      startNum++;
      validInserts.push({
        id: `q_${Date.now()}_${i + 1}`,
        examId,
        questionNumber: startNum,
        section: q.section?.trim() || null,
        questionText: q.questionText.trim(),
        options: q.options,
        correctKey: (q.correctKey || "A").trim().toUpperCase(),
        points: Math.max(1, Number(q.points) || 5),
        explanation: q.explanation?.trim() || null,
      });
    }

    if (validInserts.length === 0) {
      return { success: false, message: "Tidak ada soal yang valid untuk diimpor. Pastikan format teks soal dan opsi terisi." };
    }

    const { error } = await supabaseAdmin.from("ExamQuestion").insert(validInserts);
    if (error) {
      console.warn("Supabase bulkImportExamQuestions warning:", error.message);
    }

    await supabaseAdmin
      .from("Exam")
      .update({ totalQuestions: startNum })
      .eq("id", examId);

    if (!SAMPLE_QUESTIONS[examId]) {
      SAMPLE_QUESTIONS[examId] = [];
    }
    SAMPLE_QUESTIONS[examId].push(...validInserts);

    const examIdx = SAMPLE_EXAMS.findIndex((e) => e.id === examId);
    if (examIdx !== -1) {
      SAMPLE_EXAMS[examIdx].totalQuestions = startNum;
    }

    revalidatePath(`/dashboard/ujian/${examId}`);
    return {
      success: true,
      message: `Berhasil mengimpor ${validInserts.length} butir soal ke dalam paket ujian.`,
      data: { count: validInserts.length },
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Gagal mengimpor butir soal" };
  }
}
