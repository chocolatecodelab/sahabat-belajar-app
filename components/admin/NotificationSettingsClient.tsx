"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  MessageSquare,
  Mail,
  FileCode,
  History,
  Save,
  Send,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Eye,
  Info,
  Check,
  Zap,
  Sliders,
  ExternalLink,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  updateNotificationSettingsAction,
  sendTestNotificationAction,
  getNotificationLogsAction,
  clearNotificationLogsAction,
  simulateOperationalTriggerAction,
} from "@/actions/notifikasi";
import type {
  NotificationSettingsData,
  NotificationLogItem,
  WhatsAppProvider,
  EmailProvider,
} from "@/lib/notifications";

interface NotificationSettingsClientProps {
  initialSettings: NotificationSettingsData;
  initialLogs: NotificationLogItem[];
}

export default function NotificationSettingsClient({
  initialSettings,
  initialLogs,
}: NotificationSettingsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"whatsapp" | "email" | "templates" | "logs">("whatsapp");
  const [settings, setSettings] = useState<NotificationSettingsData>(initialSettings);
  const [logs, setLogs] = useState<NotificationLogItem[]>(initialLogs);
  const [activeTemplateEvent, setActiveTemplateEvent] = useState<
    "invoiceCreated" | "paymentVerified" | "submissionReviewed" | "certificateIssued"
  >("invoiceCreated");

  // Save states
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Test WhatsApp
  const [testPhone, setTestPhone] = useState("");
  const [testingWa, setTestingWa] = useState(false);
  const [testWaResult, setTestWaResult] = useState<{ success: boolean; message: string } | null>(null);

  // Test Email
  const [testEmail, setTestEmail] = useState("");
  const [testingEmail, setTestingEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message: string } | null>(null);

  // Simulator Pemicu Operasional (Dummy Number/Email Testing)
  const [simulatingTrigger, setSimulatingTrigger] = useState<string | null>(null);
  const [simTriggerMessage, setSimTriggerMessage] = useState<string | null>(null);

  // Log preview modal
  const [selectedLog, setSelectedLog] = useState<NotificationLogItem | null>(null);
  const [logFilterChannel, setLogFilterChannel] = useState("ALL");
  const [logFilterStatus, setLogFilterStatus] = useState("ALL");
  const [isPending, startTransition] = useTransition();

  // Save Form Handler
  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    const formData = new FormData();
    // WhatsApp
    formData.set("whatsappProvider", settings.whatsappProvider);
    formData.set("whatsappApiToken", settings.whatsappApiToken || "");
    formData.set("whatsappEndpointUrl", settings.whatsappEndpointUrl || "");
    formData.set("whatsappSenderNumber", settings.whatsappSenderNumber || "");
    formData.set("whatsappAdminNumber", settings.whatsappAdminNumber || "");

    // Email
    formData.set("emailProvider", settings.emailProvider);
    formData.set("emailSmtpHost", settings.emailSmtpHost || "");
    formData.set("emailSmtpPort", String(settings.emailSmtpPort || 587));
    formData.set("emailSmtpSecure", String(settings.emailSmtpSecure || false));
    formData.set("emailSmtpUser", settings.emailSmtpUser || "");
    formData.set("emailSmtpPass", settings.emailSmtpPass || "");
    formData.set("emailResendApiKey", settings.emailResendApiKey || "");
    formData.set("emailSenderName", settings.emailSenderName || "");
    formData.set("emailSenderAddress", settings.emailSenderAddress || "");
    formData.set("testOverridePhone", settings.testOverridePhone || "");
    formData.set("testOverrideEmail", settings.testOverrideEmail || "");

    // Event Toggles
    formData.set("waEnabled_invoiceCreated", String(settings.waEnabled_invoiceCreated));
    formData.set("waEnabled_paymentVerified", String(settings.waEnabled_paymentVerified));
    formData.set("waEnabled_submissionReviewed", String(settings.waEnabled_submissionReviewed));
    formData.set("waEnabled_certificateIssued", String(settings.waEnabled_certificateIssued));

    formData.set("emailEnabled_invoiceCreated", String(settings.emailEnabled_invoiceCreated));
    formData.set("emailEnabled_paymentVerified", String(settings.emailEnabled_paymentVerified));
    formData.set("emailEnabled_submissionReviewed", String(settings.emailEnabled_submissionReviewed));
    formData.set("emailEnabled_certificateIssued", String(settings.emailEnabled_certificateIssued));

    // Templates WhatsApp
    formData.set("template_wa_invoiceCreated", settings.template_wa_invoiceCreated || "");
    formData.set("template_wa_paymentVerified", settings.template_wa_paymentVerified || "");
    formData.set("template_wa_submissionReviewed", settings.template_wa_submissionReviewed || "");
    formData.set("template_wa_certificateIssued", settings.template_wa_certificateIssued || "");

    // Templates Email
    formData.set("template_email_invoiceCreated", settings.template_email_invoiceCreated || "");
    formData.set("template_email_paymentVerified", settings.template_email_paymentVerified || "");
    formData.set("template_email_submissionReviewed", settings.template_email_submissionReviewed || "");
    formData.set("template_email_certificateIssued", settings.template_email_certificateIssued || "");

    const res = await updateNotificationSettingsAction(formData);
    if (res.success && res.data) {
      setSaveSuccess(true);
      setSettings(res.data);
      router.refresh();
      setTimeout(() => setSaveSuccess(false), 4000);
    } else {
      setSaveError(res.message || "Gagal menyimpan pengaturan");
    }
    setSaving(false);
  };

  // Test WhatsApp
  const handleTestWhatsApp = async () => {
    if (!testPhone) return;
    setTestingWa(true);
    setTestWaResult(null);

    const res = await sendTestNotificationAction({
      channel: "WHATSAPP",
      target: testPhone,
      recipientName: "Admin Sahabat Belajar",
    });

    setTestWaResult({
      success: res.success,
      message: res.message || (res.success ? "Berhasil dikirim" : "Gagal mengirim"),
    });
    setTestingWa(false);
    refreshLogs();
  };

  // Test Email
  const handleTestEmail = async () => {
    if (!testEmail) return;
    setTestingEmail(true);
    setTestEmailResult(null);

    const res = await sendTestNotificationAction({
      channel: "EMAIL",
      target: testEmail,
      recipientName: "Admin Sahabat Belajar",
    });

    setTestEmailResult({
      success: res.success,
      message: res.message || (res.success ? "Berhasil dikirim" : "Gagal mengirim"),
    });
    setTestingEmail(false);
    refreshLogs();
  };

  // Refresh Logs
  const refreshLogs = async () => {
    startTransition(async () => {
      const updatedLogs = await getNotificationLogsAction({
        channel: logFilterChannel,
        status: logFilterStatus,
        limit: 50,
      });
      setLogs(updatedLogs);
    });
  };

  // Clear Logs
  const handleClearLogs = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus semua riwayat log notifikasi?")) return;
    await clearNotificationLogsAction();
    setLogs([]);
  };

  // Simulasikan Pemicu Operasional (Dummy Mode)
  const handleSimulateTrigger = async (
    triggerType: "LEAD_REGISTERED" | "SESSION_SCHEDULED" | "LOW_QUOTA_ALERT" | "PAYMENT_VERIFIED"
  ) => {
    setSimulatingTrigger(triggerType);
    setSimTriggerMessage(null);
    const res = await simulateOperationalTriggerAction(triggerType);
    setSimulatingTrigger(null);
    setSimTriggerMessage(res.message || null);
    await refreshLogs();
    setActiveTab("logs");
  };

  // Dynamic Variable tags list for active template
  const getAvailableVariables = () => {
    switch (activeTemplateEvent) {
      case "invoiceCreated":
        return [
          { tag: "{{student_name}}", label: "Nama Siswa" },
          { tag: "{{course_title}}", label: "Judul Kursus" },
          { tag: "{{invoice_number}}", label: "No. Invoice" },
          { tag: "{{total_amount}}", label: "Total Tagihan" },
          { tag: "{{unique_code}}", label: "Kode Unik (3 Digit)" },
          { tag: "{{payment_method}}", label: "Metode Bayar" },
          { tag: "{{invoice_url}}", label: "Link Tagihan" },
        ];
      case "paymentVerified":
        return [
          { tag: "{{student_name}}", label: "Nama Siswa" },
          { tag: "{{course_title}}", label: "Judul Kursus" },
          { tag: "{{invoice_number}}", label: "No. Invoice" },
          { tag: "{{login_email}}", label: "Email Akun" },
          { tag: "{{classroom_url}}", label: "Link Ruang Belajar" },
          { tag: "{{login_url}}", label: "Link Login" },
        ];
      case "submissionReviewed":
        return [
          { tag: "{{student_name}}", label: "Nama Siswa" },
          { tag: "{{course_title}}", label: "Judul Kursus" },
          { tag: "{{task_title}}", label: "Judul Tugas" },
          { tag: "{{status}}", label: "Status Review" },
          { tag: "{{score}}", label: "Nilai (Skor)" },
          { tag: "{{mentor_feedback}}", label: "Catatan Mentor" },
          { tag: "{{classroom_url}}", label: "Link Ruang Belajar" },
        ];
      case "certificateIssued":
        return [
          { tag: "{{student_name}}", label: "Nama Siswa" },
          { tag: "{{course_title}}", label: "Judul Kursus" },
          { tag: "{{certificate_code}}", label: "No. Seri Sertifikat" },
          { tag: "{{total_hours}}", label: "Beban Jam (32 JP)" },
          { tag: "{{certificate_url}}", label: "Link Validasi Publik" },
        ];
    }
  };

  const insertVariable = (tag: string, field: "wa" | "email") => {
    const key = field === "wa" ? `template_wa_${activeTemplateEvent}` : `template_email_${activeTemplateEvent}`;
    setSettings((prev) => ({
      ...prev,
      [key]: (prev[key as keyof NotificationSettingsData] as string || "") + " " + tag,
    }));
  };

  return (
    <div className="space-y-6 max-w-6xl pb-12" suppressHydrationWarning>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-display text-[#0A2650] flex items-center gap-3">
            <MessageSquare size={26} className="text-[#09408C]" /> Notifikasi & Gateway Omnichannel
          </h1>
          <p className="text-xs mt-1 text-[#5B6882]">
            Kelola gateway pengiriman pesan otomatis via WhatsApp dan Email Transaksional
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleSaveSettings()}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#09408C] hover:bg-[#0E3571] text-white shadow-sm hover:shadow-md transition-all disabled:opacity-50 cursor-pointer"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save size={16} />
          )}
          <span>{saving ? "Menyimpan..." : "Simpan Perubahan"}</span>
        </button>
      </div>

      {/* Global Alerts */}
      {saveSuccess && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-[#E3F4EC] text-[#1F6F4A] border border-[#1F6F4A]/20 text-xs font-semibold shadow-xs animate-fade-in">
          <CheckCircle2 size={18} className="text-[#1F6F4A] shrink-0" />
          <span>Pengaturan gateway dan template notifikasi berhasil disimpan & siap digunakan!</span>
        </div>
      )}

      {saveError && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-[#FBE9E5] text-[#B4381F] border border-[#B4381F]/20 text-xs font-semibold shadow-xs animate-fade-in">
          <AlertCircle size={18} className="text-[#B4381F] shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#D5DDEB] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("whatsapp")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "whatsapp"
              ? "bg-[#09408C] text-white shadow-xs"
              : "text-[#5B6882] hover:text-[#1B2A41] hover:bg-[#EAF1FA]"
          }`}
        >
          <MessageSquare size={15} />
          <span>WhatsApp Gateway</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
            settings.whatsappProvider === "SIMULATED" ? "bg-[#F5B82E]/25 text-[#1B2A41]" : "bg-[#E3F4EC] text-[#1F6F4A]"
          }`}>
            {settings.whatsappProvider}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("email")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "email"
              ? "bg-[#09408C] text-white shadow-xs"
              : "text-[#5B6882] hover:text-[#1B2A41] hover:bg-[#EAF1FA]"
          }`}
        >
          <Mail size={15} />
          <span>Email Transaksional</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
            settings.emailProvider === "SIMULATED" ? "bg-[#F5B82E]/25 text-[#1B2A41]" : "bg-[#EAF1FA] text-[#09408C]"
          }`}>
            {settings.emailProvider}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("templates")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "templates"
              ? "bg-[#09408C] text-white shadow-xs"
              : "text-[#5B6882] hover:text-[#1B2A41] hover:bg-[#EAF1FA]"
          }`}
        >
          <FileCode size={15} />
          <span>Template Pesan & Pemicu</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("logs");
            refreshLogs();
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "logs"
              ? "bg-[#09408C] text-white shadow-xs"
              : "text-[#5B6882] hover:text-[#1B2A41] hover:bg-[#EAF1FA]"
          }`}
        >
          <History size={16} />
          <span>Riwayat Log Notifikasi</span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-3xs font-bold">
            {logs.length}
          </span>
        </button>
      </div>

      {/* ==========================================
          PANEL SIMULASI & OVERRIDE DATA DUMMY
      ========================================== */}
      <div className="bg-[#EAF1FA] rounded-2xl p-5 border border-[#9AC1E2] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#09408C] text-white text-[10px] font-bold uppercase tracking-wider mb-1.5">
              <Zap size={11} />
              <span>Sandbox & Dummy Contact Mode Aktif</span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-[#09408C] font-display">
              Simulasi Pemicu Otomatis & Pengalihan Kontak Dummy
            </h2>
            <p className="text-xs text-[#1B2A41]/80 mt-0.5">
              Karena nomor WhatsApp dan email siswa/tutor saat ini masih menggunakan data dummy, seluruh notifikasi otomatis tercatat aman di <strong>Riwayat Log Notifikasi</strong> (dan dapat dibuka via tombol <em>Buka WA Web</em>) tanpa mengirim pesan ke nomor asing. Anda juga dapat mengisi nomor/email pengujian di bawah jika ingin mengalihkan seluruh notifikasi dummy ke kontak Anda sendiri.
            </p>
          </div>
        </div>

        {/* Optional Override Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white p-4 rounded-xl border border-[#D5DDEB]">
          <div>
            <label htmlFor="override-test-phone" className="block text-xs font-bold text-[#1B2A41] mb-1">
              Nomor WA Redirect Pengujian (Opsional — Kosongkan untuk Simulasi Murni)
            </label>
            <input
              id="override-test-phone"
              type="tel"
              value={settings.testOverridePhone || ""}
              onChange={(e) => setSettings({ ...settings, testOverridePhone: e.target.value })}
              placeholder="Contoh: 0812xxxx (Semua WA siswa dummy akan dialihkan ke nomor ini)"
              className="w-full px-3.5 py-2 rounded-xl border border-[#D5DDEB] text-xs focus-ring bg-[#F4F7FB] focus:bg-white"
            />
          </div>
          <div>
            <label htmlFor="override-test-email" className="block text-xs font-bold text-[#1B2A41] mb-1">
              Email Redirect Pengujian (Opsional — Kosongkan untuk Simulasi Murni)
            </label>
            <input
              id="override-test-email"
              type="email"
              value={settings.testOverrideEmail || ""}
              onChange={(e) => setSettings({ ...settings, testOverrideEmail: e.target.value })}
              placeholder="Contoh: nama@email.com (Semua Email siswa dummy dialihkan ke sini)"
              className="w-full px-3.5 py-2 rounded-xl border border-[#D5DDEB] text-xs focus-ring bg-[#F4F7FB] focus:bg-white"
            />
          </div>
        </div>

        {/* 1-Click Trigger Simulator Buttons */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-[#09408C]">
            Uji Coba 1-Klik Pemicu Otomatis (Langsung Mencatat WA & Email ke Riwayat Log):
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            <button
              type="button"
              disabled={simulatingTrigger !== null}
              onClick={() => handleSimulateTrigger("LEAD_REGISTERED")}
              className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#09408C] text-[#09408C] hover:text-white border border-[#9AC1E2] text-xs font-bold transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              <span>1. Simulasi Lead Baru</span>
              <Send size={13} className="shrink-0" />
            </button>

            <button
              type="button"
              disabled={simulatingTrigger !== null}
              onClick={() => handleSimulateTrigger("SESSION_SCHEDULED")}
              className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#09408C] text-[#09408C] hover:text-white border border-[#9AC1E2] text-xs font-bold transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              <span>2. Simulasi Jadwal Sesi</span>
              <Send size={13} className="shrink-0" />
            </button>

            <button
              type="button"
              disabled={simulatingTrigger !== null}
              onClick={() => handleSimulateTrigger("LOW_QUOTA_ALERT")}
              className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#09408C] text-[#09408C] hover:text-white border border-[#9AC1E2] text-xs font-bold transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              <span>3. Simulasi Kuota ≤ 2 Sesi</span>
              <Send size={13} className="shrink-0" />
            </button>

            <button
              type="button"
              disabled={simulatingTrigger !== null}
              onClick={() => handleSimulateTrigger("PAYMENT_VERIFIED")}
              className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#09408C] text-[#09408C] hover:text-white border border-[#9AC1E2] text-xs font-bold transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              <span>4. Simulasi Bayar Lunas</span>
              <Send size={13} className="shrink-0" />
            </button>
          </div>

          {simTriggerMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[#E3F4EC] text-[#1F6F4A] border border-[#1F6F4A]/20 text-xs font-semibold">
              <CheckCircle2 size={15} className="shrink-0" />
              <span>{simTriggerMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* ==========================================
          TAB 1: WHATSAPP GATEWAY
      ========================================== */}
      {activeTab === "whatsapp" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Provider Selection Cards */}
            <div className="bg-white elevation-1 rounded-2xl p-6 border border-gray-100 space-y-4">
              <h2 className="text-title-md font-bold text-gray-900 flex items-center gap-2">
                <Sliders size={20} className="text-blue-900" />
                Pilih Provider WhatsApp Gateway
              </h2>
              <p className="text-xs text-gray-500">
                Pilih metode pengiriman pesan WhatsApp yang ingin Anda gunakan
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* Simulated */}
                <div
                  onClick={() => setSettings({ ...settings, whatsappProvider: "SIMULATED" })}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    settings.whatsappProvider === "SIMULATED"
                      ? "border-blue-900 bg-blue-50/50 shadow-xs"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-gray-900">Mode Simulasi (Gratis)</span>
                    <span className="px-2 py-0.5 rounded-md text-3xs font-bold bg-amber-100 text-amber-800">
                      Development
                    </span>
                  </div>
                  <p className="text-2xs text-gray-500">
                    Pesan tidak dikirim ke nomor asli, melainkan dicatat lengkap di tab Log Notifikasi untuk preview.
                  </p>
                </div>

                {/* Fonnte */}
                <div
                  onClick={() => setSettings({ ...settings, whatsappProvider: "FONNTE" })}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    settings.whatsappProvider === "FONNTE"
                      ? "border-blue-900 bg-blue-50/50 shadow-xs"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-gray-900">Fonnte Gateway</span>
                    <span className="px-2 py-0.5 rounded-md text-3xs font-bold bg-emerald-100 text-emerald-800">
                      Rekomendasi
                    </span>
                  </div>
                  <p className="text-2xs text-gray-500">
                    Scan QR via fonnte.com dan tempelkan API Token. Ada kuota free trial.
                  </p>
                </div>

                {/* Wablas */}
                <div
                  onClick={() => setSettings({ ...settings, whatsappProvider: "WABLAS" })}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    settings.whatsappProvider === "WABLAS"
                      ? "border-blue-900 bg-blue-50/50 shadow-xs"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-gray-900">Wablas Gateway</span>
                  </div>
                  <p className="text-2xs text-gray-500">
                    Integrasi API via portal wablas.com dengan API Token resmi.
                  </p>
                </div>

                {/* Custom / Self-Hosted */}
                <div
                  onClick={() => setSettings({ ...settings, whatsappProvider: "CUSTOM" })}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    settings.whatsappProvider === "CUSTOM"
                      ? "border-blue-900 bg-blue-50/50 shadow-xs"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-gray-900">Self-Hosted / Baileys</span>
                    <span className="px-2 py-0.5 rounded-md text-3xs font-bold bg-purple-100 text-purple-800">
                      100% Gratis
                    </span>
                  </div>
                  <p className="text-2xs text-gray-500">
                    Endpoint custom/webhook lokal (Baileys / Evolution API) tanpa batasan pesan.
                  </p>
                </div>
              </div>
            </div>

            {/* Credential Inputs */}
            <div className="bg-white elevation-1 rounded-2xl p-6 border border-gray-100 space-y-4">
              <h3 className="text-title-sm font-bold text-gray-900">Kredensial & Konfigurasi API</h3>

              {settings.whatsappProvider !== "SIMULATED" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-label-md block mb-1 font-semibold text-gray-700">
                      WhatsApp API Token / Key
                    </label>
                    <input
                      type="password"
                      value={settings.whatsappApiToken}
                      onChange={(e) => setSettings({ ...settings, whatsappApiToken: e.target.value })}
                      placeholder="Masukkan API Token dari Fonnte / Wablas..."
                      className="w-full px-4 py-2.5 rounded-xl border text-body-sm font-mono focus-ring bg-gray-50 focus:bg-white"
                      style={{ borderColor: "var(--color-outline-variant)" }}
                    />
                  </div>

                  {settings.whatsappProvider === "CUSTOM" && (
                    <div>
                      <label className="text-label-md block mb-1 font-semibold text-gray-700">
                        Custom Endpoint Webhook URL
                      </label>
                      <input
                        type="url"
                        value={settings.whatsappEndpointUrl}
                        onChange={(e) => setSettings({ ...settings, whatsappEndpointUrl: e.target.value })}
                        placeholder="http://localhost:8000/send-message"
                        className="w-full px-4 py-2.5 rounded-xl border text-body-sm font-mono focus-ring bg-gray-50 focus:bg-white"
                        style={{ borderColor: "var(--color-outline-variant)" }}
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-label-md block mb-1 font-semibold text-gray-700">
                    Nomor WhatsApp Pengirim (Opsional)
                  </label>
                  <input
                    type="text"
                    value={settings.whatsappSenderNumber}
                    onChange={(e) => setSettings({ ...settings, whatsappSenderNumber: e.target.value })}
                    placeholder="087777659482"
                    className="w-full px-4 py-2.5 rounded-xl border text-body-sm focus-ring bg-gray-50 focus:bg-white"
                    style={{ borderColor: "var(--color-outline-variant)" }}
                  />
                  <span className="text-3xs text-gray-500 mt-1 block">Nomor WhatsApp perangkat resmi instansi</span>
                </div>

                <div>
                  <label className="text-label-md block mb-1 font-semibold text-gray-700">
                    Nomor WhatsApp Admin (Notifikasi Order)
                  </label>
                  <input
                    type="text"
                    value={settings.whatsappAdminNumber}
                    onChange={(e) => setSettings({ ...settings, whatsappAdminNumber: e.target.value })}
                    placeholder="081234567890"
                    className="w-full px-4 py-2.5 rounded-xl border text-body-sm focus-ring bg-gray-50 focus:bg-white"
                    style={{ borderColor: "var(--color-outline-variant)" }}
                  />
                  <span className="text-3xs text-gray-500 mt-1 block">Menerima pesan alert setiap ada transaksi baru</span>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp Test Box */}
          <div className="space-y-6">
            <div className="bg-white elevation-1 rounded-2xl p-6 border border-gray-100 space-y-4">
              <div className="flex items-center gap-2 text-emerald-700">
                <Send size={20} />
                <h3 className="text-title-sm font-bold text-gray-900">Uji Coba Kirim WhatsApp</h3>
              </div>
              <p className="text-2xs text-gray-600">
                Kirimkan pesan uji coba ke nomor WhatsApp Anda untuk memastikan gateway bekerja dengan baik.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Nomor WhatsApp Tujuan
                  </label>
                  <input
                    type="tel"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs focus-ring bg-gray-50 focus:bg-white"
                    style={{ borderColor: "var(--color-outline-variant)" }}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleTestWhatsApp}
                  disabled={testingWa || !testPhone}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                  style={{ background: "#25D366" }}
                >
                  {testingWa ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                  <span>{testingWa ? "Mengirim Pesan..." : "Kirim Pesan Uji Coba"}</span>
                </button>

                {testWaResult && (
                  <div
                    className={`p-3 rounded-xl text-2xs font-semibold flex items-start gap-2 ${
                      testWaResult.success
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    {testWaResult.success ? (
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                    )}
                    <span>{testWaResult.message}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Info Card */}
            <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 text-blue-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs text-blue-900">
                <Info size={16} />
                <span>Tips WhatsApp Gateway</span>
              </div>
              <ul className="text-3xs space-y-1.5 text-blue-900/80 list-disc list-inside">
                <li>Gunakan format nomor lokal (08xxx) atau internasional (628xxx).</li>
                <li>Jika menggunakan Fonnte, daftarkan device Anda di menu Device Fonnte.</li>
                <li>Dalam mode Simulasi, pesan tidak memotong kuota dan dicatat di tab Log.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 2: EMAIL TRANSAKSIONAL
      ========================================== */}
      {activeTab === "email" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Provider Selection */}
            <div className="bg-white elevation-1 rounded-2xl p-6 border border-gray-100 space-y-4">
              <h2 className="text-title-md font-bold text-gray-900 flex items-center gap-2">
                <Mail size={20} className="text-blue-900" />
                Pilih Provider Email Transaksional
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {/* Simulated */}
                <div
                  onClick={() => setSettings({ ...settings, emailProvider: "SIMULATED" })}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    settings.emailProvider === "SIMULATED"
                      ? "border-blue-900 bg-blue-50/50 shadow-xs"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-gray-900">Mode Simulasi</span>
                  </div>
                  <p className="text-2xs text-gray-500">Mencatat output HTML email ke log sistem.</p>
                </div>

                {/* SMTP */}
                <div
                  onClick={() => setSettings({ ...settings, emailProvider: "SMTP" })}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    settings.emailProvider === "SMTP"
                      ? "border-blue-900 bg-blue-50/50 shadow-xs"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-gray-900">SMTP / Gmail</span>
                    <span className="px-1.5 py-0.5 rounded text-3xs font-bold bg-blue-100 text-blue-800">
                      Standard
                    </span>
                  </div>
                  <p className="text-2xs text-gray-500">Gmail App Password, cPanel, Mailgun, dll.</p>
                </div>

                {/* Resend */}
                <div
                  onClick={() => setSettings({ ...settings, emailProvider: "RESEND" })}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    settings.emailProvider === "RESEND"
                      ? "border-blue-900 bg-blue-50/50 shadow-xs"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-gray-900">Resend API</span>
                    <span className="px-1.5 py-0.5 rounded text-3xs font-bold bg-purple-100 text-purple-800">
                      API High Speed
                    </span>
                  </div>
                  <p className="text-2xs text-gray-500">Kirim email via Resend Cloud API.</p>
                </div>
              </div>
            </div>

            {/* SMTP Settings */}
            {settings.emailProvider === "SMTP" && (
              <div className="bg-white elevation-1 rounded-2xl p-6 border border-gray-100 space-y-4">
                <h3 className="text-title-sm font-bold text-gray-900">Konfigurasi Server SMTP</h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-label-md block mb-1 font-semibold text-gray-700">SMTP Host</label>
                    <input
                      type="text"
                      value={settings.emailSmtpHost}
                      onChange={(e) => setSettings({ ...settings, emailSmtpHost: e.target.value })}
                      placeholder="smtp.gmail.com"
                      className="w-full px-4 py-2.5 rounded-xl border text-body-sm font-mono focus-ring bg-gray-50 focus:bg-white"
                      style={{ borderColor: "var(--color-outline-variant)" }}
                    />
                  </div>

                  <div>
                    <label className="text-label-md block mb-1 font-semibold text-gray-700">Port</label>
                    <input
                      type="number"
                      value={settings.emailSmtpPort}
                      onChange={(e) => setSettings({ ...settings, emailSmtpPort: Number(e.target.value) })}
                      placeholder="587"
                      className="w-full px-4 py-2.5 rounded-xl border text-body-sm font-mono focus-ring bg-gray-50 focus:bg-white"
                      style={{ borderColor: "var(--color-outline-variant)" }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-label-md block mb-1 font-semibold text-gray-700">SMTP Username / Email</label>
                    <input
                      type="text"
                      value={settings.emailSmtpUser}
                      onChange={(e) => setSettings({ ...settings, emailSmtpUser: e.target.value })}
                      placeholder="akademik@biasristek.id"
                      className="w-full px-4 py-2.5 rounded-xl border text-body-sm focus-ring bg-gray-50 focus:bg-white"
                      style={{ borderColor: "var(--color-outline-variant)" }}
                    />
                  </div>

                  <div>
                    <label className="text-label-md block mb-1 font-semibold text-gray-700">SMTP Password / App Password</label>
                    <input
                      type="password"
                      value={settings.emailSmtpPass}
                      onChange={(e) => setSettings({ ...settings, emailSmtpPass: e.target.value })}
                      placeholder="••••••••••••••••"
                      className="w-full px-4 py-2.5 rounded-xl border text-body-sm font-mono focus-ring bg-gray-50 focus:bg-white"
                      style={{ borderColor: "var(--color-outline-variant)" }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Resend API Key */}
            {settings.emailProvider === "RESEND" && (
              <div className="bg-white elevation-1 rounded-2xl p-6 border border-gray-100 space-y-4">
                <h3 className="text-title-sm font-bold text-gray-900">Konfigurasi Resend API</h3>
                <div>
                  <label className="text-label-md block mb-1 font-semibold text-gray-700">Resend API Key</label>
                  <input
                    type="password"
                    value={settings.emailResendApiKey}
                    onChange={(e) => setSettings({ ...settings, emailResendApiKey: e.target.value })}
                    placeholder="re_xxxxxxxxxxxx"
                    className="w-full px-4 py-2.5 rounded-xl border text-body-sm font-mono focus-ring bg-gray-50 focus:bg-white"
                    style={{ borderColor: "var(--color-outline-variant)" }}
                  />
                </div>
              </div>
            )}

            {/* Sender Identity */}
            <div className="bg-white elevation-1 rounded-2xl p-6 border border-gray-100 space-y-4">
              <h3 className="text-title-sm font-bold text-gray-900">Identitas Pengirim Email</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-label-md block mb-1 font-semibold text-gray-700">Nama Pengirim (From Name)</label>
                  <input
                    type="text"
                    value={settings.emailSenderName}
                    onChange={(e) => setSettings({ ...settings, emailSenderName: e.target.value })}
                    placeholder="Sahabat Belajar Akademik"
                    className="w-full px-4 py-2.5 rounded-xl border text-body-sm focus-ring bg-gray-50 focus:bg-white"
                    style={{ borderColor: "var(--color-outline-variant)" }}
                  />
                </div>

                <div>
                  <label className="text-label-md block mb-1 font-semibold text-gray-700">Email Pengirim (From Email)</label>
                  <input
                    type="email"
                    value={settings.emailSenderAddress}
                    onChange={(e) => setSettings({ ...settings, emailSenderAddress: e.target.value })}
                    placeholder="halo@sahabatbelajar.id"
                    className="w-full px-4 py-2.5 rounded-xl border text-body-sm focus-ring bg-gray-50 focus:bg-white"
                    style={{ borderColor: "var(--color-outline-variant)" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Email Test Box */}
          <div className="space-y-6">
            <div className="bg-white elevation-1 rounded-2xl p-6 border border-gray-100 space-y-4">
              <div className="flex items-center gap-2 text-blue-900">
                <Send size={20} />
                <h3 className="text-title-sm font-bold text-gray-900">Uji Coba Kirim Email</h3>
              </div>
              <p className="text-2xs text-gray-600">
                Kirimkan email uji coba ke alamat email Anda untuk memastikan konfigurasi SMTP/Resend aktif.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Alamat Email Tujuan
                  </label>
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="contoh@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs focus-ring bg-gray-50 focus:bg-white"
                    style={{ borderColor: "var(--color-outline-variant)" }}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleTestEmail}
                  disabled={testingEmail || !testEmail}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer bg-[#09408C] hover:bg-[#0E3571]"
                >
                  {testingEmail ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                  <span>{testingEmail ? "Mengirim Email..." : "Kirim Email Uji Coba"}</span>
                </button>

                {testEmailResult && (
                  <div
                    className={`p-3 rounded-xl text-2xs font-semibold flex items-start gap-2 ${
                      testEmailResult.success
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    {testEmailResult.success ? (
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                    )}
                    <span>{testEmailResult.message}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 3: TEMPLATE PESAN & PEMICU
      ========================================== */}
      {activeTab === "templates" && (
        <div className="space-y-6">
          {/* Event Selector Tabs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => setActiveTemplateEvent("invoiceCreated")}
              className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                activeTemplateEvent === "invoiceCreated"
                  ? "border-[#09408C] bg-[#EAF1FA] shadow-xs"
                  : "border-[#D5DDEB] bg-white hover:border-[#9AC1E2]"
              }`}
            >
              <span className="block text-2xs font-bold text-[#09408C] uppercase">Event 1</span>
              <span className="font-bold text-sm text-[#1B2A41] block mt-0.5">Pendaftaran & Lead Baru</span>
              <span className="text-3xs text-[#5B6882] block mt-1">Sambutan Calon Siswa & Tagihan</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTemplateEvent("paymentVerified")}
              className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                activeTemplateEvent === "paymentVerified"
                  ? "border-[#09408C] bg-[#EAF1FA] shadow-xs"
                  : "border-[#D5DDEB] bg-white hover:border-[#9AC1E2]"
              }`}
            >
              <span className="block text-2xs font-bold text-[#1F6F4A] uppercase">Event 2</span>
              <span className="font-bold text-sm text-[#1B2A41] block mt-0.5">Pembayaran Paket Lunas</span>
              <span className="text-3xs text-[#5B6882] block mt-1">Aktivasi Kuota & Portal Siswa</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTemplateEvent("submissionReviewed")}
              className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                activeTemplateEvent === "submissionReviewed"
                  ? "border-[#09408C] bg-[#EAF1FA] shadow-xs"
                  : "border-[#D5DDEB] bg-white hover:border-[#9AC1E2]"
              }`}
            >
              <span className="block text-2xs font-bold text-[#295897] uppercase">Event 3</span>
              <span className="font-bold text-sm text-[#1B2A41] block mt-0.5">Jadwal Sesi & Kuota Kritis</span>
              <span className="text-3xs text-[#5B6882] block mt-1">Notifikasi Sesi Baru & Sisa ≤ 2 Sesi</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTemplateEvent("certificateIssued")}
              className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                activeTemplateEvent === "certificateIssued"
                  ? "border-[#09408C] bg-[#EAF1FA] shadow-xs"
                  : "border-[#D5DDEB] bg-white hover:border-[#9AC1E2]"
              }`}
            >
              <span className="block text-2xs font-bold text-[#B45309] uppercase">Event 4</span>
              <span className="font-bold text-sm text-[#1B2A41] block mt-0.5">Rapor Evaluasi Belajar</span>
              <span className="text-3xs text-[#5B6882] block mt-1">Hasil Tryout/CAT & Perkembangan</span>
            </button>
          </div>

          {/* Event Toggles & Tag Pills */}
          <div className="bg-white elevation-1 rounded-2xl p-6 border border-gray-100 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b gap-4" style={{ borderColor: "var(--color-outline-variant)" }}>
              <div>
                <h3 className="font-bold text-title-md text-gray-900">
                  Kustomisasi Template Event: <span className="text-blue-900">{activeTemplateEvent}</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Klik pada tag variabel di bawah untuk menyisipkannya langsung ke template pesan
                </p>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-4 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={
                      activeTemplateEvent === "invoiceCreated"
                        ? settings.waEnabled_invoiceCreated
                        : activeTemplateEvent === "paymentVerified"
                        ? settings.waEnabled_paymentVerified
                        : activeTemplateEvent === "submissionReviewed"
                        ? settings.waEnabled_submissionReviewed
                        : settings.waEnabled_certificateIssued
                    }
                    onChange={(e) => {
                      const k = `waEnabled_${activeTemplateEvent}` as keyof NotificationSettingsData;
                      setSettings({ ...settings, [k]: e.target.checked });
                    }}
                    className="w-4 h-4 rounded text-blue-900"
                  />
                  <span>Kirim WhatsApp</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={
                      activeTemplateEvent === "invoiceCreated"
                        ? settings.emailEnabled_invoiceCreated
                        : activeTemplateEvent === "paymentVerified"
                        ? settings.emailEnabled_paymentVerified
                        : activeTemplateEvent === "submissionReviewed"
                        ? settings.emailEnabled_submissionReviewed
                        : settings.emailEnabled_certificateIssued
                    }
                    onChange={(e) => {
                      const k = `emailEnabled_${activeTemplateEvent}` as keyof NotificationSettingsData;
                      setSettings({ ...settings, [k]: e.target.checked });
                    }}
                    className="w-4 h-4 rounded text-blue-900"
                  />
                  <span>Kirim Email</span>
                </label>
              </div>
            </div>

            {/* Clickable Variable Tags */}
            <div>
              <span className="text-xs font-bold text-gray-700 block mb-2">Variabel Dinamis yang Tersedia:</span>
              <div className="flex flex-wrap gap-2">
                {getAvailableVariables().map((v) => (
                  <button
                    key={v.tag}
                    type="button"
                    onClick={() => insertVariable(v.tag, "wa")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-950 text-xs font-mono font-semibold border border-blue-200 transition-colors shadow-2xs cursor-pointer"
                    title={`Klik untuk menyisipkan ${v.tag}`}
                  >
                    <span>{v.tag}</span>
                    <span className="text-3xs text-blue-600 font-sans">({v.label})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Template Editors */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              {/* WhatsApp Message Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <MessageSquare size={14} className="text-emerald-600" />
                    Format Pesan WhatsApp
                  </label>
                  <span className="text-3xs text-gray-500">Mendukung format *bold*, _italic_, link</span>
                </div>
                <textarea
                  rows={14}
                  value={
                    activeTemplateEvent === "invoiceCreated"
                      ? settings.template_wa_invoiceCreated
                      : activeTemplateEvent === "paymentVerified"
                      ? settings.template_wa_paymentVerified
                      : activeTemplateEvent === "submissionReviewed"
                      ? settings.template_wa_submissionReviewed
                      : settings.template_wa_certificateIssued
                  }
                  onChange={(e) => {
                    const k = `template_wa_${activeTemplateEvent}` as keyof NotificationSettingsData;
                    setSettings({ ...settings, [k]: e.target.value });
                  }}
                  className="w-full p-4 rounded-xl border text-xs font-mono focus-ring bg-gray-50 focus:bg-white resize-y"
                  style={{ borderColor: "var(--color-outline-variant)" }}
                />
              </div>

              {/* Email HTML Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <Mail size={14} className="text-blue-900" />
                    Format Isi Email (HTML)
                  </label>
                  <span className="text-3xs text-gray-500">Mendukung tag HTML & inline styling</span>
                </div>
                <textarea
                  rows={14}
                  value={
                    activeTemplateEvent === "invoiceCreated"
                      ? settings.template_email_invoiceCreated
                      : activeTemplateEvent === "paymentVerified"
                      ? settings.template_email_paymentVerified
                      : activeTemplateEvent === "submissionReviewed"
                      ? settings.template_email_submissionReviewed
                      : settings.template_email_certificateIssued
                  }
                  onChange={(e) => {
                    const k = `template_email_${activeTemplateEvent}` as keyof NotificationSettingsData;
                    setSettings({ ...settings, [k]: e.target.value });
                  }}
                  className="w-full p-4 rounded-xl border text-xs font-mono focus-ring bg-gray-50 focus:bg-white resize-y"
                  style={{ borderColor: "var(--color-outline-variant)" }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 4: AUDIT LOGS & RIWAYAT NOTIFIKASI
      ========================================== */}
      {activeTab === "logs" && (
        <div className="bg-white elevation-1 rounded-2xl p-6 border border-gray-100 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: "var(--color-outline-variant)" }}>
            <div>
              <h2 className="text-title-md font-bold text-gray-900 flex items-center gap-2">
                <History size={20} className="text-blue-900" />
                Riwayat Pengiriman Notifikasi
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Monitoring audit trail seluruh pengiriman pesan WhatsApp dan Email transaksional
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={refreshLogs}
                className="px-3.5 py-2 rounded-xl border text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 transition-colors cursor-pointer"
                style={{ borderColor: "var(--color-outline-variant)" }}
              >
                <RefreshCw size={14} className={isPending ? "animate-spin" : ""} />
                <span>Segarkan</span>
              </button>

              <button
                type="button"
                onClick={handleClearLogs}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 size={14} />
                <span>Bersihkan Log</span>
              </button>
            </div>
          </div>

          {/* Table of Logs */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F7FB] border-b border-[#D5DDEB] text-[#5B6882] font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Penerima</th>
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D5DDEB]">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-[#5B6882]">
                      <History size={32} className="mx-auto text-[#9AC1E2] mb-2" />
                      <p className="font-semibold text-xs text-[#1B2A41]">Belum ada riwayat pengiriman notifikasi</p>
                      <p className="text-[11px] text-[#5B6882] mt-0.5">Notifikasi otomatis akan tercatat saat pendaftaran atau pengujian dikirim.</p>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#EAF1FA]/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[#5B6882] text-[11px] whitespace-nowrap">
                        {new Date(log.sentAt).toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          log.channel === "WHATSAPP"
                            ? "bg-[#E3F4EC] text-[#1F6F4A]"
                            : "bg-[#EAF1FA] text-[#09408C]"
                        }`}>
                          {log.channel === "WHATSAPP" ? <MessageSquare size={11} /> : <Mail size={11} />}
                          {log.channel}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#1B2A41] truncate max-w-[200px]">
                          {log.recipientName || "Pengguna"}
                        </div>
                        <div className="font-mono text-[11px] text-[#5B6882] truncate max-w-[200px]">
                          {log.recipient}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] font-bold text-[#09408C]">
                        {log.event}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          log.status === "SENT"
                            ? "bg-[#E3F4EC] text-[#1F6F4A]"
                            : log.status === "SIMULATED"
                            ? "bg-[#FEF5E7] text-[#B87A14]"
                            : "bg-[#FBE9E5] text-[#B4381F]"
                        }`}>
                          {log.status === "SENT" && <Check size={10} />}
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {log.channel === "WHATSAPP" && (
                            <a
                              href={`https://wa.me/${log.recipient}?text=${encodeURIComponent(log.message)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#E3F4EC] hover:bg-[#c8ead9] text-[#1F6F4A] font-bold text-xs transition-colors"
                              title="Buka pesan ini di WhatsApp Web / Aplikasi"
                            >
                              <ExternalLink size={12} />
                              <span>Buka WA</span>
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedLog(log)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#EAF1FA] hover:bg-[#D5DDEB] text-[#09408C] font-bold text-xs transition-colors cursor-pointer"
                          >
                            <Eye size={12} />
                            <span>Lihat Pesan</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in font-[var(--font-body)]">
          <div className="elevation-2 rounded-2xl bg-white w-full max-w-2xl overflow-hidden border shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${selectedLog.channel === "WHATSAPP" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"}`}>
                  {selectedLog.channel === "WHATSAPP" ? <MessageSquare size={16} /> : <Mail size={16} />}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">
                    Detail Log Notifikasi - {selectedLog.event}
                  </h4>
                  <span className="text-3xs text-gray-500">{new Date(selectedLog.sentAt).toLocaleString("id-ID")}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-gray-200">
                <div>
                  <span className="text-3xs text-gray-500 uppercase font-bold block">Penerima:</span>
                  <span className="font-bold text-gray-800">{selectedLog.recipientName || "-"}</span>
                  <span className="font-mono text-3xs text-gray-600 block">{selectedLog.recipient}</span>
                </div>
                <div>
                  <span className="text-3xs text-gray-500 uppercase font-bold block">Status & Channel:</span>
                  <span className="font-bold text-gray-800">{selectedLog.channel} ({selectedLog.status})</span>
                  {selectedLog.errorMessage && (
                    <span className="text-3xs text-red-600 font-semibold block">{selectedLog.errorMessage}</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-3xs text-gray-500 uppercase font-bold block mb-1.5">Isi Pesan:</span>
                {selectedLog.channel === "EMAIL" ? (
                  <div
                    className="p-4 rounded-xl border bg-white prose prose-xs max-w-none text-xs"
                    dangerouslySetInnerHTML={{ __html: selectedLog.message }}
                  />
                ) : (
                  <pre className="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs whitespace-pre-wrap leading-relaxed overflow-x-auto">
                    {selectedLog.message}
                  </pre>
                )}
              </div>
            </div>

            <div className="p-3.5 border-t bg-gray-50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 rounded-lg border text-xs font-bold text-gray-700 hover:bg-gray-100"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
