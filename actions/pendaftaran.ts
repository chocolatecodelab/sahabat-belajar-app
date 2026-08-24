"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAuth } from "@/lib/auth";

function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Non-HTTP test context fallback
  }
}
import type { ActionResponse } from "@/types";

export type RegistrationItem = {
  id: string;
  invoiceNumber: string;
  courseId: string;
  courseTitle: string;
  name: string;
  email: string;
  phone: string;
  institution: string;
  educationLevel: string;
  researchTopic: string | null;
  totalAmount: number;
  uniqueCode: number;
  paymentMethod: string;
  bankName: string | null;
  paymentProof: string | null;
  status: "PENDING_PAYMENT" | "PAYMENT_UPLOADED" | "VERIFIED" | "REJECTED" | "CANCELLED";
  adminNotes: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  course?: {
    title: string;
    slug: string;
    featuredImage: string | null;
    startDate: string | null;
  } | null;
};

/**
 * Generate unique invoice number: INV-YYYYMM-XXXX
 */
function generateInvoiceNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `INV-${year}${month}-${randomSuffix}`;
}

/**
 * 1. Public Checkout: Create Enrollment / Registration
 */
export async function createEnrollment(data: {
  courseId: string;
  name: string;
  email: string;
  phone: string;
  institution: string;
  educationLevel: string;
  researchTopic?: string;
  paymentMethod: string;
  bankName?: string;
}): Promise<ActionResponse<{ invoiceNumber: string; totalAmount: number; uniqueCode: number }>> {
  try {
    const { courseId, name, email, phone, institution, educationLevel, researchTopic, paymentMethod, bankName } = data;

    if (!courseId || !name || !email || !phone || !institution) {
      return { success: false, message: "Semua data pendaftaran wajib diisi lengkap" };
    }

    // Fetch course info
    const { data: course, error: courseErr } = await supabaseAdmin
      .from("Course")
      .select("id, title, price, salePrice, isFree, currentEnrolled, maxQuota, status")
      .eq("id", courseId)
      .single();

    if (courseErr || !course) {
      return { success: false, message: "Program kursus tidak ditemukan" };
    }

    if (course.status === "CLOSED" || course.status === "FULL") {
      return { success: false, message: "Pendaftaran untuk program kelas ini sudah ditutup atau penuh" };
    }

    const basePrice = course.isFree ? 0 : (course.salePrice !== null && course.salePrice !== undefined ? course.salePrice : course.price);
    const uniqueCode = course.isFree ? 0 : Math.floor(100 + Math.random() * 899);
    const totalAmount = basePrice > 0 ? basePrice + uniqueCode : 0;
    const invoiceNumber = generateInvoiceNumber();
    const id = `reg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const initialStatus = course.isFree ? "VERIFIED" : "PENDING_PAYMENT";

    const { error: insertErr } = await supabaseAdmin.from("CourseRegistration").insert({
      id,
      invoiceNumber,
      courseId,
      courseTitle: course.title,
      name,
      email,
      phone,
      institution,
      educationLevel: educationLevel || "Umum",
      researchTopic: researchTopic || null,
      totalAmount,
      uniqueCode,
      paymentMethod: course.isFree ? "FREE" : paymentMethod || "QRIS",
      bankName: bankName || null,
      paymentProof: null,
      status: initialStatus,
      verifiedAt: course.isFree ? new Date().toISOString() : null,
    });

    if (insertErr) throw insertErr;

    if (course.isFree) {
      // Increment enrolled count immediately for free courses
      await supabaseAdmin
        .from("Course")
        .update({ currentEnrolled: (course.currentEnrolled || 0) + 1 })
        .eq("id", courseId);
    }

    safeRevalidatePath("/dashboard/pendaftaran");
    safeRevalidatePath("/dashboard");

    return {
      success: true,
      message: "Pendaftaran berhasil dibuat",
      data: {
        invoiceNumber,
        totalAmount,
        uniqueCode,
      },
    };
  } catch (err: any) {
    console.error("createEnrollment error:", err);
    return { success: false, message: err?.message || "Gagal memproses pendaftaran" };
  }
}

/**
 * 2. Public: Upload Payment Proof Receipt
 */
export async function uploadPaymentProof(
  invoiceNumber: string,
  paymentProofUrl: string
): Promise<ActionResponse> {
  try {
    if (!invoiceNumber || !paymentProofUrl) {
      return { success: false, message: "Nomor invoice dan bukti transfer diperlukan" };
    }

    const { error } = await supabaseAdmin
      .from("CourseRegistration")
      .update({
        paymentProof: paymentProofUrl,
        status: "PAYMENT_UPLOADED",
        updatedAt: new Date().toISOString(),
      })
      .eq("invoiceNumber", invoiceNumber);

    if (error) throw error;

    safeRevalidatePath(`/pembayaran/sukses`);
    safeRevalidatePath(`/dashboard/pendaftaran`);

    return { success: true, message: "Bukti pembayaran berhasil diunggah dan sedang diverifikasi admin" };
  } catch (err: any) {
    console.error("uploadPaymentProof error:", err);
    return { success: false, message: err?.message || "Gagal mengunggah bukti pembayaran" };
  }
}

/**
 * 3. Public: Get Registration Status by Invoice Number
 */
export async function getRegistrationByInvoice(
  invoiceNumber: string
): Promise<RegistrationItem | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("CourseRegistration")
      .select("*, course:Course(title, slug, featuredImage, startDate, mentorName, duration)")
      .eq("invoiceNumber", invoiceNumber)
      .maybeSingle();

    if (error || !data) return null;

    return {
      ...data,
      course: Array.isArray(data.course) ? data.course[0] : data.course,
    } as RegistrationItem;
  } catch {
    return null;
  }
}

/**
 * 4. Admin: Get Registrations with Summary & Filters
 */
export async function getAdminRegistrations(params?: {
  status?: string;
  courseId?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{
  data: RegistrationItem[];
  total: number;
  summary: {
    totalRegistrations: number;
    pendingPayment: number;
    paymentUploaded: number;
    verified: number;
    totalRevenue: number;
  };
}> {
  try {
    const page = params?.page || 1;
    const limit = params?.limit || 50;
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from("CourseRegistration")
      .select("*, course:Course(title, slug, featuredImage, startDate)", { count: "exact" });

    if (params?.status && params.status !== "ALL") {
      query = query.eq("status", params.status);
    }

    if (params?.courseId && params.courseId !== "ALL") {
      query = query.eq("courseId", params.courseId);
    }

    if (params?.search?.trim()) {
      const q = params.search.trim();
      query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%,invoiceNumber.ilike.%${q}%,institution.ilike.%${q}%`);
    }

    const { data, count, error } = await query
      .order("createdAt", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("getAdminRegistrations error:", error);
      return {
        data: [],
        total: 0,
        summary: { totalRegistrations: 0, pendingPayment: 0, paymentUploaded: 0, verified: 0, totalRevenue: 0 },
      };
    }

    // Compute summary stats across all registrations
    const { data: allRegs } = await supabaseAdmin
      .from("CourseRegistration")
      .select("status, totalAmount");

    let pendingPayment = 0;
    let paymentUploaded = 0;
    let verified = 0;
    let totalRevenue = 0;

    (allRegs || []).forEach((r: any) => {
      if (r.status === "PENDING_PAYMENT") pendingPayment++;
      else if (r.status === "PAYMENT_UPLOADED") paymentUploaded++;
      else if (r.status === "VERIFIED") {
        verified++;
        totalRevenue += r.totalAmount || 0;
      }
    });

    const formattedData = (data || []).map((item: any) => ({
      ...item,
      course: Array.isArray(item.course) ? item.course[0] : item.course,
    }));

    return {
      data: formattedData as RegistrationItem[],
      total: count || 0,
      summary: {
        totalRegistrations: allRegs?.length || 0,
        pendingPayment,
        paymentUploaded,
        verified,
        totalRevenue,
      },
    };
  } catch (err) {
    console.error("getAdminRegistrations error:", err);
    return {
      data: [],
      total: 0,
      summary: { totalRegistrations: 0, pendingPayment: 0, paymentUploaded: 0, verified: 0, totalRevenue: 0 },
    };
  }
}

