import { supabaseAdmin } from "./supabase";
import nodemailer from "nodemailer";
import { promises as fs } from "fs";
import path from "path";

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export type WhatsAppProvider = "SIMULATED" | "FONNTE" | "WABLAS" | "CUSTOM";
export type EmailProvider = "SIMULATED" | "SMTP" | "RESEND" | "DISABLED";

export interface NotificationSettingsData {
  id: string;
  // WhatsApp
  whatsappProvider: WhatsAppProvider;
  whatsappApiToken: string;
  whatsappEndpointUrl: string;
  whatsappSenderNumber: string;
  whatsappAdminNumber: string;

  // Email
  emailProvider: EmailProvider;
  emailSmtpHost: string;
  emailSmtpPort: number;
  emailSmtpSecure: boolean;
  emailSmtpUser: string;
  emailSmtpPass: string;
  emailResendApiKey: string;
  emailSenderName: string;
  emailSenderAddress: string;

  // Event Toggles
  waEnabled_invoiceCreated: boolean;
  waEnabled_paymentVerified: boolean;
  waEnabled_submissionReviewed: boolean;
  waEnabled_certificateIssued: boolean;

  emailEnabled_invoiceCreated: boolean;
  emailEnabled_paymentVerified: boolean;
  emailEnabled_submissionReviewed: boolean;
  emailEnabled_certificateIssued: boolean;

  // Templates WhatsApp
  template_wa_invoiceCreated: string;
  template_wa_paymentVerified: string;
  template_wa_submissionReviewed: string;
  template_wa_certificateIssued: string;

  // Templates Email
  template_email_invoiceCreated: string;
  template_email_paymentVerified: string;
  template_email_submissionReviewed: string;
  template_email_certificateIssued: string;

  updatedAt?: string;
}

export interface NotificationLogItem {
  id: string;
  channel: "WHATSAPP" | "EMAIL";
  recipient: string;
  recipientName?: string;
  event: string;
  subject?: string;
  message: string;
  status: "SENT" | "FAILED" | "SIMULATED";
  errorMessage?: string;
  sentAt: string;
}

