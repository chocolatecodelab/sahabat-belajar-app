"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Calendar,
  AlertCircle,
  Users,
  Video,
  Home,
  Clock,
  ArrowRight,
  Plus,
  MessageCircle,
  CheckCircle2,
  Phone,
  Sparkles,
} from "lucide-react";
import { formatTime, formatDate } from "@/lib/date";
import type { SahabatBelajarDashboardData } from "@/actions/dashboard";

export default function SahabatBelajarDashboard({
  data,
  userName = "Admin",
}: {
  data: SahabatBelajarDashboardData;
  userName?: string;
}) {
  const [selectedTab, setSelectedTab] = useState<"HARI_INI" | "MINGGU_INI" | "BULAN_INI">("HARI_INI");

  return (
    <div className="space-y-6">
      {/* Top Welcome Bar */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#D5DDEB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-[#09408C] uppercase tracking-wider bg-[#EAF1FA] px-2.5 py-0.5 rounded-full">
              Panel Operasional
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#09408C] tracking-tight font-display">
            Halo, {userName}!
          </h1>
          <p className="text-sm text-[#5B6882] mt-1">
            Ini ringkasan jadwal, kuota, dan pendaftaran siswa Sahabat Belajar hari ini.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/dashboard/jadwal"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#09408C] text-white hover:bg-[#0E3571] text-sm font-semibold transition-colors shadow-xs"
          >
            <Plus size={16} />
            <span>+ Jadwalkan Sesi</span>
          </Link>
          <Link
            href="/dashboard/lead"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D5DDEB] bg-white text-[#09408C] hover:bg-[#EAF1FA] text-sm font-semibold transition-colors"
          >
            <Users size={16} />
            <span>Lihat Lead ({data.newLeadsCount})</span>
          </Link>
        </div>
      </div>

      {/* 4 Stat Metric Cards (Design 5.3) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Siswa Aktif */}
        <div className="bg-white p-5 rounded-2xl border border-[#D5DDEB] shadow-xs hover:border-[#9AC1E2] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5B6882]">Siswa Aktif</span>
            <div className="w-10 h-10 rounded-full bg-[#EAF1FA] flex items-center justify-center text-[#09408C]">
              <GraduationCap size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#09408C] tabular-nums font-display">
              {data.activeStudentsCount}
            </span>
            <span className="text-xs text-[#5B6882]">orang</span>
          </div>
          <p className="text-xs text-[#5B6882] mt-2 flex items-center gap-1">
            <span className="text-[#1F6F4A] font-semibold">Aktif belajar</span> sesi privat & semi-privat
          </p>
        </div>

        {/* Sesi Hari Ini */}
        <div className="bg-white p-5 rounded-2xl border border-[#D5DDEB] shadow-xs hover:border-[#9AC1E2] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5B6882]">Sesi Hari Ini</span>
            <div className="w-10 h-10 rounded-full bg-[#EAF1FA] flex items-center justify-center text-[#295897]">
              <Calendar size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#09408C] tabular-nums font-display">
              {data.todaySessionsCount}
            </span>
            <span className="text-xs text-[#5B6882]">pertemuan (90 mnt)</span>
          </div>
          <p className="text-xs text-[#5B6882] mt-2 flex items-center gap-1">
            Online & Home visit terjadwal
          </p>
        </div>

        {/* Kuota Hampir Habis */}
        <div className="bg-white p-5 rounded-2xl border border-[#D5DDEB] shadow-xs hover:border-[#F5B82E] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5B6882]">Kuota Hampir Habis</span>
            <div className="w-10 h-10 rounded-full bg-[#FEF7E6] flex items-center justify-center text-[#B45309]">
              <AlertCircle size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#B45309] tabular-nums font-display">
              {data.lowQuotaCount}
            </span>
            <span className="text-xs text-[#5B6882]">paket (sisa $\le 2$)</span>
          </div>
          <p className="text-xs text-[#B45309] mt-2 font-medium">
            Perlu penawaran paket lanjutan
          </p>
        </div>

        {/* Lead Baru */}
        <div className="bg-white p-5 rounded-2xl border border-[#D5DDEB] shadow-xs hover:border-[#0CC0DF] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5B6882]">Prospek / Lead Baru</span>
            <div className="w-10 h-10 rounded-full bg-[#EAF1FA] flex items-center justify-center text-[#0CC0DF]">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#09408C] tabular-nums font-display">
              {data.newLeadsCount}
            </span>
            <span className="text-xs text-[#5B6882]">belum dihubungi</span>
          </div>
          <p className="text-xs text-[#1F6F4A] mt-2 font-medium">
            Dari website & form pendaftaran
          </p>
        </div>
      </div>

      {/* Main Grid: Left (Sesi Hari Ini) + Right (Perlu Tindakan) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Jadwal Sesi Hari Ini */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-[#D5DDEB] p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-[#09408C]" />
                <h2 className="text-lg font-bold text-[#09408C] font-display">
                  Jadwal Sesi Hari Ini
                </h2>
              </div>
              <Link
                href="/dashboard/jadwal"
                className="text-xs font-semibold text-[#09408C] hover:underline flex items-center gap-1"
              >
                Lihat Kalender Lengkap
                <ArrowRight size={12} />
              </Link>
            </div>

            {/* List Sesi */}
            {data.todaySessions.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-[#D5DDEB] rounded-xl p-6">
                <Calendar size={36} className="mx-auto text-[#9AC1E2] mb-2" />
                <p className="text-sm font-medium text-[#1B2A41]">
                  Belum ada jadwal bimbingan untuk hari ini.
                </p>
                <p className="text-xs text-[#5B6882] mt-1">
                  Yuk buat jadwal baru untuk tutor dan siswa Anda.
                </p>
                <Link
                  href="/dashboard/jadwal"
                  className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571] transition-colors"
                >
                  <Plus size={14} />
                  <span>Jadwalkan Sesi</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {data.todaySessions.map((session) => {
                  const startTime = formatTime(session.startAt);
                  const endTime = formatTime(session.endAt);

                  return (
                    <div
                      key={session.id}
                      className="p-4 rounded-xl border border-[#D5DDEB] hover:border-[#9AC1E2] bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="px-2.5 py-1.5 rounded-lg bg-[#EAF1FA] text-[#09408C] font-bold text-xs tabular-nums text-center">
                          {startTime}
                          <div className="text-[10px] font-normal text-[#5B6882]">{endTime}</div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-[#1B2A41]">
                              {session.studentNames.join(", ")}
                            </span>
                            <span className="text-xs text-[#5B6882]">• {session.programName}</span>
                          </div>
                          <div className="text-xs text-[#5B6882] mt-1 flex items-center gap-2">
                            <span>Tutor: <strong>{session.tutorName}</strong></span>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1">
                              {session.mode === "ONLINE" ? (
                                <>
                                  <Video size={12} className="text-[#0CC0DF]" />
                                  Online (Zoom)
                                </>
                              ) : (
                                <>
                                  <Home size={12} className="text-[#F5B82E]" />
                                  Home Visit
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {session.meetingLink && (
                          <a
                            href={session.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-[#0CC0DF]/10 text-[#0E3571] text-xs font-semibold hover:bg-[#0CC0DF]/20 transition-colors inline-flex items-center gap-1"
                          >
                            <Video size={12} />
                            <span>Buka Zoom</span>
                          </a>
                        )}
                        <Link
                          href="/dashboard/jadwal"
                          className="px-3 py-1.5 rounded-lg border border-[#D5DDEB] text-xs font-semibold text-[#09408C] hover:bg-[#EAF1FA] transition-colors"
                        >
                          Absensi & Jurnal
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Perlu Tindakan (Design 2 & 6.2) */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#D5DDEB] p-5 shadow-xs">
            <h2 className="text-base font-bold text-[#09408C] font-display flex items-center gap-2 mb-3">
              <AlertCircle size={16} className="text-[#F5B82E]" />
              <span>Perlu Tindakan</span>
            </h2>

            <div className="space-y-3">
              {/* Kuota Hampir Habis */}
              {data.actionItems.lowQuotaStudents.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#B45309]">
                    Sisa Kuota Menipis
                  </div>
                  {data.actionItems.lowQuotaStudents.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-[#FEF7E6] border border-[#F5B82E]/30 text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-[#1B2A41]">{item.studentName}</div>
                        <div className="text-[11px] text-[#B45309]">
                          Sisa {item.quotaRemaining} pertemuan ({item.packageName})
                        </div>
                      </div>
                      <Link
                        href="/dashboard/paket"
                        className="px-2 py-1 bg-white text-[#B45309] font-bold rounded-lg shadow-2xs hover:bg-[#F5B82E] hover:text-white transition-colors"
                      >
                        Perpanjang
                      </Link>
                    </div>
                  ))}
                </div>
              )}

              {/* Lead Baru Menunggu */}
              {data.actionItems.newLeads.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#D5DDEB]">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#09408C]">
                    Lead Baru Masuk
                  </div>
                  {data.actionItems.newLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="p-2.5 rounded-xl bg-[#EAF1FA] border border-[#9AC1E2]/40 text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-[#1B2A41]">{lead.name}</div>
                        <div className="text-[11px] text-[#5B6882]">
                          Minat: {lead.programInterest || "Umum"}
                        </div>
                      </div>
                      <a
                        href={`https://wa.me/${lead.phone}?text=Halo%20${encodeURIComponent(lead.name)}%2C%20kami%20dari%20Sahabat%20Belajar%20...`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 bg-[#1F6F4A] text-white font-semibold rounded-lg shadow-2xs hover:bg-[#165538] transition-colors flex items-center gap-1"
                      >
                        <Phone size={10} />
                        <span>Chat WA</span>
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {data.actionItems.lowQuotaStudents.length === 0 &&
                data.actionItems.newLeads.length === 0 && (
                  <div className="py-6 text-center text-xs text-[#5B6882]">
                    <CheckCircle2 size={24} className="mx-auto text-[#1F6F4A] mb-1.5" />
                    Semua operasional rapi! Tidak ada kuota kritis atau lead tertunda saat ini.
                  </div>
                )}
            </div>
          </div>

          {/* Quick Help / Info Box */}
          <div className="bg-[#09408C] text-white rounded-2xl p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-[#0CC0DF]" />
              <span className="font-bold text-sm">SOP Sesi Sahabat Belajar</span>
            </div>
            <p className="text-xs text-white/80 leading-relaxed">
              Durasi standar setiap sesi adalah <strong>90 menit</strong>. Kuota siswa akan terpotong tepat 1 secara otomatis begitu sesi Anda tandai <strong>Terlaksana</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
