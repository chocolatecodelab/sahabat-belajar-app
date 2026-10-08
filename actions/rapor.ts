"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import type { ActionResponse } from "@/types";
import {
  notifySessionEvaluationSubmitted,
  notifyMonthlyReportGenerated,
} from "@/lib/notifications";

function safeRevalidatePath(pathStr: string) {
  try {
    revalidatePath(pathStr);
  } catch {
    // Non-HTTP context fallback
  }
}

const DATA_DIR = path.join(process.cwd(), "data");
const EVALUATIONS_FILE = path.join(DATA_DIR, "session_evaluations.json");
const REPORTS_FILE = path.join(DATA_DIR, "monthly_reports.json");

export type SessionEvaluationItem = {
  id: string;
  bookingId: string;
  tutorId: string;
  tutorName?: string;
  studentEmail: string;
  studentName: string;
  sessionNumber: number;
  currentChapter: string;
  topicDiscussed: string;
  methodologyScore: number;
  writingScore: number;
  dataProcessingScore: number;
  attendanceStatus: "ATTENDED" | "RESCHEDULED" | "ABSENT";
  actionItems: string;
  tutorFeedback: string;
  createdAt: string;
};

export type SubmitEvaluationInput = {
  bookingId: string;
  tutorId?: string;
  tutorName?: string;
  studentEmail: string;
  studentName: string;
  studentPhone?: string;
  sessionNumber?: number;
  currentChapter: string;
  topicDiscussed: string;
  methodologyScore: number;
  writingScore: number;
  dataProcessingScore: number;
  attendanceStatus?: "ATTENDED" | "RESCHEDULED" | "ABSENT";
  actionItems: string;
  tutorFeedback: string;
  isFinalSession?: boolean;
};

export type MonthlyProgressReportItem = {
  id: string;
  reportNumber: string;
  enrollmentId?: string | null;
  bookingId?: string | null;
  studentName: string;
  studentEmail: string;
  studentPhone?: string | null;
  courseTitle: string;
  tutorName: string;
  periodMonth: number;
  periodYear: number;
  averageScore: number;
  methodologyScore: number;
  writingScore: number;
  dataProcessingScore: number;
  progressStatus: string;
  summary: string;
  recommendations: string;
  totalSessions: number;
  pdfReportUrl?: string | null;
  sentToStudent: boolean;
  sentAt?: string | null;
  createdAt: string;
  evaluations?: SessionEvaluationItem[];
};

// Default seed evaluation
const DEFAULT_EVALUATIONS: SessionEvaluationItem[] = [
  {
    id: "eval_seed_01",
    bookingId: "book_scopus_qa_01",
    tutorId: "tutor_hendra_scopus",
    tutorName: "Dr. Ir. Hendra Gunawan, M.Sc.",
    studentEmail: "ahmad.riset@example.com",
    studentName: "Ahmad Mahasiswa Riset, S.Kom.",
    sessionNumber: 1,
    currentChapter: "Bab 3: Perumusan Hipotesis & Model SEM",
    topicDiscussed: "Bedah GAP Analysis dan Konstruk Variabel Moderasi SmartPLS 4",
    methodologyScore: 88,
    writingScore: 85,
    dataProcessingScore: 90,
    attendanceStatus: "ATTENDED",
    actionItems: "Perbaiki matriks operasionalisasi variabel dan periksa convergent validity (AVE > 0.50).",
    tutorFeedback: "Pemahaman logika hipotesis sangat tajam. Fokus pada argumentasi teoritis pada sub-bab 3.4.",
    createdAt: new Date().toISOString(),
  },
];

async function ensureDataFiles() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(EVALUATIONS_FILE);
    } catch {
      await fs.writeFile(EVALUATIONS_FILE, JSON.stringify(DEFAULT_EVALUATIONS, null, 2), "utf-8");
    }
    try {
      await fs.access(REPORTS_FILE);
    } catch {
      await fs.writeFile(REPORTS_FILE, JSON.stringify([], null, 2), "utf-8");
    }
  } catch (err) {
    console.error("ensureDataFiles error:", err);
  }
}

