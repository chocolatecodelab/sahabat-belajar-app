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

/**
 * 8. Event: SESSION_EVALUATION_SUBMITTED (Evaluasi Sesi Bimbingan Selesai)
 */
export async function notifySessionEvaluationSubmitted(payload: {
  studentName: string;
  studentPhone?: string;
  studentEmail?: string;
  tutorName: string;
  sessionNumber: number;
  currentChapter: string;
  methodologyScore: number;
  writingScore: number;
  dataProcessingScore: number;
  actionItems: string;
  tutorFeedback: string;
  classroomUrl?: string;
}) {
  try {
    const avg = Math.round((payload.methodologyScore + payload.writingScore + payload.dataProcessingScore) / 3);
    const classroomUrl = payload.classroomUrl || "http://localhost:3000/belajar";

    const waText = `Halo *${payload.studentName}*,\n\nMentor *${payload.tutorName}* telah menerbitkan lembar evaluasi untuk *Sesi Bimbingan Ke-${payload.sessionNumber}* Anda di BIAS RISTEK 🔬\n\n📌 *Progres Naskah:* ${payload.currentChapter}\n📊 *Rerata Skor Sesi:* ${avg}/100\n- Metodologi: ${payload.methodologyScore}/100\n- Penulisan Ilmiah: ${payload.writingScore}/100\n- Olah Data: ${payload.dataProcessingScore}/100\n\n📝 *Tindakan Perbaikan (Action Items):*\n${payload.actionItems}\n\n💬 *Catatan Mentor:*\n"${payload.tutorFeedback}"\n\nLihat log progres lengkap Anda di Ruang Belajar:\n🔗 ${classroomUrl}\n\nSemangat melanjutkan riset Anda!\n*Tim Akademik BIAS RISTEK*`;

    if (payload.studentPhone) {
      await sendWhatsApp(payload.studentPhone, waText, "SESSION_EVALUATION", payload.studentName);
    }

    if (payload.studentEmail) {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #001847; padding: 24px; text-align: center; color: #ffffff;">
            <h2 style="margin: 0; font-size: 20px; font-weight: 700;">BIAS RISTEK</h2>
            <p style="margin: 4px 0 0; font-size: 13px; color: #fdbc13;">Evaluasi Sesi Bimbingan Ke-${payload.sessionNumber}</p>
          </div>
          <div style="padding: 24px;">
            <p>Halo <strong>${payload.studentName}</strong>,</p>
            <p>Mentor <strong>${payload.tutorName}</strong> baru saja menerbitkan lembar evaluasi untuk sesi bimbingan riset privat Anda:</p>
            
            <div style="background-color: #f8f9ff; border-left: 4px solid #001847; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 0 0 6px;"><strong>Status Naskah:</strong> ${payload.currentChapter}</p>
              <p style="margin: 0 0 6px;"><strong>Rerata Skor Sesi:</strong> <span style="font-size: 16px; font-weight: 700; color: #001847;">${avg}/100</span></p>
              <ul style="margin: 4px 0 10px; padding-left: 20px; font-size: 13px; color: #475569;">
                <li>Skor Metodologi Penelitian: ${payload.methodologyScore}/100</li>
                <li>Skor Sistematika Penulisan: ${payload.writingScore}/100</li>
                <li>Skor Pengolahan Data: ${payload.dataProcessingScore}/100</li>
              </ul>
              <p style="margin: 0 0 6px;"><strong>Tindakan Perbaikan (Action Items):</strong></p>
              <div style="background-color: #ffffff; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0; font-size: 13px;">${payload.actionItems}</div>
              <p style="margin: 12px 0 6px;"><strong>Catatan Mentor:</strong></p>
              <blockquote style="margin: 0; padding: 10px; background-color: #ffffff; border-left: 3px solid #fdbc13; font-style: italic; font-size: 13px;">"${payload.tutorFeedback}"</blockquote>
            </div>

            <p style="text-align: center; margin: 24px 0;">
              <a href="${classroomUrl}" style="background-color: #001847; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Buka Ruang Belajar</a>
            </p>
          </div>
        </div>
      `;
      await sendEmail(payload.studentEmail, `[BIAS RISTEK] Lembar Evaluasi Sesi Ke-${payload.sessionNumber} oleh ${payload.tutorName}`, emailHtml, "SESSION_EVALUATION", payload.studentName);
    }
  } catch (err) {
    console.error("notifySessionEvaluationSubmitted error:", err);
  }
}

/**
 * 9. Event: MONTHLY_REPORT_GENERATED (e-Rapor Bulanan Kemajuan Riset)
 */
export async function notifyMonthlyReportGenerated(payload: {
  studentName: string;
  studentPhone?: string;
  studentEmail?: string;
  reportNumber: string;
  courseTitle: string;
  tutorName: string;
  periodMonth: number;
  periodYear: number;
  averageScore: number;
  progressStatus: string;
  reportUrl: string;
}) {
  try {
    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const monthName = monthNames[payload.periodMonth - 1] || "Bulan";

    const waText = `Halo *${payload.studentName}*,\n\nKabar gembira! Dokumen *e-Rapor Kemajuan Riset Bulanan* Anda untuk periode *${monthName} ${payload.periodYear}* telah resmi diterbitkan oleh Tim Akademik BIAS RISTEK 🎓\n\n📋 *No. Register Rapor:* ${payload.reportNumber}\n📌 *Program:* ${payload.courseTitle}\n👨‍🏫 *Tutor Pendamping:* ${payload.tutorName}\n⭐ *Rata-rata Capaian:* ${payload.averageScore}/100 (${payload.progressStatus})\n\nDokumen e-Rapor resmi berstempel dan bertanda tangan digital dapat dilihat dan diunduh melalui tautan berikut:\n🔗 ${payload.reportUrl}\n\nSalam hangat,\n*Direktorat Akademik BIAS RISTEK*`;

    if (payload.studentPhone) {
      await sendWhatsApp(payload.studentPhone, waText, "MONTHLY_REPORT", payload.studentName);
    }

    if (payload.studentEmail) {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #001847; padding: 24px; text-align: center; color: #ffffff;">
            <h2 style="margin: 0; font-size: 20px; font-weight: 700;">BIAS RISTEK</h2>
            <p style="margin: 4px 0 0; font-size: 13px; color: #fdbc13;">e-Rapor Kemajuan Riset Bulanan</p>
          </div>
          <div style="padding: 24px;">
            <p>Halo <strong>${payload.studentName}</strong>,</p>
            <p>Dokumen resmi e-Rapor Kemajuan Riset Anda periode <strong>${monthName} ${payload.periodYear}</strong> telah terbit:</p>
            
            <div style="background-color: #f8f9ff; border: 1px solid #d5e3fc; padding: 18px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 0 0 8px;"><strong>Nomor Rapor:</strong> <span style="font-family: monospace; font-weight: 700; color: #001847;">${payload.reportNumber}</span></p>
              <p style="margin: 0 0 8px;"><strong>Program Kursus:</strong> ${payload.courseTitle}</p>
              <p style="margin: 0 0 8px;"><strong>Tutor Pembimbing:</strong> ${payload.tutorName}</p>
              <p style="margin: 0 0 8px;"><strong>Skor Evaluasi:</strong> <span style="font-size: 16px; font-weight: 700; color: #7a5900;">${payload.averageScore} / 100</span></p>
              <p style="margin: 0;"><strong>Status Capaian:</strong> <span style="background-color: #fef9c3; color: #7a5900; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 700;">${payload.progressStatus}</span></p>
            </div>

            <p style="text-align: center; margin: 24px 0;">
              <a href="${payload.reportUrl}" style="background-color: #001847; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 700; display: inline-block;">Lihat & Unduh e-Rapor Resmi</a>
            </p>
            <p style="font-size: 12px; color: #64748b; text-align: center;">Tautan dokumen resmi: <a href="${payload.reportUrl}">${payload.reportUrl}</a></p>
          </div>
        </div>
      `;
      await sendEmail(payload.studentEmail, `[BIAS RISTEK] e-Rapor Kemajuan Riset Bulan ${monthName} ${payload.periodYear} Telah Terbit - ${payload.reportNumber}`, emailHtml, "MONTHLY_REPORT", payload.studentName);
    }
  } catch (err) {
    console.error("notifyMonthlyReportGenerated error:", err);
  }
}

