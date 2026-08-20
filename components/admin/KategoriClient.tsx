"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FolderOpen, Plus, Edit, Trash2, X, AlertCircle } from "lucide-react";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/actions/kategori";

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
  const [categories, setCategories] = useState(initial);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CategoryItem | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCategories(initial);
  }, [initial]);

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
    if (!confirm("Hapus kategori ini?")) return;
    const result = await deleteCategory(id);
    if (result.success) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      const updated = await getCategories();
      setCategories(updated);
      router.refresh();
    } else {
      alert(result.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-headline-lg flex items-center gap-3" style={{ color: "var(--color-on-surface)" }}>
            <FolderOpen size={28} /> Kategori
          </h1>
          <p className="text-body-md mt-1" style={{ color: "var(--color-on-surface-variant)" }}>Kelola kategori berita</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-label-lg transition-colors" style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
          <Plus size={18} /> Tambah Kategori
        </button>
      </div>

      <div className="elevation-1 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ background: "var(--color-surface-container)" }}>
              <th className="text-left px-5 py-3.5 text-label-lg" style={{ color: "var(--color-on-surface-variant)" }}>Warna</th>
              <th className="text-left px-5 py-3.5 text-label-lg" style={{ color: "var(--color-on-surface-variant)" }}>Nama</th>
              <th className="text-left px-5 py-3.5 text-label-lg" style={{ color: "var(--color-on-surface-variant)" }}>Slug</th>
              <th className="text-left px-5 py-3.5 text-label-lg" style={{ color: "var(--color-on-surface-variant)" }}>Berita</th>
              <th className="text-right px-5 py-3.5 text-label-lg" style={{ color: "var(--color-on-surface-variant)" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-body-md" style={{ color: "var(--color-outline)" }}>Belum ada kategori</td></tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="border-t hover:bg-black/[0.02] transition-colors" style={{ borderColor: "var(--color-outline-variant)" }}>
                  <td className="px-5 py-3">
                    <div className="w-6 h-6 rounded-full" style={{ background: cat.color || "#ccc" }} />
                  </td>
                  <td className="px-5 py-3 text-body-md font-medium" style={{ color: "var(--color-on-surface)" }}>{cat.name}</td>
                  <td className="px-5 py-3 text-body-sm" style={{ color: "var(--color-outline)" }}>/{cat.slug}</td>
                  <td className="px-5 py-3 text-body-sm" style={{ color: "var(--color-on-surface-variant)" }}>{cat._count.articles} artikel</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(cat)} className="p-2 rounded-lg transition-colors hover:bg-black/5" style={{ color: "var(--color-primary-container)" }}><Edit size={16} /></button>
                      <button onClick={() => handleDelete(cat.id)} className="p-2 rounded-lg transition-colors hover:bg-red-50" style={{ color: "var(--color-error)" }}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="elevation-2 rounded-2xl p-6 w-full max-w-md mx-4" style={{ background: "var(--color-surface-container-lowest)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-headline-md" style={{ color: "var(--color-on-surface)" }}>{editing ? "Edit Kategori" : "Tambah Kategori"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-black/5"><X size={20} /></button>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg mb-4 text-body-sm" style={{ background: "var(--color-error-container)", color: "var(--color-on-error-container)" }}>
                <AlertCircle size={16} />{error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-label-lg block mb-1.5" style={{ color: "var(--color-on-surface-variant)" }}>Nama</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Nama kategori" className="w-full px-4 py-2.5 rounded-lg border text-body-sm focus-ring" style={{ borderColor: "var(--color-outline-variant)" }} />
              </div>
              <div>
                <label className="text-label-lg block mb-1.5" style={{ color: "var(--color-on-surface-variant)" }}>Deskripsi</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Deskripsi singkat" className="w-full px-4 py-2.5 rounded-lg border text-body-sm focus-ring resize-none" style={{ borderColor: "var(--color-outline-variant)" }} />
              </div>
              <div>
                <label className="text-label-lg block mb-1.5" style={{ color: "var(--color-on-surface-variant)" }}>Warna</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-10 h-10 rounded-lg border cursor-pointer" style={{ borderColor: "var(--color-outline-variant)" }} />
                  <input type="text" value={color} onChange={(e) => setColor(e.target.value)} className="flex-1 px-4 py-2.5 rounded-lg border text-body-sm focus-ring" style={{ borderColor: "var(--color-outline-variant)" }} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-lg border text-body-sm font-medium" style={{ borderColor: "var(--color-outline-variant)", color: "var(--color-on-surface-variant)" }}>Batal</button>
                <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-lg text-label-lg transition-colors disabled:opacity-60" style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
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
