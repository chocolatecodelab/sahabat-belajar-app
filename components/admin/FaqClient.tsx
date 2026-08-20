"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HelpCircle, Plus, Edit, Trash2, X, Tag } from "lucide-react";
import { getFaqs, createFaq, updateFaq, deleteFaq } from "@/actions/tampilan";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sortOrder: number;
  isActive: boolean;
};

const CATEGORIES = ["Pendaftaran", "Bimbingan", "Sertifikat", "Materi & Rekaman", "Umum"];

export default function FaqClient({ faqs: initial }: { faqs: FaqItem[] }) {
  const router = useRouter();
  const [faqs, setFaqs] = useState<FaqItem[]>(initial);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<FaqItem | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFaqs(initial);
  }, [initial]);

  // Form State
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("Pendaftaran");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const openCreate = () => {
    setEditing(null);
    setQuestion("");
    setAnswer("");
    setCategory("Pendaftaran");
    setSortOrder(faqs.length + 1);
    setIsActive(true);
    setError("");
    setShowModal(true);
  };

  const openEdit = (item: FaqItem) => {
    setEditing(item);
    setQuestion(item.question);
    setAnswer(item.answer);
    setCategory(item.category || "Umum");
    setSortOrder(item.sortOrder);
    setIsActive(item.isActive);
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.set("question", question);
    formData.set("answer", answer);
    formData.set("category", category);
    formData.set("sortOrder", String(sortOrder));
    formData.set("isActive", String(isActive));

    const result = editing
      ? await updateFaq(editing.id, formData)
      : await createFaq(formData);

    if (result.success) {
      setShowModal(false);
      const updated = await getFaqs();
      setFaqs(updated);
      router.refresh();
    } else {
      setError(result.message || "Gagal menyimpan FAQ");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus pertanyaan FAQ ini?")) return;
    const result = await deleteFaq(id);
    if (result.success) {
      const updated = await getFaqs();
      setFaqs(updated);
      router.refresh();
    } else {
      alert(result.message);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-headline-lg flex items-center gap-3" style={{ color: "var(--color-on-surface)" }}>
            <HelpCircle size={28} /> FAQ & Tanya Jawab Kursus
          </h1>
          <p className="text-body-md mt-1" style={{ color: "var(--color-on-surface-variant)" }}>
            Kelola daftar pertanyaan yang sering diajukan seputar kelas bimbingan riset
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-label-lg font-semibold text-white shadow-sm hover:shadow-md transition-all"
          style={{ background: "var(--color-primary)" }}
        >
          <Plus size={18} /> Tambah FAQ
        </button>
      </div>

      <div className="space-y-4 mb-8">
        {faqs.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-2xl p-6 border shadow-xs transition-all ${
              item.isActive ? "border-gray-200" : "border-gray-200 opacity-60 bg-gray-50/50"
            }`}
          >
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                {item.category && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-bold uppercase bg-blue-50 text-blue-800 mb-2">
                    <Tag size={10} /> {item.category}
                  </span>
                )}
                <h3 className="text-base font-bold text-gray-900">{item.question}</h3>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => openEdit(item)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-blue-900 hover:bg-blue-50 transition-colors"
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Hapus"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{item.answer}</p>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
              <span>Urutan #{item.sortOrder}</span>
              <span className={`inline-flex px-2 py-0.5 rounded-full font-semibold ${
                item.isActive ? "bg-emerald-50 text-emerald-800" : "bg-gray-100 text-gray-500"
              }`}>
                {item.isActive ? "Aktif" : "Nonaktif"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h2 className="text-title-lg font-bold text-gray-900">
                {editing ? "Edit FAQ" : "Tambah FAQ"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg mb-4 bg-red-50 text-red-800 text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-gray-600 block mb-1">Pertanyaan</label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Contoh: Apakah pemula yang belum punya judul bisa ikut?"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border text-sm focus-ring"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-gray-600 block mb-1">Jawaban Lengkap</label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={4}
                  placeholder="Tuliskan jawaban yang jelas dan ramah bagi calon peserta..."
                  required
                  className="w-full px-4 py-2.5 rounded-lg border text-sm resize-none focus-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase text-gray-600 block mb-1">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border text-sm focus-ring"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-gray-600 block mb-1">Urutan</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    min={0}
                    className="w-full px-4 py-2.5 rounded-lg border text-sm focus-ring"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="faqActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-900"
                />
                <label htmlFor="faqActive" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Tampilkan di Landing Page (Aktif)
                </label>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 rounded-lg text-sm font-semibold text-white shadow-sm disabled:opacity-50"
                  style={{ background: "var(--color-primary)" }}
                >
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
