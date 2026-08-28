"use client";

import { useState } from "react";
import {
  FileCheck,
  Search,
  Filter,
  ExternalLink,
  MessageSquare,
  Award,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  X,
  User,
  BookOpen,
} from "lucide-react";
import { reviewSubmission, type SubmissionItem } from "@/actions/tugas";

interface SubmissionReviewClientProps {
  initialSubmissions: SubmissionItem[];
}

export default function SubmissionReviewClient({ initialSubmissions }: SubmissionReviewClientProps) {
  const [submissions, setSubmissions] = useState<SubmissionItem[]>(initialSubmissions);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedSub, setSelectedSub] = useState<SubmissionItem | null>(null);

  // Review Form state
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState<number | "">("");
  const [reviewStatus, setReviewStatus] = useState<"APPROVED" | "REVISION_NEEDED" | "REVIEWED">("APPROVED");
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const filtered = submissions.filter((sub) => {
    const matchesSearch =
      sub.title.toLowerCase().includes(search.toLowerCase()) ||
      (sub.studentName || "").toLowerCase().includes(search.toLowerCase()) ||
      (sub.courseTitle || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenReview = (sub: SubmissionItem) => {
    setSelectedSub(sub);
    setFeedback(sub.mentorFeedback || "");
    setScore(sub.score || "");
    setReviewStatus(
      sub.status === "SUBMITTED" ? "APPROVED" : (sub.status as any) || "APPROVED"
    );
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub || !feedback.trim() || isSaving) return;

    setIsSaving(true);
    try {
      const res = await reviewSubmission({
        submissionId: selectedSub.id,
        feedback,
        score: score ? Number(score) : undefined,
        status: reviewStatus,
      });

      if (res.success) {
        setSubmissions((prev) =>
          prev.map((item) =>
            item.id === selectedSub.id
              ? {
                  ...item,
                  mentorFeedback: feedback,
                  score: score ? Number(score) : null,
                  status: reviewStatus,
                  reviewedAt: new Date().toISOString(),
                }
              : item
          )
        );
        setToastMsg("Hasil review & masukan naskah berhasil dikirimkan ke siswa!");
        setTimeout(() => setToastMsg(null), 4000);
        setSelectedSub(null);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner (Level 1 Elevation) */}
      <div
        className="elevation-1 rounded-2xl p-6 bg-white border border-slate-200/80 shadow-[0px_4px_20px_rgba(11,44,107,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-4"
        style={{ borderTop: "4px solid var(--color-primary)" }}
      >
        <div className="flex items-center gap-3.5">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0"
            style={{ background: "var(--color-primary)" }}
          >
            <FileCheck size={24} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold font-[var(--font-heading)] text-slate-900 tracking-tight">
              Pusat Review Draf Naskah Riset
            </h1>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Tinjau draf artikel Scopus/SINTA, bab skripsi/tesis, berikan catatan koreksi, dan tetapkan skor.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-900 text-xs font-bold border border-blue-200/80">
            {filtered.length} Antrean Masuk
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="elevation-1 rounded-2xl p-4 bg-white border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul draf, nama peserta, atau kursus..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus-ring bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={14} className="text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus-ring font-medium"
          >
            <option value="ALL">Semua Status</option>
            <option value="SUBMITTED">Menunggu Review</option>
            <option value="APPROVED">Disetujui (Approved)</option>
            <option value="REVISION_NEEDED">Perlu Revisi</option>
          </select>
        </div>
      </div>

      {/* Submissions Table / Cards */}
      <div className="elevation-1 rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <FileCheck size={40} className="mx-auto text-slate-300" />
            <p className="text-xs font-bold text-slate-600">Tidak ada pengumpulan draf naskah yang cocok</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((sub) => (
              <div
                key={sub.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                {/* Left info */}
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2.5 py-0.5 rounded text-3xs font-bold uppercase tracking-wider ${
                        sub.status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : sub.status === "REVISION_NEEDED"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {sub.status === "APPROVED"
                        ? "Disetujui"
                        : sub.status === "REVISION_NEEDED"
                        ? "Perlu Revisi"
                        : "Menunggu Review"}
                    </span>
                    {sub.score && (
                      <span className="text-3xs font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        Skor: {sub.score}/100
                      </span>
                    )}
                    <span className="text-3xs text-slate-400 flex items-center gap-1">
                      <Clock size={11} /> {new Date(sub.submittedAt).toLocaleDateString("id-ID")}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{sub.title}</h3>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      <User size={12} /> {sub.studentName} ({sub.studentEmail})
                    </span>
                    <span>•</span>
                    <span className="truncate flex items-center gap-1">
                      <BookOpen size={12} /> {sub.courseTitle}
                    </span>
                  </div>

                  {sub.studentNotes && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200/60 max-w-2xl italic">
                      Catatan Siswa: "{sub.studentNotes}"
                    </p>
                  )}
                </div>

                {/* Right Action */}
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={sub.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl border border-slate-200 text-blue-900 bg-white hover:bg-blue-50 transition-colors shadow-2xs"
                    title="Buka Berkas Naskah Siswa"
                  >
                    <ExternalLink size={15} />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleOpenReview(sub)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-1.5 transition-all hover:opacity-90"
                    style={{ background: "var(--color-primary)" }}
                  >
                    <MessageSquare size={13} />
                    <span>{sub.mentorFeedback ? "Edit Review" : "Beri Review & Skor"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal Drawer */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-3xs font-bold uppercase tracking-wider text-blue-900">
                  Formulir Penilaian Mentor
                </span>
                <h3 className="text-base sm:text-lg font-bold font-[var(--font-heading)] text-slate-900 leading-snug">
                  {selectedSub.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Peserta: <strong>{selectedSub.studentName}</strong> ({selectedSub.courseTitle})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSub(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Link to view document */}
            <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-blue-950">Berkas Naskah Peserta</p>
                <p className="text-3xs text-blue-800 truncate max-w-xs">{selectedSub.fileUrl}</p>
              </div>
              <a
                href={selectedSub.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-blue-900 text-white text-xs font-bold hover:opacity-90 flex items-center gap-1 shrink-0"
              >
                <ExternalLink size={12} />
                <span>Buka Naskah</span>
              </a>
            </div>

            {/* Review Form */}
            <form onSubmit={handleSaveReview} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Status Keputusan</label>
                  <select
                    value={reviewStatus}
                    onChange={(e: any) => setReviewStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus-ring font-medium"
                  >
                    <option value="APPROVED">Naskah Disetujui (Approved)</option>
                    <option value="REVISION_NEEDED">Perlu Revisi (Major / Minor)</option>
                    <option value="REVIEWED">Sudah Direview</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Skor Kualitas (0 - 100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={score}
                    onChange={(e) => setScore(e.target.value ? Number(e.target.value) : "")}
                    placeholder="Contoh: 85"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus-ring font-bold tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Catatan Koreksi & Masukan Mentor Ilmiah
                </label>
                <textarea
                  rows={5}
                  required
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tuliskan masukan mengenai ketajaman GAP analysis, metodologi, kelengkapan sitasi, dan saran perbaikan per bab..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus-ring leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSub(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !feedback.trim()}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-1.5 transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: "var(--color-primary)" }}
                >
                  <Send size={13} />
                  <span>{isSaving ? "Menyimpan..." : "Kirim Hasil Review"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
