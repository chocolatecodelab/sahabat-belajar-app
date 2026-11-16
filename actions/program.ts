"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { ActionResponse } from "@/types";
import { revalidatePath } from "next/cache";
import { PackageType } from "@prisma/client";
import { requireStaffOrAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/audit";

export type ProgramItem = {
  id: string;
  name: string;
  category: string;
  description?: string | null;
  sortOrder?: number;
  isActive: boolean;
  packages?: PackageItem[];
  createdAt?: string;
  updatedAt?: string;
};

export type PackageItem = {
  id: string;
  programId?: string | null;
  name: string;
  type: PackageType;
  durationMonths?: number | null;
  quotaSessions?: number | null;
  sessionMinutes: number; // BR-5: Durasi default 90 menit per sesi
  price: number;
  isActive: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * Mengambil daftar program bimbingan beserta paket-paketnya.
 * @param includeInactive Jika true, program dan paket nonaktif tetap dimuat (untuk panel admin)
 */
export async function getPrograms(includeInactive: boolean = false): Promise<ProgramItem[]> {
  try {
    let query = supabaseAdmin
      .from("Program")
      .select("*, packages:Package(*)")
      .order("sortOrder", { ascending: true });

    if (!includeInactive) {
      query = query.eq("isActive", true);
    }

    const { data: programs, error } = await query;

    if (error) throw error;
    if (!programs || programs.length === 0) {
      return [
        {
          id: "prog_01",
          name: "Persiapan CPNS & BUMN",
          category: "CPNS_BUMN",
          description: "Bimbingan intensif SKD (TWK, TIU, TKP) dan tes BUMN",
          sortOrder: 1,
          isActive: true,
          packages: [
            {
              id: "pkg_cpns_10",
              programId: "prog_01",
              name: "Paket Intensif SKD 10 Pertemuan",
              type: "QUOTA",
              quotaSessions: 10,
              sessionMinutes: 90,
              price: 1500000,
              isActive: true,
              sortOrder: 1,
            },
            {
              id: "pkg_cpns_20",
              programId: "prog_01",
              name: "Paket Master SKD 20 Pertemuan",
              type: "QUOTA",
              quotaSessions: 20,
              sessionMinutes: 90,
              price: 2800000,
              isActive: true,
              sortOrder: 2,
            },
          ],
        },
        {
          id: "prog_02",
          name: "Bimbel K-12 (SD/SMP/SMA)",
          category: "K12",
          description: "Pendampingan kurikulum merdeka dan persiapan ujian harian/semester",
          sortOrder: 2,
          isActive: true,
          packages: [
            {
              id: "pkg_k12_10",
              programId: "prog_02",
              name: "Paket Semesteran 10 Sesi",
              type: "QUOTA",
              quotaSessions: 10,
              sessionMinutes: 90,
              price: 1200000,
              isActive: true,
              sortOrder: 1,
            },
          ],
        },
        {
          id: "prog_03",
          name: "UTBK-SNBT Masuk PTN",
          category: "K12",
          description: "Penalaran matematika, literasi bahasa, dan skolastik",
          sortOrder: 3,
          isActive: true,
          packages: [],
        },
        {
          id: "prog_04",
          name: "TOEFL / IELTS Preparation",
          category: "TOEFL_IELTS",
          description: "Target skor 500-600+ untuk persyaratan kelulusan & beasiswa",
          sortOrder: 4,
          isActive: true,
          packages: [],
        },
        {
          id: "prog_05",
          name: "Bimbingan S2/S3 & Beasiswa",
          category: "S2_S3_BEASISWA",
          description: "Mentoring esai, proposal riset, dan wawancara LPDP/AAS",
          sortOrder: 5,
          isActive: true,
          packages: [],
        },
      ];
    }

    return programs.map((pr: any) => ({
      ...pr,
      packages: (pr.packages || [])
        .filter((pk: any) => (includeInactive ? true : pk.isActive !== false))
        .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0)),
    }));
  } catch (error) {
    console.error("getPrograms error:", error);
    return [];
  }
}