/**
 * 10. Human Handoff Escalation Notification (WhatsApp & Email)
 * Notifies Admin CS immediately and confirms escalation to customer
 */
export async function notifyHumanHandoffEscalated(payload: {
  ticketNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  source: string;
  category: string;
  triggerReason: string;
  summary: string;
  lastUserMessage: string;
}) {
  try {
    const settings = await readNotificationSettings();
    const adminPhone = settings.whatsappAdminNumber || "6287777659482";

    // 1. Alert Admin CS
    const waAdminAlert = `🚨 *ESKALASI HUMAN HANDOFF CS!* 🚨\n\n📌 *Tiket:* ${payload.ticketNumber}\n👤 *Pengguna:* ${payload.customerName}\n📱 *Nomor WA:* +${payload.customerPhone}\n📁 *Kategori:* ${payload.category}\n⚡ *Pemicu:* ${payload.triggerReason}\n\n📝 *Ringkasan Kendala:*\n"${payload.summary}"\n\n💬 *Pesan Terakhir:*\n"${payload.lastUserMessage}"\n\n👉 Buka Dashboard CS: http://localhost:3000/dashboard/support\n👉 Chat Pelanggan: https://wa.me/${payload.customerPhone}`;
    await sendWhatsApp(adminPhone, waAdminAlert, "HUMAN_HANDOFF_ADMIN", "Admin CS BIAS RISTEK");

    // 2. Confirmation to Customer
    const waCustomerMsg = `Halo *${payload.customerName}*,\n\nPertanyaan Anda telah kami teruskan ke *Konsultan Akademik Senior BIAS RISTEK* 🧑‍🏫\n\n📋 *No. Tiket Bantuan:* ${payload.ticketNumber}\n⏳ *Status:* Menunggu Konsultan Manusia\n🤖 *Catatan:* Bot auto-reply sementara dinonaktifkan agar percakapan ditangani langsung oleh staf kami.\n\nStaf kami akan segera membalas di chat ini dalam beberapa saat, atau Anda dapat langsung menghubungi layanan prioritas:\n👉 https://wa.me/${adminPhone}?text=${encodeURIComponent(`Halo Admin, saya dengan Tiket ${payload.ticketNumber} (${payload.customerName}) ingin melanjutkan konsultasi.`)}\n\nTerima kasih atas kesabaran Anda,\n*Tim Konsultan BIAS RISTEK*`;
    await sendWhatsApp(payload.customerPhone, waCustomerMsg, "HUMAN_HANDOFF_STUDENT", payload.customerName);

    // 3. Email Confirmation to Customer if email provided
    if (payload.customerEmail) {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #001847; padding: 24px; text-align: center; color: #ffffff;">
            <h2 style="margin: 0; font-size: 20px; font-weight: 700;">BIAS RISTEK</h2>
            <p style="margin: 4px 0 0; font-size: 13px; color: #fdbc13;">Pemberitahuan Eskalasi Konsultan Akademik</p>
          </div>
          <div style="padding: 24px;">
            <p>Halo <strong>${payload.customerName}</strong>,</p>
            <p>Permintaan konsultasi Anda telah diteruskan ke Konsultan Akademik Senior kami:</p>
            
            <div style="background-color: #f8f9ff; border: 1px solid #d5e3fc; padding: 18px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 0 0 8px;"><strong>Nomor Tiket:</strong> <span style="font-family: monospace; font-weight: 700; color: #001847;">${payload.ticketNumber}</span></p>
              <p style="margin: 0 0 8px;"><strong>Kategori:</strong> ${payload.category}</p>
              <p style="margin: 0 0 8px;"><strong>Pemicu Alih Kendali:</strong> ${payload.triggerReason}</p>
              <p style="margin: 0 0 8px;"><strong>Status:</strong> <span style="background-color: #fee2e2; color: #991b1b; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 700;">Menunggu Admin Manusia</span></p>
              <p style="margin: 0;"><strong>Ringkasan:</strong> ${payload.summary}</p>
            </div>

            <p>Bot AI otomatis dijeda pada kontak Anda untuk memastikan jawaban yang Anda terima berasal langsung dari staf ahli kami.</p>
            
            <p style="text-align: center; margin: 24px 0;">
              <a href="https://wa.me/${adminPhone}?text=${encodeURIComponent(`Halo Admin, saya dengan Tiket ${payload.ticketNumber} (${payload.customerName}) ingin melanjutkan konsultasi.`)}" style="background-color: #001847; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 700; display: inline-block;">Hubungi WhatsApp Konsultan Senior</a>
            </p>
          </div>
        </div>
      `;
      await sendEmail(payload.customerEmail, `[BIAS RISTEK] Tiket Konsultasi #${payload.ticketNumber} Telah Diteruskan ke Konsultan Senior`, emailHtml, "HUMAN_HANDOFF_STUDENT", payload.customerName);
    }
  } catch (err) {
    console.error("notifyHumanHandoffEscalated error:", err);
  }
}

