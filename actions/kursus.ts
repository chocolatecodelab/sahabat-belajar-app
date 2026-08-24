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

const DEFAULT_COURSES = [
  {
    id: "course_scopus_mastery",
    title: "Mentorship Intensif Publikasi Jurnal Scopus & SINTA 1-2",
    slug: "mentorship-publikasi-jurnal-scopus-sinta",
    tagline: "Bimbingan langkah demi langkah dari draft mentah hingga tembus Accepted di Jurnal Bereputasi Internasional",
    description: "Program mentorship komprehensif yang dirancang untuk dosen, mahasiswa S2/S3, dan peneliti yang ingin mempublikasikan karya ilmiah di jurnal terindeks Scopus (Q1-Q4) dan SINTA 1-2. Dibimbing langsung oleh Reviewer Jurnal Internasional dengan garansi pendampingan hingga tahap revisi reviewer.",
    category: "Scopus & SINTA",
    price: 950000,
    salePrice: 650000,
    isFree: false,
    level: "Menengah ke Lanjutan",
    deliveryMode: "Live Zoom & 1-on-1 Mentorship",
    batchNumber: "Batch 14",
    startDate: "15 September 2026",
    duration: "4 Minggu (8 Sesi Live + Review Draft)",
    maxQuota: 25,
    currentEnrolled: 18,
    featuredImage: null,
    mentorName: "Dr. Ir. Hendra Gunawan, M.Sc.",
    mentorTitle: "Chief Editor & Reviewer Jurnal Scopus Q1 (H-Index 14)",
    mentorAvatar: null,
    curriculum: JSON.stringify([
      "Sesi 1: Membedah Anatomi & Standar Naskah Jurnal Scopus Q1-Q4",
      "Sesi 2: Strategi Novelty & State-of-the-Art (Formula GAP Analysis)",
      "Sesi 3: Penulisan Introduction & Literature Review Berbobot",
      "Sesi 4: Penyajian Metodologi Riset & Data Visualization yang Memikat",
      "Sesi 5: Penulisan Discussion & Theoretical/Practical Implications",
      "Sesi 6: Teknik Memilih Target Jurnal & Menghindari Predatory Publishers",
      "Sesi 7: Penulisan Cover Letter & Submission Process",
      "Sesi 8: Strategi Membalas Komentar Reviewer (Response to Reviewers)"
    ]),
    benefits: JSON.stringify([
      "8 Sesi Live Interactive Workshop (Zoom Recording Akses Seumur Hidup)",
      "Review & Feedback 1-on-1 Naskah Artikel oleh Mentor",
      "Template Cover Letter & Response to Reviewer Berstandar Internasional",
      "E-Sertifikat Pelatihan 32 JP Resmi BIAS RISTEK",
      "Akses Grup Komunitas Peneliti Alumni Scopus Seumur Hidup"
    ]),
    status: "OPEN",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "course_smartpls_sem",
    title: "Mastering Analisis Data Kuantitatif: SmartPLS 4 & SEM",
    slug: "mastering-analisis-data-smartpls-4-sem",
    tagline: "Kuasai Uji Validitas, Reliabilitas, Mediasi, Moderasi hingga Bootstrap untuk Skripsi & Tesis",
    description: "Kuasai metode Partial Least Squares Structural Equation Modeling (PLS-SEM) menggunakan software terbaru SmartPLS 4. Sangat cocok bagi mahasiswa dan peneliti rumpun manajemen, sosial, psikologi, dan pendidikan yang sedang menyusun tugas akhir atau artikel ilmiah.",
    category: "SmartPLS & SEM",
    price: 650000,
    salePrice: 425000,
    isFree: false,
    level: "Pemula hingga Menengah",
    deliveryMode: "Live Zoom & Praktik Hands-On",
    batchNumber: "Batch 21",
    startDate: "20 September 2026",
    duration: "3 Minggu (6 Sesi)",
    maxQuota: 35,
    currentEnrolled: 29,
    featuredImage: null,
    mentorName: "Nazaruddin, M.Kom., Ph.D.",
    mentorTitle: "Pakar Ekonometrika & Analisis Data Statistik",
    mentorAvatar: null,
    curriculum: JSON.stringify([
      "Sesi 1: Pengantar PLS-SEM & Navigasi Antarmuka SmartPLS 4",
      "Sesi 2: Evaluasi Measurement Model (Outer Model): Convergent & Discriminant Validity",
      "Sesi 3: Evaluasi Structural Model (Inner Model): R-Square, Q-Square, f-Square",
      "Sesi 4: Analisis Variabel Mediasi (Indirect Effect) dengan Metode Bootstrapping",
      "Sesi 5: Analisis Variabel Moderasi (Two-Stage & Orthogonalizing Approach)",
      "Sesi 6: Interpretasi Output & Panduan Penulisan Bab 4 Skripsi/Tesis"
    ]),
    benefits: JSON.stringify([
      "Dataset Latihan Praktik Lengkap (Excel & SmartPLS Project)",
      "Template Format Laporan Hasil Analisis Bab 4 Standar Akademik",
      "E-Sertifikat Pelatihan Kompetensi Olah Data 24 JP",
      "Konsultasi Kendala Olah Data Pasca Pelatihan via Grup WhatsApp"
    ]),
    status: "OPEN",
    sortOrder: 2,
    isActive: true,
  },
  {
    id: "course_tesis_disertasi",
    title: "Bootcamp Pendampingan Skripsi, Tesis & Disertasi Cepat Lulus",
    slug: "bootcamp-pendampingan-skripsi-tesis-disertasi",
    tagline: "Bimbingan terstruktur dari penentuan judul, Bab 1-5, hingga simulasi sidang ujian",
    description: "Pendampingan intensif bagi pejuang tugas akhir yang sedang stuck atau mengalami kendala dengan dosen pembimbing. Program ini memberikan arahan metodologis, struktur penulisan yang rapi, dan simulasi presentasi sidang ujian akhir.",
    category: "Bimbingan Tesis",
    price: 850000,
    salePrice: 550000,
    isFree: false,
    level: "Semua Jenjang",
    deliveryMode: "Mentorship Intensif & Diskusi Kasus",
    batchNumber: "Batch 09",
    startDate: "25 September 2026",
    duration: "4 Minggu",
    maxQuota: 20,
    currentEnrolled: 14,
    featuredImage: null,
    mentorName: "Prof. Dr. Ratna Sulistiyani",
    mentorTitle: "Guru Besar & Pembimbing Pascasarjana Berpengalaman",
    mentorAvatar: null,
    curriculum: JSON.stringify([
      "Modul 1: Strategi Menemukan Judul Riset yang Menarik & Relevan",
      "Modul 2: Konstruksi Bab 1 (Latar Belakang Masalah Berbasis Data Riil)",
      "Modul 3: Tinjauan Pustaka & Kerangka Konseptual yang Kuat",
      "Modul 4: Pemilihan Desain Riset & Teknik Pengambilan Sampel",
      "Modul 5: Penulisan Bab 4 (Hasil Analisis) & Bab 5 (Kesimpulan & Saran)",
      "Modul 6: Teknik Menjawab Pertanyaan Penguji & Simulasi Sidang Ujian"
    ]),
    benefits: JSON.stringify([
      "Template Sistematika Skripsi & Tesis Standar Perguruan Tinggi",
      "Checklist Kelengkapan Berkas Sidang & Tips Psikologis",
      "E-Sertifikat Partisipasi Bootcamp Riset",
      "Akses Bimbingan Tanya Jawab Langsung Bersama Mentor Pakar"
    ]),
    status: "OPEN",
    sortOrder: 3,
    isActive: true,
  }
];