// ==========================================
// DEFAULT SETTINGS & TEMPLATES
// ==========================================

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettingsData = {
  id: "global_notification_settings",
  whatsappProvider: "SIMULATED",
  whatsappApiToken: "",
  whatsappEndpointUrl: "",
  whatsappSenderNumber: "",
  whatsappAdminNumber: "",

  emailProvider: "SIMULATED",
  emailSmtpHost: "smtp.gmail.com",
  emailSmtpPort: 587,
  emailSmtpSecure: false,
  emailSmtpUser: "",
  emailSmtpPass: "",
  emailResendApiKey: "",
  emailSenderName: "BIAS RISTEK Akademik",
  emailSenderAddress: "no-reply@biasristek.id",

  waEnabled_invoiceCreated: true,
  waEnabled_paymentVerified: true,
  waEnabled_submissionReviewed: true,
  waEnabled_certificateIssued: true,

  emailEnabled_invoiceCreated: true,
  emailEnabled_paymentVerified: true,
  emailEnabled_submissionReviewed: true,
  emailEnabled_certificateIssued: true,

  // WhatsApp Templates
  template_wa_invoiceCreated: `Halo {{student_name}}, terima kasih telah mendaftar di *BIAS RISTEK*! 🔬

Berikut rincian tagihan pendaftaran Anda:
📌 *Program:* {{course_title}}
🧾 *No. Invoice:* {{invoice_number}}
💰 *Total Tagihan:* {{total_amount}}
💳 *Metode:* {{payment_method}} (Kode Unik: {{unique_code}})

Silakan lakukan transfer dan konfirmasi pembayaran melalui tautan berikut:
🔗 {{invoice_url}}

Salam hangat,
*Tim Akademik BIAS RISTEK*`,

  template_wa_paymentVerified: `Halo {{student_name}}, kabar gembira! 🎉

Pembayaran untuk program *{{course_title}}* (Invoice: {{invoice_number}}) telah *BERHASIL DIVERIFIKASI*.

Akun Ruang Belajar (LMS) Anda telah aktif:
📧 *Email Login:* {{login_email}}
🔑 *Password:* Gunakan nomor WhatsApp Anda (atau yang didaftarkan)
🌐 *Masuk ke Ruang Belajar:* {{classroom_url}}

Selamat belajar dan semoga sukses dalam publikasi riset Anda!

Salam,
*Tim Akademik BIAS RISTEK*`,

  template_wa_submissionReviewed: `Halo {{student_name}}, draf naskah Anda telah direview oleh Mentor! 📑

📌 *Program:* {{course_title}}
📝 *Tugas:* {{task_title}}
📊 *Status:* *{{status}}* (Nilai: {{score}})

💬 *Catatan Mentor:*
"{{mentor_feedback}}"

Silakan periksa detail masukan dan tindak lanjuti revisi Anda di Ruang Belajar:
🔗 {{classroom_url}}

Semangat berkarya!
*Mentor Riset BIAS RISTEK*`,

  template_wa_certificateIssued: `Selamat {{student_name}}! 🎓✨

Anda telah berhasil menyelesaikan seluruh rangkaian program *{{course_title}}*. 

E-Sertifikat Resmi *{{total_hours}}* Anda telah diterbitkan:
📜 *Kode Sertifikat:* {{certificate_code}}
🔍 *Validasi & Unduh E-Sertifikat:* {{certificate_url}}

Sertifikat ini dapat dicantumkan pada portofolio akademik dan divalidasi keasliannya secara online.

Salam hormat,
*Direktur Akademik BIAS RISTEK*`,

  // Email Templates
  template_email_invoiceCreated: `<h2>Pendaftaran Program Riset BIAS RISTEK</h2>
<p>Halo <strong>{{student_name}}</strong>,</p>
<p>Terima kasih telah mendaftar pada program <strong>{{course_title}}</strong> di BIAS RISTEK.</p>
<hr />
<h3>Rincian Tagihan:</h3>
<ul>
  <li><strong>Nomor Invoice:</strong> {{invoice_number}}</li>
  <li><strong>Total Tagihan:</strong> {{total_amount}} (termasuk kode unik {{unique_code}})</li>
  <li><strong>Metode Pembayaran:</strong> {{payment_method}}</li>
</ul>
<p>Silakan lakukan pembayaran sesuai nominal di atas dan unggah bukti transfer melalui halaman tracking invoice:</p>
<p><a href="{{invoice_url}}" style="display:inline-block;padding:10px 20px;background:#001847;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">Lihat Rincian & Konfirmasi Pembayaran</a></p>
<p>Salam hangat,<br /><strong>Tim Akademik BIAS RISTEK</strong></p>`,

  template_email_paymentVerified: `<h2>Pembayaran Diverifikasi & Akses LMS Aktif</h2>
<p>Halo <strong>{{student_name}}</strong>,</p>
<p>Pembayaran Anda untuk program <strong>{{course_title}}</strong> telah berhasil kami verifikasi.</p>
<p>Akun digital Anda telah aktif dan dapat langsung mengakses seluruh video, materi presentasi, dan modul riset:</p>
<ul>
  <li><strong>Email Login:</strong> {{login_email}}</li>
  <li><strong>Ruang Belajar:</strong> <a href="{{classroom_url}}">{{classroom_url}}</a></li>
</ul>
<p><a href="{{login_url}}" style="display:inline-block;padding:10px 20px;background:#001847;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">Masuk ke Ruang Belajar</a></p>
<p>Selamat belajar dan semoga sukses mencapai target publikasi Anda!<br /><strong>Tim Akademik BIAS RISTEK</strong></p>`,

  template_email_submissionReviewed: `<h2>Review Draf Naskah Selesai</h2>
<p>Halo <strong>{{student_name}}</strong>,</p>
<p>Mentor telah selesai meninjau draf tugas naskah Anda pada program <strong>{{course_title}}</strong>.</p>
<ul>
  <li><strong>Judul Tugas:</strong> {{task_title}}</li>
  <li><strong>Status:</strong> <strong>{{status}}</strong></li>
  <li><strong>Nilai Evaluasi:</strong> {{score}} / 100</li>
</ul>
<div style="background:#f8fafc;border-left:4px solid #001847;padding:12px 16px;margin:16px 0;">
  <strong>Catatan Mentor:</strong><br />
  <em>{{mentor_feedback}}</em>
</div>
<p><a href="{{classroom_url}}" style="display:inline-block;padding:10px 20px;background:#001847;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">Buka Ruang Belajar & Tugas</a></p>
<p>Salam riset,<br /><strong>Mentor Riset BIAS RISTEK</strong></p>`,

  template_email_certificateIssued: `<h2>Selamat! E-Sertifikat Resmi 32 JP Telah Terbit</h2>
<p>Halo <strong>{{student_name}}</strong>,</p>
<p>Selamat atas kelulusan dan penyelesaian seluruh kurikulum program <strong>{{course_title}}</strong> di BIAS RISTEK!</p>
<p>E-Sertifikat resmi berbobot <strong>{{total_hours}}</strong> telah diterbitkan dengan nomor seri:</p>
<h3 style="color:#001847;letter-spacing:1px;">{{certificate_code}}</h3>
<p><a href="{{certificate_url}}" style="display:inline-block;padding:10px 20px;background:#001847;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">Lihat & Unduh E-Sertifikat</a></p>
<p>Sertifikat ini dapat divalidasi keasliannya oleh institusi/kampus secara publik melalui tautan di atas.<br /><strong>Direktur Akademik BIAS RISTEK</strong></p>`,
};

// ==========================================
// PERSISTENCE HELPERS (LOCAL JSON STORE WITH FALLBACK)
// ==========================================

const DATA_DIR = path.join(process.cwd(), "data");
const SETTINGS_FILE = path.join(DATA_DIR, "notification_settings.json");
const LOGS_FILE = path.join(DATA_DIR, "notification_logs.json");

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {}
}

