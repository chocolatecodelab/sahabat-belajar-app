"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { requirePermission } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/types";

export type ProgramCategory =
  | "ALL"
  | "K12"
  | "CPNS_BUMN"
  | "UTBK_SNBT"
  | "TOEFL_IELTS"
  | "S2_BEASISWA"
  | "PENULISAN_ILMIAH";

export interface LearningMaterial {
  id: string;
  title: string;
  programCategory: "K12" | "CPNS_BUMN" | "UTBK_SNBT" | "TOEFL_IELTS" | "S2_BEASISWA" | "PENULISAN_ILMIAH";
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

const VALID_PROGRAM_CATEGORIES: ProgramCategory[] = [
  "K12",
  "CPNS_BUMN",
  "UTBK_SNBT",
  "TOEFL_IELTS",
  "S2_BEASISWA",
  "PENULISAN_ILMIAH",
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

const SAMPLE_FALLBACK_MATERIALS: LearningMaterial[] = [
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
  {
    id: "mat_k12_01",
    title: "Intisari Konsep & Bedah Soal Matematika Wajib & Fisika SMA (Fase F)",
    programCategory: "K12",
    subject: "Matematika & Fisika SMA",
    description: "Ringkasan konsep integral kalkulus, trigonometri analitis, dan dinamika rotasi sesuai Kurikulum Merdeka.",
    fileUrl: "/materials/k12-matematika-fisika-sma.pdf",
    fileName: "Intisari_Konsep_MIPA_SMA_FaseF.pdf",
    fileSize: "3.5 MB",
    authorTutor: "Tim Tutor Sains SMA Sahabat Belajar",
    downloadCount: 167,
    isPublished: true,
    createdAt: new Date(Date.now() - 86400000 * 22).toISOString(),
  },
  {
    id: "mat_ilmiah_01",
    title: "Panduan Praktis Kepenulisan Artikel Ilmiah: Sistematika IMRAD, Parafrase Anti-Plagiarisme & Mendeley",
    programCategory: "PENULISAN_ILMIAH",
    subject: "Metodologi & Publikasi Ilmiah",
    description: "Pedoman penyusunan manuskrip ilmiah berstandar SINTA dan Scopus, teknik sitasi otomatis dengan Mendeley/Zotero, serta strategi lolos uji turnitin.",
    fileUrl: "/materials/panduan-kepenulisan-ilmiah.pdf",
    fileName: "Panduan_Kepenulisan_Artikel_Ilmiah_SahabatBelajar.pdf",
    fileSize: "3.8 MB",
    authorTutor: "Tim Reviewer & Mentor Riset Sahabat Belajar",
    downloadCount: 142,
    isPublished: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "mat_k12_smp_01",
    title: "Pocket Book Rumus Cepat Matematika & IPA Terpadu SMP (Fase D Kurikulum Merdeka)",
    programCategory: "K12",
    subject: "MIPA SMP",
    description: "Rangkuman konsep esensial aljabar, phytagoras, statistika, hukum newton, dan kelistrikan untuk persiapan asesmen sumatif & olimpiade sains.",
    fileUrl: "/materials/pocket-book-mipa-smp.pdf",
    fileName: "Pocket_Book_MIPA_SMP_FaseD.pdf",
    fileSize: "2.1 MB",
    authorTutor: "Tim Tutor MIPA Sahabat Belajar",
    downloadCount: 218,
    isPublished: true,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
];

/**
 * Fetch learning materials from Supabase LearningMaterial table.
 */
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
        return SAMPLE_FALLBACK_MATERIALS.filter((m) => m.programCategory === category);
      }
      return SAMPLE_FALLBACK_MATERIALS;
    }

    return data as LearningMaterial[];
  } catch (err) {
    console.error("getLearningMaterials error:", err);
    if (category && category !== "ALL") {
      return SAMPLE_FALLBACK_MATERIALS.filter((m) => m.programCategory === category);
    }
    return SAMPLE_FALLBACK_MATERIALS;
  }
}

/**
 * Create a new learning material in database (Enforces material.create).
 */
