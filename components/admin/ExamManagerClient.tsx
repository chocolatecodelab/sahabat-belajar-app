"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Award,
  Plus,
  Clock,
  CheckCircle2,
  BookOpen,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  FileQuestion,
  AlertCircle,
  Edit3,
  Trash2,
  Layers,
  TrendingUp,
} from "lucide-react";
import type { ExamItem } from "@/actions/ujian";
import { createExam, updateExam, deleteExam } from "@/actions/ujian";
import { useToast } from "@/components/ui/Toast";

export default function ExamManagerClient({
  initialExams = [],
}: {
  initialExams: ExamItem[];
}) {
  const toast = useToast();
  const [exams, setExams] = useState<ExamItem[]>(initialExams);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("CPNS_BUMN");
  const [durationMinutes, setDurationMinutes] = useState("90");
  const [passingGrade, setPassingGrade] = useState("300");

  const categories = [
    { key: "ALL", label: "Semua Kategori" },
    { key: "CPNS_BUMN", label: "CPNS & BUMN (SKD)" },
    { key: "UTBK_SNBT", label: "UTBK-SNBT (TPS)" },
    { key: "TOEFL_IELTS", label: "TOEFL / IELTS" },
    { key: "K12", label: "Bimbel K-12" },
    { key: "KEDINASAN", label: "Sekolah Kedinasan" },
  ];

  // Quick Stats
  const totalQuestionsAll = exams.reduce((acc, e) => acc + (e.totalQuestions || 0), 0);
  const avgPassingGrade = exams.length > 0
    ? Math.round(exams.reduce((acc, e) => acc + (e.passingGrade || 0), 0) / exams.length)
    : 0;

  const filteredExams = exams.filter((e) => {
    const matchCategory =
      selectedCategory === "ALL" || e.category === selectedCategory;
    const matchSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      (e.description && e.description.toLowerCase().includes(search.toLowerCase()));
    return matchCategory && matchSearch;
  });

  const openCreateModal = () => {
    setEditingExam(null);
    setTitle("");
    setDescription("");
    setCategory("CPNS_BUMN");
    setDurationMinutes("90");
    setPassingGrade("300");
    setIsModalOpen(true);
  };

  const openEditModal = (exam: ExamItem) => {
    setEditingExam(exam);
    setTitle(exam.title);
    setDescription(exam.description || "");
    setCategory(exam.category);
    setDurationMinutes(String(exam.durationMinutes));
    setPassingGrade(String(exam.passingGrade));
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);

    if (editingExam) {
      const res = await updateExam(editingExam.id, {
        title,
        description,
        category,
        durationMinutes: Number(durationMinutes) || 90,
        passingGrade: Number(passingGrade) || 300,
      });
      setIsSubmitting(false);

      if (res.success) {
        setExams(
          exams.map((ex) =>
            ex.id === editingExam.id
              ? {
                  ...ex,
                  title,
                  description,
                  category: category as any,
                  durationMinutes: Number(durationMinutes) || 90,
                  passingGrade: Number(passingGrade) || 300,
                }
              : ex
          )
        );
        setIsModalOpen(false);
        toast.success("Paket Diperbarui", `Paket "${title}" berhasil diperbarui.`);
      } else {
        toast.error("Gagal Memperbarui", res.message);
      }
    } else {
      const res = await createExam({
        title,
        description,
        category,
        durationMinutes: Number(durationMinutes) || 90,
        passingGrade: Number(passingGrade) || 300,
      });
      setIsSubmitting(false);

      if (res.success && res.data) {
        const newExam: ExamItem = {
          id: res.data.id,
          title,
          description,
          category: category as any,
          durationMinutes: Number(durationMinutes) || 90,
          passingGrade: Number(passingGrade) || 300,
          totalQuestions: 0,
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        setExams([newExam, ...exams]);
        setIsModalOpen(false);
        toast.success("Paket Dibuat", `Paket simulasi "${title}" berhasil dibuat.`);
      } else {
        toast.error("Gagal Membuat Paket", res.message);
      }
    }
  };

  const handleDelete = async (id: string, examTitle: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus paket "${examTitle}"? Semua butir soal di dalamnya juga akan terhapus.`)) {
      return;
    }

    const res = await deleteExam(id);
    if (res.success) {
      toast.success("Paket Dihapus", `Paket "${examTitle}" berhasil dihapus.`);
      setExams(exams.filter((e) => e.id !== id));
    } else {
      toast.error("Gagal Menghapus Paket", res.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF1FA] text-[#09408C] text-xs font-bold border border-[#9AC1E2] mb-2">
            <Award size={14} />
            <span>Tahap 2: Ruang Ujian Online & Bank Soal</span>
          </div>
          <h1 className="text-2xl font-bold text-[#09408C] font-display">
            Paket Ujian & Simulasi CAT
          </h1>
          <p className="text-sm text-[#5B6882] mt-0.5">
            Kelola paket tryout, kisi-kisi soal, durasi waktu ujian, dan passing grade kelulusan.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571] transition-colors shadow-xs shrink-0"
        >
          <Plus size={16} />
          <span>Buat Paket Ujian Baru</span>
        </button>
      </div>

      {/* Top Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#D5DDEB] shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs text-[#5B6882] font-semibold">Total Paket Ujian</div>
            <div className="text-2xl font-bold text-[#09408C] font-display mt-0.5">
              {exams.length} Paket
            </div>
            <div className="text-[11px] text-[#1F6F4A] mt-1 font-medium">
              Semua aktif & dapat disimulasikan
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#EAF1FA] text-[#09408C] flex items-center justify-center">
            <Award size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#D5DDEB] shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs text-[#5B6882] font-semibold">Total Butir Soal</div>
            <div className="text-2xl font-bold text-[#09408C] font-display mt-0.5">
              {totalQuestionsAll} Soal
            </div>
            <div className="text-[11px] text-[#295897] mt-1 font-medium">
              Tersedia pembahasan konseptual
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#EAF1FA] text-[#295897] flex items-center justify-center">
            <BookOpen size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#D5DDEB] shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs text-[#5B6882] font-semibold">Rata-rata Passing Grade</div>
            <div className="text-2xl font-bold text-[#1F6F4A] font-display mt-0.5">
              {avgPassingGrade}
            </div>
            <div className="text-[11px] text-[#5B6882] mt-1">
              Batas ambang standar kelulusan
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#E3F4EC] text-[#1F6F4A] flex items-center justify-center">
            <TrendingUp size={22} />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#D5DDEB] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-2.5 text-[#5B6882]" />
          <input
            type="text"
            placeholder="Cari judul tryout atau simulasi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D5DDEB] focus-ring bg-white"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setSelectedCategory(c.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedCategory === c.key
                  ? "bg-[#09408C] text-white shadow-xs font-bold"
                  : "bg-[#F4F7FB] text-[#5B6882] hover:bg-[#EAF1FA] hover:text-[#09408C]"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Exams */}
      {filteredExams.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#D5DDEB]">
          <FileQuestion size={40} className="mx-auto text-[#9AC1E2] mb-3" />
          <h3 className="text-base font-bold text-[#1B2A41]">
            Tidak ada paket ujian
          </h3>
          <p className="text-xs text-[#5B6882] mt-1">
            Belum ada paket ujian untuk kategori ini. Klik tombol di atas untuk membuat paket baru.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredExams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white rounded-3xl border border-[#D5DDEB] p-6 shadow-xs hover:border-[#09408C] hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Badge Category, Edit & Delete */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-full bg-[#EAF1FA] text-[#09408C] text-[11px] font-bold border border-[#9AC1E2]/60">
                    {exam.category.replace("_", " ")}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(exam)}
                      className="p-1.5 rounded-lg text-[#5B6882] hover:text-[#09408C] hover:bg-[#EAF1FA] transition-colors"
                      title="Edit Pengaturan Paket"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(exam.id, exam.title)}
                      className="p-1.5 rounded-lg text-[#5B6882] hover:text-[#B4381F] hover:bg-[#FBE9E5] transition-colors"
                      title="Hapus Paket Ujian"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-base text-[#1B2A41] font-display leading-snug">
                  {exam.title}
                </h3>
                <p className="text-xs text-[#5B6882] mt-2 line-clamp-2 leading-relaxed">
                  {exam.description || "Simulasi tryout dengan sistem penilaian otomatis."}
                </p>

                {/* Specs */}
                <div className="mt-4 pt-4 border-t border-[#D5DDEB] grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-[#F4F7FB] p-2 rounded-xl">
                    <div className="text-[10px] text-[#5B6882]">Waktu</div>
                    <div className="font-bold text-[#09408C] mt-0.5 flex items-center justify-center gap-1">
                      <Clock size={12} />
                      <span>{exam.durationMinutes}m</span>
                    </div>
                  </div>

                  <div className="bg-[#F4F7FB] p-2 rounded-xl">
                    <div className="text-[10px] text-[#5B6882]">Passing Grade</div>
                    <div className="font-bold text-[#1F6F4A] mt-0.5">
                      {exam.passingGrade}
                    </div>
                  </div>

                  <div className="bg-[#F4F7FB] p-2 rounded-xl">
                    <div className="text-[10px] text-[#5B6882]">Jumlah Soal</div>
                    <div className="font-bold text-[#1B2A41] mt-0.5">
                      {exam.totalQuestions} Soal
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-[#D5DDEB] flex items-center justify-between gap-2">
                <Link
                  href={`/dashboard/ujian/${exam.id}`}
                  className="px-3 py-2 rounded-xl border border-[#D5DDEB] text-xs font-semibold text-[#09408C] hover:bg-[#EAF1FA] transition-colors flex items-center gap-1"
                >
                  <BookOpen size={14} />
                  <span>Kelola Butir Soal</span>
                </Link>

                <Link
                  href={`/portal/ujian/${exam.id}`}
                  target="_blank"
                  className="px-3 py-2 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571] transition-colors flex items-center gap-1 shadow-xs"
                >
                  <span>Simulasi CAT</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Buat / Edit Paket Ujian */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-xl border border-[#D5DDEB] space-y-5 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xl font-bold text-[#09408C] font-display">
                {editingExam ? "Edit Paket Ujian" : "Buat Paket Ujian Baru"}
              </h3>
              <p className="text-xs text-[#5B6882] mt-0.5">
                Konfigurasi durasi, passing grade, dan kategori bimbingan.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="exam-title-input" className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Judul Paket Ujian *
                </label>
                <input
                  id="exam-title-input"
                  type="text"
                  required
                  placeholder="Contoh: Simulasi CAT SKD CPNS 2026 - Paket 2"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="exam-cat-select" className="block text-xs font-bold text-[#1B2A41] mb-1">
                    Kategori Program
                  </label>
                  <select
                    id="exam-cat-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring bg-white"
                  >
                    <option value="CPNS_BUMN">CPNS & BUMN (SKD)</option>
                    <option value="UTBK_SNBT">UTBK-SNBT (TPS)</option>
                    <option value="TOEFL_IELTS">TOEFL / IELTS</option>
                    <option value="K12">Bimbel K-12</option>
                    <option value="KEDINASAN">Sekolah Kedinasan</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="exam-duration-input" className="block text-xs font-bold text-[#1B2A41] mb-1">
                    Durasi (Menit) *
                  </label>
                  <input
                    id="exam-duration-input"
                    type="number"
                    required
                    min={10}
                    max={300}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="exam-passing-input" className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Passing Grade Kelulusan (Nilai Minimal)
                </label>
                <input
                  id="exam-passing-input"
                  type="number"
                  required
                  value={passingGrade}
                  onChange={(e) => setPassingGrade(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring"
                />
              </div>

              <div>
                <label htmlFor="exam-desc-input" className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Deskripsi / Petunjuk Ujian
                </label>
                <textarea
                  id="exam-desc-input"
                  rows={3}
                  placeholder="Petunjuk pengerjaan dan kisi-kisi topik..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring"
                />
              </div>

              <div className="pt-3 border-t border-[#D5DDEB] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5B6882] hover:bg-[#F4F7FB]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571] disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : editingExam ? "Perbarui Paket Ujian" : "Simpan Paket Ujian"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
