"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { requirePermission } from "@/lib/auth";
import type { ActionResponse } from "@/types";

export async function getNavigations(location?: string) {
  await requirePermission("navigation.read");

  let query = supabaseAdmin
    .from("Navigation")
    .select(`
      id,
      label,
      type,
      url,
      pageId,
      categoryId,
      parentId,
      sortOrder,
      location,
      isActive,
      openInNewTab,
      page:Page(title, slug),
      category:Category(name, slug)
    `);

  if (location) {
    query = query.eq("location", location);
  }

  const { data: allNavs, error } = await query.order("sortOrder", { ascending: true });

  if (error) {
    console.error("Error getNavigations:", error);
    return [];
  }

  // Build tree hierarchy
  const topLevel = (allNavs || []).filter((n: any) => !n.parentId);
  return topLevel.map((nav: any) => ({
    ...nav,
    page: Array.isArray(nav.page) ? nav.page[0] : nav.page,
    category: Array.isArray(nav.category) ? nav.category[0] : nav.category,
    children: (allNavs || [])
      .filter((c: any) => c.parentId === nav.id)
      .map((child: any) => ({
        ...child,
        page: Array.isArray(child.page) ? child.page[0] : child.page,
        category: Array.isArray(child.category) ? child.category[0] : child.category,
      })),
  }));
}

export async function createNavigation(
  formData: FormData
): Promise<ActionResponse> {
  await requirePermission("navigation.create");

  const label = formData.get("label") as string;
  const type = formData.get("type") as string;
  const url = (formData.get("url") as string) || null;
  const pageId = (formData.get("pageId") as string) || null;
  const categoryId = (formData.get("categoryId") as string) || null;
  const parentId = (formData.get("parentId") as string) || null;
  const location = (formData.get("location") as string) || "HEADER";
  const openInNewTab = formData.get("openInNewTab") === "true";

  if (!label) {
    return { success: false, message: "Label wajib diisi" };
  }

  const id = `nav_${Date.now()}`;
  const { error } = await supabaseAdmin.from("Navigation").insert({
    id,
    label,
    type,
    url,
    pageId,
    categoryId,
    parentId,
    location,
    openInNewTab,
    sortOrder: 0,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/dashboard/navigasi");
  return { success: true, message: "Navigasi berhasil dibuat" };
}

export async function updateNavigation(
  id: string,
  formData: FormData
): Promise<ActionResponse> {
  await requirePermission("navigation.update");

  const label = formData.get("label") as string;
  const type = formData.get("type") as string;
  const url = (formData.get("url") as string) || null;
  const pageId = (formData.get("pageId") as string) || null;
  const categoryId = (formData.get("categoryId") as string) || null;
  const parentId = (formData.get("parentId") as string) || null;
  const location = (formData.get("location") as string) || "HEADER";
  const openInNewTab = formData.get("openInNewTab") === "true";

  if (!label) {
    return { success: false, message: "Label wajib diisi" };
  }

  const { error } = await supabaseAdmin
    .from("Navigation")
    .update({
      label,
      type,
      url,
      pageId,
      categoryId,
      parentId,
      location,
      openInNewTab,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/dashboard/navigasi");
  return { success: true, message: "Navigasi berhasil diperbarui" };
}

export async function deleteNavigation(id: string): Promise<ActionResponse> {
  await requirePermission("navigation.delete");

  // Delete children first
  await supabaseAdmin.from("Navigation").delete().eq("parentId", id);
  // Delete item
  const { error } = await supabaseAdmin.from("Navigation").delete().eq("id", id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/dashboard/navigasi");
  return { success: true, message: "Navigasi berhasil dihapus" };
}

export async function reorderNavigations(
  items: { id: string; sortOrder: number }[]
): Promise<ActionResponse> {
  await requirePermission("navigation.update");

  await Promise.all(
    items.map((item) =>
      supabaseAdmin
        .from("Navigation")
        .update({ sortOrder: item.sortOrder, updatedAt: new Date().toISOString() })
        .eq("id", item.id)
    )
  );

  revalidatePath("/dashboard/navigasi");
  return { success: true, message: "Urutan navigasi berhasil diperbarui" };
}
