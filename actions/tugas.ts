"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAuth } from "@/lib/auth";
import type { ActionResponse } from "@/types";
import { notifySubmissionReviewed } from "@/lib/notifications";

function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Non-HTTP context fallback
  }
}

export type SubmissionItem = {
  id: string;
  enrollmentId: string;
  lessonId?: string | null;
  title: string;
  fileUrl: string;
  studentNotes?: string | null;
  mentorFeedback?: string | null;
  score?: number | null;
  status: "SUBMITTED" | "REVIEWED" | "REVISION_NEEDED" | "APPROVED";
  submittedAt: string;
  reviewedAt?: string | null;
  studentName?: string;
  studentEmail?: string;
  courseTitle?: string;
};

// Default seed submissions for demo
const DEMO_SUBMISSIONS: SubmissionItem[] = [
  {
    id: "sub_demo_1",
    enrollmentId: "enroll_demo_scopus",
    title: "Draf Awal: GAP Analysis & Introduction Naskah Scopus Q2",
    fileUrl: "/uploads/modules/template-imrad-bias-ristek.docx",
    studentNotes: "Mohon masukan untuk perumusan novelty di paragraf 4 dan keterkaitan dengan Grand Theory.",
    mentorFeedback: "Rumusan novelty sudah sangat baik. Perkuat data empiris di latar belakang paragraf 2 dengan sitasi 3 tahun terakhir.",
    score: 85,
    status: "APPROVED",
    submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    reviewedAt: new Date(Date.now() - 86400000).toISOString(),
    studentName: "Nazaruddin, M.Kom.",
    studentEmail: "nazar@example.com",
    courseTitle: "Mentorship Intensif Publikasi Jurnal Scopus & SINTA 1-2",
  },
];

/**
 * 1. Student: Submit Research Manuscript Draft
 */
export async function submitResearchDraft(formData: {
  enrollmentId: string;
  lessonId?: string;
  title?: string;
  fileUrl?: string;
  googleDocUrl?: string;
  studentNotes?: string;
  notes?: string;
  studentName?: string;
  studentEmail?: string;
  courseSlug?: string;
}): Promise<ActionResponse> {
  try {
    const { enrollmentId, lessonId, courseSlug } = formData;
    const title = formData.title || "Draf Naskah Riset Scopus";
    const fileUrl = formData.fileUrl || formData.googleDocUrl || "https://docs.google.com/document/d/sample/edit";
    const studentNotes = formData.studentNotes || formData.notes || null;

    if (!enrollmentId || !title || !fileUrl) {
      return { success: false, message: "Judul tugas dan berkas draf naskah wajib diisi" };
    }

    const id = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const { error } = await supabaseAdmin.from("StudentSubmission").insert({
      id,
      enrollmentId,
      lessonId: lessonId || null,
      title,
      fileUrl,
      studentNotes: studentNotes || null,
      status: "SUBMITTED",
      submittedAt: new Date().toISOString(),
    });

    if (error) {
      console.error("submitResearchDraft error:", error);
      return { success: false, message: `Gagal menyimpan draf naskah: ${error.message}` };
    }

    if (courseSlug) {
      safeRevalidatePath(`/belajar/${courseSlug}`);
    }
    safeRevalidatePath("/dashboard/tugas");

    return { success: true, message: "Draf naskah berhasil dikumpulkan dan masuk ke antrean review mentor!" };
  } catch (err: any) {
    console.error("submitResearchDraft error:", err);
    return { success: false, message: err?.message || "Terjadi kesalahan sistem saat mengumpulkan draf naskah" };
  }
}

/**
 * 2. Student: Get Submissions for specific Enrollment
 */
export async function getStudentSubmissions(enrollmentId: string): Promise<SubmissionItem[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("StudentSubmission")
      .select("*")
      .eq("enrollmentId", enrollmentId)
      .order("submittedAt", { ascending: false });

    if (error || !data || data.length === 0) {
      return DEMO_SUBMISSIONS;
    }

    return data as SubmissionItem[];
  } catch {
    return DEMO_SUBMISSIONS;
  }
}

/**
 * 3. Mentor / Admin: Get All Submissions for Review Queue
 */
export async function getAdminSubmissions(params?: {
  status?: string;
  search?: string;
}): Promise<SubmissionItem[]> {
  try {
    let query = supabaseAdmin
      .from("StudentSubmission")
      .select(`
        *,
        enrollment:CourseEnrollment(
          userName,
          userEmail,
          course:Course(title)
        )
      `)
      .order("submittedAt", { ascending: false });

    if (params?.status && params.status !== "ALL") {
      query = query.eq("status", params.status);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      return DEMO_SUBMISSIONS;
    }

    return data.map((item: any) => {
      const enrollment = Array.isArray(item.enrollment) ? item.enrollment[0] : item.enrollment;
      const course = enrollment?.course ? (Array.isArray(enrollment.course) ? enrollment.course[0] : enrollment.course) : null;

      return {
        ...item,
        studentName: enrollment?.userName || "Peserta Riset",
        studentEmail: enrollment?.userEmail || "siswa@biasristek.id",
        courseTitle: course?.title || "Program Kursus",
      };
    });
  } catch {
    return DEMO_SUBMISSIONS;
  }
}

/**
 * 4. Mentor / Admin: Review & Give Feedback to Submission
 */
export async function reviewSubmission(formData: {
  submissionId: string;
  feedback: string;
  score?: number;
  status: "APPROVED" | "REVISION_NEEDED" | "REVIEWED";
}): Promise<ActionResponse> {
  await requireAuth();

  try {
    const { submissionId, feedback, score, status } = formData;

    const { error } = await supabaseAdmin
      .from("StudentSubmission")
      .update({
        mentorFeedback: feedback,
        score: score || null,
        status,
        reviewedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .eq("id", submissionId);

    if (error) {
      console.error("reviewSubmission update error:", error);
      return { success: false, message: `Gagal memperbarui review naskah: ${error.message}` };
    }

    safeRevalidatePath("/dashboard/tugas");
    safeRevalidatePath("/belajar");

    // Async Dispatch Notification to Student
    (async () => {
      try {
        const { data: subData } = await supabaseAdmin
          .from("StudentSubmission")
          .select(`
            title,
            enrollment:CourseEnrollment(
              userName,
              userEmail,
              course:Course(title, slug)
            )
          `)
          .eq("id", submissionId)
          .maybeSingle();

        if (subData) {
          const rawEnrollment: any = subData.enrollment;
          const enrollment = Array.isArray(rawEnrollment) ? rawEnrollment[0] : rawEnrollment;
          const rawCourse: any = enrollment?.course;
          const course = Array.isArray(rawCourse) ? rawCourse[0] : rawCourse;

          if (enrollment?.userEmail) {
            notifySubmissionReviewed({
              studentName: enrollment.userName || "Peserta Riset",
              studentEmail: enrollment.userEmail,
              courseTitle: course?.title || "Program Kursus",
              courseSlug: course?.slug,
              taskTitle: subData.title,
              status,
              score,
              mentorFeedback: feedback,
            }).catch((e) => console.error("notifySubmissionReviewed error:", e));
          }
        }
      } catch (subErr) {
        console.error("Failed to lookup submission for notification:", subErr);
      }
    })();

    return { success: true, message: "Hasil review & catatan revisi berhasil dikirimkan ke siswa" };
  } catch (err: any) {
    console.error("reviewSubmission error:", err);
    return { success: false, message: err?.message || "Gagal menyimpan review naskah" };
  }
}
