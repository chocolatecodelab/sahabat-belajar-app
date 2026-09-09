"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import type { ActionResponse } from "@/types";
import {
  readNotificationSettings,
  writeNotificationSettings,
  readNotificationLogs,
  sendWhatsApp,
  sendEmail,
  renderTemplate,
  type NotificationSettingsData,
  type NotificationLogItem,
  type WhatsAppProvider,
  type EmailProvider,
} from "@/lib/notifications";
import { promises as fs } from "fs";
import path from "path";

function safeRevalidatePath(p: string) {
  try {
    revalidatePath(p);
  } catch {}
}

/**
 * 1. Get Notification Settings
 */
export async function getNotificationSettingsAction(): Promise<NotificationSettingsData> {
  return await readNotificationSettings();
}

/**
 * 2. Update Notification Settings & Templates
 */
export async function updateNotificationSettingsAction(formData: FormData): Promise<ActionResponse<NotificationSettingsData>> {
  await requireAuth();

  try {
    const whatsappProvider = (formData.get("whatsappProvider") as WhatsAppProvider) || "SIMULATED";
    const whatsappApiToken = (formData.get("whatsappApiToken") as string) || "";
    const whatsappEndpointUrl = (formData.get("whatsappEndpointUrl") as string) || "";
    const whatsappSenderNumber = (formData.get("whatsappSenderNumber") as string) || "";
    const whatsappAdminNumber = (formData.get("whatsappAdminNumber") as string) || "";

    const emailProvider = (formData.get("emailProvider") as EmailProvider) || "SIMULATED";
    const emailSmtpHost = (formData.get("emailSmtpHost") as string) || "smtp.gmail.com";
    const emailSmtpPort = Number(formData.get("emailSmtpPort")) || 587;
    const emailSmtpSecure = formData.get("emailSmtpSecure") === "true";
    const emailSmtpUser = (formData.get("emailSmtpUser") as string) || "";
    const emailSmtpPass = (formData.get("emailSmtpPass") as string) || "";
    const emailResendApiKey = (formData.get("emailResendApiKey") as string) || "";
    const emailSenderName = (formData.get("emailSenderName") as string) || "BIAS RISTEK Akademik";
    const emailSenderAddress = (formData.get("emailSenderAddress") as string) || "no-reply@biasristek.id";

    // Event Toggles
    const waEnabled_invoiceCreated = formData.get("waEnabled_invoiceCreated") === "true";
    const waEnabled_paymentVerified = formData.get("waEnabled_paymentVerified") === "true";
    const waEnabled_submissionReviewed = formData.get("waEnabled_submissionReviewed") === "true";
    const waEnabled_certificateIssued = formData.get("waEnabled_certificateIssued") === "true";

    const emailEnabled_invoiceCreated = formData.get("emailEnabled_invoiceCreated") === "true";
    const emailEnabled_paymentVerified = formData.get("emailEnabled_paymentVerified") === "true";
    const emailEnabled_submissionReviewed = formData.get("emailEnabled_submissionReviewed") === "true";
    const emailEnabled_certificateIssued = formData.get("emailEnabled_certificateIssued") === "true";

    // Templates
    const template_wa_invoiceCreated = formData.get("template_wa_invoiceCreated") as string;
    const template_wa_paymentVerified = formData.get("template_wa_paymentVerified") as string;
    const template_wa_submissionReviewed = formData.get("template_wa_submissionReviewed") as string;
    const template_wa_certificateIssued = formData.get("template_wa_certificateIssued") as string;

    const template_email_invoiceCreated = formData.get("template_email_invoiceCreated") as string;
    const template_email_paymentVerified = formData.get("template_email_paymentVerified") as string;
    const template_email_submissionReviewed = formData.get("template_email_submissionReviewed") as string;
    const template_email_certificateIssued = formData.get("template_email_certificateIssued") as string;

    const updated = await writeNotificationSettings({
      whatsappProvider,
      whatsappApiToken,
      whatsappEndpointUrl,
      whatsappSenderNumber,
      whatsappAdminNumber,
      emailProvider,
      emailSmtpHost,
      emailSmtpPort,
      emailSmtpSecure,
      emailSmtpUser,
      emailSmtpPass,
      emailResendApiKey,
      emailSenderName,
      emailSenderAddress,
      waEnabled_invoiceCreated,
      waEnabled_paymentVerified,
      waEnabled_submissionReviewed,
      waEnabled_certificateIssued,
      emailEnabled_invoiceCreated,
      emailEnabled_paymentVerified,
      emailEnabled_submissionReviewed,
      emailEnabled_certificateIssued,
      ...(template_wa_invoiceCreated !== null ? { template_wa_invoiceCreated } : {}),
      ...(template_wa_paymentVerified !== null ? { template_wa_paymentVerified } : {}),
      ...(template_wa_submissionReviewed !== null ? { template_wa_submissionReviewed } : {}),
      ...(template_wa_certificateIssued !== null ? { template_wa_certificateIssued } : {}),
      ...(template_email_invoiceCreated !== null ? { template_email_invoiceCreated } : {}),
      ...(template_email_paymentVerified !== null ? { template_email_paymentVerified } : {}),
      ...(template_email_submissionReviewed !== null ? { template_email_submissionReviewed } : {}),
      ...(template_email_certificateIssued !== null ? { template_email_certificateIssued } : {}),
    });

    safeRevalidatePath("/dashboard/pengaturan/notifikasi");

    return {
      success: true,
      message: "Pengaturan notifikasi & template pesan berhasil disimpan!",
      data: updated,
    };
  } catch (err: any) {
    console.error("updateNotificationSettingsAction error:", err);
    return {
      success: false,
      message: err?.message || "Gagal menyimpan pengaturan notifikasi",
    };
  }
}

