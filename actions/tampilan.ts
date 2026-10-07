"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { requirePermission } from "@/lib/auth";
import type { ActionResponse } from "@/types";

// ============================
// HERO SLIDES
// ============================

export async function getHeroSlides() {
  const { data: slides } = await supabaseAdmin
    .from("HeroSlide")
    .select("*")
    .order("sortOrder", { ascending: true });
  return slides || [];
}

export async function createHeroSlide(
  formData: FormData
): Promise<ActionResponse> {
  await requirePermission("appearance.create");

  const title = formData.get("title") as string;
  const subtitle = (formData.get("subtitle") as string) || null;
  const backgroundImage = formData.get("backgroundImage") as string;
  const ctaText = (formData.get("ctaText") as string) || null;
  const ctaLink = (formData.get("ctaLink") as string) || null;

  if (!title || !backgroundImage) {
    return { success: false, message: "Judul dan gambar wajib diisi" };
  }

  const id = `hero_${Date.now()}`;
  const { error } = await supabaseAdmin.from("HeroSlide").insert({
    id,
    title,
    subtitle,
    backgroundImage,
    ctaText,
    ctaLink,
    sortOrder: 0,
  });

  if (error) return { success: false, message: error.message };

  revalidatePath("/dashboard/tampilan/hero");
  return { success: true, message: "Slide berhasil dibuat" };
}

