"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { ActionResponse } from "@/types";
import { revalidatePath } from "next/cache";
import { PackageType } from "@prisma/client";

export async function getPrograms() {
  try {
    const { data: programs, error } = await supabaseAdmin
      .from("Program")
      .select("*, packages:Package(*)")
      .eq("isActive", true)
      .order("sortOrder", { ascending: true });

    if (error) throw error;
    if (!programs || programs.length === 0) {
      return [
        { id: "prog_01", name: "Persiapan CPNS & BUMN", category: "CPNS_BUMN", description: "Bimbingan intensif SKD (TWK, TIU, TKP) dan tes BUMN", sortOrder: 1, isActive: true, packages: [] },
        { id: "prog_02", name: "Bimbel K-12 (SD/SMP/SMA)", category: "K12", description: "Pendampingan kurikulum merdeka dan persiapan ujian harian/semester", sortOrder: 2, isActive: true, packages: [] },
        { id: "prog_03", name: "UTBK-SNBT Masuk PTN", category: "K12", description: "Penalaran matematika, literasi bahasa, dan skolastik", sortOrder: 3, isActive: true, packages: [] },
        { id: "prog_04", name: "TOEFL / IELTS Preparation", category: "TOEFL_IELTS", description: "Target skor 500-600+ untuk persyaratan kelulusan & beasiswa", sortOrder: 4, isActive: true, packages: [] },
        { id: "prog_05", name: "Bimbingan S2/S3 & Beasiswa", category: "S2_S3_BEASISWA", description: "Mentoring esai, proposal riset, dan wawancara LPDP/AAS", sortOrder: 5, isActive: true, packages: [] },
      ];
    }
    return programs;
  } catch (error) {
    console.error("getPrograms error:", error);
    return [];
  }
}

export async function createProgram(data: {
  name: string;
  category: string;
  description?: string;
  sortOrder?: number;
}): Promise<ActionResponse<{ id: string }>> {
  try {
    const { data: program, error } = await supabaseAdmin
      .from("Program")
      .insert({
        name: data.name.trim(),
        category: data.category,
        description: data.description || null,
        sortOrder: data.sortOrder || 0,
        updatedAt: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) throw error;

    revalidatePath("/dashboard/paket");
    return {
      success: true,
      message: "Program berhasil dibuat.",
      data: { id: program.id },
    };
  } catch (error: any) {
    return { success: false, message: "Gagal membuat program." };
  }
}

export async function createPackage(data: {
  programId?: string;
  name: string;
  type: PackageType;
  durationMonths?: number;
  quotaSessions?: number;
  sessionMinutes?: number;
  price?: number;
}): Promise<ActionResponse<{ id: string }>> {
  try {
    const { data: pkg, error } = await supabaseAdmin
      .from("Package")
      .insert({
        programId: data.programId || null,
        name: data.name.trim(),
        type: data.type || "QUOTA",
        durationMonths: data.durationMonths || null,
        quotaSessions: data.quotaSessions || 10,
        sessionMinutes: data.sessionMinutes || 90, // BR-5 default 90 menit
        price: data.price || 0,
        updatedAt: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) throw error;

    revalidatePath("/dashboard/paket");
    return {
      success: true,
      message: "Paket belajar berhasil ditambahkan.",
      data: { id: pkg.id },
    };
  } catch (error: any) {
    return { success: false, message: "Gagal membuat paket belajar." };
  }
}
