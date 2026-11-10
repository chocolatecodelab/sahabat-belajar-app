"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { requirePermission } from "@/lib/auth";
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
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

const SAMPLE_DOCUMENTS: AcademicDocument[] = [
  {
    id: "doc_lpdp_01",
    studentId: "std_demo_01",
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
    studentId: "std_demo_03",
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
    studentId: "std_demo_01",
    studentName: "Ahmad Fauzi",
    title: "Draf Skripsi Bab 1-3: Analisis Komparasi Kinerja Algoritma Klasifikasi Data Mining",
    category: "SKRIPSI_KTI",
    targetInstitution: "Universitas Indonesia",
    stage: "REVIEW_MENTOR",
    version: 1,
    fileName: "Draf_Skripsi_Bab1_3_Ahmad_Fauzi.pdf",
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
 * Fetch academic documents with filtering support.
 */
export async function getDocuments(params?: {
  studentId?: string;
  stage?: string;
  category?: string;
}): Promise<AcademicDocument[]> {
  try {
    let query = supabaseAdmin
      .from("AcademicDocument")
      .select("*")
      .order("updatedAt", { ascending: false });

    if (params?.studentId) {
      query = query.eq("studentId", params.studentId);
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
      if (params?.studentId) {
        filtered = filtered.filter((d) => d.studentId === params.studentId);
      }
      if (params?.stage && params.stage !== "ALL") {
        filtered = filtered.filter((d) => d.stage === params.stage);
      }
      if (params?.category && params.category !== "ALL") {
        filtered = filtered.filter((d) => d.category === params.category);
      }
      return filtered;
    }

    return data as AcademicDocument[];
  } catch (err) {
    console.error("getDocuments error:", err);
    let filtered = [...SAMPLE_DOCUMENTS];
    if (params?.studentId) {
      filtered = filtered.filter((d) => d.studentId === params.studentId);
    }
    return filtered;
  }
}

/**
 * Get single document by ID.
 */
export async function getDocumentById(id: string): Promise<AcademicDocument | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("AcademicDocument")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!error && data) {
      return data as AcademicDocument;
    }
    return SAMPLE_DOCUMENTS.find((d) => d.id === id) || null;
  } catch (err) {
    console.error("getDocumentById error:", err);
    return SAMPLE_DOCUMENTS.find((d) => d.id === id) || null;
  }
}

/**
 * Submit a new student document draft for mentor review.
 * Protected by permission: document.create
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
    await requirePermission("document.create");

    if (!input.title?.trim() || !input.fileName?.trim()) {
      return {
        success: false,
        message: "Judul naskah dan nama file dokumen wajib diisi.",
      };
    }

    const id = "doc_" + Date.now();
    const now = new Date().toISOString();

    const newDoc = {
      id,
      studentId: input.studentId,
      studentName: input.studentName,
      title: input.title.trim(),
      category: input.category,
      targetInstitution: input.targetInstitution?.trim() || null,
      stage: "REVIEW_MENTOR",
      version: 1,
      fileName: input.fileName.trim(),
      fileUrl: input.fileUrl || "/materials/sample-document.pdf",
      studentNotes: input.studentNotes?.trim() || null,
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
 * Protected by permission: document.update
 */
export async function reviewDocument(input: {
  id: string;
  stage: DocumentStage;
  mentorName: string;
  mentorNotes: string;
  mentorId?: string;
}): Promise<ActionResponse> {
  try {
    await requirePermission("document.update");

    if (!input.mentorNotes?.trim()) {
      return {
        success: false,
        message: "Catatan evaluasi mentor wajib diisi.",
      };
    }

    const now = new Date().toISOString();

    const updatePayload: Record<string, any> = {
      stage: input.stage,
      mentorName: input.mentorName.trim(),
      mentorNotes: input.mentorNotes.trim(),
      reviewedAt: now,
      updatedAt: now,
    };

    if (input.mentorId) {
      updatePayload.mentorId = input.mentorId;
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
 * Protected by permission: document.create
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
    await requirePermission("document.create");

    const { data: cur, error: fetchErr } = await supabaseAdmin
      .from("AcademicDocument")
      .select("version")
      .eq("id", id)
      .maybeSingle();

    if (fetchErr) {
      console.warn("Fetch document for revision warning:", fetchErr);
    }

    const newVersion = ((cur?.version as number) || 1) + 1;
    const now = new Date().toISOString();

    const updatePayload: Record<string, any> = {
      stage: "REVIEW_MENTOR",
      version: newVersion,
      fileName: input.fileName.trim(),
      updatedAt: now,
    };

    if (input.fileUrl) {
      updatePayload.fileUrl = input.fileUrl;
    }
    if (input.studentNotes !== undefined) {
      updatePayload.studentNotes = input.studentNotes?.trim() || null;
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
 * Protected by permission: document.delete
 */
export async function deleteDocument(id: string): Promise<ActionResponse> {
  try {
    await requirePermission("document.delete");

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
