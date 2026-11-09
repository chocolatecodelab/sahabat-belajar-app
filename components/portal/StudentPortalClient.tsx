"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Calendar,
  Clock,
  BookOpen,
  Video,
  MapPin,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  LogOut,
  ExternalLink,
  Sparkles,
  ChevronRight,
  User,
  Award,
  Play,
  RotateCcw,
  FileText,
  ArrowRight,
  Share2,
  FileEdit,
  Download,
  Search,
  Filter,
} from "lucide-react";
import { signOut } from "next-auth/react";
import type { StudentPortalData } from "@/actions/portal";
import type { ExamItem, StudentExamSession } from "@/actions/ujian";
import type { LearningMaterial, ProgramCategory } from "@/actions/materi";
import { formatDayDate, formatTime } from "@/lib/date";
import ScoreProgressChart from "@/components/portal/ScoreProgressChart";

export default function StudentPortalClient({
  initialData,
  availableExams = [],
  examHistory = [],
  materials = [],
}: {
  initialData: StudentPortalData | null;
  availableExams?: ExamItem[];
  examHistory?: StudentExamSession[];
  materials?: LearningMaterial[];
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "ujian" | "materi">("overview");
  const [selectedMaterialCategory, setSelectedMaterialCategory] = useState<ProgramCategory>("ALL");
  const [materialSearch, setMaterialSearch] = useState("");
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);

  if (!initialData) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#D5DDEB] max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold font-heading text-[#1B2A41] mb-2">
            Data Belum Ditemukan
          </h2>
          <p className="text-sm text-[#5B6882] mb-6">
            Akun Anda belum ditautkan dengan data siswa aktif. Silakan hubungi
            admin Sahabat Belajar untuk verifikasi pendaftaran.
          </p>
          <div className="flex flex-col gap-2">
            <a
              href="https://wa.me/628123456789?text=Halo%20Admin%20Sahabat%20Belajar,%20saya%20ingin%20menanyakan%20status%20akun%20siswa"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#09408C] text-white font-medium text-sm hover:bg-[#0E3571] transition-colors"
            >
              Hubungi Admin via WhatsApp
            </a>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="px-4 py-2 text-sm text-[#5B6882] hover:text-[#1B2A41]"
            >
              Keluar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { student, packages, upcomingSessions, pastSessions } = initialData;

  // WhatsApp Reminder Generator
  const generateWaReminderUrl = (session: typeof upcomingSessions[0]) => {
    const dateStr = formatDayDate(session.startAt);
    const timeStr = `${formatTime(session.startAt)} - ${formatTime(session.endAt)} WIB`;
    const locationInfo =
      session.mode === "ONLINE"
        ? session.meetingLink
          ? `Tautan Belajar (Zoom/Meet): ${session.meetingLink}`
          : "Tautan Zoom/Meet akan diaktifkan sebelum sesi."
        : `Lokasi Belajar: ${session.address || "Rumah Siswa"}`;

    const text =
      `Halo! 📚 Pengingat Sesi Bimbingan Sahabat Belajar:\n\n` +
      `• Siswa: ${student.name}\n` +
      `• Program: ${session.programName}\n` +
      `• Tutor: ${session.tutorName}\n` +
      `• Hari & Tanggal: ${dateStr}\n` +
      `• Waktu: ${timeStr} (Durasi 90 Menit)\n` +
      `• Metode: ${session.mode === "ONLINE" ? "Online (Zoom / Meet)" : "Home Visit (Tatap Muka)"}\n` +
      `• ${locationInfo}\n\n` +
      `Mohon hadir 5 menit sebelum sesi dimulai. Semangat belajarnya! ✨ #BersamaSahabat`;

    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  // Filtered Materials
  const filteredMaterials = materials.filter((m) => {
    const matchesCategory =
      selectedMaterialCategory === "ALL" || m.programCategory === selectedMaterialCategory;
    const matchesSearch =
      m.title.toLowerCase().includes(materialSearch.toLowerCase()) ||
      m.subject.toLowerCase().includes(materialSearch.toLowerCase()) ||
      m.authorTutor.toLowerCase().includes(materialSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSimulateDownload = (fileName: string) => {
    setDownloadSuccessToast(fileName);
    setTimeout(() => {
      setDownloadSuccessToast(null);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-[#1B2A41] font-sans pb-16">
      {/* Toast Notification */}
      {downloadSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#09408C] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 size={20} className="text-[#9AC1E2]" />
          <div className="text-xs">
            <span className="font-bold block">Modul Berhasil Diunduh!</span>
            <span className="opacity-90">{downloadSuccessToast}</span>
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="bg-white border-b border-[#D5DDEB] sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#09408C] flex items-center justify-center text-white font-heading font-bold text-lg shadow-sm">
              SB
            </div>
            <div>
              <span className="font-heading font-bold text-base text-[#09408C] block leading-tight">
                Sahabat Belajar
              </span>
              <span className="text-[11px] text-[#5B6882] font-medium block">
                Portal Siswa & Orang Tua
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-[#EAF1FA] text-[#09408C] px-3 py-1.5 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#1F6F4A] animate-pulse"></span>
              #BersamaSahabat
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="inline-flex items-center gap-1.5 text-xs text-[#5B6882] hover:text-[#B4381F] px-3 py-1.5 rounded-lg border border-[#D5DDEB] hover:border-red-200 hover:bg-red-50 transition-colors"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        {/* Student Welcome Banner */}
        <div className="bg-gradient-to-r from-[#09408C] via-[#0E3571] to-[#295897] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-white/20 text-white px-2.5 py-0.5 rounded-full font-medium">
                  {student.level || "Siswa Terdaftar"}
                </span>
                <span className="text-xs text-white/80">
                  {student.school || "Sahabat Belajar"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white">
                Selamat Datang, {student.name}
              </h1>
              <p className="text-xs sm:text-sm text-white/80">
                Wali / Orang Tua:{" "}
                <strong className="text-white">
                  {student.parentName || "Orang Tua Siswa"}
                </strong>
                {student.parentPhone && ` (${student.parentPhone})`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-xl p-3 text-center min-w-[100px]">
                <div className="text-[11px] text-white/80">Total Sesi Diikuti</div>
                <div className="text-2xl font-bold font-heading text-white">
                  {pastSessions.length}
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-xl p-3 text-center min-w-[100px]">
                <div className="text-[11px] text-white/80">Paket Aktif</div>
                <div className="text-2xl font-bold font-heading text-white">
                  {packages.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Academic Program Highlights (S2, Beasiswa, Bank Modul) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-[#D5DDEB] p-5 flex items-center justify-between gap-4 hover:border-[#09408C] transition-all shadow-xs">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#EAF1FA] text-[#09408C] flex items-center justify-center shrink-0">
                <FileEdit size={22} />
              </div>
              <div>
                <div className="text-[10px] font-bold text-[#09408C] uppercase tracking-wider">
                  Program S2 / S3 & Beasiswa
                </div>
                <h4 className="font-heading font-bold text-sm text-[#1B2A41]">
                  Review Draf Esai & Naskah Akademik
                </h4>
                <p className="text-xs text-[#5B6882] mt-0.5">
                  Konsultasikan draf esai LPDP/AAS & skripsi dengan mentor.
                </p>
              </div>
            </div>
            <Link
              href="/portal/dokumen"
              className="shrink-0 px-3.5 py-2 rounded-xl bg-[#09408C] hover:bg-[#0E3571] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <span>Buka Draf</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-[#D5DDEB] p-5 flex items-center justify-between gap-4 hover:border-[#1F6F4A] transition-all shadow-xs">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#E3F4EC] text-[#1F6F4A] flex items-center justify-center shrink-0">
                <BookOpen size={22} />
              </div>
              <div>
                <div className="text-[10px] font-bold text-[#1F6F4A] uppercase tracking-wider">
                  Repositori Materi Digital
                </div>
                <h4 className="font-heading font-bold text-sm text-[#1B2A41]">
                  Bank Modul & Ringkasan Rumus
                </h4>
                <p className="text-xs text-[#5B6882] mt-0.5">
                  Akses e-book rumus cepat TIU, TWK, TOEFL, dan materi K-12.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab("materi")}
              className="shrink-0 px-3.5 py-2 rounded-xl bg-[#1F6F4A] hover:bg-[#155337] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <span>Buka Bank Modul</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Paket & Sisa Kuota (BR-1, BR-4, BR-5) */}
        <div>
          <h2 className="text-lg font-heading font-bold text-[#1B2A41] mb-3 flex items-center gap-2">
            <BookOpen size={18} className="text-[#09408C]" />
            Paket Belajar & Sisa Pertemuan
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map((pkg) => {
              const percent = pkg.quotaTotal > 0 ? Math.round((pkg.quotaUsed / pkg.quotaTotal) * 100) : 0;
              const isLow = pkg.quotaRemaining <= 2 && pkg.quotaRemaining > 0;
              const isExhausted = pkg.quotaRemaining === 0;

              return (
                <div
                  key={pkg.id}
                  className="bg-white rounded-2xl border border-[#D5DDEB] p-5 shadow-xs hover:border-[#9AC1E2] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#EAF1FA] text-[#09408C]">
                        {pkg.programName}
                      </span>
                      {isLow && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 animate-pulse">
                          Sisa ≤ 2 Sesi
                        </span>
                      )}
                      {isExhausted && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                          Kuota Habis
                        </span>
                      )}
                    </div>
                    <h3 className="font-heading font-bold text-base text-[#1B2A41] mb-1">
                      {pkg.packageName}
                    </h3>
                    <p className="text-xs text-[#5B6882] mb-4">
                      Durasi bimbingan: 90 Menit per sesi
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 mb-3">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-[#5B6882]">
                          Terlaksana: <strong className="text-[#1B2A41]">{pkg.quotaUsed}</strong>
                        </span>
                        <span className="text-[#09408C] font-bold">
                          Sisa: {pkg.quotaRemaining} Sesi
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-[#EAF1FA] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isExhausted
                              ? "bg-red-500"
                              : isLow
                              ? "bg-amber-500"
                              : "bg-[#09408C]"
                          }`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      <div className="text-[11px] text-right text-[#5B6882]">
                        Total Kuota: {pkg.quotaTotal} Pertemuan
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#D5DDEB] flex items-center justify-between text-xs">
                    <span className="text-[#5B6882]">
                      Status: <strong className="text-[#1B2A41]">{pkg.status}</strong>
                    </span>
                    <a
                      href="https://wa.me/628123456789?text=Halo%20Admin%20Sahabat%20Belajar,%20saya%20ingin%20top%20up%20kuota%20bimbel"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#09408C] font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      Perpanjang <ChevronRight size={14} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[#D5DDEB] pt-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 px-3.5 text-sm font-heading font-semibold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === "overview"
                ? "border-[#09408C] text-[#09408C]"
                : "border-transparent text-[#5B6882] hover:text-[#1B2A41]"
            }`}
          >
            <Calendar size={16} />
            Jadwal Sesi Mendatang ({upcomingSessions.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-3 px-3.5 text-sm font-heading font-semibold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === "history"
                ? "border-[#09408C] text-[#09408C]"
                : "border-transparent text-[#5B6882] hover:text-[#1B2A41]"
            }`}
          >
            <CheckCircle2 size={16} />
            Riwayat Sesi & Catatan Guru ({pastSessions.length})
          </button>
          <button
            onClick={() => setActiveTab("ujian")}
            className={`pb-3 px-3.5 text-sm font-heading font-semibold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === "ujian"
                ? "border-[#09408C] text-[#09408C]"
                : "border-transparent text-[#5B6882] hover:text-[#1B2A41]"
            }`}
          >
            <Award size={16} />
            Ruang Ujian & CAT ({availableExams.length})
          </button>
          <button
            onClick={() => setActiveTab("materi")}
            className={`pb-3 px-3.5 text-sm font-heading font-semibold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === "materi"
                ? "border-[#09408C] text-[#09408C]"
                : "border-transparent text-[#5B6882] hover:text-[#1B2A41]"
            }`}
          >
            <BookOpen size={16} />
            Bank Modul & Materi ({materials.length})
          </button>
        </div>

        {/* Tab 1: Jadwal Sesi Mendatang */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            {upcomingSessions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#D5DDEB] p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-[#EAF1FA] text-[#09408C] flex items-center justify-center mx-auto mb-3">
                  <Calendar size={24} />
                </div>
                <h3 className="font-heading font-bold text-[#1B2A41] mb-1">
                  Belum Ada Jadwal Sesi Baru
                </h3>
                <p className="text-sm text-[#5B6882] max-w-md mx-auto mb-4">
                  Admin dan tutor sedang menyusun jadwal belajar terbaik untuk Anda.
                  Hubungi kami jika ada preferensi hari dan jam tertentu.
                </p>
                <a
                  href="https://wa.me/628123456789?text=Halo%20Admin%20Sahabat%20Belajar,%20saya%20ingin%20request%20jadwal%20bimbingan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571] transition-colors"
                >
                  Ajukan Permohonan Jadwal
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingSessions.map((session) => {
                  const formattedDate = formatDayDate(session.startAt);
                  const formattedTime = `${formatTime(session.startAt)} - ${formatTime(session.endAt)} WIB`;

                  return (
                    <div
                      key={session.id}
                      className="bg-white rounded-2xl border border-[#D5DDEB] p-5 shadow-xs hover:border-[#9AC1E2] transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#09408C] bg-[#EAF1FA] px-2.5 py-1 rounded-full">
                          {session.programName}
                        </span>
                        <span className="text-xs font-semibold text-[#5B6882] flex items-center gap-1">
                          <Clock size={13} /> 90 Menit
                        </span>
                      </div>

                      <div>
                        <h4 className="font-heading font-bold text-base text-[#1B2A41]">
                          {formattedDate}
                        </h4>
                        <p className="text-sm font-semibold text-[#09408C]">{formattedTime}</p>
                      </div>

                      <div className="bg-[#F4F7FB] rounded-xl p-3 text-xs space-y-1.5">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-[#5B6882]" />
                          <span className="text-[#5B6882]">Tutor:</span>
                          <strong className="text-[#1B2A41]">{session.tutorName}</strong>
                        </div>
                        <div className="flex items-center gap-2">
                          {session.mode === "ONLINE" ? (
                            <Video size={14} className="text-blue-600" />
                          ) : (
                            <MapPin size={14} className="text-emerald-600" />
                          )}
                          <span className="text-[#5B6882]">Metode:</span>
                          <strong className="text-[#1B2A41]">
                            {session.mode === "ONLINE" ? "Online (Zoom / Meet)" : "Home Visit (Tatap Muka)"}
                          </strong>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2 pt-1">
                        {session.mode === "ONLINE" ? (
                          session.meetingLink ? (
                            <a
                              href={session.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#09408C] text-white font-medium text-xs hover:bg-[#0E3571] transition-colors shadow-xs"
                            >
                              <Video size={14} /> Masuk Ruang Belajar (Zoom/Meet) <ExternalLink size={12} />
                            </a>
                          ) : (
                            <div className="text-center py-2 text-xs text-[#5B6882] bg-slate-50 rounded-xl border border-dashed border-[#D5DDEB]">
                              Tautan ruang belajar akan diaktifkan sebelum sesi dimulai
                            </div>
                          )
                        ) : (
                          <div className="text-xs text-[#5B6882] bg-slate-50 p-2.5 rounded-xl border border-[#D5DDEB] flex items-start gap-2">
                            <MapPin size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                            <div>
                              <span className="font-semibold text-[#1B2A41] block">Lokasi Belajar:</span>
                              {session.address || "Alamat rumah siswa"}
                            </div>
                          </div>
                        )}

                        {/* 1-Click WhatsApp Reminder Button */}
                        <a
                          href={generateWaReminderUrl(session)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#EAF1FA] text-[#09408C] hover:bg-[#9AC1E2]/30 font-semibold text-xs border border-[#9AC1E2]/50 transition-colors"
                          title="Bagikan detail dan pengingat sesi bimbingan ke WhatsApp siswa / wali"
                        >
                          <Share2 size={13} />
                          <span>Kirim Pengingat Jadwal ke WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Riwayat Pertemuan & Evaluasi Tutor */}
        {activeTab === "history" && (
          <div className="space-y-4">
            {pastSessions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#D5DDEB] p-8 text-center text-[#5B6882]">
                <CheckCircle2 size={32} className="mx-auto mb-2 text-[#9AC1E2]" />
                <h3 className="font-heading font-bold text-[#1B2A41] mb-1">
                  Belum Ada Riwayat Sesi
                </h3>
                <p className="text-sm">
                  Setelah sesi belajar pertama terlaksana, ringkasan materi, catatan pemahaman,
                  dan tugas dari tutor akan otomatis tercatat di sini.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pastSessions.map((session) => {
                  const dateStr = formatDayDate(session.startAt);
                  const timeStr = `${formatTime(session.startAt)} - ${formatTime(session.endAt)} WIB`;

                  return (
                    <div
                      key={session.id}
                      className="bg-white rounded-2xl border border-[#D5DDEB] p-5 shadow-xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D5DDEB] pb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#1F6F4A]"></span>
                          <span className="font-heading font-bold text-sm text-[#1B2A41]">
                            {dateStr}
                          </span>
                          <span className="text-xs text-[#5B6882]">({timeStr})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-[#EAF1FA] text-[#09408C] font-semibold px-2.5 py-0.5 rounded-full">
                            {session.programName}
                          </span>
                          <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">
                            {session.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div>
                          <span className="text-[#5B6882] block mb-0.5">Tutor Pengajar:</span>
                          <strong className="text-[#1B2A41] text-sm">{session.tutorName}</strong>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-[#5B6882] block mb-0.5">Materi yang Dipelajari:</span>
                          <p className="text-[#1B2A41] font-medium">
                            {session.topic || "Ringkasan konsep dan pendalaman soal evaluasi."}
                          </p>
                        </div>
                      </div>

                      {session.notes && (
                        <div className="bg-[#F4F7FB] p-3 rounded-xl border border-[#D5DDEB] text-xs space-y-1">
                          <div className="flex items-center gap-1.5 font-semibold text-[#09408C]">
                            <Sparkles size={14} />
                            Catatan & Rekomendasi Tutor:
                          </div>
                          <p className="text-[#5B6882] pl-5 leading-relaxed">{session.notes}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Ruang Ujian Online & Rapor Digital */}
        {activeTab === "ujian" && (
          <div className="space-y-6">
            {/* Header Ruang Ujian */}
            <div className="bg-white rounded-3xl border border-[#D5DDEB] p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF1FA] text-[#09408C] text-xs font-bold border border-[#9AC1E2] mb-2">
                  <Sparkles size={14} />
                  <span>Simulasi CAT Berstandar Resmi</span>
                </div>
                <h3 className="text-xl font-bold text-[#09408C] font-heading">
                  Pilih Paket Ujian & Simulasi CAT
                </h3>
                <p className="text-xs sm:text-sm text-[#5B6882] mt-0.5">
                  Latih kecepatan, akurasi penalaran, dan pemahaman konsep dasar dengan timer dan passing grade otomatis.
                </p>
              </div>
            </div>

            {/* Grid of Available Exams */}
            {availableExams.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#D5DDEB] p-8 text-center text-[#5B6882]">
                <Award size={32} className="mx-auto mb-2 text-[#9AC1E2]" />
                <h3 className="font-heading font-bold text-[#1B2A41] mb-1">
                  Belum Ada Paket Ujian Aktif
                </h3>
                <p className="text-sm">
                  Paket ujian tryout akan dijadwalkan oleh admin dan tutor Sahabat Belajar.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {availableExams.map((exam) => (
                  <div
                    key={exam.id}
                    className="bg-white rounded-3xl border border-[#D5DDEB] p-6 shadow-xs hover:border-[#09408C] hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-2.5 py-1 rounded-full bg-[#EAF1FA] text-[#09408C] text-[11px] font-bold border border-[#9AC1E2]/60">
                          {exam.category.replace("_", " ")}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-[#1F6F4A] font-semibold bg-[#E3F4EC] px-2 py-0.5 rounded-full">
                          Tersedia
                        </span>
                      </div>

                      <h4 className="font-bold text-base text-[#1B2A41] font-heading leading-snug">
                        {exam.title}
                      </h4>
                      <p className="text-xs text-[#5B6882] mt-2 line-clamp-2 leading-relaxed">
                        {exam.description || "Simulasi tryout dengan sistem penilaian otomatis."}
                      </p>

                      <div className="mt-4 pt-4 border-t border-[#D5DDEB] grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-[#F4F7FB] p-2 rounded-xl">
                          <div className="text-[10px] text-[#5B6882]">Waktu</div>
                          <div className="font-bold text-[#09408C] mt-0.5 flex items-center justify-center gap-1">
                            <Clock size={12} />
                            <span>{exam.durationMinutes}m</span>
                          </div>
                        </div>

                        <div className="bg-[#F4F7FB] p-2 rounded-xl">
                          <div className="text-[10px] text-[#5B6882]">Passing Grade</div>
                          <div className="font-bold text-[#1F6F4A] mt-0.5">
                            {exam.passingGrade}
                          </div>
                        </div>

                        <div className="bg-[#F4F7FB] p-2 rounded-xl">
                          <div className="text-[10px] text-[#5B6882]">Soal</div>
                          <div className="font-bold text-[#1B2A41] mt-0.5">
                            {exam.totalQuestions} Butir
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-[#D5DDEB]">
                      <Link
                        href={`/portal/ujian/${exam.id}`}
                        className="w-full py-2.5 rounded-xl bg-[#09408C] text-white text-xs font-bold hover:bg-[#0E3571] transition-colors flex items-center justify-center gap-2 shadow-xs"
                      >
                        <Play size={14} className="fill-white" />
                        <span>Mulai Simulasi CAT</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Visual Score Progress & Trend Analysis Chart (Modul G2) */}
            {examHistory.length > 0 && <ScoreProgressChart sessions={examHistory} />}

            {/* Riwayat Nilai & Rapor Digital */}
            {examHistory.length > 0 && (
              <div className="bg-white rounded-3xl border border-[#D5DDEB] p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-bold text-[#09408C] font-heading">
                      Riwayat Tryout & Rapor Nilai Digital
                    </h4>
                    <p className="text-xs text-[#5B6882] mt-0.5">
                      Hasil evaluasi pengerjaan simulasi ujian sebelumnya beserta pembahasan soal.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {examHistory.map((sess) => (
                    <div
                      key={sess.id}
                      className="p-4 rounded-2xl bg-[#F4F7FB] border border-[#D5DDEB] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#9AC1E2] transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                              sess.isPassed
                                ? "bg-[#E3F4EC] text-[#1F6F4A] border-[#1F6F4A]/30"
                                : "bg-[#FBE9E5] text-[#B4381F] border-[#B4381F]/30"
                            }`}
                          >
                            {sess.isPassed ? "LULUS PASSING GRADE" : "BELUM LULUS"}
                          </span>
                          <span className="text-xs text-[#5B6882]">
                            {new Date(sess.submittedAt || sess.startedAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <h5 className="font-bold text-sm text-[#1B2A41]">
                          {sess.exam?.title || "Simulasi Ujian Digital"}
                        </h5>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <div className="text-[10px] text-[#5B6882]">Perolehan Skor</div>
                          <div className="text-xl font-extrabold text-[#09408C] font-heading">
                            {sess.score}
                          </div>
                        </div>

                        <Link
                          href={`/portal/ujian/${sess.examId}/hasil?sessionId=${sess.id}`}
                          className="px-3.5 py-2 rounded-xl bg-white border border-[#D5DDEB] text-xs font-semibold text-[#09408C] hover:bg-[#EAF1FA] transition-colors flex items-center gap-1.5 shadow-2xs"
                        >
                          <FileText size={14} />
                          <span>Lihat Pembahasan</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Bank Modul & Materi Belajar Digital (Tahap 3 Modul H2) */}
        {activeTab === "materi" && (
          <div className="space-y-6">
            {/* Header Modul */}
            <div className="bg-white rounded-3xl border border-[#D5DDEB] p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E3F4EC] text-[#1F6F4A] text-xs font-bold border border-[#1F6F4A]/30 mb-2">
                  <BookOpen size={14} />
                  <span>Modul Belajar & Pocket Book Eksklusif</span>
                </div>
                <h3 className="text-xl font-bold text-[#09408C] font-heading">
                  Bank Modul & Ringkasan Rumus Digital
                </h3>
                <p className="text-xs sm:text-sm text-[#5B6882] mt-0.5">
                  Unduh e-book, kisi-kisi, ringkasan rumus cepat, dan bank soal terkurasi untuk mendampingi bimbingan Anda.
                </p>
              </div>

              {/* Search Box */}
              <div className="w-full sm:w-72 relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B6882]" />
                <input
                  type="text"
                  placeholder="Cari modul atau materi..."
                  value={materialSearch}
                  onChange={(e) => setMaterialSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#D5DDEB] text-xs text-[#1B2A41] placeholder:text-[#5B6882]/70 focus:outline-none focus:border-[#09408C] bg-[#F4F7FB]"
                />
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {[
                { key: "ALL", label: "Semua Program" },
                { key: "CPNS_BUMN", label: "CPNS & BUMN" },
                { key: "UTBK_SNBT", label: "UTBK-SNBT" },
                { key: "TOEFL_IELTS", label: "TOEFL & IELTS" },
                { key: "S2_BEASISWA", label: "S2 & Beasiswa" },
                { key: "K12", label: "K-12 (SD/SMP/SMA)" },
              ].map((c) => (
                <button
                  key={c.key}
                  onClick={() => setSelectedMaterialCategory(c.key as ProgramCategory)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
                    selectedMaterialCategory === c.key
                      ? "bg-[#09408C] text-white border-[#09408C] shadow-2xs"
                      : "bg-white text-[#5B6882] border-[#D5DDEB] hover:border-[#9AC1E2] hover:text-[#1B2A41]"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Grid of Materials */}
            {filteredMaterials.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#D5DDEB] p-8 text-center text-[#5B6882]">
                <BookOpen size={32} className="mx-auto mb-2 text-[#9AC1E2]" />
                <h3 className="font-heading font-bold text-[#1B2A41] mb-1">
                  Modul Belum Ditemukan
                </h3>
                <p className="text-sm">
                  Tidak ada modul materi yang sesuai dengan kata kunci atau kategori yang Anda pilih.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredMaterials.map((mat) => (
                  <div
                    key={mat.id}
                    className="bg-white rounded-3xl border border-[#D5DDEB] p-6 shadow-xs hover:border-[#09408C] hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-2.5 py-1 rounded-full bg-[#EAF1FA] text-[#09408C] text-[11px] font-bold border border-[#9AC1E2]/60">
                          {mat.programCategory.replace("_", " ")}
                        </span>
                        <span className="text-[11px] text-[#5B6882] font-semibold bg-[#F4F7FB] px-2 py-0.5 rounded-full">
                          {mat.fileSize}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-[#295897] mb-1">
                        {mat.subject}
                      </div>

                      <h4 className="font-bold text-base text-[#1B2A41] font-heading leading-snug">
                        {mat.title}
                      </h4>

                      <p className="text-xs text-[#5B6882] mt-2 line-clamp-3 leading-relaxed">
                        {mat.description || "Modul dan rangkuman komprehensif dari tim akademik Sahabat Belajar."}
                      </p>

                      <div className="mt-4 pt-3 border-t border-[#D5DDEB] flex items-center justify-between text-xs text-[#5B6882]">
                        <span className="truncate max-w-[170px]" title={mat.authorTutor}>
                          Oleh: <strong className="text-[#1B2A41]">{mat.authorTutor}</strong>
                        </span>
                        <span>{mat.downloadCount}x diunduh</span>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-[#D5DDEB]">
                      <button
                        onClick={() => handleSimulateDownload(mat.fileName)}
                        className="w-full py-2.5 rounded-xl bg-[#09408C] text-white text-xs font-bold hover:bg-[#0E3571] transition-colors flex items-center justify-center gap-2 shadow-xs"
                      >
                        <Download size={14} />
                        <span>Unduh Modul ({mat.fileSize})</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer Support Banner */}
        <div className="bg-[#EAF1FA] border border-[#9AC1E2] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#09408C] text-white flex items-center justify-center shrink-0">
              <HelpCircle size={20} />
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-[#09408C]">
                Perlu Konsultasi atau Ubah Jadwal?
              </h4>
              <p className="text-xs text-[#5B6882]">
                Admin Sahabat Belajar siap membantu kebutuhan bimbingan belajar Anda.
              </p>
            </div>
          </div>
          <a
            href="https://wa.me/628123456789?text=Halo%20Admin%20Sahabat%20Belajar,%20saya%20ingin%20konsultasi%20mengenai%20jadwal%20dan%20perkembangan%20belajar"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#09408C] hover:bg-[#0E3571] text-white text-xs font-semibold rounded-xl transition-colors shrink-0 shadow-xs"
          >
            Hubungi Admin WhatsApp
          </a>
        </div>
      </main>
    </div>
  );
}
