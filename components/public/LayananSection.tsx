import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Clock,
  ArrowRight,
  GraduationCap,
  Microscope,
  BarChart2,
  FileText,
  TrendingUp,
  Sparkles,
  BookOpen,
} from "lucide-react";
import type { CourseItem } from "@/actions/kursus";

function getCategoryIcon(cat: string) {
  if (cat.includes("Scopus")) return <GraduationCap size={28} className="text-[#fdbc13]" />;
  if (cat.includes("SmartPLS") || cat.includes("SEM")) return <BarChart2 size={28} className="text-[#fdbc13]" />;
  if (cat.includes("SPSS") || cat.includes("Statistik")) return <TrendingUp size={28} className="text-[#fdbc13]" />;
  if (cat.includes("Tesis") || cat.includes("Disertasi")) return <FileText size={28} className="text-[#fdbc13]" />;
  return <Microscope size={28} className="text-[#fdbc13]" />;
}

interface LayananSectionProps {
  courses?: CourseItem[];
}

export default function LayananSection({ courses = [] }: LayananSectionProps) {
  if (!courses || courses.length === 0) return null;

  // Take top 3 or 6 courses for homepage showcase
  const featuredCourses = courses.slice(0, 3);

  return (
    <section id="layanan" className="py-20 bg-[var(--color-surface)] font-[var(--font-body)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="flex items-center justify-center gap-2">
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
            className="text-display-md font-extrabold font-[var(--font-heading)]"
            style={{ color: "var(--color-on-surface)" }}
          >
            Pilihan Program Kelas & Bimbingan Riset
          </h2>

          <p className="text-body-md text-gray-600 max-w-2xl mx-auto">
            Pelatihan intensif berstandar akademik internasional mulai dari bimbingan naskah Scopus Q1-Q4, olah data statistik kuantitatif, hingga pendampingan tugas akhir.
          </p>
        </div>

        {/* Featured Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredCourses.map((course) => {
            const basePrice =
              course.salePrice !== null && course.salePrice !== undefined
                ? course.salePrice
                : course.price;
            const hasDiscount =
              course.salePrice !== null &&
              course.salePrice !== undefined &&
              course.salePrice < course.price;

            return (
              <div
                key={course.id}
                className="elevation-1 rounded-2xl bg-white border overflow-hidden flex flex-col justify-between group hover:elevation-2 hover:-translate-y-1.5 transition-all duration-300"
                style={{
                  borderColor: "var(--color-outline-variant)",
                  borderTop: "4px solid var(--color-primary)",
                }}
              >
                {/* Top Thumbnail Box */}
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  {course.featuredImage ? (
                    <Image
                      src={course.featuredImage}
                      alt={course.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white relative"
                      style={{
                        background: "linear-gradient(135deg, #001847 0%, #002b80 60%, #0a3d91 100%)",
                      }}
                    >
                      <div className="w-24 h-24 rounded-full bg-white/5 absolute -top-4 -right-4" />
                      <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center mb-2.5 shadow-inner">
                        {getCategoryIcon(course.category)}
                      </div>
                      <span className="text-3xs font-bold uppercase tracking-widest text-[#fdbc13]">
                        {course.category}
                      </span>
                    </div>
                  )}

                  {/* Category Badge Pill */}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-3xs font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-xs">
                    {course.category}
                  </span>

                  {/* Batch Badge Pill */}
                  {course.batchNumber && (
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md text-3xs font-extrabold bg-[#fdbc13] text-blue-950 shadow-xs">
                      {course.batchNumber}
                    </span>
                  )}
                </div>

                {/* Course Details Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    {/* Date & Duration Pill Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 text-3xs font-semibold">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                        <Calendar size={11} className="text-blue-900" />
                        <span>{course.startDate || "Jadwal Fleksibel"}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-900 border border-blue-100">
                        <Clock size={11} className="text-blue-900" />
                        <span>{course.duration || "4 Minggu"}</span>
                      </span>
                    </div>

                    <h3 className="font-bold text-headline-sm font-[var(--font-heading)] leading-snug text-gray-900 group-hover:text-blue-900 transition-colors">
                      <Link href={`/kursus/${course.slug}`}>
                        {course.title}
                      </Link>
                    </h3>

                    {course.tagline && (
                      <p className="text-2xs text-gray-500 line-clamp-2 leading-relaxed">
                        {course.tagline}
                      </p>
                    )}
                  </div>

                  {/* Mentor Badge */}
                  <div className="pt-3 border-t flex items-center gap-2.5" style={{ borderColor: "var(--color-outline-variant)" }}>
                    <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {course.mentorName.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-3xs font-bold text-gray-900 truncate">{course.mentorName}</p>
                      <p className="text-3xs text-gray-400 truncate">{course.mentorTitle}</p>
                    </div>
                  </div>

                  {/* Pricing & CTA */}
                  <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: "var(--color-outline-variant)" }}>
                    <div>
                      {hasDiscount && (
                        <span className="text-3xs text-gray-400 line-through block leading-none mb-0.5">
                          Rp {course.price.toLocaleString("id-ID")}
                        </span>
                      )}
                      <strong className="text-headline-sm font-extrabold text-[var(--color-primary)] block leading-tight">
                        {course.isFree ? "GRATIS" : `Rp ${basePrice.toLocaleString("id-ID")}`}
                      </strong>
                    </div>

                    <Link
                      href={`/kursus/${course.slug}`}
                      className="px-4 py-2.5 rounded-xl text-label-md font-bold text-white shadow-xs flex items-center gap-1.5 transition-all hover:opacity-90 shrink-0"
                      style={{ background: "var(--color-primary)" }}
                    >
                      <span>Lihat Silabus</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Courses CTA */}
        <div className="mt-14 text-center">
          <Link
            href="/kursus"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-bold text-label-lg text-white shadow-md hover:opacity-95 transition-all hover:scale-105"
            style={{ background: "var(--color-primary)" }}
          >
            <BookOpen size={18} />
            <span>Buka Katalog Lengkap Semua Program Riset</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
