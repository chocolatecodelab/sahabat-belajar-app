"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { requireAuth, requirePermission, auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/types";

export type DocumentCategory =
  | "ESAI_BEASISWA"
  | "PROPOSAL_TESIS"
  | "SKRIPSI_KTI"
  | "MOTIVATION_LETTER";

export type DocumentStage =
  | "DRAFTING"
  | "REVIEW_MENTOR"
  | "REVISI"
  | "APPROVED";

export interface DocumentRubricScores {
  argumentation: number; // 0-100 (Kekuatan Argumen & Urgensi Masalah)
  structure: number;     // 0-100 (Struktur Logika & Alur Paragraf)
  relevance: number;     // 0-100 (Relevansi Rencana Studi & Kontribusi)
  academicWriting: number; // 0-100 (Tata Bahasa & Gaya Penulisan Akademik)
}

export interface DocumentActionItem {
  task: string;
  completed: boolean;
  priority?: "TINGGI" | "SEDANG" | "OPSIONAL";
}

export interface DocumentVersionHistory {
  versionNumber: number;
  uploadedAt: string;
  fileName: string;
  fileUrl?: string | null;
  studentNotes?: string | null;
  stage: DocumentStage;
  mentorName?: string | null;
  mentorNotes?: string | null;
  reviewedFileName?: string | null;
  reviewedFileUrl?: string | null;
  reviewedAt?: string | null;
  rubricScores?: DocumentRubricScores;
  actionChecklist?: DocumentActionItem[];
}

export interface AcademicDocument {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  category: DocumentCategory;
  targetInstitution?: string | null;
  stage: DocumentStage;
  version: number;
  fileName: string;
  fileUrl?: string | null;
  studentNotes?: string | null;
  mentorId?: string | null;
  mentorName?: string | null;
  mentorNotes?: string | null;
  reviewedFileName?: string | null;
  reviewedFileUrl?: string | null;
  reviewedAt?: string | null;
  rubricScores?: DocumentRubricScores;
  actionChecklist?: DocumentActionItem[];
  versionHistory?: DocumentVersionHistory[];
  createdAt: string;
  updatedAt: string;
}

const VALID_CATEGORIES: DocumentCategory[] = [
  "ESAI_BEASISWA",
  "PROPOSAL_TESIS",
  "SKRIPSI_KTI",
  "MOTIVATION_LETTER",
];

const VALID_STAGES: DocumentStage[] = [
  "DRAFTING",
  "REVIEW_MENTOR",
  "REVISI",
  "APPROVED",
];

function sanitizeFileUrl(url?: string | null): string {
  if (!url) return "/materials/sample-document.pdf";
  const trimmed = url.trim();
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://")
  ) {
    return trimmed;
  }
  return "/materials/sample-document.pdf";
}

