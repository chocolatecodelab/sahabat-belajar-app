"use client";

import { useState } from "react";
import {
  GraduationCap,
  Calendar,
  Clock,
  BookOpen,
  CheckCircle2,
  XCircle,
  Video,
  Copy,
  ExternalLink,
  Phone,
  Building2,
  FileText,
  AlertCircle,
  Check,
} from "lucide-react";
import { confirmMentorshipByToken, type MentorshipBookingItem } from "@/actions/penjadwalan";

interface Props {
  booking: MentorshipBookingItem;
  initialAction?: string;
}

export default function TutorConfirmationClient({ booking, initialAction }: Props) {
  const [currentBooking, setCurrentBooking] = useState<MentorshipBookingItem>(booking);
  const [status, setStatus] = useState<MentorshipBookingItem["status"]>(booking.status);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showDeclineForm, setShowDeclineForm] = useState(initialAction === "DECLINE");
  const [declineReason, setDeclineReason] = useState("");
  const [copied, setCopied] = useState(false);

  const handleAction = async (action: "ACCEPT" | "DECLINE") => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await confirmMentorshipByToken(
        currentBooking.confirmationToken,
        action,
        action === "DECLINE" ? declineReason : undefined
      );

      if (res.success && res.data) {
        setCurrentBooking(res.data.booking);
        setStatus(res.data.booking.status);
        setMessage(res.message || null);
      } else {
        setMessage(res.message || "Gagal memproses konfirmasi bimbingan.");
      }
    } catch {
      setMessage("Terjadi gangguan koneksi saat menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#001847] text-white shadow-md mb-3">
          <GraduationCap className="w-8 h-8 text-[#fdbc13]" />
        </div>
        <h1 className="text-2xl font-bold text-[#001847] tracking-tight font-display">
          BIAS RISTEK
        </h1>
        <p className="text-xs uppercase font-semibold text-[#7a5900] tracking-widest mt-0.5">
          Academic Innovation & Research Mentorship
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="bg-[#001847] p-6 text-white">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#fdbc13] text-[#001847]">
              <GraduationCap className="w-3.5 h-3.5" />
              Penugasan Bimbingan Riset 1-on-1
            </span>
            <span className="text-xs text-white/70">
              Ref ID: {currentBooking.id.slice(0, 14)}
            </span>
          </div>

          <div className="mt-4">
            <h2 className="text-xl font-bold font-display text-white">
              {currentBooking.tutorName}
            </h2>
            <p className="text-sm text-white/80 mt-0.5">
              {currentBooking.tutorTitle} • {currentBooking.tutorInstitution}
            </p>
          </div>
        </div>

        {/* Status Notification Banner */}
        {status === "CONFIRMED" && (
          <div className="bg-emerald-50 border-b border-emerald-200 p-4 px-6 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-sm text-emerald-800">
              <p className="font-semibold">Bimbingan Telah Terkonfirmasi & Resmi Terkunci</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Ruang Zoom telah dibuat dan detail jadwal bimbingan telah dikirimkan ke WhatsApp mahasiswa.
              </p>
            </div>
          </div>
        )}

        {status === "DECLINED_BY_TUTOR" && (
          <div className="bg-amber-50 border-b border-amber-200 p-4 px-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold">Penugasan Berhalangan / Ditolak</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Koordinator akademik BIAS RISTEK telah menerima informasi ini dan akan mengalihkan mahasiswa ke kandidat mentor berikutnya.
              </p>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {message && (
            <div
              className={`p-4 rounded-xl text-sm ${
                status === "CONFIRMED"
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                  : "bg-blue-50 border border-blue-200 text-blue-800"
              }`}
            >
              {message}
            </div>
          )}

          {/* Student Profile & Research Summary */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#001847] mb-3 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#7a5900]" />
              Data Mahasiswa & Topik Bimbingan
            </h3>

            <div className="bg-[#f8f9ff] rounded-xl p-4 border border-[#d5e3fc] space-y-3">
              <div>
                <span className="text-xs text-slate-500 font-medium">Mahasiswa / Peneliti</span>
                <p className="text-base font-semibold text-[#001847]">
                  {currentBooking.studentName}
                </p>
              </div>

              <div>
                <span className="text-xs text-slate-500 font-medium">Topik / Rencana Penelitian</span>
                <p className="text-sm text-slate-800 font-medium mt-0.5 bg-white p-3 rounded-lg border border-[#e2e8f0]">
                  {currentBooking.researchTopic}
                </p>
              </div>

              {currentBooking.researchSoftware && (
                <div>
                  <span className="text-xs text-slate-500 font-medium">Software / Metodologi Diperlukan</span>
                  <div className="mt-1">
                    <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-[#001847] text-white">
                      {currentBooking.researchSoftware}
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-[#e2e8f0] flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#001847]" />
                  +{currentBooking.studentWhatsapp}
                </span>
                <a
                  href={`https://wa.me/${currentBooking.studentWhatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#001847] hover:underline font-semibold flex items-center gap-1"
                >
                  Buka Chat WhatsApp Mahasiswa <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Proposed Schedule Card */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#001847] mb-3 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#7a5900]" />
              Waktu Sesi Bimbingan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-[#e2e8f0] flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#f8f9ff] flex items-center justify-center text-[#001847]">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-500">Tanggal Sesi</span>
                  <p className="text-sm font-semibold text-[#001847]">{currentBooking.scheduledDate}</p>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-[#e2e8f0] flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#f8f9ff] flex items-center justify-center text-[#001847]">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-500">Waktu / Durasi</span>
                  <p className="text-sm font-semibold text-[#001847]">{currentBooking.timeSlot}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Confirmed Zoom Links */}
          {status === "CONFIRMED" && currentBooking.zoomJoinUrl && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-amber-50/40 border border-blue-200 space-y-3">
              <div className="flex items-center gap-2 text-blue-900 font-semibold text-sm">
                <Video className="w-4 h-4 text-blue-600" />
                Ruang Virtual Zoom Bimbingan Telah Dibuat
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-500 block">Tautan Join Siswa:</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <input
                      type="text"
                      readOnly
                      value={currentBooking.zoomJoinUrl}
                      className="w-full p-2 bg-white rounded border border-blue-200 font-mono text-xs text-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => copyToClipboard(currentBooking.zoomJoinUrl!)}
                      className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded border border-blue-200 font-semibold flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Disalin" : "Salin"}
                    </button>
                  </div>
                </div>

                {currentBooking.zoomHostUrl && (
                  <div>
                    <span className="text-slate-500 block">Tautan Host Anda (Tutor):</span>
                    <a
                      href={currentBooking.zoomHostUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 bg-[#001847] hover:bg-[#0b2c6b] text-white rounded-lg text-xs font-semibold transition"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Mulai Meeting Sebagai Host Zoom
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons for Pending State */}
          {status === "PENDING_TUTOR_CONFIRMATION" && (
            <div className="pt-4 border-t border-[#e2e8f0] space-y-3">
              {!showDeclineForm ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleAction("ACCEPT")}
                    className="flex-1 py-3 px-5 rounded-xl bg-[#001847] hover:bg-[#0b2c6b] text-white font-semibold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#fdbc13]" />
                    {loading ? "Memproses..." : "Terima & Konfirmasi Bimbingan"}
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setShowDeclineForm(true)}
                    className="py-3 px-5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4 text-rose-500" />
                    Berhalangan / Reschedule
                  </button>
                </div>
              ) : (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-semibold text-rose-900">
                    Mohon berikan alasan atau usulan jadwal pengganti agar koordinator dapat mengatur ulang:
                  </p>
                  <textarea
                    rows={3}
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    placeholder="Contoh: Sedang menguji sidang tesis pada jam tersebut, bisanya hari Minggu pukul 14:00..."
                    className="w-full p-2.5 bg-white border border-rose-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#001847]"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => setShowDeclineForm(false)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-700 font-medium hover:bg-white"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleAction("DECLINE")}
                      className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-xs text-white font-semibold flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      {loading ? "Menyimpan..." : "Kirim Penolakan"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="bg-[#f8f9ff] px-6 py-4 border-t border-[#e2e8f0] text-center text-xs text-slate-500">
          Sistem Otomasi Akademik BIAS RISTEK • Human in the Loop Protocol
        </div>
      </div>
    </div>
  );
}
