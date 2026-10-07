/**
 * BIAS RISTEK - Payment Gateway & Auto-Settlement Engine
 * Integrates Midtrans (QRIS & Virtual Accounts) with Cryptographic Verification (HMAC-SHA512)
 * and Idempotent Auto-Enrollment into Student LMS.
 * Conforms to PRD Phase #2 (Fase #2) Specifications.
 */

import crypto from "crypto";
import { hash } from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase";
import { notifyPaymentVerified } from "@/lib/notifications";
import { triggerN8nWebhook } from "@/lib/n8n";

export interface MidtransNotificationPayload {
  order_id: string; // Map to invoiceNumber (e.g., "INV-202610-1234")
  status_code: string;
  gross_amount: string;
  signature_key: string;
  transaction_status: string; // "settlement" | "capture" | "pending" | "expire" | "cancel" | "deny"
  payment_type?: string; // "qris" | "bank_transfer" | "gopay" | "cstore"
  fraud_status?: string; // "accept" | "challenge" | "deny"
  settlement_time?: string;
  transaction_id?: string;
  transaction_time?: string;
  bank?: string;
  va_numbers?: Array<{ bank: string; va_number: string }>;
}

/**
 * Returns active Midtrans Server Key from environment variables with fallback
 */
export function getMidtransServerKey(): string {
  return process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-BIAS-RISTEK-SANDBOX-KEY";
}

/**
 * Returns active Midtrans Client Key
 */
export function getMidtransClientKey(): string {
  return process.env.MIDTRANS_CLIENT_KEY || "SB-Mid-client-BIAS-RISTEK-SANDBOX-KEY";
}

/**
 * Checks if running in production mode
 */
export function isMidtransProduction(): boolean {
  return process.env.MIDTRANS_IS_PRODUCTION === "true";
}

/**
 * Computes official SHA-512 cryptographic signature for Midtrans verification
 * Formula: SHA512(order_id + status_code + gross_amount + ServerKey)
 */
export function computeMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string = getMidtransServerKey()
): string {
  // Format grossAmount correctly (integers formatted without trailing decimals if plain int)
  const normalizedAmount = grossAmount.includes(".")
    ? grossAmount
    : `${grossAmount}.00`;

  // Midtrans accepts raw string as sent in notification
  const rawString = `${orderId}${statusCode}${grossAmount}${serverKey}`;
  return crypto.createHash("sha512").update(rawString).digest("hex");
}

/**
 * Verifies that the incoming webhook payload genuinely originated from Midtrans
 */
export function verifyMidtransSignature(
  payload: MidtransNotificationPayload,
  customServerKey?: string
): boolean {
  if (!payload.order_id || !payload.status_code || !payload.gross_amount || !payload.signature_key) {
    return false;
  }

  const serverKey = customServerKey || getMidtransServerKey();

  // Test standard match: SHA512(order_id + status_code + gross_amount + serverKey)
  const expectedSignature1 = crypto
    .createHash("sha512")
    .update(`${payload.order_id}${payload.status_code}${payload.gross_amount}${serverKey}`)
    .digest("hex");

  if (payload.signature_key.toLowerCase() === expectedSignature1.toLowerCase()) {
    return true;
  }

  // Fallback for gross_amount with or without .00 suffix
  const amtWithoutDec = payload.gross_amount.split(".")[0];
  const expectedSignature2 = crypto
    .createHash("sha512")
    .update(`${payload.order_id}${payload.status_code}${amtWithoutDec}${serverKey}`)
    .digest("hex");

  if (payload.signature_key.toLowerCase() === expectedSignature2.toLowerCase()) {
    return true;
  }

  const amtWithDec = `${amtWithoutDec}.00`;
  const expectedSignature3 = crypto
    .createHash("sha512")
    .update(`${payload.order_id}${payload.status_code}${amtWithDec}${serverKey}`)
    .digest("hex");

  return payload.signature_key.toLowerCase() === expectedSignature3.toLowerCase();
}

/**
 * Idempotent Settlement Processor:
 * Safely executes payment settlement, course quota update, LMS student provisioning,
 * omnichannel notification dispatch, and n8n webhook egress.
 */
