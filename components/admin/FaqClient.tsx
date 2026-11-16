"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  HelpCircle,
  Plus,
  Edit2,
  Trash2,
  X,
  Tag,
  Power,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import {
  getFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  toggleFaqStatus,
} from "@/actions/tampilan";
import { useToast } from "@/components/ui/Toast";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sortOrder: number;
  isActive: boolean;
};

const CATEGORIES = [
  "Pendaftaran & Biaya",
  "Metode & Jadwal",
  "Program Bimbingan",
  "Tutor & Garansi",
  "Umum",
];

export default function FaqClient({ faqs: initial }: { faqs: FaqItem[] }) {
  const router = useRouter();
  const toast = useToast();
  const [faqs, setFaqs] = useState<FaqItem[]>(initial);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<FaqItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FaqItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFaqs(initial);
  }, [initial]);

  // Form State
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("Metode & Jadwal");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const filteredFaqs = faqs.filter((item) => {
    const matchCat =
      selectedCategory === "ALL" || item.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      item.question.toLowerCase().includes(q) ||
      item.answer.toLowerCase().includes(q) ||
      (item.category || "").toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const activeCount = faqs.filter((f) => f.isActive).length;

  const openCreate = () => {
    setEditing(null);
    setQuestion("");
    setAnswer("");
    setCategory("Metode & Jadwal");
    setSortOrder(faqs.length + 1);
    setIsActive(true);
    setShowModal(true);
  };

  const openEdit = (item: FaqItem) => {
    setEditing(item);
    setQuestion(item.question);
    setAnswer(item.answer);
    setCategory(item.category || "Umum");
    setSortOrder(item.sortOrder || 0);
    setIsActive(item.isActive);
    setShowModal(true);
  };

  const handleToggleStatus = async (item: FaqItem) => {
    const nextStatus = !item.isActive;
    const res = await toggleFaqStatus(item.id, nextStatus);
    if (res.success) {
      setFaqs((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, isActive: nextStatus } : f))
      );
      toast.success(
        "Status Diperbarui",
        `FAQ "${item.question.substring(0, 30)}..." berhasil di-${
          nextStatus ? "aktifkan" : "nonaktifkan"
        }.`
      );
    } else {
      toast.error("Gagal Mengubah Status", res.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      toast.error("Validasi Gagal", "Pertanyaan dan jawaban FAQ wajib diisi.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.set("question", question.trim());
    formData.set("answer", answer.trim());
    formData.set("category", category);
    formData.set("sortOrder", String(sortOrder));
    formData.set("isActive", String(isActive));

    const result = editing
      ? await updateFaq(editing.id, formData)
      : await createFaq(formData);

    setIsSubmitting(false);

    if (result.success) {
      setShowModal(false);
      const updated = await getFaqs();
      setFaqs(updated);
      toast.success(
        editing ? "FAQ Diperbarui" : "FAQ Ditambahkan",
        result.message || "Perubahan berhasil disimpan."
      );
      router.refresh();
    } else {
      toast.error("Gagal Menyimpan FAQ", result.message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    const result = await deleteFaq(deleteTarget.id);
    setIsSubmitting(false);

    if (result.success) {
      setFaqs((prev) => prev.filter((f) => f.id !== deleteTarget.id));
      toast.success("FAQ Dihapus", "Pertanyaan FAQ berhasil dihapus.");
      setDeleteTarget(null);
      router.refresh();
    } else {
      toast.error("Gagal Menghapus FAQ", result.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EAF1FA] text-[#09408C] border border-[#9AC1E2]">
              Landing Page & Konten
            </span>
            <span className="text-xs text-[#5B6882]">Pertanyaan Umum Siswa & Orang Tua</span>
          </div>
          <h1 className="text-2xl font-bold text-[#09408C] font-display flex items-center gap-2.5">
            <HelpCircle size={26} className="text-[#09408C]" />
            <span>Kelola FAQ & Tanya Jawab</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#5B6882] mt-0.5">
            Atur daftar pertanyaan dan jawaban seputar bimbingan, sistem jadwal, dan biaya untuk halaman utama.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#09408C] text-white text-xs font-bold hover:bg-[#0E3571] transition-colors shadow-xs shrink-0 self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Tambah Pertanyaan FAQ</span>
        </button>
      </div>

      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-[#D5DDEB] shadow-2xs">
          <div className="text-[11px] text-[#5B6882] font-semibold uppercase">Total Pertanyaan</div>
          <div className="text-xl font-bold text-[#09408C] font-display mt-1">{faqs.length}</div>
          <div className="text-[10px] text-[#5B6882] mt-0.5">Daftar FAQ tersimpan</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#D5DDEB] shadow-2xs">
          <div className="text-[11px] text-[#5B6882] font-semibold uppercase">FAQ Ditampilkan</div>
          <div className="text-xl font-bold text-[#1F6F4A] font-display mt-1">
            {activeCount}{" "}
            <span className="text-xs font-normal text-[#5B6882]">/ {faqs.length}</span>
          </div>
          <div className="text-[10px] text-[#1F6F4A] mt-0.5">Tayang di Landing Page</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#D5DDEB] shadow-2xs col-span-2 sm:col-span-1">
          <div className="text-[11px] text-[#5B6882] font-semibold uppercase">Kategori Aktif</div>
          <div className="text-xl font-bold text-[#09408C] font-display mt-1">
            {new Set(faqs.map((f) => f.category || "Umum")).size}
          </div>
          <div className="text-[10px] text-[#5B6882] mt-0.5">Topik bimbingan belajar</div>
        </div>
      </div>

      {/* 3. Filter & Search Toolbar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-[#D5DDEB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedCategory === "ALL"
                ? "bg-[#09408C] text-white shadow-2xs"
                : "bg-[#F4F7FB] text-[#5B6882] hover:bg-[#EAF1FA]"
            }`}
          >
            Semua ({faqs.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = faqs.filter((f) => f.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedCategory === cat
                    ? "bg-[#09408C] text-white shadow-2xs"
                    : "bg-[#F4F7FB] text-[#5B6882] hover:bg-[#EAF1FA]"
                }`}
              >
                {cat} {count > 0 ? `(${count})` : ""}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[240px]">
          <Search size={15} className="absolute left-3 top-2.5 text-[#5B6882]" />
          <input
            type="text"
            placeholder="Cari pertanyaan / jawaban..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring bg-white"
          />
        </div>
      </div>

      {/* 4. FAQ Cards List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#D5DDEB] p-12 text-center shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF1FA] text-[#09408C] flex items-center justify-center mx-auto">
              <HelpCircle size={22} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#1B2A41]">Tidak Ada FAQ yang Sesuai</h3>
              <p className="text-xs text-[#5B6882] mt-0.5">
                Coba sesuaikan kata kunci pencarian atau pilih kategori lain.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedCategory("ALL");
                setSearchQuery("");
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EAF1FA] text-[#09408C] text-xs font-bold hover:bg-[#9AC1E2]/40 transition-colors"
            >
              <RotateCcw size={13} />
              <span>Reset Filter</span>
            </button>
          </div>
        ) : (
          filteredFaqs.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl p-5 border transition-all shadow-xs ${
                item.isActive
                  ? "border-[#D5DDEB] hover:border-[#9AC1E2]"
                  : "border-[#D5DDEB]/60 bg-[#F4F7FB]/50 opacity-75"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {item.category && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EAF1FA] text-[#09408C] border border-[#9AC1E2]">
                        <Tag size={10} />
                        <span>{item.category}</span>
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                        item.isActive
                          ? "bg-[#E3F4EC] text-[#1F6F4A] border-[#1F6F4A]/25"
                          : "bg-[#FBE9E5] text-[#B4381F] border-[#B4381F]/25"
                      }`}
                    >
                      {item.isActive ? (
                        <>
                          <CheckCircle2 size={11} />
                          <span>Aktif (Tayang)</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={11} />
                          <span>Nonaktif</span>
                        </>
                      )}
                    </span>
                    <span className="text-[11px] text-[#5B6882] font-mono">
                      Urutan: #{item.sortOrder}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-[#1B2A41] leading-snug">
                    {item.question}
                  </h3>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(item)}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      item.isActive
                        ? "border-[#D5DDEB] bg-white text-[#1F6F4A] hover:bg-[#E3F4EC]"
                        : "border-[#B4381F]/30 bg-[#FBE9E5] text-[#B4381F] hover:bg-[#FBE9E5]/80"
                    }`}
                    title={item.isActive ? "Sembunyikan dari landing page" : "Tampilkan di landing page"}
                  >
                    <Power size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => openEdit(item)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#D5DDEB] bg-white text-[#1B2A41] text-xs font-semibold hover:bg-[#EAF1FA] transition-colors"
                  >
                    <Edit2 size={12} />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    className="p-1.5 rounded-lg border border-[#D5DDEB] bg-white text-[#B4381F] hover:bg-[#FBE9E5] transition-colors"
                    title="Hapus FAQ"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#5B6882] leading-relaxed pt-1">
                {item.answer}
              </p>
            </div>
          ))
        )}
      </div>

      {/* 5. Modal Tambah / Edit FAQ */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="faq-modal-title"
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
        >
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-6 max-w-lg w-full border border-[#D5DDEB] shadow-xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#D5DDEB]">
              <h3 id="faq-modal-title" className="text-base font-bold text-[#09408C] font-display">
                {editing ? "Edit Pertanyaan FAQ" : "Tambah Pertanyaan FAQ Baru"}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-[#5B6882] hover:bg-[#F4F7FB]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Pertanyaan <span className="text-[#B4381F]">*</span>
                </label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Contoh: Bagaimana aturan pengurangan kuota pertemuan?"
                  required
                  className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Jawaban Lengkap <span className="text-[#B4381F]">*</span>
                </label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={4}
                  placeholder="Tuliskan jawaban yang ramah, jelas, dan solutif bagi calon siswa/wali murid..."
                  required
                  className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                    Kategori Topik
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring bg-white font-medium"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                    Nomor Urutan Tampil
                  </label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    min={0}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="faqActiveCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-[#09408C] focus:ring-[#09408C]"
                />
                <label
                  htmlFor="faqActiveCheck"
                  className="text-xs font-semibold text-[#1B2A41] cursor-pointer"
                >
                  Tampilkan di Landing Page Website (Aktif)
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#D5DDEB]">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#5B6882] hover:bg-[#F4F7FB] rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold bg-[#09408C] text-white hover:bg-[#0E3571] rounded-xl transition-colors shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan FAQ"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 6. Modal Konfirmasi Hapus FAQ */}
      {deleteTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-faq-modal-title"
          onKeyDown={(e) => {
            if (e.key === "Escape") setDeleteTarget(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
        >
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-[#D5DDEB] shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-[#FBE9E5] text-[#B4381F] flex items-center justify-center">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3
                    id="delete-faq-modal-title"
                    className="text-base font-bold text-[#1B2A41] font-display"
                  >
                    Hapus Pertanyaan FAQ
                  </h3>
                  <p className="text-xs text-[#5B6882]">Konfirmasi penghapusan konten FAQ</p>
                </div>
              </div>
              <button
                onClick={() => setDeleteTarget(null)}
                className="p-1 rounded-lg text-[#5B6882] hover:bg-[#F4F7FB]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3.5 bg-[#F4F7FB] rounded-xl border border-[#D5DDEB] text-xs space-y-1">
              <div className="font-bold text-[#09408C]">{deleteTarget.question}</div>
              <div className="text-[#5B6882]">Kategori: {deleteTarget.category || "Umum"}</div>
            </div>

            <p className="text-xs text-[#5B6882]">
              Apakah Anda yakin ingin menghapus pertanyaan ini? Pertanyaan tidak akan lagi tampil pada
              halaman FAQ landing page.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D5DDEB]">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-[#5B6882] hover:bg-[#F4F7FB] rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-xs font-semibold bg-[#B4381F] text-white hover:bg-[#8F2C18] rounded-xl transition-colors shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? "Menghapus..." : "Hapus Permanen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
