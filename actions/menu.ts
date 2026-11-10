"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { requirePermission } from "@/lib/auth";
import type { ActionResponse } from "@/types";

export type AdminMenuItem = {
  id: string;
  label: string;
  icon: string | null;
  url: string;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  permission: string | null;
  children?: AdminMenuItem[];
};

const INITIAL_MENUS = [
  // 1. Dashboard
  { id: "menu_dashboard", label: "Dashboard", icon: "LayoutDashboard", url: "/dashboard", parentId: null, sortOrder: 1, isActive: true, permission: "dashboard.read" },
  
  // 2. Prospek / Lead
  { id: "menu_lead", label: "Prospek / Lead", icon: "Users", url: "/dashboard/lead", parentId: null, sortOrder: 2, isActive: true, permission: "lead.read" },

  // 3. Manajemen Siswa (Parent)
  { id: "menu_siswa_group", label: "Manajemen Siswa", icon: "GraduationCap", url: "/dashboard/siswa", parentId: null, sortOrder: 3, isActive: true, permission: "student.read" },
  { id: "menu_siswa", label: "Data Siswa", icon: "GraduationCap", url: "/dashboard/siswa", parentId: "menu_siswa_group", sortOrder: 1, isActive: true, permission: "student.read" },
  { id: "menu_jadwal", label: "Jadwal & Sesi", icon: "Calendar", url: "/dashboard/jadwal", parentId: "menu_siswa_group", sortOrder: 2, isActive: true, permission: "schedule.read" },
  { id: "menu_paket", label: "Paket & Kuota", icon: "FileCheck", url: "/dashboard/paket", parentId: "menu_siswa_group", sortOrder: 3, isActive: true, permission: "package.read" },
  { id: "menu_portal_siswa", label: "Portal Siswa", icon: "Sparkles", url: "/portal", parentId: "menu_siswa_group", sortOrder: 4, isActive: true, permission: "student.read" },

  // 4. Manajemen Tutor (Parent)
  { id: "menu_tutor_group", label: "Manajemen Tutor", icon: "BookOpen", url: "/dashboard/tutor", parentId: null, sortOrder: 4, isActive: true, permission: "tutor.read" },
  { id: "menu_tutor", label: "Direktori Tutor", icon: "BookOpen", url: "/dashboard/tutor", parentId: "menu_tutor_group", sortOrder: 1, isActive: true, permission: "tutor.read" },
  { id: "menu_portal_tutor", label: "Portal Tutor (HP)", icon: "Compass", url: "/tutor", parentId: "menu_tutor_group", sortOrder: 2, isActive: true, permission: "tutor.read" },

  // 5. Keuangan (Parent)
  { id: "menu_keuangan_group", label: "Keuangan & Kas", icon: "CreditCard", url: "/dashboard/pembayaran", parentId: null, sortOrder: 5, isActive: true, permission: "payment.read" },
  { id: "menu_pembayaran", label: "Pembayaran", icon: "CreditCard", url: "/dashboard/pembayaran", parentId: "menu_keuangan_group", sortOrder: 1, isActive: true, permission: "payment.read" },
  { id: "menu_honor", label: "Rekap Honor Tutor", icon: "Trophy", url: "/dashboard/honor", parentId: "menu_keuangan_group", sortOrder: 2, isActive: true, permission: "payout.read" },

  // 6. Layanan Belajar Digital (Parent)
  { id: "menu_akademik_digital", label: "Layanan Belajar Digital", icon: "Award", url: "/dashboard/materi", parentId: null, sortOrder: 6, isActive: true, permission: "material.read" },
  { id: "menu_materi", label: "Modul & Materi", icon: "FolderOpen", url: "/dashboard/materi", parentId: "menu_akademik_digital", sortOrder: 1, isActive: true, permission: "material.read" },
  { id: "menu_ujian", label: "Ruang Ujian & CAT", icon: "Award", url: "/dashboard/ujian", parentId: "menu_akademik_digital", sortOrder: 2, isActive: true, permission: "exam.read" },
  { id: "menu_dokumen", label: "Review Dokumen", icon: "FileEdit", url: "/dashboard/dokumen", parentId: "menu_akademik_digital", sortOrder: 3, isActive: true, permission: "document.read" },

  // 7. Pengaturan & Sistem (Parent)
  { id: "menu_pengaturan", label: "Pengaturan & Sistem", icon: "Settings", url: "/dashboard/pengaturan", parentId: null, sortOrder: 7, isActive: true, permission: "settings.read" },
  { id: "menu_set_umum", label: "Pengaturan Umum", icon: "Settings", url: "/dashboard/pengaturan", parentId: "menu_pengaturan", sortOrder: 1, isActive: true, permission: "settings.read" },
  { id: "menu_set_menu", label: "Kelola Menu Sidebar", icon: "Menu", url: "/dashboard/pengguna/menu", parentId: "menu_pengaturan", sortOrder: 2, isActive: true, permission: "menu.read" },
  { id: "menu_set_role", label: "Role & Hak Akses", icon: "Shield", url: "/dashboard/pengguna/role", parentId: "menu_pengaturan", sortOrder: 3, isActive: true, permission: "role.read" },
  { id: "menu_set_user", label: "Akun Pengguna & Staf", icon: "Users", url: "/dashboard/pengguna", parentId: "menu_pengaturan", sortOrder: 4, isActive: true, permission: "user.read" },
  { id: "menu_media", label: "Pustaka Media", icon: "Image", url: "/dashboard/media", parentId: "menu_pengaturan", sortOrder: 5, isActive: true, permission: "media.read" },
];