export async function processPaymentSettlement(
  invoiceNumber: string,
  metadata: {
    paymentType?: string;
    transactionTime?: string;
    gatewayRef?: string;
    grossAmount?: number;
  }
): Promise<{ success: boolean; message: string; alreadyVerified?: boolean; registration?: any }> {
  try {
    // 1. Fetch registration record
    const { data: registration, error: fetchErr } = await supabaseAdmin
      .from("CourseRegistration")
      .select("*, course:Course(id, title, slug, currentEnrolled)")
      .eq("invoiceNumber", invoiceNumber)
      .maybeSingle();

    if (fetchErr || !registration) {
      return { success: false, message: `Pendaftaran dengan invoice ${invoiceNumber} tidak ditemukan.` };
    }

    // 2. IDEMPOTENCY CHECK
    // If the registration is already marked as VERIFIED, immediately return success without duplicate actions
    if (registration.status === "VERIFIED") {
      return {
        success: true,
        message: "Invoice sudah berstatus LUNAS/VERIFIED sebelumnya (Idempotent).",
        alreadyVerified: true,
        registration,
      };
    }

    const courseData = Array.isArray(registration.course) ? registration.course[0] : registration.course;
    const nowIso = new Date().toISOString();
    const resolvedPaymentMethod = metadata.paymentType ? `PG_${metadata.paymentType.toUpperCase()}` : "PG_QRIS";

    // 3. Update CourseRegistration status to VERIFIED
    const { error: updateErr } = await supabaseAdmin
      .from("CourseRegistration")
      .update({
        status: "VERIFIED",
        verifiedAt: nowIso,
        paymentMethod: resolvedPaymentMethod,
        adminNotes: `[AUTO-GATEWAY] Terverifikasi otomatis via Webhook Payment Gateway (${metadata.gatewayRef || "Midtrans"}).`,
        updatedAt: nowIso,
      })
      .eq("id", registration.id);

    if (updateErr) {
      console.error("Database update error on settlement:", updateErr);
      return { success: false, message: "Gagal memperbarui status pendaftaran di basis data." };
    }

    // 4. Increment course enrolled counter
    if (courseData?.id) {
      const nextCount = (courseData.currentEnrolled || 0) + 1;
      await supabaseAdmin
        .from("Course")
        .update({ currentEnrolled: nextCount })
        .eq("id", courseData.id);
    }

    // 5. Auto-provision Student Account (Role: Student)
    const studentEmail = (registration.email || "peserta@biasristek.id").trim().toLowerCase();
    const studentName = registration.name || "Peserta Riset";
    const studentPhone = (registration.phone || "12345678").replace(/\D/g, "");

    try {
      const { data: existingUser } = await supabaseAdmin
        .from("User")
        .select("id, email")
        .eq("email", studentEmail)
        .maybeSingle();

      if (!existingUser) {
        const defaultPassword = studentPhone.length >= 6 ? studentPhone : "12345678";
        const hashedPassword = await hash(defaultPassword, 10);
        const newUserId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

        await supabaseAdmin.from("User").insert({
          id: newUserId,
          name: studentName,
          email: studentEmail,
          password: hashedPassword,
          roleId: "role_student",
          createdAt: nowIso,
          updatedAt: nowIso,
        });
      }
    } catch (userErr) {
      console.error("Auto-provision Student User account warning:", userErr);
    }

    // 6. Auto-provision CourseEnrollment for LMS access (/belajar/[slug])
    const enrollmentId = `enroll_${registration.courseId}_${registration.id.replace("reg_", "")}`;
    try {
      await supabaseAdmin.from("CourseEnrollment").upsert(
        {
          id: enrollmentId,
          userEmail: studentEmail,
          userName: studentName,
          courseId: registration.courseId,
          registrationId: registration.id,
          status: "ACTIVE",
          progressPercentage: 0,
          enrolledAt: nowIso,
          updatedAt: nowIso,
        },
        { onConflict: "id" }
      );
    } catch (enrollErr) {
      console.error("Auto-provision CourseEnrollment warning:", enrollErr);
    }

    // 7. Dispatch Omnichannel WhatsApp & Email Notifications (Non-blocking)
    notifyPaymentVerified({
      invoiceNumber: registration.invoiceNumber,
      studentName: registration.name,
      studentEmail: registration.email,
      studentPhone: registration.phone,
      courseTitle: courseData?.title || registration.courseTitle,
      courseSlug: courseData?.slug,
    }).catch((notifErr) => console.error("Notification dispatch warning:", notifErr));

    // 8. Dispatch Outbound n8n Webhook Event (Non-blocking)
    triggerN8nWebhook("PAYMENT_VERIFIED", {
      registrationId: registration.id,
      invoiceNumber: registration.invoiceNumber,
      student: {
        name: registration.name,
        email: registration.email,
        phone: registration.phone,
        institution: registration.institution,
      },
      course: {
        id: registration.courseId,
        title: courseData?.title || registration.courseTitle,
      },
      billing: {
        totalAmount: registration.totalAmount,
        paymentMethod: resolvedPaymentMethod,
        verifiedAt: nowIso,
      },
    }).catch((n8nErr) => console.error("n8n webhook dispatch warning:", n8nErr));

    return {
      success: true,
      message: "Pembayaran berhasil diverifikasi otomatis & akses LMS telah diaktifkan.",
      alreadyVerified: false,
      registration: { ...registration, status: "VERIFIED" },
    };
  } catch (err: any) {
    console.error("processPaymentSettlement fatal error:", err);
    return { success: false, message: err?.message || "Kesalahan internal pemrosesan settlement." };
  }
}

