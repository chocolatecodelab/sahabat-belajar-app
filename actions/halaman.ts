"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { requirePermission } from "@/lib/auth";
import { z } from "zod";
import slugify from "slugify";
import type { ActionResponse } from "@/types";

const pageSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi").max(255),
  slug: z.string().optional(),
  content: z.string().min(1, "Konten wajib diisi"),
  excerpt: z.string().optional().nullable(),
  featuredImage: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
});

export async function getPages(
  page: number = 1,
  perPage: number = 10,
  search?: string,
  status?: string
) {
  await requirePermission("page.read");

  let query = supabaseAdmin
    .from("Page")
    .select(`
      id,
      title,
      slug,
      content,
      excerpt,
      featuredImage,
      status,
      sortOrder,
      metaTitle,
      metaDescription,
      createdAt,
      updatedAt,
      author:User(name)
    `, { count: "exact" });

  if (search) {
    query = query.or(`title.ilike.%${search}%,slug.ilike.%${search}%`);
  }
  if (status && status !== "ALL") {
    query = query.eq("status", status);
  }

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data: pages, count, error } = await query
    .order("createdAt", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error getPages:", error);
    return { data: [], meta: { page, perPage, total: 0, totalPages: 0 } };
  }

  const total = count || 0;
  return {
    data: (pages || []).map((p: any) => ({
      ...p,
      author: Array.isArray(p.author) ? p.author[0] : p.author,
    })),
    meta: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    },
  };
}

export async function getPageById(id: string) {
  const { data: page } = await supabaseAdmin
    .from("Page")
    .select(`
      id,
      title,
      slug,
      content,
      excerpt,
      featuredImage,
      status,
      sortOrder,
      metaTitle,
      metaDescription,
      createdAt,
      updatedAt,
      author:User(name)
    `)
    .eq("id", id)
    .single();

  if (!page) return null;
  return {
    ...page,
    author: Array.isArray(page.author) ? page.author[0] : page.author,
  };
}

export async function createPage(formData: FormData): Promise<ActionResponse> {
  const session = await requirePermission("page.create");

  const raw = {
    title: formData.get("title") as string,
    slug: formData.get("slug") as string,
    content: formData.get("content") as string,
    excerpt: (formData.get("excerpt") as string) || null,
    featuredImage: (formData.get("featuredImage") as string) || null,
    status: (formData.get("status") as string) || "DRAFT",
    metaTitle: (formData.get("metaTitle") as string) || null,
    metaDescription: (formData.get("metaDescription") as string) || null,
  };

  const parsed = pageSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: "Validasi gagal",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const slug =
    parsed.data.slug ||
    slugify(parsed.data.title, { lower: true, strict: true });

  // Check unique slug
  const { data: existing } = await supabaseAdmin
    .from("Page")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
    return { success: false, message: "Slug sudah digunakan" };
  }

  const id = `page_${Date.now()}`;
  const { data: newPage, error } = await supabaseAdmin
    .from("Page")
    .insert({
      id,
      ...parsed.data,
      slug,
      authorId: session.user.id,
    })
    .select()
    .single();

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/dashboard/halaman");
  return { success: true, message: "Halaman berhasil dibuat", data: newPage as any };
}

export async function updatePage(
  id: string,
  formData: FormData
): Promise<ActionResponse> {
  await requirePermission("page.update");

  const raw = {
    title: formData.get("title") as string,
    slug: formData.get("slug") as string,
    content: formData.get("content") as string,
    excerpt: (formData.get("excerpt") as string) || null,
    featuredImage: (formData.get("featuredImage") as string) || null,
    status: (formData.get("status") as string) || "DRAFT",
    metaTitle: (formData.get("metaTitle") as string) || null,
    metaDescription: (formData.get("metaDescription") as string) || null,
  };

  const parsed = pageSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: "Validasi gagal",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const slug =
    parsed.data.slug ||
    slugify(parsed.data.title, { lower: true, strict: true });

  const { error } = await supabaseAdmin
    .from("Page")
    .update({
      ...parsed.data,
      slug,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/dashboard/halaman");
  return { success: true, message: "Halaman berhasil diperbarui" };
}

export async function deletePage(id: string): Promise<ActionResponse> {
  await requirePermission("page.delete");

  // Check navigations using this page
  const { count } = await supabaseAdmin
    .from("Navigation")
    .select("*", { count: "exact", head: true })
    .eq("pageId", id);

  if (count && count > 0) {
    return {
      success: false,
      message: `Halaman masih digunakan oleh ${count} navigasi. Hapus navigasi terkait terlebih dahulu.`,
    };
  }

  const { error } = await supabaseAdmin.from("Page").delete().eq("id", id);
  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/dashboard/halaman");
  return { success: true, message: "Halaman berhasil dihapus" };
}