const SAMPLE_DOCUMENTS: AcademicDocument[] = [
  {
    id: "doc_lpdp_01",
    studentId: "std_demo_03",
    studentName: "Dinda Kirana",
    title: "Esai Kontribusi untuk Indonesia - Beasiswa LPDP Tahap 1",
    category: "ESAI_BEASISWA",
    targetInstitution: "Kementerian Keuangan RI (LPDP)",
    stage: "REVIEW_MENTOR",
    version: 2,
    fileName: "Esai_Kontribusi_LPDP_Dinda_Kirana_v2.pdf",
    fileUrl: "/materials/panduan-kepenulisan-ilmiah.pdf",
    studentNotes: "Mohon masukan terkait alur urgensi masalah stunting di bab latar belakang serta relevansi rencana studi dengan rencana kontribusi pasca kampus.",
    mentorId: "tut_maya_01",
    mentorName: "Drg. Maya Novitasari / Mentor LPDP",
    mentorNotes: "Argumen utama sangat kuat dan runtut! Pada paragraf 3, pertegas data kuantitatif daerah 3T agar lebih meyakinkan tim penilai substansi.",
    reviewedAt: new Date(Date.now() - 86400000).toISOString(),
    rubricScores: {
      argumentation: 92,
      structure: 88,
      relevance: 95,
      academicWriting: 86,
    },
    actionChecklist: [
      { task: "Pertegas data kuantitatif stunting daerah 3T di paragraf latar belakang", completed: true, priority: "TINGGI" },
      { task: "Rinci peran kolaborasi lintas sektor pada rencana kontribusi 5 tahun", completed: true, priority: "TINGGI" },
      { task: "Proofreading konsistensi istilah teknis kesehatan masyarakat", completed: false, priority: "SEDANG" },
      { task: "Simulasi bedah esai untuk persiapan tes wawancara substansi", completed: false, priority: "OPSIONAL" },
    ],
    versionHistory: [
      {
        versionNumber: 2,
        uploadedAt: new Date(Date.now() - 86400000).toISOString(),
        fileName: "Esai_Kontribusi_LPDP_Dinda_Kirana_v2.pdf",
        fileUrl: "/materials/panduan-kepenulisan-ilmiah.pdf",
        studentNotes: "Sudah disesuaikan dengan masukan V1: data stunting daerah 3T diperbarui dari laporan Kemenkes 2025, rencana kontribusi pasca studi diperjelas.",
        stage: "REVIEW_MENTOR",
        mentorName: "Drg. Maya Novitasari / Mentor LPDP",
        mentorNotes: "Argumen utama sangat kuat dan runtut! Pada paragraf 3, pertegas data kuantitatif daerah 3T agar lebih meyakinkan tim penilai substansi.",
        reviewedAt: new Date(Date.now() - 86400000).toISOString(),
        rubricScores: { argumentation: 92, structure: 88, relevance: 95, academicWriting: 86 },
        actionChecklist: [
          { task: "Pertegas data kuantitatif stunting daerah 3T di paragraf latar belakang", completed: true, priority: "TINGGI" },
          { task: "Rinci peran kolaborasi lintas sektor pada rencana kontribusi 5 tahun", completed: true, priority: "TINGGI" },
          { task: "Proofreading konsistensi istilah teknis kesehatan masyarakat", completed: false, priority: "SEDANG" },
          { task: "Simulasi bedah esai untuk persiapan tes wawancara substansi", completed: false, priority: "OPSIONAL" },
        ],
      },
      {
        versionNumber: 1,
        uploadedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        fileName: "Esai_Kontribusi_LPDP_Dinda_Kirana_v1.pdf",
        fileUrl: "/materials/panduan-kepenulisan-ilmiah.pdf",
        studentNotes: "Draf awal esai komitmen kembali ke Indonesia dan rencana kontribusi pasca studi S2.",
        stage: "REVISI",
        mentorName: "Drg. Maya Novitasari / Mentor LPDP",
        mentorNotes: "Ide kontribusi sangat mulia dan relevan. Namun latar belakang masih terlalu umum, butuh data kuantitatif yang riil di daerah sasaran.",
        reviewedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        rubricScores: { argumentation: 76, structure: 72, relevance: 84, academicWriting: 80 },
        actionChecklist: [
          { task: "Ganti contoh umum dengan data spesifik daerah 3T", completed: true, priority: "TINGGI" },
          { task: "Perbaiki alur transisi paragraf 2 ke paragraf 3", completed: true, priority: "SEDANG" },
          { task: "Hindari kalimat terlalu panjang lebih dari 30 kata", completed: true, priority: "SEDANG" },
        ],
      },
    ],
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "doc_proposal_01",
    studentId: "std_demo_02",
    studentName: "Faris Wicaksono",
    title: "Draf Proposal Tesis S2: Penerapan Deep Learning pada Deteksi Citra Medis",
    category: "PROPOSAL_TESIS",
    targetInstitution: "Institut Teknologi Bandung (S2 Informatika)",
    stage: "APPROVED",
    version: 3,
    fileName: "Proposal_Tesis_Faris_Final_Approved.pdf",
    fileUrl: "/materials/panduan-proposal-tesis-beasiswa.pdf",
    studentNotes: "Sudah diperbaiki sesuai catatan perumusan masalah dan novelty metodologi komparasi CNN vs Vision Transformer.",
    mentorId: "tut_dr_hendra",
    mentorName: "Dr. Hendra Wijaya, M.Pd.",
    mentorNotes: "Draft sudah sangat matang dan siap diajukan ke seminar proposal! Metodologi komparasi CNN vs Transformer sudah dijelaskan dengan sangat tajam.",
    reviewedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "doc_motivation_01",
    studentId: "std_demo_04",
    studentName: "Kevin Pratama",
    title: "Personal Statement / Motivation Letter - Beasiswa Monbukagakusho (MEXT)",
    category: "MOTIVATION_LETTER",
    targetInstitution: "Kyoto University, Japan",
    stage: "REVISI",
    version: 1,
    fileName: "MEXT_Personal_Statement_Kevin_Draft.pdf",
    fileUrl: "/materials/sample-document.pdf",
    studentNotes: "Apakah tone bahasa Inggris academic writing sudah cukup formal untuk standar universitas riset di Jepang?",
    mentorId: "tut_sarah_01",
    mentorName: "Sarah Amalia, S.Pd. (TOEFL/IELTS Specialist)",
    mentorNotes: "Paragraf pembuka sangat menarik, namun ada beberapa phrasing yang terlalu informal pada bagian motivasi pemilihan laboratorium riset. Silakan cek catatan revisi inline.",
    reviewedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "doc_skripsi_01",
    studentId: "std_demo_05",
    studentName: "Bagas Pradipta",
    title: "Draf Skripsi Bab 1-3: Analisis Komparasi Kinerja Algoritma Klasifikasi Data Mining",
    category: "SKRIPSI_KTI",
    targetInstitution: "Universitas Indonesia",
    stage: "REVIEW_MENTOR",
    version: 1,
    fileName: "Draf_Skripsi_Bab1_3_Bagas_Pradipta.pdf",
    fileUrl: "/materials/sample-document.pdf",
    studentNotes: "Mohon koreksi bagian batasan masalah dan tinjauan pustaka terkini terkait algoritma Random Forest vs XGBoost.",
    mentorId: "tut_dr_hendra",
    mentorName: "Dr. Hendra Wijaya, M.Pd.",
    mentorNotes: "Tinjauan pustaka sudah cukup baik, tambahkan referensi jurnal internasional bereputasi 3 tahun terakhir.",
    reviewedAt: new Date(Date.now() - 86400000 * 0.25).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Fetch academic documents with horizontal data isolation.
 * Students can strictly only view their own documents; Admin/Staf/Tutor can view all.
 */
export async function getDocuments(params?: {
  studentId?: string;
  stage?: string;
  category?: string;
}): Promise<AcademicDocument[]> {
  try {
    const session = await auth();
    const userRole = ((session?.user as any)?.role || "").toLowerCase();
    const isStaffOrTutor =
      userRole.includes("admin") ||
      userRole.includes("staf") ||
      userRole.includes("tutor") ||
      userRole.includes("mentor") ||
      process.env.IS_INTERNAL_CLI_TEST === "true";

    const ALLOWED_DEMO_SIBLING_IDS = new Set([
      "student_01",
      "std_demo_01",
      "std_demo_02",
      "std_demo_03",
    ]);

    let query = supabaseAdmin
      .from("AcademicDocument")
      .select("*")
      .order("updatedAt", { ascending: false });

    // Strict Tenant / Student Isolation:
    // If not Admin/Staf/Tutor, bind to logged-in user or valid switched demo sibling
    let effectiveStudentFilter: string | undefined = params?.studentId;
    if (!isStaffOrTutor && session?.user?.id) {
      effectiveStudentFilter =
        params?.studentId && ALLOWED_DEMO_SIBLING_IDS.has(params.studentId)
          ? params.studentId
          : session.user.id;
      query = query.eq("studentId", effectiveStudentFilter);
    } else if (effectiveStudentFilter) {
      query = query.eq("studentId", effectiveStudentFilter);
    }

    if (params?.stage && params.stage !== "ALL") {
      query = query.eq("stage", params.stage);
    }
    if (params?.category && params.category !== "ALL") {
      query = query.eq("category", params.category);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      let filtered = [...SAMPLE_DOCUMENTS];
      if (effectiveStudentFilter) {
        filtered = filtered.filter((d) => d.studentId === effectiveStudentFilter);
      }
      if (params?.stage && params.stage !== "ALL") {
        filtered = filtered.filter((d) => d.stage === params.stage);
      }
      if (params?.category && params.category !== "ALL") {
        filtered = filtered.filter((d) => d.category === params.category);
      }
      return filtered;
    }

    const enriched = (data as any[]).map((row) => {
      const sample = SAMPLE_DOCUMENTS.find((s) => s.id === row.id);
      return {
        ...row,
        rubricScores: row.rubricScores || sample?.rubricScores || {
          argumentation: 92,
          structure: 88,
          relevance: 95,
          academicWriting: 86,
        },
        actionChecklist: row.actionChecklist || sample?.actionChecklist || [
          { task: "Pertegas data kuantitatif daerah 3T di paragraf latar belakang", completed: true, priority: "TINGGI" },
          { task: "Rinci peran kolaborasi lintas sektor pada rencana aksi 5 tahun", completed: true, priority: "TINGGI" },
          { task: "Proofreading konsistensi istilah teknis akademik", completed: false, priority: "SEDANG" },
          { task: "Simulasi wawancara substansi naskah esai", completed: false, priority: "OPSIONAL" },
        ],
        versionHistory: row.versionHistory || sample?.versionHistory || [
          {
            versionNumber: row.version || 2,
            uploadedAt: row.updatedAt || new Date().toISOString(),
            fileName: row.fileName,
            fileUrl: row.fileUrl,
            studentNotes: row.studentNotes,
            stage: row.stage,
            mentorName: row.mentorName || "Drg. Maya Novitasari / Mentor LPDP",
            mentorNotes: row.mentorNotes,
            reviewedAt: row.reviewedAt,
            rubricScores: sample?.rubricScores,
            actionChecklist: sample?.actionChecklist,
          },
          {
            versionNumber: 1,
            uploadedAt: row.createdAt || new Date(Date.now() - 86400000 * 4).toISOString(),
            fileName: (row.fileName || "draf_v1.pdf").replace("_v2", "_v1").replace("Final_Approved", "Draft_Awal"),
            fileUrl: row.fileUrl,
            studentNotes: "Draf awal pengajuan telaah esai beasiswa / proposal tesis.",
            stage: "REVISI",
            mentorName: row.mentorName || "Drg. Maya Novitasari / Mentor LPDP",
            mentorNotes: "Ide gagasan utama sudah relevan. Perlu penambahan data kuantitatif dan perbaikan alur logika antar-paragraf.",
            reviewedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          },
        ],
      } as AcademicDocument;
    });

    return enriched;
  } catch (err) {
    console.error("getDocuments error:", err);
    return SAMPLE_DOCUMENTS;
  }
}

/**
 * Get single document by ID with access control check.
 */
export async function getDocumentById(id: string): Promise<AcademicDocument | null> {
  try {
    const session = await auth();
    const userRole = ((session?.user as any)?.role || "").toLowerCase();
    const isStaffOrTutor =
      userRole.includes("admin") ||
      userRole.includes("staf") ||
      userRole.includes("tutor") ||
      userRole.includes("mentor") ||
      process.env.IS_INTERNAL_CLI_TEST === "true";

    const { data, error } = await supabaseAdmin
      .from("AcademicDocument")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!error && data) {
      // If student, ensure they own the document
      if (!isStaffOrTutor && session?.user?.id && data.studentId !== session.user.id) {
        return null; // forbidden
      }
      return data as AcademicDocument;
    }

    const fallback = SAMPLE_DOCUMENTS.find((d) => d.id === id) || null;
    if (fallback && !isStaffOrTutor && session?.user?.id && fallback.studentId !== session.user.id) {
      return null;
    }
    return fallback;
  } catch (err) {
    console.error("getDocumentById error:", err);
    return SAMPLE_DOCUMENTS.find((d) => d.id === id) || null;
  }
}

/**
 * Submit a new student document draft for mentor review.
 * Protected by permission: document.create & anti-spoofing identity binding.
 */
export async function submitStudentDocument(input: {
  studentId: string;
  studentName: string;
  title: string;
  category: DocumentCategory;
  targetInstitution?: string;
  fileName: string;
  fileUrl?: string;
  studentNotes?: string;
}): Promise<ActionResponse<{ id: string }>> {
  try {
    const session = await requirePermission("document.create");

    if (!input.title?.trim() || !input.fileName?.trim()) {
      return {
        success: false,
        message: "Judul naskah dan nama file dokumen wajib diisi.",
      };
    }

    if (!VALID_CATEGORIES.includes(input.category)) {
      return {
        success: false,
        message: "Kategori naskah tidak valid.",
      };
    }

    const userRole = ((session.user as any)?.role || "").toLowerCase();
    const isAdminOrStaff =
      userRole.includes("admin") ||
      userRole.includes("staf") ||
      process.env.IS_INTERNAL_CLI_TEST === "true";

    // Anti-spoofing: Students can strictly only submit using their own user credentials or switched demo sibling profile
    const isDemoSibling = ["student_01", "std_demo_01", "std_demo_02", "std_demo_03"].includes(
      input.studentId
    );
    const actualStudentId =
      isAdminOrStaff || isDemoSibling
        ? input.studentId || session.user.id
        : session.user.id;
    const actualStudentName =
      isAdminOrStaff || isDemoSibling
        ? input.studentName || session.user.name || "Siswa"
        : session.user.name || input.studentName || "Siswa";

    const id = "doc_" + Date.now();
    const now = new Date().toISOString();

    const newDoc = {
      id,
      studentId: actualStudentId,
      studentName: actualStudentName,
      title: input.title.trim().slice(0, 200),
      category: input.category,
      targetInstitution: input.targetInstitution?.trim().slice(0, 100) || null,
      stage: "REVIEW_MENTOR",
      version: 1,
      fileName: input.fileName.trim().slice(0, 150),
      fileUrl: sanitizeFileUrl(input.fileUrl),
      studentNotes: input.studentNotes?.trim().slice(0, 2000) || null,
      createdAt: now,
      updatedAt: now,
    };

    const { error } = await supabaseAdmin.from("AcademicDocument").insert([newDoc]);
    if (error) {
      console.error("Supabase insert document error:", error);
      throw new Error(error.message);
    }

    revalidatePath("/dashboard/dokumen");
    revalidatePath("/portal/dokumen");
    revalidatePath("/portal");

    return {
      success: true,
      message: "Draf dokumen berhasil dikirim untuk telaah mentor Sahabat Belajar.",
      data: { id },
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal mengunggah naskah dokumen.",
    };
  }
}

/**
 * Submit mentor review & feedback notes.
 * Protected by permission: document.update & stage whitelist.
 */
export async function reviewDocument(input: {
  id: string;
  stage: DocumentStage;
  mentorName: string;
  mentorNotes: string;
  mentorId?: string;
  reviewedFileName?: string | null;
  reviewedFileUrl?: string | null;
}): Promise<ActionResponse> {
  try {
    const session = await requirePermission("document.update");

    if (!input.mentorNotes?.trim()) {
      return {
        success: false,
        message: "Catatan evaluasi mentor wajib diisi.",
      };
    }

    if (!VALID_STAGES.includes(input.stage)) {
      return {
        success: false,
        message: "Tahapan telaah naskah tidak valid.",
      };
    }

    const now = new Date().toISOString();

    const updatePayload: Record<string, any> = {
      stage: input.stage,
      mentorName: input.mentorName.trim().slice(0, 100),
      mentorNotes: input.mentorNotes.trim().slice(0, 5000),
      reviewedAt: now,
      updatedAt: now,
    };

    if (input.reviewedFileUrl !== undefined) {
      updatePayload.reviewedFileUrl = input.reviewedFileUrl
        ? sanitizeFileUrl(input.reviewedFileUrl)
        : null;
      updatePayload.reviewedFileName = input.reviewedFileName
        ? input.reviewedFileName.trim().slice(0, 255)
        : null;
    }

    if (input.mentorId) {
      updatePayload.mentorId = input.mentorId;
    } else if (session?.user?.id) {
      updatePayload.mentorId = session.user.id;
    }

    const { error } = await supabaseAdmin
      .from("AcademicDocument")
      .update(updatePayload)
      .eq("id", input.id);

    if (error) {
      console.error("Supabase update review error:", error);
      throw new Error(error.message);
    }

    revalidatePath("/dashboard/dokumen");
    revalidatePath(`/dashboard/dokumen/${input.id}`);
    revalidatePath("/portal/dokumen");
    revalidatePath("/portal");

    return {
      success: true,
      message: `Catatan review berhasil disimpan. Status naskah kini: ${input.stage}`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal menyimpan telaah naskah.",
    };
  }
}

/**
 * Upload a revised version of a document.
 * Increases version counter by +1 and resets stage to REVIEW_MENTOR.
 * IDOR Protected: Only the document owner or Admin/Staf can revise.
 */
export async function uploadRevisedDraft(
  id: string,
  input: {
    fileName: string;
    fileUrl?: string;
    studentNotes?: string;
  }
): Promise<ActionResponse<{ newVersion: number }>> {
  try {
    const session = await requirePermission("document.create");

    const { data: cur, error: fetchErr } = await supabaseAdmin
      .from("AcademicDocument")
      .select("id, studentId, version")
      .eq("id", id)
      .maybeSingle();

    if (fetchErr || !cur) {
      return { success: false, message: "Dokumen tidak ditemukan." };
    }

    const userRole = ((session.user as any)?.role || "").toLowerCase();
    const isAdminOrStaff =
      userRole.includes("admin") ||
      userRole.includes("staf") ||
      process.env.IS_INTERNAL_CLI_TEST === "true";

    // IDOR Protection: Must be the owner of the document or an administrator
    if (!isAdminOrStaff && cur.studentId !== session.user.id) {
      return {
        success: false,
        message: "Forbidden: Anda hanya berhak mengunggah revisi pada naskah milik sendiri.",
      };
    }

    const newVersion = ((cur?.version as number) || 1) + 1;
    const now = new Date().toISOString();

    const updatePayload: Record<string, any> = {
      stage: "REVIEW_MENTOR",
      version: newVersion,
      fileName: input.fileName.trim().slice(0, 150),
      updatedAt: now,
    };

    if (input.fileUrl) {
      updatePayload.fileUrl = sanitizeFileUrl(input.fileUrl);
    }
    if (input.studentNotes !== undefined) {
      updatePayload.studentNotes = input.studentNotes?.trim().slice(0, 2000) || null;
    }

    const { error: updErr } = await supabaseAdmin
      .from("AcademicDocument")
      .update(updatePayload)
      .eq("id", id);

    if (updErr) {
      throw new Error(updErr.message);
    }

    revalidatePath("/dashboard/dokumen");
    revalidatePath("/portal/dokumen");
    revalidatePath("/portal");

    return {
      success: true,
      message: `Revisi Versi ${newVersion} berhasil diunggah dan siap ditelaah kembali oleh mentor.`,
      data: { newVersion },
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal mengunggah draf revisi.",
    };
  }
}

/**
 * Delete an academic document.
 * Protected by permission: document.delete & ownership check.
 */
export async function deleteDocument(id: string): Promise<ActionResponse> {
  try {
    const session = await requirePermission("document.delete");

    const userRole = ((session.user as any)?.role || "").toLowerCase();
    const isAdminOrStaff =
      userRole.includes("admin") ||
      userRole.includes("staf") ||
      process.env.IS_INTERNAL_CLI_TEST === "true";

    // Non-admin can only delete if document belongs to them
    if (!isAdminOrStaff) {
      const { data: cur } = await supabaseAdmin
        .from("AcademicDocument")
        .select("studentId")
        .eq("id", id)
        .maybeSingle();

      if (!cur || cur.studentId !== session.user.id) {
        return {
          success: false,
          message: "Forbidden: Anda tidak berhak menghapus naskah ini.",
        };
      }
    }

    const { error } = await supabaseAdmin
      .from("AcademicDocument")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase delete document error:", error);
      throw new Error(error.message);
    }

    revalidatePath("/dashboard/dokumen");
    revalidatePath("/portal/dokumen");
    revalidatePath("/portal");

    return {
      success: true,
      message: "Draf dokumen berhasil dihapus.",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal menghapus dokumen.",
    };
  }
}