export async function readNotificationSettings(): Promise<NotificationSettingsData> {
  await ensureDataDir();
  try {
    // 1. Try reading from Supabase if table exists
    const { data, error } = await supabaseAdmin
      .from("NotificationSettings")
      .select("*")
      .eq("id", "global_notification_settings")
      .maybeSingle();

    if (!error && data) {
      return { ...DEFAULT_NOTIFICATION_SETTINGS, ...data };
    }
  } catch {}

  // 2. Fallback to local JSON file
  try {
    const raw = await fs.readFile(SETTINGS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_NOTIFICATION_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

export async function writeNotificationSettings(settings: Partial<NotificationSettingsData>): Promise<NotificationSettingsData> {
  await ensureDataDir();
  const current = await readNotificationSettings();
  const updated: NotificationSettingsData = {
    ...current,
    ...settings,
    updatedAt: new Date().toISOString(),
  };

  // 1. Save to local JSON file
  try {
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(updated, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write notification_settings.json:", err);
  }

  // 2. Sync to Supabase if table exists
  try {
    await supabaseAdmin
      .from("NotificationSettings")
      .upsert(updated, { onConflict: "id" });
  } catch {}

  return updated;
}

export async function recordNotificationLog(log: Omit<NotificationLogItem, "id" | "sentAt">): Promise<NotificationLogItem> {
  await ensureDataDir();
  const newLog: NotificationLogItem = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    ...log,
    sentAt: new Date().toISOString(),
  };

  // 1. Save to local JSON log
  try {
    let logs: NotificationLogItem[] = [];
    try {
      const raw = await fs.readFile(LOGS_FILE, "utf-8");
      logs = JSON.parse(raw);
    } catch {}
    logs.unshift(newLog);
    if (logs.length > 500) logs = logs.slice(0, 500); // keep max 500 recent logs
    await fs.writeFile(LOGS_FILE, JSON.stringify(logs, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to append notification_logs.json:", err);
  }

  // 2. Sync to Supabase if table exists
  try {
    await supabaseAdmin.from("NotificationLog").insert(newLog);
  } catch {}

  return newLog;
}

export async function readNotificationLogs(params?: {
  channel?: string;
  status?: string;
  limit?: number;
}): Promise<NotificationLogItem[]> {
  await ensureDataDir();
  let logs: NotificationLogItem[] = [];
  try {
    const raw = await fs.readFile(LOGS_FILE, "utf-8");
    logs = JSON.parse(raw);
  } catch {
    logs = [];
  }

  if (params?.channel && params.channel !== "ALL") {
    logs = logs.filter((l) => l.channel === params.channel);
  }
  if (params?.status && params.status !== "ALL") {
    logs = logs.filter((l) => l.status === params.status);
  }

  const limit = params?.limit || 50;
  return logs.slice(0, limit);
}

// ==========================================
// TEMPLATE INTERPOLATION ENGINE
// ==========================================

export function renderTemplate(template: string, variables: Record<string, string | number | undefined | null>): string {
  let result = template || "";
  for (const [key, val] of Object.entries(variables)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    result = result.replace(regex, val !== undefined && val !== null ? String(val) : "");
  }
  return result;
}

// Helper to format currency
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// Helper to sanitize phone number into 628xxx format
export function sanitizePhoneNumber(phone: string): string {
  let cleaned = (phone || "").replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.substring(1);
  } else if (cleaned.startsWith("8")) {
    cleaned = "62" + cleaned;
  }
  return cleaned;
}

// ==========================================
// GATEWAY SENDERS
// ==========================================

export async function sendWhatsApp(
  targetPhone: string,
  message: string,
  event: string,
  recipientName?: string
): Promise<{ success: boolean; status: "SENT" | "SIMULATED" | "FAILED"; message: string }> {
  const settings = await readNotificationSettings();
  const phone = sanitizePhoneNumber(targetPhone);

  if (!phone || phone.length < 8) {
    await recordNotificationLog({
      channel: "WHATSAPP",
      recipient: targetPhone,
      recipientName,
      event,
      message,
      status: "FAILED",
      errorMessage: "Nomor WhatsApp tidak valid",
    });
    return { success: false, status: "FAILED", message: "Nomor WhatsApp tidak valid" };
  }

  // 1. Simulated Mode
  if (settings.whatsappProvider === "SIMULATED" || !settings.whatsappApiToken) {
    console.log(`\n📱 [WHATSAPP SIMULATED] To: ${phone} (${recipientName || "User"})\n${message}\n`);
    await recordNotificationLog({
      channel: "WHATSAPP",
      recipient: phone,
      recipientName,
      event,
      message,
      status: "SIMULATED",
    });
    return { success: true, status: "SIMULATED", message: "Pesan dicatat dalam mode simulasi" };
  }

  // 2. Fonnte Gateway
  if (settings.whatsappProvider === "FONNTE") {
    try {
      const formData = new FormData();
      formData.append("target", phone);
      formData.append("message", message);
      formData.append("countryCode", "62");

      const response = await fetch("https://api.fonnte.com/send", {
        method: "POST",
        headers: {
          Authorization: settings.whatsappApiToken.trim(),
        },
        body: formData,
      });

      const resJson = await response.json();
      if (response.ok && (resJson.status === true || resJson.status === "true" || resJson.status === 200)) {
        await recordNotificationLog({
          channel: "WHATSAPP",
          recipient: phone,
          recipientName,
          event,
          message,
          status: "SENT",
        });
        return { success: true, status: "SENT", message: "Pesan WhatsApp berhasil dikirim via Fonnte" };
      } else {
        const err = resJson.reason || resJson.message || "Gagal mengirim melalui Fonnte";
        await recordNotificationLog({
          channel: "WHATSAPP",
          recipient: phone,
          recipientName,
          event,
          message,
          status: "FAILED",
          errorMessage: err,
        });
        return { success: false, status: "FAILED", message: err };
      }
    } catch (err: any) {
      await recordNotificationLog({
        channel: "WHATSAPP",
        recipient: phone,
        recipientName,
        event,
        message,
        status: "FAILED",
        errorMessage: err?.message,
      });
      return { success: false, status: "FAILED", message: err?.message || "Kesalahan jaringan Fonnte" };
    }
  }

  // 3. Wablas Gateway
  if (settings.whatsappProvider === "WABLAS") {
    try {
      const response = await fetch("https://tx.wablas.com/api/send-message", {
        method: "POST",
        headers: {
          Authorization: settings.whatsappApiToken.trim(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          message,
        }),
      });

      const resJson = await response.json();
      if (response.ok && resJson.status === true) {
        await recordNotificationLog({
          channel: "WHATSAPP",
          recipient: phone,
          recipientName,
          event,
          message,
          status: "SENT",
        });
        return { success: true, status: "SENT", message: "Pesan WhatsApp berhasil dikirim via Wablas" };
      } else {
        const err = resJson.message || "Gagal mengirim melalui Wablas";
        await recordNotificationLog({
          channel: "WHATSAPP",
          recipient: phone,
          recipientName,
          event,
          message,
          status: "FAILED",
          errorMessage: err,
        });
        return { success: false, status: "FAILED", message: err };
      }
    } catch (err: any) {
      await recordNotificationLog({
        channel: "WHATSAPP",
        recipient: phone,
        recipientName,
        event,
        message,
        status: "FAILED",
        errorMessage: err?.message,
      });
      return { success: false, status: "FAILED", message: err?.message || "Kesalahan jaringan Wablas" };
    }
  }

  // 4. Custom Gateway / Self-Hosted Baileys
  if (settings.whatsappProvider === "CUSTOM" && settings.whatsappEndpointUrl) {
    try {
      const response = await fetch(settings.whatsappEndpointUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(settings.whatsappApiToken ? { Authorization: `Bearer ${settings.whatsappApiToken.trim()}` } : {}),
        },
        body: JSON.stringify({
          to: phone,
          phone,
          message,
        }),
      });

      if (response.ok) {
        await recordNotificationLog({
          channel: "WHATSAPP",
          recipient: phone,
          recipientName,
          event,
          message,
          status: "SENT",
        });
        return { success: true, status: "SENT", message: "Pesan WhatsApp berhasil dikirim via Custom Gateway" };
      } else {
        const err = `Custom Gateway HTTP ${response.status}`;
        await recordNotificationLog({
          channel: "WHATSAPP",
          recipient: phone,
          recipientName,
          event,
          message,
          status: "FAILED",
          errorMessage: err,
        });
        return { success: false, status: "FAILED", message: err };
      }
    } catch (err: any) {
      await recordNotificationLog({
        channel: "WHATSAPP",
        recipient: phone,
        recipientName,
        event,
        message,
        status: "FAILED",
        errorMessage: err?.message,
      });
      return { success: false, status: "FAILED", message: err?.message || "Kesalahan koneksi Custom Gateway" };
    }
  }

  return { success: true, status: "SIMULATED", message: "Pesan dicatat" };
}

export async function sendEmail(
  targetEmail: string,
  subject: string,
  htmlContent: string,
  event: string,
  recipientName?: string
): Promise<{ success: boolean; status: "SENT" | "SIMULATED" | "FAILED"; message: string }> {
  const settings = await readNotificationSettings();
  const email = (targetEmail || "").trim().toLowerCase();

  if (!email || !email.includes("@")) {
    await recordNotificationLog({
      channel: "EMAIL",
      recipient: targetEmail,
      recipientName,
      event,
      subject,
      message: htmlContent,
      status: "FAILED",
      errorMessage: "Alamat email tidak valid",
    });
    return { success: false, status: "FAILED", message: "Alamat email tidak valid" };
  }

  if (settings.emailProvider === "DISABLED") {
    return { success: true, status: "SIMULATED", message: "Pengiriman email dinonaktifkan" };
  }

  // 1. Simulated Mode
  if (
    settings.emailProvider === "SIMULATED" ||
    (settings.emailProvider === "SMTP" && !settings.emailSmtpUser) ||
    (settings.emailProvider === "RESEND" && !settings.emailResendApiKey)
  ) {
    console.log(`\n📧 [EMAIL SIMULATED] To: ${email} | Subject: ${subject}\n${htmlContent.replace(/<[^>]*>?/gm, "")}\n`);
    await recordNotificationLog({
      channel: "EMAIL",
      recipient: email,
      recipientName,
      event,
      subject,
      message: htmlContent,
      status: "SIMULATED",
    });
    return { success: true, status: "SIMULATED", message: "Email dicatat dalam mode simulasi" };
  }

  // 2. SMTP (Gmail, cPanel Webmail, Mailgun, dll.)
  if (settings.emailProvider === "SMTP") {
    try {
      const transporter = nodemailer.createTransport({
        host: settings.emailSmtpHost || "smtp.gmail.com",
        port: Number(settings.emailSmtpPort) || 587,
        secure: Boolean(settings.emailSmtpSecure),
        auth: {
          user: settings.emailSmtpUser,
          pass: settings.emailSmtpPass,
        },
      });

      await transporter.sendMail({
        from: `"${settings.emailSenderName || "BIAS RISTEK"}" <${settings.emailSenderAddress || settings.emailSmtpUser}>`,
        to: email,
        subject,
        html: htmlContent,
      });

      await recordNotificationLog({
        channel: "EMAIL",
        recipient: email,
        recipientName,
        event,
        subject,
        message: htmlContent,
        status: "SENT",
      });
      return { success: true, status: "SENT", message: "Email berhasil terkirim via SMTP" };
    } catch (err: any) {
      console.error("SMTP send error:", err);
      await recordNotificationLog({
        channel: "EMAIL",
        recipient: email,
        recipientName,
        event,
        subject,
        message: htmlContent,
        status: "FAILED",
        errorMessage: err?.message,
      });
      return { success: false, status: "FAILED", message: err?.message || "Gagal mengirim email via SMTP" };
    }
  }

  // 3. Resend API
  if (settings.emailProvider === "RESEND") {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${settings.emailResendApiKey.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `${settings.emailSenderName || "BIAS RISTEK"} <${settings.emailSenderAddress || "onboarding@resend.dev"}>`,
          to: [email],
          subject,
          html: htmlContent,
        }),
      });

      const resJson = await response.json();
      if (response.ok && resJson.id) {
        await recordNotificationLog({
          channel: "EMAIL",
          recipient: email,
          recipientName,
          event,
          subject,
          message: htmlContent,
          status: "SENT",
        });
        return { success: true, status: "SENT", message: "Email berhasil terkirim via Resend" };
      } else {
        const err = resJson.message || "Gagal mengirim melalui Resend";
        await recordNotificationLog({
          channel: "EMAIL",
          recipient: email,
          recipientName,
          event,
          subject,
          message: htmlContent,
          status: "FAILED",
          errorMessage: err,
        });
        return { success: false, status: "FAILED", message: err };
      }
    } catch (err: any) {
      await recordNotificationLog({
        channel: "EMAIL",
        recipient: email,
        recipientName,
        event,
        subject,
        message: htmlContent,
        status: "FAILED",
        errorMessage: err?.message,
      });
      return { success: false, status: "FAILED", message: err?.message || "Kesalahan koneksi Resend" };
    }
  }

  return { success: true, status: "SIMULATED", message: "Email dicatat" };
}

