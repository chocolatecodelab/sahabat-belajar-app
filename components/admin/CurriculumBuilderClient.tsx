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
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner (Academic Innovation) */}
      <div className="rounded-2xl p-6 bg-white border border-[#e2e8f0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              href="/dashboard/kursus"
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-[#001847] hover:bg-slate-50 transition-colors"
              title="Kembali ke Daftar Kursus"
            >
              <ArrowLeft size={16} />
            </Link>

            {/* Academic Category Badge */}
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[#001847]/6 text-[#001847] border border-[#001847]/12">
              {course.category}
            </span>

            {/* Scholastic Gold Batch Badge */}
            {course.batchNumber && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[#fef9c3] text-[#7a5900] border border-[#fef08a]">
                {course.batchNumber}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#001847] tracking-tight">
            Manajemen Materi & Silabus: {course.title}
          </h1>

          <p className="text-sm text-slate-500">
            Mentor: <span className="font-semibold text-slate-700">{course.mentorName}</span>
            <span className="mx-2 text-slate-300">•</span>
            <span>Total {modules.length} Modul ({totalLessonsCount} Sesi Materi)</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <Link
            href={`/belajar/${course.slug}`}
            target="_blank"
            className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-2xs flex items-center gap-1.5 transition"
          >
            <ExternalLink size={14} className="text-[#001847]" />
            <span>Lihat Tampilan Siswa</span>
          </Link>

          <button
            type="button"
            onClick={handleOpenAddModule}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#001847] hover:bg-[#0b2c6b] shadow-sm flex items-center gap-1.5 transition"
          >
            <Plus size={15} />
            <span>Tambah Modul Baru</span>
          </button>
        </div>
      </div>

      {/* Modules & Lessons List */}
      <div className="space-y-4">
        {modules.length === 0 ? (
          <div className="rounded-2xl p-12 bg-white border border-[#e2e8f0] shadow-sm text-center space-y-3">
            <Layers size={40} className="mx-auto text-slate-300" />
            <h3 className="text-base font-bold text-slate-800 font-display">Belum ada modul kurikulum</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Silakan buat modul mingguan pertama untuk mengunggah materi rekaman video, slide PDF, dan dataset.
            </p>
            <button
              type="button"
              onClick={handleOpenAddModule}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#001847] hover:bg-[#0b2c6b] shadow-sm"
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
                className="rounded-xl bg-white border border-slate-200/90 shadow-sm overflow-hidden transition"
              >
                {/* Module Header Bar */}
                <div className="p-4 sm:p-5 bg-[#f8f9ff]/70 border-b border-slate-200/80 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => toggleModuleAccordion(mod.id)}
                    className="flex items-center gap-3 text-left min-w-0 flex-1 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#001847] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                      {mod.sortOrder || modIdx + 1}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-bold font-display text-[#001847] group-hover:text-[#0b2c6b] transition-colors truncate">
                        {mod.title}
                      </h3>
                      {mod.description && (
                        <p className="text-xs text-slate-500 truncate max-w-xl font-normal mt-0.5">{mod.description}</p>
                      )}
                    </div>
                  </button>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200/60 hidden sm:inline-block">
                      {mod.lessons?.length || 0} Sesi Materi
                    </span>

                    {/* Secondary "+ Tambah Sesi" Button (Refined & Academic) */}
                    <button
                      type="button"
                      onClick={() => handleOpenAddLesson(mod.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 flex items-center gap-1 shadow-2xs transition"
                      title="Tambah Sesi Materi ke Modul Ini"
                    >
                      <Plus size={13} className="text-[#001847]" />
                      <span className="hidden sm:inline">Tambah Sesi</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditModule(mod)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#001847] hover:bg-slate-100 transition-colors"
                      title="Edit Modul"
                    >
                      <Edit2 size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteModule(mod.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
                  <div className="p-4 sm:p-5 space-y-2.5">
                    {(!mod.lessons || mod.lessons.length === 0) ? (
                      <p className="text-xs text-slate-400 text-center py-4 italic">
                        Belum ada sesi materi di modul ini. Klik "+ Tambah Sesi" untuk mengunggah materi.
                      </p>
                    ) : (
                      mod.lessons.map((lesson, lesIdx) => (
                        <div
                          key={lesson.id}
                          className="p-3.5 sm:p-4 rounded-lg border border-slate-200/80 bg-white hover:bg-slate-50/50 hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="w-6 h-6 rounded-md bg-slate-100 border border-slate-200/70 text-slate-600 flex items-center justify-center font-semibold text-xs shrink-0 mt-0.5">
                              {lesson.sortOrder || lesIdx + 1}
                            </div>

                            <div className="space-y-1.5 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-semibold text-slate-800 leading-snug">
                                  {lesson.title}
                                </h4>
                                {lesson.isFreePreview && (
                                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    Free Preview
                                  </span>
                                )}
                              </div>

                              {/* Cohesive, Academic Metadata Row */}
                              <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
                                <span className="flex items-center gap-1 text-slate-500">
                                  <Clock size={12} className="text-slate-400" /> {lesson.durationMin || 90} Menit
                                </span>

                                {lesson.videoUrl && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                                    <Video size={11} className="text-[#001847]" /> Video Siap
                                  </span>
                                )}

                                {lesson.pdfSlideUrl && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                                    <FileText size={11} className="text-slate-600" /> Slide PDF
                                  </span>
                                )}

                                {lesson.datasetUrl && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                                    <FileSpreadsheet size={11} className="text-slate-600" /> Dataset
                                  </span>
                                )}

                                {lesson.attachments && lesson.attachments.length > 0 && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                                    <Paperclip size={11} className="text-slate-600" /> {lesson.attachments.length} Berkas
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
                              className="px-3 py-1.5 rounded-lg border border-slate-200/90 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-2xs transition flex items-center gap-1"
                            >
                              <Edit2 size={12} className="text-slate-500" />
                              <span>Edit Sesi</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteLesson(mod.id, lesson.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
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
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="bg-[#001847] p-5 text-white flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#fdbc13]">
                  Silabus Kurikulum
                </span>
                <h3 className="text-base font-bold font-display text-white mt-0.5">
                  {editingModule ? "Edit Modul Kurikulum" : "Tambah Modul Kurikulum Baru"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModuleModalOpen(false)}
                className="p-1 rounded-lg text-white/70 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveModule} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Judul Modul / Section</label>
                <input
                  type="text"
                  required
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  placeholder="Contoh: Minggu 1: Anatomi & Standar Naskah Jurnal Scopus"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#001847]/20 focus:border-[#001847]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Deskripsi Singkat (Opsional)</label>
                <textarea
                  rows={2}
                  value={moduleDesc}
                  onChange={(e) => setModuleDesc(e.target.value)}
                  placeholder="Membedah struktur naskah IMRaD dan formula GAP Analysis..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#001847]/20 focus:border-[#001847]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Urutan Modul</label>
                <input
                  type="number"
                  value={moduleSort}
                  onChange={(e) => setModuleSort(Number(e.target.value))}
                  className="w-24 px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-[#001847]/20 focus:border-[#001847]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModuleModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !moduleTitle.trim()}
                  className="px-5 py-2 rounded-lg text-xs font-semibold text-white bg-[#001847] hover:bg-[#0b2c6b] shadow-sm transition disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-[#001847] p-5 text-white flex items-center justify-between sticky top-0 z-10">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#fdbc13]">
                  Manajemen Sesi Materi
                </span>
                <h3 className="text-base sm:text-lg font-bold font-display text-white mt-0.5">
                  {editingLesson ? "Edit Sesi Pembelajaran" : "Tambah Sesi Pembelajaran Baru"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLessonModalOpen(false)}
                className="p-1 rounded-lg text-white/70 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveLesson} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Judul Sesi Pembelajaran</label>
                <input
                  type="text"
                  required
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder="Contoh: Sesi 1: Standar Ekspektasi Reviewer Scopus Q1 & Anatomi IMRaD"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#001847]/20 focus:border-[#001847]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Durasi Sesi (Menit)</label>
                  <input
                    type="number"
                    value={durationMin}
                    onChange={(e) => setDurationMin(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-[#001847]/20 focus:border-[#001847]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Urutan Sesi</label>
                  <input
                    type="number"
                    value={lessonSort}
                    onChange={(e) => setLessonSort(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-[#001847]/20 focus:border-[#001847]"
                  />
                </div>

                <div className="flex items-center sm:pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={isFreePreview}
                      onChange={(e) => setIsFreePreview(e.target.checked)}
                      className="rounded border-slate-300 text-[#001847] focus:ring-[#001847]"
                    />
                    <span>Free Preview (Bisa Ditonton Gratis)</span>
                  </label>
                </div>
              </div>

              {/* Video URL */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
                  <Video size={13} className="text-[#001847]" />
                  <span>Tautan Rekaman Video / Zoom / YouTube / Drive</span>
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... atau link rekaman cloud Zoom"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#001847]/20 focus:border-[#001847]"
                />
              </div>

              {/* PDF Slide Handout URL */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
                  <FileText size={13} className="text-slate-600" />
                  <span>Tautan Slide Presentasi (Handout PDF)</span>
                </label>
                <input
                  type="url"
                  value={pdfSlideUrl}
                  onChange={(e) => setPdfSlideUrl(e.target.value)}
                  placeholder="https://drive.google.com/... atau URL dokumen PDF handout"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#001847]/20 focus:border-[#001847]"
                />
              </div>

              {/* Exercise Dataset URL */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
                  <FileSpreadsheet size={13} className="text-slate-600" />
                  <span>Tautan Dataset Latihan (Excel / SmartPLS / SPSS file)</span>
                </label>
                <input
                  type="url"
                  value={datasetUrl}
                  onChange={(e) => setDatasetUrl(e.target.value)}
                  placeholder="https://drive.google.com/... atau URL file dataset latihan"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#001847]/20 focus:border-[#001847]"
                />
              </div>

              {/* Multi-Attachment Dynamic Section */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Paperclip size={13} className="text-[#001847]" />
                    <span>Lampiran Berkas Pendukung Tambahan ({attachments.length})</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddAttachmentRow}
                    className="text-xs font-semibold text-[#001847] hover:underline flex items-center gap-1"
                  >
                    <Plus size={13} />
                    <span>Tambah Berkas</span>
                  </button>
                </div>

                {attachments.map((att, attIdx) => (
                  <div key={attIdx} className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 flex items-center gap-2">
                    <input
                      type="text"
                      value={att.title}
                      onChange={(e) => handleUpdateAttachmentRow(attIdx, "title", e.target.value)}
                      placeholder="Nama Berkas"
                      className="w-1/3 px-2.5 py-1.5 rounded border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#001847]"
                    />
                    <input
                      type="url"
                      value={att.url}
                      onChange={(e) => handleUpdateAttachmentRow(attIdx, "url", e.target.value)}
                      placeholder="URL Tautan Unduh"
                      className="flex-1 px-2.5 py-1.5 rounded border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#001847]"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachmentRow(attIdx)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition"
                      title="Hapus Baris"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setLessonModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !lessonTitle.trim()}
                  className="px-5 py-2 rounded-lg text-xs font-semibold text-white bg-[#001847] hover:bg-[#0b2c6b] shadow-sm transition disabled:opacity-50"
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
