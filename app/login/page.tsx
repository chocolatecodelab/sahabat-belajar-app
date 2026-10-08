"use client";

import { useState, Suspense } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LogIn, AlertCircle, BookOpen, Info } from "lucide-react";

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
        const userRole = (session?.user as any)?.role || "Student";
        const isStaff = [
          "Super Admin",
          "Admin",
          "Editor",
          "Tutor",
          "Mentor",
          "Reviewer",
        ].includes(userRole);

        // Security Hardening (QA-SEC-01): Sanitize callbackUrl to prevent Phishing Open Redirect
        const isSafeCallback =
          typeof callbackUrl === "string" &&
          callbackUrl.startsWith("/") &&
          !callbackUrl.startsWith("//") &&
          !callbackUrl.startsWith("/\\") &&
          !callbackUrl.includes("/login") &&
          !/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(callbackUrl);

        if (isSafeCallback) {
          // If a non-staff student attempts to access /dashboard, redirect to student LMS /belajar
          if (!isStaff && callbackUrl.startsWith("/dashboard")) {
            router.push("/belajar");
          } else {
            router.push(callbackUrl);
          }
        } else if (isStaff) {
          router.push("/dashboard");
        } else {
          router.push("/belajar");
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
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] px-4 py-12">
      {/* Background ambient accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-[0.04]"
          style={{ background: "var(--color-primary)" }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-[0.03]"
          style={{ background: "var(--color-secondary-container)" }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center bg-white px-5 py-3 rounded-2xl shadow-md border border-slate-100 mb-4 transition-transform hover:scale-105">
            <img
              src="/uploads/images/bias_ristek-logo.png"
              alt="BIAS RISTEK"
              className="h-12 sm:h-14 w-auto object-contain"
            />
          </Link>
          <h1
            className="text-2xl font-bold font-[var(--font-heading)]"
            style={{ color: "var(--color-primary)" }}
          >
            Portal Masuk BIAS RISTEK
          </h1>
          <p className="text-body-md mt-1 text-slate-500">
            Akses Ruang Belajar & Dashboard Mentorship
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2
              className="text-lg font-bold text-slate-900 font-[var(--font-heading)]"
            >
              Masuk ke Akun Anda
            </h2>
            <span className="text-3xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              Terpadu
            </span>
          </div>

          {error && (
            <div
              className="flex items-start gap-2.5 p-3.5 rounded-xl mb-5 text-xs"
              style={{
                background: "var(--color-error-container)",
                color: "var(--color-on-error-container)",
              }}
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="text-2xs font-bold uppercase tracking-wider block mb-1.5 text-slate-700"
              >
                Email Akun Terdaftar
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="peserta@gmail.com atau admin@biasristek.id"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs text-slate-900 transition-all focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)] placeholder:text-slate-400"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="text-2xs font-bold uppercase tracking-wider text-slate-700"
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
                  placeholder="Masukkan password akun Anda"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs text-slate-900 transition-all focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)] placeholder:text-slate-400 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-3xs text-slate-500 mt-1.5 flex items-center gap-1.5">
                <Info size={12} className="text-slate-400 shrink-0" />
                <span>Bagi peserta baru, kata sandi awal adalah nomor WhatsApp yang didaftarkan.</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-xs text-white shadow-md flex items-center justify-center gap-2 transition-all hover:opacity-95 disabled:opacity-50 mt-2"
              style={{ background: "var(--color-primary)" }}
            >
              {loading ? (
                <span>Memverifikasi Akun...</span>
              ) : (
                <>
                  <LogIn size={15} />
                  <span>Masuk Sekarang</span>
                </>
              )}
            </button>
          </form>

          {/* Student Purchase Footnote */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center space-y-3">
            <p className="text-3xs text-slate-500 leading-relaxed">
              Belum mendaftar kelas riset? Pilih program bimbingan dan akun Anda akan dibuatkan otomatis setelah pembayaran diverifikasi.
            </p>
            <Link
              href="/kursus"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 hover:underline"
            >
              <BookOpen size={13} />
              <span>Jelajahi Katalog Program Kursus</span>
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center">
          <p className="text-3xs text-slate-400">
            &copy; {new Date().getFullYear()} BIAS RISTEK. Hak Cipta Dilindungi.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-slate-400">Memuat portal login...</div>}>
      <LoginFormInner />
    </Suspense>
  );
}
