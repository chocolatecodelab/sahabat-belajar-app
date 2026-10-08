"use client";

import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Calendar,
  Award,
  ExternalLink,
  ShieldCheck,
  BarChart2,
  CheckCircle2,
} from "lucide-react";
import type { MonthlyProgressReportItem } from "@/actions/rapor";

interface Props {
  reports: MonthlyProgressReportItem[];
  user: {
    name: string;
    email: string;
  };
}

export default function StudentReportsClient({ reports, user }: Props) {
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Top Banner */}
      <div className="rounded-2xl p-6 bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/belajar"
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-[#001847] hover:bg-slate-50 transition"
              title="Kembali ke Kelas Saya"
            >
              <ArrowLeft size={16} />
            </Link>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#fef9c3] text-[#7a5900] border border-[#fef08a]">
              Evaluasi Akademik Resmi
            </span>
          </div>

          <h1 className="text-2xl font-bold font-display text-[#001847] tracking-tight">
            e-Rapor Kemajuan Riset & Bimbingan
          </h1>
          <p className="text-xs text-slate-500">
            Peneliti: <span className="font-semibold text-slate-700">{user.name}</span> ({user.email})
          </p>
        </div>

        <Link
          href="/belajar"
          className="px-4 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs transition self-start sm:self-center"
        >
          <span>Kembali ke Kelas</span>
        </Link>
      </div>

      {/* Reports List */}
      {reports.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
          <FileText size={38} className="mx-auto text-slate-300" />
          <h3 className="text-base font-bold font-display text-slate-800">
            Belum ada e-Rapor yang diterbitkan
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Rapor bulanan akan otomatis dikompilasi oleh tim akademik setelah sesi bimbingan bersama mentor selesai dievaluasi pada akhir periode kalender.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((r) => {
            const periodStr = `${monthNames[r.periodMonth - 1] || "Bulan"} ${r.periodYear}`;

            return (
              <div
                key={r.id}
                className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-[#001847] bg-[#001847]/6 px-2.5 py-1 rounded-md border border-[#001847]/12">
                      {r.reportNumber}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {r.progressStatus}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold font-display text-slate-900 leading-snug">
                      Periode: {periodStr}
                    </h3>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{r.courseTitle}</p>
                    <p className="text-xs text-slate-600 mt-1">
                      Tutor: <strong className="text-[#001847]">{r.tutorName}</strong> • {r.totalSessions} Sesi
                    </p>
                  </div>

                  {/* Competency scores bar */}
                  <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-100">
                    <div className="p-2 rounded-lg bg-slate-50">
                      <p className="text-[10px] text-slate-500">Metodologi</p>
                      <p className="text-sm font-bold text-[#001847]">{r.methodologyScore}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50">
                      <p className="text-[10px] text-slate-500">Penulisan</p>
                      <p className="text-sm font-bold text-[#001847]">{r.writingScore}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-[#fef9c3]/50 border border-[#fef08a]">
                      <p className="text-[10px] text-[#7a5900] font-bold">Rerata</p>
                      <p className="text-sm font-extrabold text-[#7a5900]">{r.averageScore}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed italic bg-slate-50/60 p-2.5 rounded-lg border border-slate-100">
                    "{r.summary}"
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <Link
                    href={`/rapor/${r.reportNumber}`}
                    target="_blank"
                    className="w-full py-2.5 rounded-lg text-xs font-semibold bg-[#001847] hover:bg-[#0b2c6b] text-white flex items-center justify-center gap-1.5 shadow-2xs transition"
                  >
                    <ExternalLink size={14} />
                    <span>Buka & Cetak e-Rapor Resmi</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
