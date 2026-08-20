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
  { id: "menu_dashboard", label: "Dashboard", icon: "LayoutDashboard", url: "/dashboard", parentId: null, sortOrder: 1, isActive: true, permission: null },
  { id: "menu_halaman", label: "Halaman", icon: "FileText", url: "/dashboard/halaman", parentId: null, sortOrder: 2, isActive: true, permission: "page.read" },
  { id: "menu_berita", label: "Berita", icon: "Newspaper", url: "/dashboard/berita", parentId: null, sortOrder: 3, isActive: true, permission: "article.read" },
  { id: "menu_kategori", label: "Kategori", icon: "FolderOpen", url: "/dashboard/kategori", parentId: null, sortOrder: 4, isActive: true, permission: "category.read" },
  { id: "menu_navigasi", label: "Navigasi", icon: "Navigation", url: "/dashboard/navigasi", parentId: null, sortOrder: 5, isActive: true, permission: "navigation.read" },
  { id: "menu_tampilan", label: "Tampilan", icon: "Palette", url: "#", parentId: null, sortOrder: 6, isActive: true, permission: "appearance.read" },
  { id: "menu_hero", label: "Hero Section", icon: "Image", url: "/dashboard/tampilan/hero", parentId: "menu_tampilan", sortOrder: 1, isActive: true, permission: "appearance.read" },
  { id: "menu_layanan", label: "Program Kursus", icon: "Heart", url: "/dashboard/tampilan/layanan", parentId: "menu_tampilan", sortOrder: 2, isActive: true, permission: "appearance.read" },
  { id: "menu_stat", label: "Statistik Alumni", icon: "Users", url: "/dashboard/tampilan/statistik", parentId: "menu_tampilan", sortOrder: 3, isActive: true, permission: "appearance.read" },
  { id: "menu_alur", label: "Alur Belajar", icon: "Link", url: "/dashboard/tampilan/alur-belajar", parentId: "menu_tampilan", sortOrder: 4, isActive: true, permission: "appearance.read" },
  { id: "menu_keunggulan", label: "Keunggulan", icon: "Shield", url: "/dashboard/tampilan/keunggulan", parentId: "menu_tampilan", sortOrder: 5, isActive: true, permission: "appearance.read" },
  { id: "menu_testimoni", label: "Testimoni Alumni", icon: "Users", url: "/dashboard/tampilan/testimoni", parentId: "menu_tampilan", sortOrder: 6, isActive: true, permission: "appearance.read" },
  { id: "menu_faq", label: "FAQ", icon: "FileText", url: "/dashboard/tampilan/faq", parentId: "menu_tampilan", sortOrder: 7, isActive: true, permission: "appearance.read" },
  { id: "menu_tampilan_berita", label: "Pengaturan Berita", icon: "Rss", url: "/dashboard/tampilan/berita", parentId: "menu_tampilan", sortOrder: 8, isActive: true, permission: "appearance.read" },
  { id: "menu_sosmed", label: "Sosial Media", icon: "Share2", url: "/dashboard/tampilan/sosial-media", parentId: "menu_tampilan", sortOrder: 9, isActive: true, permission: "appearance.read" },
  { id: "menu_pengguna", label: "Pengguna", icon: "Users", url: "/dashboard/pengguna", parentId: null, sortOrder: 7, isActive: true, permission: "user.read" },
  { id: "menu_role", label: "Role & Akses", icon: "Shield", url: "/dashboard/pengguna/role", parentId: null, sortOrder: 8, isActive: true, permission: "role.read" },
  { id: "menu_admin_menu", label: "Menu Admin", icon: "Menu", url: "/dashboard/pengguna/menu", parentId: null, sortOrder: 9, isActive: true, permission: "settings.read" },
  { id: "menu_pengaturan", label: "Pengaturan", icon: "Settings", url: "/dashboard/pengaturan", parentId: null, sortOrder: 10, isActive: true, permission: "settings.read" },
];

