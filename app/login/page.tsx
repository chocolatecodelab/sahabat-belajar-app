"use client";

import { useState, Suspense } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LogIn, AlertCircle, BookOpen, Info, ArrowLeft } from "lucide-react";

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email atau password tidak sesuai. Pastikan email dan password terdaftar.");
      } else {
        // Fetch session to determine role-based redirection
        const session = await getSession();
        const userRole = (session?.user as any)?.role || "Siswa";
        const isStaff = [
          "Super Admin",
          "Admin",
          "Staf",
          "Tutor",
        ].includes(userRole);

        // Security Hardening: Sanitize callbackUrl to prevent Phishing Open Redirect
        const isSafeCallback =
          typeof callbackUrl === "string" &&
          callbackUrl.startsWith("/") &&
          !callbackUrl.startsWith("//") &&
          !callbackUrl.startsWith("/\\") &&
          !callbackUrl.includes("/login") &&
          !/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(callbackUrl);

        if (isSafeCallback) {
          // If a non-staff student attempts to access /dashboard, redirect to student portal
          if (!isStaff && callbackUrl.startsWith("/dashboard")) {
            router.push("/portal");
          } else {
            router.push(callbackUrl);
          }
        } else if (isStaff) {
          router.push("/dashboard");
        } else {
          router.push("/portal");
        }
        router.refresh();
      }
    } catch {
      setError("Terjadi kendala saat login. Silakan periksa koneksi dan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7FB] px-4 py-12 relative">
      {/* Background ambient accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-[#09408C] opacity-[0.05]" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#9AC1E2] opacity-[0.08]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-sm border border-[#D5DDEB] mb-4 transition-transform hover:scale-105"
          >
            <div className="w-10 h-10 rounded-xl bg-[#09408C] flex items-center justify-center text-white font-heading font-bold text-lg shadow-sm">
              SB
            </div>
            <div className="text-left">
              <span className="font-heading font-bold text-base text-[#09408C] block leading-tight">
                Sahabat Belajar
              </span>
              <span className="text-[11px] text-[#5B6882] font-medium block">
                Comprehensive Academic Solution
              </span>
            </div>
          </Link>

          <h1 className="text-2xl font-bold font-heading text-[#09408C]">
            Portal Masuk Sahabat Belajar
          </h1>
          <p className="text-sm mt-1 text-[#5B6882]">
            Akses Operasional Bimbingan & Portal Siswa
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#D5DDEB]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#1B2A41] font-heading">
              Masuk ke Akun Anda
            </h2>
            <span className="text-[11px] font-bold text-[#09408C] bg-[#EAF1FA] px-2.5 py-1 rounded-full">
              #BersamaSahabat
            </span>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl mb-5 text-xs bg-red-50 text-red-800 border border-red-200">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="text-xs font-semibold block mb-1.5 text-[#1B2A41]"
              >
                Email Akun Terdaftar
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@sahabatbelajar.id atau email siswa"
                required
                className="w-full px-4 py-3 rounded-xl border border-[#D5DDEB] text-sm text-[#1B2A41] transition-all focus:outline-hidden focus:ring-2 focus:ring-[#09408C] placeholder:text-[#5B6882]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold text-[#1B2A41]"
                >
                  Kata Sandi
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi akun Anda"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[#D5DDEB] text-sm text-[#1B2A41] transition-all focus:outline-hidden focus:ring-2 focus:ring-[#09408C] placeholder:text-[#5B6882] pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5B6882] hover:text-[#1B2A41] transition-colors"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-[11px] text-[#5B6882] mt-1.5 flex items-center gap-1.5">
                <Info size={12} className="text-[#09408C] shrink-0" />
                <span>Bagi siswa/wali baru, password awal dapat dikonfirmasi ke admin.</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white shadow-sm flex items-center justify-center gap-2 transition-all bg-[#09408C] hover:bg-[#0E3571] disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span>Memverifikasi Akun...</span>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Masuk Sekarang</span>
                </>
              )}
            </button>
          </form>

          {/* Student Registration Footnote */}
          <div className="mt-6 pt-5 border-t border-[#D5DDEB] text-center space-y-3">
            <p className="text-xs text-[#5B6882] leading-relaxed">
              Belum terdaftar bimbingan? Konsultasi gratis atau pilih program bimbingan privat & semi-privat terbaik untuk Anda.
            </p>
            <Link
              href="/#program"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#09408C] hover:underline"
            >
              <BookOpen size={14} />
              <span>Lihat Program & Pilihan Paket</span>
            </Link>
          </div>
        </div>

        {/* Back to Home & Footer info */}
        <div className="mt-6 text-center space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#5B6882] hover:text-[#09408C] transition-colors"
          >
            <ArrowLeft size={14} /> Kembali ke Beranda
          </Link>
          <p className="text-[11px] text-[#5B6882]" suppressHydrationWarning>
            &copy; {new Date().getFullYear()} Sahabat Belajar. Hak Cipta Dilindungi.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-xs text-[#5B6882]">
          Memuat portal login...
        </div>
      }
    >
      <LoginFormInner />
    </Suspense>
  );
}