export async function createLearningMaterial(input: {
  title: string;
  programCategory: "K12" | "CPNS_BUMN" | "UTBK_SNBT" | "TOEFL_IELTS" | "S2_BEASISWA" | "PENULISAN_ILMIAH";
  subject: string;
  description?: string;
  fileUrl?: string;
  fileName: string;
  fileSize?: string;
  authorTutor?: string;
}): Promise<ActionResponse<{ id: string }>> {
  try {
    await requirePermission("material.create");

    if (!input.title?.trim() || !input.subject?.trim()) {
      return {
        success: false,
        message: "Judul modul dan mata pelajaran wajib diisi.",
      };
    }

    if (!VALID_PROGRAM_CATEGORIES.includes(input.programCategory)) {
      return {
        success: false,
        message: "Kategori program belajar tidak valid.",
      };
    }

    const id = "mat_" + Date.now();
    const newMat = {
      id,
      title: input.title.trim().slice(0, 200),
      programCategory: input.programCategory,
      subject: input.subject.trim().slice(0, 100),
      description: input.description?.trim().slice(0, 2000) || null,
      fileUrl: sanitizeFileUrl(input.fileUrl),
      fileName: input.fileName.trim().slice(0, 150) || `${input.title.replace(/\s+/g, "_")}.pdf`,
      fileSize: input.fileSize?.slice(0, 20) || "2.0 MB",
      authorTutor: input.authorTutor?.trim().slice(0, 100) || "Tim Akademik Sahabat Belajar",
      downloadCount: 0,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { error } = await supabaseAdmin.from("LearningMaterial").insert([newMat]);
    if (error) {
      console.error("Supabase insert material error:", error);
      throw new Error(error.message);
    }

    revalidatePath("/dashboard/materi");
    revalidatePath("/portal");

    return {
      success: true,
      message: "Modul pembelajaran berhasil ditambahkan ke bank materi digital.",
      data: { id },
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal membuat modul materi pembelajaran.",
    };
  }
}

/**
 * Update an existing learning material in database (Enforces material.update).
 */
export async function updateLearningMaterial(
  id: string,
  input: {
    title?: string;
    programCategory?: "K12" | "CPNS_BUMN" | "UTBK_SNBT" | "TOEFL_IELTS" | "S2_BEASISWA" | "PENULISAN_ILMIAH";
    subject?: string;
    description?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: string;
    authorTutor?: string;
    isPublished?: boolean;
  }
): Promise<ActionResponse> {
  try {
    await requirePermission("material.update");

    const updatePayload: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    if (input.title !== undefined) updatePayload.title = input.title.trim().slice(0, 200);
    if (input.programCategory !== undefined) {
      if (!VALID_PROGRAM_CATEGORIES.includes(input.programCategory)) {
        return { success: false, message: "Kategori program tidak valid." };
      }
      updatePayload.programCategory = input.programCategory;
    }
    if (input.subject !== undefined) updatePayload.subject = input.subject.trim().slice(0, 100);
    if (input.description !== undefined) updatePayload.description = input.description?.trim().slice(0, 2000) || null;
    if (input.fileUrl !== undefined) updatePayload.fileUrl = sanitizeFileUrl(input.fileUrl);
    if (input.fileName !== undefined) updatePayload.fileName = input.fileName.trim().slice(0, 150);
    if (input.fileSize !== undefined) updatePayload.fileSize = input.fileSize.slice(0, 20);
    if (input.authorTutor !== undefined) updatePayload.authorTutor = input.authorTutor.trim().slice(0, 100);
    if (input.isPublished !== undefined) updatePayload.isPublished = Boolean(input.isPublished);

    const { error } = await supabaseAdmin
      .from("LearningMaterial")
      .update(updatePayload)
      .eq("id", id);

    if (error) {
      console.error("Supabase update material error:", error);
      throw new Error(error.message);
    }

    revalidatePath("/dashboard/materi");
    revalidatePath("/portal");

    return {
      success: true,
      message: "Modul pembelajaran berhasil diperbarui.",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal memperbarui modul pembelajaran.",
    };
  }
}

/**
 * Delete a learning material from database (Enforces material.delete).
 */
export async function deleteLearningMaterial(id: string): Promise<ActionResponse> {
  try {
    await requirePermission("material.delete");

    const { error } = await supabaseAdmin.from("LearningMaterial").delete().eq("id", id);
    if (error) {
      console.error("Supabase delete material error:", error);
      throw new Error(error.message);
    }

    revalidatePath("/dashboard/materi");
    revalidatePath("/portal");

    return {
      success: true,
      message: "Modul pembelajaran berhasil dihapus dari bank materi digital.",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal menghapus modul pembelajaran.",
    };
  }
}

/**
 * Track download of a learning material (increments downloadCount by 1).
 * Safe to be invoked by students and visitors.
 */
export async function trackMaterialDownload(
  id: string
): Promise<ActionResponse<{ downloadCount: number }>> {
  try {
    if (!id || typeof id !== "string") {
      return { success: false, message: "ID materi tidak valid." };
    }

    const { data: cur, error: fetchErr } = await supabaseAdmin
      .from("LearningMaterial")
      .select("id, downloadCount")
      .eq("id", id)
      .maybeSingle();

    if (fetchErr || !cur) {
      return { success: false, message: "Modul materi tidak ditemukan." };
    }

    const newCount = ((cur?.downloadCount as number) || 0) + 1;

    const { error: updErr } = await supabaseAdmin
      .from("LearningMaterial")
      .update({
        downloadCount: newCount,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", id);

    if (updErr) {
      console.warn("trackMaterialDownload update error:", updErr);
    }

    revalidatePath("/dashboard/materi");
    revalidatePath("/portal");

    return {
      success: true,
      message: "Unduhan berhasil dicatat.",
      data: { downloadCount: newCount },
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Gagal mencatat unduhan.",
    };
  }
}
