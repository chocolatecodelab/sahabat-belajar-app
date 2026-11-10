"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FolderOpen, Plus, Edit, Trash2, X, AlertCircle } from "lucide-react";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/actions/kategori";
import { useToast } from "@/components/ui/Toast";

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  _count: { articles: number };
};

export default function KategoriClient({ categories: initial }: { categories: CategoryItem[] }) {
  const router = useRouter();
  const toast = useToast();
  const [categories, setCategories] = useState(initial);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CategoryItem | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCategories(initial);
  }, [initial]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowModal(false);
    };
    if (showModal) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showModal]);

  // Form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#3B82F6");

  const openCreate = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setColor("#3B82F6");
    setError("");
    setShowModal(true);
  };

  const openEdit = (cat: CategoryItem) => {
    setEditing(cat);
    setName(cat.name);
    setDescription(cat.description || "");
    setColor(cat.color || "#3B82F6");
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.set("name", name);
    formData.set("description", description);
    formData.set("color", color);

    const result = editing
      ? await updateCategory(editing.id, formData)
      : await createCategory(formData);

    if (result.success) {
      setShowModal(false);
      const updated = await getCategories();
      setCategories(updated);
      router.refresh();
    } else {
      setError(result.message || "Gagal");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const result = await deleteCategory(id);
    if (result.success) {
      toast.success("Kategori Dihapus", "Kategori berhasil dihapus dari sistem.");
      setCategories((prev) => prev.filter((c) => c.id !== id));
      const updated = await getCategories();
      setCategories(updated);
      router.refresh();
    } else {
      toast.error("Gagal Menghapus", result.message || "Kategori tidak dapat dihapus.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold font-display text-[#0A2650] flex items-center gap-3">
            <FolderOpen size={24} className="text-[#09408C]" /> Kategori Artikel
          </h1>
          <p className="text-xs text-[#5B6882] mt-1">Kelola kategori artikel dan wawasan pendidikan Sahabat Belajar</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#09408C] hover:bg-[#0E3571] text-white transition-colors">
          <Plus size={16} /> Tambah Kategori
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#D5DDEB] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4F7FB] border-b border-[#D5DDEB] text-[#5B6882] font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Warna</th>
                <th className="px-4 py-3">Nama Kategori</th>
                <th className="px-4 py-3">Slug URL</th>
                <th className="px-4 py-3">Total Artikel</th>
                <th className="text-right px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D5DDEB]">
              {categories.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-[#5B6882] text-xs">Belum ada kategori yang ditambahkan</td></tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-[#EAF1FA]/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="w-6 h-6 rounded-full shadow-2xs border border-white" style={{ background: cat.color || "#09408C" }} />
                    </td>
                    <td className="px-4 py-3.5 font-bold text-[#1B2A41]">{cat.name}</td>
                    <td className="px-4 py-3.5 text-[#5B6882] font-mono text-[11px]">/{cat.slug}</td>
                    <td className="px-4 py-3.5 text-[#5B6882] tabular-nums">{cat._count.articles} artikel</td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => openEdit(cat)} aria-label={`Edit kategori ${cat.name}`} title="Edit Kategori" className="p-1.5 rounded-xl border border-[#D5DDEB] hover:bg-[#EAF1FA] text-[#09408C] transition-colors"><Edit size={14} /></button>
                        <button onClick={() => handleDelete(cat.id)} aria-label={`Hapus kategori ${cat.name}`} title="Hapus Kategori" className="p-1.5 rounded-xl border border-[#D5DDEB] hover:bg-[#FBE9E5] hover:border-[#B4381F]/30 text-[#B4381F] transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div role="dialog" aria-modal="true" aria-labelledby="modal-kategori-title" className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0A2650]/50 backdrop-blur-xs p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white border border-[#D5DDEB] rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 id="modal-kategori-title" className="text-base font-bold font-display text-[#0A2650]">{editing ? "Edit Kategori" : "Tambah Kategori"}</h2>
              <button onClick={() => setShowModal(false)} aria-label="Tutup dialog" className="p-1.5 rounded-xl text-[#5B6882] hover:bg-[#F4F7FB]"><X size={18} /></button>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-xs bg-[#FBE9E5] text-[#B4381F] font-semibold">
                <AlertCircle size={16} />{error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="cat-name-input" className="text-xs font-semibold text-[#1B2A41] block mb-1.5">Nama Kategori</label>
                <input id="cat-name-input" type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Nama kategori" className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5DDEB] text-xs text-[#1B2A41] focus:outline-none focus:border-[#09408C]" />
              </div>
              <div>
                <label htmlFor="cat-desc-input" className="text-xs font-semibold text-[#1B2A41] block mb-1.5">Deskripsi</label>
                <textarea id="cat-desc-input" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Deskripsi singkat" className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5DDEB] text-xs text-[#1B2A41] focus:outline-none focus:border-[#09408C] resize-none" />
              </div>
              <div>
                <label htmlFor="cat-color-input" className="text-xs font-semibold text-[#1B2A41] block mb-1.5">Warna Penanda</label>
                <div className="flex items-center gap-3">
                  <input id="cat-color-picker" aria-label="Pemilih warna kategori" type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-10 h-10 rounded-xl border border-[#D5DDEB] cursor-pointer" />
                  <input id="cat-color-input" type="text" value={color} onChange={(e) => setColor(e.target.value)} className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#D5DDEB] text-xs text-[#1B2A41] font-mono focus:outline-none focus:border-[#09408C]" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-[#D5DDEB] text-xs font-semibold text-[#5B6882] hover:bg-[#F4F7FB]">Batal</button>
                <button type="submit" disabled={loading} className="px-5 py-2 rounded-xl text-xs font-bold bg-[#09408C] hover:bg-[#0E3571] text-white transition-colors disabled:opacity-60">
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