// ==========================================
// HIGH-LEVEL AUTOMATED EVENT DISPATCHERS
// ==========================================

/**
 * 1. Event: INVOICE_CREATED
 */
export async function notifyInvoiceCreated(payload: {
  registrationId: string;
  invoiceNumber: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  courseTitle: string;
  totalAmount: number;
  uniqueCode: number;
  paymentMethod: string;
  baseUrl?: string;
}) {
  try {
    const settings = await readNotificationSettings();
    const siteUrl = payload.baseUrl || process.env.NEXTAUTH_URL || "http://localhost:3000";
    const invoiceUrl = `${siteUrl}/pembayaran/sukses?inv=${payload.invoiceNumber}`;

    const variables = {
      student_name: payload.studentName,
      course_title: payload.courseTitle,
      invoice_number: payload.invoiceNumber,
      total_amount: formatRupiah(payload.totalAmount),
      unique_code: payload.uniqueCode,
      payment_method: payload.paymentMethod,
      invoice_url: invoiceUrl,
    };

    // Send WhatsApp to Student
    if (settings.waEnabled_invoiceCreated && payload.studentPhone) {
      const text = renderTemplate(settings.template_wa_invoiceCreated, variables);
      await sendWhatsApp(payload.studentPhone, text, "INVOICE_CREATED", payload.studentName);
    }

    // Send Email to Student
    if (settings.emailEnabled_invoiceCreated && payload.studentEmail) {
      const html = renderTemplate(settings.template_email_invoiceCreated, variables);
      await sendEmail(
        payload.studentEmail,
        `[BIAS RISTEK] Rincian Tagihan Pendaftaran - ${payload.invoiceNumber}`,
        html,
        "INVOICE_CREATED",
        payload.studentName
      );
    }

    // Optional: Alert Admin via WhatsApp
    if (settings.whatsappAdminNumber) {
      const adminAlert = `🚨 *PESANAN BARU MASUK!* 🧾\n\nNama: ${payload.studentName}\nProgram: ${payload.courseTitle}\nTotal: ${formatRupiah(payload.totalAmount)}\nInvoice: ${payload.invoiceNumber}\n\nLihat di Dashboard: ${siteUrl}/dashboard/pendaftaran`;
      await sendWhatsApp(settings.whatsappAdminNumber, adminAlert, "ADMIN_ALERT_INVOICE", "Admin BIAS RISTEK");
    }
  } catch (err) {
    console.error("notifyInvoiceCreated error:", err);
  }
}

