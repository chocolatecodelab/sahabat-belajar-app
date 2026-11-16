"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, Tag, MessageCircle, ArrowRight } from "lucide-react";
import { DEFAULT_SITE_CONFIG, getWhatsAppUrl } from "@/lib/site-config";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  isActive?: boolean;
};

export default function FaqSection({ faqs }: { faqs: FaqItem[] }) {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id || null);

  const activeFaqs = (faqs || []).filter((f) => f.isActive !== false);

  if (activeFaqs.length === 0) return null;

  const categories = Array.from(
    new Set(activeFaqs.map((f) => f.category || "Umum"))
  );

  const displayedFaqs = activeFaqs.filter((f) => {
    if (selectedCategory === "ALL") return true;
    return f.category === selectedCategory;
  });

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  const waUrl = getWhatsAppUrl(
    DEFAULT_SITE_CONFIG.officialPhone,
    "Halo Sahabat Belajar, saya ingin bertanya lebih lanjut seputar program bimbingan belajar."
  );

  return (
    <section className="py-16 sm:py-24 bg-[#F4F7FB] relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF1FA] border border-[#9AC1E2] text-xs font-bold text-[#09408C] mb-3">
            <span className="brand-dots">
              <span></span>
              <span></span>
              <span></span>
            </span>
            <span>Tanya Jawab Bimbingan Belajar</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#09408C] tracking-tight font-display">
            Pertanyaan yang Sering Diajukan (FAQ)
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#5B6882] max-w-2xl mx-auto leading-relaxed">
            Temukan informasi lengkap seputar mekanisme bimbingan privat, pemilihan jadwal, kurikulum materi, serta proteksi kuota pertemuan Anda.
          </p>

          {/* Category Filter Pills */}
          {categories.length > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
              <button
                type="button"
                onClick={() => setSelectedCategory("ALL")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedCategory === "ALL"
                    ? "bg-[#09408C] text-white shadow-2xs"
                    : "bg-white text-[#5B6882] border border-[#D5DDEB] hover:bg-[#EAF1FA] hover:text-[#09408C]"
                }`}
              >
                Semua Topik ({activeFaqs.length})
              </button>
              {categories.map((cat) => {
                const count = activeFaqs.filter((f) => f.category === cat).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                      selectedCategory === cat
                        ? "bg-[#09408C] text-white shadow-2xs"
                        : "bg-white text-[#5B6882] border border-[#D5DDEB] hover:bg-[#EAF1FA] hover:text-[#09408C]"
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Accordion Cards */}
        <div className="space-y-3">
          {displayedFaqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs ${
                  isOpen ? "border-[#09408C] ring-1 ring-[#09408C]/15" : "border-[#D5DDEB] hover:border-[#9AC1E2]"
                }`}
              >
                <button
                  id={`faq-btn-${faq.id}`}
                  onClick={() => toggle(faq.id)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${faq.id}`}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 font-bold text-[#1B2A41] hover:text-[#09408C] transition-colors focus:outline-hidden"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm sm:text-base font-display">{faq.question}</span>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`text-[#5B6882] shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-[#09408C]" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div
                    id={`faq-answer-${faq.id}`}
                    role="region"
                    aria-labelledby={`faq-btn-${faq.id}`}
                    className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0 text-[#5B6882] text-xs sm:text-sm leading-relaxed border-t border-[#D5DDEB]/60"
                  >
                    <p className="pt-3">{faq.answer}</p>
                    {faq.category && (
                      <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#EAF1FA] text-[#09408C] text-[11px] font-semibold">
                        <Tag size={11} />
                        <span>Kategori: {faq.category}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* WhatsApp Help CTA Card */}
        <div className="mt-8 bg-white rounded-2xl border border-[#D5DDEB] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E3F4EC] text-[#1F6F4A] flex items-center justify-center shrink-0">
              <MessageCircle size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#1B2A41]">Masih Memiliki Pertanyaan Lain?</h4>
              <p className="text-xs text-[#5B6882] mt-0.5">
                Konsultan akademik Sahabat Belajar siap membantu memberikan rekomendasi paket terbaik untuk putra/putri Anda.
              </p>
            </div>
          </div>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1F6F4A] hover:bg-[#18573A] text-white text-xs font-bold transition-colors shadow-2xs shrink-0"
          >
            <span>Tanya via WhatsApp</span>
            <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
