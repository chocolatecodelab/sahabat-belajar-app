"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown, ExternalLink } from "lucide-react";

type NavItem = {
  id: string;
  label: string;
  type: string;
  url: string | null;
  page?: { title: string; slug: string } | null;
  category?: { name: string; slug: string } | null;
  openInNewTab: boolean;
  children?: NavItem[];
};

interface NavbarProps {
  siteName: string;
  navigations: NavItem[];
}

export default function Navbar({ siteName, navigations }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const getHref = (item: NavItem) => {
    if (item.type === "PAGE" && item.page) return `/${item.page.slug}`;
    if (item.type === "CATEGORY" && item.category) return `/kategori/${item.category.slug}`;
    return item.url || "#";
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/uploads/images/bias_ristek-logo.png"
              alt="BIAS RISTEK"
              className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              href="/"
              className="px-3.5 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-900 hover:bg-gray-50 transition-colors"
            >
              Beranda
            </Link>

            {navigations.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const href = getHref(item);

              if (hasChildren) {
                return (
                  <div
                    key={item.id}
                    className="relative group"
                    onMouseEnter={() => setOpenDropdown(item.id)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <button
                      className="flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-900 hover:bg-gray-50 transition-colors"
                    >
                      {item.label}
                      <ChevronDown size={14} className="transition-transform group-hover:rotate-180" />
                    </button>

                    {openDropdown === item.id && (
                      <div className="absolute left-0 mt-1 w-56 rounded-xl bg-white shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-150">
                        {item.children?.map((child) => (
                          <Link
                            key={child.id}
                            href={getHref(child)}
                            target={child.openInNewTab ? "_blank" : undefined}
                            rel={child.openInNewTab ? "noopener noreferrer" : undefined}
                            className="flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-900 transition-colors"
                          >
                            <span>{child.label}</span>
                            {child.openInNewTab && <ExternalLink size={12} className="text-gray-400" />}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.id}
                  href={href}
                  target={item.openInNewTab ? "_blank" : undefined}
                  rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                  className="px-3.5 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-900 hover:bg-gray-50 transition-colors"
                >
                  {item.label}
                </Link>
              );
            })}

            <Link
              href="/kursus"
              className="px-3.5 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-900 hover:bg-gray-50 transition-colors"
            >
              Program Kursus
            </Link>

            <Link
              href="/belajar"
              className="px-3.5 py-2 rounded-lg text-sm font-semibold text-blue-950 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 transition-colors flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-[#fdbc13]" />
              <span>Ruang Belajar</span>
            </Link>

            <Link
              href="/berita"
              className="px-3.5 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-900 hover:bg-gray-50 transition-colors"
            >
              Berita
            </Link>

            <Link
              href="/login"
              className="ml-3 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-xs transition-all hover:opacity-90 hover:shadow-md"
              style={{ background: "var(--color-primary)" }}
            >
              Portal Admin
            </Link>
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-6 space-y-1 shadow-lg">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50"
          >
            Beranda
          </Link>

          <Link
            href="/kursus"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50"
          >
            Program Kursus
          </Link>

          <Link
            href="/belajar"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-blue-950 bg-amber-50 hover:bg-amber-100"
          >
            🎓 Ruang Belajar Siswa
          </Link>

          {navigations.map((item) => (
            <div key={item.id}>
              <Link
                href={getHref(item)}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-gray-800 hover:bg-gray-50"
              >
                {item.label}
              </Link>
              {item.children && item.children.length > 0 && (
                <div className="pl-4 space-y-1 border-l-2 border-gray-100 ml-3 my-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.id}
                      href={getHref(child)}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          <Link
            href="/berita"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-gray-800 hover:bg-gray-50"
          >
            Berita
          </Link>

          <div className="pt-3 border-t border-gray-100">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center py-2.5 rounded-lg text-sm font-semibold text-white shadow-xs"
              style={{ background: "var(--color-primary)" }}
            >
              Portal Admin
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