/**
 * 2. Event: PAYMENT_VERIFIED
 */
export async function notifyPaymentVerified(payload: {
  invoiceNumber: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  courseTitle: string;
  courseSlug?: string;
  baseUrl?: string;
}) {
  try {
    const settings = await readNotificationSettings();
    const siteUrl = payload.baseUrl || process.env.NEXTAUTH_URL || "http://localhost:3000";
    const classroomUrl = payload.courseSlug ? `${siteUrl}/belajar/${payload.courseSlug}` : `${siteUrl}/belajar`;
    const loginUrl = `${siteUrl}/login`;

    const variables = {
      student_name: payload.studentName,
      course_title: payload.courseTitle,
      invoice_number: payload.invoiceNumber,
      login_email: payload.studentEmail,
      login_url: loginUrl,
      classroom_url: classroomUrl,
    };

    // Send WhatsApp to Student
    if (settings.waEnabled_paymentVerified && payload.studentPhone) {
      const text = renderTemplate(settings.template_wa_paymentVerified, variables);
      await sendWhatsApp(payload.studentPhone, text, "PAYMENT_VERIFIED", payload.studentName);
    }

    // Send Email to Student
    if (settings.emailEnabled_paymentVerified && payload.studentEmail) {
      const html = renderTemplate(settings.template_email_paymentVerified, variables);
      await sendEmail(
        payload.studentEmail,
        `[BIAS RISTEK] Pembayaran Diterima & Akun Ruang Belajar Aktif!`,
        html,
        "PAYMENT_VERIFIED",
        payload.studentName
      );
    }
  } catch (err) {
    console.error("notifyPaymentVerified error:", err);
  }
}

