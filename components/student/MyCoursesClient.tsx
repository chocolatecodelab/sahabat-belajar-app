"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  ArrowRight,
  Calendar,
  Clock,
  CheckCircle2,
  Award,
  Sparkles,
  PlayCircle,
  ExternalLink,
  ShieldCheck,
  FileCheck,
  User,
  Inbox,
} from "lucide-react";
import { claimCertificate } from "@/actions/sertifikat";
import type { EnrolledCourseItem } from "@/actions/belajar";

interface MyCoursesClientProps {
  initialCourses: EnrolledCourseItem[];
  user?: {
    name: string;
    email: string;
  };
}

export default function MyCoursesClient({ initialCourses, user }: MyCoursesClientProps) {
  const [courses, setCourses] = useState<EnrolledCourseItem[]>(initialCourses);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const totalEnrolled = courses.length;
  const completedCourses = courses.filter((c) => c.progressPercentage >= 100).length;
  const totalCertificates = courses.filter((c) => !!c.certificateCode).length;

  const handleClaim = async (enrollmentId: string) => {
    setClaimingId(enrollmentId);
    try {
      const res = await claimCertificate(enrollmentId);
      if (res.success && res.data?.certificateCode) {
        const certCode = res.data.certificateCode;
        setCourses((prev) =>
          prev.map((c) =>
            c.enrollmentId === enrollmentId
              ? { ...c, progressPercentage: 100, status: "COMPLETED", certificateCode: certCode }
              : c
          )
        );
        window.location.href = `/sertifikat/${certCode}`;
      }
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      {/* 1. Welcome Header Banner (Level 1 Elevation) */}
      <div
        className="elevation-1 rounded-2xl p-6 sm:p-8 bg-white border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0px_4px_20px_rgba(11,44,107,0.04)]"
        style={{
          borderTop: "4px solid var(--color-primary)",
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xs shrink-0"
            style={{
              background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
              color: "var(--color-primary)",
            }}
          >
            <GraduationCap size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold font-[var(--font-heading)] text-slate-900 tracking-tight">
                Ruang Belajar & Mentorship Saya
              </h1>
              <span
                className="text-xs font-bold px-2.5 py-0.5 rounded-full uppercase"
                style={{
                  background: "var(--color-secondary-container)",
                  color: "var(--color-on-secondary-container)",
                }}
              >
                {totalEnrolled} Program Aktif
              </span>
            </div>
            <p className="text-sm text-slate-500 font-normal mt-1 leading-relaxed">
              Akses seluruh rekaman sesi Zoom, modul PDF, dataset latihan, dan kumpulkan draf naskah riset
            </p>
          </div>
        </div>

        <Link
          href="/kursus"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 shadow-2xs self-start md:self-center transition-all hover:border-slate-300 shrink-0"
        >
          <BookOpen size={15} className="text-blue-900" />
          <span>Eksplor Program Lainnya</span>
        </Link>
      </div>

      {/* Active User Information Banner */}
      {user && (
        <div className="flex items-center justify-between px-5 py-3 rounded-2xl bg-blue-50/50 border border-blue-100 text-xs text-slate-700">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
            <span>
              Selamat datang, <strong>{user.name}</strong> ({user.email})
            </span>
          </div>
          <span className="text-3xs font-bold uppercase tracking-wider text-blue-900 bg-blue-100/70 px-2 py-0.5 rounded-md">
            Akun Siswa Terverifikasi
          </span>
        </div>
      )}

      {/* If Student Has Zero Enrolled Courses: Empty State */}
      {totalEnrolled === 0 ? (
        <div className="elevation-1 rounded-3xl p-12 bg-white border border-slate-200/80 text-center space-y-5 max-w-2xl mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-[#001847] flex items-center justify-center mx-auto shadow-xs">
            <Inbox size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold font-[var(--font-heading)] text-slate-900">
              Belum Ada Program Kelas Aktif
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Akun Anda <strong>{user?.email}</strong> belum terdaftar pada program kelas riset mana pun. Jika Anda baru saja mendaftar, mohon tunggu beberapa saat hingga Admin memverifikasi pembayaran Anda.
            </p>
          </div>

          <div className="pt-3">
            <Link
              href="/kursus"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white shadow-md transition-all hover:opacity-95"
              style={{ background: "var(--color-primary)" }}
            >
              <BookOpen size={16} />
              <span>Jelajahi Katalog Program Kursus</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* 2. Key Learning Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="elevation-1 rounded-2xl p-5 bg-white border border-slate-200/80 flex items-center gap-4 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center font-bold text-lg shrink-0">
                <BookOpen size={22} />
              </div>
              <div>
                <p className="text-2xs font-bold uppercase tracking-wider text-slate-400">Total Program Diikuti</p>
                <h3 className="text-2xl font-extrabold text-slate-900">{totalEnrolled} Kelas</h3>
              </div>
            </div>

            <div className="elevation-1 rounded-2xl p-5 bg-white border border-slate-200/80 flex items-center gap-4 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg shrink-0">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <p className="text-2xs font-bold uppercase tracking-wider text-slate-400">Program Selesai</p>
                <h3 className="text-2xl font-extrabold text-slate-900">{completedCourses} Kelas</h3>
              </div>
            </div>

            <div className="elevation-1 rounded-2xl p-5 bg-white border border-slate-200/80 flex items-center gap-4 shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#001847] flex items-center justify-center font-bold text-lg shrink-0">
                <Award size={22} />
              </div>
              <div>
                <p className="text-2xs font-bold uppercase tracking-wider text-slate-400">E-Sertifikat 32 JP</p>
                <h3 className="text-2xl font-extrabold text-slate-900">{totalCertificates} Diperoleh</h3>
              </div>
            </div>
          </div>

          {/* 3. Enrolled Courses Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold font-[var(--font-heading)] text-slate-900 flex items-center gap-2">
                <PlayCircle size={20} className="text-blue-900" />
                <span>Daftar Kelas Aktif Anda</span>
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                Pilih kelas untuk masuk ke ruang materi & rekaman sesi
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const isCompleted = course.progressPercentage >= 100;

                return (
                  <div
                    key={course.enrollmentId}
                    className="elevation-1 rounded-3xl bg-white border border-slate-200/80 overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group"
                  >
                    <div>
                      {/* Card Header & Badge */}
                      <div className="p-6 pb-4 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-3xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-50 text-blue-900 border border-blue-200">
                            {course.category}
                          </span>
                          <span
                            className={`text-3xs font-bold px-2.5 py-1 rounded-full uppercase ${
                              isCompleted
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-blue-100 text-blue-900"
                            }`}
                          >
                            {isCompleted ? "Selesai 100%" : "Sedang Berjalan"}
                          </span>
                        </div>

                        <Link href={`/belajar/${course.courseSlug}`}>
                          <h3 className="text-base font-bold font-[var(--font-heading)] text-slate-900 group-hover:text-blue-900 transition-colors line-clamp-2 leading-snug">
                            {course.courseTitle}
                          </h3>
                        </Link>

                        <div className="space-y-1.5 text-xs text-slate-500 pt-1">
                          <p className="flex items-center gap-1.5 truncate">
                            <span className="font-semibold text-slate-700">Mentor:</span>
                            <span>{course.mentorName}</span>
                          </p>
                          <div className="flex items-center gap-4 text-3xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} /> {course.startDate || "Jadwal Fleksibel"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} /> {course.duration || "4 Minggu"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar Section */}
                      <div className="px-6 py-3 bg-slate-50/70 border-y border-slate-100 space-y-1.5">
                        <div className="flex items-center justify-between text-2xs font-bold">
                          <span className="text-slate-600">Progres Belajar</span>
                          <span className="text-blue-900">{course.progressPercentage}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isCompleted ? "bg-emerald-600" : "bg-blue-600"
                            }`}
                            style={{ width: `${course.progressPercentage}%` }}
                          />
                        </div>
                        <p className="text-3xs text-slate-400 text-right">
                          {course.completedLessons} dari {course.totalLessons} sesi terselesaikan
                        </p>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="p-6 pt-4 space-y-2">
                      <Link
                        href={`/belajar/${course.courseSlug}`}
                        className="w-full py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 shadow-xs transition-all hover:opacity-95"
                        style={{ background: "var(--color-primary)" }}
                      >
                        <PlayCircle size={15} />
                        <span>Masuk Ruang Kelas</span>
                      </Link>

                      {isCompleted && (
                        <div>
                          {course.certificateCode ? (
                            <Link
                              href={`/sertifikat/${course.certificateCode}`}
                              target="_blank"
                              className="w-full py-2 rounded-xl text-3xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <Award size={13} />
                              <span>Lihat E-Sertifikat ({course.certificateCode})</span>
                            </Link>
                          ) : (
                            <button
                              type="button"
                              disabled={claimingId === course.enrollmentId}
                              onClick={() => handleClaim(course.enrollmentId)}
                              className="w-full py-2 rounded-xl text-3xs font-bold text-[#001847] bg-[#fdbc13] hover:opacity-95 shadow-xs flex items-center justify-center gap-1.5 transition-opacity"
                            >
                              <Sparkles size={13} />
                              <span>
                                {claimingId === course.enrollmentId
                                  ? "Menerbitkan Sertifikat..."
                                  : "Klaim E-Sertifikat 32 JP"}
                              </span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
