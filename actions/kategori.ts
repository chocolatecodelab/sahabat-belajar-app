"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { requirePermission } from "@/lib/auth";
import slugify from "slugify";
import type { ActionResponse } from "@/types";

export async function getCategories() {
  await requirePermission("category.read");

  const { data: categories, error } = await supabaseAdmin
    .from("Category")
    .select(`
      id,
      name,
      slug,
      description,
      color,
      articles:Article(count)
    `)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error getCategories:", error);
    return [];
  }

  return (categories || []).map((cat: any) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    color: cat.color,
    _count: {
      articles: cat.articles?.[0]?.count || 0,
    },
  }));
}

export async function createCategory(
  formData: FormData
): Promise<ActionResponse> {
  await requirePermission("category.create");

  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;
  const color = (formData.get("color") as string) || null;

  if (!name) {
    return { success: false, message: "Nama kategori wajib diisi" };
  }

  const slug = slugify(name, { lower: true, strict: true });

  const { data: existing } = await supabaseAdmin
    .from("Category")
    .select("id")
    .or(`name.eq."${name}",slug.eq."${slug}"`)
    .maybeSingle();

  if (existing) {
    return { success: false, message: "Kategori sudah ada" };
  }

  const id = `cat_${Date.now()}`;
  const { error } = await supabaseAdmin
    .from("Category")
    .insert({ id, name, slug, description, color });

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/dashboard/kategori");
  return { success: true, message: "Kategori berhasil dibuat" };
}

export async function updateCategory(
  id: string,
  formData: FormData
): Promise<ActionResponse> {
  await requirePermission("category.update");

  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;
  const color = (formData.get("color") as string) || null;

  if (!name) {
    return { success: false, message: "Nama kategori wajib diisi" };
  }

  const slug = slugify(name, { lower: true, strict: true });

  const { error } = await supabaseAdmin
    .from("Category")
    .update({ name, slug, description, color, updatedAt: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/dashboard/kategori");
  return { success: true, message: "Kategori berhasil diperbarui" };
}

export async function deleteCategory(id: string): Promise<ActionResponse> {
  await requirePermission("category.delete");

  const { count } = await supabaseAdmin
    .from("Article")
    .select("*", { count: "exact", head: true })
    .eq("categoryId", id);

  if (count && count > 0) {
    return {
      success: false,
      message: `Kategori masih digunakan oleh ${count} berita. Pindahkan berita ke kategori lain terlebih dahulu.`,
    };
  }

  const { error } = await supabaseAdmin.from("Category").delete().eq("id", id);
  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/dashboard/kategori");
  return { success: true, message: "Kategori berhasil dihapus" };
}