/**
 * 3. Event: SUBMISSION_REVIEWED
 */
export async function notifySubmissionReviewed(payload: {
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  courseTitle: string;
  taskTitle: string;
  status: string;
  score?: number | null;
  mentorFeedback: string;
  courseSlug?: string;
  baseUrl?: string;
}) {
  try {
    const settings = await readNotificationSettings();
    const siteUrl = payload.baseUrl || process.env.NEXTAUTH_URL || "http://localhost:3000";
    const classroomUrl = payload.courseSlug ? `${siteUrl}/belajar/${payload.courseSlug}` : `${siteUrl}/belajar`;

    const statusLabel =
      payload.status === "APPROVED"
        ? "DISETUJUI / LULUS"
        : payload.status === "REVISION_NEEDED"
        ? "PERLU REVISI"
        : "SELESAI DIREVIEW";

    const variables = {
      student_name: payload.studentName,
      course_title: payload.courseTitle,
      task_title: payload.taskTitle,
      status: statusLabel,
      score: payload.score !== undefined && payload.score !== null ? `${payload.score}/100` : "-",
      mentor_feedback: payload.mentorFeedback || "Tidak ada catatan tambahan.",
      classroom_url: classroomUrl,
    };

    // Send WhatsApp
    if (settings.waEnabled_submissionReviewed && payload.studentPhone) {
      const text = renderTemplate(settings.template_wa_submissionReviewed, variables);
      await sendWhatsApp(payload.studentPhone, text, "SUBMISSION_REVIEWED", payload.studentName);
    }

    // Send Email
    if (settings.emailEnabled_submissionReviewed && payload.studentEmail) {
      const html = renderTemplate(settings.template_email_submissionReviewed, variables);
      await sendEmail(
        payload.studentEmail,
        `[BIAS RISTEK] Review Tugas: ${payload.taskTitle} (${statusLabel})`,
        html,
        "SUBMISSION_REVIEWED",
        payload.studentName
      );
    }
  } catch (err) {
    console.error("notifySubmissionReviewed error:", err);
  }
}

/**
 * 4. Event: CERTIFICATE_ISSUED
 */
