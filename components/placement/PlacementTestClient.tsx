"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Award,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Target,
  BarChart2,
  Share2,
  RotateCcw,
  BookOpen,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import {
  DIAGNOSTIC_QUESTIONS,
  submitDiagnosticPlacement,
  type DiagnosticResult,
} from "@/actions/placement";

export default function PlacementTestClient() {
  const [step, setStep] = useState<"intro" | "quiz" | "result">("intro");

  // Candidate Data Form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [targetProgram, setTargetProgram] = useState("CPNS & BUMN");

  // Quiz State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes (600 seconds)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);

  // Timer Effect
  useEffect(() => {
    if (step !== "quiz") return;
    if (timeLeft <= 0) {
      handleFinalSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const handleStartQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert("Mohon masukkan nama lengkap dan nomor WhatsApp aktif Anda.");
      return;
    }
    setStep("quiz");
  };

  const handleSelectAnswer = (questionId: string, key: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: key }));
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    const res = await submitDiagnosticPlacement({
      name,
      phone,
      email,
      targetProgram,
      answers,
    });
    setIsSubmitting(false);

    if (res.success && res.data) {
      setResult(res.data);
      setStep("result");
    } else {
      alert(res.message || "Gagal memproses tes. Silakan coba kembali.");
    }
  };

  const currentQ = DIAGNOSTIC_QUESTIONS[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round((answeredCount / DIAGNOSTIC_QUESTIONS.length) * 100);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // WhatsApp Consultation Link
  const getWhatsAppConsultationUrl = () => {
    if (!result) return "";
    const cleanPhone = "628123456789"; // Admin default
    const text =
      `Halo Admin Sahabat Belajar! 🎓\n\n` +
      `Saya baru saja menyelesaikan *Placement Test Diagnostik Online* di website:\n` +
      `• Nama: *${name}*\n` +
      `• Program Minat: *${targetProgram}*\n` +
      `• Skor Kesiapan: *${result.percentage}% (${result.score}/${result.maxScore} Soal Benar)*\n` +
      `• Rekomendasi Paket: *${result.recommendedPackage}*\n\n` +
      `Saya ingin berkonsultasi mengenai hasil tes dan pendaftaran bimbingan belajar. Terima kasih! #BersamaSahabat`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 font-sans text-[#1B2A41]">
      <div className="space-y-6">
        {/* ================= STEP 1: INTRO & FORM ================= */}
        {step === "intro" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#09408C] via-[#0E3571] to-[#295897] rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none"></div>

              <div className="relative z-10 space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-xs">
                  <Target size={14} />
                  <span>Uji Kemampuan Awal 10 Menit</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white leading-tight">
                  Placement Test & Pemetaan Potensi Akademik
                </h1>
                <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                  Ketahui sejauh mana kesiapan konsep dasar Anda di bidang <strong>Verbal</strong>, <strong>Penalaran Numerik</strong>, dan <strong>Logika Analitik</strong>. Dapatkan rekomendasi paket bimbingan belajar yang tepat dan terukur.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature Highlights */}
              <div className="md:col-span-1 space-y-3">
                <div className="bg-white rounded-2xl p-5 border border-[#D5DDEB] space-y-3 shadow-xs">
                  <h3 className="font-heading font-bold text-sm text-[#1B2A41]">
                    Keuntungan Ikuti Tes Ini:
                  </h3>
                  <div className="space-y-2.5 text-xs text-[#5B6882]">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-[#1F6F4A] shrink-0 mt-0.5" />
                      <span><strong>10 Soal Terkurasi</strong> menguji pondasi berpikir kritis & penalaran.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-[#1F6F4A] shrink-0 mt-0.5" />
                      <span><strong>Peta Kekuatan & Kelemahan</strong> langsung keluar seketika.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-[#1F6F4A] shrink-0 mt-0.5" />
                      <span><strong>Rekomendasi Paket Bimbingan</strong> personal sesuai kebutuhan Anda.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-[#1F6F4A] shrink-0 mt-0.5" />
                      <span><strong>100% Gratis</strong> tanpa dipungut biaya apapun.</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#EAF1FA] rounded-2xl p-4 border border-[#9AC1E2] text-xs text-[#09408C] space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <ShieldCheck size={16} />
                    <span>#BersamaSahabat</span>
                  </div>
                  <p className="text-[11px] text-[#5B6882]">
                    Data Anda aman dan hanya digunakan untuk keperluan konsultasi belajar.
                  </p>
                </div>
              </div>

              {/* Registration Form */}
              <div className="md:col-span-2">
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#D5DDEB] shadow-xs space-y-5">
                  <div>
                    <h3 className="text-lg font-heading font-bold text-[#09408C]">
                      Lengkapi Data Diri Sebelum Memulai
                    </h3>
                    <p className="text-xs text-[#5B6882] mt-0.5">
                      Hasil tes dan analisis lengkap akan kami tautkan ke profil WhatsApp Anda.
                    </p>
                  </div>

                  <form onSubmit={handleStartQuiz} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1B2A41] mb-1.5">
                        Nama Lengkap <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Budi Santoso"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#D5DDEB] text-xs text-[#1B2A41] placeholder:text-[#5B6882]/60 focus:outline-none focus:border-[#09408C] bg-[#F4F7FB]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#1B2A41] mb-1.5">
                          Nomor WhatsApp <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="0812xxxxxxx"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-[#D5DDEB] text-xs text-[#1B2A41] placeholder:text-[#5B6882]/60 focus:outline-none focus:border-[#09408C] bg-[#F4F7FB]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#1B2A41] mb-1.5">
                          Email (Opsional)
                        </label>
                        <input
                          type="email"
                          placeholder="nama@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-[#D5DDEB] text-xs text-[#1B2A41] placeholder:text-[#5B6882]/60 focus:outline-none focus:border-[#09408C] bg-[#F4F7FB]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#1B2A41] mb-1.5">
                        Fokus Program yang Dituju <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={targetProgram}
                        onChange={(e) => setTargetProgram(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#D5DDEB] text-xs text-[#1B2A41] focus:outline-none focus:border-[#09408C] bg-[#F4F7FB]"
                      >
                        <option value="CPNS & BUMN">Persiapan CPNS, BUMN & Kedinasan</option>
                        <option value="UTBK-SNBT">UTBK-SNBT Masuk PTN</option>
                        <option value="TOEFL & IELTS">TOEFL ITP / IELTS / Bahasa Inggris</option>
                        <option value="S2 & Beasiswa">S2 / S3 & Beasiswa (LPDP / AAS)</option>
                        <option value="K-12 (SD/SMP/SMA)">Bimbingan Belajar K-12 (SD / SMP / SMA)</option>
                      </select>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-[#09408C] hover:bg-[#0E3571] text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-2"
                      >
                        <span>Mulai Tes Diagnostik Sekarang (10 Menit)</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: QUIZ IN PROGRESS ================= */}
        {step === "quiz" && (
          <div className="space-y-5">
            {/* Quiz Top Bar */}
            <div className="bg-white rounded-2xl border border-[#D5DDEB] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-[#09408C] text-white flex items-center justify-center font-bold text-xs">
                  {currentIndex + 1}
                </span>
                <div>
                  <div className="text-xs font-bold text-[#09408C]">
                    Soal {currentIndex + 1} dari {DIAGNOSTIC_QUESTIONS.length}
                  </div>
                  <div className="text-[11px] text-[#5B6882]">
                    Kategori: {currentQ.categoryLabel}
                  </div>
                </div>
              </div>

              {/* Timer & Progress */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold font-mono">
                  <Clock size={14} className="text-amber-700 animate-pulse" />
                  <span>{formatTimer(timeLeft)}</span>
                </div>

                <div className="text-xs text-[#5B6882]">
                  Terjawab: <strong className="text-[#09408C]">{answeredCount}</strong>/
                  {DIAGNOSTIC_QUESTIONS.length}
                </div>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-3xl border border-[#D5DDEB] p-6 sm:p-8 shadow-xs space-y-6">
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#09408C] bg-[#EAF1FA] px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {currentQ.category}
                </span>
                <h3 className="text-base sm:text-lg font-heading font-bold text-[#1B2A41] leading-relaxed pt-1">
                  {currentQ.questionText}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options.map((opt) => {
                  const isSelected = answers[currentQ.id] === opt.key;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleSelectAnswer(currentQ.id, opt.key)}
                      className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all ${
                        isSelected
                          ? "bg-[#EAF1FA] border-[#09408C] shadow-xs"
                          : "bg-white border-[#D5DDEB] hover:border-[#9AC1E2] hover:bg-slate-50/50"
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                          isSelected
                            ? "bg-[#09408C] text-white"
                            : "bg-[#F4F7FB] text-[#5B6882] border border-[#D5DDEB]"
                        }`}
                      >
                        {opt.key}
                      </span>
                      <span
                        className={`text-xs sm:text-sm pt-0.5 leading-relaxed ${
                          isSelected ? "font-bold text-[#09408C]" : "text-[#1B2A41]"
                        }`}
                      >
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Controls */}
              <div className="pt-4 border-t border-[#D5DDEB] flex items-center justify-between">
                <button
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 rounded-xl border border-[#D5DDEB] text-xs font-semibold text-[#5B6882] hover:bg-slate-50 transition-colors disabled:opacity-40 flex items-center gap-1.5"
                >
                  <ArrowLeft size={14} />
                  <span>Sebelumnya</span>
                </button>

                <div className="flex items-center gap-2">
                  {currentIndex < DIAGNOSTIC_QUESTIONS.length - 1 ? (
                    <button
                      onClick={() =>
                        setCurrentIndex((prev) =>
                          Math.min(DIAGNOSTIC_QUESTIONS.length - 1, prev + 1)
                        )
                      }
                      className="px-5 py-2 rounded-xl bg-[#09408C] hover:bg-[#0E3571] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <span>Selanjutnya</span>
                      <ArrowRight size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={handleFinalSubmit}
                      disabled={isSubmitting}
                      className="px-6 py-2.5 rounded-xl bg-[#1F6F4A] hover:bg-[#155337] text-white text-xs font-bold transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>Menganalisis Hasil...</span>
                      ) : (
                        <>
                          <CheckCircle2 size={15} />
                          <span>Kumpulkan & Lihat Hasil</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Question Jump Grid */}
            <div className="bg-white rounded-2xl border border-[#D5DDEB] p-4">
              <div className="text-[11px] font-bold text-[#5B6882] mb-2 uppercase tracking-wider">
                Navigasi Butir Soal:
              </div>
              <div className="flex flex-wrap gap-2">
                {DIAGNOSTIC_QUESTIONS.map((q, idx) => {
                  const isAnswered = !!answers[q.id];
                  const isCurrent = idx === currentIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                        isCurrent
                          ? "ring-2 ring-[#09408C] ring-offset-1 bg-[#09408C] text-white"
                          : isAnswered
                          ? "bg-[#E3F4EC] text-[#1F6F4A] border border-[#1F6F4A]/30"
                          : "bg-[#F4F7FB] text-[#5B6882] border border-[#D5DDEB] hover:border-[#9AC1E2]"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: DIAGNOSTIC RESULT REPORT ================= */}
        {step === "result" && result && (
          <div className="space-y-6">
            {/* Header Result Card */}
            <div className="bg-gradient-to-r from-[#09408C] via-[#0E3571] to-[#295897] rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2">
                  <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full font-semibold">
                    Laporan Hasil Placement Test
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white">
                    {name}
                  </h2>
                  <p className="text-xs sm:text-sm text-white/80">
                    Minat Program: <strong>{targetProgram}</strong> | WhatsApp: {phone}
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-2xl p-5 text-center min-w-[160px]">
                  <div className="text-[11px] text-white/80 uppercase font-semibold">
                    Skor Kesiapan Awal
                  </div>
                  <div className="text-4xl font-black font-heading text-white mt-1">
                    {result.percentage}%
                  </div>
                  <div className="text-[11px] text-[#9AC1E2] font-semibold mt-1">
                    {result.score} dari {result.maxScore} Soal Benar
                  </div>
                </div>
              </div>
            </div>

            {/* Category Breakdown Bars */}
            <div className="bg-white rounded-3xl border border-[#D5DDEB] p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#09408C] font-heading">
                    Peta Penguasaan Konsep per Aspek
                  </h3>
                  <p className="text-xs text-[#5B6882] mt-0.5">
                    Hasil evaluasi diagnostik pada 3 pilar kompetensi utama.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Verbal */}
                <div className="bg-[#F4F7FB] p-4 rounded-2xl border border-[#D5DDEB] space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-[#1B2A41]">Kemampuan Verbal</span>
                    <span className="text-[#09408C] font-bold">
                      {result.breakdown.verbal.percentage}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[#D5DDEB] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#09408C]"
                      style={{ width: `${result.breakdown.verbal.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-[11px] text-[#5B6882]">
                    {result.breakdown.verbal.correct}/{result.breakdown.verbal.total} Soal Benar
                  </div>
                </div>

                {/* Kuantitatif */}
                <div className="bg-[#F4F7FB] p-4 rounded-2xl border border-[#D5DDEB] space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-[#1B2A41]">Penalaran Kuantitatif</span>
                    <span className="text-[#09408C] font-bold">
                      {result.breakdown.kuantitatif.percentage}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[#D5DDEB] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#09408C]"
                      style={{ width: `${result.breakdown.kuantitatif.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-[11px] text-[#5B6882]">
                    {result.breakdown.kuantitatif.correct}/{result.breakdown.kuantitatif.total} Soal Benar
                  </div>
                </div>

                {/* Logika */}
                <div className="bg-[#F4F7FB] p-4 rounded-2xl border border-[#D5DDEB] space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-[#1B2A41]">Logika & Analitis</span>
                    <span className="text-[#09408C] font-bold">
                      {result.breakdown.logika.percentage}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[#D5DDEB] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#09408C]"
                      style={{ width: `${result.breakdown.logika.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-[11px] text-[#5B6882]">
                    {result.breakdown.logika.correct}/{result.breakdown.logika.total} Soal Benar
                  </div>
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-[#E3F4EC] p-4 rounded-2xl border border-[#1F6F4A]/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#1F6F4A]">
                    <CheckCircle2 size={16} />
                    <span>Kekuatan Utama Anda:</span>
                  </div>
                  <ul className="text-xs text-[#1B2A41] space-y-1 pl-5 list-disc">
                    {result.strengths.length > 0 ? (
                      result.strengths.map((s, i) => <li key={i}>{s}</li>)
                    ) : (
                      <li>Fondasi awal merata di seluruh kategori</li>
                    )}
                  </ul>
                </div>

                <div className="bg-[#FEF7E6] p-4 rounded-2xl border border-[#F5B82E]/50 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#B45309]">
                    <AlertCircle size={16} />
                    <span>Area yang Perlu Ditingkatkan:</span>
                  </div>
                  <ul className="text-xs text-[#1B2A41] space-y-1 pl-5 list-disc">
                    {result.areasToImprove.length > 0 ? (
                      result.areasToImprove.map((w, i) => <li key={i}>{w}</li>)
                    ) : (
                      <li>Tingkatkan kecepatan waktu pengerjaan di bawah 45 detik</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Recommended Learning Path */}
            <div className="bg-white rounded-3xl border border-[#D5DDEB] p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#EAF1FA] text-[#09408C] flex items-center justify-center shrink-0">
                  <BookOpen size={24} />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-[#09408C] uppercase tracking-wider">
                    Solusi Bimbingan Belajar Sahabat Belajar
                  </div>
                  <h4 className="font-heading font-bold text-base text-[#1B2A41]">
                    Rekomendasi Paket Belajar: {result.recommendedPackage}
                  </h4>
                </div>
              </div>

              <p className="text-xs text-[#5B6882] leading-relaxed">
                Berdasarkan hasil tes diagnostik, bimbingan belajar dengan tutor spesialis Sahabat Belajar akan difokuskan untuk membedah konsep dasar yang belum tuntas, trik cepat pengerjaan soal HOTS, serta latihan simulasi berkala.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <a
                  href={getWhatsAppConsultationUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-5 rounded-xl bg-[#09408C] hover:bg-[#0E3571] text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-2"
                >
                  <Share2 size={16} />
                  <span>Konsultasikan Hasil Tes ke Admin via WhatsApp</span>
                </a>

                <button
                  onClick={() => {
                    setStep("intro");
                    setAnswers({});
                    setTimeLeft(600);
                  }}
                  className="py-3 px-4 rounded-xl border border-[#D5DDEB] text-xs font-semibold text-[#5B6882] hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <RotateCcw size={14} />
                  <span>Coba Lagi</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
