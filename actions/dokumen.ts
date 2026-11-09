"use server";

import { supabaseAdmin } from "@/lib/supabase";
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
    fileUrl: "/docs/sample-esai-lpdp.pdf",
    studentNotes: "Mohon masukan terkait alur urgensi masalah stunting di bab latar belakang serta relevansi rencana studi dengan rencana kontribusi pasca kampus.",
    mentorId: "tut_maya_01",
    mentorName: "Drg. Maya Novitasari / Mentor Akademik",
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
    fileUrl: "/docs/sample-proposal-tesis.pdf",
    studentNotes: "Sudah diperbaiki sesuai catatan perumusan masalah dan novelty metodologi.",
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
    fileName: "MEXT_Personal_Statement_Kevin_Draft.docx",
    fileUrl: "/docs/sample-motivation-letter.docx",
    studentNotes: "Apakah tone bahasa Inggris academic writing sudah cukup formal untuk standar universitas Jepang?",
    mentorId: "tut_sarah_01",
    mentorName: "Sarah Amalia, S.Pd. (TOEFL/IELTS Specialist)",
    mentorNotes: "Paragraf pembuka sangat menarik, namun ada beberapa phrasing yang terlalu informal pada bagian motivasi pemilihan laboratorium riset. Silakan cek catatan revisi inline.",
    reviewedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

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
    return SAMPLE_DOCUMENTS;
  }
}

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
    const id = "doc_" + Date.now();
    const now = new Date().toISOString();

    const newDoc: AcademicDocument = {
      id,
      studentId: input.studentId,
      studentName: input.studentName,
      title: input.title,
      category: input.category,
      targetInstitution: input.targetInstitution || null,
      stage: "REVIEW_MENTOR",
      version: 1,
      fileName: input.fileName,
      fileUrl: input.fileUrl || "/docs/sample-uploaded.pdf",
      studentNotes: input.studentNotes || null,
      createdAt: now,
      updatedAt: now,
    };

    SAMPLE_DOCUMENTS.unshift(newDoc);

    try {
      await supabaseAdmin.from("AcademicDocument").insert([newDoc]);
    } catch (e) {
      console.warn("Supabase insert document warning:", e);
    }

    revalidatePath("/dashboard/dokumen");
    revalidatePath("/portal/dokumen");
    revalidatePath("/portal");

    return {
      success: true,
      message: "Draf dokumen berhasil dikirim untuk review mentor Sahabat Belajar.",
      data: { id },
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Gagal mengunggah dokumen" };
  }
}

export async function reviewDocument(input: {
  id: string;
  stage: DocumentStage;
  mentorName: string;
  mentorNotes: string;
}): Promise<ActionResponse> {
  try {
    const now = new Date().toISOString();

    const idx = SAMPLE_DOCUMENTS.findIndex((d) => d.id === input.id);
    if (idx !== -1) {
      SAMPLE_DOCUMENTS[idx] = {
        ...SAMPLE_DOCUMENTS[idx],
        stage: input.stage,
        mentorName: input.mentorName,
        mentorNotes: input.mentorNotes,
        reviewedAt: now,
        updatedAt: now,
        version: input.stage === "REVISI" ? SAMPLE_DOCUMENTS[idx].version + 1 : SAMPLE_DOCUMENTS[idx].version,
      };
    }

    try {
      await supabaseAdmin
        .from("AcademicDocument")
        .update({
          stage: input.stage,
          mentorName: input.mentorName,
          mentorNotes: input.mentorNotes,
          reviewedAt: now,
          updatedAt: now,
        })
        .eq("id", input.id);
    } catch (e) {
      console.warn("Supabase update review warning:", e);
    }

    revalidatePath("/dashboard/dokumen");
    revalidatePath(`/dashboard/dokumen/${input.id}`);
    revalidatePath("/portal/dokumen");

    return {
      success: true,
      message: `Catatan review berhasil disimpan. Status dokumen: ${input.stage}`,
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Gagal menyimpan review dokumen" };
  }
}