export async function notifyCertificateIssued(payload: {
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  courseTitle: string;
  certificateCode: string;
  totalHours?: string;
  baseUrl?: string;
}) {
  try {
    const settings = await readNotificationSettings();
    const siteUrl = payload.baseUrl || process.env.NEXTAUTH_URL || "http://localhost:3000";
    const certificateUrl = `${siteUrl}/sertifikat/${payload.certificateCode}`;

    const variables = {
      student_name: payload.studentName,
      course_title: payload.courseTitle,
      certificate_code: payload.certificateCode,
      total_hours: payload.totalHours || "32 JP",
      certificate_url: certificateUrl,
    };

    // Send WhatsApp
    if (settings.waEnabled_certificateIssued && payload.studentPhone) {
      const text = renderTemplate(settings.template_wa_certificateIssued, variables);
      await sendWhatsApp(payload.studentPhone, text, "CERTIFICATE_ISSUED", payload.studentName);
    }

    // Send Email
    if (settings.emailEnabled_certificateIssued && payload.studentEmail) {
      const html = renderTemplate(settings.template_email_certificateIssued, variables);
      await sendEmail(
        payload.studentEmail,
        `[BIAS RISTEK] E-Sertifikat Resmi 32 JP Telah Terbit - ${payload.certificateCode}`,
        html,
        "CERTIFICATE_ISSUED",
        payload.studentName
      );
    }
  } catch (err) {
    console.error("notifyCertificateIssued error:", err);
  }
}

/**
 * 5. Event: TUTOR_BOOKING_PROPOSED (Fase #4 Human in the Loop)
 */