/**
 * 5. Admin: Update Registration Status (Verify / Reject / Notes)
 */
export async function updateRegistrationStatus(
  id: string,
  newStatus: "PENDING_PAYMENT" | "PAYMENT_UPLOADED" | "VERIFIED" | "REJECTED" | "CANCELLED",
  adminNotes?: string
): Promise<ActionResponse> {
  await requireAuth();

  try {
    const { data: current, error: fetchErr } = await supabaseAdmin
      .from("CourseRegistration")
      .select("id, status, courseId")
      .eq("id", id)
      .single();

    if (fetchErr || !current) {
      return { success: false, message: "Data pendaftaran tidak ditemukan" };
    }

    const updates: any = {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    if (adminNotes !== undefined) {
      updates.adminNotes = adminNotes;
    }

    if (newStatus === "VERIFIED" && current.status !== "VERIFIED") {
      updates.verifiedAt = new Date().toISOString();

      // Increment enrolled count on Course
      const { data: course } = await supabaseAdmin
        .from("Course")
        .select("currentEnrolled")
        .eq("id", current.courseId)
        .single();

      if (course) {
        await supabaseAdmin
          .from("Course")
          .update({ currentEnrolled: (course.currentEnrolled || 0) + 1 })
          .eq("id", current.courseId);
      }
    }

    const { error: updateErr } = await supabaseAdmin
      .from("CourseRegistration")
      .update(updates)
      .eq("id", id);

    if (updateErr) throw updateErr;

    safeRevalidatePath("/dashboard/pendaftaran");
    safeRevalidatePath("/dashboard/kursus");
    safeRevalidatePath("/dashboard");

    return { success: true, message: `Status pendaftaran berhasil diperbarui menjadi ${newStatus}` };
  } catch (err: any) {
    console.error("updateRegistrationStatus error:", err);
    return { success: false, message: err?.message || "Gagal memperbarui status pendaftaran" };
  }
}

/**
 * 6. Admin: Delete Registration
 */
export async function deleteRegistration(id: string): Promise<ActionResponse> {
  await requireAuth();

  try {
    const { error } = await supabaseAdmin.from("CourseRegistration").delete().eq("id", id);
    if (error) throw error;

    safeRevalidatePath("/dashboard/pendaftaran");
    return { success: true, message: "Data pendaftaran berhasil dihapus" };
  } catch (err: any) {
    console.error("deleteRegistration error:", err);
    return { success: false, message: err?.message || "Gagal menghapus data pendaftaran" };
  }
}
