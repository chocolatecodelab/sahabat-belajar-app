"use client";

import { useState } from "react";
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
} from "lucide-react";
import type { LearningMaterial, ProgramCategory } from "@/actions/materi";
import { createLearningMaterial, deleteLearningMaterial } from "@/actions/materi";

export default function MaterialManagerClient({
  initialMaterials = [],
}: {
  initialMaterials: LearningMaterial[];
}) {
  const [materials, setMaterials] = useState<LearningMaterial[]>(initialMaterials);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [programCategory, setProgramCategory] = useState<
    "K12" | "CPNS_BUMN" | "UTBK_SNBT" | "TOEFL_IELTS" | "S2_BEASISWA"
  >("CPNS_BUMN");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("2.5 MB");
  const [authorTutor, setAuthorTutor] = useState("Tim Akademik Sahabat Belajar");

  const categories = [
    { key: "ALL", label: "Semua Kategori" },
    { key: "CPNS_BUMN", label: "CPNS & BUMN" },
    { key: "UTBK_SNBT", label: "UTBK-SNBT" },
    { key: "TOEFL_IELTS", label: "TOEFL / IELTS" },
    { key: "K12", label: "Bimbel K-12" },
    { key: "S2_BEASISWA", label: "S2 & Beasiswa" },
  ];

  const filteredMaterials = materials.filter((mat) => {
    const matchCat = selectedCat === "ALL" || mat.programCategory === selectedCat;
    const matchSearch =
      mat.title.toLowerCase().includes(search.toLowerCase()) ||
      mat.subject.toLowerCase().includes(search.toLowerCase()) ||
      (mat.description && mat.description.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  const totalDownloads = materials.reduce((acc, m) => acc + (m.downloadCount || 0), 0);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim()) return;

    setIsSubmitting(true);
    const res = await createLearningMaterial({
      title,
      programCategory,
      subject,
      description,
      fileName: fileName || `${title.replace(/\s+/g, "_")}.pdf`,
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
        fileUrl: "/materials/sample-document.pdf",
        fileName: fileName || `${title.replace(/\s+/g, "_")}.pdf`,
        fileSize,
        authorTutor,
        downloadCount: 0,
        isPublished: true,
        createdAt: new Date().toISOString(),
      };
      setMaterials([newMat, ...materials]);
      setIsModalOpen(false);
      // Reset form
      setTitle("");
      setSubject("");
      setDescription("");
      setFileName("");
    } else {
      alert(res.message);
    }
  };

  const handleDelete = async (id: string, matTitle: string) => {
    if (!confirm(`Hapus modul "${matTitle}" dari bank materi?`)) return;

    const res = await deleteLearningMaterial(id);
    if (res.success) {
      setMaterials(materials.filter((m) => m.id !== id));
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF1FA] text-[#09408C] text-xs font-bold border border-[#9AC1E2] mb-2">
            <FolderOpen size={14} />
            <span>Tahap 3: Modul & Bank Materi Digital</span>
          </div>
          <h1 className="text-2xl font-bold text-[#09408C] font-display">
            Bank Modul & Ringkasan Konsep
          </h1>
          <p className="text-sm text-[#5B6882] mt-0.5">
            Kelola materi bimbingan digital, modul rumus cepat, pocket book, dan silabus untuk siswa Sahabat Belajar.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571] transition-colors shadow-xs shrink-0"
        >
          <Plus size={16} />
          <span>Tambah Modul Baru</span>
        </button>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#D5DDEB] shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs text-[#5B6882] font-semibold">Total Modul Belajar</div>
            <div className="text-2xl font-bold text-[#09408C] font-display mt-0.5">
              {materials.length} E-Book / Modul
            </div>
            <div className="text-[11px] text-[#1F6F4A] mt-1 font-medium">
              Tersedia untuk semua program
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
            <div className="text-xs text-[#5B6882] font-semibold">Kategori Program</div>
            <div className="text-2xl font-bold text-[#1F6F4A] font-display mt-0.5">
              5 Program
            </div>
            <div className="text-[11px] text-[#5B6882] mt-1">
              K-12, CPNS, UTBK, TOEFL, S2
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#E3F4EC] text-[#1F6F4A] flex items-center justify-center">
            <Sparkles size={22} />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#D5DDEB] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-2.5 text-[#5B6882]" />
          <input
            type="text"
            placeholder="Cari judul modul, topik, atau mata pelajaran..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D5DDEB] focus-ring bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setSelectedCat(c.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCat === c.key
                  ? "bg-[#09408C] text-white shadow-2xs"
                  : "bg-[#F4F7FB] text-[#5B6882] hover:bg-[#EAF1FA] hover:text-[#09408C]"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Materials */}
      {filteredMaterials.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#D5DDEB]">
          <FolderOpen size={40} className="mx-auto text-[#9AC1E2] mb-3" />
          <h3 className="text-base font-bold text-[#1B2A41]">
            Tidak ada modul belajar
          </h3>
          <p className="text-xs text-[#5B6882] mt-1">
            Belum ada materi pembelajaran pada kategori ini.
          </p>
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
                  <span className="px-2.5 py-0.5 rounded-full bg-[#EAF1FA] text-[#09408C] text-[11px] font-bold border border-[#9AC1E2]/60">
                    {mat.programCategory.replace("_", " ")}
                  </span>
                  <span className="text-[11px] font-semibold text-[#5B6882] bg-slate-100 px-2 py-0.5 rounded-md">
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
                  <span className="flex items-center gap-1">
                    <User size={12} className="text-[#09408C]" />
                    <span>{mat.authorTutor}</span>
                  </span>
                  <span className="font-semibold text-[#09408C]">
                    {mat.downloadCount} unduhan
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-4 border-t border-[#D5DDEB] flex items-center justify-between gap-2">
                <a
                  href={mat.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571] transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Download size={14} />
                  <span>Unduh Modul</span>
                </a>

                <button
                  onClick={() => handleDelete(mat.id, mat.title)}
                  className="p-2 rounded-xl text-[#5B6882] hover:text-[#B4381F] hover:bg-[#FBE9E5] transition-colors"
                  title="Hapus Modul"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tambah Modul Belajar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-xl border border-[#D5DDEB] space-y-5 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xl font-bold text-[#09408C] font-display">
                Tambah Modul Belajar Baru
              </h3>
              <p className="text-xs text-[#5B6882] mt-0.5">
                Unggah atau tautkan ringkasan materi bimbingan Sahabat Belajar.
              </p>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Judul Modul Pembelajaran *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Modul Ringkasan Rumus Cepat TIU: Aritmatika & Deret"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                    Kategori Program
                  </label>
                  <select
                    value={programCategory}
                    onChange={(e) => setProgramCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring bg-white"
                  >
                    <option value="CPNS_BUMN">CPNS & BUMN</option>
                    <option value="UTBK_SNBT">UTBK-SNBT</option>
                    <option value="TOEFL_IELTS">TOEFL / IELTS</option>
                    <option value="K12">Bimbel K-12</option>
                    <option value="S2_BEASISWA">S2 & Beasiswa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                    Mata Pelajaran / Topik *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: TIU atau Matematika Lanjutan"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                    Nama File PDF
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Modul_TIU_Rumus_Cepat.pdf"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                    Ukuran File (Perkiraan)
                  </label>
                  <input
                    type="text"
                    value={fileSize}
                    onChange={(e) => setFileSize(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Penyusun / Tutor
                </label>
                <input
                  type="text"
                  value={authorTutor}
                  onChange={(e) => setAuthorTutor(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Deskripsi Isi Modul
                </label>
                <textarea
                  rows={3}
                  placeholder="Uraian materi pokok yang dibahas dan target capaian bimbingan..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                  {isSubmitting ? "Menyimpan..." : "Publikasikan Modul"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
