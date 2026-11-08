"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown, ExternalLink, Phone, LogIn } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const waUrl =
    "https://wa.me/628123456789?text=Halo%20Sahabat%20Belajar%2C%20saya%20tertarik%20untuk%20konsultasi%20program%20bimbingan%20belajar.";

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#D5DDEB] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-[#09408C] text-white flex items-center justify-center font-bold text-lg shadow-xs group-hover:bg-[#0E3571] transition-colors">
              SB
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-[#09408C] tracking-tight leading-tight font-display">
                Sahabat Belajar
              </span>
              <span className="text-[11px] text-[#295897] font-semibold tracking-wider uppercase">
                Bimbingan Belajar
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5">
            <Link
              href="/"
              className="px-3.5 py-2 rounded-xl text-sm font-semibold text-[#1B2A41] hover:text-[#09408C] hover:bg-[#EAF1FA] transition-colors"
            >
              Home
            </Link>
            <a
              href="#tentang"
              className="px-3.5 py-2 rounded-xl text-sm font-semibold text-[#5B6882] hover:text-[#09408C] hover:bg-[#EAF1FA] transition-colors"
            >
              About Us
            </a>
            <a
              href="#program"
              className="px-3.5 py-2 rounded-xl text-sm font-semibold text-[#5B6882] hover:text-[#09408C] hover:bg-[#EAF1FA] transition-colors"
            >
              Programs
            </a>
            <a
              href="#paket"
              className="px-3.5 py-2 rounded-xl text-sm font-semibold text-[#5B6882] hover:text-[#09408C] hover:bg-[#EAF1FA] transition-colors"
            >
              Paket Belajar
            </a>
            <a
              href="#kontak"
              className="px-3.5 py-2 rounded-xl text-sm font-semibold text-[#5B6882] hover:text-[#09408C] hover:bg-[#EAF1FA] transition-colors"
            >
              Contact
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571] transition-colors shadow-xs"
            >
              <Phone size={14} />
              <span>Konsultasi WhatsApp</span>
            </a>

            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#D5DDEB] text-xs font-semibold text-[#09408C] hover:bg-[#EAF1FA] transition-colors"
            >
              <LogIn size={14} />
              <span>Login Portal</span>
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-[#5B6882] hover:bg-[#F4F7FB]"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#D5DDEB] bg-white p-4 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#1B2A41]"
          >
            Home
          </Link>
          <a
            href="#tentang"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#5B6882]"
          >
            About Us
          </a>
          <a
            href="#program"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#5B6882]"
          >
            Programs
          </a>
          <a
            href="#paket"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#5B6882]"
          >
            Paket Belajar
          </a>
          <a
            href="#kontak"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-[#5B6882]"
          >
            Contact
          </a>

          <div className="pt-2 border-t border-[#D5DDEB] flex flex-col gap-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#09408C] text-white text-xs font-semibold"
            >
              <Phone size={14} />
              <span>Konsultasi via WhatsApp</span>
            </a>
            <Link
              href="/login"
              className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl border border-[#D5DDEB] text-xs font-semibold text-[#09408C]"
            >
              <LogIn size={14} />
              <span>Login Portal</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
