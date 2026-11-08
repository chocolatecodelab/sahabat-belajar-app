"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  Sparkles,
  TrendingUp,
  Share2,
  Printer,
  ChevronDown,
  Filter,
  Check,
  GraduationCap,
} from "lucide-react";
import type { ExamItem, ExamQuestion, StudentExamSession } from "@/actions/ujian";

export default function ExamResultClient({
  exam,
  sessionId,
  initialSession = null,
}: {
  exam: ExamItem;
  sessionId: string;
  initialSession?: StudentExamSession | null;
}) {
  const [filterMode, setFilterMode] = useState<"ALL" | "WRONG" | "CORRECT">("ALL");
  const [sectionFilter, setSectionFilter] = useState("ALL");
  const [copied, setCopied] = useState(false);
  const [sessionData, setSessionData] = useState<{
    score: number;
    isPassed: boolean;
    answers: Record<string, { selectedKey: string; isDoubtful?: boolean }>;
    durationSecondsUsed: number;
    submittedAt: string;
  } | null>(initialSession ? {
    score: initialSession.score,
    isPassed: initialSession.isPassed,
    answers: initialSession.answers as any,
    durationSecondsUsed: initialSession.durationSecondsUsed,
    submittedAt: initialSession.submittedAt || new Date().toISOString(),
  } : null);

  useEffect(() => {
    if (initialSession) return;

    const cached = sessionStorage.getItem(`sb_exam_res_${sessionId}`);
    if (cached) {
      try {
        setSessionData(JSON.parse(cached));
      } catch (e) {
        console.error("Failed to parse cached session data", e);
      }
    } else {
      setSessionData({
        score: exam.category === "CPNS_BUMN" ? 405 : 620,
        isPassed: true,
        answers: {},
        durationSecondsUsed: 4200,
        submittedAt: new Date().toISOString(),
      });
    }
  }, [sessionId, exam.category, initialSession]);

  const questions = exam.questions || [];

  // Calculate detailed accuracy
  let totalCorrect = 0;
  let totalAnswered = 0;

  questions.forEach((q) => {
    const userAns = sessionData?.answers?.[q.id]?.selectedKey;
    if (userAns) {
      totalAnswered++;
      if (userAns === q.correctKey) {
        totalCorrect++;
      }
    }
  });

  // Calculate section scores
  const sectionBreakdown: Record<string, { total: number; correct: number; maxPoints: number; earnedPoints: number }> = {};
  const sectionsList: string[] = [];

  questions.forEach((q) => {
    const sec = q.section || "Umum";
    if (!sectionsList.includes(sec)) {
      sectionsList.push(sec);
    }

    if (!sectionBreakdown[sec]) {
      sectionBreakdown[sec] = { total: 0, correct: 0, maxPoints: 0, earnedPoints: 0 };
    }
    sectionBreakdown[sec].total += 1;
    sectionBreakdown[sec].maxPoints += q.points || 5;

    const userAns = sessionData?.answers?.[q.id]?.selectedKey;
    if (userAns === q.correctKey) {
      sectionBreakdown[sec].correct += 1;
      sectionBreakdown[sec].earnedPoints += q.points || 5;
    }
  });

  const isPassed = sessionData
    ? sessionData.score >= exam.passingGrade
    : true;

  const filteredQuestions = questions.filter((q) => {
    const userAns = sessionData?.answers?.[q.id]?.selectedKey;
    const isCorrect = userAns === q.correctKey;

    const matchStatus =
      filterMode === "ALL" ||
      (filterMode === "CORRECT" && isCorrect) ||
      (filterMode === "WRONG" && !isCorrect);

    const matchSection =
      sectionFilter === "ALL" || q.section === sectionFilter;

    return matchStatus && matchSection;
  });

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m} Menit ${s} Detik`;
  };

  const handleShare = () => {
    const text = `Alhamdulillah! Saya telah menyelesaikan ${exam.title} di Sahabat Belajar dengan perolehan skor ${sessionData?.score} (Passing Grade: ${exam.passingGrade}) - Status: ${isPassed ? "LULUS" : "EVALUASI"}. #BersamaSahabat #SahabatBelajar`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-[#1B2A41] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation & Action Bar (Hidden on Print) */}
        <div className="flex items-center justify-between gap-4 print:hidden">
          <Link
            href="/portal"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B6882] hover:text-[#09408C] transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Portal Siswa</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#D5DDEB] text-xs font-semibold text-[#09408C] hover:bg-[#EAF1FA] transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              {copied ? <Check size={14} className="text-[#1F6F4A]" /> : <Share2 size={14} />}
              <span>{copied ? "Teks Disalin!" : "Bagikan Hasil"}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#D5DDEB] text-xs font-semibold text-[#09408C] hover:bg-[#EAF1FA] transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Printer size={14} />
              <span>Cetak Rapor Nilai</span>
            </button>

            <Link
              href={`/portal/ujian/${exam.id}`}
              className="px-3.5 py-2 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571] transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <RotateCcw size={14} />
              <span>Ulangi Tryout</span>
            </Link>
          </div>
        </div>

        {/* Print-Only Official Report Header */}
        <div className="hidden print:block border-b-2 border-[#09408C] pb-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-[#09408C] font-display">
                SAHABAT BELAJAR
              </h1>
              <p className="text-xs text-[#5B6882]">
                Comprehensive Academic Solution • Bimbel Privat & Semi-Privat
              </p>
            </div>
            <div className="text-right text-xs">
              <div className="font-bold text-[#09408C]">LEMBAR HASIL SIMULASI CAT</div>
              <div className="text-[#5B6882]">No. Sesi: {sessionId}</div>
            </div>
          </div>
        </div>

        {/* Hero Result Banner */}
        <div
          className={`rounded-3xl p-6 sm:p-8 border shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 ${
            isPassed
              ? "bg-linear-to-r from-[#E3F4EC] to-white border-[#1F6F4A]/30"
              : "bg-linear-to-r from-[#FBE9E5] to-white border-[#B4381F]/30"
          }`}
        >
          <div className="flex items-center gap-5 text-center md:text-left">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                isPassed
                  ? "bg-[#1F6F4A] text-white"
                  : "bg-[#B4381F] text-white"
              }`}
            >
              <Award size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    isPassed
                      ? "bg-[#E3F4EC] text-[#1F6F4A] border-[#1F6F4A]/30"
                      : "bg-[#FBE9E5] text-[#B4381F] border-[#B4381F]/30"
                  }`}
                >
                  {isPassed ? "MEMENUHI PASSING GRADE" : "BELUM MEMENUHI PASSING GRADE"}
                </span>
                <span className="text-xs text-[#5B6882]">#BersamaSahabat</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#09408C] font-display mt-1">
                {isPassed ? "Luar Biasa! Anda Berhasil Lulus" : "Tetap Semangat! Terus Asah Konsep"}
              </h1>
              <p className="text-xs sm:text-sm text-[#5B6882] mt-1 max-w-xl">
                {isPassed
                  ? "Skor Anda telah melampaui nilai ambang batas kelulusan. Pertahankan ritme belajar dan telaah pembahasan untuk menyempurnakan strategi pengerjaan."
                  : "Evaluasi butir soal yang belum tepat melalui pembahasan konsep dasar di bawah ini untuk persiapan tryout berikutnya."}
              </p>
            </div>
          </div>

          {/* Big Score Box */}
          <div className="bg-white rounded-2xl p-5 border border-[#D5DDEB] shadow-xs text-center shrink-0 min-w-44">
            <div className="text-[11px] font-bold text-[#5B6882] uppercase tracking-wider">
              Total Skor Akhir
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#09408C] font-display mt-0.5 tabular-nums">
              {sessionData?.score || 0}
            </div>
            <div className="text-[11px] text-[#5B6882] mt-1">
              Passing Grade: <strong className="text-[#1F6F4A]">{exam.passingGrade}</strong>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-[#D5DDEB] shadow-2xs">
            <div className="text-[11px] text-[#5B6882] font-medium flex items-center gap-1">
              <CheckCircle2 size={14} className="text-[#1F6F4A]" />
              <span>Jawaban Benar</span>
            </div>
            <div className="text-xl font-bold text-[#1F6F4A] font-display mt-1 tabular-nums">
              {totalCorrect} / {questions.length}
            </div>
            <div className="text-[10px] text-[#5B6882] mt-0.5">
              Akurasi {questions.length > 0 ? Math.round((totalCorrect / questions.length) * 100) : 0}%
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#D5DDEB] shadow-2xs">
            <div className="text-[11px] text-[#5B6882] font-medium flex items-center gap-1">
              <XCircle size={14} className="text-[#B4381F]" />
              <span>Jawaban Salah / Kosong</span>
            </div>
            <div className="text-xl font-bold text-[#B4381F] font-display mt-1 tabular-nums">
              {questions.length - totalCorrect}
            </div>
            <div className="text-[10px] text-[#5B6882] mt-0.5">
              Butir perlu dievaluasi
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#D5DDEB] shadow-2xs">
            <div className="text-[11px] text-[#5B6882] font-medium flex items-center gap-1">
              <Clock size={14} className="text-[#09408C]" />
              <span>Durasi Digunakan</span>
            </div>
            <div className="text-base font-bold text-[#09408C] font-display mt-1">
              {formatDuration(sessionData?.durationSecondsUsed || 0)}
            </div>
            <div className="text-[10px] text-[#5B6882] mt-0.5">
              Dari alokasi {exam.durationMinutes} menit
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#D5DDEB] shadow-2xs">
            <div className="text-[11px] text-[#5B6882] font-medium flex items-center gap-1">
              <TrendingUp size={14} className="text-[#0CC0DF]" />
              <span>Prediksi Kelulusan</span>
            </div>
            <div className="text-base font-bold text-[#09408C] font-display mt-1">
              {isPassed ? "Tinggi (Zona Aman)" : "Perlu Penguatan"}
            </div>
            <div className="text-[10px] text-[#5B6882] mt-0.5">
              Berdasarkan passing grade
            </div>
          </div>
        </div>

        {/* Breakdown Sub-Materi (Rapor Digital) */}
        {Object.keys(sectionBreakdown).length > 0 && (
          <div className="bg-white rounded-3xl border border-[#D5DDEB] p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#09408C] font-display">
                  Rapor Analisis Sub-Materi / Sesi
                </h2>
                <p className="text-xs text-[#5B6882] mt-0.5">
                  Rincian performa nilai per komponen materi bimbingan.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Object.entries(sectionBreakdown).map(([secName, data]) => {
                const percentage = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
                return (
                  <div
                    key={secName}
                    className="p-4 rounded-2xl bg-[#F4F7FB] border border-[#D5DDEB] space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-[#09408C]">
                      <span>{secName}</span>
                      <span className="tabular-nums">{data.correct}/{data.total} Benar</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 rounded-full bg-[#D5DDEB] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          percentage >= 70
                            ? "bg-[#1F6F4A]"
                            : percentage >= 50
                            ? "bg-[#09408C]"
                            : "bg-[#F5B82E]"
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#5B6882] pt-1">
                      <span>Perolehan Poin</span>
                      <strong className="text-[#1B2A41] tabular-nums">
                        {data.earnedPoints} pt
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Discussion / Pembahasan Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#09408C] font-display flex items-center gap-2">
                <BookOpen size={20} />
                <span>Pembahasan Soal & Kunci Jawaban</span>
              </h2>
              <p className="text-xs text-[#5B6882] mt-0.5">
                Bedah tuntas konsep dasar dan logika pemecahan masalah bersama Sahabat Belajar.
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#D5DDEB]">
                <button
                  onClick={() => setFilterMode("ALL")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filterMode === "ALL"
                      ? "bg-[#09408C] text-white shadow-2xs"
                      : "text-[#5B6882] hover:text-[#09408C]"
                  }`}
                >
                  Semua ({questions.length})
                </button>
                <button
                  onClick={() => setFilterMode("CORRECT")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filterMode === "CORRECT"
                      ? "bg-[#1F6F4A] text-white shadow-2xs"
                      : "text-[#5B6882] hover:text-[#1F6F4A]"
                  }`}
                >
                  Benar ({totalCorrect})
                </button>
                <button
                  onClick={() => setFilterMode("WRONG")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filterMode === "WRONG"
                      ? "bg-[#B4381F] text-white shadow-2xs"
                      : "text-[#5B6882] hover:text-[#B4381F]"
                  }`}
                >
                  Salah ({questions.length - totalCorrect})
                </button>
              </div>

              {/* Sub-Section Filter Dropdown */}
              {sectionsList.length > 1 && (
                <select
                  value={sectionFilter}
                  onChange={(e) => setSectionFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-[#D5DDEB] bg-white text-xs font-semibold text-[#09408C] focus-ring"
                >
                  <option value="ALL">Semua Sub-Materi</option>
                  {sectionsList.map((sec) => (
                    <option key={sec} value={sec}>
                      {sec}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* List of Questions with Discussion */}
          <div className="space-y-4">
            {filteredQuestions.map((q, idx) => {
              const userAns = sessionData?.answers?.[q.id]?.selectedKey;
              const isCorrect = userAns === q.correctKey;

              return (
                <div
                  key={q.id || idx}
                  className="bg-white rounded-3xl border border-[#D5DDEB] p-5 sm:p-6 shadow-xs space-y-4"
                >
                  {/* Top Meta */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-7 h-7 rounded-lg bg-[#09408C] text-white font-bold text-xs flex items-center justify-center">
                        {q.questionNumber || idx + 1}
                      </span>
                      {q.section && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#F4F7FB] border border-[#D5DDEB] text-[11px] font-semibold text-[#09408C]">
                          {q.section}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {userAns ? (
                        isCorrect ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E3F4EC] text-[#1F6F4A] text-xs font-bold border border-[#1F6F4A]/30">
                            <CheckCircle2 size={13} />
                            <span>Jawaban Anda Benar (+{q.points || 5} Poin)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FBE9E5] text-[#B4381F] text-xs font-bold border border-[#B4381F]/30">
                            <XCircle size={13} />
                            <span>Jawaban Anda: {userAns} (Salah)</span>
                          </span>
                        )
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F4F7FB] text-[#5B6882] text-xs font-semibold border border-[#D5DDEB]">
                          Tidak Dijawab
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question Text */}
                  <p className="text-xs sm:text-sm text-[#1B2A41] font-medium leading-relaxed whitespace-pre-line">
                    {q.questionText}
                  </p>

                  {/* Options List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt) => {
                      const isCorrectKey = opt.key === q.correctKey;
                      const isUserChoice = opt.key === userAns;

                      let itemStyle = "bg-[#F4F7FB]/40 border-[#D5DDEB] text-[#1B2A41]";
                      if (isCorrectKey) {
                        itemStyle = "bg-[#E3F4EC] border-[#1F6F4A] text-[#1F6F4A] font-semibold";
                      } else if (isUserChoice && !isCorrectKey) {
                        itemStyle = "bg-[#FBE9E5] border-[#B4381F] text-[#B4381F]";
                      }

                      return (
                        <div
                          key={opt.key}
                          className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${itemStyle}`}
                        >
                          <span
                            className={`w-5 h-5 rounded-md text-[11px] font-bold flex items-center justify-center shrink-0 ${
                              isCorrectKey
                                ? "bg-[#1F6F4A] text-white"
                                : isUserChoice
                                ? "bg-[#B4381F] text-white"
                                : "bg-[#D5DDEB] text-[#5B6882]"
                            }`}
                          >
                            {opt.key}
                          </span>
                          <span className="leading-snug flex-1">{opt.text}</span>
                          {isCorrectKey && (
                            <span className="text-[10px] font-bold text-[#1F6F4A] bg-white px-2 py-0.5 rounded-md border border-[#1F6F4A]/30">
                              Kunci Benar
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Pembahasan Konsep Dasar */}
                  {q.explanation && (
                    <div className="bg-[#EAF1FA] rounded-2xl p-4 border border-[#9AC1E2] text-xs text-[#09408C] space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-xs text-[#09408C]">
                        <Sparkles size={14} className="text-[#09408C]" />
                        <span>Pembahasan Konsep Dasar:</span>
                      </div>
                      <p className="leading-relaxed text-[#1B2A41] whitespace-pre-line">
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Print Signature Footer (Only in Print) */}
        <div className="hidden print:flex justify-between pt-12 text-xs">
          <div>
            <p className="text-[#5B6882]">Siswa Peserta Tryout,</p>
            <div className="h-16"></div>
            <p className="font-bold text-[#1B2A41] underline">Ahmad Fauzi</p>
          </div>
          <div className="text-right">
            <p className="text-[#5B6882]">Kepala Akademik Sahabat Belajar,</p>
            <div className="h-16"></div>
            <p className="font-bold text-[#09408C] underline">Dr. Hendra Wijaya, M.Pd.</p>
          </div>
        </div>

        {/* Next Step Banner (Hidden on Print) */}
        <div className="bg-[#09408C] text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md print:hidden">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xl font-bold font-display">
              Ingin Memperdalam Materi Bersama Tutor Ahli?
            </h3>
            <p className="text-xs sm:text-sm text-white/80 max-w-xl">
              Diskusikan soal-soal sulit dan strategi cepat pada sesi bimbingan tatap muka atau video call 1-on-1.
            </p>
          </div>

          <Link
            href="/portal"
            className="px-6 py-3 rounded-xl bg-white text-[#09408C] font-bold text-xs sm:text-sm hover:bg-[#EAF1FA] transition-colors shadow-xs shrink-0"
          >
            Kembali ke Portal Siswa
          </Link>
        </div>
      </div>
    </div>
  );
}
