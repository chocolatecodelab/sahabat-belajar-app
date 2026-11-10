import { Compass, Video, FileEdit, Send, Award, CheckCircle2, ArrowRight } from "lucide-react";

type LearningStep = {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  icon?: string | null;
};

const ICON_MAP: Record<string, any> = {
  Compass,
  Video,
  FileEdit,
  Send,
  Award,
  CheckCircle2,
};

export default function AlurBelajarSection({ steps }: { steps: LearningStep[] }) {
  if (!steps || steps.length === 0) return null;

  return (
    <section className="py-20 lg:py-28 bg-slate-50 relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-900 mb-4">
            <Compass size={14} /> Roadmap Pembelajaran
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight font-[var(--font-heading)]">
            Alur Bimbingan & Belajar Riset
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed">
            Metode pembelajaran dan bimbingan terstruktur 4 langkah untuk mengantarkan Anda dari pemula hingga siap publikasi jurnal bereputasi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, idx) => {
            const IconComp = (step.icon && ICON_MAP[step.icon]) || Compass;
            return (
              <div
                key={step.id || idx}
                className="relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col justify-between group hover:-translate-y-1.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-[#09408C] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                      <IconComp size={26} />
                    </div>
                    <span className="text-3xl font-black text-slate-200 group-hover:text-[#09408C]/20 transition-colors font-display">
                      0{step.stepNumber}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#09408C] transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-50 flex items-center text-xs font-bold text-blue-900">
                  <span>Langkah {step.stepNumber}</span>
                  <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
