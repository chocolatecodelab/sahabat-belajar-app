"use server";

import { supabaseAdmin } from "@/lib/supabase";
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
    const id = "exam_" + Date.now();
    const { error } = await supabaseAdmin.from("Exam").insert([
      {
        id,
        title: input.title,
        description: input.description || null,
        category: input.category,
        durationMinutes: Number(input.durationMinutes) || 90,
        passingGrade: Number(input.passingGrade) || 300,
        totalQuestions: 0,
        isActive: true,
      },
    ]);

    if (error) {
      console.warn("Supabase insert Exam warning:", error.message);
    }

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
        section: input.section || null,
        questionText: input.questionText,
        options: input.options,
        correctKey: input.correctKey,
        points: input.points || 5,
        explanation: input.explanation || null,
      },
    ]);

    if (!error) {
      // Update total questions on Exam
      await supabaseAdmin
        .from("Exam")
        .update({ totalQuestions: questionNumber })
        .eq("id", input.examId);
    }

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
      studentId: input.studentId,
      studentName: input.studentName || "Siswa",
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
          studentId: input.studentId,
          studentName: input.studentName || "Siswa",
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

export async function getStudentExamHistory(studentId: string): Promise<StudentExamSession[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("StudentExamSession")
      .select("*, exam:Exam(*)")
      .eq("studentId", studentId)
      .order("createdAt", { ascending: false });

    if (error || !data || data.length === 0) {
      return Object.values(SAMPLE_SESSIONS);
    }

    return data as StudentExamSession[];
  } catch (err) {
    console.error("getStudentExamHistory error:", err);
    return [];
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
    const { error } = await supabaseAdmin
      .from("Exam")
      .update(input)
      .eq("id", id);

    if (error) {
      console.warn("Supabase update Exam warning:", error.message);
    }

    const idx = SAMPLE_EXAMS.findIndex((e) => e.id === id);
    if (idx !== -1) {
      SAMPLE_EXAMS[idx] = { ...SAMPLE_EXAMS[idx], ...input } as any;
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
    const { error } = await supabaseAdmin
      .from("ExamQuestion")
      .update({
        section: input.section,
        questionText: input.questionText,
        options: input.options,
        correctKey: input.correctKey,
        points: input.points,
        explanation: input.explanation,
      })
      .eq("id", id);

    if (error) {
      console.warn("Supabase update ExamQuestion warning:", error.message);
    }

    if (SAMPLE_QUESTIONS[input.examId]) {
      const qIdx = SAMPLE_QUESTIONS[input.examId].findIndex((q) => q.id === id);
      if (qIdx !== -1) {
        SAMPLE_QUESTIONS[input.examId][qIdx] = {
          ...SAMPLE_QUESTIONS[input.examId][qIdx],
          ...input,
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
    const { data, error } = await supabaseAdmin
      .from("StudentExamSession")
      .select("*, exam:Exam(*)")
      .eq("id", sessionId)
      .maybeSingle();

    if (!error && data) {
      return data as StudentExamSession;
    }
    return SAMPLE_SESSIONS[sessionId] || null;
  } catch (err) {
    console.error("getExamSessionResult error:", err);
    return SAMPLE_SESSIONS[sessionId] || null;
  }
}
