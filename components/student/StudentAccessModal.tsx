"use client";

import { useState } from "react";
import { LogIn, Sparkles, Mail, Phone, ArrowRight, ShieldCheck, X } from "lucide-react";
import { verifyStudentAccess, type EnrolledCourseItem } from "@/actions/belajar";

interface StudentAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: { studentName: string; studentEmail: string; courses: EnrolledCourseItem[] }) => void;
}

export default function StudentAccessModal({ isOpen, onClose, onSuccess }: StudentAccessModalProps) {
  const [identifier, setIdentifier] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await verifyStudentAccess(identifier);
      if (res.success && res.data) {
        // Save student session to localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "bias_student_session",
            JSON.stringify({
              name: res.data.studentName,
              email: res.data.studentEmail,
            })
          );
        }
        onSuccess(res.data);
        onClose();
      } else {
        setErrorMsg(res.message || "Email / Nomor WhatsApp tidak ditemukan pada daftar kelas aktif.");
      }
    } catch {
      setErrorMsg("Terjadi kendala saat memeriksa akses. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto text-white shadow-sm"
            style={{ background: "var(--color-primary)" }}
          >
            <ShieldCheck size={26} />
          </div>
          <h2 className="text-lg font-bold font-[var(--font-heading)] text-slate-900">
            Akses Cepat Ruang Belajar
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Masukkan <strong>Email</strong> atau <strong>Nomor WhatsApp</strong> yang Anda gunakan saat mendaftar kelas.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email / No. WhatsApp Terdaftar
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="contoh: nama@email.com atau 08123456789"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)] placeholder:text-slate-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl text-xs font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all hover:opacity-95 disabled:opacity-50"
            style={{ background: "var(--color-primary)" }}
          >
            {isLoading ? (
              <span>Memeriksa Hak Akses...</span>
            ) : (
              <>
                <span>Masuk ke Kelas Saya</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-3xs text-slate-400 flex items-center justify-center gap-1.5">
            <Sparkles size={13} className="text-[#fdbc13]" />
            <span>Akses instan otomatis tanpa perlu mengingat password</span>
          </p>
        </div>
      </div>
    </div>
  );
}
