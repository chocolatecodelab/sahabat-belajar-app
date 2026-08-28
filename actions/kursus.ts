"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAuth } from "@/lib/auth";
import type { ActionResponse } from "@/types";
import slugify from "slugify";

export type CourseItem = {
  id: string;
  title: string;
  slug: string;
  tagline: string | null;
  description: string;
  category: string;
  price: number;
  salePrice: number | null;
  isFree: boolean;
  level: string;
  deliveryMode: string;
  batchNumber: string | null;
  startDate: string | null;
  duration: string | null;
  maxQuota: number;
  currentEnrolled: number;
  featuredImage: string | null;
  mentorName: string;
  mentorTitle: string;
  mentorAvatar: string | null;
  curriculum: string | null;
  benefits: string | null;
  status: "OPEN" | "UPCOMING" | "FULL" | "CLOSED";
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

/**
 * Get courses list with optional category & status filter
 */
export async function getCourses(params?: {
  category?: string;
  status?: string;
  search?: string;
  activeOnly?: boolean;
}): Promise<CourseItem[]> {
  try {
    let query = supabaseAdmin
      .from("Course")
      .select("*")
      .order("sortOrder", { ascending: true })
      .order("createdAt", { ascending: false });

    if (params?.activeOnly) {
      query = query.eq("isActive", true);
    }

    if (params?.category && params.category !== "Semua") {
      query = query.eq("category", params.category);
    }

    if (params?.status && params.status !== "ALL") {
      query = query.eq("status", params.status);
    }

    if (params?.search?.trim()) {
      query = query.ilike("title", `%${params.search.trim()}%`);
    }

    const { data, error } = await query;
    if (error) {
      console.error("getCourses error:", error);
      return [];
    }

    return (data || []) as CourseItem[];
  } catch (err) {
    console.error("getCourses error:", err);
    return [];
  }
}

/**
 * Get course detail by slug
 */
export async function getCourseBySlug(slug: string): Promise<CourseItem | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("Course")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) {
      return null;
    }
    return data as CourseItem;
  } catch {
    return null;
  }
}

/**
 * Get course detail by ID (for admin edit)
 */
export async function getCourseById(id: string): Promise<CourseItem | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("Course")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;
    return data as CourseItem;
  } catch {
    return null;
  }
}

/**
 * Create a new course from admin
 */
