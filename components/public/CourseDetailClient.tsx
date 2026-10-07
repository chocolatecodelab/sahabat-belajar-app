"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Clock,
  Users,
  Award,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  User,
  GraduationCap,
  ArrowRight,
  Share2,
  FileCheck,
} from "lucide-react";
import type { CourseItem } from "@/actions/kursus";
import CourseCheckoutModal from "@/components/public/CourseCheckoutModal";

interface CourseDetailClientProps {
  course: CourseItem;
}

export default function CourseDetailClient({ course }: CourseDetailClientProps) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const basePrice = course.isFree
    ? 0
    : course.salePrice !== null && course.salePrice !== undefined
    ? course.salePrice
    : course.price;

  const hasDiscount =
    !course.isFree &&
    course.salePrice !== null &&
    course.salePrice !== undefined &&
    course.salePrice < course.price;

  const discountPercent = hasDiscount
    ? Math.round(((course.price - course.salePrice!) / course.price) * 100)
    : 0;

  // Parse curriculum & benefits
  let curriculumList: string[] = [];
  try {
    if (course.curriculum) {
      curriculumList = JSON.parse(course.curriculum);
    }
  } catch {
    curriculumList = course.curriculum ? course.curriculum.split("\n").filter(Boolean) : [];
  }

  let benefitsList: string[] = [];
  try {
    if (course.benefits) {
      benefitsList = JSON.parse(course.benefits);
    }
  } catch {
    benefitsList = course.benefits ? course.benefits.split("\n").filter(Boolean) : [];
  }

  const quotaPercent = Math.min(
    100,
    Math.round((course.currentEnrolled / (course.maxQuota || 30)) * 100)
  );

  return (
    <div className="min-h-screen bg-slate-50 font-[var(--font-body)]">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b py-3 px-4 sm:px-6 lg:px-8" style={{ borderColor: "var(--color-outline-variant)" }}>
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-2xs text-gray-500 font-medium">
          <Link href="/" className="hover:text-gray-900">Beranda</Link>
          <ChevronRight size={12} />
          <Link href="/kursus" className="hover:text-gray-900">Program Kursus</Link>
          <ChevronRight size={12} />
          <span className="text-gray-900 font-bold truncate max-w-xs sm:max-w-md">{course.title}</span>
        </div>
      </div>

      {/* Hero Header */}
      <section
        className="relative py-12 px-4 sm:px-6 lg:px-8 border-b text-white overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #001847 0%, #002b80 100%)",
          borderColor: "rgba(255,255,255,0.1)",
        }}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-md text-3xs font-bold uppercase tracking-wider bg-white/10 border border-white/20 text-[#fdbc13]">
                {course.category}
              </span>
              {course.batchNumber && (
                <span className="px-3 py-1 rounded-md text-3xs font-bold bg-[#fdbc13] text-blue-950">
                  {course.batchNumber}
                </span>
              )}
              <span className="px-3 py-1 rounded-md text-3xs font-bold bg-emerald-500 text-white">
                {course.status === "OPEN" ? "Pendaftaran Terbuka" : course.status}
              </span>
            </div>

            <h1 className="text-display-md sm:text-display-lg font-extrabold font-[var(--font-heading)] leading-tight">
              {course.title}
            </h1>

            {course.tagline && (
              <p className="text-body-md text-white/85 leading-relaxed">
                {course.tagline}
              </p>
            )}

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-2xs text-white/80 font-medium">
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg">
                <Calendar size={14} className="text-[#fdbc13]" />
                <span>Mulai: <strong>{course.startDate || "Jadwal Fleksibel"}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg">
                <Clock size={14} className="text-[#fdbc13]" />
                <span>Durasi: <strong>{course.duration || "4 Minggu"}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg">
                <GraduationCap size={14} className="text-[#fdbc13]" />
                <span>Tingkat: <strong>{course.level}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout: Left 2 Cols + Right 1 Sticky Col */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* LEFT 2 COLS: Details, Syllabus, Benefits, Mentor */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview / Description */}
            <div
              className="elevation-1 rounded-2xl p-6 sm:p-8 bg-white border space-y-4"
              style={{ borderColor: "var(--color-outline-variant)" }}
            >
              <h2 className="text-headline-md font-bold font-[var(--font-heading)]" style={{ color: "var(--color-on-surface)" }}>
                Tentang Program Pelatihan
              </h2>
              <div
                className="text-body-md leading-relaxed text-gray-700 space-y-3 prose prose-blue max-w-none"
                dangerouslySetInnerHTML={{ __html: course.description }}
              />
            </div>

            {/* Curriculum / Syllabus Accordion */}
            {curriculumList.length > 0 && (
              <div
                className="elevation-1 rounded-2xl p-6 sm:p-8 bg-white border space-y-6"
                style={{ borderColor: "var(--color-outline-variant)" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-headline-md font-bold font-[var(--font-heading)]" style={{ color: "var(--color-on-surface)" }}>
                      Silabus & Kurikulum Materi
                    </h2>
                    <p className="text-2xs text-gray-500 mt-1">
                      Materi dirancang terstruktur mulai dari fundamental hingga implementasi riil
                    </p>
                  </div>
                  <span className="text-3xs font-bold px-3 py-1 rounded-full bg-blue-50 text-[var(--color-primary)] border border-blue-200 uppercase">
                    {curriculumList.length} Sesi Pembelajaran
                  </span>
                </div>

                <div className="space-y-3">
                  {curriculumList.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-start gap-3.5"
                      style={{ borderColor: "var(--color-outline-variant)" }}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-xs"
                        style={{ background: "var(--color-primary)" }}
                      >
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-body-sm font-semibold text-gray-900 leading-snug">
                          {item}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Benefits & Facilities */}
            {benefitsList.length > 0 && (
              <div
                className="elevation-1 rounded-2xl p-6 sm:p-8 bg-white border space-y-5"
                style={{ borderColor: "var(--color-outline-variant)" }}
              >
                <h2 className="text-headline-md font-bold font-[var(--font-heading)]" style={{ color: "var(--color-on-surface)" }}>
                  Fasilitas & Keuntungan Peserta
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {benefitsList.map((benefit, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border bg-emerald-50/40 border-emerald-200 flex items-start gap-3"
                    >
                      <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-2xs font-semibold text-emerald-950 leading-relaxed">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mentor Pakar Profile */}
            <div
              className="elevation-1 rounded-2xl p-6 sm:p-8 bg-white border space-y-4"
              style={{ borderColor: "var(--color-outline-variant)" }}
            >
              <h2 className="text-headline-md font-bold font-[var(--font-heading)]" style={{ color: "var(--color-on-surface)" }}>
                Mentor & Instruktur Pakar
              </h2>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-5 rounded-xl bg-slate-50 border" style={{ borderColor: "var(--color-outline-variant)" }}>
                <div className="w-18 h-18 rounded-2xl bg-[#001847] text-white flex items-center justify-center font-bold text-xl shadow-sm shrink-0">
                  {course.mentorAvatar ? (
                    <Image src={course.mentorAvatar} alt={course.mentorName} width={72} height={72} className="rounded-2xl object-cover" />
                  ) : (
                    course.mentorName.slice(0, 2)
                  )}
                </div>

                <div className="text-center sm:text-left space-y-1">
                  <h3 className="font-bold text-headline-sm text-gray-900">{course.mentorName}</h3>
                  <p className="text-body-sm font-semibold text-[#001847]">{course.mentorTitle}</p>
                  <p className="text-2xs text-gray-500 leading-relaxed pt-1">
                    Praktisi riset dengan pengalaman publikasi di jurnal Scopus Q1/Q2 dan pembimbing ratusan tesis serta disertasi di berbagai perguruan tinggi terkemuka.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT 1 COL: Sticky Checkout Card */}
          <div className="lg:col-span-1 sticky top-6 space-y-4">
            <div
              className="elevation-2 rounded-2xl p-6 bg-white border space-y-5"
              style={{
                borderColor: "var(--color-outline-variant)",
                borderTop: "4px solid var(--color-primary)",
              }}
            >
              {/* Pricing Box */}
              <div>
                <span className="text-3xs text-gray-400 font-bold uppercase tracking-wider block">
                  Biaya Investasi Pelatihan
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-display-md font-extrabold text-[var(--color-primary)]">
                    {course.isFree ? "GRATIS" : `Rp ${basePrice.toLocaleString("id-ID")}`}
                  </span>
                  {hasDiscount && (
                    <span className="text-2xs text-gray-400 line-through">
                      Rp {course.price.toLocaleString("id-ID")}
                    </span>
                  )}
                </div>
                {hasDiscount && (
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-3xs font-extrabold bg-red-100 text-red-700">
                    Hemat {discountPercent}% • Promo Terbatas
                  </span>
                )}
              </div>

              {/* Quota Tracker */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-3xs font-bold text-gray-600">
                  <span>Kuota Terisi</span>
                  <span>{course.currentEnrolled} / {course.maxQuota || 30} Peserta</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
                    style={{ width: `${quotaPercent}%` }}
                  />
                </div>
                <span className="text-3xs text-emerald-700 font-semibold block">
                  Sisa {(course.maxQuota || 30) - course.currentEnrolled} slot tersisa untuk gelombang ini
                </span>
              </div>

              {/* Main CTA Button */}
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full py-3.5 px-4 rounded-xl text-label-lg font-bold text-white shadow-md transition-all hover:bg-[#0b2c6b] flex items-center justify-center gap-2 group cursor-pointer"
                style={{ background: "var(--color-primary)" }}
              >
                <GraduationCap size={18} />
                <span>{course.isFree ? "Daftar Sekarang (Gratis)" : "Daftar & Amankan Slot"}</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>

              {/* Highlights Checklist */}
              <div className="pt-4 border-t space-y-2.5 text-2xs text-gray-600" style={{ borderColor: "var(--color-outline-variant)" }}>
                <div className="flex items-center gap-2">
                  <FileCheck size={15} className="text-emerald-600 shrink-0" />
                  <span>E-Sertifikat Resmi 32 JP BIAS RISTEK</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  <span>Akses Rekaman Video Pembelajaran Seumur Hidup</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  <span>Template Draft & Olah Data Lengkap</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-emerald-600 shrink-0" />
                  <span>Pembayaran Aman via QRIS & Transfer Bank</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <CourseCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        course={course}
      />
    </div>
  );
}
