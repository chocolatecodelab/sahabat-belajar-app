"use client";

import { useState, useEffect, useMemo } from "react";
import {
  FolderOpen,
  Plus,
  Search,
  Download,
  Trash2,
  FileText,
  User,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Tag,
  Edit2,
  UploadCloud,
  ExternalLink,
  Eye,
  EyeOff,
  Layers,
  X,
  RotateCcw,
  Share2,
  Copy,
  Check,
  ArrowUpDown,
  SlidersHorizontal,
} from "lucide-react";
import type { LearningMaterial, ProgramCategory } from "@/actions/materi";
import {
  createLearningMaterial,
  updateLearningMaterial,
  deleteLearningMaterial,
  trackMaterialDownload,
} from "@/actions/materi";
import { useToast } from "@/components/ui/Toast";

export default function MaterialManagerClient({
  initialMaterials = [],
}: {
  initialMaterials: LearningMaterial[];
}) {
  const toast = useToast();
  const [materials, setMaterials] = useState<LearningMaterial[]>(initialMaterials);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("ALL");
  const [sortBy, setSortBy] = useState<"NEWEST" | "DOWNLOADS" | "TITLE_AZ" | "SIZE">("NEWEST");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<LearningMaterial | null>(null);
  const [previewMaterial, setPreviewMaterial] = useState<LearningMaterial | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Escape key listener to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isModalOpen) setIsModalOpen(false);
        if (previewMaterial) setPreviewMaterial(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, previewMaterial]);

  // Form State (for both create & edit)
  const [title, setTitle] = useState("");
  const [programCategory, setProgramCategory] = useState<
    "K12" | "CPNS_BUMN" | "UTBK_SNBT" | "TOEFL_IELTS" | "S2_BEASISWA" | "PENULISAN_ILMIAH"
  >("CPNS_BUMN");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileSize, setFileSize] = useState("2.5 MB");
  const [authorTutor, setAuthorTutor] = useState("Tim Akademik Sahabat Belajar");
  const [isPublished, setIsPublished] = useState(true);

  const categories = [
    { key: "ALL", label: "Semua Kategori" },
    { key: "CPNS_BUMN", label: "CPNS & BUMN" },
    { key: "UTBK_SNBT", label: "UTBK-SNBT" },
    { key: "TOEFL_IELTS", label: "TOEFL / IELTS" },
    { key: "K12", label: "Bimbel K-12" },
    { key: "S2_BEASISWA", label: "S2 & Beasiswa" },
    { key: "PENULISAN_ILMIAH", label: "Kepenulisan Ilmiah" },
  ];

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: materials.length };
    categories.forEach((c) => {
      if (c.key !== "ALL") counts[c.key] = 0;
    });
    materials.forEach((m) => {
      counts[m.programCategory] = (counts[m.programCategory] || 0) + 1;
    });
    return counts;
  }, [materials]);

  // Filtered and Sorted Materials
  const filteredMaterials = useMemo(() => {
    const filtered = materials.filter((mat) => {
      const matchCat = selectedCat === "ALL" || mat.programCategory === selectedCat;
      const matchSearch =
        mat.title.toLowerCase().includes(search.toLowerCase()) ||
        mat.subject.toLowerCase().includes(search.toLowerCase()) ||
        (mat.description && mat.description.toLowerCase().includes(search.toLowerCase())) ||
        mat.authorTutor.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "DOWNLOADS") {
        return (b.downloadCount || 0) - (a.downloadCount || 0);
      }
      if (sortBy === "TITLE_AZ") {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === "SIZE") {
        const parseMB = (s: string) => parseFloat(s) || 0;
        return parseMB(b.fileSize) - parseMB(a.fileSize);
      }
      // Default: NEWEST
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [materials, selectedCat, search, sortBy]);

  const totalDownloads = materials.reduce((acc, m) => acc + (m.downloadCount || 0), 0);
  const publishedCount = materials.filter((m) => m.isPublished).length;
  const draftCount = materials.length - publishedCount;

  const handleTogglePublish = async (mat: LearningMaterial) => {
    const newStatus = !mat.isPublished;
    const res = await updateLearningMaterial(mat.id, { isPublished: newStatus });
    if (res.success) {
      setMaterials((prev) =>
        prev.map((m) => (m.id === mat.id ? { ...m, isPublished: newStatus } : m))
      );
      toast.success(
        newStatus ? "Modul Dipublikasikan" : "Modul Dijadikan Draf",
        `Modul "${mat.title}" kini ${newStatus ? "tampil di portal siswa" : "disembunyikan dari siswa"}.`
      );
    } else {
      toast.error("Gagal Mengubah Status", res.message);
    }
  };

  const handleCopyLink = (mat: LearningMaterial) => {
    const fullUrl = `${window.location.origin}${mat.fileUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(mat.id);
    setTimeout(() => setCopiedId(null), 2500);
    toast.info("Tautan Disalin", `Tautan unduh modul "${mat.title}" berhasil disalin ke clipboard.`);
  };

  const handleShareWhatsApp = (mat: LearningMaterial) => {
    const fullUrl = `${window.location.origin}${mat.fileUrl}`;
    const text =
      `Halo! 📚 Modul Pembelajaran Resmi Sahabat Belajar:\n\n` +
      `*${mat.title}*\n` +
      `• Program: ${mat.programCategory.replace(/_/g, " ")}\n` +
      `• Mata Pelajaran: ${mat.subject}\n` +
      `• Penyusun: ${mat.authorTutor}\n` +
      `• Ukuran File: ${mat.fileSize}\n\n` +
      `Akses dan unduh modul materi lengkap di: ${fullUrl}\n\n` +
      `Semangat belajarnya! ✨ #BersamaSahabat`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const resetForm = () => {
    setTitle("");
    setProgramCategory("CPNS_BUMN");
    setSubject("");
    setDescription("");
    setFileName("");
    setFileUrl("");
    setFileSize("2.5 MB");
    setAuthorTutor("Tim Akademik Sahabat Belajar");
    setIsPublished(true);
    setEditingMaterial(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (mat: LearningMaterial) => {
    setEditingMaterial(mat);
    setTitle(mat.title);
    setProgramCategory(mat.programCategory);
    setSubject(mat.subject);
    setDescription(mat.description || "");
    setFileName(mat.fileName);
    setFileUrl(mat.fileUrl);
    setFileSize(mat.fileSize);
    setAuthorTutor(mat.authorTutor);
    setIsPublished(mat.isPublished);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Format File Tidak Valid", "Harap unggah berkas dengan format PDF.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error("File Terlalu Besar", "Ukuran file PDF maksimal 15MB.");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "modules");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Gagal mengunggah file");
      }

      setFileUrl(data.url);
      setFileName(file.name);
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1) + " MB";
      setFileSize(sizeMB);
      toast.success("File Terunggah", `Berkas ${file.name} (${sizeMB}) siap dipublikasikan.`);
    } catch (err: any) {
      toast.error("Gagal Mengunggah", err.message || "Terjadi kesalahan saat unggah berkas.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim()) {
      toast.error("Data Belum Lengkap", "Judul modul dan mata pelajaran wajib diisi.");
      return;
    }

    setIsSubmitting(true);

    if (editingMaterial) {
      // Edit Mode
      const res = await updateLearningMaterial(editingMaterial.id, {
        title,
        programCategory,
        subject,
        description,
        fileName: fileName || `${title.replace(/\s+/g, "_")}.pdf`,
        fileUrl: fileUrl || editingMaterial.fileUrl,
        fileSize,
        authorTutor,
        isPublished,
      });
      setIsSubmitting(false);

      if (res.success) {
        setMaterials((prev) =>
          prev.map((m) =>
            m.id === editingMaterial.id
              ? {
                  ...m,
                  title,
                  programCategory,
                  subject,
                  description,
                  fileName: fileName || `${title.replace(/\s+/g, "_")}.pdf`,
                  fileUrl: fileUrl || editingMaterial.fileUrl,
                  fileSize,
                  authorTutor,
                  isPublished,
                }
              : m
          )
        );
        setIsModalOpen(false);
        toast.success("Modul Diperbarui", `Modul "${title}" berhasil diperbarui.`);
        resetForm();
      } else {
        toast.error("Gagal Memperbarui Modul", res.message);
      }
    } else {
      // Create Mode
      const res = await createLearningMaterial({
        title,
        programCategory,
        subject,
        description,
        fileName: fileName || `${title.replace(/\s+/g, "_")}.pdf`,
        fileUrl: fileUrl || "/materials/sample-document.pdf",
        fileSize,
        authorTutor,
      });
      setIsSubmitting(false);

      if (res.success && res.data) {
        const newMat: LearningMaterial = {
          id: res.data.id,
          title,
          programCategory,
          subject,
          description,
          fileUrl: fileUrl || "/materials/sample-document.pdf",
          fileName: fileName || `${title.replace(/\s+/g, "_")}.pdf`,
          fileSize,
          authorTutor,
          downloadCount: 0,
          isPublished: true,
          createdAt: new Date().toISOString(),
        };
        setMaterials([newMat, ...materials]);
        setIsModalOpen(false);
        toast.success("Modul Ditambahkan", `Modul "${title}" berhasil dipublikasikan.`);
        resetForm();
      } else {
        toast.error("Gagal Menambah Modul", res.message);
      }
    }
  };

  const handleDelete = async (id: string, matTitle: string) => {
    if (!confirm(`Hapus modul "${matTitle}" secara permanen dari database bank materi?`)) return;

    const res = await deleteLearningMaterial(id);
    if (res.success) {
      toast.success("Modul Dihapus", `Modul "${matTitle}" berhasil dihapus.`);
      setMaterials(materials.filter((m) => m.id !== id));
    } else {
      toast.error("Gagal Menghapus Modul", res.message);
    }
  };

  const handleDownload = async (mat: LearningMaterial) => {
    try {
      trackMaterialDownload(mat.id);
      setMaterials((prev) =>
        prev.map((m) => (m.id === mat.id ? { ...m, downloadCount: m.downloadCount + 1 } : m))
      );
      window.open(mat.fileUrl, "_blank");
      toast.success("Mengunduh Modul", `Mengunduh berkas ${mat.fileName}`);
    } catch {
      window.open(mat.fileUrl, "_blank");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF1FA] text-[#09408C] text-xs font-bold border border-[#9AC1E2] mb-2">
            <FolderOpen size={14} />
            <span>Bank Modul & Repositori Materi Digital</span>
          </div>
          <h1 className="text-2xl font-bold text-[#09408C] font-display">
            Bank Modul & Ringkasan Konsep
          </h1>
          <p className="text-sm text-[#5B6882] mt-0.5">
            Kelola modul bimbingan digital, ringkasan rumus cepat, pocket book, dan silabus untuk siswa Sahabat Belajar.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571] transition-colors shadow-xs shrink-0"
        >
          <Plus size={16} />
          <span>Tambah Modul Baru</span>
        </button>
      </div>

      {/* Production Info Banner */}
      <div className="bg-[#EAF1FA]/80 border border-[#9AC1E2] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-[#09408C]">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-white text-[#09408C] shadow-2xs shrink-0 mt-0.5">
            <Layers size={18} />
          </div>
          <div>
            <div className="font-bold text-sm text-[#09408C]">
              Sinkronisasi Langsung ke Portal Siswa & Orang Tua
            </div>
            <p className="text-[#5B6882] mt-0.5 leading-relaxed">
              Seluruh modul yang diunggah di sini tersimpan di database cloud Supabase dan otomatis dapat diakses oleh siswa aktif pada tab <strong>Materi Belajar</strong>, lengkap dengan pembaca in-app PDF dan pelacakan unduhan.
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#09408C] text-white font-bold text-[11px] flex items-center gap-1">
            <CheckCircle2 size={12} />
            <span>Database Terhubung</span>
          </span>
        </div>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#D5DDEB] shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs text-[#5B6882] font-semibold">Total Modul Belajar</div>
            <div className="text-2xl font-bold text-[#09408C] font-display mt-0.5">
              {materials.length} E-Book / Modul
            </div>
            <div className="text-[11px] text-[#1F6F4A] mt-1 font-medium flex items-center gap-1.5">
              <span>{publishedCount} Terbit</span>
              <span>•</span>
              <span className="text-[#5B6882]">{draftCount} Draf</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#EAF1FA] text-[#09408C] flex items-center justify-center">
            <BookOpen size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#D5DDEB] shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs text-[#5B6882] font-semibold">Total Akses / Unduhan</div>
            <div className="text-2xl font-bold text-[#295897] font-display mt-0.5">
              {totalDownloads} Kali
            </div>
            <div className="text-[11px] text-[#5B6882] mt-1 font-medium">
              Diakses oleh siswa aktif
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#EAF1FA] text-[#295897] flex items-center justify-center">
            <Download size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#D5DDEB] shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs text-[#5B6882] font-semibold">Kategori Layanan</div>
            <div className="text-2xl font-bold text-[#1F6F4A] font-display mt-0.5">
              6 Program
            </div>
            <div className="text-[11px] text-[#5B6882] mt-1">
              K-12, CPNS, UTBK, TOEFL, S2, Karya Ilmiah
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#E3F4EC] text-[#1F6F4A] flex items-center justify-center">
            <Sparkles size={22} />
          </div>
        </div>
      </div>

      {/* Filter & Sort Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#D5DDEB] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3 top-2.5 text-[#5B6882]" />
            <input
              type="text"
              placeholder="Cari judul modul, topik, atau mata pelajaran..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D5DDEB] focus-ring bg-white text-[#1B2A41]"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <div className="flex items-center gap-1.5 text-xs text-[#5B6882] font-medium">
              <ArrowUpDown size={14} className="text-[#09408C]" />
              <span className="hidden sm:inline">Urutkan:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 text-xs rounded-xl border border-[#D5DDEB] bg-[#F4F7FB] text-[#09408C] font-semibold focus:outline-none focus:border-[#09408C]"
            >
              <option value="NEWEST">Terbaru Ditambahkan</option>
              <option value="DOWNLOADS">Paling Banyak Diunduh</option>
              <option value="TITLE_AZ">Judul (A - Z)</option>
              <option value="SIZE">Ukuran File</option>
            </select>

            {(selectedCat !== "ALL" || search || sortBy !== "NEWEST") && (
              <button
                onClick={() => {
                  setSelectedCat("ALL");
                  setSearch("");
                  setSortBy("NEWEST");
                }}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[#B4381F] hover:bg-[#FBE9E5] transition-colors flex items-center gap-1"
                title="Reset Filter"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs with Badges */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#D5DDEB]/60">
          {categories.map((c) => {
            const count = categoryCounts[c.key] || 0;
            const isSelected = selectedCat === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setSelectedCat(c.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[#09408C] text-white shadow-2xs"
                    : "bg-[#F4F7FB] text-[#5B6882] hover:bg-[#EAF1FA] hover:text-[#09408C]"
                }`}
              >
                <span>{c.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-[#D5DDEB] text-[#5B6882]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Materials */}
      {filteredMaterials.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#D5DDEB]">
          <FolderOpen size={40} className="mx-auto text-[#9AC1E2] mb-3" />
          <h3 className="text-base font-bold text-[#1B2A41]">
            Tidak ada modul belajar
          </h3>
          <p className="text-xs text-[#5B6882] mt-1 mb-4">
            Belum ada materi pembelajaran yang sesuai dengan filter pencarian.
          </p>
          <button
            onClick={() => {
              setSelectedCat("ALL");
              setSearch("");
            }}
            className="px-4 py-2 rounded-xl bg-[#EAF1FA] text-[#09408C] text-xs font-semibold hover:bg-[#D5DDEB] transition-colors"
          >
            Tampilkan Semua Modul
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMaterials.map((mat) => (
            <div
              key={mat.id}
              className="bg-white rounded-3xl border border-[#D5DDEB] p-6 shadow-xs hover:border-[#09408C] hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Meta Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#EAF1FA] text-[#09408C] text-[11px] font-bold border border-[#9AC1E2]/60">
                      {mat.programCategory.replace(/_/g, " ")}
                    </span>
                    <button
                      onClick={() => handleTogglePublish(mat)}
                      title={
                        mat.isPublished
                          ? "Klik untuk jadikan Draf (sembunyikan dari siswa)"
                          : "Klik untuk Terbitkan ke siswa"
                      }
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all shadow-2xs ${
                        mat.isPublished
                          ? "bg-[#E3F4EC] text-[#1F6F4A] hover:bg-emerald-100 border border-[#1F6F4A]/30"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300"
                      }`}
                    >
                      {mat.isPublished ? <Eye size={11} /> : <EyeOff size={11} />}
                      <span>{mat.isPublished ? "Terbit" : "Draf"}</span>
                    </button>
                  </div>
                  <span className="text-[11px] font-semibold text-[#5B6882] bg-slate-100 px-2 py-0.5 rounded-md tabular-nums">
                    {mat.fileSize}
                  </span>
                </div>

                <div className="text-[11px] font-bold text-[#295897] uppercase tracking-wide mb-1">
                  {mat.subject}
                </div>

                <h3 className="font-bold text-base text-[#1B2A41] font-display leading-snug">
                  {mat.title}
                </h3>

                <p className="text-xs text-[#5B6882] mt-2 line-clamp-3 leading-relaxed">
                  {mat.description || "Modul bimbingan konseptual resmi Sahabat Belajar."}
                </p>

                <div className="mt-4 pt-3 border-t border-[#D5DDEB] text-[11px] text-[#5B6882] flex items-center justify-between">
                  <span className="flex items-center gap-1 truncate max-w-[180px]">
                    <User size={12} className="text-[#09408C] shrink-0" />
                    <span className="truncate">{mat.authorTutor}</span>
                  </span>
                  <span className="font-semibold text-[#09408C] shrink-0 tabular-nums">
                    {mat.downloadCount} unduhan
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-4 border-t border-[#D5DDEB] flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleDownload(mat)}
                    className="px-3 py-1.5 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571] transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <Download size={13} />
                    <span>Unduh</span>
                  </button>

                  <button
                    onClick={() => setPreviewMaterial(mat)}
                    className="px-2.5 py-1.5 rounded-xl bg-[#EAF1FA] text-[#09408C] text-xs font-semibold hover:bg-[#D5DDEB] transition-colors flex items-center gap-1"
                    title="Pratinjau Modul"
                  >
                    <Eye size={13} />
                    <span className="hidden sm:inline">Baca</span>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopyLink(mat)}
                    className="p-1.5 rounded-xl text-[#5B6882] hover:text-[#09408C] hover:bg-[#EAF1FA] transition-colors"
                    title="Salin Tautan Modul"
                  >
                    {copiedId === mat.id ? <Check size={15} className="text-[#1F6F4A]" /> : <Copy size={15} />}
                  </button>

                  <button
                    onClick={() => handleShareWhatsApp(mat)}
                    className="p-1.5 rounded-xl text-[#5B6882] hover:text-[#1F6F4A] hover:bg-[#E3F4EC] transition-colors"
                    title="Bagikan ke Siswa via WhatsApp"
                  >
                    <Share2 size={15} />
                  </button>

                  <button
                    onClick={() => openEditModal(mat)}
                    className="p-1.5 rounded-xl text-[#5B6882] hover:text-[#09408C] hover:bg-[#EAF1FA] transition-colors"
                    title="Edit Modul"
                  >
                    <Edit2 size={15} />
                  </button>

                  <button
                    onClick={() => handleDelete(mat.id, mat.title)}
                    className="p-1.5 rounded-xl text-[#5B6882] hover:text-[#B4381F] hover:bg-[#FBE9E5] transition-colors"
                    title="Hapus Modul"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Pratinjau Berkas PDF */}
      {previewMaterial && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full h-[90vh] shadow-2xl border border-[#D5DDEB] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#D5DDEB] flex items-center justify-between gap-3 bg-[#F4F7FB]/70">
              <div className="flex items-center gap-3 truncate">
                <div className="w-10 h-10 rounded-xl bg-[#EAF1FA] text-[#09408C] flex items-center justify-center shrink-0">
                  <FileText size={20} />
                </div>
                <div className="truncate">
                  <h3 className="text-sm sm:text-base font-bold text-[#09408C] font-display truncate">
                    {previewMaterial.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-[#5B6882] mt-0.5">
                    <span className="font-semibold text-[#295897]">{previewMaterial.subject}</span>
                    <span>•</span>
                    <span>{previewMaterial.fileName} ({previewMaterial.fileSize})</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button
                  onClick={() => handleCopyLink(previewMaterial)}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white border border-[#D5DDEB] text-[#5B6882] hover:text-[#09408C] hover:bg-[#EAF1FA] transition-colors text-xs font-semibold flex items-center gap-1 shadow-2xs"
                  title="Salin Tautan Modul"
                >
                  {copiedId === previewMaterial.id ? (
                    <Check size={13} className="text-[#1F6F4A]" />
                  ) : (
                    <Copy size={13} />
                  )}
                  <span className="hidden sm:inline">Salin Tautan</span>
                </button>

                <button
                  onClick={() => handleShareWhatsApp(previewMaterial)}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#E3F4EC] text-[#1F6F4A] hover:bg-emerald-100 border border-[#1F6F4A]/30 transition-colors text-xs font-semibold flex items-center gap-1 shadow-2xs"
                  title="Bagikan ke WhatsApp Siswa"
                >
                  <Share2 size={13} />
                  <span className="hidden sm:inline">Kirim WA</span>
                </button>

                <a
                  href={previewMaterial.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 sm:p-2 rounded-xl text-[#5B6882] hover:text-[#09408C] hover:bg-[#EAF1FA] transition-colors"
                  title="Buka di Tab Baru"
                >
                  <ExternalLink size={16} />
                </a>

                <button
                  onClick={() => handleDownload(previewMaterial)}
                  className="px-3 py-1.5 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571] transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Download size={14} />
                  <span className="hidden sm:inline">Unduh</span>
                </button>

                <button
                  onClick={() => setPreviewMaterial(null)}
                  className="p-1.5 sm:p-2 rounded-xl text-[#5B6882] hover:text-[#1B2A41] hover:bg-[#EAF1FA] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body: Embedded PDF Preview */}
            <div className="flex-1 bg-slate-100 p-2 sm:p-4 overflow-hidden">
              <iframe
                src={`${previewMaterial.fileUrl}#toolbar=1`}
                title={previewMaterial.title}
                className="w-full h-full rounded-2xl bg-white border border-[#D5DDEB] shadow-inner"
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah / Edit Modul Belajar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-xl border border-[#D5DDEB] space-y-5 animate-in fade-in duration-200 max-h-[90vh] overflow-y-auto">
            <div>
              <h3 className="text-xl font-bold text-[#09408C] font-display">
                {editingMaterial ? "Edit Modul Belajar" : "Tambah Modul Belajar Baru"}
              </h3>
              <p className="text-xs text-[#5B6882] mt-0.5">
                {editingMaterial
                  ? "Perbarui metadata atau berkas modul pembelajaran ini."
                  : "Unggah berkas PDF dan terbitkan modul bimbingan Sahabat Belajar."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="material-title-input" className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Judul Modul Pembelajaran *
                </label>
                <input
                  id="material-title-input"
                  type="text"
                  required
                  placeholder="Contoh: Modul Ringkasan Rumus Cepat TIU: Aritmatika & Deret"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring text-[#1B2A41]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="material-cat-select" className="block text-xs font-bold text-[#1B2A41] mb-1">
                    Kategori Program
                  </label>
                  <select
                    id="material-cat-select"
                    value={programCategory}
                    onChange={(e) => setProgramCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring bg-white text-[#1B2A41]"
                  >
                    <option value="CPNS_BUMN">CPNS & BUMN</option>
                    <option value="UTBK_SNBT">UTBK-SNBT</option>
                    <option value="TOEFL_IELTS">TOEFL / IELTS</option>
                    <option value="K12">Bimbel K-12</option>
                    <option value="S2_BEASISWA">S2 & Beasiswa</option>
                    <option value="PENULISAN_ILMIAH">Kepenulisan Ilmiah</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="material-subject-input" className="block text-xs font-bold text-[#1B2A41] mb-1">
                    Mata Pelajaran / Topik *
                  </label>
                  <input
                    id="material-subject-input"
                    type="text"
                    required
                    placeholder="Contoh: TIU atau Matematika Lanjutan"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring text-[#1B2A41]"
                  />
                </div>
              </div>

              {/* Upload File PDF */}
              <div className="p-3.5 rounded-2xl bg-[#F4F7FB] border border-[#D5DDEB] space-y-2">
                <label className="block text-xs font-bold text-[#09408C]">
                  Unggah Berkas PDF Modul
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="text-xs text-[#5B6882] file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#09408C] file:text-white hover:file:bg-[#0E3571] cursor-pointer"
                  />
                  {isUploading && (
                    <span className="text-xs text-[#09408C] font-semibold animate-pulse">
                      Mengunggah berkas...
                    </span>
                  )}
                </div>
                {fileName && (
                  <div className="text-[11px] text-[#1F6F4A] flex items-center gap-1 font-medium mt-1">
                    <CheckCircle2 size={12} />
                    <span>Berkas siap: {fileName} ({fileSize})</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="material-filename-input" className="block text-xs font-bold text-[#1B2A41] mb-1">
                    Nama File Tampilan
                  </label>
                  <input
                    id="material-filename-input"
                    type="text"
                    placeholder="Contoh: Modul_TIU_Rumus_Cepat.pdf"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring text-[#1B2A41]"
                  />
                </div>

                <div>
                  <label htmlFor="material-filesize-input" className="block text-xs font-bold text-[#1B2A41] mb-1">
                    Ukuran File (Perkiraan)
                  </label>
                  <input
                    id="material-filesize-input"
                    type="text"
                    value={fileSize}
                    onChange={(e) => setFileSize(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring text-[#1B2A41]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="material-author-input" className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Penyusun / Tutor
                </label>
                <input
                  id="material-author-input"
                  type="text"
                  value={authorTutor}
                  onChange={(e) => setAuthorTutor(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring text-[#1B2A41]"
                />
              </div>

              <div>
                <label htmlFor="material-desc-input" className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Deskripsi Isi Modul
                </label>
                <textarea
                  id="material-desc-input"
                  rows={3}
                  placeholder="Uraian materi pokok yang dibahas dan target capaian bimbingan..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring text-[#1B2A41]"
                />
              </div>

              {/* Status Publikasi */}
              {editingMaterial && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="is-published-check"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="rounded border-[#D5DDEB] text-[#09408C] focus:ring-[#09408C]"
                  />
                  <label htmlFor="is-published-check" className="text-xs font-bold text-[#1B2A41]">
                    Terbitkan di Portal Siswa (Tampil untuk siswa aktif)
                  </label>
                </div>
              )}

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
                  disabled={isSubmitting || isUploading}
                  className="px-5 py-2.5 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571] disabled:opacity-50 flex items-center gap-1.5"
                >
                  <CheckCircle2 size={14} />
                  <span>
                    {isSubmitting
                      ? "Menyimpan..."
                      : editingMaterial
                      ? "Simpan Perubahan"
                      : "Publikasikan Modul"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
