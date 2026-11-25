"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  X,
  Phone,
  LogIn,
  Target,
  BookOpen,
  GraduationCap,
  CreditCard,
  MessageSquare,
  ArrowRight,
  Info,
} from "lucide-react";
import { DEFAULT_SITE_CONFIG, getWhatsAppUrl } from "@/lib/site-config";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const waUrl = getWhatsAppUrl(
    DEFAULT_SITE_CONFIG.officialPhone,
    "Halo Sahabat Belajar, saya tertarik untuk konsultasi program bimbingan belajar."
  );

  const navLinks = [
    { href: "/", label: "Beranda", icon: BookOpen },
    { href: "/#tentang", label: "Tentang Kami", icon: Info },
    { href: "/#program", label: "Program", icon: BookOpen },
    { href: "/#tutor", label: "Tutor Pakar", icon: GraduationCap },
    { href: "/#paket", label: "Pilihan Paket", icon: CreditCard },
    { href: "/#testimoni", label: "Testimoni", icon: MessageSquare },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#D5DDEB] shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20 gap-2 sm:gap-4">
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0 group min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white p-0.5 flex items-center justify-center shadow-xs border border-[#D5DDEB] group-hover:border-[#9AC1E2] transition-colors shrink-0">
              <Image
                src="/images/logo-sahabat-belajar.png"
                alt="Logo Sahabat Belajar"
                width={44}
                height={44}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-heading font-bold text-sm sm:text-lg text-[#09408C] tracking-tight leading-tight whitespace-nowrap">
                Sahabat Belajar
              </span>
              <span className="text-[9px] sm:text-[11px] text-[#295897] font-bold tracking-wider uppercase whitespace-nowrap">
                Bimbingan Belajar
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links (Visible on lg: 1024px+) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-2.5 xl:px-3 py-1.5 rounded-xl text-xs xl:text-sm font-semibold text-[#5B6882] hover:text-[#09408C] hover:bg-[#EAF1FA] transition-colors whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Action Buttons & Mobile Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Placement Test Quick CTA */}
            <Link
              href="/placement-test"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#EAF1FA] text-[#09408C] text-xs font-bold border border-[#9AC1E2] hover:bg-[#9AC1E2]/30 transition-all whitespace-nowrap shadow-2xs"
            >
              <Target size={14} className="text-[#09408C] shrink-0" />
              <span>Placement Test</span>
            </Link>

            {/* WhatsApp Consultation Primary CTA */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-xl bg-[#09408C] hover:bg-[#0E3571] text-white text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap shadow-xs"
            >
              <Phone size={13} className="shrink-0" />
              <span className="sm:hidden">Konsultasi</span>
              <span className="hidden sm:inline">Konsultasi WA</span>
            </a>

            {/* Portal Login Button */}
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#D5DDEB] text-xs font-semibold text-[#09408C] hover:bg-[#EAF1FA] transition-all whitespace-nowrap"
            >
              <LogIn size={13} className="shrink-0" />
              <span>Portal</span>
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-[#5B6882] hover:text-[#09408C] hover:bg-[#F4F7FB] transition-colors"
              aria-label="Toggle navigation"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-drawer"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu (Visible when open) */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          className="lg:hidden border-t border-[#D5DDEB] bg-white p-4 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200"
        >
          {/* Quick Placement Banner in Mobile Menu */}
          <Link
            href="/placement-test"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between p-3 rounded-2xl text-xs font-bold text-[#09408C] bg-[#EAF1FA] border border-[#9AC1E2] hover:bg-[#9AC1E2]/20 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Target size={16} className="text-[#09408C]" />
              <span>Ikuti Placement Test Gratis</span>
            </span>
            <span className="text-[10px] font-bold uppercase bg-[#09408C] text-white px-2.5 py-0.5 rounded-full">
              10 Menit
            </span>
          </Link>

          {/* Navigation Items */}
          <div className="space-y-1 pt-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#1B2A41] hover:bg-[#F4F7FB] hover:text-[#09408C] transition-colors"
                >
                  <Icon size={16} className="text-[#5B6882] shrink-0" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile Bottom Actions */}
          <div className="pt-2 border-t border-[#D5DDEB] flex flex-col gap-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#09408C] hover:bg-[#0E3571] text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Phone size={14} />
              <span>Konsultasi via WhatsApp</span>
            </a>

            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl border border-[#D5DDEB] text-xs font-semibold text-[#09408C] hover:bg-[#EAF1FA] transition-colors"
            >
              <LogIn size={14} />
              <span>Masuk ke Portal Siswa / Tutor</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
