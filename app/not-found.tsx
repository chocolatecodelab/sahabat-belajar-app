import Link from "next/link";
import { ArrowLeft, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100">
        <div className="flex justify-center mb-6">
          <img
            src="/uploads/images/bias_ristek-logo.png"
            alt="BIAS RISTEK"
            className="h-12 w-auto object-contain"
          />
        </div>
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 text-blue-900 mb-4 font-extrabold text-2xl font-[var(--font-heading)]">
          404
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 mb-3 font-[var(--font-heading)]">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-gray-600 text-sm sm:text-base mb-8 leading-relaxed">
          Maaf, halaman atau konten yang Anda cari tidak tersedia, telah dipindahkan, atau tautan yang Anda tuju sudah tidak aktif.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg"
            style={{ background: "var(--color-primary)" }}
          >
            <Home size={16} /> Ke Beranda
          </Link>
          <Link
            href="/berita"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition-all"
          >
            <Search size={16} /> Cari Berita
          </Link>
        </div>
      </div>
    </div>
  );
}