export async function notifyTutorBookingProposed(payload: {
  tutorName: string;
  tutorPhone: string;
  tutorEmail?: string;
  studentName: string;
  studentInstitution: string;
  studentEducationLevel: string;
  researchTopic: string;
  researchSoftware?: string;
  scheduledDate: string;
  timeSlot: string;
  confirmationToken: string;
  baseUrl?: string;
}) {
  try {
    const siteUrl = payload.baseUrl || process.env.NEXTAUTH_URL || "http://localhost:3000";
    const acceptUrl = `${siteUrl}/tutor/konfirmasi/${payload.confirmationToken}?action=ACCEPT`;
    const declineUrl = `${siteUrl}/tutor/konfirmasi/${payload.confirmationToken}?action=DECLINE`;
    const detailsUrl = `${siteUrl}/tutor/konfirmasi/${payload.confirmationToken}`;

    const waText = `Yth. ${payload.tutorName},\n\nTerdapat usulan penugasan bimbingan privat 1-on-1 baru dari BIAS RISTEK:\n\n👤 Mahasiswa/Peneliti: ${payload.studentName} (${payload.studentInstitution}, ${payload.studentEducationLevel})\n🔬 Topik Riset: ${payload.researchTopic}\n🛠️ Metodologi / Software: ${payload.researchSoftware || "Standar Riset Akademik"}\n📅 Jadwal Diusulkan: ${payload.scheduledDate}, Pukul ${payload.timeSlot}\n\nMohon konfirmasi ketersediaan Anda melalui tautan 1-klik di bawah ini:\n👉 TERIMA JADWAL: ${acceptUrl}\n👉 BERHALANGAN / RESCHEDULE: ${declineUrl}\n\nDetail lengkap bimbingan: ${detailsUrl}\n\nTerima kasih atas dedikasi akademik Anda bersama BIAS RISTEK.`;

    if (payload.tutorPhone) {
      await sendWhatsApp(payload.tutorPhone, waText, "TUTOR_BOOKING_PROPOSED", payload.tutorName);
    }

    if (payload.tutorEmail) {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #001847; padding: 24px; text-align: center; color: #ffffff;">
            <h2 style="margin: 0; font-size: 20px; font-weight: 700;">BIAS RISTEK</h2>
            <p style="margin: 4px 0 0; font-size: 13px; color: #fdbc13;">Konfirmasi Penugasan Bimbingan Riset</p>
          </div>
          <div style="padding: 24px;">
            <p>Yth. <strong>${payload.tutorName}</strong>,</p>
            <p>Koordinator akademik BIAS RISTEK mengusulkan penugasan bimbingan privat 1-on-1 baru yang sesuai dengan bidang keahlian Anda:</p>
            <div style="background-color: #f8f9ff; border-left: 4px solid #001847; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 0 0 8px;"><strong>Nama Peneliti:</strong> ${payload.studentName}</p>
              <p style="margin: 0 0 8px;"><strong>Instansi:</strong> ${payload.studentInstitution} (${payload.studentEducationLevel})</p>
              <p style="margin: 0 0 8px;"><strong>Topik Riset:</strong> ${payload.researchTopic}</p>
              <p style="margin: 0 0 8px;"><strong>Software / Metode:</strong> ${payload.researchSoftware || "Standar Riset"}</p>
              <p style="margin: 0;"><strong>Jadwal Sesi:</strong> ${payload.scheduledDate}, Pukul ${payload.timeSlot}</p>
            </div>
            <p style="text-align: center; margin: 24px 0 12px;">
              <a href="${acceptUrl}" style="background-color: #001847; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; margin-right: 8px;">Terima Bimbingan</a>
              <a href="${declineUrl}" style="background-color: #e2e8f0; color: #475569; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Berhalangan / Reschedule</a>
            </p>
          </div>
        </div>
      `;
      await sendEmail(payload.tutorEmail, `[BIAS RISTEK] Usulan Bimbingan Riset: ${payload.studentName}`, emailHtml, "TUTOR_BOOKING_PROPOSED", payload.tutorName);
    }
  } catch (err) {
    console.error("notifyTutorBookingProposed error:", err);
  }
}

/**
 * 6. Event: STUDENT_MENTORSHIP_CONFIRMED (Fase #4 Sesi Terjadwal)
 */
export async function notifyStudentMentorshipConfirmed(payload: {
  studentName: string;
  studentPhone: string;
  studentEmail?: string;
  tutorName: string;
  tutorTitle: string;
  tutorInstitution: string;
  scheduledDate: string;
  timeSlot: string;
  zoomJoinUrl: string;
  researchTopic: string;
}) {
  try {
    const waText = `Halo ${payload.studentName}, kabar gembira!\n\nJadwal bimbingan privat riset Anda telah TERKONFIRMASI oleh Tim Pakar BIAS RISTEK:\n\n👨‍🏫 Tutor Pendamping: ${payload.tutorName} (${payload.tutorTitle})\n🏛️ Instansi: ${payload.tutorInstitution}\n🔬 Topik Bahasan: ${payload.researchTopic}\n📅 Waktu Sesi: ${payload.scheduledDate}, Pukul ${payload.timeSlot}\n\n🔗 Tautan Ruang Zoom Bimbingan:\n${payload.zoomJoinUrl}\n\nSilakan persiapkan draf naskah atau kendala olah data Anda sebelum sesi dimulai. Sampai jumpa di ruang bimbingan!`;

    if (payload.studentPhone) {
      await sendWhatsApp(payload.studentPhone, waText, "MENTORSHIP_CONFIRMED", payload.studentName);
    }

    if (payload.studentEmail) {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #001847; padding: 24px; text-align: center; color: #ffffff;">
            <h2 style="margin: 0; font-size: 20px; font-weight: 700;">BIAS RISTEK</h2>
            <p style="margin: 4px 0 0; font-size: 13px; color: #fdbc13;">Jadwal Bimbingan Riset Terkonfirmasi</p>
          </div>
          <div style="padding: 24px;">
            <p>Halo <strong>${payload.studentName}</strong>,</p>
            <p>Sesi bimbingan riset privat 1-on-1 Anda telah disetujui dan dijadwalkan bersama mentor pakar kami:</p>
            <div style="background-color: #f8f9ff; border-left: 4px solid #001847; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 0 0 8px;"><strong>Mentor:</strong> ${payload.tutorName} (${payload.tutorTitle})</p>
              <p style="margin: 0 0 8px;"><strong>Afiliasi:</strong> ${payload.tutorInstitution}</p>
              <p style="margin: 0 0 8px;"><strong>Topik:</strong> ${payload.researchTopic}</p>
              <p style="margin: 0 0 8px;"><strong>Waktu Sesi:</strong> ${payload.scheduledDate}, Pukul ${payload.timeSlot}</p>
            </div>
            <p style="text-align: center; margin: 24px 0;">
              <a href="${payload.zoomJoinUrl}" style="background-color: #001847; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Masuk Ruang Zoom Bimbingan</a>
            </p>
            <p style="font-size: 13px; color: #64748b;">Link Zoom: <a href="${payload.zoomJoinUrl}">${payload.zoomJoinUrl}</a></p>
          </div>
        </div>
      `;
      await sendEmail(payload.studentEmail, `[BIAS RISTEK] Jadwal Bimbingan Terkonfirmasi bersama ${payload.tutorName}`, emailHtml, "MENTORSHIP_CONFIRMED", payload.studentName);
    }
  } catch (err) {
    console.error("notifyStudentMentorshipConfirmed error:", err);
  }
}

/**
 * 7. Event: TUTOR_MENTORSHIP_CONFIRMED (Konfirmasi Jadwal Masuk Kalender Tutor)
 */
export async function notifyTutorMentorshipConfirmed(payload: {
  tutorName: string;
  tutorPhone: string;
  tutorEmail?: string;
  studentName: string;
  scheduledDate: string;
  timeSlot: string;
  zoomHostUrl?: string;
}) {
  try {
    const waText = `Yth. ${payload.tutorName},\n\nTerima kasih! Jadwal bimbingan bersama ${payload.studentName} pada ${payload.scheduledDate} pukul ${payload.timeSlot} telah RESMI TERKUNCI di sistem.\n\nTautan Host Zoom Anda:\n${payload.zoomHostUrl || "Tersedia di dashboard"}\n\nPengingat sesi akan dikirimkan kembali pada H-1 jam sebelum bimbingan dimulai.`;

    if (payload.tutorPhone) {
      await sendWhatsApp(payload.tutorPhone, waText, "TUTOR_CONFIRMED", payload.tutorName);
    }
  } catch (err) {
    console.error("notifyTutorMentorshipConfirmed error:", err);
  }
}
