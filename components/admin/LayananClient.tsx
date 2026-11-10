"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, Plus, Edit, Trash2, X, Eye, EyeOff, Wrench, Microscope, BookOpen, Award, Building, GraduationCap } from "lucide-react";
import { getServices, createService, updateService, deleteService } from "@/actions/tampilan";

type ServiceItem = {
  id: string;
  title: string;
  description: string;
  icon: string;
  link: string | null;
  sortOrder: number;
  isActive: boolean;
};

const AVAILABLE_ICONS = [
  { name: "Microscope", label: "Laboratorium / Pengujian", icon: <Microscope size={20} /> },
  { name: "Wrench", label: "Peralatan / Kalibrasi", icon: <Wrench size={20} /> },
  { name: "Building", label: "Ruangan / Fasilitas", icon: <Building size={20} /> },
  { name: "BookOpen", label: "Pelatihan & Magang", icon: <BookOpen size={20} /> },
  { name: "Award", label: "Sertifikasi & Etik", icon: <Award size={20} /> },
  { name: "GraduationCap", label: "Akademik & Beasiswa", icon: <GraduationCap size={20} /> },
];

export default function LayananClient({ services: initial }: { services: ServiceItem[] }) {
  const router = useRouter();
  const [services, setServices] = useState<ServiceItem[]>(initial);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ServiceItem | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setServices(initial);
  }, [initial]);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("Microscope");
  const [link, setLink] = useState("");
  const [isActive, setIsActive] = useState(true);

  const openCreate = () => {
    setEditing(null);
    setTitle("");
    setDescription("");
    setIcon("Microscope");
    setLink("");
    setIsActive(true);
    setError("");
    setShowModal(true);
  };

  const openEdit = (srv: ServiceItem) => {
    setEditing(srv);
    setTitle(srv.title);
    setDescription(srv.description);
    setIcon(srv.icon);
    setLink(srv.link || "");
    setIsActive(srv.isActive);
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.set("title", title);
    formData.set("description", description);
    formData.set("icon", icon);
    formData.set("link", link);
    formData.set("isActive", String(isActive));

    const result = editing
      ? await updateService(editing.id, formData)
      : await createService(formData);

    if (result.success) {
      setShowModal(false);
      const updated = await getServices();
      setServices(updated);
      router.refresh();
    } else {
      setError(result.message || "Gagal");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus layanan ini?")) return;
    const result = await deleteService(id);
    if (result.success) {
      setServices((prev) => prev.filter((s) => s.id !== id));
      const updated = await getServices();
      setServices(updated);
      router.refresh();
    } else {
      alert(result.message || "Gagal menghapus layanan");
    }
  };

  const renderIcon = (iconName: string) => {
    const found = AVAILABLE_ICONS.find((i) => i.name === iconName);
    return found ? found.icon : <Microscope size={20} />;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-headline-lg flex items-center gap-3" style={{ color: "var(--color-on-surface)" }}>
            <Heart size={28} /> Layanan Kami
          </h1>
          <p className="text-body-md mt-1" style={{ color: "var(--color-on-surface-variant)" }}>
            Kelola daftar layanan unggulan yang ditampilkan di landing page (seperti pengujian sampel, sewa lab, dll)
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-label-lg transition-colors"
          style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
        >
          <Plus size={18} /> Tambah Layanan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.length === 0 ? (
          <div className="col-span-3 text-center py-12 elevation-1 rounded-2xl text-body-md text-gray-500">
            Belum ada layanan. Klik &quot;Tambah Layanan&quot; untuk menambahkan item.
          </div>
        ) : (
          services.map((srv) => (
            <div
              key={srv.id}
              className="elevation-1 rounded-2xl p-6 transition-all hover:elevation-2 hover:-translate-y-1 relative flex flex-col justify-between"
              style={{ borderTop: "4px solid var(--color-primary)" }}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
                      color: "var(--color-primary)",
                    }}
                  >
                    {renderIcon(srv.icon)}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${srv.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {srv.isActive ? <Eye size={10} /> : <EyeOff size={10} />}
                      {srv.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                </div>

                <h3 className="text-headline-md font-bold mb-2" style={{ color: "var(--color-on-surface)" }}>
                  {srv.title}
                </h3>
                <p className="text-body-sm text-gray-600 mb-4 line-clamp-3">
                  {srv.description}
                </p>
              </div>

              <div className="pt-4 border-t flex items-center justify-between" style={{ borderColor: "var(--color-outline-variant)" }}>
                <span className="text-xs text-gray-500 truncate max-w-[150px]">
                  {srv.link || "Tanpa link"}
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(srv)} className="p-2 rounded-lg hover:bg-black/5" style={{ color: "var(--color-primary-container)" }}>
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(srv.id)} className="p-2 rounded-lg hover:bg-red-50" style={{ color: "var(--color-error)" }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal CRUD Layanan */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" onClick={() => setShowModal(false)}>
          <div className="elevation-2 rounded-2xl p-6 w-full max-w-lg mx-4" style={{ background: "var(--color-surface-container-lowest)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-headline-md" style={{ color: "var(--color-on-surface)" }}>
                {editing ? "Edit Layanan" : "Tambah Layanan Baru"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-black/5"><X size={20} /></button>
            </div>

            {error && <div className="p-3 rounded-lg mb-4 text-body-sm bg-red-50 text-red-700">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-label-lg block mb-1.5" style={{ color: "var(--color-on-surface-variant)" }}>Pilih Icon</label>
                <div className="grid grid-cols-3 gap-2">
                  {AVAILABLE_ICONS.map((ic) => (
                    <button
                      key={ic.name}
                      type="button"
                      onClick={() => setIcon(ic.name)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-center transition-all ${
                        icon === ic.name
                          ? "border-[var(--color-primary)] bg-[var(--color-primary-fixed)] font-semibold"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div style={{ color: "var(--color-primary)" }}>{ic.icon}</div>
                      <span className="text-xs text-gray-700">{ic.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-label-lg block mb-1.5" style={{ color: "var(--color-on-surface-variant)" }}>Nama Layanan</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Pengujian Sampel Laboratorium"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border text-body-sm focus-ring"
                  style={{ borderColor: "var(--color-outline-variant)" }}
                />
              </div>

              <div>
                <label className="text-label-lg block mb-1.5" style={{ color: "var(--color-on-surface-variant)" }}>Deskripsi Ringkas</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan secara singkat manfaat dan cakupan layanan ini..."
                  rows={3}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border text-body-sm focus-ring resize-none"
                  style={{ borderColor: "var(--color-outline-variant)" }}
                />
              </div>

              <div>
                <label className="text-label-lg block mb-1.5" style={{ color: "var(--color-on-surface-variant)" }}>Link Detail (Opsional)</label>
                <input
                  type="text"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="/halaman/layanan-pengujian atau URL luar"
                  className="w-full px-4 py-2.5 rounded-lg border text-body-sm focus-ring"
                  style={{ borderColor: "var(--color-outline-variant)" }}
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="srvActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="srvActive" className="text-body-sm" style={{ color: "var(--color-on-surface)" }}>
                  Layanan Aktif (Ditampilkan di Landing Page)
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
