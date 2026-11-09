"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/types";

export type ProgramCategory =
  | "ALL"
  | "K12"
  | "CPNS_BUMN"
  | "UTBK_SNBT"
  | "TOEFL_IELTS"
  | "S2_BEASISWA";

export interface LearningMaterial {
  id: string;
  title: string;
  programCategory: "K12" | "CPNS_BUMN" | "UTBK_SNBT" | "TOEFL_IELTS" | "S2_BEASISWA";
  subject: string;
  description?: string | null;
  fileUrl: string;
  fileName: string;
  fileSize: string;
  authorTutor: string;
  downloadCount: number;
  isPublished: boolean;
  createdAt: string;
}

const SAMPLE_MATERIALS: LearningMaterial[] = [
  {
    id: "mat_cpns_01",
    title: "Modul Ringkasan Rumus Cepat TIU: Aritmatika, Deret & Silogisme",
    programCategory: "CPNS_BUMN",
    subject: "Tes Intelegensia Umum (TIU)",
    description: "Kumpulan metode penalaran logis dan trik numerik cepat untuk menyelesaikan soal TIU di bawah 45 detik per butir.",
    fileUrl: "/materials/modul-tiu-cpns-sahabat-belajar.pdf",
    fileName: "Modul_TIU_Rumus_Cepat_2026.pdf",
    fileSize: "2.4 MB",
    authorTutor: "Tim Tutor Sains & Matematika Sahabat Belajar",
    downloadCount: 342,
    isPublished: true,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "mat_cpns_02",
    title: "Pocket Book TWK: Intisari UUD 1945, Pilar Negara & Sejarah Kebangsaan",
    programCategory: "CPNS_BUMN",
    subject: "Tes Wawasan Kebangsaan (TWK)",
    description: "Pemetaan konsep dasar amandemen UUD NRI 1945, butir pengamalan Pancasila, dan penalaran studi kasus bela negara.",
    fileUrl: "/materials/pocket-book-twk-sahabat-belajar.pdf",
    fileName: "Pocket_Book_TWK_Nasionalisme.pdf",
    fileSize: "1.8 MB",
    authorTutor: "Hendra Wijaya, M.Pd.",
    downloadCount: 512,
    isPublished: true,
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
  {
    id: "mat_toefl_01",
    title: "Mastering Structure & Written Expression: 60 Common Traps in TOEFL ITP",
    programCategory: "TOEFL_IELTS",
    subject: "Structure & Grammar",
    description: "Pembahasan tuntas jebakan subject-verb agreement, parallel structure, inverted sentence, and clause connectors.",
    fileUrl: "/materials/toefl-structure-mastery.pdf",
    fileName: "TOEFL_ITP_Structure_Mastery_SahabatBelajar.pdf",
    fileSize: "3.1 MB",
    authorTutor: "Sarah Amalia, S.Pd.",
    downloadCount: 289,
    isPublished: true,
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
  },
  {
    id: "mat_snbt_01",
    title: "Bedah Tuntas Penalaran Matematika & Literasi Kuantitatif UTBK-SNBT",
    programCategory: "UTBK_SNBT",
    subject: "Tes Potensi Skolastik (TPS)",
    description: "Pendekatan konseptual pemecahan soal statistika, peluang, geometri bidang, dan aljabar analitis berstandar BPPP.",
    fileUrl: "/materials/tps-penalaran-matematika-snbt.pdf",
    fileName: "TPS_Penalaran_Matematika_SNBT_2026.pdf",
    fileSize: "2.9 MB",
    authorTutor: "Ahmad Fauzi & Tim Sains",
    downloadCount: 420,
    isPublished: true,
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
  {
    id: "mat_s2_01",
    title: "Comprehensive Guide: Penulisan Proposal Riset Tesis & Esai Beasiswa Luar Negeri",
    programCategory: "S2_BEASISWA",
    subject: "Academic Writing & Research",
    description: "Panduan praktis perumusan Research Gap, State of the Art, Novelty, serta struktur Personal Statement standar LPDP / Chevening / AAS.",
    fileUrl: "/materials/panduan-proposal-tesis-beasiswa.pdf",
    fileName: "Panduan_Esai_Proposal_Beasiswa_S2.pdf",
    fileSize: "4.2 MB",
    authorTutor: "Dr. Hendra Wijaya & Tim Mentor Akademik",
    downloadCount: 195,
    isPublished: true,
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
];

export async function getLearningMaterials(
  category?: string
): Promise<LearningMaterial[]> {
  try {
    let query = supabaseAdmin
      .from("LearningMaterial")
      .select("*")
      .order("createdAt", { ascending: false });

    if (category && category !== "ALL") {
      query = query.eq("programCategory", category);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      if (category && category !== "ALL") {
        return SAMPLE_MATERIALS.filter((m) => m.programCategory === category);
      }
      return SAMPLE_MATERIALS;
    }

    return data as LearningMaterial[];
  } catch (err) {
    console.error("getLearningMaterials error:", err);
    return SAMPLE_MATERIALS;
  }
}

export async function createLearningMaterial(input: {
  title: string;
  programCategory: "K12" | "CPNS_BUMN" | "UTBK_SNBT" | "TOEFL_IELTS" | "S2_BEASISWA";
  subject: string;
  description?: string;
  fileUrl?: string;
  fileName: string;
  fileSize?: string;
  authorTutor?: string;
}): Promise<ActionResponse<{ id: string }>> {
  try {
    const id = "mat_" + Date.now();
    const newMat: LearningMaterial = {
      id,
      title: input.title,
      programCategory: input.programCategory,
      subject: input.subject,
      description: input.description || null,
      fileUrl: input.fileUrl || "/materials/sample-document.pdf",
      fileName: input.fileName,
      fileSize: input.fileSize || "2.0 MB",
      authorTutor: input.authorTutor || "Tim Akademik Sahabat Belajar",
      downloadCount: 0,
      isPublished: true,
      createdAt: new Date().toISOString(),
    };

    SAMPLE_MATERIALS.unshift(newMat);

    try {
      await supabaseAdmin.from("LearningMaterial").insert([newMat]);
    } catch (e) {
      console.warn("Supabase insert material warning:", e);
    }

    revalidatePath("/dashboard/materi");
    revalidatePath("/portal");

    return {
      success: true,
      message: "Modul pembelajaran berhasil ditambahkan ke bank materi digital.",
      data: { id },
    };
  } catch (error: any) {
    return { success: false, message: error.message || "Gagal membuat modul materi" };
  }
}

export async function deleteLearningMaterial(id: string): Promise<ActionResponse> {
  try {
    const idx = SAMPLE_MATERIALS.findIndex((m) => m.id === id);
    if (idx !== -1) {
      SAMPLE_MATERIALS.splice(idx, 1);
    }

    try {
      await supabaseAdmin.from("LearningMaterial").delete().eq("id", id);
    } catch (e) {
      console.warn("Supabase delete material warning:", e);
    }

    revalidatePath("/dashboard/materi");
    revalidatePath("/portal");

    return { success: true, message: "Modul berhasil dihapus" };
  } catch (error: any) {
    return { success: false, message: error.message || "Gagal menghapus modul" };
  }
}
