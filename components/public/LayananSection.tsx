import Link from "next/link";
import { Microscope, Wrench, Building, BookOpen, Award, Sparkles, ArrowRight } from "lucide-react";

type ServiceItem = {
  id: string;
  title: string;
  description: string;
  icon: string;
  link: string | null;
};

const ICONS_MAP: Record<string, React.ReactNode> = {
  Microscope: <Microscope size={24} />,
  Wrench: <Wrench size={24} />,
  Building: <Building size={24} />,
  BookOpen: <BookOpen size={24} />,
  Award: <Award size={24} />,
  Sparkles: <Sparkles size={24} />,
};

export default function LayananSection({ services }: { services: ServiceItem[] }) {
  if (services.length === 0) return null;

  return (
    <section id="layanan" className="py-20 bg-[var(--color-surface)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-1 rounded-full" style={{ background: "var(--color-secondary-container)" }} />
            <span
              className="text-label-lg font-bold uppercase tracking-wider"
              style={{ color: "var(--color-primary)" }}
            >
              Program Kursus & Mentorship
            </span>
            <div className="w-8 h-1 rounded-full" style={{ background: "var(--color-secondary-container)" }} />
          </div>
          <h2
            className="text-display-md font-extrabold"
            style={{ color: "var(--color-on-surface)" }}
          >
            Pilihan Program Kelas & Bimbingan Riset
          </h2>
          <p className="text-body-md text-gray-600 mt-3">
            Katalog program intensif bimbingan penulisan ilmiah, olah data statistik, dan pendampingan publikasi jurnal bereputasi.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => {
            const iconElement = ICONS_MAP[service.icon] || <Microscope size={24} />;

            return (
              <div
                key={service.id}
                className="elevation-1 rounded-2xl p-8 flex flex-col justify-between transition-all duration-300 hover:elevation-2 hover:-translate-y-1.5 group bg-white"
                style={{
                  borderTop: "4px solid var(--color-primary)",
                }}
              >
                <div>
                  {/* Icon Circle 48x48px with 10% opacity background per DESIGN.md */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-6 transition-transform group-hover:scale-110"
                    style={{
                      background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
                      color: "var(--color-primary)",
                    }}
                  >
                    {iconElement}
                  </div>

                  <h3
                    className="text-headline-md font-bold mb-3 group-hover:text-blue-900 transition-colors"
                    style={{ color: "var(--color-on-surface)" }}
                  >
                    {service.title}
                  </h3>

                  <p className="text-body-md text-gray-600 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {service.link && (
                  <div className="pt-6 mt-6 border-t border-gray-100">
                    <Link
                      href={service.link}
                      className="inline-flex items-center gap-1.5 text-sm font-bold transition-colors group/link"
                      style={{ color: "var(--color-primary-container)" }}
                    >
                      <span>Informasi Detail</span>
                      <ArrowRight size={16} className="transition-transform group-hover/link:translate-x-1" />
                    </Link>
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
