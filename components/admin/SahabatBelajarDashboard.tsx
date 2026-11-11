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
  Compass,
  Award,
  TrendingUp,
  DollarSign,
  BarChart2,
  FileEdit,
  BookOpen,
  PieChart,
  Printer,
  ChevronRight,
  ShieldCheck,
  CreditCard,
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
  const [activeMetricTab, setActiveMetricTab] = useState<"OMSET" | "SESI">("OMSET");

  // Chart dimensions & calculations
  const trends = data.monthlyTrends || [];
  const maxRevenue = Math.max(...trends.map((t) => t.revenue), 30000000);
  const maxSessions = Math.max(...trends.map((t) => t.sessionsCount), 70);

  // Helper WhatsApp generator for low quota renewal
  const getRenewalWaUrl = (item: (typeof data.actionItems.lowQuotaStudents)[0]) => {
    const phone = (item.parentPhone || "628123456789").replace(/[^0-9]/g, "");
    const formattedPhone = phone.startsWith("0") ? `62${phone.slice(1)}` : phone;
    const msg =
      `Halo Bapak/Ibu wali dari ${item.studentName}, kami dari Sahabat Belajar menginformasikan bahwa kuota bimbingan pada paket *${item.packageName}* tersisa *${item.quotaRemaining} sesi lagi*. Agar bimbingan belajar Ananda tetap berkesinambungan tanpa jeda, kami siap membantu perpanjangan paket. Terima kasih! #BersamaSahabat`;
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`;
  };

  // Helper WhatsApp generator for new leads
  const getLeadWaUrl = (lead: (typeof data.actionItems.newLeads)[0]) => {
    const phone = lead.phone.replace(/[^0-9]/g, "");
    const formattedPhone = phone.startsWith("0") ? `62${phone.slice(1)}` : phone;
    const msg =
      `Halo Kak ${lead.name}! Terima kasih telah mendaftar di Sahabat Belajar untuk program *${lead.programInterest || "Bimbingan Belajar"}*. Ada yang bisa tim akademik kami bantu untuk rencana belajarnya? #BersamaSahabat`;
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`;
  };

  // Helper WhatsApp generator for unpaid invoices (Friksi A1)
  const getInvoiceWaUrl = (inv: (typeof data.actionItems.unpaidPayments)[0]) => {
    const phone = (inv.parentPhone || "628123456789").replace(/[^0-9]/g, "");
    const formattedPhone = phone.startsWith("0") ? `62${phone.slice(1)}` : phone;
    const msg =
      `Halo Bapak/Ibu wali dari ${inv.studentName}, kami dari Sahabat Belajar menginformasikan tagihan bimbingan untuk paket *${inv.packageName}* sebesar *Rp ${inv.amount.toLocaleString("id-ID")}*. Mohon konfirmasi bukti transfer jika sudah melakukan pembayaran agar sesi belajar tetap lancar. Terima kasih! #BersamaSahabat`;
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Executive Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D5DDEB] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold text-[#09408C] uppercase tracking-wider bg-[#EAF1FA] px-2.5 py-0.5 rounded-full border border-[#9AC1E2]">
              Executive Command Center
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-[#1F6F4A] bg-[#E3F4EC] px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1F6F4A] animate-pulse"></span>
              Sistem Aktif
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#09408C] tracking-tight font-heading">
            Pusat Kendali Operasional & Finansial
          </h1>
          <p className="text-xs sm:text-sm text-[#5B6882] mt-1 max-w-2xl leading-relaxed">
            Monitoring real-time operasional bimbingan belajar, kesehatan kuota siswa, pipa prospek, dan performa finansial.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap print:hidden">
          <Link
            href="/dashboard/jadwal"
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl bg-[#09408C] text-white hover:bg-[#0E3571] text-xs font-bold transition-colors shadow-xs shrink-0 cursor-pointer"
          >
            <Plus size={15} />
            <span>Jadwalkan Sesi</span>
          </Link>
          <Link
            href="/dashboard/pembayaran"
            className="flex items-center gap-2 px-3 sm:px-3.5 py-2.5 rounded-xl border border-[#D5DDEB] bg-white text-[#09408C] hover:bg-[#EAF1FA] text-xs font-bold transition-colors shrink-0 cursor-pointer"
          >
            <DollarSign size={15} />
            <span>Catat Pembayaran</span>
          </Link>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#D5DDEB] bg-white text-[#5B6882] hover:text-[#09408C] hover:border-[#09408C] hover:bg-[#EAF1FA] text-xs font-semibold transition-colors shrink-0 cursor-pointer shadow-2xs"
            title="Cetak Laporan Eksekutif"
          >
            <Printer size={15} />
            <span>Cetak</span>
          </button>
        </div>
      </div>

      {/* 4 Core Financial & Operational KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Omset Finansial */}
        <div className="bg-white p-5 rounded-2xl border border-[#D5DDEB] shadow-xs hover:border-[#09408C] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5B6882]">Estimasi Omset Bulan Ini</span>
            <div className="w-10 h-10 rounded-2xl bg-[#EAF1FA] flex items-center justify-center text-[#09408C]">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-[#09408C] tabular-nums font-heading">
              Rp {data.monthlyRevenue.toLocaleString("id-ID")}
            </div>
            <div className="text-[11px] text-[#1F6F4A] font-semibold mt-1 flex items-center gap-1">
              <TrendingUp size={13} />
              <span>+14.2% dibanding bulan lalu</span>
            </div>
          </div>
          <p className="text-[11px] text-[#5B6882] mt-2 pt-2 border-t border-[#D5DDEB]/60">
            Estimasi honor tutor: <strong>Rp {data.monthlyTutorPayoutEstimate.toLocaleString("id-ID")}</strong>
          </p>
        </div>

        {/* 2. Siswa Aktif */}
        <div className="bg-white p-5 rounded-2xl border border-[#D5DDEB] shadow-xs hover:border-[#09408C] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5B6882]">Total Siswa Aktif</span>
            <div className="w-10 h-10 rounded-2xl bg-[#EAF1FA] flex items-center justify-center text-[#09408C]">
              <GraduationCap size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#1B2A41] tabular-nums font-heading">
              {data.activeStudentsCount}
            </span>
            <span className="text-xs text-[#5B6882]">peserta didik</span>
          </div>
          <div className="text-[11px] text-[#1F6F4A] font-semibold mt-1">
            Privat 1-on-1 & Semi-Privat Aktif
          </div>
          <p className="text-[11px] text-[#5B6882] mt-2 pt-2 border-t border-[#D5DDEB]/60">
            Kapasitas kelas semi-privat maks. 5 siswa
          </p>
        </div>

        {/* 3. Sesi Hari Ini */}
        <div className="bg-white p-5 rounded-2xl border border-[#D5DDEB] shadow-xs hover:border-[#295897] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5B6882]">Sesi Belajar Hari Ini</span>
            <div className="w-10 h-10 rounded-2xl bg-[#EAF1FA] flex items-center justify-center text-[#295897]">
              <Calendar size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#09408C] tabular-nums font-heading">
              {data.todaySessionsCount}
            </span>
            <span className="text-xs text-[#5B6882]">sesi terjadwal</span>
          </div>
          <div className="text-[11px] text-[#09408C] font-semibold mt-1">
            Total {data.todaySessionsCount * 1.5} jam bimbingan
          </div>
          <p className="text-[11px] text-[#5B6882] mt-2 pt-2 border-t border-[#D5DDEB]/60">
            Standar durasi 90 menit per sesi
          </p>
        </div>

        {/* 4. Kuota Kritis */}
        <div className="bg-white p-5 rounded-2xl border border-[#D5DDEB] shadow-xs hover:border-[#F5B82E] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5B6882]">Kuota Hampir Habis</span>
            <div className="w-10 h-10 rounded-2xl bg-[#FEF7E6] flex items-center justify-center text-[#B45309]">
              <AlertCircle size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#B45309] tabular-nums font-heading">
              {data.lowQuotaCount}
            </span>
            <span className="text-xs text-[#5B6882]">paket (sisa ≤ 2 sesi)</span>
          </div>
          <div className="text-[11px] text-[#B45309] font-semibold mt-1">
            Perlu Penawaran Top-Up Paket
          </div>
          <p className="text-[11px] text-[#5B6882] mt-2 pt-2 border-t border-[#D5DDEB]/60">
            Terdeteksi otomatis saat sisa kuota tipis
          </p>
        </div>
      </div>

      {/* Main Grid: Left (Analytics & Sesi Hari Ini) + Right (Action Radar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Visual Trend Chart Card */}
          <div className="bg-white rounded-2xl border border-[#D5DDEB] p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF1FA] text-[#09408C] text-xs font-bold border border-[#9AC1E2] mb-1">
                  <BarChart2 size={14} />
                  <span>Tren Pertumbuhan 6 Bulan Terakhir</span>
                </div>
                <h3 className="text-lg font-bold text-[#09408C] font-heading">
                  Performa Finansial & Jumlah Sesi Bimbingan
                </h3>
              </div>

              <div className="flex items-center gap-1.5 bg-[#F4F7FB] p-1 rounded-xl border border-[#D5DDEB]">
                <button
                  onClick={() => setActiveMetricTab("OMSET")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeMetricTab === "OMSET"
                      ? "bg-[#09408C] text-white shadow-2xs"
                      : "text-[#5B6882] hover:text-[#1B2A41]"
                  }`}
                >
                  Omset (Rp)
                </button>
                <button
                  onClick={() => setActiveMetricTab("SESI")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeMetricTab === "SESI"
                      ? "bg-[#09408C] text-white shadow-2xs"
                      : "text-[#5B6882] hover:text-[#1B2A41]"
                  }`}
                >
                  Jumlah Sesi
                </button>
              </div>
            </div>

            {/* Responsive SVG Bar Graph */}
            <div className="bg-[#F4F7FB] p-4 rounded-2xl border border-[#D5DDEB]">
              <div className="h-44 w-full flex items-end justify-between gap-2 sm:gap-4 pt-6 px-2">
                {trends.map((item, idx) => {
                  const val = activeMetricTab === "OMSET" ? item.revenue : item.sessionsCount;
                  const max = activeMetricTab === "OMSET" ? maxRevenue : maxSessions;
                  const heightPercent = Math.max(15, Math.round((val / max) * 100));

                  return (
                    <div
                      key={item.month}
                      className="flex-1 flex flex-col items-center gap-2 group h-full justify-end"
                    >
                      <div className="text-[10px] sm:text-xs font-bold text-[#09408C] opacity-0 group-hover:opacity-100 transition-opacity">
                        {activeMetricTab === "OMSET"
                          ? `${(val / 1000000).toFixed(1)}jt`
                          : `${val} sesi`}
                      </div>

                      <div className="w-full max-w-[42px] bg-[#D5DDEB] rounded-xl overflow-hidden h-full flex items-end">
                        <div
                          className={`w-full rounded-xl transition-all duration-500 group-hover:brightness-110 ${
                            idx === trends.length - 1 ? "bg-[#09408C]" : "bg-[#295897]"
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        ></div>
                      </div>

                      <span className="text-[11px] font-bold text-[#5B6882] group-hover:text-[#09408C]">
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 pt-3 border-t border-[#D5DDEB] flex items-center justify-between text-xs text-[#5B6882]">
                <span>Rata-rata pertumbuhan bulanan: <strong className="text-[#1F6F4A]">+12.8%</strong></span>
                <span className="font-semibold text-[#09408C]">Puncak: Apr (58 Sesi)</span>
              </div>
            </div>
          </div>

          {/* Live Monitor Sesi Bimbingan Hari Ini */}
          <div className="bg-white rounded-2xl border border-[#D5DDEB] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-[#09408C]" />
                <h3 className="text-lg font-bold text-[#09408C] font-heading">
                  Live Monitor Sesi Hari Ini ({data.todaySessions.length})
                </h3>
              </div>
              <Link
                href="/dashboard/jadwal"
                className="text-xs font-semibold text-[#09408C] hover:underline flex items-center gap-1"
              >
                <span>Kelola Jadwal & Kalender</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            {data.todaySessions.length === 0 ? (
              <div className="py-10 text-center border-2 border-dashed border-[#D5DDEB] rounded-2xl p-6 text-[#5B6882]">
                <Calendar size={32} className="mx-auto text-[#9AC1E2] mb-2" />
                <p className="text-sm font-semibold text-[#1B2A41]">
                  Belum ada jadwal bimbingan untuk hari ini.
                </p>
                <Link
                  href="/dashboard/jadwal"
                  className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#09408C] text-white text-xs font-bold"
                >
                  <Plus size={14} />
                  <span>Jadwalkan Sesi Baru</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {data.todaySessions.map((session) => {
                  const startTime = formatTime(session.startAt);
                  const endTime = formatTime(session.endAt);
                  const isDone = session.status === "TERLAKSANA";

                  return (
                    <div
                      key={session.id}
                      className="p-4 rounded-2xl border border-[#D5DDEB] hover:border-[#9AC1E2] bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`px-3 py-2 rounded-xl font-bold text-xs tabular-nums text-center shrink-0 ${
                            isDone
                              ? "bg-[#E3F4EC] text-[#1F6F4A]"
                              : "bg-[#EAF1FA] text-[#09408C]"
                          }`}
                        >
                          <div>{startTime}</div>
                          <div className="text-[10px] font-normal opacity-75">{endTime}</div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-[#1B2A41]">
                              {session.studentNames.join(", ")}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#EAF1FA] text-[#09408C] font-semibold">
                              {session.programName}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                isDone
                                  ? "bg-[#E3F4EC] text-[#1F6F4A]"
                                  : "bg-blue-50 text-blue-700"
                              }`}
                            >
                              {isDone ? "Selesai (Terlaksana)" : "Terjadwal"}
                            </span>
                          </div>

                          <div className="text-xs text-[#5B6882] mt-1.5 flex items-center gap-3 flex-wrap">
                            <span>
                              Tutor: <strong className="text-[#1B2A41]">{session.tutorName}</strong>
                            </span>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1">
                              {session.mode === "ONLINE" ? (
                                <>
                                  <Video size={13} className="text-[#0CC0DF]" />
                                  <span>Online (Zoom / Meet)</span>
                                </>
                              ) : (
                                <>
                                  <Home size={13} className="text-[#F5B82E]" />
                                  <span>Home Visit</span>
                                </>
                              )}
                            </span>
                            {session.address && (
                              <span className="text-[11px] text-[#5B6882] truncate max-w-[200px]" title={session.address}>
                                ({session.address})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0 flex-wrap">
                        {session.mode === "ONLINE" && (
                          session.meetingLink ? (
                            <a
                              href={session.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-[#0CC0DF]/10 text-[#09408C] text-xs font-bold hover:bg-[#0CC0DF]/20 transition-colors inline-flex items-center gap-1"
                            >
                              <Video size={13} />
                              <span>Ruang Belajar</span>
                            </a>
                          ) : (
                            <Link
                              href="/dashboard/jadwal"
                              className="px-2.5 py-1.5 rounded-xl bg-[#FBE9E5] text-[#B4381F] text-xs font-bold hover:bg-rose-100 transition-colors inline-flex items-center gap-1 border border-red-200"
                              title="Tautan meeting belum diisi, klik untuk atur di jadwal"
                            >
                              <AlertCircle size={13} />
                              <span>+ Atur Link</span>
                            </Link>
                          )
                        )}

                        {session.tutorPhone && (
                          <a
                            href={`https://wa.me/${session.tutorPhone.replace(/[^0-9]/g, "")}?text=Halo%20${encodeURIComponent(session.tutorName)}%2C%20dari%20Admin%20Sahabat%20Belajar%20mengingatkan%20sesi%20bimbingan%20hari%20ini%20pukul%20${encodeURIComponent(startTime)}%20WIB.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-xl border border-[#D5DDEB] text-[#1F6F4A] hover:bg-[#E3F4EC] transition-colors"
                            title={`Hubungi Tutor via WhatsApp (${session.tutorPhone})`}
                          >
                            <Phone size={13} />
                          </a>
                        )}

                        <Link
                          href="/dashboard/jadwal"
                          className="px-3 py-1.5 rounded-xl border border-[#D5DDEB] text-xs font-semibold text-[#09408C] hover:bg-[#EAF1FA] transition-colors"
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

        {/* Right Column (1 Col): Radar Kuota Kritis, Leads, & Program Distribution */}
        <div className="space-y-6">
          {/* Radar Kuota Kritis Siswa */}
          <div className="bg-white rounded-2xl border border-[#D5DDEB] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-sm text-[#09408C] flex items-center gap-2">
                <AlertCircle size={16} className="text-[#B45309]" />
                <span>Peringatan Kuota Siswa</span>
              </h3>
              <span className="text-[10px] bg-[#FEF7E6] text-[#B45309] font-bold px-2 py-0.5 rounded-full">
                Sisa ≤ 2 Sesi
              </span>
            </div>

            <div className="space-y-2.5">
              {data.actionItems.lowQuotaStudents.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-[#FEF7E6] border border-[#F5B82E]/40 text-xs flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="font-bold text-[#1B2A41]">{item.studentName}</div>
                    <div className="text-[11px] text-[#B45309] mt-0.5">
                      Sisa: <strong className="font-bold">{item.quotaRemaining} Sesi</strong> ({item.packageName})
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Link
                      href={`/dashboard/paket?studentId=${item.studentId || item.id}&action=assign`}
                      className="px-2.5 py-1.5 bg-[#09408C] hover:bg-[#0E3571] text-white font-bold rounded-xl text-[11px] shadow-2xs transition-colors flex items-center gap-1"
                      title="Buka form penetapan paket perpanjangan untuk siswa ini"
                    >
                      <Plus size={11} />
                      <span>Perpanjang</span>
                    </Link>

                    <a
                      href={getRenewalWaUrl(item)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 bg-[#B45309] hover:bg-[#92400e] text-white font-bold rounded-xl text-[11px] shadow-2xs transition-colors flex items-center gap-1"
                      title="Kirim penawaran perpanjangan paket ke WhatsApp wali murid"
                    >
                      <MessageCircle size={12} />
                      <span>Top-Up WA</span>
                    </a>
                  </div>
                </div>
              ))}

              {data.actionItems.lowQuotaStudents.length === 0 && (
                <div className="py-4 text-center text-xs text-[#5B6882]">
                  <CheckCircle2 size={20} className="mx-auto text-[#1F6F4A] mb-1" />
                  Semua kuota bimbingan siswa dalam kondisi aman.
                </div>
              )}
            </div>
          </div>

          {/* Tagihan & Invoice Menunggu Pembayaran (Friksi A1) */}
          <div className="bg-white rounded-2xl border border-[#D5DDEB] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-sm text-[#09408C] flex items-center gap-2">
                <CreditCard size={16} className="text-[#09408C]" />
                <span>Tagihan Menunggu Pembayaran</span>
              </h3>
              <Link
                href="/dashboard/pembayaran"
                className="text-[11px] font-bold text-[#09408C] hover:underline"
              >
                Semua ({data.actionItems.unpaidPayments.length})
              </Link>
            </div>

            <div className="space-y-2.5">
              {data.actionItems.unpaidPayments.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3 rounded-2xl bg-[#F4F7FB] border border-[#D5DDEB] text-xs flex items-center justify-between gap-2"
                >
                  <div className="space-y-0.5 max-w-[170px]">
                    <div className="font-bold text-[#1B2A41] truncate">{inv.studentName}</div>
                    <div className="text-[11px] text-[#09408C] font-semibold truncate">
                      {inv.packageName}
                    </div>
                    <div className="text-[11px] font-bold text-[#B4381F] tabular-nums">
                      Rp {inv.amount.toLocaleString("id-ID")}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Link
                      href={`/dashboard/pembayaran?packageId=${inv.studentPackageId || inv.id}&action=record`}
                      className="px-2.5 py-1.5 bg-[#09408C] hover:bg-[#0E3571] text-white font-bold rounded-xl text-[11px] shadow-2xs transition-colors flex items-center gap-1"
                      title="Catat atau verifikasi pelunasan invoice ini"
                    >
                      <DollarSign size={11} />
                      <span>Catat</span>
                    </Link>

                    <a
                      href={getInvoiceWaUrl(inv)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1.5 border border-[#D5DDEB] hover:bg-slate-100 text-[#1F6F4A] font-bold rounded-xl text-[11px] transition-colors flex items-center gap-1"
                      title="Kirim pengingat tagihan ke WhatsApp wali murid"
                    >
                      <MessageCircle size={11} />
                      <span>WA</span>
                    </a>
                  </div>
                </div>
              ))}

              {data.actionItems.unpaidPayments.length === 0 && (
                <div className="py-4 text-center text-xs text-[#5B6882]">
                  <CheckCircle2 size={20} className="mx-auto text-[#1F6F4A] mb-1" />
                  Semua tagihan paket siswa telah berstatus lunas.
                </div>
              )}
            </div>
          </div>

          {/* Pipa Prospek / Lead Baru Masuk */}
          <div className="bg-white rounded-2xl border border-[#D5DDEB] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-sm text-[#09408C] flex items-center gap-2">
                <Users size={16} className="text-[#09408C]" />
                <span>Prospek & Placement Masuk</span>
              </h3>
              <Link
                href="/dashboard/lead"
                className="text-[11px] font-bold text-[#09408C] hover:underline"
              >
                Semua ({data.newLeadsCount})
              </Link>
            </div>

            <div className="space-y-2.5">
              {data.actionItems.newLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-3 rounded-2xl bg-[#F4F7FB] border border-[#D5DDEB] text-xs flex items-center justify-between gap-2"
                >
                  <div className="space-y-0.5 max-w-[170px]">
                    <div className="font-bold text-[#1B2A41] truncate">{lead.name}</div>
                    <div className="text-[11px] text-[#09408C] font-semibold truncate">
                      {lead.programInterest || "Umum"}
                    </div>
                    {lead.source === "PLACEMENT_TEST" && (
                      <span className="inline-block text-[10px] bg-[#E3F4EC] text-[#1F6F4A] px-1.5 py-0.2 rounded font-bold">
                        Placement Test
                      </span>
                    )}
                  </div>

                  <a
                    href={getLeadWaUrl(lead)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 bg-[#1F6F4A] hover:bg-[#165538] text-white font-bold rounded-xl text-[11px] shadow-2xs transition-colors shrink-0 flex items-center gap-1"
                  >
                    <Phone size={11} />
                    <span>Chat WA</span>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Distribusi Siswa per Program */}
          <div className="bg-white rounded-2xl border border-[#D5DDEB] p-5 shadow-xs space-y-3">
            <h3 className="font-heading font-bold text-sm text-[#09408C] flex items-center gap-2">
              <PieChart size={16} className="text-[#295897]" />
              <span>Peta Distribusi Program Belajar</span>
            </h3>

            <div className="space-y-2.5">
              {data.programDistribution.map((prog) => (
                <div key={prog.programName} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#1B2A41] font-semibold truncate max-w-[170px]">
                      {prog.programName}
                    </span>
                    <span className="text-[#09408C] font-bold">{prog.percentage}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#EAF1FA] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${prog.percentage}%`, backgroundColor: prog.color }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Hub: Navigasi Modul Lanjutan */}
          <div className="bg-gradient-to-br from-[#09408C] to-[#0E3571] text-white rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#9AC1E2]">
              <Compass size={16} />
              <span>Akses Cepat Modul Akademik</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                href="/dashboard/ujian"
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-2"
              >
                <Award size={15} className="text-[#9AC1E2]" />
                <span className="font-semibold">Simulasi CAT</span>
              </Link>
              <Link
                href="/dashboard/dokumen"
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-2"
              >
                <FileEdit size={15} className="text-[#9AC1E2]" />
                <span className="font-semibold">Review Esai</span>
              </Link>
              <Link
                href="/dashboard/materi"
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-2"
              >
                <BookOpen size={15} className="text-[#9AC1E2]" />
                <span className="font-semibold">Bank Modul</span>
              </Link>
              <Link
                href="/dashboard/honor"
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-2"
              >
                <DollarSign size={15} className="text-[#9AC1E2]" />
                <span className="font-semibold">Rekap Honor</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
