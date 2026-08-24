"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Search,
  BookOpen,
  Edit2,
  Trash2,
  Calendar,
  Users,
  ExternalLink,
  RefreshCw,
  X,
  CheckCircle2,
} from "lucide-react";
import { deleteCourse, type CourseItem } from "@/actions/kursus";

interface CourseListClientProps {
  initialCourses: CourseItem[];
}

export default function CourseListClient({ initialCourses }: CourseListClientProps) {
  const [courses, setCourses] = useState<CourseItem[]>(initialCourses);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const categories = ["ALL", ...Array.from(new Set(courses.map((c) => c.category)))];

  const filteredCourses = courses.filter((c) => {
    const matchesCat = selectedCategory === "ALL" || c.category === selectedCategory;
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase()) ||
      (c.tagline && c.tagline.toLowerCase().includes(search.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await deleteCourse(id);
      if (res.success) {
        setCourses(courses.filter((c) => c.id !== id));
        setDeleteId(null);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 font-[var(--font-body)] animate-fade-in">
      {/* Header Banner */}
      <div
        className="elevation-1 rounded-2xl p-6 bg-white border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{
          borderColor: "var(--color-outline-variant)",
          borderTop: "4px solid var(--color-primary)",
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xs"
            style={{
              background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
              color: "var(--color-primary)",
            }}
          >
            <BookOpen size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-display-md font-extrabold font-[var(--font-heading)]" style={{ color: "var(--color-on-surface)" }}>
                Manajemen Program Kursus
              </h1>
              <span
                className="text-label-md font-bold px-2.5 py-0.5 rounded-full uppercase"
                style={{
                  background: "var(--color-secondary-container)",
                  color: "var(--color-on-secondary-container)",
                }}
              >
                {courses.length} Program
              </span>
            </div>
            <p className="text-body-sm text-gray-500 mt-1">
              Kelola kurikulum, jadwal batch, kuota pendaftaran, dan biaya investasi kelas riset
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/kursus/buat"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-label-lg font-bold text-white shadow-xs hover:opacity-90 transition-all self-start sm:self-center"
          style={{ background: "var(--color-primary)" }}
        >
          <Plus size={18} />
          <span>Tambah Program Baru</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div
        className="elevation-1 rounded-2xl p-4 bg-white border flex flex-col md:flex-row items-center justify-between gap-4"
        style={{ borderColor: "var(--color-outline-variant)" }}
      >
        {/* Category Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-2xs font-bold transition-all shrink-0 ${
                selectedCategory === cat
                  ? "bg-[var(--color-primary)] text-white shadow-xs"
                  : "bg-slate-50 text-gray-600 hover:bg-slate-100"
              }`}
            >
              {cat === "ALL" ? "Semua Kategori" : cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul kelas..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border text-2xs focus-ring bg-white"
            style={{ borderColor: "var(--color-outline-variant)" }}
          />
        </div>
      </div>

      {/* Courses Table */}
      <div
        className="elevation-1 rounded-2xl bg-white border overflow-hidden"
        style={{ borderColor: "var(--color-outline-variant)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-body-sm">
            <thead>
              <tr className="border-b text-label-md bg-slate-50/50" style={{ borderColor: "var(--color-outline-variant)", color: "var(--color-on-surface-variant)" }}>
                <th className="py-3 px-4">Program Kursus</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Biaya</th>
                <th className="py-3 px-4">Jadwal & Batch</th>
                <th className="py-3 px-4">Kuota Peserta</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--color-outline-variant)" }}>
              {filteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    Tidak ada program kursus ditemukan.
                  </td>
                </tr>
              ) : (
                filteredCourses.map((course) => {
                  const basePrice = course.isFree ? 0 : (course.salePrice !== null && course.salePrice !== undefined ? course.salePrice : course.price);

                  return (
                    <tr key={course.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden relative bg-slate-100 shrink-0 border" style={{ borderColor: "var(--color-outline-variant)" }}>
                            {course.featuredImage ? (
                              <Image src={course.featuredImage} alt={course.title} fill className="object-cover" sizes="48px" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-blue-900 bg-blue-50 font-bold text-xs">
                                {course.category.slice(0, 2)}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 truncate max-w-xs">{course.title}</p>
                            <p className="text-3xs text-gray-400 truncate">{course.mentorName} • {course.deliveryMode}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-full text-3xs font-bold uppercase bg-blue-50 text-blue-900 border border-blue-200">
                          {course.category}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <strong className="text-body-sm font-bold text-gray-900">
                          {course.isFree ? "Gratis" : `Rp ${basePrice.toLocaleString("id-ID")}`}
                        </strong>
                        {course.salePrice && (
                          <span className="text-3xs text-gray-400 line-through block">
                            Rp {course.price.toLocaleString("id-ID")}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-2xs text-gray-600">
                        <span className="font-bold text-blue-950 block">{course.batchNumber || "-"}</span>
                        <span>{course.startDate || "Jadwal Fleksibel"}</span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xs font-bold text-gray-800">
                            {course.currentEnrolled} / {course.maxQuota}
                          </span>
                        </div>
                        <div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden mt-1">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${Math.min(100, (course.currentEnrolled / course.maxQuota) * 100)}%` }}
                          />
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-3xs font-bold ${
                            course.status === "OPEN"
                              ? "bg-emerald-100 text-emerald-800"
                              : course.status === "FULL"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {course.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <a
                            href={`/kursus/${course.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg border hover:bg-slate-100 text-gray-600 transition-colors"
                            title="Buka Halaman Publik"
                          >
                            <ExternalLink size={14} />
                          </a>
                          <Link
                            href={`/dashboard/kursus/${course.id}/edit`}
                            className="p-1.5 rounded-lg border hover:bg-blue-50 text-blue-900 transition-colors"
                            title="Edit Kursus"
                          >
                            <Edit2 size={14} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteId(course.id)}
                            className="p-1.5 rounded-lg border hover:bg-red-50 text-red-600 transition-colors"
                            title="Hapus Kursus"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="elevation-2 rounded-2xl bg-white p-6 max-w-sm w-full space-y-4 border" style={{ borderColor: "var(--color-outline-variant)" }}>
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div className="text-center">
              <h4 className="text-headline-sm font-bold text-gray-900">Hapus Program Kursus?</h4>
              <p className="text-2xs text-gray-500 mt-1">
                Data kelas dan silabus terkait akan dihapus secara permanen.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                disabled={isDeleting}
                className="flex-1 py-2 rounded-lg border text-body-sm font-semibold hover:bg-gray-100"
                style={{ borderColor: "var(--color-outline-variant)" }}
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-body-sm font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                {isDeleting ? <RefreshCw size={14} className="animate-spin" /> : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