function groupMenus(menus: AdminMenuItem[]): AdminMenuItem[] {
  const map = new Map<string, AdminMenuItem>();
  const roots: AdminMenuItem[] = [];

  for (const menu of menus) {
    map.set(menu.id, { ...menu, children: [] });
  }

  for (const menu of menus) {
    const node = map.get(menu.id)!;
    if (menu.parentId && map.has(menu.parentId)) {
      map.get(menu.parentId)!.children!.push(node);
    } else {
      roots.push(node);
    }
  }

  roots.sort((a, b) => a.sortOrder - b.sortOrder);
  for (const root of roots) {
    if (root.children) {
      root.children.sort((a, b) => a.sortOrder - b.sortOrder);
    }
  }

  return roots;
}

export async function getAdminMenus(): Promise<AdminMenuItem[]> {
  try {
    const { data: menus, error } = await supabaseAdmin
      .from("AdminMenu")
      .select("*")
      .order("sortOrder", { ascending: true });

    if (error || !menus || menus.length === 0) {
      return groupMenus(INITIAL_MENUS as AdminMenuItem[]);
    }

    return groupMenus(menus as AdminMenuItem[]);
  } catch (error) {
    console.error("getAdminMenus error:", error);
    return groupMenus(INITIAL_MENUS as AdminMenuItem[]);
  }
}

export async function createAdminMenu(data: FormData | any): Promise<ActionResponse<AdminMenuItem>> {
  try {
    await requirePermission("menu.update");

    const label = data instanceof FormData ? String(data.get("label") || "") : data.label;
    const url = data instanceof FormData ? String(data.get("url") || "") : data.url;
    const icon = data instanceof FormData ? (data.get("icon") ? String(data.get("icon")) : null) : data.icon;
    const parentId = data instanceof FormData ? (data.get("parentId") ? String(data.get("parentId")) : null) : data.parentId;
    const sortOrder = data instanceof FormData ? Number(data.get("sortOrder") || 0) : (data.sortOrder || 0);
    const permission = data instanceof FormData ? (data.get("permission") ? String(data.get("permission")) : null) : data.permission;

    const id = `menu_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const { data: menu, error } = await supabaseAdmin
      .from("AdminMenu")
      .insert({
        id,
        label: label.trim(),
        icon,
        url: url.trim(),
        parentId,
        sortOrder,
        permission,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/pengguna/menu");
    return { success: true, message: "Menu berhasil dibuat.", data: menu };
  } catch (error: any) {
    return { success: false, message: error?.message || "Gagal membuat menu." };
  }
}

export async function updateAdminMenu(
  id: string,
  data: FormData | any
): Promise<ActionResponse<AdminMenuItem>> {
  try {
    await requirePermission("menu.update");

    const updateData: any = { updatedAt: new Date().toISOString() };
    if (data instanceof FormData) {
      if (data.has("label")) updateData.label = String(data.get("label"));
      if (data.has("url")) updateData.url = String(data.get("url"));
      if (data.has("icon")) updateData.icon = data.get("icon") ? String(data.get("icon")) : null;
      if (data.has("parentId")) updateData.parentId = data.get("parentId") ? String(data.get("parentId")) : null;
      if (data.has("sortOrder")) updateData.sortOrder = Number(data.get("sortOrder"));
      if (data.has("permission")) updateData.permission = data.get("permission") ? String(data.get("permission")) : null;
    } else {
      Object.assign(updateData, data);
    }

    const { data: menu, error } = await supabaseAdmin
      .from("AdminMenu")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/pengguna/menu");
    return { success: true, message: "Menu berhasil diperbarui.", data: menu };
  } catch (error: any) {
    return { success: false, message: error?.message || "Gagal memperbarui menu." };
  }
}

export async function deleteAdminMenu(id: string): Promise<ActionResponse> {
  try {
    await requirePermission("menu.update");

    // Clean up child sub-menus first if any
    await supabaseAdmin.from("AdminMenu").delete().eq("parentId", id);

    const { error } = await supabaseAdmin.from("AdminMenu").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/pengguna/menu");
    return { success: true, message: "Menu berhasil dihapus." };
  } catch (error: any) {
    return { success: false, message: error?.message || "Gagal menghapus menu." };
  }
}

export async function toggleAdminMenuStatus(
  id: string,
  isActive: boolean
): Promise<ActionResponse> {
  try {
    await requirePermission("menu.update");

    const { error } = await supabaseAdmin
      .from("AdminMenu")
      .update({ isActive, updatedAt: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/pengguna/menu");
    return { success: true, message: "Status menu diperbarui." };
  } catch (error: any) {
    return { success: false, message: error?.message || "Gagal memperbarui status menu." };
  }
}

export async function resetDefaultAdminMenus(): Promise<ActionResponse> {
  try {
    await requirePermission("menu.update");

    for (const m of INITIAL_MENUS) {
      await supabaseAdmin.from("AdminMenu").upsert({
        id: m.id,
        label: m.label,
        icon: m.icon,
        url: m.url,
        parentId: m.parentId,
        sortOrder: m.sortOrder,
        isActive: m.isActive,
        permission: m.permission,
        updatedAt: new Date().toISOString(),
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/pengguna/menu");
    return { success: true, message: "Susunan menu standar Sahabat Belajar berhasil dipulihkan." };
  } catch (error: any) {
    return { success: false, message: error?.message || "Gagal memulihkan menu standar." };
  }
}
