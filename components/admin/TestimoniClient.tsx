"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Star, Plus, Edit, Trash2, X, MessageSquare, Trophy, Building2, User } from "lucide-react";
import { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from "@/actions/tampilan";

type TestimonialItem = {
  id: string;
  name: string;
  role: string;
  institution: string | null;
  content: string;
  avatar: string | null;
  rating: number;
  achievement: string | null;
  sortOrder: number;
  isActive: boolean;
};

export default function TestimoniClient({ testimonials: initial }: { testimonials: TestimonialItem[] }) {
  const router = useRouter();
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(initial);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<TestimonialItem | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTestimonials(initial);
  }, [initial]);

  // Form State
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [institution, setInstitution] = useState("");
  const [content, setContent] = useState("");
  const [achievement, setAchievement] = useState("");
  const [rating, setRating] = useState(5);
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setRole("");
    setInstitution("");
    setContent("");
    setAchievement("");
    setRating(5);
    setSortOrder(testimonials.length + 1);
    setIsActive(true);
    setError("");
    setShowModal(true);
  };

  const openEdit = (item: TestimonialItem) => {
    setEditing(item);
    setName(item.name);
    setRole(item.role);
    setInstitution(item.institution || "");
    setContent(item.content);
    setAchievement(item.achievement || "");
    setRating(item.rating);
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
    formData.set("name", name);
    formData.set("role", role);
    formData.set("institution", institution);
    formData.set("content", content);
    formData.set("achievement", achievement);
    formData.set("rating", String(rating));
    formData.set("sortOrder", String(sortOrder));
    formData.set("isActive", String(isActive));

    const result = editing
      ? await updateTestimonial(editing.id, formData)
      : await createTestimonial(formData);

    if (result.success) {
      setShowModal(false);
      const updated = await getTestimonials();
      setTestimonials(updated);
      router.refresh();
    } else {
      setError(result.message || "Gagal menyimpan testimoni");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus testimoni alumni ini?")) return;
    const result = await deleteTestimonial(id);
    if (result.success) {
      const updated = await getTestimonials();
      setTestimonials(updated);
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
            <MessageSquare size={28} /> Testimoni & Kisah Sukses Alumni
          </h1>
          <p className="text-body-md mt-1" style={{ color: "var(--color-on-surface-variant)" }}>
            Kelola ulasan, rating bintang, dan bukti pencapaian publikasi alumni bimbingan riset
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-label-lg font-semibold text-white shadow-sm hover:shadow-md transition-all"
          style={{ background: "var(--color-primary)" }}
        >
          <Plus size={18} /> Tambah Testimoni
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {testimonials.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-2xl p-6 border shadow-xs transition-all relative flex flex-col justify-between ${
              item.isActive ? "border-gray-200" : "border-gray-200 opacity-60 bg-gray-50/50"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <div className="flex items-center gap-1">
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

              {item.achievement && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 mb-3">
                  <Trophy size={12} className="text-amber-600" />
                  {item.achievement}
                </div>
              )}

              <p className="text-sm text-gray-700 italic leading-relaxed mb-6">
                &ldquo;{item.content}&rdquo;
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-sm">
                {item.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">{item.name}</h4>
                <p className="text-xs text-gray-500">{item.role}</p>
                {item.institution && (
                  <p className="text-2xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Building2 size={10} /> {item.institution}
                  </p>
                )}
              </div>
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
                {editing ? "Edit Testimoni Alumni" : "Tambah Testimoni Alumni"}
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase text-gray-600 block mb-1">Nama Lengkap & Gelar</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ahmad Fauzi, S.Si., M.Sc."
                    required
                    className="w-full px-4 py-2.5 rounded-lg border text-sm focus-ring"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-gray-600 block mb-1">Status / Program</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Alumni Bootcamp Scopus"
                    required
                    className="w-full px-4 py-2.5 rounded-lg border text-sm focus-ring"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase text-gray-600 block mb-1">Asal Kampus / Institusi</label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="Universitas Lambung Mangkurat"
                    className="w-full px-4 py-2.5 rounded-lg border text-sm focus-ring"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-gray-600 block mb-1">Capaian / Highlight</label>
                  <input
                    type="text"
                    value={achievement}
                    onChange={(e) => setAchievement(e.target.value)}
                    placeholder="Contoh: Terbit Jurnal Scopus Q2"
                    className="w-full px-4 py-2.5 rounded-lg border text-sm focus-ring"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-gray-600 block mb-1">Isi Testimoni</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  placeholder="Tuliskan ulasan dan pengalaman peserta selama bimbingan di Sahabat Belajar..."
                  required
                  className="w-full px-4 py-2.5 rounded-lg border text-sm resize-none focus-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase text-gray-600 block mb-1">Rating Bintang (1-5)</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-lg border text-sm focus-ring"
                  >
                    <option value={5}>5 Bintang (Sangat Memuaskan / Sempurna)</option>
                    <option value={4}>4 Bintang (Sangat Baik)</option>
                    <option value={3}>3 Bintang (Cukup Baik)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-gray-600 block mb-1">Urutan Tampil</label>
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
                  id="testiActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-900"
                />
                <label htmlFor="testiActive" className="text-sm font-medium text-gray-700 cursor-pointer">
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
                  {loading ? "Menyimpan..." : "Simpan Testimoni"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
