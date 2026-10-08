import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  GraduationCap,
  Microscope,
  BarChart2,
  FileText,
  TrendingUp,
} from "lucide-react";
import { getCourses } from "@/actions/kursus";
import CourseCatalogToolbar from "@/components/public/CourseCatalogToolbar";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Program Kursus & Mentorship Riset | BIAS RISTEK",
  description:
    "Katalog program pelatihan dan pendampingan publikasi Scopus, olah data SmartPLS & SPSS, serta bimbingan tesis/disertasi bersama tim reviewer pakar.",
};

const CATEGORIES = [
  "Semua",
  "Scopus & SINTA",
  "SmartPLS & SEM",
  "Bimbingan Tesis",
  "Metodologi",
];

function getCategoryIcon(cat: string) {
  if (cat.includes("Scopus")) return <GraduationCap size={28} className="text-[#fdbc13]" />;
  if (cat.includes("SmartPLS") || cat.includes("SEM")) return <BarChart2 size={28} className="text-[#fdbc13]" />;
  if (cat.includes("SPSS") || cat.includes("Statistik")) return <TrendingUp size={28} className="text-[#fdbc13]" />;
  if (cat.includes("Tesis") || cat.includes("Disertasi")) return <FileText size={28} className="text-[#fdbc13]" />;
  return <Microscope size={28} className="text-[#fdbc13]" />;
}

interface CourseCatalogPageProps {
  searchParams: Promise<{
    kategori?: string;
    q?: string;
  }>;
}

export default async function CourseCatalogPage({ searchParams }: CourseCatalogPageProps) {
  const params = await searchParams;
  const currentCategory = params.kategori || "Semua";
  const searchQuery = params.q || "";

  const courses = await getCourses({
    category: currentCategory,
    search: searchQuery,
    activeOnly: true,
  });

  return (
    <div className="min-h-screen bg-slate-50 font-[var(--font-body)]">
      {/* Hero Header */}
      <section
        className="relative py-16 px-4 sm:px-6 lg:px-8 border-b overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #001847 0%, #002b80 100%)",
          borderColor: "rgba(255,255,255,0.1)",
        }}
      >
        <div className="max-w-7xl mx-auto text-center relative z-10 text-white space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-2xs font-bold uppercase tracking-wider bg-white/10 border border-white/20 text-[#fdbc13]">
            <GraduationCap size={14} />
            <span>Katalog Program Riset & Mentorship 2026</span>
          </div>

          <h1 className="text-display-md sm:text-display-lg font-extrabold font-[var(--font-heading)] leading-tight max-w-3xl mx-auto">
            Akselerasi Karya Ilmiah & Publikasi Bereputasi Bersama Reviewer Pakar
          </h1>

          <p className="text-body-md text-white/80 max-w-2xl mx-auto">
            Pelatihan intensif berstandar internasional mulai dari bimbingan naskah Scopus Q1-Q4, olah data kuantitatif SmartPLS & SPSS, hingga pendampingan tugas akhir.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Interactive Search & Filter Toolbar (UX-IA-02) */}
        <CourseCatalogToolbar
          categories={CATEGORIES}
          currentCategory={currentCategory}
          initialQuery={searchQuery}
          totalResults={courses.length}
        />

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <div className="elevation-1 rounded-2xl p-12 bg-white border text-center space-y-3" style={{ borderColor: "var(--color-outline-variant)" }}>
            <BookOpen size={48} className="mx-auto text-gray-300" />
            <h3 className="text-headline-sm font-bold text-gray-800">
              {searchQuery
                ? `Tidak ditemukan program kursus untuk "${searchQuery}"`
                : "Belum ada program kursus di kategori ini"}
            </h3>
            <p className="text-2xs text-gray-500">
              {searchQuery
                ? "Coba gunakan kata kunci lain seperti SmartPLS, Scopus, Tesis, atau reset pencarian."
                : "Silakan pilih kategori lain atau periksa kembali nanti."}
            </p>
            <Link href="/kursus" className="inline-block px-4 py-2 rounded-lg text-2xs font-bold text-white bg-[var(--color-primary)]">
              Lihat Semua Program
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const basePrice = course.salePrice !== null && course.salePrice !== undefined ? course.salePrice : course.price;
              const hasDiscount = course.salePrice !== null && course.salePrice !== undefined && course.salePrice < course.price;

              return (
                <div
                  key={course.id}
                  className="elevation-1 rounded-2xl bg-white border overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all"
                  style={{ borderColor: "var(--color-outline-variant)" }}
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
                        {/* Background subtle circle */}
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
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
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
                      <div className="w-8 h-8 rounded-full bg-[#001847] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                        {course.mentorName.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">{course.mentorName}</p>
                        <p className="text-2xs text-slate-500 truncate">{course.mentorTitle}</p>
                      </div>
                    </div>

                    {/* Pricing & CTA Button */}
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
                        className="px-3.5 py-2 rounded-xl text-2xs font-bold text-white shadow-xs flex items-center gap-1.5 transition-all hover:opacity-90 shrink-0"
                        style={{ background: "var(--color-primary)" }}
                      >
                        <span>Detail Kelas</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