/**
 * Handles Expired / Cancelled / Denied status transitions
 */
export async function processPaymentFailure(
  invoiceNumber: string,
  targetStatus: "EXPIRED" | "CANCELLED",
  reason?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { data: registration } = await supabaseAdmin
      .from("CourseRegistration")
      .select("id, status")
      .eq("invoiceNumber", invoiceNumber)
      .maybeSingle();

    if (!registration) {
      return { success: false, message: "Invoice tidak ditemukan." };
    }

    // Do not alter if already verified
    if (registration.status === "VERIFIED") {
      return { success: true, message: "Invoice sudah lunas, status tidak diubah." };
    }

    await supabaseAdmin
      .from("CourseRegistration")
      .update({
        status: targetStatus,
        adminNotes: reason ? `[GATEWAY] ${reason}` : `[GATEWAY] Transaksi berstatus ${targetStatus}`,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", registration.id);

    triggerN8nWebhook(targetStatus === "EXPIRED" ? "PAYMENT_EXPIRED" : "PAYMENT_EXPIRED", {
      invoiceNumber,
      status: targetStatus,
      reason,
    }).catch(() => {});

    return { success: true, message: `Status berhasil diubah ke ${targetStatus}` };
  } catch (err: any) {
    return { success: false, message: err?.message || "Gagal mengubah status invoice." };
  }
}

/**
 * Creates a Snap / Payment Gateway Transaction (or mock sandbox response if simulated)
 */
export async function createPaymentGatewayTransaction(params: {
  invoiceNumber: string;
  grossAmount: number;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  courseTitle: string;
  paymentType?: "qris" | "bank_transfer" | "all";
}): Promise<{
  success: boolean;
  token?: string;
  redirectUrl?: string;
  qrisData?: string;
  isSimulated?: boolean;
  error?: string;
}> {
  const serverKey = getMidtransServerKey();
  const isProd = isMidtransProduction();
  const isMock = serverKey.includes("SANDBOX-KEY") || serverKey.startsWith("mock_");

  // In simulated/sandbox mode without active Midtrans API credentials:
  if (isMock) {
    const mockToken = `snap_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      success: true,
      token: mockToken,
      redirectUrl: `/pembayaran/sukses?inv=${params.invoiceNumber}&mock=1`,
      isSimulated: true,
    };
  }

  // Real Midtrans Snap API call
  try {
    const endpoint = isProd
      ? "https://app.midtrans.com/snap/v1/transactions"
      : "https://app.sandbox.midtrans.com/snap/v1/transactions";

    const authHeader = Buffer.from(`${serverKey}:`).toString("base64");

    const payload = {
      transaction_details: {
        order_id: params.invoiceNumber,
        gross_amount: params.grossAmount,
      },
      customer_details: {
        first_name: params.studentName,
        email: params.studentEmail,
        phone: params.studentPhone,
      },
      item_details: [
        {
          id: params.invoiceNumber,
          price: params.grossAmount,
          quantity: 1,
          name: params.courseTitle.slice(0, 50),
        },
      ],
      enabled_payments:
        params.paymentType === "qris"
          ? ["gopay", "other_qris", "shopeepay"]
          : params.paymentType === "bank_transfer"
          ? ["bca_va", "bni_va", "bri_va", "permata_va", "other_va"]
          : undefined,
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Basic ${authHeader}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok || !data.token) {
      console.warn("Midtrans Snap API returned error:", data);
      return {
        success: false,
        error: data.error_messages?.[0] || "Gagal menghubungi Midtrans Snap API.",
      };
    }

    return {
      success: true,
      token: data.token,
      redirectUrl: data.redirect_url,
    };
  } catch (err: any) {
    console.error("createPaymentGatewayTransaction error:", err);
    return {
      success: false,
      error: err?.message || "Kesalahan jaringan gateway pembayaran.",
    };
  }
}