export async function createCourse(formData: FormData): Promise<ActionResponse<CourseItem>> {
  await requireAuth();

  try {
    const title = formData.get("title") as string;
    let slug = formData.get("slug") as string;
    const tagline = formData.get("tagline") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const price = parseInt(formData.get("price") as string) || 0;
    const salePriceStr = formData.get("salePrice") as string;
    const salePrice = salePriceStr ? parseInt(salePriceStr) : null;
    const isFree = formData.get("isFree") === "true";
    const level = (formData.get("level") as string) || "Semua Jenjang";
    const deliveryMode = (formData.get("deliveryMode") as string) || "Live Zoom & Mentorship";
    const batchNumber = formData.get("batchNumber") as string;
    const startDate = formData.get("startDate") as string;
    const duration = formData.get("duration") as string;
    const maxQuota = parseInt(formData.get("maxQuota") as string) || 30;
    const featuredImage = formData.get("featuredImage") as string;
    const mentorName = formData.get("mentorName") as string;
    const mentorTitle = formData.get("mentorTitle") as string;
    const mentorAvatar = formData.get("mentorAvatar") as string;
    const curriculum = formData.get("curriculum") as string;
    const benefits = formData.get("benefits") as string;
    const status = (formData.get("status") as string) || "OPEN";
    const sortOrder = parseInt(formData.get("sortOrder") as string) || 0;
    const isActive = formData.get("isActive") !== "false";

    if (!title) return { success: false, message: "Judul kelas harus diisi" };

    if (!slug) {
      slug = slugify(title, { lower: true, strict: true });
    }

    const id = `course_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const { data, error } = await supabaseAdmin
      .from("Course")
      .insert({
        id,
        title,
        slug,
        tagline: tagline || null,
        description: description || "",
        category: category || "Umum",
        price,
        salePrice,
        isFree,
        level,
        deliveryMode,
        batchNumber: batchNumber || null,
        startDate: startDate || null,
        duration: duration || null,
        maxQuota,
        currentEnrolled: 0,
        featuredImage: featuredImage || null,
        mentorName: mentorName || "Tim Pakar Riset",
        mentorTitle: mentorTitle || "Reviewer Jurnal Internasional",
        mentorAvatar: mentorAvatar || null,
        curriculum: curriculum || null,
        benefits: benefits || null,
        status,
        sortOrder,
        isActive,
      })
      .select("*")
      .single();

    if (error) throw error;

    revalidatePath("/kursus");
    revalidatePath(`/kursus/${slug}`);
    revalidatePath("/dashboard/kursus");

    return { success: true, message: "Program kursus berhasil dibuat", data: data as CourseItem };
  } catch (err: any) {
    console.error("createCourse error:", err);
    return { success: false, message: err?.message || "Gagal membuat program kursus" };
  }
}

/**
 * Update course from admin
 */
export async function updateCourse(id: string, formData: FormData): Promise<ActionResponse<CourseItem>> {
  await requireAuth();

  try {
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const tagline = formData.get("tagline") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const price = parseInt(formData.get("price") as string) || 0;
    const salePriceStr = formData.get("salePrice") as string;
    const salePrice = salePriceStr ? parseInt(salePriceStr) : null;
    const isFree = formData.get("isFree") === "true";
    const level = (formData.get("level") as string) || "Semua Jenjang";
    const deliveryMode = (formData.get("deliveryMode") as string) || "Live Zoom & Mentorship";
    const batchNumber = formData.get("batchNumber") as string;
    const startDate = formData.get("startDate") as string;
    const duration = formData.get("duration") as string;
    const maxQuota = parseInt(formData.get("maxQuota") as string) || 30;
    const featuredImage = formData.get("featuredImage") as string;
    const mentorName = formData.get("mentorName") as string;
    const mentorTitle = formData.get("mentorTitle") as string;
    const mentorAvatar = formData.get("mentorAvatar") as string;
    const curriculum = formData.get("curriculum") as string;
    const benefits = formData.get("benefits") as string;
    const status = (formData.get("status") as string) || "OPEN";
    const sortOrder = parseInt(formData.get("sortOrder") as string) || 0;
    const isActive = formData.get("isActive") !== "false";

    const { data, error } = await supabaseAdmin
      .from("Course")
      .update({
        title,
        slug,
        tagline: tagline || null,
        description: description || "",
        category: category || "Umum",
        price,
        salePrice,
        isFree,
        level,
        deliveryMode,
        batchNumber: batchNumber || null,
        startDate: startDate || null,
        duration: duration || null,
        maxQuota,
        featuredImage: featuredImage || null,
        mentorName: mentorName || "Tim Pakar Riset",
        mentorTitle: mentorTitle || "Reviewer Jurnal Internasional",
        mentorAvatar: mentorAvatar || null,
        curriculum: curriculum || null,
        benefits: benefits || null,
        status,
        sortOrder,
        isActive,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    revalidatePath("/kursus");
    revalidatePath(`/kursus/${slug}`);
    revalidatePath("/dashboard/kursus");

    return { success: true, message: "Program kursus berhasil diperbarui", data: data as CourseItem };
  } catch (err: any) {
    console.error("updateCourse error:", err);
    return { success: false, message: err?.message || "Gagal memperbarui program kursus" };
  }
}

function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Non-HTTP context fallback
  }
}

/**
 * Delete course
 */
export async function deleteCourse(id: string): Promise<ActionResponse> {
  await requireAuth();

  try {
    // 1. Delete associated CourseModule & CourseEnrollment if cascade is not on DB level
    try {
      await supabaseAdmin.from("CourseModule").delete().eq("courseId", id);
      await supabaseAdmin.from("CourseEnrollment").delete().eq("courseId", id);
    } catch {
      // ignore cascade error
    }

    const { error } = await supabaseAdmin.from("Course").delete().eq("id", id);
    if (error) throw error;

    safeRevalidatePath("/kursus");
    safeRevalidatePath("/dashboard/kursus");
    safeRevalidatePath("/belajar");
    return { success: true, message: "Program kursus berhasil dihapus permanen" };
  } catch (err: any) {
    console.error("deleteCourse error:", err);
    return { success: false, message: err?.message || "Gagal menghapus program kursus" };
  }
}
