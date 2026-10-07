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
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#fef9c3] text-[#7a5900] border border-[#fef08a] mb-4">
              <Award size={14} className="text-[#7a5900]" /> Nilai Unggulan
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight font-[var(--font-heading)] leading-tight">
              Mengapa Belajar Riset di <span className="text-[#001847]">BIAS RISTEK?</span>
            </h2>
            <p className="mt-5 text-base sm:text-lg text-gray-600 leading-relaxed">
              Kami menggabungkan kurikulum praktis, bimbingan intensif 1-on-1, dan mentor bereputasi Scopus untuk memastikan setiap peserta mampu menghasilkan riset berkualitas tinggi.
            </p>

            <div className="mt-8 p-6 rounded-2xl bg-[#001847] text-white shadow-lg relative overflow-hidden">
              <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
              <div className="text-2xl font-bold text-[#fdbc13] font-display mb-1">100% Mentored</div>
              <p className="text-sm text-blue-50/90 leading-relaxed">
                Setiap draft tugas akhir atau manuskrip peserta diperiksa baris demi baris hingga siap submit ke jurnal target.
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