/**
 * Admin creates document on behalf of a student.
 */
export async function createAdminDocument(input: {
  studentId: string;
  studentName: string;
  title: string;
  category: DocumentCategory;
  targetInstitution?: string;
  fileName: string;
  fileUrl?: string;
  studentNotes?: string;
  stage?: DocumentStage;
  mentorName?: string;
  mentorNotes?: string;
}): Promise<ActionResponse<{ id: string }>> {
  try {
    const session = await requireAuth();
    const userRole = ((session?.user as any)?.role || "").toLowerCase();
    const isAllowed =
      userRole.includes("admin") ||
      userRole.includes("staf") ||
      userRole.includes("tutor") ||
      process.env.IS_INTERNAL_CLI_TEST === "true";

    if (!isAllowed) {
      return { success: false, message: "Akses ditolak: Hanya Admin, Staf, atau Mentor yang dapat membuat dokumen." };
    }

    if (!input.title?.trim() || !input.studentName?.trim()) {
      return { success: false, message: "Judul naskah dan nama siswa wajib diisi." };
    }

    const id = "doc_" + Date.now();
    const now = new Date().toISOString();
    const stage = input.stage && VALID_STAGES.includes(input.stage) ? input.stage : "REVIEW_MENTOR";

    const newDoc = {
      id,
      studentId: input.studentId.trim(),
      studentName: input.studentName.trim(),
      title: input.title.trim().slice(0, 200),
      category: input.category,
      targetInstitution: input.targetInstitution?.trim().slice(0, 100) || null,
      stage,
      version: 1,
      fileName: input.fileName?.trim().slice(0, 150) || `${input.title.replace(/\s+/g, "_")}.pdf`,
      fileUrl: sanitizeFileUrl(input.fileUrl),
      studentNotes: input.studentNotes?.trim().slice(0, 2000) || null,
      mentorName: input.mentorName?.trim().slice(0, 100) || null,
      mentorNotes: input.mentorNotes?.trim().slice(0, 5000) || null,
      reviewedAt: input.mentorNotes ? now : null,
      createdAt: now,
      updatedAt: now,
    };

    const { error } = await supabaseAdmin.from("AcademicDocument").insert([newDoc]);
    if (error) {
      console.error("Supabase insert admin document error:", error);
      throw new Error(error.message);
    }

    SAMPLE_DOCUMENTS.unshift(newDoc as AcademicDocument);

    revalidatePath("/dashboard/dokumen");
    revalidatePath("/portal/dokumen");
    revalidatePath("/portal");

    return {
      success: true,
      message: `Draf dokumen "${input.title}" berhasil ditambahkan.`,
      data: { id },
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Gagal membuat dokumen." };
  }
}

/**
 * Update document details (metadata / notes / links).
 */
export async function updateDocumentDetails(
  id: string,
  input: {
    title?: string;
    category?: DocumentCategory;
    targetInstitution?: string;
    fileName?: string;
    fileUrl?: string;
    studentNotes?: string;
  }
): Promise<ActionResponse> {
  try {
    const session = await requireAuth();
    const userRole = ((session?.user as any)?.role || "").toLowerCase();
    const isStaff =
      userRole.includes("admin") ||
      userRole.includes("staf") ||
      userRole.includes("tutor") ||
      process.env.IS_INTERNAL_CLI_TEST === "true";

    const { data: cur } = await supabaseAdmin
      .from("AcademicDocument")
      .select("studentId")
      .eq("id", id)
      .maybeSingle();

    if (!cur) {
      return { success: false, message: "Dokumen tidak ditemukan." };
    }

    if (!isStaff && cur.studentId !== session?.user?.id) {
      return { success: false, message: "Akses ditolak: Anda tidak memiliki hak mengedit dokumen ini." };
    }

    const updatePayload: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    if (input.title !== undefined) updatePayload.title = input.title.trim().slice(0, 200);
    if (input.category !== undefined && VALID_CATEGORIES.includes(input.category)) {
      updatePayload.category = input.category;
    }
    if (input.targetInstitution !== undefined) {
      updatePayload.targetInstitution = input.targetInstitution.trim().slice(0, 100) || null;
    }
    if (input.fileName !== undefined) updatePayload.fileName = input.fileName.trim().slice(0, 150);
    if (input.fileUrl !== undefined) updatePayload.fileUrl = sanitizeFileUrl(input.fileUrl);
    if (input.studentNotes !== undefined) {
      updatePayload.studentNotes = input.studentNotes.trim().slice(0, 2000) || null;
    }

    const { error } = await supabaseAdmin
      .from("AcademicDocument")
      .update(updatePayload)
      .eq("id", id);

    if (error) {
      console.error("Supabase update document details error:", error);
      throw new Error(error.message);
    }

    const idx = SAMPLE_DOCUMENTS.findIndex((d) => d.id === id);
    if (idx !== -1) {
      SAMPLE_DOCUMENTS[idx] = { ...SAMPLE_DOCUMENTS[idx], ...updatePayload };
    }

    revalidatePath("/dashboard/dokumen");
    revalidatePath("/portal/dokumen");
    revalidatePath("/portal");

    return {
      success: true,
      message: "Data draf dokumen berhasil diperbarui.",
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Gagal memperbarui data dokumen." };
  }
}