/**
 * 3. Send Test Notification (WhatsApp or Email)
 */
export async function sendTestNotificationAction(payload: {
  channel: "WHATSAPP" | "EMAIL";
  target: string;
  recipientName?: string;
}): Promise<ActionResponse<{ status: string }>> {
  await requireAuth();

  const { channel, target, recipientName = "Admin Tester" } = payload;
  if (!target || target.trim() === "") {
    return { success: false, message: `Tujuan ${channel} wajib diisi` };
  }

  try {
    if (channel === "WHATSAPP") {
      const testMsg = `🔬 *UJI COBA WHATSAPP GATEWAY BIAS RISTEK*\n\nHalo ${recipientName}, ini adalah pesan uji coba koneksi gateway WhatsApp dari sistem platform BIAS RISTEK.\n\nStatus: *BERHASIL TERHUBUNG* ✅\nWaktu: ${new Date().toLocaleString("id-ID")}\n\nSalam,\n*Tim Akademik BIAS RISTEK*`;
      const res = await sendWhatsApp(target, testMsg, "TEST_MESSAGE", recipientName);
      return {
        success: res.success,
        message: res.message,
        data: { status: res.status },
      };
    } else {
      const subject = `[Uji Coba] Koneksi Email Transaksional BIAS RISTEK`;
      const testHtml = `<h2>Uji Coba Email Transaksional BIAS RISTEK</h2>
<p>Halo <strong>${recipientName}</strong>,</p>
<p>Ini adalah pesan uji coba untuk memverifikasi bahwa konfigurasi SMTP / Email Gateway Anda telah berhasil terhubung dengan platform BIAS RISTEK.</p>
<p>Waktu Pengujian: <strong>${new Date().toLocaleString("id-ID")}</strong></p>
<hr />
<p style="color:#001847;font-weight:bold;">Sistem Notifikasi BIAS RISTEK Siap Digunakan!</p>`;
      const res = await sendEmail(target, subject, testHtml, "TEST_MESSAGE", recipientName);
      return {
        success: res.success,
        message: res.message,
        data: { status: res.status },
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || "Gagal mengirim pesan uji coba",
    };
  }
}

/**
 * 4. Get Notification Logs Audit Trail
 */
export async function getNotificationLogsAction(params?: {
  channel?: string;
  status?: string;
  limit?: number;
}): Promise<NotificationLogItem[]> {
  await requireAuth();
  return await readNotificationLogs(params);
}

/**
 * 5. Clear Notification Logs
 */
export async function clearNotificationLogsAction(): Promise<ActionResponse> {
  await requireAuth();
  try {
    const LOGS_FILE = path.join(process.cwd(), "data", "notification_logs.json");
    await fs.writeFile(LOGS_FILE, JSON.stringify([], null, 2), "utf-8");
    safeRevalidatePath("/dashboard/pengaturan/notifikasi");
    return { success: true, message: "Riwayat log notifikasi berhasil dibersihkan" };
  } catch (err: any) {
    return { success: false, message: err?.message || "Gagal membersihkan log" };
  }
}