export async function getAdminMenus(): Promise<AdminMenuItem[]> {
  try {
    const { data: menus, error } = await supabaseAdmin
      .from("AdminMenu")
      .select("*")
      .order("sortOrder", { ascending: true });

    if (error || !menus || menus.length === 0) {
      // Auto seed initial menus
      try {
        await supabaseAdmin.from("AdminMenu").upsert(
          INITIAL_MENUS.map((m) => ({
            id: m.id,
            label: m.label,
            icon: m.icon,
            url: m.url,
            parentId: m.parentId,
            sortOrder: m.sortOrder,
            isActive: m.isActive,
            permission: m.permission,
          }))
        );
      } catch (seedErr) {
        console.error("Seed error:", seedErr);
      }
      return groupMenus(INITIAL_MENUS as AdminMenuItem[]);
    }

    // Auto-sync any missing menu items from INITIAL_MENUS
    const existingIds = new Set(menus.map((m: any) => m.id));
    const missingMenus = INITIAL_MENUS.filter((m) => !existingIds.has(m.id));
    if (missingMenus.length > 0) {
      try {
        await supabaseAdmin.from("AdminMenu").upsert(
          missingMenus.map((m) => ({
            id: m.id,
            label: m.label,
            icon: m.icon,
            url: m.url,
            parentId: m.parentId,
            sortOrder: m.sortOrder,
            isActive: m.isActive,
            permission: m.permission,
          }))
        );
        const { data: refreshed } = await supabaseAdmin
          .from("AdminMenu")
          .select("*")
          .order("sortOrder", { ascending: true });
        if (refreshed && refreshed.length > 0) {
          return groupMenus(refreshed as AdminMenuItem[]);
        }
      } catch (syncErr) {
        console.error("Sync missing menus error:", syncErr);
      }
    }

    return groupMenus(menus as AdminMenuItem[]);
  } catch (err) {
    console.error("Error in getAdminMenus:", err);
    return groupMenus(INITIAL_MENUS as AdminMenuItem[]);
  }
}

function groupMenus(all: AdminMenuItem[]): AdminMenuItem[] {
  const topLevel = all.filter((m) => !m.parentId);
  return topLevel.map((parent) => ({
    ...parent,
    children: all.filter((c) => c.parentId === parent.id),
  }));
}

export async function toggleAdminMenuStatus(id: string, isActive: boolean): Promise<ActionResponse> {
  await requirePermission("settings.update");

  const { error } = await supabaseAdmin
    .from("AdminMenu")
    .update({ isActive, updatedAt: new Date().toISOString() })
    .eq("id", id);

  if (error) return { success: false, message: error.message };

  revalidatePath("/dashboard/pengguna/menu");
  revalidatePath("/dashboard", "layout");
  return { success: true, message: `Menu berhasil di${isActive ? "aktifkan" : "nonaktifkan"}` };
}

export async function createAdminMenu(formData: FormData): Promise<ActionResponse> {
  await requirePermission("settings.update");

  const label = formData.get("label") as string;
  const icon = (formData.get("icon") as string) || "Link";
  const url = formData.get("url") as string;
  const parentId = (formData.get("parentId") as string) || null;
  const permission = (formData.get("permission") as string) || null;
  const isActive = formData.get("isActive") !== "false";
  const sortOrder = parseInt((formData.get("sortOrder") as string) || "0") || 0;

  if (!label || !url) {
    return { success: false, message: "Label dan URL menu wajib diisi" };
  }

  const id = `menu_${Date.now()}`;
  const { error } = await supabaseAdmin.from("AdminMenu").insert({
    id,
    label,
    icon,
    url,
    parentId,
    permission,
    isActive,
    sortOrder,
  });

  if (error) return { success: false, message: error.message };

  revalidatePath("/dashboard/pengguna/menu");
  revalidatePath("/dashboard", "layout");
  return { success: true, message: "Menu admin berhasil ditambahkan" };
}

export async function updateAdminMenu(id: string, formData: FormData): Promise<ActionResponse> {
  await requirePermission("settings.update");

  const label = formData.get("label") as string;
  const icon = (formData.get("icon") as string) || "Link";
  const url = formData.get("url") as string;
  const parentId = (formData.get("parentId") as string) || null;
  const permission = (formData.get("permission") as string) || null;
  const isActive = formData.get("isActive") !== "false";
  const sortOrder = parseInt((formData.get("sortOrder") as string) || "0") || 0;

  if (!label || !url) {
    return { success: false, message: "Label dan URL menu wajib diisi" };
  }

  const { error } = await supabaseAdmin
    .from("AdminMenu")
    .update({
      label,
      icon,
      url,
      parentId,
      permission,
      isActive,
      sortOrder,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { success: false, message: error.message };

  revalidatePath("/dashboard/pengguna/menu");
  revalidatePath("/dashboard", "layout");
  return { success: true, message: "Menu admin berhasil diperbarui" };
}

export async function deleteAdminMenu(id: string): Promise<ActionResponse> {
  await requirePermission("settings.update");

  // Also delete children if parent
  await supabaseAdmin.from("AdminMenu").delete().eq("parentId", id);
  const { error } = await supabaseAdmin.from("AdminMenu").delete().eq("id", id);
  if (error) return { success: false, message: error.message };

  revalidatePath("/dashboard/pengguna/menu");
  revalidatePath("/dashboard", "layout");
  return { success: true, message: "Menu admin berhasil dihapus" };
}
