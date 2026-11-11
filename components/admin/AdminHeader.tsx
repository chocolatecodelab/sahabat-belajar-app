"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Menu, Globe, ExternalLink, GraduationCap } from "lucide-react";
import { useSession } from "next-auth/react";
import { useAdminSidebar } from "./AdminLayoutClient";

const pathLabels: Record<string, string> = {
  dashboard: "Dashboard",
  lead: "Prospek / Lead",
  siswa: "Data Siswa",
  tutor: "Direktori Tutor",
  jadwal: "Jadwal & Sesi",
  paket: "Paket & Kuota",
  pembayaran: "Pembayaran",
  honor: "Rekap Honor Tutor",
  materi: "Bank Modul & Materi",
  ujian: "Ruang Ujian & CAT",
  dokumen: "Review Dokumen",
  berita: "Artikel & Berita",
  halaman: "Halaman Statis",
  kategori: "Kategori Artikel",
  navigasi: "Menu Navigasi",
  tampilan: "Tampilan Beranda",
  notifikasi: "Notifikasi & Gateway",
  media: "Pustaka Media",
  pengaturan: "Pengaturan",
  pengguna: "Pengguna",
  role: "Role & Akses",
  menu: "Manajemen Menu",
  hero: "Hero Banner",
  layanan: "Layanan",
  keunggulan: "Keunggulan",
  statistik: "Statistik",
  testimoni: "Testimoni",
  faq: "FAQ",
  "alur-belajar": "Alur Belajar",
  "sosial-media": "Sosial Media",
  buat: "Buat Baru",
  edit: "Edit",
};

export default function AdminHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { setMobileOpen } = useAdminSidebar();

  const segments = pathname
    .split("/")
    .filter(Boolean)
    .filter((s) => s !== "dashboard" || pathname === "/dashboard");

  const breadcrumbs = segments.map((seg, i) => ({
    label: pathLabels[seg] || seg,
    isLast: i === segments.length - 1,
  }));

  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const userRole = (((session?.user as any)?.role || "") as string).toLowerCase();
  const isTutor = userRole.includes("tutor");

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-[#D5DDEB] sticky top-0 z-30 bg-white/95 backdrop-blur-md">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Button */}
        <button
          suppressHydrationWarning
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl text-[#5B6882] hover:bg-[#EAF1FA] hover:text-[#09408C] transition-colors"
          aria-label="Buka Menu Navigasi"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs sm:text-sm">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && (
                <ChevronRight
                  size={14}
                  className="text-[#5B6882]"
                />
              )}
              <span
                className={
                  crumb.isLast
                    ? "text-[#1B2A41] font-semibold font-display"
                    : "text-[#5B6882] font-normal"
                }
              >
                {crumb.label}
              </span>
            </span>
          ))}
        </nav>
      </div>

      {/* Right side: View Site, Tutor Portal & User Badge */}
      <div className="flex items-center gap-3">
        {/* Quick Back to Tutor Portal (Eliminate Dead-End Navigation for Tutors) */}
        {isTutor && (
          <Link
            href="/tutor"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#09408C] hover:bg-[#0E3571] transition-all shadow-xs ring-2 ring-[#09408C]/20"
            title="Kembali ke Ruang Kerja Portal Tutor"
          >
            <GraduationCap size={15} />
            <span>Portal Tutor</span>
          </Link>
        )}

        {/* Quick View Website Button */}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#1B2A41] bg-[#F4F7FB] border border-[#D5DDEB] hover:bg-[#EAF1FA] hover:text-[#09408C] transition-colors"
          title="Buka Website Publik di Tab Baru"
        >
          <Globe size={14} className="text-[#09408C]" />
          <span className="hidden md:inline">Lihat Website</span>
          <ExternalLink size={12} className="text-[#5B6882]" />
        </Link>

        {/* User Avatar & Info */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-[#D5DDEB]">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shadow-xs bg-[#09408C] text-white ring-2 ring-[#EAF1FA]">
            {initials || "A"}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold leading-tight text-[#1B2A41]">
              {session?.user?.name || "Administrator"}
            </p>
            <p className="text-[11px] font-medium text-[#5B6882]">
              {(session?.user as any)?.role || "Super Admin"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
