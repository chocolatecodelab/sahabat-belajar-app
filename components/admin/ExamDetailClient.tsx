"use client";

import { useState } from "react";
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
} from "lucide-react";
import type { ExamItem, ExamQuestion, QuestionOption } from "@/actions/ujian";
import { createExamQuestion } from "@/actions/ujian";

export default function ExamDetailClient({
  exam,
}: {
  exam: ExamItem;
}) {
  const [questions, setQuestions] = useState<ExamQuestion[]>(
    exam.questions || []
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New question form state
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

  const sectionsCount = questions.reduce((acc, q) => {
    const sec = q.section || "Umum";
    acc[sec] = (acc[sec] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    const options: QuestionOption[] = [
      { key: "A", text: optA.trim() },
      { key: "B", text: optB.trim() },
      { key: "C", text: optC.trim() },
      { key: "D", text: optD.trim() },
      { key: "E", text: optE.trim() },
    ].filter((o) => o.text.length > 0);

    if (options.length < 2) {
      alert("Harap masukkan minimal pilihan A dan B.");
      return;
    }

    setIsSubmitting(true);
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
      // Reset form
      setQuestionText("");
      setExplanation("");
      setOptA("");
      setOptB("");
      setOptC("");
      setOptD("");
      setOptE("");
    } else {
      alert(res.message);
    }
  };

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
            <span>Kembali ke Paket Ujian</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#EAF1FA] text-[#09408C] text-[11px] font-bold border border-[#9AC1E2]">
              {exam.category.replace("_", " ")}
            </span>
            <span className="text-xs text-[#5B6882]">
              ID: {exam.id}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-[#09408C] font-display mt-1">
            {exam.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#5B6882] mt-1 max-w-3xl">
            {exam.description || "Bank soal dan simulasi ujian CAT digital Sahabat Belajar."}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/portal/ujian/${exam.id}`}
            target="_blank"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#D5DDEB] text-[#09408C] text-xs font-semibold hover:bg-[#EAF1FA] transition-colors"
          >
            <ExternalLink size={14} />
            <span>Uji Coba CAT</span>
          </Link>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571] transition-colors shadow-xs"
          >
            <Plus size={16} />
            <span>Tambah Soal</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#D5DDEB] shadow-2xs">
          <div className="text-[11px] text-[#5B6882] font-medium flex items-center gap-1">
            <Clock size={13} className="text-[#09408C]" />
            <span>Durasi Ujian</span>
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
            {exam.passingGrade}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#D5DDEB] shadow-2xs">
          <div className="text-[11px] text-[#5B6882] font-medium flex items-center gap-1">
            <BookOpen size={13} className="text-[#295897]" />
            <span>Jumlah Soal</span>
          </div>
          <div className="text-xl font-bold text-[#1B2A41] font-display mt-1">
            {questions.length} Butir
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#D5DDEB] shadow-2xs">
          <div className="text-[11px] text-[#5B6882] font-medium flex items-center gap-1">
            <Layers size={13} className="text-[#0CC0DF]" />
            <span>Sub-Materi / Sesi</span>
          </div>
          <div className="text-xs font-bold text-[#09408C] mt-2 flex flex-wrap gap-1">
            {Object.keys(sectionsCount).length > 0 ? (
              Object.entries(sectionsCount).map(([sec, count]) => (
                <span
                  key={sec}
                  className="px-2 py-0.5 rounded-md bg-[#F4F7FB] border border-[#D5DDEB] text-[10px]"
                >
                  {sec}: {count}
                </span>
              ))
            ) : (
              <span className="text-[#5B6882] text-xs">Belum ada soal</span>
            )}
          </div>
        </div>
      </div>

      {/* Question Bank List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#09408C] font-display flex items-center gap-2">
            <span>Daftar Butir Soal & Kunci Jawaban</span>
            <span className="px-2 py-0.5 rounded-full bg-[#EAF1FA] text-xs font-bold text-[#09408C]">
              {questions.length} Soal
            </span>
          </h2>
        </div>

        {questions.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#D5DDEB]">
            <HelpCircle size={40} className="mx-auto text-[#9AC1E2] mb-3" />
            <h3 className="text-base font-bold text-[#1B2A41]">
              Belum ada soal di paket ini
            </h3>
            <p className="text-xs text-[#5B6882] mt-1 max-w-md mx-auto">
              Mulai masukkan butir soal pilihan ganda A-E beserta kunci jawaban dan pembahasan konsep dasar.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571]"
            >
              <Plus size={16} />
              <span>Tambah Soal Pertama</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div
                key={q.id || idx}
                className="bg-white rounded-2xl border border-[#D5DDEB] p-5 shadow-xs hover:border-[#9AC1E2] transition-colors"
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
                      Bobot: {q.points} Poin
                    </span>
                  </div>

                  <span className="text-xs font-bold text-[#1F6F4A] flex items-center gap-1">
                    <CheckCircle2 size={14} />
                    <span>Kunci: {q.correctKey}</span>
                  </span>
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
      </div>

      {/* Modal Tambah Soal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-xl border border-[#D5DDEB] max-h-[90vh] overflow-y-auto space-y-5 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xl font-bold text-[#09408C] font-display">
                Tambah Butir Soal Baru
              </h3>
              <p className="text-xs text-[#5B6882] mt-0.5">
                Masukkan teks soal, pilihan A s.d E, tentukan kunci jawaban, serta penjelasan konsep dasar.
              </p>
            </div>

            <form onSubmit={handleAddQuestion} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                    Bagian / Sub-Materi
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: TWK (Nasionalisme) atau TPS Kuantitatif"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5DDEB] focus-ring"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                    Bobot Poin Benar
                  </label>
                  <input
                    type="number"
                    required
                    value={points}
                    onChange={(e) => setPoints(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5DDEB] focus-ring"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Teks Pertanyaan Soal *
                </label>
                <textarea
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
                  Pilihan Jawaban (A s.d E)
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
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Kunci Jawaban Benar *
                </label>
                <select
                  value={correctKey}
                  onChange={(e) => setCorrectKey(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#D5DDEB] focus-ring bg-white font-bold text-[#1F6F4A]"
                >
                  <option value="A">Pilihan A</option>
                  <option value="B">Pilihan B</option>
                  <option value="C">Pilihan C</option>
                  <option value="D">Pilihan D</option>
                  <option value="E">Pilihan E</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Pembahasan Konsep Dasar & Trik Logis
                </label>
                <textarea
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
                  {isSubmitting ? "Menyimpan..." : "Simpan Soal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