// ============================
// PROGRAM CRUD OPERATIONS
// ============================

export async function createProgram(data: {
  name: string;
  category: string;
  description?: string;
  sortOrder?: number;
}): Promise<ActionResponse<{ id: string }>> {
  try {
    await requireStaffOrAdmin();

    if (!data.name?.trim()) {
      return { success: false, message: "Nama program wajib diisi." };
    }

    const programId = "prog_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
    const { data: program, error } = await supabaseAdmin
      .from("Program")
      .insert({
        id: programId,
        name: data.name.trim(),
        category: data.category || "K12",
        description: data.description?.trim() || null,
        sortOrder: data.sortOrder || 0,
        isActive: true,
        updatedAt: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) throw error;

    await logActivity({
      actorName: "Admin/Staf Akademik",
      actorRole: "Admin",
      action: "CREATE",
      entity: "Program",
      targetId: program.id,
      targetName: data.name.trim(),
      details: `Menambahkan program baru kategori ${data.category || "K12"}`,
    });

    revalidatePath("/dashboard/paket");
    revalidatePath("/dashboard/jadwal");

    return {
      success: true,
      message: `Program "${data.name.trim()}" berhasil dibuat.`,
      data: { id: program.id },
    };
  } catch (error: any) {
    console.error("createProgram error:", error);
    return { success: false, message: error.message || "Gagal membuat program." };
  }
}

export async function updateProgram(
  id: string,
  data: {
    name?: string;
    category?: string;
    description?: string | null;
    sortOrder?: number;
    isActive?: boolean;
  }
): Promise<ActionResponse> {
  try {
    await requireStaffOrAdmin();

    const updatePayload: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    if (data.name !== undefined) updatePayload.name = data.name.trim();
    if (data.category !== undefined) updatePayload.category = data.category;
    if (data.description !== undefined) updatePayload.description = data.description?.trim() || null;
    if (data.sortOrder !== undefined) updatePayload.sortOrder = Number(data.sortOrder);
    if (data.isActive !== undefined) updatePayload.isActive = Boolean(data.isActive);

    const { error } = await supabaseAdmin
      .from("Program")
      .update(updatePayload)
      .eq("id", id);

    if (error) throw error;

    await logActivity({
      actorName: "Admin/Staf Akademik",
      actorRole: "Admin",
      action: "UPDATE",
      entity: "Program",
      targetId: id,
      targetName: data.name || `Program ID ${id}`,
      details: `Memperbarui program: kategori ${data.category || "tetap"}, aktif: ${data.isActive ?? "tetap"}`,
    });

    revalidatePath("/dashboard/paket");
    revalidatePath("/dashboard/jadwal");

    return {
      success: true,
      message: "Data program berhasil diperbarui.",
    };
  } catch (error: any) {
    console.error("updateProgram error:", error);
    return { success: false, message: error.message || "Gagal memperbarui program." };
  }
}

export async function deleteProgram(id: string): Promise<ActionResponse> {
  try {
    await requireStaffOrAdmin();

    // Cek apakah program memiliki paket atau sesi bimbingan aktif
    const { count: pkgCount } = await supabaseAdmin
      .from("Package")
      .select("*", { count: "exact", head: true })
      .eq("programId", id);

    const { count: sessionCount } = await supabaseAdmin
      .from("Session")
      .select("*", { count: "exact", head: true })
      .eq("programId", id);

    if ((pkgCount && pkgCount > 0) || (sessionCount && sessionCount > 0)) {
      // Soft Deactivate: lindungi integritas relasi
      await supabaseAdmin
        .from("Program")
        .update({ isActive: false, updatedAt: new Date().toISOString() })
        .eq("id", id);

      await logActivity({
        actorName: "Admin/Staf Akademik",
        actorRole: "Admin",
        action: "STATUS_CHANGE",
        entity: "Program",
        targetId: id,
        targetName: `Program ID ${id}`,
        details: `Nonaktifkan aman (soft delete): memiliki riwayat ${pkgCount || 0} paket dan ${sessionCount || 0} sesi`,
      });

      revalidatePath("/dashboard/paket");
      revalidatePath("/dashboard/jadwal");

      return {
        success: true,
        message: "Program dinonaktifkan (soft delete) untuk melindungi riwayat paket & sesi belajar.",
      };
    }

    // Hard delete jika program masih baru/kosong
    const { error } = await supabaseAdmin.from("Program").delete().eq("id", id);
    if (error) throw error;

    await logActivity({
      actorName: "Admin/Staf Akademik",
      actorRole: "Admin",
      action: "DELETE",
      entity: "Program",
      targetId: id,
      targetName: `Program ID ${id}`,
      details: "Menghapus program permanen (tanpa paket)",
    });

    revalidatePath("/dashboard/paket");
    revalidatePath("/dashboard/jadwal");

    return {
      success: true,
      message: "Program berhasil dihapus permanen.",
    };
  } catch (error: any) {
    console.error("deleteProgram error:", error);
    return { success: false, message: error.message || "Gagal menghapus program." };
  }
}

// ============================
// PACKAGE CRUD OPERATIONS
// ============================

export async function createPackage(data: {
  programId?: string;
  name: string;
  type?: PackageType;
  durationMonths?: number;
  quotaSessions?: number;
  sessionMinutes?: number;
  price?: number;
  isActive?: boolean;
}): Promise<ActionResponse<{ id: string }>> {
  try {
    await requireStaffOrAdmin();

    if (!data.name?.trim()) {
      return { success: false, message: "Nama paket bimbingan wajib diisi." };
    }

    const packageId = "pkg_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
    const { data: pkg, error } = await supabaseAdmin
      .from("Package")
      .insert({
        id: packageId,
        programId: data.programId || null,
        name: data.name.trim(),
        type: data.type || "QUOTA",
        durationMonths: data.durationMonths || null,
        quotaSessions: data.quotaSessions || 10,
        sessionMinutes: data.sessionMinutes || 90, // BR-5 default 90 menit per sesi
        price: data.price || 0,
        isActive: data.isActive ?? true,
        updatedAt: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) throw error;

    await logActivity({
      actorName: "Admin/Staf Akademik",
      actorRole: "Admin",
      action: "CREATE",
      entity: "Paket",
      targetId: pkg.id,
      targetName: data.name.trim(),
      details: `Menambahkan paket bimbingan baru: kuota ${data.quotaSessions || 10} sesi, durasi ${data.sessionMinutes || 90} menit (BR-5), harga Rp ${(data.price || 0).toLocaleString("id-ID")}`,
    });

    revalidatePath("/dashboard/paket");
    revalidatePath("/portal");

    return {
      success: true,
      message: `Paket belajar "${data.name.trim()}" berhasil ditambahkan.`,
      data: { id: pkg.id },
    };
  } catch (error: any) {
    console.error("createPackage error:", error);
    return { success: false, message: error.message || "Gagal membuat paket belajar." };
  }
}

export async function updatePackage(
  id: string,
  data: {
    programId?: string | null;
    name?: string;
    type?: PackageType;
    durationMonths?: number | null;
    quotaSessions?: number | null;
    sessionMinutes?: number;
    price?: number;
    isActive?: boolean;
  }
): Promise<ActionResponse> {
  try {
    await requireStaffOrAdmin();

    const updatePayload: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    if (data.programId !== undefined) updatePayload.programId = data.programId || null;
    if (data.name !== undefined) updatePayload.name = data.name.trim();
    if (data.type !== undefined) updatePayload.type = data.type;
    if (data.durationMonths !== undefined) updatePayload.durationMonths = data.durationMonths ? Number(data.durationMonths) : null;
    if (data.quotaSessions !== undefined) updatePayload.quotaSessions = data.quotaSessions ? Number(data.quotaSessions) : 10;
    if (data.sessionMinutes !== undefined) updatePayload.sessionMinutes = data.sessionMinutes ? Number(data.sessionMinutes) : 90;
    if (data.price !== undefined) updatePayload.price = Math.max(0, Number(data.price));
    if (data.isActive !== undefined) updatePayload.isActive = Boolean(data.isActive);

    const { error } = await supabaseAdmin
      .from("Package")
      .update(updatePayload)
      .eq("id", id);

    if (error) throw error;

    await logActivity({
      actorName: "Admin/Staf Akademik",
      actorRole: "Admin",
      action: "UPDATE",
      entity: "Paket",
      targetId: id,
      targetName: data.name || `Paket ID ${id}`,
      details: `Memperbarui paket belajar: kuota ${data.quotaSessions ?? "tetap"} sesi, harga Rp ${(data.price || 0).toLocaleString("id-ID")}`,
    });

    revalidatePath("/dashboard/paket");
    revalidatePath("/portal");

    return {
      success: true,
      message: "Data paket belajar berhasil diperbarui.",
    };
  } catch (error: any) {
    console.error("updatePackage error:", error);
    return { success: false, message: error.message || "Gagal memperbarui paket belajar." };
  }
}

export async function togglePackageStatus(id: string, isActive: boolean): Promise<ActionResponse> {
  try {
    await requireStaffOrAdmin();

    const { error } = await supabaseAdmin
      .from("Package")
      .update({ isActive, updatedAt: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;

    await logActivity({
      actorName: "Admin/Staf Akademik",
      actorRole: "Admin",
      action: "STATUS_CHANGE",
      entity: "Paket",
      targetId: id,
      targetName: `Paket ID ${id}`,
      details: `Mengubah status paket menjadi ${isActive ? "Aktif" : "Nonaktif"}`,
    });

    revalidatePath("/dashboard/paket");
    revalidatePath("/portal");

    return {
      success: true,
      message: isActive ? "Paket bimbingan diaktifkan kembali." : "Paket bimbingan dinonaktifkan.",
    };
  } catch (error: any) {
    console.error("togglePackageStatus error:", error);
    return { success: false, message: error.message || "Gagal mengubah status paket." };
  }
}

export async function deletePackage(id: string): Promise<ActionResponse> {
  try {
    await requireStaffOrAdmin();

    // Cek apakah paket ini sudah pernah dibeli oleh siswa (StudentPackage)
    const { count: studentPackageCount } = await supabaseAdmin
      .from("StudentPackage")
      .select("*", { count: "exact", head: true })
      .eq("packageId", id);

    if (studentPackageCount && studentPackageCount > 0) {
      // Soft Deactivate: lindungi data historis transaksi dan sisa kuota siswa
      await supabaseAdmin
        .from("Package")
        .update({ isActive: false, updatedAt: new Date().toISOString() })
        .eq("id", id);

      await logActivity({
        actorName: "Admin/Staf Akademik",
        actorRole: "Admin",
        action: "STATUS_CHANGE",
        entity: "Paket",
        targetId: id,
        targetName: `Paket ID ${id}`,
        details: `Nonaktifkan aman (soft delete): memiliki riwayat ${studentPackageCount} siswa terdaftar`,
      });

      revalidatePath("/dashboard/paket");
      revalidatePath("/portal");

      return {
        success: true,
        message: `Paket dinonaktifkan (soft delete) karena memiliki ${studentPackageCount} siswa terdaftar. Siswa aktif tetap dapat bimbingan, namun paket tidak akan muncul untuk pendaftar baru.`,
      };
    }

    // Hard delete jika belum pernah ada siswa yang membeli paket ini
    const { error } = await supabaseAdmin.from("Package").delete().eq("id", id);
    if (error) throw error;

    await logActivity({
      actorName: "Admin/Staf Akademik",
      actorRole: "Admin",
      action: "DELETE",
      entity: "Paket",
      targetId: id,
      targetName: `Paket ID ${id}`,
      details: "Menghapus paket bimbingan permanen (tanpa siswa terdaftar)",
    });

    revalidatePath("/dashboard/paket");
    revalidatePath("/portal");

    return {
      success: true,
      message: "Paket bimbingan berhasil dihapus permanen.",
    };
  } catch (error: any) {
    console.error("deletePackage error:", error);
    return { success: false, message: error.message || "Gagal menghapus paket belajar." };
  }
}
