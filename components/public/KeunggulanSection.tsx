import { CheckCircle2, Clock, Users, BookOpen, Award, Shield, GraduationCap } from "lucide-react";

type Advantage = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

const ICON_MAP: Record<string, any> = {
  CheckCircle2,
  Clock,
  Users,
  BookOpen,
  Award,
  Shield,
  GraduationCap,
};

export default function KeunggulanSection({ advantages }: { advantages: Advantage[] }) {
  if (!advantages || advantages.length === 0) return null;

  return (
    <section className="py-20 lg:py-28 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Heading & Highlight */}
          <div className="lg:col-span-5">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#EAF1FA] text-[#09408C] border border-[#9AC1E2] mb-4">
              <Award size={14} className="text-[#09408C]" /> Nilai Unggulan
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1B2A41] tracking-tight font-display leading-tight">
              Mengapa Memilih Belajar di <span className="text-[#09408C]">Sahabat Belajar?</span>
            </h2>
            <p className="mt-5 text-base sm:text-lg text-[#5B6882] leading-relaxed">
              Kami memadukan pendekatan personal bersahabat, pemahaman konsep dasar mendalam, dan tutor pakar untuk memastikan setiap siswa siap meraih prestasi akademik dan impian karirnya.
            </p>

            <div className="mt-8 p-6 rounded-2xl bg-[#09408C] text-white shadow-lg relative overflow-hidden">
              <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
              <div className="text-2xl font-bold text-[#0CC0DF] font-display mb-1">100% Terbimbing & Terpantau</div>
              <p className="text-sm text-blue-50/90 leading-relaxed">
                Setiap sesi bimbingan 90 menit tercatat rapi di jurnal belajar, dilengkapi evaluasi pemahaman siswa dan laporan berkala untuk orang tua.
              </p>
            </div>
          </div>

          {/* Right Column: Grid Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {advantages.map((item, idx) => {
              const IconComp = ICON_MAP[item.icon] || CheckCircle2;
              return (
                <div
                  key={item.id || idx}
                  className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 transition-all duration-200 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-white text-blue-900 flex items-center justify-center mb-4 shadow-xs border border-gray-100 group-hover:scale-110 transition-transform">
                    <IconComp size={24} className="text-blue-900" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-900 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