async function readLocalEvaluations(): Promise<SessionEvaluationItem[]> {
  await ensureDataFiles();
  try {
    const raw = await fs.readFile(EVALUATIONS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return DEFAULT_EVALUATIONS;
  }
}

async function writeLocalEvaluations(items: SessionEvaluationItem[]) {
  await ensureDataFiles();
  await fs.writeFile(EVALUATIONS_FILE, JSON.stringify(items, null, 2), "utf-8");
}

async function readLocalReports(): Promise<MonthlyProgressReportItem[]> {
  await ensureDataFiles();
  try {
    const raw = await fs.readFile(REPORTS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeLocalReports(items: MonthlyProgressReportItem[]) {
  await ensureDataFiles();
  await fs.writeFile(REPORTS_FILE, JSON.stringify(items, null, 2), "utf-8");
}

/**
 * 1. Submit Session Evaluation by Mentor
 */
export async function submitSessionEvaluation(
  input: SubmitEvaluationInput
): Promise<ActionResponse<SessionEvaluationItem>> {
  try {
    if (!input.bookingId || !input.studentEmail || !input.currentChapter.trim()) {
      return { success: false, message: "ID Booking, email siswa, dan status bab wajib diisi" };
    }

    if (!input.actionItems.trim() || !input.tutorFeedback.trim()) {
      return { success: false, message: "Tindakan perbaikan dan catatan mentor wajib diisi" };
    }

    // Validate score ranges (0 - 100)
    const mScore = Math.max(0, Math.min(100, Math.round(input.methodologyScore)));
    const wScore = Math.max(0, Math.min(100, Math.round(input.writingScore)));
    const dScore = Math.max(0, Math.min(100, Math.round(input.dataProcessingScore)));

    const evalId = `eval_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const sessionNum = input.sessionNumber || 1;

    const evaluationItem: SessionEvaluationItem = {
      id: evalId,
      bookingId: input.bookingId,
      tutorId: input.tutorId || "tutor_assigned",
      tutorName: input.tutorName || "Tim Mentor BIAS RISTEK",
      studentEmail: input.studentEmail.trim().toLowerCase(),
      studentName: input.studentName,
      sessionNumber: sessionNum,
      currentChapter: input.currentChapter.trim(),
      topicDiscussed: input.topicDiscussed.trim(),
      methodologyScore: mScore,
      writingScore: wScore,
      dataProcessingScore: dScore,
      attendanceStatus: input.attendanceStatus || "ATTENDED",
      actionItems: input.actionItems.trim(),
      tutorFeedback: input.tutorFeedback.trim(),
      createdAt: new Date().toISOString(),
    };

    // 1. Try persisting to Supabase
    let savedToSupabase = false;
    try {
      const { error: insErr } = await supabaseAdmin.from("SessionEvaluation").insert({
        id: evalId,
        bookingId: input.bookingId,
        tutorId: evaluationItem.tutorId,
        studentEmail: evaluationItem.studentEmail,
        studentName: evaluationItem.studentName,
        sessionNumber: sessionNum,
        currentChapter: evaluationItem.currentChapter,
        topicDiscussed: evaluationItem.topicDiscussed,
        methodologyScore: mScore,
        writingScore: wScore,
        dataProcessingScore: dScore,
        attendanceStatus: evaluationItem.attendanceStatus,
        actionItems: evaluationItem.actionItems,
        tutorFeedback: evaluationItem.tutorFeedback,
        createdAt: evaluationItem.createdAt,
      });

      if (!insErr) {
        savedToSupabase = true;
      }
    } catch (dbErr) {
      console.warn("Supabase insert SessionEvaluation failed, using JSON fallback:", dbErr);
    }

    // 2. Always persist to local JSON fallback
    const localEvals = await readLocalEvaluations();
    localEvals.unshift(evaluationItem);
    await writeLocalEvaluations(localEvals);

    // 3. If booking final session, update booking status to COMPLETED
    if (input.isFinalSession) {
      try {
        await supabaseAdmin
          .from("MentorshipBooking")
          .update({
            status: "COMPLETED",
            completedAt: new Date().toISOString(),
          })
          .eq("id", input.bookingId);
      } catch {}
    }

    // 4. Send automated notification to student via WhatsApp & Email
    (async () => {
      try {
        await notifySessionEvaluationSubmitted({
          studentName: evaluationItem.studentName,
          studentEmail: evaluationItem.studentEmail,
          studentPhone: input.studentPhone,
          tutorName: evaluationItem.tutorName || "Mentor Riset",
          sessionNumber: sessionNum,
          currentChapter: evaluationItem.currentChapter,
          methodologyScore: mScore,
          writingScore: wScore,
          dataProcessingScore: dScore,
          actionItems: evaluationItem.actionItems,
          tutorFeedback: evaluationItem.tutorFeedback,
          classroomUrl: "http://localhost:3000/belajar",
        });
      } catch (notifErr) {
        console.error("notifySessionEvaluationSubmitted error:", notifErr);
      }
    })();

    safeRevalidatePath("/belajar");
    safeRevalidatePath("/dashboard/penjadwalan");

    return {
      success: true,
      message: `Evaluasi sesi ke-${sessionNum} berhasil disimpan dan dikirimkan ke siswa`,
      data: evaluationItem,
    };
  } catch (err: any) {
    console.error("submitSessionEvaluation error:", err);
    return {
      success: false,
      message: err.message || "Gagal menyimpan lembar evaluasi",
    };
  }
}

/**
 * 2. Get Session Evaluations (Filter by Booking, Student Email, or Tutor)
 */
export async function getSessionEvaluations(params?: {
  bookingId?: string;
  studentEmail?: string;
  tutorId?: string;
}): Promise<SessionEvaluationItem[]> {
  try {
    // 1. Try Supabase
    let query = supabaseAdmin.from("SessionEvaluation").select("*").order("sessionNumber", { ascending: true });
    if (params?.bookingId) query = query.eq("bookingId", params.bookingId);
    if (params?.studentEmail) query = query.eq("studentEmail", params.studentEmail.trim().toLowerCase());
    if (params?.tutorId) query = query.eq("tutorId", params.tutorId);

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data as SessionEvaluationItem[];
    }
  } catch {}

  // 2. Local Fallback
  const locals = await readLocalEvaluations();
  return locals.filter((e) => {
    if (params?.bookingId && e.bookingId !== params.bookingId) return false;
    if (params?.studentEmail && e.studentEmail.toLowerCase() !== params.studentEmail.toLowerCase()) return false;
    if (params?.tutorId && e.tutorId !== params.tutorId) return false;
    return true;
  });
}

/**
 * 3. Compile Monthly Progress Report (Fase #6 Cron / On-Demand Engine)
 */
export async function compileMonthlyProgressReport(params: {
  studentEmail: string;
  studentName?: string;
  studentPhone?: string;
  periodMonth: number;
  periodYear: number;
  courseTitle?: string;
  tutorName?: string;
}): Promise<ActionResponse<MonthlyProgressReportItem>> {
  try {
    const email = params.studentEmail.trim().toLowerCase();
    const allStudentEvals = await getSessionEvaluations({ studentEmail: email });

    // Filter evaluations in current period
    const periodEvals = allStudentEvals.filter((ev) => {
      const d = new Date(ev.createdAt);
      return d.getMonth() + 1 === params.periodMonth && d.getFullYear() === params.periodYear;
    });

    const evaluationsToAggregate = periodEvals.length > 0 ? periodEvals : allStudentEvals;

    if (evaluationsToAggregate.length === 0) {
      return {
        success: false,
        message: "Tidak ditemukan sesi bimbingan yang selesai untuk dikompilasi menjadi rapor pada periode ini.",
      };
    }

    const totalSessions = evaluationsToAggregate.length;
    const avgMethodology =
      evaluationsToAggregate.reduce((acc, e) => acc + e.methodologyScore, 0) / totalSessions;
    const avgWriting =
      evaluationsToAggregate.reduce((acc, e) => acc + e.writingScore, 0) / totalSessions;
    const avgDataProcessing =
      evaluationsToAggregate.reduce((acc, e) => acc + e.dataProcessingScore, 0) / totalSessions;
    const totalAverage = Math.round(((avgMethodology + avgWriting + avgDataProcessing) / 3) * 10) / 10;

    let progressStatus = "SESUAI TARGET (ON TRACK)";
    if (totalAverage >= 86) {
      progressStatus = "SANGAT BAIK (EXCELLENT / SCOPUS READY)";
    } else if (totalAverage < 75) {
      progressStatus = "PERLU AKSELERASI (NEEDS IMPROVEMENT)";
    }

    const studentName = params.studentName || evaluationsToAggregate[0]?.studentName || "Peserta Riset BIAS RISTEK";
    const tutorName = params.tutorName || evaluationsToAggregate[0]?.tutorName || "Tim Mentor Pakar";
    const courseTitle = params.courseTitle || "Mentorship Intensif Publikasi Jurnal Scopus & SINTA";

    const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const reportNumber = `RAPOR-${params.periodYear}${String(params.periodMonth).padStart(2, "0")}-${randomSuffix}`;

    const summary = `Peserta telah menyelesaikan ${totalSessions} sesi bimbingan intensif pada periode ini. Penguasaan metodologi mencapai ${Math.round(
      avgMethodology
    )}/100, sistematika penulisan naskah mencapai ${Math.round(
      avgWriting
    )}/100, dan ketepatan analisis olah data mencapai ${Math.round(
      avgDataProcessing
    )}/100. Status naskah saat ini: ${evaluationsToAggregate[0]?.currentChapter || "Tahap Finalisasi Naskah"}.`;

    const recommendations = `Pertahankan ritme revisi berkala. Segera lengkapi tindakan perbaikan pada bab pembahasan dan periksa keselarasan sitasi referensi primer 5 tahun terakhir sebelum proses submit artikel ke jurnal target.`;

    const reportItem: MonthlyProgressReportItem = {
      id: reportId,
      reportNumber,
      studentName,
      studentEmail: email,
      studentPhone: params.studentPhone || null,
      courseTitle,
      tutorName,
      periodMonth: params.periodMonth,
      periodYear: params.periodYear,
      averageScore: totalAverage,
      methodologyScore: Math.round(avgMethodology * 10) / 10,
      writingScore: Math.round(avgWriting * 10) / 10,
      dataProcessingScore: Math.round(avgDataProcessing * 10) / 10,
      progressStatus,
      summary,
      recommendations,
      totalSessions,
      pdfReportUrl: `/rapor/${reportNumber}`,
      sentToStudent: true,
      sentAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      evaluations: evaluationsToAggregate,
    };

    // 1. Try saving to Supabase
    try {
      await supabaseAdmin.from("MonthlyProgressReport").insert({
        id: reportId,
        reportNumber,
        studentName,
        studentEmail: email,
        courseTitle,
        tutorName,
        periodMonth: params.periodMonth,
        periodYear: params.periodYear,
        averageScore: totalAverage,
        methodologyScore: reportItem.methodologyScore,
        writingScore: reportItem.writingScore,
        dataProcessingScore: reportItem.dataProcessingScore,
        progressStatus,
        summary,
        recommendations,
        totalSessions,
        pdfReportUrl: reportItem.pdfReportUrl,
        sentToStudent: true,
        sentAt: reportItem.sentAt,
        createdAt: reportItem.createdAt,
      });
    } catch (dbErr) {
      console.warn("Supabase insert MonthlyProgressReport fallback to JSON:", dbErr);
    }

    // 2. Persist to Local JSON
    const localReports = await readLocalReports();
    localReports.unshift(reportItem);
    await writeLocalReports(localReports);

    // 3. Send automated notifications
    (async () => {
      try {
        await notifyMonthlyReportGenerated({
          studentName,
          studentEmail: email,
          studentPhone: params.studentPhone,
          reportNumber,
          courseTitle,
          tutorName,
          periodMonth: params.periodMonth,
          periodYear: params.periodYear,
          averageScore: totalAverage,
          progressStatus,
          reportUrl: `http://localhost:3000/rapor/${reportNumber}`,
        });
      } catch (notifErr) {
        console.error("notifyMonthlyReportGenerated error:", notifErr);
      }
    })();

    safeRevalidatePath("/belajar");
    safeRevalidatePath(`/rapor/${reportNumber}`);

    return {
      success: true,
      message: `e-Rapor bulanan resmi ${reportNumber} berhasil diterbitkan dan dikirimkan ke siswa`,
      data: reportItem,
    };
  } catch (err: any) {
    console.error("compileMonthlyProgressReport error:", err);
    return {
      success: false,
      message: err.message || "Gagal mengompilasi e-Rapor bulanan",
    };
  }
}

