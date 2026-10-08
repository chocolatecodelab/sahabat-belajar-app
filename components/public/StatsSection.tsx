import { Users, BookOpen, Award, GraduationCap, Trophy, CheckCircle2 } from "lucide-react";

type StatItem = {
  id: string;
  value: string;
  label: string;
  icon?: string | null;
};

const ICON_MAP: Record<string, any> = {
  Users,
  BookOpen,
  Award,
  GraduationCap,
  Trophy,
  CheckCircle2,
};

export default function StatsSection({ stats }: { stats: StatItem[] }) {
  if (!stats || stats.length === 0) return null;

  return (
    <section className="relative -mt-8 sm:-mt-12 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl border border-gray-100/80">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((stat, idx) => {
            const IconComp = (stat.icon && ICON_MAP[stat.icon]) || Users;
            return (
              <div
                key={stat.id || idx}
                className="flex items-start gap-3.5 border-l-4 border-[#fdbc13] pl-4 py-1"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="w-6 h-6 rounded-md bg-blue-50 text-[#001847] flex items-center justify-center shrink-0">
                      <IconComp size={13} className="text-[#001847]" />
                    </div>
                    <span className="text-2xs sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
                      {stat.label}
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl lg:text-display-md font-bold text-[#001847] font-display tracking-tight leading-none">
                    {stat.value}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
