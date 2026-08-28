"use client";

import Link from "next/link";
import {
  Award,
  CheckCircle2,
  Printer,
  ArrowLeft,
  Share2,
  Calendar,
  Clock,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";
import type { CertificateDetail } from "@/actions/sertifikat";

interface CertificateVerificationClientProps {
  cert: CertificateDetail;
}

export default function CertificateVerificationClient({ cert }: CertificateVerificationClientProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-[var(--font-body)] print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Actions (Hidden in Print) */}
        <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
          <Link
            href="/belajar"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs transition-all"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Ruang Belajar</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs transition-all hover:opacity-90"
              style={{ background: "var(--color-primary)" }}
            >
              <Printer size={14} />
              <span>Cetak / Unduh PDF</span>
            </button>
          </div>
        </div>

        {/* Verification Status Card */}
        <div className="elevation-1 rounded-2xl p-4 bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-4 shadow-xs print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-950">E-Sertifikat Terverifikasi Resmi & Sah</p>
              <p className="text-3xs text-emerald-700">
                Dokumen digital ini diakui secara resmi oleh Lembaga Riset & Publikasi Ilmiah BIAS RISTEK.
              </p>
            </div>
          </div>
          <span className="text-3xs font-mono font-bold bg-white px-2.5 py-1 rounded-md text-emerald-900 border border-emerald-200">
            {cert.certificateCode}
          </span>
        </div>

        {/* The Academic Certificate Canvas Document */}
        <div
          className="elevation-2 bg-white rounded-3xl p-8 sm:p-14 border-8 border-double border-blue-950 relative shadow-2xl overflow-hidden print:border-4 print:shadow-none print:rounded-none"
          style={{
            backgroundImage: "radial-gradient(#001847 0.75px, transparent 0.75px)",
            backgroundSize: "24px 24px",
            backgroundPosition: "0 0",
          }}
        >
          {/* Inner Golden Border */}
          <div className="absolute inset-3 sm:inset-4 border-2 border-[#fdbc13]/60 rounded-2xl pointer-events-none" />

          {/* Certificate Content */}
          <div className="relative z-10 text-center space-y-6 max-w-2xl mx-auto py-4">
            {/* Header Emblems */}
            <div className="flex flex-col items-center space-y-2">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-md font-extrabold text-xl"
                style={{ background: "var(--color-primary)" }}
              >
                BR
              </div>
              <p className="text-xs font-extrabold tracking-widest uppercase text-blue-900 font-[var(--font-heading)]">
                BIAS RISTEK INDONESIA
              </p>
              <p className="text-3xs text-slate-500 uppercase tracking-wider">
                Center for Academic Excellence & Scientific Research Training
              </p>
            </div>

            {/* Certificate Title */}
            <div className="space-y-1 pt-2">
              <h1 className="text-2xl sm:text-4xl font-extrabold font-[var(--font-heading)] tracking-tight text-slate-900">
                SERTIFIKAT KELULUSAN
              </h1>
              <p className="text-3xs font-mono font-bold uppercase tracking-widest text-[#fdbc13]">
                NOMOR SERI: {cert.certificateCode}
              </p>
            </div>

            <p className="text-xs text-slate-600 italic">Sertifikat ini dengan bangga diberikan kepada:</p>

            {/* Recipient Name */}
            <div className="py-2 border-b-2 border-slate-300 max-w-lg mx-auto">
              <h2 className="text-2xl sm:text-3xl font-extrabold font-[var(--font-heading)] text-blue-950 tracking-tight">
                {cert.recipientName}
              </h2>
            </div>

            {/* Statement & Program */}
            <div className="space-y-2 text-xs text-slate-700 leading-relaxed max-w-xl mx-auto">
              <p>
                Telah menyelesaikan seluruh rangkaian sesi pelatihan intensif, praktik analisis data, dan bimbingan
                penyusunan naskah ilmiah pada program:
              </p>
              <h3 className="text-base sm:text-lg font-extrabold font-[var(--font-heading)] text-blue-900">
                {cert.courseTitle}
              </h3>
              <p className="text-3xs font-semibold text-slate-500">
                Total Beban Pembelajaran & Mentorship: <strong>{cert.totalHours || "32 JP"}</strong>
              </p>
            </div>

            {/* Signatures & Seal */}
            <div className="pt-8 grid grid-cols-2 gap-8 items-end max-w-lg mx-auto">
              <div className="space-y-1">
                <div className="w-28 h-12 mx-auto flex items-center justify-center text-blue-900 font-serif italic text-sm border-b border-slate-400">
                  Dr. Ir. Hendra G.
                </div>
                <p className="text-3xs font-bold text-slate-900">Dr. Ir. Hendra Gunawan, M.Sc.</p>
                <p className="text-3xs text-slate-400">Chief Reviewer & Mentor Utama</p>
              </div>

              <div className="space-y-1">
                <div className="w-28 h-12 mx-auto flex items-center justify-center text-blue-900 font-serif italic text-sm border-b border-slate-400">
                  Prof. Ratna S.
                </div>
                <p className="text-3xs font-bold text-slate-900">Prof. Dr. Ratna Sulistiyani</p>
                <p className="text-3xs text-slate-400">Direktur Riset BIAS RISTEK</p>
              </div>
            </div>

            {/* Issue Date & QR Verification Stamp */}
            <div className="pt-6 border-t border-slate-200 text-3xs text-slate-400 flex items-center justify-between">
              <span>Diterbitkan di Banjarbaru, {new Date(cert.issuedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
              <span className="font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 size={11} /> Terdaftar di Registri BIAS RISTEK
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
