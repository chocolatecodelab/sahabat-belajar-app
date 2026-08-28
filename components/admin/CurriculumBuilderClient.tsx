"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  PlayCircle,
  FileText,
  FileSpreadsheet,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Clock,
  Video,
  X,
  Upload,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  upsertCourseModule,
  deleteCourseModule,
  upsertCourseLesson,
  deleteCourseLesson,
  type ModuleItem,
  type LessonItem,
  type LessonAttachment,
} from "@/actions/belajar";

interface CurriculumBuilderClientProps {
  course: {
    id: string;
    title: string;
    slug: string;
    category: string;
    mentorName: string;
    batchNumber?: string | null;
  };
  initialModules: ModuleItem[];
}

export default function CurriculumBuilderClient({
  course,
  initialModules,
}: CurriculumBuilderClientProps) {
  const [modules, setModules] = useState<ModuleItem[]>(initialModules);
  const [openModuleIds, setOpenModuleIds] = useState<string[]>(
    initialModules.map((m) => m.id)
  );

  // Modal States
  const [moduleModalOpen, setModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<ModuleItem | null>(null);
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDesc, setModuleDesc] = useState("");
  const [moduleSort, setModuleSort] = useState(0);

  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<LessonItem | null>(null);
  const [activeModuleIdForLesson, setActiveModuleIdForLesson] = useState<string>("");

  // Lesson Form States
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDesc, setLessonDesc] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [pdfSlideUrl, setPdfSlideUrl] = useState("");
  const [datasetUrl, setDatasetUrl] = useState("");
  const [durationMin, setDurationMin] = useState(90);
  const [isFreePreview, setIsFreePreview] = useState(false);
  const [lessonSort, setLessonSort] = useState(0);
  const [attachments, setAttachments] = useState<LessonAttachment[]>([]);

  // Loading & Toast States
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const toggleModuleAccordion = (modId: string) => {
    setOpenModuleIds((prev) =>
      prev.includes(modId) ? prev.filter((id) => id !== modId) : [...prev, modId]
    );
  };

  // Module Handlers
  const handleOpenAddModule = () => {
    setEditingModule(null);
    setModuleTitle("");
    setModuleDesc("");
    setModuleSort(modules.length + 1);
    setModuleModalOpen(true);
  };

  const handleOpenEditModule = (mod: ModuleItem) => {
    setEditingModule(mod);
    setModuleTitle(mod.title);
    setModuleDesc(mod.description || "");
    setModuleSort(mod.sortOrder);
    setModuleModalOpen(true);
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleTitle.trim() || isSaving) return;

    setIsSaving(true);
    try {
      const res = await upsertCourseModule({
        id: editingModule?.id,
        courseId: course.id,
        title: moduleTitle,
        description: moduleDesc,
        sortOrder: moduleSort,
        courseSlug: course.slug,
      });

      if (res.success && res.data?.id) {
        if (editingModule) {
          setModules((prev) =>
            prev.map((m) =>
              m.id === editingModule.id
                ? { ...m, title: moduleTitle, description: moduleDesc, sortOrder: moduleSort }
                : m
            )
          );
        } else {
          const newMod: ModuleItem = {
            id: res.data.id,
            courseId: course.id,
            title: moduleTitle,
            description: moduleDesc,
            sortOrder: moduleSort,
            lessons: [],
          };
          setModules((prev) => [...prev, newMod]);
          setOpenModuleIds((prev) => [...prev, res.data!.id]);
        }
        setToastMsg(editingModule ? "Modul berhasil diperbarui" : "Modul baru berhasil ditambahkan");
        setTimeout(() => setToastMsg(null), 4000);
        setModuleModalOpen(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteModule = async (modId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus modul ini beserta seluruh sesi di dalamnya?")) return;

    try {
      const res = await deleteCourseModule(modId, course.id, course.slug);
      if (res.success) {
        setModules((prev) => prev.filter((m) => m.id !== modId));
        setToastMsg("Modul berhasil dihapus");
        setTimeout(() => setToastMsg(null), 4000);
      }
    } catch (err: any) {
      alert("Gagal menghapus modul: " + err.message);
    }
  };

  // Lesson Handlers
  const handleOpenAddLesson = (modId: string) => {
    const parentMod = modules.find((m) => m.id === modId);
    setActiveModuleIdForLesson(modId);
    setEditingLesson(null);
    setLessonTitle("");
    setLessonDesc("");
    setVideoUrl("");
    setPdfSlideUrl("");
    setDatasetUrl("");
    setDurationMin(90);
    setIsFreePreview(false);
    setLessonSort((parentMod?.lessons?.length || 0) + 1);
    setAttachments([]);
    setLessonModalOpen(true);
  };

  const handleOpenEditLesson = (modId: string, lesson: LessonItem) => {
    setActiveModuleIdForLesson(modId);
    setEditingLesson(lesson);
    setLessonTitle(lesson.title);
    setLessonDesc(lesson.description || "");
    setVideoUrl(lesson.videoUrl || "");
    setPdfSlideUrl(lesson.pdfSlideUrl || "");
    setDatasetUrl(lesson.datasetUrl || "");
    setDurationMin(lesson.durationMin || 90);
    setIsFreePreview(lesson.isFreePreview || false);
    setLessonSort(lesson.sortOrder);
    setAttachments(lesson.attachments || []);
    setLessonModalOpen(true);
  };

  const handleAddAttachmentRow = () => {
    setAttachments((prev) => [
      ...prev,
      {
        title: "Berkas Latihan",
        url: "",
        type: "EXCEL",
      },
    ]);
  };

  const handleRemoveAttachmentRow = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateAttachmentRow = (idx: number, field: keyof LessonAttachment, value: any) => {
    setAttachments((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim() || !activeModuleIdForLesson || isSaving) return;

    setIsSaving(true);
    try {
      const res = await upsertCourseLesson({
        id: editingLesson?.id,
        moduleId: activeModuleIdForLesson,
        title: lessonTitle,
        description: lessonDesc,
        videoUrl,
        pdfSlideUrl,
        datasetUrl,
        attachments,
        durationMin,
        isFreePreview,
        sortOrder: lessonSort,
        courseId: course.id,
        courseSlug: course.slug,
      });

      if (res.success && res.data?.id) {
        const savedLesson: LessonItem = {
          id: res.data.id,
          moduleId: activeModuleIdForLesson,
          title: lessonTitle,
          description: lessonDesc,
          videoUrl,
          pdfSlideUrl,
          datasetUrl,
          attachments,
          durationMin,
          isFreePreview,
          sortOrder: lessonSort,
        };

        setModules((prev) =>
          prev.map((mod) => {
            if (mod.id !== activeModuleIdForLesson) return mod;
            const existing = (mod.lessons || []).some((l) => l.id === savedLesson.id);
            const updatedLessons = existing
              ? mod.lessons.map((l) => (l.id === savedLesson.id ? savedLesson : l))
              : [...(mod.lessons || []), savedLesson];
            return {
              ...mod,
              lessons: updatedLessons.sort((a, b) => a.sortOrder - b.sortOrder),
            };
          })
        );

        setToastMsg(editingLesson ? "Sesi materi berhasil diperbarui" : "Sesi materi baru berhasil ditambahkan");
        setTimeout(() => setToastMsg(null), 4000);
        setLessonModalOpen(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLesson = async (modId: string, lessonId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus sesi materi ini?")) return;

    try {
      const res = await deleteCourseLesson(lessonId, course.id, course.slug);
      if (res.success) {
        setModules((prev) =>
          prev.map((mod) =>
            mod.id === modId
              ? { ...mod, lessons: mod.lessons.filter((l) => l.id !== lessonId) }
              : mod
          )
        );
        setToastMsg("Sesi materi berhasil dihapus");
        setTimeout(() => setToastMsg(null), 4000);
      }
    } catch (err: any) {
      alert("Gagal menghapus sesi: " + err.message);
    }
  };

  const totalLessonsCount = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);

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
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/kursus"
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
              title="Kembali ke Daftar Kursus"
            >
              <ArrowLeft size={16} />
            </Link>
            <span className="px-2.5 py-0.5 rounded text-3xs font-bold uppercase bg-blue-900 text-white">
              {course.category}
            </span>
            {course.batchNumber && (
              <span className="text-3xs font-bold bg-[#fdbc13] text-blue-950 px-2 py-0.5 rounded">
                {course.batchNumber}
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold font-[var(--font-heading)] text-slate-900 tracking-tight">
            Manajemen Materi & Silabus: {course.title}
          </h1>
          <p className="text-xs text-slate-500">
            Mentor: <strong>{course.mentorName}</strong> • Total {modules.length} Modul ({totalLessonsCount} Sesi Materi)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href={`/belajar/${course.slug}`}
            target="_blank"
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 shadow-2xs flex items-center gap-1.5 transition-all"
          >
            <ExternalLink size={13} className="text-blue-900" />
            <span>Lihat Tampilan Siswa</span>
          </Link>

          <button
            type="button"
            onClick={handleOpenAddModule}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-1.5 transition-all hover:opacity-90"
            style={{ background: "var(--color-primary)" }}
          >
            <Plus size={15} />
            <span>Tambah Modul Baru</span>
          </button>
        </div>
      </div>

      {/* Modules & Lessons List */}
      <div className="space-y-4">
        {modules.length === 0 ? (
          <div className="elevation-1 rounded-2xl p-12 bg-white border text-center space-y-3">
            <Layers size={44} className="mx-auto text-slate-300" />
            <h3 className="text-base font-bold text-slate-800">Belum ada modul kurikulum</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Silakan buat modul mingguan pertama untuk mengunggah materi rekaman video, slide PDF, dan dataset.
            </p>
            <button
              type="button"
              onClick={handleOpenAddModule}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs"
              style={{ background: "var(--color-primary)" }}
            >
              + Tambah Modul Baru
            </button>
          </div>
        ) : (
          modules.map((mod, modIdx) => {
            const isOpen = openModuleIds.includes(mod.id);

            return (
              <div
                key={mod.id}
                className="elevation-1 rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-xs"
              >
                {/* Module Header Bar */}
                <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200/80 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => toggleModuleAccordion(mod.id)}
                    className="flex items-center gap-3 text-left min-w-0 flex-1 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {mod.sortOrder || modIdx + 1}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-bold font-[var(--font-heading)] text-slate-900 group-hover:text-blue-900 transition-colors truncate">
                        {mod.title}
                      </h3>
                      {mod.description && (
                        <p className="text-xs text-slate-500 truncate max-w-xl">{mod.description}</p>
                      )}
                    </div>
                  </button>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-3xs font-extrabold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md hidden sm:inline-block">
                      {mod.lessons?.length || 0} Sesi Materi
                    </span>

                    <button
                      type="button"
                      onClick={() => handleOpenAddLesson(mod.id)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#fdbc13] text-blue-950 hover:opacity-90 transition-all flex items-center gap-1 shadow-2xs"
                      title="Tambah Sesi Materi ke Modul Ini"
                    >
                      <Plus size={13} />
                      <span className="hidden sm:inline">Tambah Sesi</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditModule(mod)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-blue-900 hover:bg-slate-100 transition-colors"
                      title="Edit Modul"
                    >
                      <Edit2 size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteModule(mod.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                      title="Hapus Modul"
                    >
                      <Trash2 size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleModuleAccordion(mod.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                    >
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Lessons Playlist in Module */}
                {isOpen && (
                  <div className="p-4 sm:p-5 space-y-3">
                    {(!mod.lessons || mod.lessons.length === 0) ? (
                      <p className="text-xs text-slate-400 text-center py-4 italic">
                        Belum ada sesi materi di modul ini. Klik "+ Tambah Sesi" untuk mengunggah materi.
                      </p>
                    ) : (
                      mod.lessons.map((lesson, lesIdx) => (
                        <div
                          key={lesson.id}
                          className="p-4 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                              {lesson.sortOrder || lesIdx + 1}
                            </div>

                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                                  {lesson.title}
                                </h4>
                                {lesson.isFreePreview && (
                                  <span className="px-2 py-0.2 rounded text-3xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    Free Preview
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-3 text-3xs text-slate-500 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <Clock size={11} /> {lesson.durationMin || 90} Menit
                                </span>
                                {lesson.videoUrl && (
                                  <span className="text-blue-900 font-bold flex items-center gap-1">
                                    <Video size={11} /> Video/Zoom Siap
                                  </span>
                                )}
                                {lesson.pdfSlideUrl && (
                                  <span className="text-rose-600 font-bold flex items-center gap-1">
                                    <FileText size={11} /> Slide PDF
                                  </span>
                                )}
                                {lesson.datasetUrl && (
                                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                                    <FileSpreadsheet size={11} /> Dataset Latihan
                                  </span>
                                )}
                                {lesson.attachments && lesson.attachments.length > 0 && (
                                  <span className="text-purple-700 font-bold flex items-center gap-1">
                                    <Paperclip size={11} /> {lesson.attachments.length} Lampiran Tambahan
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Lesson Actions */}
                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenEditLesson(mod.id, lesson)}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors flex items-center gap-1"
                            >
                              <Edit2 size={12} />
                              <span>Edit Sesi</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteLesson(mod.id, lesson.id)}
                              className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                              title="Hapus Sesi"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 1. Modal Add/Edit Module */}
      {moduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold font-[var(--font-heading)] text-slate-900">
                {editingModule ? "Edit Modul Kurikulum" : "Tambah Modul Kurikulum Baru"}
              </h3>
              <button
                type="button"
                onClick={() => setModuleModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveModule} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Judul Modul / Section</label>
                <input
                  type="text"
                  required
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  placeholder="Contoh: Minggu 1: Anatomi & Standar Naskah Jurnal Scopus"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus-ring font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Deskripsi Singkat (Opsional)</label>
                <textarea
                  rows={2}
                  value={moduleDesc}
                  onChange={(e) => setModuleDesc(e.target.value)}
                  placeholder="Membedah struktur naskah IMRaD dan formula GAP Analysis..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus-ring leading-relaxed"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Urutan Modul</label>
                <input
                  type="number"
                  value={moduleSort}
                  onChange={(e) => setModuleSort(Number(e.target.value))}
                  className="w-24 px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus-ring font-bold tabular-nums"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModuleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !moduleTitle.trim()}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-xs"
                  style={{ background: "var(--color-primary)" }}
                >
                  {isSaving ? "Menyimpan..." : "Simpan Modul"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal Add/Edit Lesson (Multi-Attachment Manager) */}
      {lessonModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-3xs font-bold uppercase tracking-wider text-blue-900">
                  Manajemen Sesi Materi
                </span>
                <h3 className="text-base sm:text-lg font-bold font-[var(--font-heading)] text-slate-900">
                  {editingLesson ? "Edit Sesi Materi" : "Tambah Sesi Materi Baru"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLessonModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveLesson} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Judul Sesi Pembelajaran</label>
                <input
                  type="text"
                  required
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="Contoh: Sesi 1: Standar Ekspektasi Reviewer Scopus Q1 & Anatomi IMRaD"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus-ring font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Durasi Sesi (Menit)</label>
                  <input
                    type="number"
                    value={durationMin}
                    onChange={(e) => setDurationMin(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus-ring font-bold tabular-nums"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Urutan Sesi</label>
                  <input
                    type="number"
                    value={lessonSort}
                    onChange={(e) => setLessonSort(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus-ring font-bold tabular-nums"
                  />
                </div>

                <div className="flex items-center sm:pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={isFreePreview}
                      onChange={(e) => setIsFreePreview(e.target.checked)}
                      className="rounded border-slate-300 text-blue-900 focus-ring"
                    />
                    <span>Free Preview (Bisa Ditonton Gratis)</span>
                  </label>
                </div>
              </div>

              {/* Video URL */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1 flex items-center gap-1.5">
                  <Video size={13} className="text-blue-900" />
                  <span>Tautan Rekaman Video / Zoom / YouTube / Drive</span>
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... atau link rekaman cloud Zoom"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus-ring"
                />
              </div>

              {/* Handout PDF */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1 flex items-center gap-1.5">
                    <FileText size={13} className="text-rose-600" />
                    <span>Slide Presentasi Materi (PDF)</span>
                  </label>
                  <input
                    type="text"
                    value={pdfSlideUrl}
                    onChange={(e) => setPdfSlideUrl(e.target.value)}
                    placeholder="/uploads/modules/slide-sesi-1.pdf"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus-ring"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1 flex items-center gap-1.5">
                    <FileSpreadsheet size={13} className="text-emerald-700" />
                    <span>Dataset Latihan / Template (Excel/Word)</span>
                  </label>
                  <input
                    type="text"
                    value={datasetUrl}
                    onChange={(e) => setDatasetUrl(e.target.value)}
                    placeholder="/uploads/modules/dataset-smartpls.xlsx"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus-ring"
                  />
                </div>
              </div>

              {/* Dynamic Multi-Attachments Repeater */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Paperclip size={13} className="text-purple-700" />
                    <span>Berkas Lampiran Tambahan ({attachments.length})</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleAddAttachmentRow}
                    className="px-2.5 py-1 rounded-lg text-3xs font-bold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 flex items-center gap-1"
                  >
                    <Plus size={11} />
                    <span>Tambah Berkas</span>
                  </button>
                </div>

                {attachments.map((att, attIdx) => (
                  <div
                    key={attIdx}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                  >
                    <div className="sm:col-span-5">
                      <input
                        type="text"
                        required
                        placeholder="Nama Berkas (misal: Script R Syntax)"
                        value={att.title}
                        onChange={(e) => handleUpdateAttachmentRow(attIdx, "title", e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus-ring"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <input
                        type="text"
                        required
                        placeholder="URL Berkas / Link Drive"
                        value={att.url}
                        onChange={(e) => handleUpdateAttachmentRow(attIdx, "url", e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus-ring"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <select
                        value={att.type}
                        onChange={(e: any) => handleUpdateAttachmentRow(attIdx, "type", e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-3xs bg-white font-bold"
                      >
                        <option value="EXCEL">EXCEL</option>
                        <option value="DATASET">DATASET</option>
                        <option value="SMARTPLS">SMARTPLS</option>
                        <option value="SPSS">SPSS</option>
                        <option value="DOCX">DOCX</option>
                        <option value="PDF">PDF</option>
                        <option value="ZIP">ZIP</option>
                        <option value="LINK">LINK</option>
                      </select>
                    </div>
                    <div className="sm:col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachmentRow(attIdx)}
                        className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                        title="Hapus Lampiran"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Deskripsi / Panduan Belajar Sesi
                </label>
                <textarea
                  rows={3}
                  value={lessonDesc}
                  onChange={(e) => setLessonDesc(e.target.value)}
                  placeholder="Instruksi belajar atau poin-poin yang harus diperhatikan oleh peserta..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus-ring leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setLessonModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !lessonTitle.trim()}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-xs"
                  style={{ background: "var(--color-primary)" }}
                >
                  {isSaving ? "Menyimpan..." : "Simpan Sesi Materi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
