"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  PlayCircle,
  CheckCircle2,
  Circle,
  Download,
  FileText,
  FileSpreadsheet,
  Award,
  Sparkles,
  Clock,
  Send,
  MessageSquare,
  Check,
  ChevronRight,
  Upload,
  AlertCircle,
  ExternalLink,
  BookOpen,
  Paperclip,
} from "lucide-react";
import { toggleLessonCompletion, type ModuleItem, type LessonItem } from "@/actions/belajar";
import { submitResearchDraft, getStudentSubmissions, type SubmissionItem } from "@/actions/tugas";
import { claimCertificate } from "@/actions/sertifikat";

interface ClassroomClientProps {
  course: any;
  modules: ModuleItem[];
  enrollment: {
    id: string;
    status: string;
    progressPercentage: number;
    completedLessonIds: string[];
  };
  initialSubmissions: SubmissionItem[];
}

export default function ClassroomClient({
  course,
  modules,
  enrollment,
  initialSubmissions,
}: ClassroomClientProps) {
  // Find first lesson or fallback
  const allLessons = modules.flatMap((m) => m.lessons || []);
  const [activeLesson, setActiveLesson] = useState<LessonItem>(allLessons[0] || ({} as LessonItem));
  const [completedIds, setCompletedIds] = useState<string[]>(enrollment.completedLessonIds || []);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);

  // Submissions State
  const [submissions, setSubmissions] = useState<SubmissionItem[]>(initialSubmissions);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftFileUrl, setDraftFileUrl] = useState("");
  const [draftNotes, setDraftNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Certificate State
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimedCertCode, setClaimedCertCode] = useState<string | null>(null);

  const totalLessonsCount = allLessons.length;
  const completedCount = completedIds.length;
  const currentPercentage =
    totalLessonsCount > 0 ? Math.round((completedCount / totalLessonsCount) * 100) : 0;
  const isCurrentLessonCompleted = completedIds.includes(activeLesson.id);

  const handleToggleCompletion = async () => {
    if (!activeLesson.id || isUpdatingProgress) return;
    setIsUpdatingProgress(true);

    const willComplete = !isCurrentLessonCompleted;
    try {
      await toggleLessonCompletion(enrollment.id, activeLesson.id, willComplete, course.slug);
      if (willComplete) {
        setCompletedIds((prev) => [...prev, activeLesson.id]);
      } else {
        setCompletedIds((prev) => prev.filter((id) => id !== activeLesson.id));
      }
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  const handleSubmitDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftTitle.trim() || !draftFileUrl.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await submitResearchDraft({
        enrollmentId: enrollment.id,
        lessonId: activeLesson.id,
        title: draftTitle,
        fileUrl: draftFileUrl,
        studentNotes: draftNotes,
        courseSlug: course.slug,
      });

      if (res.success) {
        const newSub: SubmissionItem = {
          id: `sub_${Date.now()}`,
          enrollmentId: enrollment.id,
          lessonId: activeLesson.id,
          title: draftTitle,
          fileUrl: draftFileUrl,
          studentNotes: draftNotes,
          status: "SUBMITTED",
          submittedAt: new Date().toISOString(),
        };
        setSubmissions((prev) => [newSub, ...prev]);
        setDraftTitle("");
        setDraftFileUrl("");
        setDraftNotes("");
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 4000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClaimCertificate = async () => {
    setIsClaiming(true);
    try {
      const res = await claimCertificate(enrollment.id);
      if (res.success && res.data?.certificateCode) {
        setClaimedCertCode(res.data.certificateCode);
        window.location.href = `/sertifikat/${res.data.certificateCode}`;
      }
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-[var(--font-body)] text-slate-800 pb-16 animate-fade-in">
      {/* 1. Classroom Navigation Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/belajar"
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              title="Kembali ke Kelas Saya"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-3xs font-bold uppercase bg-blue-900 text-white">
                  {course.category}
                </span>
                {course.batchNumber && (
                  <span className="text-3xs font-bold bg-[#fdbc13] text-blue-950 px-1.5 py-0.5 rounded">
                    {course.batchNumber}
                  </span>
                )}
              </div>
              <h1 className="text-base sm:text-lg font-bold font-[var(--font-heading)] text-slate-900 truncate max-w-xl">
                {course.title}
              </h1>
            </div>
          </div>

          {/* Progress Tracker & Claim Button */}
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <span className="text-3xs font-bold uppercase text-slate-400 block">Progres Kelas</span>
              <strong className="text-sm font-extrabold text-blue-900 tabular-nums">
                {currentPercentage}% ({completedCount}/{totalLessonsCount} Selesai)
              </strong>
            </div>

            {currentPercentage >= 100 && (
              <button
                type="button"
                disabled={isClaiming}
                onClick={handleClaimCertificate}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#fdbc13] text-blue-950 shadow-xs hover:opacity-90 transition-all flex items-center gap-1.5"
              >
                <Award size={15} />
                <span>{isClaiming ? "Menerbitkan..." : "Klaim Sertifikat 32 JP"}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Classroom Workspace Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Video & Lesson Content Screen (8 Columns) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Video / Zoom Recording Frame */}
            <div className="elevation-1 rounded-2xl bg-black overflow-hidden aspect-video relative flex items-center justify-center shadow-lg border border-slate-800">
              {activeLesson.videoUrl ? (
                <iframe
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title={activeLesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="text-center p-8 text-white space-y-3">
                  <PlayCircle size={48} className="mx-auto text-[#fdbc13]" />
                  <p className="font-bold text-sm">Rekaman Zoom Sesi Ini Segera Diunggah</p>
                  <p className="text-xs text-slate-400">Silakan unduh modul slide presentasi di bawah ini.</p>
                </div>
              )}
            </div>

            {/* Lesson Title & Action Header */}
            <div
              className="elevation-1 rounded-2xl p-6 bg-white border border-slate-200/80 space-y-4 shadow-xs"
              style={{ borderTop: "3px solid var(--color-primary)" }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-3xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md">
                    Sesi Aktif
                  </span>
                  <h2 className="text-xl font-extrabold font-[var(--font-heading)] text-slate-900 mt-1.5 leading-snug">
                    {activeLesson.title}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {activeLesson.durationMin || 90} Menit
                    </span>
                    <span>•</span>
                    <span>Mentor: {course.mentorName}</span>
                  </div>
                </div>

                {/* Mark as Complete Button */}
                <button
                  type="button"
                  disabled={isUpdatingProgress}
                  onClick={handleToggleCompletion}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all shrink-0 ${
                    isCurrentLessonCompleted
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
                  }`}
                >
                  <CheckCircle2 size={16} className={isCurrentLessonCompleted ? "text-white" : "text-slate-400"} />
                  <span>{isCurrentLessonCompleted ? "Sesi Selesai (Tercatat)" : "Tandai Sesi Selesai"}</span>
                </button>
              </div>

              {activeLesson.description && (
                <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {activeLesson.description}
                </p>
              )}
            </div>

            {/* Downloadable Materials & Multi-File Datasets */}
            <div className="elevation-1 rounded-2xl p-6 bg-white border border-slate-200/80 space-y-4 shadow-xs">
              <h3 className="text-sm font-bold font-[var(--font-heading)] text-slate-900 flex items-center gap-2">
                <Download size={16} className="text-blue-900" />
                <span>Modul, Slide & Berkas Latihan Sesi Ini</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* PDF Slide Handout */}
                {activeLesson.pdfSlideUrl && (
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                        <FileText size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 leading-snug truncate">Slide Presentasi Materi (PDF)</p>
                        <span className="text-3xs text-slate-400">Handout Lengkap Sesi</span>
                      </div>
                    </div>
                    <a
                      href={activeLesson.pdfSlideUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-blue-50 text-blue-900 text-xs font-bold shadow-2xs transition-colors shrink-0"
                      title="Unduh Slide"
                    >
                      <Download size={14} />
                    </a>
                  </div>
                )}

                {/* Primary Dataset */}
                {activeLesson.datasetUrl && (
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                        <FileSpreadsheet size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 leading-snug truncate">Dataset / Template Utama</p>
                        <span className="text-3xs text-slate-400">Format Latihan Praktik</span>
                      </div>
                    </div>
                    <a
                      href={activeLesson.datasetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-emerald-50 text-emerald-700 text-xs font-bold shadow-2xs transition-colors shrink-0"
                      title="Unduh Dataset"
                    >
                      <Download size={14} />
                    </a>
                  </div>
                )}

                {/* Dynamic Extra Attachments Uploaded by Mentor */}
                {activeLesson.attachments &&
                  activeLesson.attachments.map((att, attIdx) => (
                    <div
                      key={attIdx}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 font-bold text-3xs">
                          {att.type === "EXCEL" ? (
                            <FileSpreadsheet size={20} />
                          ) : att.type === "PDF" ? (
                            <FileText size={20} />
                          ) : (
                            <Paperclip size={18} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 leading-snug truncate">{att.title}</p>
                          <span className="text-3xs font-bold uppercase text-purple-700 bg-purple-100 px-1.5 py-0.2 rounded">
                            {att.type}
                          </span>
                        </div>
                      </div>
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-purple-50 text-purple-700 text-xs font-bold shadow-2xs transition-colors shrink-0"
                        title={`Unduh ${att.title}`}
                      >
                        <Download size={14} />
                      </a>
                    </div>
                  ))}

                {/* Fallback if no files */}
                {!activeLesson.pdfSlideUrl && !activeLesson.datasetUrl && (!activeLesson.attachments || activeLesson.attachments.length === 0) && (
                  <div className="sm:col-span-2 p-6 text-center text-slate-400 text-xs italic bg-slate-50/50 rounded-xl border border-slate-200/60">
                    Belum ada berkas lampiran khusus untuk sesi ini. Silakan simak video rekaman di atas.
                  </div>
                )}
              </div>
            </div>

            {/* Research Manuscript Submission & Review Box */}
            <div className="elevation-1 rounded-2xl p-6 bg-white border border-slate-200/80 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center">
                    <Upload size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-[var(--font-heading)] text-slate-900">
                      Pusat Pengumpulan Draf Naskah & Review Mentor
                    </h3>
                    <p className="text-3xs text-slate-400">Kumpulkan naskah untuk ditinjau oleh reviewer pakar</p>
                  </div>
                </div>
              </div>

              {/* Submit Draft Form */}
              <form onSubmit={handleSubmitDraft} className="space-y-3.5 bg-slate-50/60 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Judul Draf Naskah / Bagian Tugas
                  </label>
                  <input
                    type="text"
                    required
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    placeholder="Contoh: Draf GAP Analysis & Introduction Naskah Scopus"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus-ring font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Tautan Berkas Naskah (Google Drive / PDF / Docx)
                  </label>
                  <input
                    type="url"
                    required
                    value={draftFileUrl}
                    onChange={(e) => setDraftFileUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus-ring font-medium"
                  />
                  <span className="text-3xs text-slate-400 mt-0.5 block">
                    Pastikan akses link Google Drive telah disetel ke "Siapa saja yang memiliki link dapat melihat/mengomentari".
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Catatan / Pertanyaan Khusus untuk Mentor (Opsional)
                  </label>
                  <textarea
                    rows={2}
                    value={draftNotes}
                    onChange={(e) => setDraftNotes(e.target.value)}
                    placeholder="Contoh: Mohon masukan khusus di paragraf 3 mengenai rumusan novelty..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus-ring font-medium"
                  />
                </div>

                {submitSuccess && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>Draf naskah berhasil dikumpulkan dan masuk ke antrean review mentor!</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-1.5 transition-all hover:opacity-90 ml-auto"
                  style={{ background: "var(--color-primary)" }}
                >
                  <Send size={13} />
                  <span>{isSubmitting ? "Mengirim..." : "Kumpulkan Draf Naskah"}</span>
                </button>
              </form>

              {/* Submissions & Mentor Feedback History */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Riwayat Draf & Masukan Mentor ({submissions.length})
                </h4>

                {submissions.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">
                    Belum ada draf naskah yang dikumpulkan untuk program ini.
                  </p>
                ) : (
                  submissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 text-xs shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{sub.title}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-3xs font-bold uppercase ${
                            sub.status === "APPROVED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : sub.status === "REVISION_NEEDED"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {sub.status === "APPROVED"
                            ? "Naskah Disetujui"
                            : sub.status === "REVISION_NEEDED"
                            ? "Perlu Revisi"
                            : "Menunggu Review Mentor"}
                        </span>
                      </div>

                      <div className="text-3xs text-slate-500 flex items-center gap-3">
                        <span>Dikumpulkan: {new Date(sub.submittedAt).toLocaleDateString("id-ID")}</span>
                        <a
                          href={sub.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-900 hover:underline font-bold inline-flex items-center gap-1"
                        >
                          <ExternalLink size={10} /> Buka Berkas Draf
                        </a>
                      </div>

                      {/* Mentor Feedback Box */}
                      {sub.mentorFeedback && (
                        <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-200 space-y-1.5">
                          <div className="flex items-center justify-between text-blue-900 font-bold text-3xs uppercase tracking-wider">
                            <span className="flex items-center gap-1">
                              <MessageSquare size={11} /> Catatan & Rekomendasi Mentor:
                            </span>
                            {sub.score && <span className="text-emerald-700 font-extrabold">Skor: {sub.score}/100</span>}
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed font-medium">
                            {sub.mentorFeedback}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Modules & Curriculum Playlist (4 Columns) */}
          <div className="lg:col-span-4 space-y-6">
            <div
              className="elevation-1 rounded-2xl p-5 bg-white border border-slate-200/80 shadow-xs space-y-4 sticky top-36"
              style={{ borderTop: "3px solid var(--color-primary)" }}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm font-[var(--font-heading)] text-slate-900 flex items-center gap-2">
                  <BookOpen size={16} className="text-blue-900" />
                  <span>Silabus & Modul Belajar</span>
                </h3>
                <span className="text-3xs font-extrabold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                  {completedCount}/{totalLessonsCount} Sesi
                </span>
              </div>

              {/* Modules Accordion List */}
              <div className="space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                {modules.map((mod, modIdx) => (
                  <div key={mod.id} className="space-y-2">
                    <h4 className="text-3xs font-extrabold uppercase tracking-wider text-slate-400 px-1">
                      {mod.title}
                    </h4>

                    <div className="space-y-1.5">
                      {(mod.lessons || []).map((lesson, lesIdx) => {
                        const isCurrent = activeLesson.id === lesson.id;
                        const isDone = completedIds.includes(lesson.id);

                        return (
                          <button
                            key={lesson.id}
                            type="button"
                            onClick={() => setActiveLesson(lesson)}
                            className={`w-full p-3 rounded-xl text-left text-xs transition-all flex items-start gap-2.5 ${
                              isCurrent
                                ? "bg-blue-900 text-white shadow-xs"
                                : isDone
                                ? "bg-emerald-50/50 text-slate-800 hover:bg-emerald-50 border border-emerald-100"
                                : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60"
                            }`}
                          >
                            <div className="mt-0.5 shrink-0">
                              {isDone ? (
                                <CheckCircle2 size={15} className={isCurrent ? "text-[#fdbc13]" : "text-emerald-600"} />
                              ) : isCurrent ? (
                                <PlayCircle size={15} className="text-[#fdbc13]" />
                              ) : (
                                <Circle size={15} className="text-slate-300" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className={`font-bold leading-snug truncate ${isCurrent ? "text-white" : "text-slate-900"}`}>
                                {lesson.title}
                              </p>
                              <span className={`text-3xs ${isCurrent ? "text-white/70" : "text-slate-400"}`}>
                                {lesson.durationMin || 90} Menit
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
