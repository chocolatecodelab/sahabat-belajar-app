"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { requirePermission } from "@/lib/auth";
import { z } from "zod";
import slugify from "slugify";
import type { ActionResponse } from "@/types";

const articleSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi").max(255),
  slug: z.string().optional(),
  content: z.string().min(1, "Konten wajib diisi"),
  excerpt: z.string().optional().nullable(),
  featuredImage: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  categoryId: z.string().optional().nullable(),
  publishedAt: z.string().optional().nullable(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
});

export async function getArticles(
  page: number = 1,
  perPage: number = 10,
  search?: string,
  status?: string,
  categoryId?: string
) {
  await requirePermission("article.read");

  let query = supabaseAdmin
    .from("Article")
    .select(`
      id,
      title,
      slug,
      content,
      excerpt,
      featuredImage,
      status,
      viewCount,
      publishedAt,
      createdAt,
      updatedAt,
      author:User(name),
      category:Category(name, color, slug)
    `, { count: "exact" });

  if (search) {
    query = query.or(`title.ilike.%${search}%,slug.ilike.%${search}%`);
  }
  if (status && status !== "ALL") {
    query = query.eq("status", status);
  }
  if (categoryId) {
    query = query.eq("categoryId", categoryId);
  }

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data: articles, count, error } = await query
    .order("createdAt", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error getArticles:", error);
    return { data: [], meta: { page, perPage, total: 0, totalPages: 0 } };
  }

  const total = count || 0;
  return {
    data: (articles || []).map((a: any) => ({
      ...a,
      author: Array.isArray(a.author) ? a.author[0] : a.author,
      category: Array.isArray(a.category) ? a.category[0] : a.category,
    })),
    meta: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    },
  };
}

export async function getArticleById(id: string) {
  const { data: article } = await supabaseAdmin
    .from("Article")
    .select(`
      id,
      title,
      slug,
      content,
      excerpt,
      featuredImage,
      status,
      categoryId,
      publishedAt,
      viewCount,
      metaTitle,
      metaDescription,
      createdAt,
      updatedAt,
      author:User(name),
      category:Category(id, name, color, slug)
    `)
    .eq("id", id)
    .single();

  if (!article) return null;
  return {
    ...article,
    author: Array.isArray(article.author) ? article.author[0] : article.author,
    category: Array.isArray(article.category) ? article.category[0] : article.category,
    tags: [],
  };
}

export async function createArticle(
  formData: FormData
): Promise<ActionResponse> {
  const session = await requirePermission("article.create");

  const raw = {
    title: formData.get("title") as string,
    slug: formData.get("slug") as string,
    content: formData.get("content") as string,
    excerpt: (formData.get("excerpt") as string) || null,
    featuredImage: (formData.get("featuredImage") as string) || null,
    status: (formData.get("status") as string) || "DRAFT",
    categoryId: (formData.get("categoryId") as string) || null,
    publishedAt: (formData.get("publishedAt") as string) || null,
    metaTitle: (formData.get("metaTitle") as string) || null,
    metaDescription: (formData.get("metaDescription") as string) || null,
  };

  const parsed = articleSchema.safeParse(raw);
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

  const { data: existing } = await supabaseAdmin
    .from("Article")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
    return { success: false, message: "Slug sudah digunakan" };
  }

  const publishedAt =
    parsed.data.status === "PUBLISHED"
      ? parsed.data.publishedAt
        ? new Date(parsed.data.publishedAt).toISOString()
        : new Date().toISOString()
      : null;

  const id = `art_${Date.now()}`;
  const { error } = await supabaseAdmin.from("Article").insert({
    id,
    title: parsed.data.title,
    slug,
    content: parsed.data.content,
    excerpt: parsed.data.excerpt,
    featuredImage: parsed.data.featuredImage,
    status: parsed.data.status,
    categoryId: parsed.data.categoryId || null,
    publishedAt,
    metaTitle: parsed.data.metaTitle,
    metaDescription: parsed.data.metaDescription,
    authorId: session.user.id,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/dashboard/berita");
  return { success: true, message: "Berita berhasil dibuat" };
}

export async function updateArticle(
  id: string,
  formData: FormData
): Promise<ActionResponse> {
  await requirePermission("article.update");

  const raw = {
    title: formData.get("title") as string,
    slug: formData.get("slug") as string,
    content: formData.get("content") as string,
    excerpt: (formData.get("excerpt") as string) || null,
    featuredImage: (formData.get("featuredImage") as string) || null,
    status: (formData.get("status") as string) || "DRAFT",
    categoryId: (formData.get("categoryId") as string) || null,
    publishedAt: (formData.get("publishedAt") as string) || null,
    metaTitle: (formData.get("metaTitle") as string) || null,
    metaDescription: (formData.get("metaDescription") as string) || null,
  };

  const parsed = articleSchema.safeParse(raw);
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

  const publishedAt =
    parsed.data.status === "PUBLISHED"
      ? parsed.data.publishedAt
        ? new Date(parsed.data.publishedAt).toISOString()
        : new Date().toISOString()
      : null;

  const { error } = await supabaseAdmin
    .from("Article")
    .update({
      title: parsed.data.title,
      slug,
      content: parsed.data.content,
      excerpt: parsed.data.excerpt,
      featuredImage: parsed.data.featuredImage,
      status: parsed.data.status,
      categoryId: parsed.data.categoryId || null,
      publishedAt,
      metaTitle: parsed.data.metaTitle,
      metaDescription: parsed.data.metaDescription,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/dashboard/berita");
  return { success: true, message: "Berita berhasil diperbarui" };
}

export async function deleteArticle(id: string): Promise<ActionResponse> {
  await requirePermission("article.delete");

  const { error } = await supabaseAdmin.from("Article").delete().eq("id", id);
  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/dashboard/berita");
  return { success: true, message: "Berita berhasil dihapus" };
}
