"use client";

import { useState, useEffect, useMemo } from "react";
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
  TrendingUp,
  Copy,
  Share2,
  Check,
  ExternalLink,
  SlidersHorizontal,
  ArrowUpDown,
  RefreshCw,
  Eye,
  MessageCircle,
} from "lucide-react";
import type { ExamItem } from "@/actions/ujian";
import {
  createExam,
  updateExam,
  deleteExam,
  toggleExamStatus,
  duplicateExam,
} from "@/actions/ujian";
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
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "DRAFT">("ALL");
  const [sortBy, setSortBy] = useState<
    "NEWEST" | "GRADE_DESC" | "GRADE_ASC" | "DURATION_DESC" | "DURATION_ASC" | "QUESTIONS_DESC" | "TITLE_ASC"
  >("NEWEST");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Escape key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

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

  // Dynamic Category Counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: exams.length };
    categories.forEach((c) => {
      if (c.key !== "ALL") {
        counts[c.key] = exams.filter((e) => e.category === c.key).length;
      }
    });
    return counts;
  }, [exams]);

  const activeCount = useMemo(() => exams.filter((e) => e.isActive).length, [exams]);
  const draftCount = useMemo(() => exams.filter((e) => !e.isActive).length, [exams]);

  // Quick Stats
  const totalQuestionsAll = exams.reduce((acc, e) => acc + (e.totalQuestions || 0), 0);
  const avgPassingGrade =
    exams.length > 0
      ? Math.round(exams.reduce((acc, e) => acc + (e.passingGrade || 0), 0) / exams.length)
      : 0;

  // Filtered and Sorted Exams
  const filteredAndSortedExams = useMemo(() => {
    let list = exams.filter((e) => {
      const matchCategory = selectedCategory === "ALL" || e.category === selectedCategory;
      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && e.isActive) ||
        (statusFilter === "DRAFT" && !e.isActive);
      const matchSearch =
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        (e.description && e.description.toLowerCase().includes(search.toLowerCase()));
      return matchCategory && matchStatus && matchSearch;
    });

    list.sort((a, b) => {
      if (sortBy === "NEWEST") {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      if (sortBy === "GRADE_DESC") return (b.passingGrade || 0) - (a.passingGrade || 0);
      if (sortBy === "GRADE_ASC") return (a.passingGrade || 0) - (b.passingGrade || 0);
      if (sortBy === "DURATION_DESC") return (b.durationMinutes || 0) - (a.durationMinutes || 0);
      if (sortBy === "DURATION_ASC") return (a.durationMinutes || 0) - (b.durationMinutes || 0);
      if (sortBy === "QUESTIONS_DESC") return (b.totalQuestions || 0) - (a.totalQuestions || 0);
      if (sortBy === "TITLE_ASC") return a.title.localeCompare(b.title);
      return 0;
    });

    return list;
  }, [exams, selectedCategory, statusFilter, search, sortBy]);

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

  // 1-Click Status Toggle
  const handleToggleStatus = async (exam: ExamItem) => {
    setTogglingId(exam.id);
    const res = await toggleExamStatus(exam.id);
    setTogglingId(null);

    if (res.success && res.data) {
      setExams(
        exams.map((e) =>
          e.id === exam.id ? { ...e, isActive: res.data!.isActive } : e
        )
      );
      toast.success(
        "Status Diubah",
        `Paket "${exam.title}" sekarang berstatus ${res.data.isActive ? "Aktif (Dapat Dikerjakan Siswa)" : "Draf (Disembunyikan)"}.`
      );
    } else {
      toast.error("Gagal Mengubah Status", res.message);
    }
  };

  // Duplicate Exam
  const handleDuplicate = async (exam: ExamItem) => {
    setDuplicatingId(exam.id);
    const res = await duplicateExam(exam.id);
    setDuplicatingId(null);

    if (res.success && res.data) {
      const clonedTitle = `Salinan - ${exam.title}`;
      const newExam: ExamItem = {
        ...exam,
        id: res.data.id,
        title: clonedTitle,
        isActive: false,
        createdAt: new Date().toISOString(),
      };
      setExams([newExam, ...exams]);
      toast.success(
        "Paket Diduplikasi",
        `Paket baru "${clonedTitle}" berhasil dibuat sebagai Draf.`
      );
    } else {
      toast.error("Gagal Menduplikasi", res.message);
    }
  };

  // Copy Link
  const handleCopyLink = (examId: string, examTitle: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const examUrl = `${origin}/portal/ujian/${examId}`;
    navigator.clipboard.writeText(examUrl);
    setCopiedId(examId);
    setTimeout(() => setCopiedId(null), 2500);
    toast.success("Tautan Disalin", `Tautan ujian "${examTitle}" siap dibagikan ke siswa.`);
  };

  // Share via WhatsApp
  const handleShareWA = (exam: ExamItem) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const examUrl = `${origin}/portal/ujian/${exam.id}`;
    const text = `Halo! Yuk ikuti *${exam.title}* di Sahabat Belajar.\n\n⏱ Durasi: ${exam.durationMinutes} Menit\n🎯 Passing Grade: ${exam.passingGrade}\n📝 Jumlah Soal: ${exam.totalQuestions} Butir\n\nAkses simulasi CAT sekarang di:\n${examUrl}\n\n#BersamaSahabat #SahabatBelajar`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleDelete = async (id: string, examTitle: string) => {
    if (
      !confirm(
        `Apakah Anda yakin ingin menghapus paket "${examTitle}"? Semua butir soal di dalamnya juga akan terhapus.`
      )
    ) {
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
            <span>Layanan Belajar Digital: Ruang Ujian Online & Simulasi CAT</span>
          </div>
          <h1 className="text-2xl font-bold text-[#09408C] font-display">
            Paket Ujian & Simulasi CAT
          </h1>
          <p className="text-sm text-[#5B6882] mt-0.5">
            Kelola paket tryout digital, kisi-kisi bank soal, durasi waktu timer, dan ambang batas kelulusan (passing grade).
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#D5DDEB] shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs text-[#5B6882] font-semibold">Total Paket Ujian</div>
            <div className="text-2xl font-bold text-[#09408C] font-display mt-0.5">
              {exams.length} Paket
            </div>
            <div className="text-[11px] text-[#295897] mt-1 font-medium">
              {activeCount} Aktif • {draftCount} Draf
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

        <div className="bg-white p-5 rounded-2xl border border-[#D5DDEB] shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs text-[#5B6882] font-semibold">Status Simulasi CAT</div>
            <div className="text-2xl font-bold text-[#09408C] font-display mt-0.5">
              Siap Uji
            </div>
            <div className="text-[11px] text-[#1F6F4A] mt-1 font-medium">
              Timer & skoring otomatis aktif
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#EAF1FA] text-[#09408C] flex items-center justify-center">
            <Sparkles size={22} />
          </div>
        </div>
      </div>

      {/* Filter, Search & Sort Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#D5DDEB] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-2.5 text-[#5B6882]" />
            <input
              type="text"
              placeholder="Cari judul tryout, kategori, atau topik materi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D5DDEB] focus-ring bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="inline-flex rounded-xl bg-[#F4F7FB] p-1 border border-[#D5DDEB] text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  statusFilter === "ALL"
                    ? "bg-white text-[#09408C] shadow-2xs"
                    : "text-[#5B6882] hover:text-[#09408C]"
                }`}
              >
                Semua ({exams.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("ACTIVE")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  statusFilter === "ACTIVE"
                    ? "bg-white text-[#1F6F4A] shadow-2xs"
                    : "text-[#5B6882] hover:text-[#1F6F4A]"
                }`}
              >
                Aktif ({activeCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("DRAFT")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  statusFilter === "DRAFT"
                    ? "bg-white text-[#5B6882] shadow-2xs"
                    : "text-[#5B6882] hover:text-[#1B2A41]"
                }`}
              >
                Draf ({draftCount})
              </button>
            </div>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#D5DDEB] bg-white text-xs">
              <ArrowUpDown size={13} className="text-[#5B6882]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-[#1B2A41] font-medium outline-hidden cursor-pointer"
              >
                <option value="NEWEST">Terbaru Dibuat</option>
                <option value="GRADE_DESC">Passing Grade Tertinggi</option>
                <option value="GRADE_ASC">Passing Grade Terendah</option>
                <option value="DURATION_DESC">Durasi Terlama</option>
                <option value="DURATION_ASC">Durasi Tercepat</option>
                <option value="QUESTIONS_DESC">Jumlah Soal Terbanyak</option>
                <option value="TITLE_ASC">Judul A - Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Filter Pills with Counter Badges */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#D5DDEB]/60">
          {categories.map((c) => {
            const count = categoryCounts[c.key] || 0;
            const isSelected = selectedCategory === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setSelectedCategory(c.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[#09408C] text-white shadow-xs font-bold"
                    : "bg-[#F4F7FB] text-[#5B6882] hover:bg-[#EAF1FA] hover:text-[#09408C]"
                }`}
              >
                <span>{c.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-[#D5DDEB]/60 text-[#5B6882]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Exams */}
      {filteredAndSortedExams.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#D5DDEB]">
          <FileQuestion size={40} className="mx-auto text-[#9AC1E2] mb-3" />
          <h3 className="text-base font-bold text-[#1B2A41]">
            Tidak ada paket ujian yang cocok
          </h3>
          <p className="text-xs text-[#5B6882] mt-1 max-w-md mx-auto">
            {search
              ? `Tidak ditemukan paket ujian dengan kata kunci "${search}". Coba kata kunci lain atau reset filter.`
              : "Belum ada paket ujian untuk kategori ini. Klik tombol di atas untuk membuat paket baru."}
          </p>
          {(search || selectedCategory !== "ALL" || statusFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("ALL");
                setStatusFilter("ALL");
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-[#EAF1FA] text-[#09408C] text-xs font-bold hover:bg-[#9AC1E2]/30 transition-colors"
            >
              Reset Semua Filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAndSortedExams.map((exam) => (
            <div
              key={exam.id}
              className={`bg-white rounded-3xl border p-6 shadow-xs transition-all flex flex-col justify-between group hover:shadow-md ${
                exam.isActive
                  ? "border-[#D5DDEB] hover:border-[#09408C]"
                  : "border-dashed border-[#D5DDEB] opacity-90 hover:border-[#5B6882]"
              }`}
            >
              <div>
                {/* Top Badge: Category, Status Toggle & Action Menu */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-1 rounded-full bg-[#EAF1FA] text-[#09408C] text-[11px] font-bold border border-[#9AC1E2]/60">
                      {exam.category.replace("_", " ")}
                    </span>

                    {/* 1-Click Status Pill */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(exam)}
                      disabled={togglingId === exam.id}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                        exam.isActive
                          ? "bg-[#E3F4EC] text-[#1F6F4A] hover:bg-[#1F6F4A] hover:text-white"
                          : "bg-[#F4F7FB] text-[#5B6882] border border-[#D5DDEB] hover:bg-[#09408C] hover:text-white"
                      }`}
                      title="Klik untuk mengubah status Aktif / Draf"
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          exam.isActive ? "bg-[#1F6F4A]" : "bg-[#5B6882]"
                        }`}
                      />
                      <span>
                        {togglingId === exam.id
                          ? "Memproses..."
                          : exam.isActive
                          ? "Aktif"
                          : "Draf"}
                      </span>
                    </button>
                  </div>

                  <div className="flex items-center gap-0.5">
                    {/* Duplicate button */}
                    <button
                      type="button"
                      onClick={() => handleDuplicate(exam)}
                      disabled={duplicatingId === exam.id}
                      className="p-1.5 rounded-lg text-[#5B6882] hover:text-[#09408C] hover:bg-[#EAF1FA] transition-colors"
                      title="Duplikasi Paket Ujian & Soal"
                    >
                      {duplicatingId === exam.id ? (
                        <RefreshCw size={14} className="animate-spin text-[#09408C]" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>

                    {/* Edit button */}
                    <button
                      type="button"
                      onClick={() => openEditModal(exam)}
                      className="p-1.5 rounded-lg text-[#5B6882] hover:text-[#09408C] hover:bg-[#EAF1FA] transition-colors"
                      title="Edit Pengaturan Paket"
                    >
                      <Edit3 size={14} />
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleDelete(exam.id, exam.title)}
                      className="p-1.5 rounded-lg text-[#5B6882] hover:text-[#B4381F] hover:bg-[#FBE9E5] transition-colors"
                      title="Hapus Paket Ujian"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-base text-[#1B2A41] font-display leading-snug group-hover:text-[#09408C] transition-colors">
                  {exam.title}
                </h3>
                <p className="text-xs text-[#5B6882] mt-2 line-clamp-2 leading-relaxed">
                  {exam.description || "Simulasi tryout dengan sistem penilaian otomatis dan pembahasan konseptual."}
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
              <div className="mt-5 pt-4 border-t border-[#D5DDEB] space-y-2">
                {/* Secondary Actions: Copy Link & WA */}
                <div className="flex items-center justify-between gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleCopyLink(exam.id, exam.title)}
                    className="flex-1 py-1.5 px-2 rounded-lg border border-[#D5DDEB] text-[11px] font-semibold text-[#5B6882] hover:text-[#09408C] hover:bg-[#EAF1FA] transition-colors flex items-center justify-center gap-1"
                    title="Salin tautan ujian untuk dibagikan"
                  >
                    {copiedId === exam.id ? (
                      <>
                        <Check size={12} className="text-[#1F6F4A]" />
                        <span className="text-[#1F6F4A]">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Share2 size={12} />
                        <span>Salin Link</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShareWA(exam)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-[#E3F4EC] text-[11px] font-semibold text-[#1F6F4A] hover:bg-[#1F6F4A] hover:text-white transition-colors flex items-center justify-center gap-1"
                    title="Bagikan info simulasi ujian ke WhatsApp siswa"
                  >
                    <MessageCircle size={12} />
                    <span>Kirim WA</span>
                  </button>
                </div>

                {/* Primary Actions: Manage Questions & Test CAT */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <Link
                    href={`/dashboard/ujian/${exam.id}`}
                    className="flex-1 px-3 py-2 rounded-xl border border-[#D5DDEB] text-xs font-semibold text-[#09408C] hover:bg-[#EAF1FA] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <BookOpen size={14} />
                    <span>Kelola Soal ({exam.totalQuestions})</span>
                  </Link>

                  <Link
                    href={`/portal/ujian/${exam.id}`}
                    target="_blank"
                    className="px-3.5 py-2 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571] transition-colors flex items-center gap-1.5 shadow-xs"
                    title="Buka simulasi CAT di tab baru"
                  >
                    <span>Coba CAT</span>
                    <ExternalLink size={13} />
                  </Link>
                </div>
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
                Konfigurasi durasi pengerjaan, passing grade kelulusan, dan kategori bimbingan.
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
                  placeholder="Contoh: Simulasi CAT SKD CPNS 2026 - Paket Prediksi Akurat"
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
                    min={5}
                    max={360}
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
                  min={0}
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
                  placeholder="Petunjuk pengerjaan, aturan penilaian, dan kisi-kisi topik..."
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
                  {isSubmitting
                    ? "Menyimpan..."
                    : editingExam
                    ? "Perbarui Paket Ujian"
                    : "Simpan Paket Ujian"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
