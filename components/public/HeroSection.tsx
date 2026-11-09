"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

type Slide = {
  id: string;
  title: string;
  subtitle: string | null;
  backgroundImage: string;
  ctaText: string | null;
  ctaLink: string | null;
};

export default function HeroSection({ slides }: { slides: Slide[] }) {
  const [current, setCurrent] = useState(0);

  // Auto rotate slides every 6 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) {
    // Default fallback banner
    return (
      <section className="relative bg-[#001847] border-b border-[#0b2c6b] text-white py-28 px-4">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest px-3.5 py-1.5 rounded-full"
            style={{
              background: "var(--color-secondary-container)",
              color: "var(--color-on-secondary-container)",
            }}
          >
            Badan Inovasi Akademik & Sains
          </span>
          <h1 className="text-display-lg max-w-4xl mx-auto leading-tight font-extrabold">
            Pusat Unggulan Riset, Laboratorium & Inovasi Teknologi
          </h1>
          <p className="text-body-lg text-gray-300 max-w-2xl mx-auto">
            Menyediakan fasilitas riset terpadu, layanan pengujian sampel terakreditasi ISO 17025, dan pembinaan talenta inovasi.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link
              href="/#layanan"
              className="px-6 py-3 rounded-xl font-semibold text-white transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              style={{ background: "var(--color-primary-container)" }}
            >
              Jelajahi Layanan <ArrowRight size={16} />
            </Link>
            <Link
              href="/berita"
              className="px-6 py-3 rounded-xl font-semibold bg-white/10 hover:bg-white/20 text-white transition-all"
            >
              Lihat Berita Terbaru
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="relative w-full h-[520px] sm:h-[580px] lg:h-[640px] overflow-hidden bg-gray-950">
      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === current ? "opacity-100 z-10 pointer-events-auto visible" : "opacity-0 z-0 pointer-events-none invisible"
          }`}
          aria-hidden={idx !== current}
        >
          {/* Background Image */}
          <img
            src={slide.backgroundImage}
            alt={slide.title}
            className="w-full h-full object-cover"
          />

          {/* Gradient Overlay for Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />

          {/* Content Container */}
          <div className="absolute inset-0 flex items-center pt-8 sm:pt-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-2xl text-white space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <span
                  className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#EAF1FA] text-[#09408C]"
                >
                  Sahabat Belajar
                </span>

                <h1 className="text-display-md sm:text-display-lg font-extrabold text-white leading-tight drop-shadow-md">
                  {slide.title}
                </h1>

                {slide.subtitle && (
                  <p className="text-body-lg text-gray-200 leading-relaxed drop-shadow">
                    {slide.subtitle}
                  </p>
                )}

                {slide.ctaText && slide.ctaLink && (
                  <div className="pt-3">
                    <Link
                      href={slide.ctaLink}
                      className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-white transition-all shadow-lg hover:shadow-xl hover:scale-105"
                      style={{ background: "var(--color-primary-container)" }}
                    >
                      <span>{slide.ctaText}</span>
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight size={24} />
          </button>

          {/* Dot Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2.5 rounded-full transition-all ${
                  i === current ? "w-8 bg-[var(--color-secondary-container)]" : "w-2.5 bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