/**
 * Auto-seed default courses if table is empty
 */
async function autoSeedCourses(): Promise<void> {
  try {
    const { count } = await supabaseAdmin.from("Course").select("*", { count: "exact", head: true });
    if (!count || count === 0) {
      await supabaseAdmin.from("Course").upsert(DEFAULT_COURSES);
    }
  } catch (err) {
    console.error("Auto seed courses error:", err);
  }
}

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
    await autoSeedCourses();

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
      if (error.code === "PGRST205") {
        // Table not created yet in Supabase, return default courses
        let fallback = [...DEFAULT_COURSES];
        if (params?.category && params.category !== "Semua") {
          fallback = fallback.filter((c) => c.category === params.category);
        }
        if (params?.search?.trim()) {
          fallback = fallback.filter((c) => c.title.toLowerCase().includes(params.search!.toLowerCase()));
        }
        return fallback as CourseItem[];
      }
      return [];
    }

    if (!data || data.length === 0) {
      return DEFAULT_COURSES as CourseItem[];
    }

    return (data || []) as CourseItem[];
  } catch (err) {
    console.error("getCourses error:", err);
    return DEFAULT_COURSES as CourseItem[];
  }
}

/**
 * Get course detail by slug
 */
export async function getCourseBySlug(slug: string): Promise<CourseItem | null> {
  try {
    await autoSeedCourses();

    const { data, error } = await supabaseAdmin
      .from("Course")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) {
      const fallback = DEFAULT_COURSES.find((c) => c.slug === slug);
      return (fallback as CourseItem) || null;
    }
    return data as CourseItem;
  } catch {
    const fallback = DEFAULT_COURSES.find((c) => c.slug === slug);
    return (fallback as CourseItem) || null;
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

/**
 * Delete course
 */
export async function deleteCourse(id: string): Promise<ActionResponse> {
  await requireAuth();

  try {
    const { error } = await supabaseAdmin.from("Course").delete().eq("id", id);
    if (error) throw error;

    revalidatePath("/kursus");
    revalidatePath("/dashboard/kursus");
    return { success: true, message: "Program kursus berhasil dihapus" };
  } catch (err: any) {
    console.error("deleteCourse error:", err);
    return { success: false, message: err?.message || "Gagal menghapus program kursus" };
  }
}
