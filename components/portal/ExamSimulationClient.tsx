"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowLeft,
  ArrowRight,
  Send,
  Flag,
  Sparkles,
  LayoutGrid,
  X,
  Keyboard,
  RotateCcw,
  Type,
  Check,
} from "lucide-react";
import type { ExamItem, ExamQuestion } from "@/actions/ujian";
import { submitExamSession } from "@/actions/ujian";
import { useToast } from "@/components/ui/Toast";

interface AnswerState {
  selectedKey: string;
  isDoubtful?: boolean;
}

export default function ExamSimulationClient({
  exam,
  studentId = "std_demo",
  studentName = "Ahmad Fauzi",
}: {
  exam: ExamItem;
  studentId?: string;
  studentName?: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const questions: ExamQuestion[] = useMemo(
    () => exam.questions || [],
    [exam.questions]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(
    exam.durationMinutes * 60
  );
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isKeyboardModalOpen, setIsKeyboardModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [fontSize, setFontSize] = useState<"normal" | "medium" | "large">("normal");
  const [activeSectionFilter, setActiveSectionFilter] = useState("ALL");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Restore previous answers from localStorage if available
  useEffect(() => {
    const storageKey = `sb_exam_${studentId}_${exam.id}_answers`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setAnswers(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved answers", e);
      }
    }
  }, [exam.id, studentId]);

  // Persist answers
  const saveAnswers = (newAnswers: Record<string, AnswerState>) => {
    setAnswers(newAnswers);
    try {
      localStorage.setItem(
        `sb_exam_${studentId}_${exam.id}_answers`,
        JSON.stringify(newAnswers)
      );
    } catch (e) {}
  };

  // Persistent cheat-proof timer
  useEffect(() => {
    const timerStorageKey = `sb_exam_${studentId}_${exam.id}_targetEndTime`;
    let targetEndTime: number;

    const savedTarget = localStorage.getItem(timerStorageKey);
    if (savedTarget) {
      targetEndTime = Number(savedTarget);
      const remaining = Math.max(0, Math.floor((targetEndTime - Date.now()) / 1000));
      setSecondsRemaining(remaining);
      if (remaining <= 0) {
        handleAutoSubmit();
        return;
      }
    } else {
      targetEndTime = Date.now() + exam.durationMinutes * 60 * 1000;
      localStorage.setItem(timerStorageKey, String(targetEndTime));
      setSecondsRemaining(exam.durationMinutes * 60);
    }

    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.floor((targetEndTime - Date.now()) / 1000));
      setSecondsRemaining(remaining);
      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        handleAutoSubmit();
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [exam.id, exam.durationMinutes, studentId]);

  // Prevent accidental navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isSubmitting) {
        e.preventDefault();
        e.returnValue = "Ujian sedang berlangsung. Apakah Anda yakin ingin meninggalkan ruang ujian?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isSubmitting]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const currentQ = questions[currentIndex];

  const handleSelectOption = (key: string) => {
    if (!currentQ) return;
    const existing = answers[currentQ.id] || { selectedKey: "" };
    saveAnswers({
      ...answers,
      [currentQ.id]: {
        ...existing,
        selectedKey: key,
      },
    });
  };

  const handleClearChoice = () => {
    if (!currentQ) return;
    const next = { ...answers };
    delete next[currentQ.id];
    saveAnswers(next);
  };

  const handleToggleDoubtful = () => {
    if (!currentQ) return;
    const existing = answers[currentQ.id] || { selectedKey: "" };
    saveAnswers({
      ...answers,
      [currentQ.id]: {
        ...existing,
        isDoubtful: !existing.isDoubtful,
      },
    });
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isSubmitModalOpen) setIsSubmitModalOpen(false);
        if (isKeyboardModalOpen) setIsKeyboardModalOpen(false);
        if (isDrawerOpen) setIsDrawerOpen(false);
        return;
      }

      if (
        isSubmitModalOpen ||
        isKeyboardModalOpen ||
        ["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)
      ) {
        return;
      }

      const key = e.key.toUpperCase();
      if (["A", "B", "C", "D", "E"].includes(key)) {
        if (currentQ?.options?.some((o) => o.key === key)) {
          handleSelectOption(key);
        }
      } else if (key === "R") {
        handleToggleDoubtful();
      } else if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1));
      } else if (key === "H" || e.key === "Backspace") {
        handleClearChoice();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, currentQ, answers, isSubmitModalOpen, isKeyboardModalOpen, isDrawerOpen, questions.length]);

  // Section list
  const uniqueSections = useMemo(() => {
    const list: string[] = [];
    questions.forEach((q) => {
      if (q.section && !list.includes(q.section)) {
        list.push(q.section);
      }
    });
    return list;
  }, [questions]);

  // Filtered question palette
  const displayedQuestionIndices = useMemo(() => {
    return questions
      .map((q, idx) => ({ q, idx }))
      .filter(({ q }) => {
        if (activeSectionFilter === "ALL") return true;
        return q.section === activeSectionFilter;
      });
  }, [questions, activeSectionFilter]);

  // Stats calculation
  const stats = useMemo(() => {
    let answered = 0;
    let doubtful = 0;
    questions.forEach((q) => {
      const a = answers[q.id];
      if (a?.selectedKey) {
        answered++;
        if (a.isDoubtful) doubtful++;
      } else if (a?.isDoubtful) {
        doubtful++;
      }
    });
    const unanswered = questions.length - answered;
    return { answered, doubtful, unanswered };
  }, [questions, answers]);

  const handleAutoSubmit = async () => {
    toast.warning(
      "Waktu Habis",
      "Waktu ujian telah berakhir. Jawaban Anda otomatis dikumpulkan."
    );
    await executeSubmit();
  };

  const executeSubmit = async () => {
    setIsSubmitting(true);
    const totalAllocatedSec = exam.durationMinutes * 60;
    const durationUsed = Math.min(
      totalAllocatedSec,
      Math.max(1, totalAllocatedSec - Math.max(0, secondsRemaining))
    );

    const res = await submitExamSession({
      examId: exam.id,
      studentId,
      studentName,
      durationSecondsUsed: durationUsed,
      answers,
    });

    setIsSubmitting(false);

    if (res.success && res.data) {
      try {
        localStorage.removeItem(`sb_exam_${studentId}_${exam.id}_answers`);
        localStorage.removeItem(`sb_exam_${studentId}_${exam.id}_targetEndTime`);
      } catch (e) {}

      try {
        sessionStorage.setItem(
          `sb_exam_res_${res.data.sessionId}`,
          JSON.stringify({
            exam,
            score: res.data.score,
            isPassed: res.data.isPassed,
            answers,
            durationSecondsUsed: durationUsed,
            submittedAt: new Date().toISOString(),
          })
        );
      } catch (e) {}

      router.push(`/portal/ujian/${exam.id}/hasil?sessionId=${res.data.sessionId}`);
    } else {
      toast.error("Gagal Mengumpulkan", res.message || "Gagal mengumpulkan ujian.");
    }
  };

  if (!currentQ) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md text-center border border-[#D5DDEB] shadow-sm">
          <AlertCircle size={40} className="mx-auto text-[#09408C] mb-3" />
          <h2 className="text-lg font-bold text-[#09408C]">
            Soal Ujian Belum Tersedia
          </h2>
          <p className="text-xs text-[#5B6882] mt-1 mb-4">
            Paket ujian ini belum memiliki butir soal yang diinput oleh admin.
          </p>
          <button
            onClick={() => router.push("/portal")}
            className="px-4 py-2 rounded-xl bg-[#09408C] text-white text-xs font-semibold"
          >
            Kembali ke Portal Siswa
          </button>
        </div>
      </div>
    );
  }

  const isDoubtfulCurrent = !!answers[currentQ.id]?.isDoubtful;
  const selectedKeyCurrent = answers[currentQ.id]?.selectedKey;
  const isTimeCritical = secondsRemaining < 300;

  const fontStyles = {
    normal: {
      question: "text-sm sm:text-base leading-relaxed",
      option: "text-xs sm:text-sm leading-relaxed",
    },
    medium: {
      question: "text-base sm:text-lg leading-relaxed",
      option: "text-sm sm:text-base leading-relaxed",
    },
    large: {
      question: "text-lg sm:text-xl leading-relaxed",
      option: "text-base sm:text-lg leading-relaxed",
    },
  }[fontSize];

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-[#1B2A41] flex flex-col font-sans select-none">
      {/* Top Bar - Distraction Free Exam Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#D5DDEB] shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Brand & Exam Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white p-0.5 border border-[#D5DDEB] flex items-center justify-center shrink-0 shadow-xs">
              <Image
                src="/images/logo-sahabat-belajar.png"
                alt="Sahabat Belajar"
                width={36}
                height={36}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#09408C] uppercase tracking-wider block">
                  Simulasi CAT Digital Sahabat Belajar
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-[#1F6F4A] bg-[#E3F4EC] px-1.5 py-0.2 rounded-full font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1F6F4A]"></span>
                  Tersimpan Otomatis
                </span>
              </div>
              <h1 className="text-xs sm:text-sm font-bold text-[#1B2A41] truncate font-display">
                {exam.title}
              </h1>
            </div>
          </div>

          {/* Right Controls: Font Adjuster, Keyboard Help, Timer & Submit */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Font Size Adjuster (BKN CAT standard) */}
            <div className="hidden sm:flex items-center bg-[#F4F7FB] rounded-xl p-0.5 border border-[#D5DDEB]">
              <button
                onClick={() => setFontSize("normal")}
                className={`px-2 py-1 text-xs rounded-lg font-bold transition-all ${
                  fontSize === "normal"
                    ? "bg-[#09408C] text-white shadow-2xs"
                    : "text-[#5B6882] hover:text-[#09408C]"
                }`}
                title="Ukuran Font Normal"
              >
                A
              </button>
              <button
                onClick={() => setFontSize("medium")}
                className={`px-2 py-1 text-xs rounded-lg font-bold transition-all ${
                  fontSize === "medium"
                    ? "bg-[#09408C] text-white shadow-2xs"
                    : "text-[#5B6882] hover:text-[#09408C]"
                }`}
                title="Ukuran Font Sedang"
              >
                A+
              </button>
              <button
                onClick={() => setFontSize("large")}
                className={`px-2 py-1 text-xs rounded-lg font-bold transition-all ${
                  fontSize === "large"
                    ? "bg-[#09408C] text-white shadow-2xs"
                    : "text-[#5B6882] hover:text-[#09408C]"
                }`}
                title="Ukuran Font Besar"
              >
                A++
              </button>
            </div>

            {/* Keyboard Shortcuts Trigger */}
            <button
              onClick={() => setIsKeyboardModalOpen(true)}
              className="hidden md:flex p-2 rounded-xl border border-[#D5DDEB] text-[#5B6882] hover:text-[#09408C] hover:bg-[#EAF1FA] transition-colors"
              title="Shortcut Keyboard"
            >
              <Keyboard size={16} />
            </button>

            {/* Timer Badge */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-bold tabular-nums transition-colors shadow-2xs ${
                isTimeCritical
                  ? "bg-[#FBE9E5] text-[#B4381F] border-[#B4381F] animate-pulse"
                  : "bg-[#EAF1FA] text-[#09408C] border-[#9AC1E2]"
              }`}
            >
              <Clock size={16} />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>

            {/* Mobile Sheet Trigger */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-[#D5DDEB] text-[#09408C] hover:bg-[#EAF1FA]"
              title="Daftar Soal"
            >
              <LayoutGrid size={18} />
            </button>

            {/* Finish Button (Desktop) */}
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#09408C] text-white text-xs font-bold hover:bg-[#0E3571] transition-colors shadow-xs"
            >
              <Send size={14} />
              <span>Selesai Ujian</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Question & Answers (Span 8 or 9) */}
        <section className="lg:col-span-8 xl:col-span-9 flex flex-col justify-between space-y-6">
          {/* Question Card */}
          <div className="bg-white rounded-3xl border border-[#D5DDEB] p-5 sm:p-8 shadow-xs flex-1 flex flex-col justify-between">
            <div>
              {/* Question Meta Header */}
              <div className="flex items-center justify-between gap-3 pb-4 mb-5 border-b border-[#D5DDEB]">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-xl bg-[#09408C] text-white text-xs font-bold font-display shadow-2xs">
                    Nomor {currentQ.questionNumber || currentIndex + 1}
                  </span>
                  {currentQ.section && (
                    <span className="px-3 py-1 rounded-full bg-[#EAF1FA] text-[#09408C] text-xs font-bold border border-[#9AC1E2]/60">
                      {currentQ.section}
                    </span>
                  )}
                  <span className="text-[11px] font-semibold text-[#1F6F4A] bg-[#E3F4EC] px-2 py-0.5 rounded-md">
                    Bobot: {currentQ.points || 5} Poin
                  </span>
                </div>

                <div className="text-xs text-[#5B6882]">
                  Soal <strong className="text-[#09408C]">{currentIndex + 1}</strong> dari{" "}
                  <strong>{questions.length}</strong>
                </div>
              </div>

              {/* Question Text */}
              <div className={`${fontStyles.question} text-[#1B2A41] font-medium mb-6 whitespace-pre-line`}>
                {currentQ.questionText}
              </div>

              {/* Answer Options */}
              <div className="space-y-3">
                {currentQ.options.map((opt) => {
                  const isSelected = selectedKeyCurrent === opt.key;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleSelectOption(opt.key)}
                      className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all flex items-start gap-3.5 group cursor-pointer ${
                        isSelected
                          ? "bg-[#EAF1FA] border-[#09408C] shadow-xs text-[#09408C] font-semibold"
                          : "bg-white border-[#D5DDEB] hover:border-[#9AC1E2] hover:bg-[#F4F7FB]/50 text-[#1B2A41]"
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-xl text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? "bg-[#09408C] text-white"
                            : "bg-[#F4F7FB] border border-[#D5DDEB] text-[#5B6882] group-hover:border-[#09408C] group-hover:text-[#09408C]"
                        }`}
                      >
                        {opt.key}
                      </span>
                      <span className={`${fontStyles.option} pt-0.5 flex-1`}>
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation & Controls */}
            <div className="mt-8 pt-5 border-t border-[#D5DDEB] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="px-4 py-2.5 rounded-xl border border-[#D5DDEB] text-xs font-semibold text-[#1B2A41] hover:bg-[#F4F7FB] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft size={15} />
                  <span>Sebelumnya</span>
                </button>

                <button
                  onClick={handleToggleDoubtful}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isDoubtfulCurrent
                      ? "bg-[#F5B82E] text-[#1B2A41] shadow-xs"
                      : "bg-[#F4F7FB] border border-[#D5DDEB] text-[#5B6882] hover:text-[#1B2A41]"
                  }`}
                >
                  <Flag
                    size={14}
                    className={isDoubtfulCurrent ? "fill-[#1B2A41]" : ""}
                  />
                  <span>
                    {isDoubtfulCurrent ? "Ragu-ragu (Aktif)" : "Ragu-ragu"}
                  </span>
                </button>

                {/* Clear Answer Button */}
                {selectedKeyCurrent && (
                  <button
                    onClick={handleClearChoice}
                    className="px-3 py-2.5 rounded-xl border border-red-200 bg-red-50/50 text-[#B4381F] text-xs font-semibold hover:bg-red-100 transition-colors flex items-center gap-1"
                    title="Kosongkan jawaban untuk soal ini"
                  >
                    <RotateCcw size={13} />
                    <span className="hidden sm:inline">Hapus Pilihan</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={() =>
                      setCurrentIndex((prev) =>
                        Math.min(questions.length - 1, prev + 1)
                      )
                    }
                    className="px-5 py-2.5 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571] transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Berikutnya</span>
                    <ArrowRight size={15} />
                  </button>
                ) : (
                  <button
                    onClick={() => setIsSubmitModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-[#1F6F4A] text-white text-xs font-bold hover:bg-[#18583B] transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Send size={14} />
                    <span>Kumpulkan Ujian</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Question Navigator Palette (Desktop) */}
        <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 space-y-5">
          <div className="bg-white rounded-3xl border border-[#D5DDEB] p-5 sm:p-6 shadow-xs sticky top-24">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-[#09408C] font-display">
                Nomor Soal
              </h3>
              <span className="text-[11px] font-semibold text-[#5B6882]">
                Total {questions.length} Butir
              </span>
            </div>

            {/* Sub-test Filter Tabs */}
            {uniqueSections.length > 1 && (
              <div className="flex flex-wrap gap-1 mb-4 pb-3 border-b border-[#D5DDEB]">
                <button
                  onClick={() => setActiveSectionFilter("ALL")}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                    activeSectionFilter === "ALL"
                      ? "bg-[#09408C] text-white"
                      : "bg-[#F4F7FB] text-[#5B6882] hover:bg-[#EAF1FA]"
                  }`}
                >
                  Semua
                </button>
                {uniqueSections.map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setActiveSectionFilter(sec)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all truncate max-w-28 ${
                      activeSectionFilter === sec
                        ? "bg-[#09408C] text-white"
                        : "bg-[#F4F7FB] text-[#5B6882] hover:bg-[#EAF1FA]"
                    }`}
                  >
                    {sec.split(" ")[0].replace("(", "")}
                  </button>
                ))}
              </div>
            )}

            {/* Grid Palette */}
            <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto pr-1">
              {displayedQuestionIndices.map(({ q, idx }) => {
                const ans = answers[q.id];
                const isCurrent = idx === currentIndex;
                const isAnswered = !!ans?.selectedKey;
                const isDoubtful = !!ans?.isDoubtful;

                let colorClasses =
                  "bg-white border-[#D5DDEB] text-[#1B2A41] hover:border-[#09408C]";
                if (isDoubtful) {
                  colorClasses =
                    "bg-[#F5B82E] text-[#1B2A41] border-[#F5B82E] font-bold";
                } else if (isAnswered) {
                  colorClasses =
                    "bg-[#09408C] text-white border-[#09408C] font-bold";
                }

                if (isCurrent) {
                  colorClasses += " ring-2 ring-offset-2 ring-[#0CC0DF]";
                }

                return (
                  <button
                    key={q.id || idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 rounded-xl border text-xs flex items-center justify-center transition-all ${colorClasses}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Status Legend */}
            <div className="mt-5 pt-4 border-t border-[#D5DDEB] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#5B6882]">
                  <span className="w-3.5 h-3.5 rounded-md bg-[#09408C]"></span>
                  <span>Sudah Dijawab</span>
                </div>
                <strong className="text-[#09408C] tabular-nums">
                  {stats.answered}
                </strong>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#5B6882]">
                  <span className="w-3.5 h-3.5 rounded-md bg-[#F5B82E]"></span>
                  <span>Ragu-ragu</span>
                </div>
                <strong className="text-[#1B2A41] tabular-nums">
                  {stats.doubtful}
                </strong>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#5B6882]">
                  <span className="w-3.5 h-3.5 rounded-md bg-white border border-[#D5DDEB]"></span>
                  <span>Belum Dijawab</span>
                </div>
                <strong className="text-[#B4381F] tabular-nums">
                  {stats.unanswered}
                </strong>
              </div>
            </div>

            {/* Submit Action */}
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="mt-5 w-full py-2.5 rounded-xl bg-[#09408C] text-white text-xs font-bold hover:bg-[#0E3571] transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              <Send size={14} />
              <span>Kumpulkan Jawaban</span>
            </button>
          </div>
        </aside>
      </main>

      {/* Mobile Drawer Question Palette */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end justify-center lg:hidden">
          <div className="bg-white rounded-t-3xl w-full p-6 max-h-[80vh] overflow-y-auto space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#D5DDEB]">
              <div>
                <h3 className="font-bold text-sm text-[#09408C] font-display">
                  Daftar Nomor Soal
                </h3>
                <span className="text-[11px] text-[#5B6882]">
                  {stats.answered} dari {questions.length} terjawab
                </span>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                aria-label="Tutup daftar soal"
                className="p-1.5 rounded-lg text-[#5B6882] hover:bg-[#F4F7FB]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const ans = answers[q.id];
                const isCurrent = idx === currentIndex;
                const isAnswered = !!ans?.selectedKey;
                const isDoubtful = !!ans?.isDoubtful;

                let colorClasses =
                  "bg-white border-[#D5DDEB] text-[#1B2A41]";
                if (isDoubtful) {
                  colorClasses =
                    "bg-[#F5B82E] text-[#1B2A41] border-[#F5B82E] font-bold";
                } else if (isAnswered) {
                  colorClasses =
                    "bg-[#09408C] text-white border-[#09408C] font-bold";
                }

                if (isCurrent) {
                  colorClasses += " ring-2 ring-[#0CC0DF]";
                }

                return (
                  <button
                    key={q.id || idx}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setIsDrawerOpen(false);
                    }}
                    className={`h-11 rounded-xl border text-xs flex items-center justify-center font-bold ${colorClasses}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Mobile Drawer Submit Button */}
            <div className="pt-3 border-t border-[#D5DDEB]">
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  setIsSubmitModalOpen(true);
                }}
                className="w-full py-3 rounded-xl bg-[#09408C] text-white text-xs font-bold hover:bg-[#0E3571] transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <Send size={14} />
                <span>Kumpulkan Ujian ({stats.answered}/{questions.length} Terjawab)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Cheat Sheet Modal */}
      {isKeyboardModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl border border-[#D5DDEB] space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-[#D5DDEB]">
              <div className="flex items-center gap-2">
                <Keyboard size={18} className="text-[#09408C]" />
                <h3 className="text-sm font-bold text-[#09408C] font-display">
                  Shortcut Keyboard CAT
                </h3>
              </div>
              <button
                onClick={() => setIsKeyboardModalOpen(false)}
                aria-label="Tutup petunjuk keyboard"
                className="p-1 rounded-lg text-[#5B6882] hover:bg-[#F4F7FB]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#F4F7FB]">
                <span className="text-[#5B6882]">Pilih Jawaban A - E</span>
                <kbd className="px-2 py-1 rounded-md bg-white border border-[#D5DDEB] font-bold text-[#09408C] shadow-2xs">
                  A / B / C / D / E
                </kbd>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-[#F4F7FB]">
                <span className="text-[#5B6882]">Tandai Ragu-ragu</span>
                <kbd className="px-2 py-1 rounded-md bg-white border border-[#D5DDEB] font-bold text-[#F5B82E] shadow-2xs">
                  R
                </kbd>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-[#F4F7FB]">
                <span className="text-[#5B6882]">Soal Sebelumnya / Berikutnya</span>
                <div className="flex gap-1">
                  <kbd className="px-2 py-1 rounded-md bg-white border border-[#D5DDEB] font-bold text-[#1B2A41] shadow-2xs">
                    ←
                  </kbd>
                  <kbd className="px-2 py-1 rounded-md bg-white border border-[#D5DDEB] font-bold text-[#1B2A41] shadow-2xs">
                    →
                  </kbd>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-[#F4F7FB]">
                <span className="text-[#5B6882]">Hapus Pilihan Jawaban</span>
                <kbd className="px-2 py-1 rounded-md bg-white border border-[#D5DDEB] font-bold text-[#B4381F] shadow-2xs">
                  H / Backspace
                </kbd>
              </div>
            </div>

            <button
              onClick={() => setIsKeyboardModalOpen(false)}
              className="w-full py-2 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571]"
            >
              Tutup Petunjuk
            </button>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#D5DDEB] space-y-5 animate-in fade-in duration-200">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[#EAF1FA] text-[#09408C] flex items-center justify-center mx-auto mb-3">
                <Send size={24} />
              </div>
              <h3 className="text-lg font-bold text-[#09408C] font-display">
                Konfirmasi Kumpulkan Ujian
              </h3>
              <p className="text-xs text-[#5B6882] mt-1">
                Periksa kembali ringkasan jawaban Anda sebelum mengakhiri sesi ujian.
              </p>
            </div>

            {/* Recap Box */}
            <div className="bg-[#F4F7FB] p-4 rounded-2xl border border-[#D5DDEB] grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <div className="text-[10px] text-[#5B6882]">Terjawab</div>
                <div className="text-lg font-bold text-[#09408C]">
                  {stats.answered}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#5B6882]">Ragu-ragu</div>
                <div className="text-lg font-bold text-[#F5B82E]">
                  {stats.doubtful}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#5B6882]">Kosong</div>
                <div className="text-lg font-bold text-[#B4381F]">
                  {stats.unanswered}
                </div>
              </div>
            </div>

            {stats.unanswered > 0 && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-[#FBE9E5] text-[#B4381F] text-xs">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>
                  Masih ada <strong>{stats.unanswered} soal</strong> yang belum Anda jawab. Apakah Anda yakin ingin mengumpulkan sekarang?
                </span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#D5DDEB] text-xs font-semibold text-[#5B6882] hover:bg-[#F4F7FB]"
              >
                Lanjut Mengerjakan
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={executeSubmit}
                className="flex-1 py-2.5 rounded-xl bg-[#09408C] text-white text-xs font-bold hover:bg-[#0E3571] disabled:opacity-50 shadow-xs"
              >
                {isSubmitting ? "Mengumpulkan..." : "Ya, Kumpulkan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
