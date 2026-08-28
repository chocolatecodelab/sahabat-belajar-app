import Link from "next/link";
import { BookOpen, GraduationCap, Home, User, LogOut, ArrowLeft } from "lucide-react";
import StudentHeaderProfile from "@/components/student/StudentHeaderProfile";

import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Ruang Belajar & Mentorship Riset | BIAS RISTEK",
  description: "Portal ruang belajar digital, materi modul video, review draf naskah ilmiah, dan sertifikat resmi.",
};

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-slate-50 font-[var(--font-body)] text-slate-800 flex flex-col">
      {/* Student Navigation Header */}
      <header
        className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-xs backdrop-blur-md"
        style={{
          borderTop: "3px solid var(--color-primary)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Portal Badge */}
          <div className="flex items-center gap-4">
            <Link href="/belajar" className="flex items-center gap-2.5 sm:gap-3 group">
              <img
                src="/uploads/images/bias_ristek-logo.png"
                alt="BIAS RISTEK Logo"
                className="h-9 sm:h-10 w-auto object-contain"
              />
              <span className="text-3xs font-extrabold uppercase tracking-wider text-[#001847] bg-[#fdbc13] px-2 py-0.5 rounded-md inline-block shadow-2xs border border-amber-300">
                Student LMS
              </span>
            </Link>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            <Link
              href="/kursus"
              className="text-xs font-semibold text-slate-500 hover:text-blue-900 transition-colors hidden sm:flex items-center gap-1.5"
            >
              <BookOpen size={14} />
              <span>Katalog Kelas</span>
            </Link>
          </div>

          {/* Right Action Profile & Home */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-100 transition-all flex items-center gap-1.5"
            >
              <Home size={14} />
              <span className="hidden sm:inline">Halaman Utama</span>
            </Link>

            <StudentHeaderProfile initialUser={session?.user || null} />
          </div>
        </div>
      </header>

      {/* Main Learning Space Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
