import { Star, Trophy, Building2, Quote } from "lucide-react";

type Testimonial = {
  id: string;
  name: string;
  role: string;
  institution: string | null;
  content: string;
  avatar: string | null;
  rating: number;
  achievement: string | null;
};

export default function TestimonialSection({ testimonials }: { testimonials: Testimonial[] }) {
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="py-20 lg:py-28 bg-slate-900 text-white relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-800/80 text-blue-200 mb-4 border border-blue-700">
            <Trophy size={14} className="text-amber-400" /> Cerita Sukses Alumni
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-[var(--font-heading)]">
            Apa Kata Mereka yang Sudah Terbimbing?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            Kisah nyata dari mahasiswa S1/S2/S3, dosen, dan peneliti yang berhasil menembus publikasi jurnal internasional dan menyelesaikan tugas akhir.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((item, idx) => (
            <div
              key={item.id || idx}
              className="bg-slate-800/80 rounded-3xl p-8 border border-slate-700/80 flex flex-col justify-between hover:border-blue-500/50 hover:bg-slate-800 transition-all duration-300 relative group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: item.rating || 5 }).map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <Quote size={24} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
                </div>

                {item.achievement && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/10 text-amber-300 border border-amber-400/30 mb-4">
                    <Trophy size={12} className="text-amber-400" />
                    {item.achievement}
                  </div>
                )}

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed italic mb-8">
                  &ldquo;{item.content}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-slate-700 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#0b2c6b] to-[#001847] text-white flex items-center justify-center font-bold text-sm shadow-md border border-blue-400/20">
                  {item.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-xs text-slate-400">{item.role}</p>
                  {item.institution && (
                    <p className="text-2xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Building2 size={11} /> {item.institution}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