/**
 * 4. Get Monthly Reports (Student Portal or Admin)
 */
export async function getStudentMonthlyReports(studentEmail?: string): Promise<MonthlyProgressReportItem[]> {
  try {
    let query = supabaseAdmin.from("MonthlyProgressReport").select("*").order("createdAt", { ascending: false });
    if (studentEmail) {
      query = query.eq("studentEmail", studentEmail.trim().toLowerCase());
    }
    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data as MonthlyProgressReportItem[];
    }
  } catch {}

  const locals = await readLocalReports();
  if (studentEmail) {
    return locals.filter((r) => r.studentEmail.toLowerCase() === studentEmail.trim().toLowerCase());
  }
  return locals;
}

/**
 * 5. Get Monthly Report by ID or Report Number (For Public Inspection & Print)
 */
export async function getMonthlyReportByNumber(reportNumberOrId: string): Promise<MonthlyProgressReportItem | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("MonthlyProgressReport")
      .select("*")
      .or(`id.eq.${reportNumberOrId},reportNumber.eq.${reportNumberOrId}`)
      .maybeSingle();

    if (!error && data) {
      const evals = await getSessionEvaluations({ studentEmail: data.studentEmail });
      return {
        ...data,
        evaluations: evals,
      } as MonthlyProgressReportItem;
    }
  } catch {}

  const locals = await readLocalReports();
  const found = locals.find((r) => r.id === reportNumberOrId || r.reportNumber === reportNumberOrId);
  if (found) {
    const evals = await getSessionEvaluations({ studentEmail: found.studentEmail });
    return {
      ...found,
      evaluations: evals,
    };
  }

  // Fallback demo report for preview
  if (reportNumberOrId.startsWith("RAPOR-") || reportNumberOrId === "demo") {
    return {
      id: "rep_demo_01",
      reportNumber: reportNumberOrId === "demo" ? "RAPOR-202610-8921" : reportNumberOrId,
      studentName: "Nazaruddin, M.Kom., Ph.D.",
      studentEmail: "nazaruddin@example.ac.id",
      courseTitle: "Mentorship Intensif Publikasi Jurnal Scopus & SINTA 1-2",
      tutorName: "Dr. Ir. Hendra Gunawan, M.Sc.",
      periodMonth: 10,
      periodYear: 2026,
      averageScore: 89.4,
      methodologyScore: 92.0,
      writingScore: 86.5,
      dataProcessingScore: 89.7,
      progressStatus: "SANGAT BAIK (EXCELLENT / SCOPUS READY)",
      summary: "Peserta menunjukkan lonjakan kemajuan yang signifikan pada pemodelan statistik SmartPLS dan validasi konstruk laten. Naskah telah memenuhi parameter kebaruan ilmiah (novelty).",
      recommendations: "Lanjutkan perbaikan minor pada bagian Diskusi (Discussion) untuk memperkaya perbandingan dengan literatur Scopus Q1 mutakhir (2024-2026).",
      totalSessions: 3,
      pdfReportUrl: `/rapor/${reportNumberOrId}`,
      sentToStudent: true,
      sentAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      evaluations: DEFAULT_EVALUATIONS,
    };
  }

  return null;
}