export async function updateHeroSlide(
  id: string,
  formData: FormData
): Promise<ActionResponse> {
  await requirePermission("appearance.update");

  const title = formData.get("title") as string;
  const subtitle = (formData.get("subtitle") as string) || null;
  const backgroundImage = formData.get("backgroundImage") as string;
  const ctaText = (formData.get("ctaText") as string) || null;
  const ctaLink = (formData.get("ctaLink") as string) || null;
  const isActive = formData.get("isActive") === "true";

  const { error } = await supabaseAdmin
    .from("HeroSlide")
    .update({
      title,
      subtitle,
      backgroundImage,
      ctaText,
      ctaLink,
      isActive,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { success: false, message: error.message };

  revalidatePath("/dashboard/tampilan/hero");
  return { success: true, message: "Slide berhasil diperbarui" };
}

export async function deleteHeroSlide(id: string): Promise<ActionResponse> {
  await requirePermission("appearance.delete");
  const { error } = await supabaseAdmin.from("HeroSlide").delete().eq("id", id);
  if (error) return { success: false, message: error.message };
  revalidatePath("/dashboard/tampilan/hero");
  return { success: true, message: "Slide berhasil dihapus" };
}

// ============================
// SERVICES / LAYANAN
// ============================

export async function getServices() {
  const { data: services } = await supabaseAdmin
    .from("Service")
    .select("*")
    .order("sortOrder", { ascending: true });
  return services || [];
}

export async function createService(
  formData: FormData
): Promise<ActionResponse> {
  await requirePermission("appearance.create");

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const icon = formData.get("icon") as string;
  const link = (formData.get("link") as string) || null;

  if (!title || !description || !icon) {
    return { success: false, message: "Judul, deskripsi, dan icon wajib diisi" };
  }

  const id = `srv_${Date.now()}`;
  const { error } = await supabaseAdmin.from("Service").insert({
    id,
    title,
    description,
    icon,
    link,
    sortOrder: 0,
  });

  if (error) return { success: false, message: error.message };

  revalidatePath("/dashboard/tampilan/layanan");
  return { success: true, message: "Layanan berhasil dibuat" };
}

export async function updateService(
  id: string,
  formData: FormData
): Promise<ActionResponse> {
  await requirePermission("appearance.update");

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const icon = formData.get("icon") as string;
  const link = (formData.get("link") as string) || null;
  const isActive = formData.get("isActive") === "true";

  const { error } = await supabaseAdmin
    .from("Service")
    .update({
      title,
      description,
      icon,
      link,
      isActive,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { success: false, message: error.message };

  revalidatePath("/dashboard/tampilan/layanan");
  return { success: true, message: "Layanan berhasil diperbarui" };
}

export async function deleteService(id: string): Promise<ActionResponse> {
  await requirePermission("appearance.delete");
  const { error } = await supabaseAdmin.from("Service").delete().eq("id", id);
  if (error) return { success: false, message: error.message };
  revalidatePath("/dashboard/tampilan/layanan");
  return { success: true, message: "Layanan berhasil dihapus" };
}

// ============================
// SOCIAL MEDIA
// ============================

export async function getSocialMedia() {
  const { data: items } = await supabaseAdmin
    .from("SocialMedia")
    .select("*")
    .order("sortOrder", { ascending: true });
  return items || [];
}

export async function createSocialMedia(
  formData: FormData
): Promise<ActionResponse> {
  await requirePermission("appearance.create");

  const platform = formData.get("platform") as string;
  const username = formData.get("username") as string;
  const url = formData.get("url") as string;
  const embedCode = (formData.get("embedCode") as string) || null;

  if (!platform || !username || !url) {
    return {
      success: false,
      message: "Platform, username, dan URL wajib diisi",
    };
  }

  const id = `soc_${Date.now()}`;
  const { error } = await supabaseAdmin.from("SocialMedia").insert({
    id,
    platform,
    username,
    url,
    embedCode,
    sortOrder: 0,
  });

  if (error) return { success: false, message: error.message };

  revalidatePath("/dashboard/tampilan/sosial-media");
  return { success: true, message: "Sosial media berhasil ditambahkan" };
}

export async function updateSocialMedia(
  id: string,
  formData: FormData
): Promise<ActionResponse> {
  await requirePermission("appearance.update");

  const platform = formData.get("platform") as string;
  const username = formData.get("username") as string;
  const url = formData.get("url") as string;
  const embedCode = (formData.get("embedCode") as string) || null;
  const isActive = formData.get("isActive") === "true";

  const { error } = await supabaseAdmin
    .from("SocialMedia")
    .update({
      platform,
      username,
      url,
      embedCode,
      isActive,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { success: false, message: error.message };

  revalidatePath("/dashboard/tampilan/sosial-media");
  return { success: true, message: "Sosial media berhasil diperbarui" };
}

export async function deleteSocialMedia(id: string): Promise<ActionResponse> {
  await requirePermission("appearance.delete");
  const { error } = await supabaseAdmin.from("SocialMedia").delete().eq("id", id);
  if (error) return { success: false, message: error.message };
  revalidatePath("/dashboard/tampilan/sosial-media");
  return { success: true, message: "Sosial media berhasil dihapus" };
}

// ============================
// SITE SETTINGS
// ============================

export async function getSiteSettings() {
  const { data: settings } = await supabaseAdmin
    .from("SiteSettings")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (!settings) {
    const defaultObj = {
      id: "default_settings",
      siteName: "BIAS RISTEK",
      siteDescription: "Badan Inovasi Akademik & Sains - Program Pengembangan Riset dan Teknologi",
      newsPerPage: 6,
      heroEnabled: true,
      serviceEnabled: true,
      newsEnabled: true,
      socialEnabled: true,
    };
    return defaultObj;
  }
  return settings;
}

export async function updateSiteSettings(
  formData: FormData
): Promise<ActionResponse> {
  await requirePermission("settings.update");

  const settings = await getSiteSettings();

  const updateData: Record<string, any> = {
    id: settings.id || "default_settings",
    siteName: formData.has("siteName") ? (formData.get("siteName") as string) : (settings.siteName || "BIAS RISTEK"),
    siteDescription: formData.has("siteDescription") ? (formData.get("siteDescription") as string) : settings.siteDescription,
    logo: formData.has("logo") ? (formData.get("logo") as string) : settings.logo,
    contactEmail: formData.has("contactEmail") ? (formData.get("contactEmail") as string) : settings.contactEmail,
    contactPhone: formData.has("contactPhone") ? (formData.get("contactPhone") as string) : settings.contactPhone,
    address: formData.has("address") ? (formData.get("address") as string) : settings.address,
    updatedAt: new Date().toISOString(),
  };

  if (formData.has("newsPerPage")) {
    updateData.newsPerPage = parseInt((formData.get("newsPerPage") as string) || "6") || 6;
  }
  if (formData.has("heroEnabled")) {
    updateData.heroEnabled = formData.get("heroEnabled") === "true" || formData.get("heroEnabled") === "on";
  }
  if (formData.has("serviceEnabled")) {
    updateData.serviceEnabled = formData.get("serviceEnabled") === "true" || formData.get("serviceEnabled") === "on";
  }
  if (formData.has("newsEnabled")) {
    updateData.newsEnabled = formData.get("newsEnabled") === "true" || formData.get("newsEnabled") === "on";
  }
  if (formData.has("socialEnabled")) {
    updateData.socialEnabled = formData.get("socialEnabled") === "true" || formData.get("socialEnabled") === "on";
  }

  const { error } = await supabaseAdmin
    .from("SiteSettings")
    .upsert(updateData);

  if (error) return { success: false, message: error.message };

  revalidatePath("/dashboard/pengaturan");
  revalidatePath("/dashboard/tampilan/berita");
  revalidatePath("/");
  return { success: true, message: "Pengaturan berhasil disimpan" };
}

// ============================
// STATISTIK / STAT COUNTERS
// ============================

const INITIAL_STATS = [
  { id: "stat_1", value: "2.500+", label: "Alumni Peneliti Terbimbing", icon: "Users", sortOrder: 1, isActive: true },
  { id: "stat_2", value: "180+", label: "Artikel Terbit Scopus & SINTA", icon: "BookOpen", sortOrder: 2, isActive: true },
  { id: "stat_3", value: "98%", label: "Kelulusan Tugas Akhir Tepat Waktu", icon: "Award", sortOrder: 3, isActive: true },
  { id: "stat_4", value: "25+", label: "Mentor Akademisi & Reviewer", icon: "GraduationCap", sortOrder: 4, isActive: true },
];

export async function getStats() {
  try {
    const { data, error } = await supabaseAdmin
      .from("StatCounter")
      .select("*")
      .order("sortOrder", { ascending: true });

    if (error || !data || data.length === 0) {
      try {
        await supabaseAdmin.from("StatCounter").upsert(INITIAL_STATS);
      } catch {}
      return INITIAL_STATS;
    }
    return data;
  } catch {
    return INITIAL_STATS;
  }
}

export async function createStat(formData: FormData): Promise<ActionResponse> {
  await requirePermission("appearance.create");

  const value = formData.get("value") as string;
  const label = formData.get("label") as string;
  const icon = (formData.get("icon") as string) || "Users";
  const sortOrder = parseInt((formData.get("sortOrder") as string) || "0") || 0;
  const isActive = formData.get("isActive") !== "false";

  if (!value || !label) {
    return { success: false, message: "Nilai dan label statistik wajib diisi" };
  }

  const id = `stat_${Date.now()}`;
  const { error } = await supabaseAdmin.from("StatCounter").insert({
    id,
    value,
    label,
    icon,
    sortOrder,
    isActive,
  });

  if (error) return { success: false, message: error.message };

  revalidatePath("/dashboard/tampilan/statistik");
  revalidatePath("/");
  return { success: true, message: "Statistik berhasil ditambahkan" };
}

export async function updateStat(id: string, formData: FormData): Promise<ActionResponse> {
  await requirePermission("appearance.update");

  const value = formData.get("value") as string;
  const label = formData.get("label") as string;
  const icon = (formData.get("icon") as string) || "Users";
  const sortOrder = parseInt((formData.get("sortOrder") as string) || "0") || 0;
  const isActive = formData.get("isActive") !== "false";

  if (!value || !label) {
    return { success: false, message: "Nilai dan label statistik wajib diisi" };
  }

  const { error } = await supabaseAdmin
    .from("StatCounter")
    .update({
      value,
      label,
      icon,
      sortOrder,
      isActive,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { success: false, message: error.message };

  revalidatePath("/dashboard/tampilan/statistik");
  revalidatePath("/");
  return { success: true, message: "Statistik berhasil diperbarui" };
}

export async function deleteStat(id: string): Promise<ActionResponse> {
  await requirePermission("appearance.delete");

  const { error } = await supabaseAdmin.from("StatCounter").delete().eq("id", id);
  if (error) return { success: false, message: error.message };

  revalidatePath("/dashboard/tampilan/statistik");
  revalidatePath("/");
  return { success: true, message: "Statistik berhasil dihapus" };
}

// ============================
// ALUR BELAJAR / LEARNING STEPS
// ============================

const INITIAL_STEPS = [
  { id: "step_1", stepNumber: 1, title: "Konsultasi & Pilih Program", description: "Pilih kelas atau bimbingan privat yang sesuai dengan kendala dan target riset Anda.", icon: "Compass", sortOrder: 1, isActive: true },
  { id: "step_2", stepNumber: 2, title: "Live Session & Akses Modul", description: "Pelajari metodologi, statistik, dan sistematika penulisan ilmiah secara interaktif.", icon: "Video", sortOrder: 2, isActive: true },
  { id: "step_3", stepNumber: 3, title: "Bedah Manuskrip 1-on-1", description: "Draft judul, bab tugas akhir, atau artikel jurnal Anda dikoreksi langsung oleh mentor pakar.", icon: "FileEdit", sortOrder: 3, isActive: true },
  { id: "step_4", stepNumber: 4, title: "Publikasi & Ujian Sidang", description: "Manuskrip siap submit ke jurnal bereputasi atau siap presentasi ujian skripsi/tesis.", icon: "Send", sortOrder: 4, isActive: true },
];

export async function getLearningSteps() {
  try {
    const { data, error } = await supabaseAdmin
      .from("LearningStep")
      .select("*")
      .order("stepNumber", { ascending: true });

    if (error || !data || data.length === 0) {
      try {
        await supabaseAdmin.from("LearningStep").upsert(INITIAL_STEPS);
      } catch {}
      return INITIAL_STEPS;
    }
    return data;
  } catch {
    return INITIAL_STEPS;
  }
}

export async function createLearningStep(formData: FormData): Promise<ActionResponse> {
  await requirePermission("appearance.create");

  const stepNumber = parseInt((formData.get("stepNumber") as string) || "1") || 1;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const icon = (formData.get("icon") as string) || "Compass";
  const isActive = formData.get("isActive") !== "false";

  if (!title || !description) {
    return { success: false, message: "Judul dan deskripsi langkah wajib diisi" };
  }

  const id = `step_${Date.now()}`;
  const { error } = await supabaseAdmin.from("LearningStep").insert({
    id,
    stepNumber,
    title,
    description,
    icon,
    sortOrder: stepNumber,
    isActive,
  });

  if (error) return { success: false, message: error.message };

  revalidatePath("/dashboard/tampilan/alur-belajar");
  revalidatePath("/");
  return { success: true, message: "Langkah alur belajar berhasil ditambahkan" };
}

export async function updateLearningStep(id: string, formData: FormData): Promise<ActionResponse> {
  await requirePermission("appearance.update");

  const stepNumber = parseInt((formData.get("stepNumber") as string) || "1") || 1;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const icon = (formData.get("icon") as string) || "Compass";
  const isActive = formData.get("isActive") !== "false";

  if (!title || !description) {
    return { success: false, message: "Judul dan deskripsi langkah wajib diisi" };
  }

  const { error } = await supabaseAdmin
    .from("LearningStep")
    .update({
      stepNumber,
      title,
      description,
      icon,
      sortOrder: stepNumber,
      isActive,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { success: false, message: error.message };

  revalidatePath("/dashboard/tampilan/alur-belajar");
  revalidatePath("/");
  return { success: true, message: "Langkah alur belajar berhasil diperbarui" };
}

export async function deleteLearningStep(id: string): Promise<ActionResponse> {
  await requirePermission("appearance.delete");

  const { error } = await supabaseAdmin.from("LearningStep").delete().eq("id", id);
  if (error) return { success: false, message: error.message };

  revalidatePath("/dashboard/tampilan/alur-belajar");
  revalidatePath("/");
  return { success: true, message: "Langkah alur belajar berhasil dihapus" };
}

// ============================
// KEUNGGULAN / ADVANTAGES
// ============================

const INITIAL_ADVANTAGES = [
  { id: "adv_1", title: "Bimbingan Praktik Nyata (Hands-on)", description: "Bukan hanya sekadar teori, kami membedah langsung draft, olah data, dan manuskrip penelitian Anda.", icon: "CheckCircle2", sortOrder: 1, isActive: true },
  { id: "adv_2", title: "Mentor Peneliti & Reviewer Scopus", description: "Diajar langsung oleh akademisi aktif dengan rekam jejak publikasi jurnal internasional bereputasi.", icon: "GraduationCap", sortOrder: 2, isActive: true },
  { id: "adv_3", title: "Akses Rekaman & Modul Selamanya", description: "Belajar fleksibel kapan saja dengan rekaman kelas HD, template dokumen, dan dataset latihan.", icon: "Clock", sortOrder: 3, isActive: true },
  { id: "adv_4", title: "Jejaring Komunitas Peneliti", description: "Gabung ke forum kolaborasi riset, bertukar ide, sitasi, dan peluang publikasi bersama alumni se-Indonesia.", icon: "Users", sortOrder: 4, isActive: true },
];

export async function getAdvantages() {
  try {
    const { data, error } = await supabaseAdmin
      .from("Advantage")
      .select("*")
      .order("sortOrder", { ascending: true });

    if (error || !data || data.length === 0) {
      try {
        await supabaseAdmin.from("Advantage").upsert(INITIAL_ADVANTAGES);
      } catch {}
      return INITIAL_ADVANTAGES;
    }
    return data;
  } catch {
    return INITIAL_ADVANTAGES;
  }
}

export async function createAdvantage(formData: FormData): Promise<ActionResponse> {
  await requirePermission("appearance.create");

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const icon = (formData.get("icon") as string) || "CheckCircle2";
  const sortOrder = parseInt((formData.get("sortOrder") as string) || "0") || 0;
  const isActive = formData.get("isActive") !== "false";

  if (!title || !description) {
    return { success: false, message: "Judul dan deskripsi keunggulan wajib diisi" };
  }

  const id = `adv_${Date.now()}`;
  const { error } = await supabaseAdmin.from("Advantage").insert({
    id,
    title,
    description,
    icon,
    sortOrder,
    isActive,
  });

  if (error) return { success: false, message: error.message };

  revalidatePath("/dashboard/tampilan/keunggulan");
  revalidatePath("/");
  return { success: true, message: "Keunggulan berhasil ditambahkan" };
}

export async function updateAdvantage(id: string, formData: FormData): Promise<ActionResponse> {
  await requirePermission("appearance.update");

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const icon = (formData.get("icon") as string) || "CheckCircle2";
  const sortOrder = parseInt((formData.get("sortOrder") as string) || "0") || 0;
  const isActive = formData.get("isActive") !== "false";

  if (!title || !description) {
    return { success: false, message: "Judul dan deskripsi keunggulan wajib diisi" };
  }

  const { error } = await supabaseAdmin
    .from("Advantage")
    .update({
      title,
      description,
      icon,
      sortOrder,
      isActive,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { success: false, message: error.message };

  revalidatePath("/dashboard/tampilan/keunggulan");
  revalidatePath("/");
  return { success: true, message: "Keunggulan berhasil diperbarui" };
}

export async function deleteAdvantage(id: string): Promise<ActionResponse> {
  await requirePermission("appearance.delete");

  const { error } = await supabaseAdmin.from("Advantage").delete().eq("id", id);
  if (error) return { success: false, message: error.message };

  revalidatePath("/dashboard/tampilan/keunggulan");
  revalidatePath("/");
  return { success: true, message: "Keunggulan berhasil dihapus" };
}

// ============================
// TESTIMONIALS / TESTIMONI ALUMNI
// ============================

const INITIAL_TESTIMONIALS = [
  { id: "testi_1", name: "Ahmad Fauzi, S.Si., M.Sc.", role: "Alumni Bootcamp Scopus", institution: "Universitas Lambung Mangkurat", content: "Alhamdulillah berkat bimbingan intensif dan bedah manuskrip di BIAS RISTEK, artikel tesis saya berhasil tembus jurnal Scopus Q2 hanya dalam 3 bulan revisi!", rating: 5, achievement: "Terbit Jurnal Scopus Q2", sortOrder: 1, isActive: true },
  { id: "testi_2", name: "Siti Rahmawati", role: "Mahasiswa S1 Farmasi", institution: "Universitas Airlangga", content: "Awalnya bingung banget mau mulai skripsi dari mana dan olah data SPSS selalu error. Mentornya sangat sabar membimbing dari nol sampai sidang dapat nilai A!", rating: 5, achievement: "Skripsi Nilai A & Lulus Cumlaude", sortOrder: 2, isActive: true },
  { id: "testi_3", name: "Dr. Hendra Gunawan", role: "Dosen & Peneliti Muda", institution: "Institut Teknologi Bandung", content: "Pelatihan Systematic Literature Review (PRISMA) sangat aplikatif dan terstruktur. Sangat direkomendasikan untuk dosen yang sedang mengejar hibah riset.", rating: 5, achievement: "Lolos Hibah Riset Dikti", sortOrder: 3, isActive: true },
];

export async function getTestimonials() {
  try {
    const { data, error } = await supabaseAdmin
      .from("Testimonial")
      .select("*")
      .order("sortOrder", { ascending: true });

    if (error || !data || data.length === 0) {
      try {
        await supabaseAdmin.from("Testimonial").upsert(INITIAL_TESTIMONIALS);
      } catch {}
      return INITIAL_TESTIMONIALS;
    }
    return data;
  } catch {
    return INITIAL_TESTIMONIALS;
  }
}

export async function createTestimonial(formData: FormData): Promise<ActionResponse> {
  await requirePermission("appearance.create");

  const name = formData.get("name") as string;
  const role = formData.get("role") as string;
  const institution = (formData.get("institution") as string) || null;
  const content = formData.get("content") as string;
  const achievement = (formData.get("achievement") as string) || null;
  const avatar = (formData.get("avatar") as string) || null;
  const rating = parseInt((formData.get("rating") as string) || "5") || 5;
  const sortOrder = parseInt((formData.get("sortOrder") as string) || "0") || 0;
  const isActive = formData.get("isActive") !== "false";

  if (!name || !role || !content) {
    return { success: false, message: "Nama, status/role, dan testimoni wajib diisi" };
  }

  const id = `testi_${Date.now()}`;
  const { error } = await supabaseAdmin.from("Testimonial").insert({
    id,
    name,
    role,
    institution,
    content,
    avatar,
    rating,
    achievement,
    sortOrder,
    isActive,
  });

  if (error) return { success: false, message: error.message };

  revalidatePath("/dashboard/tampilan/testimoni");
  revalidatePath("/");
  return { success: true, message: "Testimoni berhasil ditambahkan" };
}

export async function updateTestimonial(id: string, formData: FormData): Promise<ActionResponse> {
  await requirePermission("appearance.update");

  const name = formData.get("name") as string;
  const role = formData.get("role") as string;
  const institution = (formData.get("institution") as string) || null;
  const content = formData.get("content") as string;
  const achievement = (formData.get("achievement") as string) || null;
  const avatar = (formData.get("avatar") as string) || null;
  const rating = parseInt((formData.get("rating") as string) || "5") || 5;
  const sortOrder = parseInt((formData.get("sortOrder") as string) || "0") || 0;
  const isActive = formData.get("isActive") !== "false";

  if (!name || !role || !content) {
    return { success: false, message: "Nama, status/role, dan testimoni wajib diisi" };
  }

  const { error } = await supabaseAdmin
    .from("Testimonial")
    .update({
      name,
      role,
      institution,
      content,
      avatar,
      rating,
      achievement,
      sortOrder,
      isActive,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { success: false, message: error.message };

  revalidatePath("/dashboard/tampilan/testimoni");
  revalidatePath("/");
  return { success: true, message: "Testimoni berhasil diperbarui" };
}

export async function deleteTestimonial(id: string): Promise<ActionResponse> {
  await requirePermission("appearance.delete");

  const { error } = await supabaseAdmin.from("Testimonial").delete().eq("id", id);
  if (error) return { success: false, message: error.message };

  revalidatePath("/dashboard/tampilan/testimoni");
  revalidatePath("/");
  return { success: true, message: "Testimoni berhasil dihapus" };
}

// ============================
// FAQS (PERTANYAAN UMUM)
// ============================

const INITIAL_FAQS = [
  { id: "faq_1", question: "Apakah pemula yang belum punya judul riset bisa mendaftar?", answer: "Sangat bisa! Kami memiliki program kelas dasar dan bimbingan 1-on-1 yang akan memandu Anda mulai dari penentuan topik, perumusan research gap, hingga penyusunan proposal.", category: "Pendaftaran", sortOrder: 1, isActive: true },
  { id: "faq_2", question: "Apakah peserta akan mendapatkan sertifikat resmi?", answer: "Ya, setiap peserta yang menyelesaikan program kursus atau bootcamp akan mendapatkan e-Sertifikat resmi ber-SKP yang dapat digunakan sebagai portofolio akademik.", category: "Sertifikat", sortOrder: 2, isActive: true },
  { id: "faq_3", question: "Bagaimana jika saya berhalangan hadir saat live session?", answer: "Jangan khawatir, semua sesi live class direkam dengan kualitas HD dan dapat Anda tonton ulang kapan saja di portal pembelajaran tanpa batas waktu kedaluwarsa.", category: "Bimbingan", sortOrder: 3, isActive: true },
  { id: "faq_4", question: "Bagaimana sistem bimbingan dan bedah draft manuskrip?", answer: "Peserta dapat mengunggah draft (proposal, bab tugas akhir, atau artikel). Mentor akan memberikan catatan perbaikan mendalam (inline feedback) dan sesi diskusi privat via Zoom/Google Meet.", category: "Bimbingan", sortOrder: 4, isActive: true },
];

export async function getFaqs() {
  try {
    const { data, error } = await supabaseAdmin
      .from("Faq")
      .select("*")
      .order("sortOrder", { ascending: true });

    if (error || !data || data.length === 0) {
      try {
        await supabaseAdmin.from("Faq").upsert(INITIAL_FAQS);
      } catch {}
      return INITIAL_FAQS;
    }
    return data;
  } catch {
    return INITIAL_FAQS;
  }
}

export async function createFaq(formData: FormData): Promise<ActionResponse> {
  await requirePermission("appearance.create");

  const question = formData.get("question") as string;
  const answer = formData.get("answer") as string;
  const category = (formData.get("category") as string) || "Umum";
  const sortOrder = parseInt((formData.get("sortOrder") as string) || "0") || 0;
  const isActive = formData.get("isActive") !== "false";

  if (!question || !answer) {
    return { success: false, message: "Pertanyaan dan jawaban FAQ wajib diisi" };
  }

  const id = `faq_${Date.now()}`;
  const { error } = await supabaseAdmin.from("Faq").insert({
    id,
    question,
    answer,
    category,
    sortOrder,
    isActive,
  });

  if (error) return { success: false, message: error.message };

  revalidatePath("/dashboard/tampilan/faq");
  revalidatePath("/");
  return { success: true, message: "FAQ berhasil ditambahkan" };
}

export async function updateFaq(id: string, formData: FormData): Promise<ActionResponse> {
  await requirePermission("appearance.update");

  const question = formData.get("question") as string;
  const answer = formData.get("answer") as string;
  const category = (formData.get("category") as string) || "Umum";
  const sortOrder = parseInt((formData.get("sortOrder") as string) || "0") || 0;
  const isActive = formData.get("isActive") !== "false";

  if (!question || !answer) {
    return { success: false, message: "Pertanyaan dan jawaban FAQ wajib diisi" };
  }

  const { error } = await supabaseAdmin
    .from("Faq")
    .update({
      question,
      answer,
      category,
      sortOrder,
      isActive,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { success: false, message: error.message };

  revalidatePath("/dashboard/tampilan/faq");
  revalidatePath("/");
  return { success: true, message: "FAQ berhasil diperbarui" };
}

export async function deleteFaq(id: string): Promise<ActionResponse> {
  await requirePermission("appearance.delete");

  const { error } = await supabaseAdmin.from("Faq").delete().eq("id", id);
  if (error) return { success: false, message: error.message };

  revalidatePath("/dashboard/tampilan/faq");
  revalidatePath("/");
  return { success: true, message: "FAQ berhasil dihapus" };
}

