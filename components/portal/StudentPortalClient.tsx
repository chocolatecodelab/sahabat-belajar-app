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
} from "lucide-react";
import { signOut } from "next-auth/react";
import type { StudentPortalData } from "@/actions/portal";

export default function StudentPortalClient({
  initialData,
}: {
  initialData: StudentPortalData | null;
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "history">("overview");

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

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-[#1B2A41] font-sans pb-16">
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
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-heading font-bold text-2xl shadow-inner">
                {student.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl sm:text-2xl font-heading font-bold text-white">
                    {student.name}
                  </h1>
                  <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                    {student.status}
                  </span>
                </div>
                <p className="text-sm text-white/80">
                  {student.level} {student.school ? `• ${student.school}` : ""}
                </p>
                {student.parentName && (
                  <p className="text-xs text-white/60 mt-0.5">
                    Orang Tua / Wali: {student.parentName}
                  </p>
                )}
              </div>
            </div>

            <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
              <span className="text-xs text-white/70 block">Total Paket Aktif</span>
              <span className="text-2xl font-bold font-heading text-white">
                {packages.length} Paket
              </span>
            </div>
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

        {/* Tab Navigation: Jadwal Mendatang vs Riwayat Pertemuan */}
        <div className="flex items-center gap-2 border-b border-[#D5DDEB] pt-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 px-3 text-sm font-heading font-semibold transition-colors border-b-2 flex items-center gap-2 ${
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
            className={`pb-3 px-3 text-sm font-heading font-semibold transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "history"
                ? "border-[#09408C] text-[#09408C]"
                : "border-transparent text-[#5B6882] hover:text-[#1B2A41]"
            }`}
          >
            <CheckCircle2 size={16} />
            Riwayat Sesi & Catatan Guru ({pastSessions.length})
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
                  const startDate = new Date(session.startAt);
                  const endDate = new Date(session.endAt);
                  const formattedDate = startDate.toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  });
                  const formattedTime = `${startDate.toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })} - ${endDate.toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })} WIB`;

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

                      {/* Action Button */}
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
                  const dateStr = new Date(session.startAt).toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  });

                  return (
                    <div
                      key={session.id}
                      className="bg-white rounded-2xl border border-[#D5DDEB] p-5 shadow-xs space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D5DDEB] pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-heading font-bold text-base text-[#1B2A41]">
                              {session.programName}
                            </h4>
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                session.attendance === "HADIR"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : session.attendance === "IZIN"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {session.attendance}
                            </span>
                          </div>
                          <p className="text-xs text-[#5B6882]">{dateStr} • Tutor: {session.tutorName}</p>
                        </div>

                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-[#5B6882]">
                          Status: {session.status}
                        </span>
                      </div>

                      {/* Jurnal Pertemuan */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div className="bg-[#F4F7FB] p-3 rounded-xl">
                          <span className="font-bold text-[#09408C] block mb-1">Topik Bahasan</span>
                          <p className="text-[#1B2A41]">
                            {session.topic || "Materi inti bimbingan"}
                          </p>
                        </div>
                        <div className="bg-[#F4F7FB] p-3 rounded-xl">
                          <span className="font-bold text-[#09408C] block mb-1">Catatan Perkembangan Siswa</span>
                          <p className="text-[#1B2A41]">
                            {session.notes || "Siswa mengikuti bimbingan dengan fokus dan memahami materi dengan baik."}
                          </p>
                        </div>
                        <div className="bg-[#F4F7FB] p-3 rounded-xl">
                          <span className="font-bold text-[#09408C] block mb-1">Tugas / Latihan Mandiri</span>
                          <p className="text-[#1B2A41]">
                            {session.homework || "Tidak ada tugas tambahan."}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
