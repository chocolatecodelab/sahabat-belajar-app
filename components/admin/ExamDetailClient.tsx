"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  BookOpen,
  Clock,
  Award,
  CheckCircle2,
  Trash2,
  Edit3,
  HelpCircle,
  ExternalLink,
  Layers,
  Sparkles,
  Filter,
  Search,
  Copy,
  FileUp,
  Download,
  RefreshCw,
  FileText,
  Check,
} from "lucide-react";
import type { ExamItem, ExamQuestion, QuestionOption } from "@/actions/ujian";
import {
  createExamQuestion,
  updateExamQuestion,
  deleteExamQuestion,
  duplicateExamQuestion,
  bulkImportExamQuestions,
} from "@/actions/ujian";
import { useToast } from "@/components/ui/Toast";

export default function ExamDetailClient({
  exam,
}: {
  exam: ExamItem;
}) {
  const toast = useToast();
  const [questions, setQuestions] = useState<ExamQuestion[]>(
    exam.questions || []
  );
  const [search, setSearch] = useState("");
  const [activeSectionFilter, setActiveSectionFilter] = useState("ALL");
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<ExamQuestion | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Import Batch modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  // Duplicating state
  const [duplicatingQId, setDuplicatingQId] = useState<string | null>(null);

  // Escape key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isModalOpen) setIsModalOpen(false);
        if (isImportModalOpen) setIsImportModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, isImportModalOpen]);

  // Form state
  const [questionText, setQuestionText] = useState("");
  const [section, setSection] = useState("TWK (Nasionalisme)");
  const [correctKey, setCorrectKey] = useState("A");
  const [points, setPoints] = useState("5");
  const [explanation, setExplanation] = useState("");
  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");
  const [optC, setOptC] = useState("");
  const [optD, setOptD] = useState("");
  const [optE, setOptE] = useState("");
  const [ptsA, setPtsA] = useState("5");
  const [ptsB, setPtsB] = useState("4");
  const [ptsC, setPtsC] = useState("3");
  const [ptsD, setPtsD] = useState("2");
  const [ptsE, setPtsE] = useState("1");

  const isTKP = section.toUpperCase().includes("TKP");

  const availableOptionKeys = [
    { key: "A", text: optA },
    { key: "B", text: optB },
    { key: "C", text: optC },
    { key: "D", text: optD },
    { key: "E", text: optE },
  ].filter((o) => o.text.trim().length > 0);

  const sectionsCount = useMemo(() => {
    return questions.reduce((acc, q) => {
      const sec = q.section || "Umum";
      acc[sec] = (acc[sec] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [questions]);

  const uniqueSections = Object.keys(sectionsCount);

  // Filtered Questions by Search and Section
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchSection =
        activeSectionFilter === "ALL" || (q.section || "Umum") === activeSectionFilter;
      const qLower = search.toLowerCase();
      const matchSearch =
        !search ||
        q.questionText.toLowerCase().includes(qLower) ||
        (q.explanation && q.explanation.toLowerCase().includes(qLower)) ||
        q.options.some((opt) => opt.text.toLowerCase().includes(qLower)) ||
        (q.section && q.section.toLowerCase().includes(qLower));
      return matchSection && matchSearch;
    });
  }, [questions, activeSectionFilter, search]);

  // Total Max Score Possible
  const maxScorePossible = useMemo(() => {
    return questions.reduce((acc, q) => {
      if (q.section?.toUpperCase().includes("TKP")) {
        const maxOpt = Math.max(...q.options.map((o) => o.points || 0), 5);
        return acc + maxOpt;
      }
      return acc + (q.points || 5);
    }, 0);
  }, [questions]);

  const openCreateModal = () => {
    setEditingQuestion(null);
    setQuestionText("");
    setSection(uniqueSections[0] || "TWK (Nasionalisme)");
    setCorrectKey("A");
    setPoints("5");
    setExplanation("");
    setOptA("");
    setOptB("");
    setOptC("");
    setOptD("");
    setOptE("");
    setIsModalOpen(true);
  };

  const openEditModal = (q: ExamQuestion) => {
    setEditingQuestion(q);
    setQuestionText(q.questionText);
    setSection(q.section || "Umum");
    setCorrectKey(q.correctKey);
    setPoints(String(q.points || 5));
    setExplanation(q.explanation || "");

    const getOpt = (key: string) => q.options.find((o) => o.key === key)?.text || "";
    const getPts = (key: string, def: string) => {
      const opt = q.options.find((o) => o.key === key);
      return opt?.points !== undefined ? String(opt.points) : def;
    };

    setOptA(getOpt("A"));
    setOptB(getOpt("B"));
    setOptC(getOpt("C"));
    setOptD(getOpt("D"));
    setOptE(getOpt("E"));

    setPtsA(getPts("A", "5"));
    setPtsB(getPts("B", "4"));
    setPtsC(getPts("C", "3"));
    setPtsD(getPts("D", "2"));
    setPtsE(getPts("E", "1"));

    setIsModalOpen(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    const options: QuestionOption[] = [
      { key: "A", text: optA.trim(), points: isTKP ? Number(ptsA) || 1 : undefined },
      { key: "B", text: optB.trim(), points: isTKP ? Number(ptsB) || 1 : undefined },
      { key: "C", text: optC.trim(), points: isTKP ? Number(ptsC) || 1 : undefined },
      { key: "D", text: optD.trim(), points: isTKP ? Number(ptsD) || 1 : undefined },
      { key: "E", text: optE.trim(), points: isTKP ? Number(ptsE) || 1 : undefined },
    ].filter((o) => o.text.length > 0);

    if (options.length < 2) {
      toast.warning("Pilihan Belum Lengkap", "Harap masukkan minimal pilihan A dan B.");
      return;
    }

    if (!options.some((o) => o.key === correctKey)) {
      toast.warning(
        "Kunci Jawaban Tidak Valid",
        `Pilihan ${correctKey} belum diisi teksnya. Harap pilih kunci jawaban yang memiliki opsi.`
      );
      return;
    }

    setIsSubmitting(true);

    if (editingQuestion) {
      const res = await updateExamQuestion(editingQuestion.id, {
        examId: exam.id,
        section,
        questionText,
        options,
        correctKey,
        points: Number(points) || 5,
        explanation,
      });
      setIsSubmitting(false);

      if (res.success) {
        setQuestions(
          questions.map((q) =>
            q.id === editingQuestion.id
              ? {
                  ...q,
                  section,
                  questionText,
                  options,
                  correctKey,
                  points: Number(points) || 5,
                  explanation,
                }
              : q
          )
        );
        setIsModalOpen(false);
        toast.success("Soal Diperbarui", "Perubahan butir soal berhasil disimpan.");
      } else {
        toast.error("Gagal Memperbarui Soal", res.message);
      }
    } else {
      const nextNumber = questions.length + 1;
      const res = await createExamQuestion({
        examId: exam.id,
        section,
        questionText,
        options,
        correctKey,
        points: Number(points) || 5,
        explanation,
      });
      setIsSubmitting(false);

      if (res.success && res.data) {
        const newQ: ExamQuestion = {
          id: res.data.id,
          examId: exam.id,
          questionNumber: nextNumber,
          section,
          questionText,
          options,
          correctKey,
          points: Number(points) || 5,
          explanation,
        };
        setQuestions([...questions, newQ]);
        setIsModalOpen(false);
        toast.success("Soal Ditambahkan", `Butir soal nomor ${nextNumber} berhasil ditambahkan.`);
      } else {
        toast.error("Gagal Menambah Soal", res.message);
      }
    }
  };

  // 1-Click Duplicate Question
  const handleDuplicateQuestion = async (q: ExamQuestion) => {
    setDuplicatingQId(q.id);
    const res = await duplicateExamQuestion(q.id, exam.id);
    setDuplicatingQId(null);

    if (res.success && res.data) {
      const nextNumber = questions.length + 1;
      const duplicatedQ: ExamQuestion = {
        ...q,
        id: res.data.id,
        questionNumber: nextNumber,
        questionText: `${q.questionText} (Salinan)`,
      };
      setQuestions([...questions, duplicatedQ]);
      toast.success(
        "Soal Diduplikasi",
        `Soal berhasil diduplikasi menjadi butir soal nomor ${nextNumber}.`
      );
    } else {
      toast.error("Gagal Menduplikasi", res.message);
    }
  };

  const handleDeleteQuestion = async (qId: string, qNum: number) => {
    if (!confirm(`Hapus butir soal nomor ${qNum}?`)) return;

    const res = await deleteExamQuestion(qId, exam.id);
    if (res.success) {
      toast.success("Soal Dihapus", `Butir soal nomor ${qNum} berhasil dihapus.`);
      setQuestions(questions.filter((q) => q.id !== qId));
    } else {
      toast.error("Gagal Menghapus", res.message);
    }
  };

  // Handle Bulk Import
  const handleBulkImport = async () => {
    if (!importJsonText.trim()) {
      toast.warning("JSON Kosong", "Harap tempel data JSON butir soal terlebih dahulu.");
      return;
    }

    let parsed: any;
    try {
      parsed = JSON.parse(importJsonText);
    } catch (err: any) {
      toast.error("Format JSON Tidak Valid", "Pastikan format JSON sudah sesuai sintaks array.");
      return;
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      toast.warning("Data Kosong", "JSON harus berupa array daftar soal.");
      return;
    }

    setIsImporting(true);
    const res = await bulkImportExamQuestions(exam.id, parsed);
    setIsImporting(false);

    if (res.success) {
      toast.success("Impor Berhasil", res.message);
      setIsImportModalOpen(false);
      setImportJsonText("");
      // Refresh page to load freshly added questions
      window.location.reload();
    } else {
      toast.error("Gagal Impor Soal", res.message);
    }
  };

  // Sample JSON Template for Import
  const sampleImportJson = JSON.stringify(
    [
      {
        section: "TWK (Nasionalisme)",
        questionText: "Contoh teks pertanyaan nomor 1...",
        options: [
          { key: "A", text: "Opsi jawaban A" },
          { key: "B", text: "Opsi jawaban B" },
          { key: "C", text: "Opsi jawaban C" },
          { key: "D", text: "Opsi jawaban D" },
          { key: "E", text: "Opsi jawaban E" },
        ],
        correctKey: "A",
        points: 5,
        explanation: "Pembahasan konsep dasar mengapa A benar...",
      },
    ],
    null,
    2
  );

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard/ujian"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B6882] hover:text-[#09408C] mb-2 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Daftar Paket Ujian</span>
          </Link>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-[#EAF1FA] text-[#09408C] text-[11px] font-bold border border-[#9AC1E2]">
              {exam.category.replace("_", " ")}
            </span>
            <span className="text-xs text-[#5B6882]">
              ID: {exam.id}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                exam.isActive
                  ? "bg-[#E3F4EC] text-[#1F6F4A]"
                  : "bg-[#F4F7FB] text-[#5B6882] border border-[#D5DDEB]"
              }`}
            >
              {exam.isActive ? "Status: Aktif" : "Status: Draf"}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-[#09408C] font-display mt-1">
            {exam.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#5B6882] mt-1 max-w-3xl leading-relaxed">
            {exam.description || "Bank kisi-kisi soal dan simulasi ujian CAT digital Sahabat Belajar."}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Link
            href={`/portal/ujian/${exam.id}`}
            target="_blank"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#D5DDEB] text-[#09408C] text-xs font-semibold hover:bg-[#EAF1FA] transition-colors"
            title="Uji coba tampilan ujian CAT di sisi siswa"
          >
            <ExternalLink size={14} />
            <span>Simulasi Siswa</span>
          </Link>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#09408C] text-[#09408C] text-xs font-semibold hover:bg-[#EAF1FA] transition-colors"
            title="Impor batch soal via format JSON"
          >
            <FileUp size={14} />
            <span>Impor Batch</span>
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571] transition-colors shadow-xs"
          >
            <Plus size={16} />
            <span>Tambah Soal</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#D5DDEB] shadow-2xs">
          <div className="text-[11px] text-[#5B6882] font-medium flex items-center gap-1">
            <Clock size={13} className="text-[#09408C]" />
            <span>Durasi Timer</span>
          </div>
          <div className="text-xl font-bold text-[#09408C] font-display mt-1">
            {exam.durationMinutes} Menit
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#D5DDEB] shadow-2xs">
          <div className="text-[11px] text-[#5B6882] font-medium flex items-center gap-1">
            <Award size={13} className="text-[#1F6F4A]" />
            <span>Passing Grade</span>
          </div>
          <div className="text-xl font-bold text-[#1F6F4A] font-display mt-1">
            {exam.passingGrade} Poin
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#D5DDEB] shadow-2xs">
          <div className="text-[11px] text-[#5B6882] font-medium flex items-center gap-1">
            <BookOpen size={13} className="text-[#295897]" />
            <span>Jumlah Butir Soal</span>
          </div>
          <div className="text-xl font-bold text-[#1B2A41] font-display mt-1">
            {questions.length} Butir
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#D5DDEB] shadow-2xs">
          <div className="text-[11px] text-[#5B6882] font-medium flex items-center gap-1">
            <Layers size={13} className="text-[#0CC0DF]" />
            <span>Total Skor Maksimal</span>
          </div>
          <div className="text-xl font-bold text-[#09408C] font-display mt-1">
            {maxScorePossible} Poin
          </div>
        </div>
      </div>

      {/* Question Bank Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#D5DDEB] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-2.5 text-[#5B6882]" />
            <input
              type="text"
              placeholder="Cari butir soal berdasarkan kata kunci teks, pilihan opsi, atau materi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D5DDEB] focus-ring bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#5B6882] font-semibold shrink-0">
              Menampilkan {filteredQuestions.length} dari {questions.length} Soal
            </span>
          </div>
        </div>

        {/* Section Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#D5DDEB]/60">
          <button
            onClick={() => setActiveSectionFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeSectionFilter === "ALL"
                ? "bg-[#09408C] text-white shadow-xs"
                : "bg-[#F4F7FB] text-[#5B6882] hover:bg-[#EAF1FA] hover:text-[#09408C]"
            }`}
          >
            <span>Semua Sub-Materi</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeSectionFilter === "ALL"
                  ? "bg-white/20 text-white"
                  : "bg-[#D5DDEB]/60 text-[#5B6882]"
              }`}
            >
              {questions.length}
            </span>
          </button>

          {uniqueSections.map((sec) => {
            const isSelected = activeSectionFilter === sec;
            const count = sectionsCount[sec] || 0;
            return (
              <button
                key={sec}
                onClick={() => setActiveSectionFilter(sec)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[#09408C] text-white shadow-xs"
                    : "bg-[#F4F7FB] text-[#5B6882] hover:bg-[#EAF1FA] hover:text-[#09408C]"
                }`}
              >
                <span>{sec}</span>
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

      {/* Question Cards List */}
      {filteredQuestions.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#D5DDEB]">
          <HelpCircle size={40} className="mx-auto text-[#9AC1E2] mb-3" />
          <h3 className="text-base font-bold text-[#1B2A41]">
            {search
              ? `Tidak ditemukan soal yang memuat "${search}"`
              : "Belum ada butir soal pada kategori ini"}
          </h3>
          <p className="text-xs text-[#5B6882] mt-1 max-w-md mx-auto">
            {search
              ? "Coba gunakan kata kunci lain atau bersihkan pencarian untuk melihat semua butir soal."
              : "Mulai masukkan butir soal pilihan ganda A-E beserta kunci jawaban dan pembahasan konsep dasar Sahabat Belajar."}
          </p>
          {search ? (
            <button
              onClick={() => setSearch("")}
              className="mt-4 px-4 py-2 rounded-xl bg-[#EAF1FA] text-[#09408C] text-xs font-bold hover:bg-[#9AC1E2]/30 transition-colors"
            >
              Reset Pencarian
            </button>
          ) : (
            <button
              onClick={openCreateModal}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571]"
            >
              <Plus size={16} />
              <span>Tambah Soal Pertama</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((q, idx) => (
            <div
              key={q.id || idx}
              className="bg-white rounded-2xl border border-[#D5DDEB] p-5 shadow-xs hover:border-[#9AC1E2] transition-colors group"
            >
              {/* Header Soal */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="w-7 h-7 rounded-lg bg-[#09408C] text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {q.questionNumber || idx + 1}
                  </span>
                  {q.section && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#F4F7FB] border border-[#D5DDEB] text-[11px] font-semibold text-[#09408C]">
                      {q.section}
                    </span>
                  )}
                  <span className="text-[11px] font-semibold text-[#1F6F4A] bg-[#E3F4EC] px-2 py-0.5 rounded-md">
                    Bobot: {q.points || 5} Poin
                  </span>
                  <span className="text-xs font-bold text-[#1F6F4A] flex items-center gap-1 ml-1">
                    <CheckCircle2 size={13} />
                    <span>Kunci: {q.correctKey}</span>
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {/* Clone Question Button */}
                  <button
                    type="button"
                    onClick={() => handleDuplicateQuestion(q)}
                    disabled={duplicatingQId === q.id}
                    className="p-1.5 rounded-lg text-[#5B6882] hover:text-[#09408C] hover:bg-[#EAF1FA] transition-colors"
                    title="Duplikasi Butir Soal Ini"
                  >
                    {duplicatingQId === q.id ? (
                      <RefreshCw size={15} className="animate-spin text-[#09408C]" />
                    ) : (
                      <Copy size={15} />
                    )}
                  </button>

                  <button
                    onClick={() => openEditModal(q)}
                    className="p-1.5 rounded-lg text-[#5B6882] hover:text-[#09408C] hover:bg-[#EAF1FA] transition-colors"
                    title="Edit Butir Soal"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(q.id, q.questionNumber || idx + 1)}
                    className="p-1.5 rounded-lg text-[#5B6882] hover:text-[#B4381F] hover:bg-[#FBE9E5] transition-colors"
                    title="Hapus Butir Soal"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <p className="text-xs sm:text-sm text-[#1B2A41] leading-relaxed whitespace-pre-line font-medium mb-4">
                {q.questionText}
              </p>

              {/* Options List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {q.options.map((opt) => {
                  const isCorrect = opt.key === q.correctKey;
                  return (
                    <div
                      key={opt.key}
                      className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 transition-colors ${
                        isCorrect
                          ? "bg-[#E3F4EC]/60 border-[#1F6F4A] text-[#1F6F4A] font-semibold"
                          : "bg-[#F4F7FB]/50 border-[#D5DDEB] text-[#1B2A41]"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-md text-[11px] font-bold flex items-center justify-center shrink-0 ${
                          isCorrect
                            ? "bg-[#1F6F4A] text-white"
                            : "bg-[#D5DDEB] text-[#5B6882]"
                        }`}
                      >
                        {opt.key}
                      </span>
                      <span className="flex-1 leading-snug">{opt.text}</span>
                      {opt.points !== undefined && (
                        <span className="text-[10px] text-[#5B6882] bg-white px-1.5 py-0.5 rounded border border-[#D5DDEB]">
                          {opt.points} pt
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Pembahasan Konseptual */}
              {q.explanation && (
                <div className="bg-[#EAF1FA]/60 rounded-xl p-3 border border-[#9AC1E2]/40 text-xs text-[#09408C]">
                  <div className="font-bold flex items-center gap-1.5 mb-1 text-[11px] uppercase tracking-wide">
                    <Sparkles size={13} className="text-[#09408C]" />
                    <span>Pembahasan Konsep Dasar (Sahabat Belajar):</span>
                  </div>
                  <p className="leading-relaxed text-[#1B2A41]">
                    {q.explanation}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Tambah / Edit Soal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-xl border border-[#D5DDEB] max-h-[90vh] overflow-y-auto space-y-5 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xl font-bold text-[#09408C] font-display">
                {editingQuestion ? "Edit Butir Soal" : "Tambah Butir Soal Baru"}
              </h3>
              <p className="text-xs text-[#5B6882] mt-0.5">
                Masukkan teks soal, pilihan A s.d E, tentukan kunci jawaban, serta penjelasan konsep dasar.
              </p>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="q-section-input" className="block text-xs font-bold text-[#1B2A41] mb-1">
                    Bagian / Sub-Materi
                  </label>
                  <input
                    id="q-section-input"
                    type="text"
                    required
                    placeholder="Contoh: TWK (Nasionalisme) atau TPS Kuantitatif"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5DDEB] focus-ring"
                  />
                </div>

                <div>
                  <label htmlFor="q-points-input" className="block text-xs font-bold text-[#1B2A41] mb-1">
                    Bobot Poin Benar
                  </label>
                  <input
                    id="q-points-input"
                    type="number"
                    required
                    min={1}
                    value={points}
                    onChange={(e) => setPoints(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5DDEB] focus-ring"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="q-text-input" className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Teks Pertanyaan Soal *
                </label>
                <textarea
                  id="q-text-input"
                  rows={4}
                  required
                  placeholder="Tuliskan butir pertanyaan secara jelas dan terstruktur..."
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring"
                />
              </div>

              {/* Pilihan Jawaban */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#1B2A41]">
                  Pilihan Jawaban (A s.d E) {isTKP && "(dengan skala poin 1-5)"}
                </label>

                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-[#09408C] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    A
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Teks Pilihan A"
                    value={optA}
                    onChange={(e) => setOptA(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring"
                  />
                  {isTKP && (
                    <input
                      type="number"
                      min={1}
                      max={5}
                      title="Skor Poin Opsi A (1-5)"
                      value={ptsA}
                      onChange={(e) => setPtsA(e.target.value)}
                      className="w-14 px-2 py-1.5 text-xs rounded-xl border border-[#D5DDEB] text-center font-bold"
                    />
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-[#09408C] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    B
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Teks Pilihan B"
                    value={optB}
                    onChange={(e) => setOptB(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring"
                  />
                  {isTKP && (
                    <input
                      type="number"
                      min={1}
                      max={5}
                      title="Skor Poin Opsi B (1-5)"
                      value={ptsB}
                      onChange={(e) => setPtsB(e.target.value)}
                      className="w-14 px-2 py-1.5 text-xs rounded-xl border border-[#D5DDEB] text-center font-bold"
                    />
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-[#09408C] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    C
                  </span>
                  <input
                    type="text"
                    placeholder="Teks Pilihan C (Opsional)"
                    value={optC}
                    onChange={(e) => setOptC(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring"
                  />
                  {isTKP && (
                    <input
                      type="number"
                      min={1}
                      max={5}
                      title="Skor Poin Opsi C (1-5)"
                      value={ptsC}
                      onChange={(e) => setPtsC(e.target.value)}
                      className="w-14 px-2 py-1.5 text-xs rounded-xl border border-[#D5DDEB] text-center font-bold"
                    />
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-[#09408C] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    D
                  </span>
                  <input
                    type="text"
                    placeholder="Teks Pilihan D (Opsional)"
                    value={optD}
                    onChange={(e) => setOptD(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring"
                  />
                  {isTKP && (
                    <input
                      type="number"
                      min={1}
                      max={5}
                      title="Skor Poin Opsi D (1-5)"
                      value={ptsD}
                      onChange={(e) => setPtsD(e.target.value)}
                      className="w-14 px-2 py-1.5 text-xs rounded-xl border border-[#D5DDEB] text-center font-bold"
                    />
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-[#09408C] text-white text-xs font-bold flex items-center justify-center shrink-0">
                    E
                  </span>
                  <input
                    type="text"
                    placeholder="Teks Pilihan E (Opsional)"
                    value={optE}
                    onChange={(e) => setOptE(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring"
                  />
                  {isTKP && (
                    <input
                      type="number"
                      min={1}
                      max={5}
                      title="Skor Poin Opsi E (1-5)"
                      value={ptsE}
                      onChange={(e) => setPtsE(e.target.value)}
                      className="w-14 px-2 py-1.5 text-xs rounded-xl border border-[#D5DDEB] text-center font-bold"
                    />
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="q-correct-key-select" className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Kunci Jawaban Benar *
                </label>
                <select
                  id="q-correct-key-select"
                  value={correctKey}
                  onChange={(e) => setCorrectKey(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5DDEB] focus-ring bg-white font-bold text-[#1F6F4A]"
                >
                  {availableOptionKeys.length > 0 ? (
                    availableOptionKeys.map((o) => (
                      <option key={o.key} value={o.key}>
                        Pilihan {o.key}: {o.text.length > 40 ? o.text.substring(0, 40) + "..." : o.text}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="A">Pilihan A</option>
                      <option value="B">Pilihan B</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label htmlFor="q-explanation-input" className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Pembahasan Konsep Dasar & Trik Logis
                </label>
                <textarea
                  id="q-explanation-input"
                  rows={3}
                  placeholder="Uraikan alasan mengapa jawaban tersebut benar dan konsep dasar yang melandasinya..."
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
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
                  {isSubmitting ? "Menyimpan..." : editingQuestion ? "Perbarui Soal" : "Simpan Soal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Impor Batch Soal (JSON) */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-xl border border-[#D5DDEB] space-y-4 animate-in fade-in duration-200">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-[#09408C] font-display flex items-center gap-2">
                  <FileUp size={20} />
                  <span>Impor Batch Butir Soal (JSON)</span>
                </h3>
                <p className="text-xs text-[#5B6882] mt-0.5">
                  Tempel data soal dalam format array JSON untuk menambahkan banyak soal sekaligus.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setImportJsonText(sampleImportJson)}
                className="px-3 py-1.5 rounded-xl bg-[#EAF1FA] text-[#09408C] text-[11px] font-bold hover:bg-[#9AC1E2]/30 transition-colors shrink-0"
              >
                Gunakan Contoh Format
              </button>
            </div>

            <div>
              <label htmlFor="import-json-area" className="block text-xs font-bold text-[#1B2A41] mb-1">
                Data JSON Soal *
              </label>
              <textarea
                id="import-json-area"
                rows={10}
                required
                placeholder={sampleImportJson}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-[#D5DDEB] focus-ring bg-[#F4F7FB]/50"
              />
            </div>

            <div className="pt-3 border-t border-[#D5DDEB] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5B6882] hover:bg-[#F4F7FB]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleBulkImport}
                disabled={isImporting}
                className="px-5 py-2.5 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571] disabled:opacity-50 flex items-center gap-1.5"
              >
                {isImporting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Mengimpor...</span>
                  </>
                ) : (
                  <>
                    <FileUp size={14} />
                    <span>Mulai Impor Soal</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
