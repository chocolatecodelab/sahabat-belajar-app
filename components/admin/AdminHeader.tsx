"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Menu, Globe, ExternalLink } from "lucide-react";
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
  media: "Pustaka Media",
  pengaturan: "Pengaturan",
  pengguna: "Pengguna",
  role: "Role & Akses",
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

  return (
    <header
      className="h-16 flex items-center justify-between px-4 sm:px-6 border-b sticky top-0 z-30 bg-white/95 backdrop-blur-md"
      style={{
        borderColor: "var(--color-outline-variant)",
      }}
    >
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Button */}
        <button
          suppressHydrationWarning
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Buka Menu"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb */}
        <nav className="hidden sm:flex items-center gap-1.5 text-xs sm:text-sm">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && (
                <ChevronRight
                  size={14}
                  style={{ color: "var(--color-outline)" }}
                />
              )}
              <span
                style={{
                  color: crumb.isLast
                    ? "var(--color-on-surface)"
                    : "var(--color-outline)",
                  fontWeight: crumb.isLast ? 600 : 400,
                }}
              >
                {crumb.label}
              </span>
            </span>
          ))}
        </nav>
      </div>

      {/* Right side: View Site & User Badge */}
      <div className="flex items-center gap-3">
        {/* Quick View Website Button */}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          title="Buka Website Publik di Tab Baru"
        >
          <Globe size={14} className="text-blue-900" />
          <span className="hidden md:inline">Lihat Website</span>
          <ExternalLink size={12} className="text-gray-400" />
        </Link>

        {/* User Avatar & Info */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-gray-200">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shadow-xs"
            style={{
              background: "var(--color-primary)",
              color: "#ffffff",
            }}
          >
            {initials || "A"}
          </div>
          <div className="hidden sm:block text-left">
            <p
              className="text-xs font-bold leading-tight"
              style={{ color: "var(--color-on-surface)" }}
            >
              {session?.user?.name || "Administrator"}
            </p>
            <p
              className="text-[11px] font-medium"
              style={{ color: "var(--color-outline)" }}
            >
              {(session?.user as any)?.role || "Super Admin"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
