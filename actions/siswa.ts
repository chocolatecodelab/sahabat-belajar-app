"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { ActionResponse } from "@/types";
import { revalidatePath } from "next/cache";
import { StudentStatus } from "@prisma/client";
import { requireStaffOrAdmin } from "@/lib/auth";

export type StudentInput = {
  name: string;
  level: string;
  school?: string;
  parentName?: string;
  parentPhone?: string;
  leadId?: string;
  status?: StudentStatus;
  notes?: string;
};

export async function getStudents(params?: {
  search?: string;
  level?: string;
  status?: StudentStatus;
  page?: number;
  perPage?: number;
}) {
  try {
    await requireStaffOrAdmin();
    const page = params?.page || 1;
    const perPage = params?.perPage || 15;
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    let query = supabaseAdmin
      .from("Student")
      .select(`
        *,
        packages:StudentPackage(
          *,
          package:Package(*)
        ),
        lead:Lead(id, phone, email)
      `, { count: "exact" })
      .order("createdAt", { ascending: false })
      .range(from, to);

    if (params?.status) {
      query = query.eq("status", params.status);
    }
    if (params?.level && params.level !== "ALL") {
      query = query.eq("level", params.level);
    }
    if (params?.search) {
      const s = params.search.trim();
      query = query.or(`name.ilike.%${s}%,school.ilike.%${s}%,parentName.ilike.%${s}%,parentPhone.ilike.%${s}%`);
    }

    const { data: students, count, error } = await query;
    if (error) throw error;

    const total = count || 0;

    return {
      data: students || [],
      meta: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  } catch (error) {
    console.error("getStudents error:", error);
    return { data: [], meta: { page: 1, perPage: 15, total: 0, totalPages: 0 } };
  }
}

export async function createStudent(input: StudentInput): Promise<ActionResponse<{ id: string }>> {
  try {
    await requireStaffOrAdmin();
    if (!input.name || !input.level) {
      return {
        success: false,
        message: "Nama siswa dan jenjang pendidikan wajib diisi.",
      };
    }

    const studentId = 'student_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const { data: student, error } = await supabaseAdmin
      .from("Student")
      .insert({
        id: studentId,
        name: input.name.trim(),
        level: input.level,
        school: input.school?.trim() || null,
        parentName: input.parentName?.trim() || null,
        parentPhone: input.parentPhone?.trim() || null,
        leadId: input.leadId || null,
        status: input.status || "AKTIF",
        parentConsentAt: input.parentPhone ? new Date().toISOString() : null,
        notes: input.notes || null,
        updatedAt: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) throw error;

    if (input.leadId) {
      await supabaseAdmin
        .from("Lead")
        .update({ status: "DAFTAR", updatedAt: new Date().toISOString() })
        .eq("id", input.leadId);
    }

    revalidatePath("/dashboard/siswa");
    revalidatePath("/dashboard/lead");

    return {
      success: true,
      message: "Data siswa berhasil didaftarkan.",
      data: { id: student.id },
    };
  } catch (error: any) {
    console.error("createStudent error:", error);
    return {
      success: false,
      message: "Gagal membuat data siswa.",
    };
  }
}

export async function convertLeadToStudent(leadId: string): Promise<ActionResponse<{ id: string }>> {
  try {
    await requireStaffOrAdmin();
    const { data: lead, error: leadError } = await supabaseAdmin
      .from("Lead")
      .select("*")
      .eq("id", leadId)
      .single();

    if (leadError || !lead) {
      return { success: false, message: "Prospek lead tidak ditemukan." };
    }

    // Proteksi Idempotensi (SB-QA-FUN-004): Cegah duplikasi siswa jika tombol diklik berulang
    if (lead.status === "DAFTAR") {
      const { data: existingStudent } = await supabaseAdmin
        .from("Student")
        .select("id")
        .eq("leadId", leadId)
        .maybeSingle();

      if (existingStudent) {
        return {
          success: true,
          message: "Prospek lead ini sudah terdaftar sebagai siswa sebelumnya.",
          data: { id: existingStudent.id },
        };
      }
    }

    const studentId = 'student_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const { data: student, error: studentError } = await supabaseAdmin
      .from("Student")
      .insert({
        id: studentId,
        name: lead.name,
        level: lead.level || "Umum",
        parentPhone: lead.phone,
        leadId: lead.id,
        status: "AKTIF",
        parentConsentAt: new Date().toISOString(),
        notes: `Dikonversi dari prospek: ${lead.programInterest || "Umum"} (${lead.classModel || "Privat"})`,
        updatedAt: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (studentError) throw studentError;

    await supabaseAdmin
      .from("Lead")
      .update({ status: "DAFTAR", updatedAt: new Date().toISOString() })
      .eq("id", leadId);

    revalidatePath("/dashboard/siswa");
    revalidatePath("/dashboard/lead");

    return {
      success: true,
      message: `Berhasil mendaftarkan ${lead.name} sebagai siswa aktif Sahabat Belajar.`,
      data: { id: student.id },
    };
  } catch (error: any) {
    console.error("convertLeadToStudent error:", error);
    return {
      success: false,
      message: "Gagal mengonversi lead menjadi siswa.",
    };
  }
}

export async function updateStudent(
  id: string,
  input: Partial<StudentInput>
): Promise<ActionResponse> {
  try {
    await requireStaffOrAdmin();
    const updateData: any = { updatedAt: new Date().toISOString() };
    if (input.name) updateData.name = input.name.trim();
    if (input.level) updateData.level = input.level;
    if (input.school !== undefined) updateData.school = input.school?.trim() || null;
    if (input.parentName !== undefined) updateData.parentName = input.parentName?.trim() || null;
    if (input.parentPhone !== undefined) updateData.parentPhone = input.parentPhone?.trim() || null;
    if (input.status) updateData.status = input.status;
    if (input.notes !== undefined) updateData.notes = input.notes;

    const { error } = await supabaseAdmin
      .from("Student")
      .update(updateData)
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/dashboard/siswa");

    return {
      success: true,
      message: "Data siswa berhasil diperbarui.",
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Gagal memperbarui data siswa.",
    };
  }
}

export async function deleteStudent(id: string): Promise<ActionResponse> {
  try {
    await requireStaffOrAdmin();
    const { error } = await supabaseAdmin.from("Student").delete().eq("id", id);
    if (error) throw error;

    revalidatePath("/dashboard/siswa");
    return {
      success: true,
      message: "Data siswa berhasil dihapus.",
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Gagal menghapus data siswa.",
    };
  }
}

export async function importStudentsFromCsv(
  rows: Array<{
    name: string;
    level: string;
    school?: string;
    parentName?: string;
    parentPhone?: string;
  }>
): Promise<ActionResponse<{ importedCount: number }>> {
  try {
    await requireStaffOrAdmin();
    const now = new Date().toISOString();
    const validRows = rows
      .filter((row) => row.name && row.level)
      .map((row, idx) => ({
        id: `student_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`,
        name: row.name.trim(),
        level: row.level.trim(),
        school: row.school?.trim() || null,
        parentName: row.parentName?.trim() || null,
        parentPhone: row.parentPhone?.trim() || null,
        parentConsentAt: row.parentPhone ? now : null,
        status: "AKTIF" as const,
        updatedAt: now,
      }));

    if (validRows.length === 0) {
      return {
        success: false,
        message: "Tidak ada baris data siswa yang valid untuk diimpor.",
      };
    }

    const { error } = await supabaseAdmin.from("Student").insert(validRows);
    if (error) throw error;

    const importedCount = validRows.length;

    revalidatePath("/dashboard/siswa");

    return {
      success: true,
      message: `Berhasil mengimpor ${importedCount} data siswa baru dari CSV.`,
      data: { importedCount },
    };
  } catch (error: any) {
    console.error("importStudentsFromCsv error:", error);
    return {
      success: false,
      message: "Gagal memproses file impor CSV.",
    };
  }
}
