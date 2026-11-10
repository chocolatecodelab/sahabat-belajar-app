import Link from "next/link";
import { MessageCircle, ArrowRight, CheckCircle2, GraduationCap } from "lucide-react";

export default function CtaSection({
  contactPhone,
  contactEmail,
}: {
  contactPhone?: string | null;
  contactEmail?: string | null;
}) {
  const phone = contactPhone || "628123456789";
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    "Halo Sahabat Belajar, saya ingin konsultasi program bimbingan belajar untuk persiapan akademik dan tes."
  )}`;

  return (
    <section className="py-16 lg:py-24 bg-[#F4F7FB] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-br from-[#09408C] via-[#0E3571] to-[#0A2650] border border-[#295897] p-8 sm:p-12 lg:p-16 text-white shadow-xl overflow-hidden">
          {/* Subtle Ambient Light */}
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-[#0CC0DF]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 bg-[#9AC1E2]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            {/* Tagar & Badge Brand */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/15 text-[#9AC1E2] border border-white/20">
                <GraduationCap size={13} className="text-[#9AC1E2]" />
                #BersamaSahabat
              </span>
              <span className="text-xs text-blue-200 font-medium">
                Comprehensive Academic Solution
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display leading-tight mb-4 text-white">
              Paham Konsep Dasar hingga Siap Berprestasi Bersama Sahabat Belajar
            </h2>

            <p className="text-sm sm:text-base text-blue-100 leading-relaxed mb-8">
              Mulai langkah sukses bimbingan belajar K-12, persiapan intensif UTBK-SNBT, SKD CPNS & Kedinasan, hingga pendampingan TOEFL & beasiswa pascasarjana bersama tutor pakar kami.
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-100 font-medium">
                <CheckCircle2 size={16} className="text-[#0CC0DF] shrink-0" />
                <span>Bimbingan Privat & Semi-Privat (Maks 5 Siswa)</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-100 font-medium">
                <CheckCircle2 size={16} className="text-[#0CC0DF] shrink-0" />
                <span>Online Zoom/Meet & Home Visit ke Rumah</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-100 font-medium">
                <CheckCircle2 size={16} className="text-[#0CC0DF] shrink-0" />
                <span>Monitoring Sisa Kuota & Jurnal Belajar Rutin</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3.5">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-[#09408C] bg-white hover:bg-[#EAF1FA] shadow-md hover:shadow-lg transition-all text-sm"
              >
                <MessageCircle size={18} className="text-[#09408C]" />
                <span>Konsultasi Belajar via WhatsApp</span>
              </a>

              <Link
                href="/placement-test"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all text-sm"
              >
                <span>Ikuti Placement Test Gratis</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
