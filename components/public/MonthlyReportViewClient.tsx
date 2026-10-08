"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Printer,
  Share2,
  CheckCircle2,
  ArrowLeft,
  Calendar,
  Award,
  BookOpen,
  User,
  GraduationCap,
  Clock,
  ShieldCheck,
  Check,
  FileText,
  BarChart2,
} from "lucide-react";
import type { MonthlyProgressReportItem } from "@/actions/rapor";

interface Props {
  report: MonthlyProgressReportItem;
}

export default function MonthlyReportViewClient({ report }: Props) {
  const [copied, setCopied] = useState(false);

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const periodText = `${monthNames[report.periodMonth - 1] || "Bulan"} ${report.periodYear}`;

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] py-8 sm:py-12 px-4 sm:px-6 font-sans text-slate-800">
      {/* Action Bar (Hidden on print) */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <Link
          href="/belajar"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#001847] hover:text-[#0b2c6b] transition"
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Ruang Belajar</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs transition"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} className="text-[#001847]" />}
            <span>{copied ? "Tautan Tersalin!" : "Bagikan Tautan"}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#001847] hover:bg-[#0b2c6b] text-white flex items-center gap-1.5 shadow-sm transition"
          >
            <Printer size={15} />
            <span>Cetak / Unduh PDF</span>
          </button>
        </div>
      </div>

      {/* Official Academic Report Document (A4 Ratio Standard) */}
      <main className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200/90 shadow-md p-6 sm:p-12 print:p-0 print:border-none print:shadow-none print:rounded-none">
        {/* Document Header (Institutional Letterhead) */}
        <header className="border-b-2 border-[#001847] pb-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-[#001847] text-white flex items-center justify-center font-bold text-2xl font-display shrink-0 shadow-sm">
              BR
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-display text-[#001847] tracking-tight">
                BIAS RISTEK
              </h1>
              <p className="text-xs font-semibold text-slate-600 tracking-wider uppercase">
                Badan Inovasi Akademik & Sains Indonesia
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Direktorat Pengembangan Riset, Publikasi Ilmiah & Pelatihan Statistik Terapan
              </p>
            </div>
          </div>

          <div className="text-center sm:text-right space-y-1">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold bg-[#fef9c3] text-[#7a5900] border border-[#fef08a]">
              <ShieldCheck size={13} className="text-[#7a5900]" />
              DOKUMEN RESMI TERVERIFIKASI
            </span>
            <p className="text-xs font-mono text-slate-500 pt-1">
              No. Register: <strong className="text-[#001847]">{report.reportNumber}</strong>
            </p>
            <p className="text-[11px] text-slate-400">Periode Evaluasi: {periodText}</p>
          </div>
        </header>

        {/* Document Title Banner */}
        <div className="bg-[#f8f9ff] border border-slate-200/80 rounded-xl p-5 mb-8 text-center space-y-1">
          <h2 className="text-base sm:text-lg font-bold font-display text-[#001847] uppercase tracking-wide">
            Laporan Kemajuan Riset & Evaluasi Bimbingan Bulanan
          </h2>
          <p className="text-xs text-slate-500">
            Monthly Research Progress Report & Scientific Mentorship Evaluation
          </p>
        </div>

        {/* Student & Mentorship Metadata Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-xs">
          <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/50 space-y-2">
            <div className="flex items-center gap-2 text-slate-400 font-semibold uppercase text-[11px]">
              <User size={13} className="text-[#001847]" />
              <span>Identitas Peneliti / Siswa</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{report.studentName}</p>
              <p className="text-slate-500 font-mono">{report.studentEmail}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/50 space-y-2">
            <div className="flex items-center gap-2 text-slate-400 font-semibold uppercase text-[11px]">
              <GraduationCap size={13} className="text-[#001847]" />
              <span>Program & Mentor Pendamping</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{report.courseTitle}</p>
              <p className="text-slate-600">Tutor: <strong className="text-[#001847]">{report.tutorName}</strong></p>
            </div>
          </div>
        </section>

        {/* Competency Score Overview */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#001847] flex items-center gap-2">
              <BarChart2 size={15} className="text-[#001847]" />
              <span>Hasil Penilaian Kompetensi Akademik</span>
            </h3>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {report.progressStatus}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
            {/* Metodologi */}
            <div className="p-4 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Metodologi Riset</p>
              <p className="text-2xl font-bold font-display text-[#001847] mt-1">{report.methodologyScore}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Skor Skala 100</p>
            </div>

            {/* Penulisan */}
            <div className="p-4 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Sistematika & Argumentasi</p>
              <p className="text-2xl font-bold font-display text-[#001847] mt-1">{report.writingScore}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Skor Skala 100</p>
            </div>

            {/* Olah Data */}
            <div className="p-4 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Analisis Data Statistik</p>
              <p className="text-2xl font-bold font-display text-[#001847] mt-1">{report.dataProcessingScore}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Skor Skala 100</p>
            </div>

            {/* Rata-Rata */}
            <div className="p-4 rounded-xl border border-[#fef08a] bg-[#fef9c3]/50 shadow-2xs">
              <p className="text-[11px] font-bold text-[#7a5900] uppercase">Rata-Rata Capaian</p>
              <p className="text-2xl font-extrabold font-display text-[#7a5900] mt-1">{report.averageScore}</p>
              <p className="text-[10px] text-[#7a5900] mt-0.5">Bobot Evaluasi Bulanan</p>
            </div>
          </div>
        </section>

        {/* Narrative Academic Summary */}
        <section className="mb-8 p-5 rounded-xl border border-slate-200/80 bg-white space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#001847] flex items-center gap-2">
            <BookOpen size={14} className="text-[#001847]" />
            <span>Ringkasan Kemajuan & Capaian Riset</span>
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed font-normal">
            {report.summary}
          </p>

          <div className="pt-3 border-t border-slate-100">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#7a5900] mb-1">
              Rekomendasi Tindak Lanjut:
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {report.recommendations}
            </p>
          </div>
        </section>

        {/* Detailed Session Logs */}
        {report.evaluations && report.evaluations.length > 0 && (
          <section className="mb-8 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#001847] flex items-center gap-2">
              <FileText size={15} className="text-[#001847]" />
              <span>Log Riwayat Sesi Bimbingan Periode Ini ({report.evaluations.length} Pertemuan)</span>
            </h3>

            <div className="space-y-3">
              {report.evaluations.map((ev) => (
                <div
                  key={ev.id}
                  className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/40 text-xs space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#001847] text-white flex items-center justify-center font-bold text-[10px]">
                        {ev.sessionNumber}
                      </span>
                      <strong className="text-slate-800 text-xs">Sesi {ev.sessionNumber}: {ev.currentChapter}</strong>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(ev.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <p className="text-slate-600">
                    <span className="font-semibold text-slate-700">Topik Diskusi:</span> {ev.topicDiscussed}
                  </p>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200/60 space-y-1">
                    <p className="text-[11px] font-semibold text-slate-700">Tindakan Perbaikan (Action Items):</p>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{ev.actionItems}</p>
                  </div>

                  <p className="text-[11px] text-slate-500 italic">
                    Catatan Mentor: "{ev.tutorFeedback}"
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Official Signatures & Verification Stamp */}
        <footer className="border-t-2 border-slate-200 pt-8 mt-12 grid grid-cols-1 sm:grid-cols-2 gap-8 text-center text-xs">
          <div>
            <p className="text-slate-500 mb-12">Tutor Pakar Pendamping Riset,</p>
            <p className="font-bold font-display text-slate-900 border-b border-slate-300 pb-1 max-w-[200px] mx-auto">
              {report.tutorName}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Reviewer & Konsultan Riset</p>
          </div>

          <div>
            <p className="text-slate-500 mb-12">Direktur Akademik BIAS RISTEK,</p>
            <p className="font-bold font-display text-slate-900 border-b border-slate-300 pb-1 max-w-[200px] mx-auto">
              Dr. Ristek Akademika, M.Sc.
            </p>
            <p className="text-[11px] text-slate-400 mt-1">NIP. 19850412-201012-1-002</p>
          </div>
        </footer>

        {/* Footer Audit Code */}
        <div className="text-center pt-8 border-t border-slate-100 mt-8 text-[10px] text-slate-400">
          Dokumen ini diterbitkan secara elektronik oleh Sistem Otomasi Akademik BIAS RISTEK dan divalidasi dengan segel digital resmi. Keaslian laporan dapat diverifikasi di platform resmi BIAS RISTEK.
        </div>
      </main>
    </div>
  );
}
