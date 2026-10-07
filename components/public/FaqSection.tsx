"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, Tag } from "lucide-react";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category: string | null;
};

export default function FaqSection({ faqs }: { faqs: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id || null);

  if (!faqs || faqs.length === 0) return null;

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="py-20 lg:py-28 bg-slate-50 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-900 mb-4">
            <HelpCircle size={14} /> Tanya Jawab Kursus
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight font-[var(--font-heading)]">
            Pertanyaan yang Sering Diajukan (FAQ)
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-600">
            Temukan jawaban cepat seputar kurikulum, mekanisme bimbingan privat, dan sertifikat pelatihan.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden transition-all duration-200 shadow-xs"
              >
                <button
                  id={`faq-btn-${faq.id}`}
                  onClick={() => toggle(faq.id)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${faq.id}`}
                  className="w-full text-left p-6 flex items-center justify-between gap-4 font-bold text-gray-900 hover:text-blue-900 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base sm:text-lg">{faq.question}</span>
                  </div>
                  <ChevronDown
                    size={20}
                    className={`text-gray-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-blue-900" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div
                    id={`faq-answer-${faq.id}`}
                    role="region"
                    aria-labelledby={`faq-btn-${faq.id}`}
                    className="px-6 pb-6 pt-0 text-gray-600 text-sm sm:text-base leading-relaxed border-t border-gray-50 mt-1 animate-fade-in"
                  >
                    <p className="pt-3">{faq.answer}</p>
                    {faq.category && (
                      <div className="mt-3 flex items-center gap-1 text-2xs text-blue-800 font-semibold">
                        <Tag size={10} /> Kategori: {faq.category}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
