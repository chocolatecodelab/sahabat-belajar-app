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
      <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl border border-gray-100/80 backdrop-blur-sm">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 divide-y-2 sm:divide-y-0 sm:divide-x divide-gray-100">
          {stats.map((stat, idx) => {
            const IconComp = (stat.icon && ICON_MAP[stat.icon]) || Users;
            return (
              <div
                key={stat.id || idx}
                className={`flex flex-col items-center text-center ${
                  idx > 0 ? "pt-6 sm:pt-0 sm:pl-6 lg:pl-8" : ""
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-900 flex items-center justify-center mb-3 shadow-xs">
                  <IconComp size={24} className="text-blue-900" />
                </div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-blue-950 font-[var(--font-heading)] tracking-tight">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-gray-600 mt-1 max-w-[180px]">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
