"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Image as ImageIcon, Plus, Edit, Trash2, X, Eye, EyeOff } from "lucide-react";
import CoverImageUpload from "@/components/admin/CoverImageUpload";
import { getHeroSlides, createHeroSlide, updateHeroSlide, deleteHeroSlide } from "@/actions/tampilan";

type Slide = {
  id: string;
  title: string;
  subtitle: string | null;
  backgroundImage: string;
  ctaText: string | null;
  ctaLink: string | null;
  sortOrder: number;
  isActive: boolean;
};

export default function HeroClient({ slides: initial }: { slides: Slide[] }) {
  const router = useRouter();
  const [slides, setSlides] = useState<Slide[]>(initial);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Slide | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSlides(initial);
  }, [initial]);

  // Form
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [ctaText, setCtaText] = useState("");
  const [ctaLink, setCtaLink] = useState("");
  const [isActive, setIsActive] = useState(true);

  const openCreate = () => {
    setEditing(null);
    setTitle("");
    setSubtitle("");
    setBackgroundImage(null);
    setCtaText("");
    setCtaLink("");
    setIsActive(true);
    setError("");
    setShowModal(true);
  };

  const openEdit = (slide: Slide) => {
    setEditing(slide);
    setTitle(slide.title);
    setSubtitle(slide.subtitle || "");
    setBackgroundImage(slide.backgroundImage);
    setCtaText(slide.ctaText || "");
    setCtaLink(slide.ctaLink || "");
    setIsActive(slide.isActive);
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!backgroundImage) {
      setError("Gambar background wajib diupload");
      return;
    }
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.set("title", title);
    formData.set("subtitle", subtitle);
    formData.set("backgroundImage", backgroundImage);
    formData.set("ctaText", ctaText);
    formData.set("ctaLink", ctaLink);
    formData.set("isActive", String(isActive));

    const result = editing
      ? await updateHeroSlide(editing.id, formData)
      : await createHeroSlide(formData);

    if (result.success) {
      setShowModal(false);
      const updated = await getHeroSlides();
      setSlides(updated);
      router.refresh();
    } else {
      setError(result.message || "Gagal");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus slide banner ini?")) return;
    const result = await deleteHeroSlide(id);
    if (result.success) {
      setSlides((prev) => prev.filter((s) => s.id !== id));
      const updated = await getHeroSlides();
      setSlides(updated);
      router.refresh();
    } else {
      alert(result.message || "Gagal menghapus slide");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-headline-lg flex items-center gap-3" style={{ color: "var(--color-on-surface)" }}>
            <ImageIcon size={28} /> Hero Banner Slider
          </h1>
          <p className="text-body-md mt-1" style={{ color: "var(--color-on-surface-variant)" }}>
            Kelola slide gambar dan teks banner utama landing page
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-label-lg transition-colors"
          style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
        >
          <Plus size={18} /> Tambah Slide
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {slides.length === 0 ? (
          <div className="col-span-2 text-center py-12 elevation-1 rounded-2xl text-body-md text-gray-500">
            Belum ada slide hero. Klik &quot;Tambah Slide&quot; untuk menambahkan banner.
          </div>
        ) : (
          slides.map((slide) => (
            <div key={slide.id} className="elevation-1 rounded-2xl overflow-hidden border" style={{ borderColor: "var(--color-outline-variant)" }}>
              <div className="relative h-48 bg-gray-900">
                <img src={slide.backgroundImage} alt="" className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-5 flex flex-col justify-end">
                  <h3 className="text-white font-bold text-lg leading-tight drop-shadow">{slide.title}</h3>
                  {slide.subtitle && <p className="text-white/80 text-sm mt-1 line-clamp-1">{slide.subtitle}</p>}
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full text-xs text-white">
                  {slide.isActive ? <Eye size={12} className="text-green-400" /> : <EyeOff size={12} className="text-gray-400" />}
                  {slide.isActive ? "Aktif" : "Nonaktif"}
                </div>
              </div>

              <div className="p-4 flex items-center justify-between bg-white">
                <div className="text-body-sm text-gray-500">
                  {slide.ctaText ? (
                    <span>Tombol: <strong className="text-gray-800">{slide.ctaText}</strong> ({slide.ctaLink})</span>
                  ) : (
                    <span>Tanpa tombol CTA</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(slide)} className="p-2 rounded-lg hover:bg-black/5" style={{ color: "var(--color-primary-container)" }}>
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(slide.id)} className="p-2 rounded-lg hover:bg-red-50" style={{ color: "var(--color-error)" }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal CRUD Hero */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" onClick={() => setShowModal(false)}>
          <div className="elevation-2 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ background: "var(--color-surface-container-lowest)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-headline-md" style={{ color: "var(--color-on-surface)" }}>
                {editing ? "Edit Slide Hero" : "Tambah Slide Hero"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-black/5"><X size={20} /></button>
            </div>

            {error && <div className="p-3 rounded-lg mb-4 text-body-sm bg-red-50 text-red-700">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-label-lg block mb-1.5" style={{ color: "var(--color-on-surface-variant)" }}>Gambar Background (1920×600px)</label>
                <CoverImageUpload value={backgroundImage} onChange={setBackgroundImage} folder="hero" />
              </div>

              <div>
                <label className="text-label-lg block mb-1.5" style={{ color: "var(--color-on-surface-variant)" }}>Judul Utama</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Selamat Datang di Sahabat Belajar"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border text-body-sm focus-ring"
                  style={{ borderColor: "var(--color-outline-variant)" }}
                />
              </div>

              <div>
                <label className="text-label-lg block mb-1.5" style={{ color: "var(--color-on-surface-variant)" }}>Sub Judul / Deskripsi</label>
                <textarea
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Deskripsi singkat pendukung di banner"
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-lg border text-body-sm focus-ring resize-none"
                  style={{ borderColor: "var(--color-outline-variant)" }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-label-lg block mb-1.5" style={{ color: "var(--color-on-surface-variant)" }}>Teks Tombol CTA</label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="Contoh: Pelajari Lebih Lanjut"
                    className="w-full px-4 py-2.5 rounded-lg border text-body-sm focus-ring"
                    style={{ borderColor: "var(--color-outline-variant)" }}
                  />
                </div>
                <div>
                  <label className="text-label-lg block mb-1.5" style={{ color: "var(--color-on-surface-variant)" }}>Link Tombol CTA</label>
                  <input
                    type="text"
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                    placeholder="/layanan atau https://..."
                    className="w-full px-4 py-2.5 rounded-lg border text-body-sm focus-ring"
                    style={{ borderColor: "var(--color-outline-variant)" }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="activeCheck" className="text-body-sm" style={{ color: "var(--color-on-surface)" }}>
                  Slide Aktif (Ditampilkan di Landing Page)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-lg border text-body-sm font-medium" style={{ borderColor: "var(--color-outline-variant)" }}>
                  Batal
                </button>
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
