"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
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
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email atau password salah");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan, silakan coba lagi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] px-4">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-[0.03]"
          style={{ background: "var(--color-primary)" }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-[0.02]"
          style={{ background: "var(--color-secondary-container)" }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-white px-5 py-3 rounded-2xl shadow-md border border-gray-100 mb-4">
            <img
              src="/uploads/images/bias_ristek-logo.png"
              alt="BIAS RISTEK"
              className="h-12 sm:h-14 w-auto object-contain"
            />
          </div>
          <h1
            className="text-2xl font-bold font-[var(--font-heading)]"
            style={{ color: "var(--color-primary)" }}
          >
            Admin Portal
          </h1>
          <p
            className="text-body-md mt-1 text-gray-500"
          >
            Content Management System
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
          <h2
            className="text-headline-md mb-6 font-bold"
            style={{ color: "var(--color-on-surface)" }}
          >
            Masuk ke Dashboard
          </h2>

          {error && (
            <div
              className="flex items-center gap-2 p-3 rounded-lg mb-4 text-body-sm"
              style={{
                background: "var(--color-error-container)",
                color: "var(--color-on-error-container)",
              }}
            >
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="text-label-lg block mb-2"
                style={{ color: "var(--color-on-surface-variant)" }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@biasristek.id"
                required
                className="w-full px-4 py-3 rounded-lg border text-body-md transition-all focus-ring"
                style={{
                  borderColor: "var(--color-outline-variant)",
                  color: "var(--color-on-surface)",
                  background: "var(--color-surface-container-lowest)",
                }}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-label-lg block mb-2"
                style={{ color: "var(--color-on-surface-variant)" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-lg border text-body-md transition-all focus-ring pr-12"
                  style={{
                    borderColor: "var(--color-outline-variant)",
                    color: "var(--color-on-surface)",
                    background: "var(--color-surface-container-lowest)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors hover:bg-black/5"
                  style={{ color: "var(--color-outline)" }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg text-label-lg transition-all disabled:opacity-60"
              style={{
                background: "var(--color-primary)",
                color: "var(--color-on-primary)",
              }}
              onMouseEnter={(e) => {
                if (!loading)
                  e.currentTarget.style.background =
                    "var(--color-primary-container)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--color-primary)";
              }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={18} />
                  Masuk
                </>
              )}
            </button>
          </form>
        </div>

        <p
          className="text-center text-label-md mt-6"
          style={{ color: "var(--color-outline)" }}
        >
          © 2026 BIAS RISTEK. All rights reserved.
        </p>
      </div>
    </div>
  );
}
