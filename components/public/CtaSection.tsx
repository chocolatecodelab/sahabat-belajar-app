import Link from "next/link";
import { MessageCircle, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

type CtaProps = {
  contactPhone?: string | null;
  contactEmail?: string | null;
};

export default function CtaSection({ contactPhone, contactEmail }: { contactPhone?: string | null; contactEmail?: string | null }) {
  const phone = contactPhone || "+62-877-7765-9482";
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const waUrl = `https://wa.me/${cleanPhone}?text=Halo%20Admin%20BIAS%20RISTEK,%20saya%20ingin%20konsultasi%20program%20kursus%20riset%20dan%20bimbingan.`;

  return (
    <section className="py-16 lg:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 p-8 sm:p-12 lg:p-16 text-white shadow-2xl overflow-hidden">
          {/* Decorative Circles */}
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400 text-blue-950 mb-6 shadow-sm">
              <Sparkles size={14} /> Konsultasi Akademik Gratis
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight font-[var(--font-heading)] leading-tight mb-6">
              Siap Menyelesaikan Riset & Menerbitkan Publikasi Impian Anda?
            </h2>

            <p className="text-base sm:text-lg text-blue-100 leading-relaxed mb-8">
              Konsultasikan topik, kendala metodologi, atau persiapan manuskrip jurnal Anda bersama tim kurikulum BIAS RISTEK sekarang juga.
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-200">
                <CheckCircle2 size={16} className="text-amber-400" /> Bimbingan 1-on-1 Bersama Mentor
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-200">
                <CheckCircle2 size={16} className="text-amber-400" /> Bedah Manuskrip Mendalam
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-200">
                <CheckCircle2 size={16} className="text-amber-400" /> Garansi Pendampingan
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-blue-950 bg-amber-400 hover:bg-amber-300 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 text-base"
              >
                <MessageCircle size={20} /> Konsultasi via WhatsApp
              </a>

              <Link
                href="/kontak"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all text-base"
              >
                Hubungi Kami <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
