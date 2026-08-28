"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { User, LogOut, LogIn, ChevronDown } from "lucide-react";

interface StudentHeaderProfileProps {
  initialUser?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
}

export default function StudentHeaderProfile({ initialUser }: StudentHeaderProfileProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!initialUser) {
    return (
      <Link
        href="/login?callbackUrl=/belajar"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 text-xs font-bold text-blue-900 hover:bg-blue-100 transition-colors"
      >
        <LogIn size={14} />
        <span>Masuk Akun</span>
      </Link>
    );
  }

  const initial = initialUser.name ? initialUser.name.charAt(0).toUpperCase() : "P";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 pl-2 border-l border-slate-200 hover:opacity-90 transition-opacity text-left cursor-pointer"
        title="Pengaturan Akun Siswa"
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0"
          style={{ background: "var(--color-primary)" }}
        >
          {initial}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-xs font-bold text-slate-900 leading-none truncate max-w-[120px]">
            {initialUser.name || "Peserta Riset"}
          </p>
          <p className="text-3xs text-emerald-700 font-semibold leading-none mt-0.5">
            Akun Aktif
          </p>
        </div>
        <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-11 z-50 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl p-3 space-y-2 animate-in fade-in-50 zoom-in-95">
            <div className="px-2 py-1.5 border-b border-slate-100">
              <p className="text-xs font-bold text-slate-900 truncate">{initialUser.name}</p>
              <p className="text-3xs text-slate-500 truncate">{initialUser.email}</p>
            </div>

            <Link
              href="/belajar"
              onClick={() => setIsOpen(false)}
              className="w-full px-2.5 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
            >
              <User size={14} className="text-blue-900" />
              <span>Ruang Belajar Saya</span>
            </Link>

            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full px-2.5 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              <span>Keluar Akun</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
