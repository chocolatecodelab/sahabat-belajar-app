"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Share2, Plus, Edit, Trash2, X, ExternalLink, Code } from "lucide-react";
import { InstagramIcon, FacebookIcon, TwitterIcon, YoutubeIcon } from "@/components/ui/SocialIcons";
import { getSocialMedia, createSocialMedia, updateSocialMedia, deleteSocialMedia } from "@/actions/tampilan";
import { useToast } from "@/components/ui/Toast";

type SocialItem = {
  id: string;
  platform: string;
  username: string;
  url: string;
  embedCode: string | null;
  sortOrder: number;
  isActive: boolean;
};

const PLATFORMS = [
  { id: "instagram", name: "Instagram", icon: <InstagramIcon size={18} className="text-pink-600" /> },
  { id: "facebook", name: "Facebook", icon: <FacebookIcon size={18} className="text-blue-600" /> },
  { id: "twitter", name: "Twitter / X", icon: <TwitterIcon size={18} className="text-sky-500" /> },
  { id: "youtube", name: "YouTube", icon: <YoutubeIcon size={18} className="text-red-600" /> },
];

export default function SosialMediaClient({ items: initial }: { items: SocialItem[] }) {
  const router = useRouter();
  const toast = useToast();
  const [items, setItems] = useState<SocialItem[]>(initial);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<SocialItem | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setItems(initial);
  }, [initial]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowModal(false);
    };
    if (showModal) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showModal]);

  // Form State
  const [platform, setPlatform] = useState("instagram");
  const [username, setUsername] = useState("");
  const [url, setUrl] = useState("");
  const [embedCode, setEmbedCode] = useState("");
  const [isActive, setIsActive] = useState(true);

  const openCreate = () => {
    setEditing(null);
    setPlatform("instagram");
    setUsername("");
    setUrl("");
    setEmbedCode("");
    setIsActive(true);
    setError("");
    setShowModal(true);
  };

  const openEdit = (item: SocialItem) => {
    setEditing(item);
    setPlatform(item.platform);
    setUsername(item.username);
    setUrl(item.url);
    setEmbedCode(item.embedCode || "");
    setIsActive(item.isActive);
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.set("platform", platform);
    formData.set("username", username);
    formData.set("url", url);
    formData.set("embedCode", embedCode);
    formData.set("isActive", String(isActive));

    const result = editing
      ? await updateSocialMedia(editing.id, formData)
      : await createSocialMedia(formData);

    if (result.success) {
      setShowModal(false);
      const updated = await getSocialMedia();
      setItems(updated);
      router.refresh();
    } else {
      setError(result.message || "Gagal");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const result = await deleteSocialMedia(id);
    if (result.success) {
      toast.success("Akun Dihapus", "Akun sosial media berhasil dihapus.");
      setItems((prev) => prev.filter((i) => i.id !== id));
      const updated = await getSocialMedia();
      setItems(updated);
      router.refresh();
    } else {
      toast.error("Gagal Menghapus", result.message || "Gagal menghapus sosial media");
    }
  };

  const getPlatformIcon = (plt: string) => {
    const found = PLATFORMS.find((p) => p.id === plt);
    return found ? found.icon : <Share2 size={18} />;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-headline-lg flex items-center gap-3" style={{ color: "var(--color-on-surface)" }}>
            <Share2 size={28} /> Sosial Media & Instagram Feed
          </h1>
          <p className="text-body-md mt-1" style={{ color: "var(--color-on-surface-variant)" }}>
            Kelola akun sosial media dan widget embed Instagram di landing page
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-label-lg transition-colors"
          style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
        >
          <Plus size={18} /> Tambah Akun
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#D5DDEB] overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F4F7FB] border-b border-[#D5DDEB] text-[#5B6882] font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="px-4 py-3">Platform</th>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Link Profil</th>
              <th className="px-4 py-3">Embed Feed</th>
              <th className="px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D5DDEB]">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-[#5B6882] text-xs">
                  Belum ada akun sosial media yang ditambahkan.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-[#EAF1FA]/50 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(item.platform)}
                      <span className="capitalize font-bold text-[#1B2A41]">{item.platform}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-[#09408C]">
                    @{item.username}
                  </td>
                  <td className="px-4 py-3.5 text-[#5B6882]">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline text-[#09408C]">
                      <span className="truncate max-w-xs">{item.url}</span> <ExternalLink size={12} />
                    </a>
                  </td>
                  <td className="px-4 py-3.5">
                    {item.embedCode ? (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#EAF1FA] text-[#09408C] inline-flex items-center gap-1">
                        <Code size={11} /> Widget Aktif
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#5B6882]">Tautan Saja</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${item.isActive ? "bg-[#E3F4EC] text-[#1F6F4A]" : "bg-slate-100 text-[#5B6882]"}`}>
                      {item.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => openEdit(item)} aria-label={`Edit akun ${item.platform} ${item.username}`} title="Edit Akun" className="p-1.5 rounded-xl border border-[#D5DDEB] hover:bg-[#EAF1FA] text-[#09408C] transition-colors">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} aria-label={`Hapus akun ${item.platform} ${item.username}`} title="Hapus Akun" className="p-1.5 rounded-xl border border-[#D5DDEB] hover:bg-[#FBE9E5] hover:border-[#B4381F]/30 text-[#B4381F] transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal CRUD Sosial Media */}
      {showModal && (
        <div role="dialog" aria-modal="true" aria-labelledby="modal-sosmed-title" className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0A2650]/50 backdrop-blur-xs p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white border border-[#D5DDEB] rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 id="modal-sosmed-title" className="text-base font-bold font-display text-[#0A2650]">
                {editing ? "Edit Sosial Media" : "Tambah Akun Sosial Media"}
              </h2>
              <button onClick={() => setShowModal(false)} aria-label="Tutup dialog" className="p-1.5 rounded-xl text-[#5B6882] hover:bg-[#F4F7FB]"><X size={18} /></button>
            </div>

            {error && <div className="p-3 rounded-xl mb-4 text-xs bg-[#FBE9E5] text-[#B4381F] font-semibold">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="sosmed-platform" className="text-xs font-semibold text-[#1B2A41] block mb-1.5">Platform</label>
                <select
                  id="sosmed-platform"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5DDEB] text-xs text-[#1B2A41] bg-white focus:outline-none focus:border-[#09408C]"
                >
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="twitter">Twitter / X</option>
                  <option value="youtube">YouTube</option>
                </select>
              </div>

              <div>
                <label htmlFor="sosmed-username" className="text-xs font-semibold text-[#1B2A41] block mb-1.5">Username / Handle</label>
                <input
                  id="sosmed-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: sahabatbelajar.id"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5DDEB] text-xs text-[#1B2A41] focus:outline-none focus:border-[#09408C]"
                />
              </div>

              <div>
                <label htmlFor="sosmed-url" className="text-xs font-semibold text-[#1B2A41] block mb-1.5">URL Profil Lengkap</label>
                <input
                  id="sosmed-url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://instagram.com/sahabatbelajar.id"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5DDEB] text-xs text-[#1B2A41] focus:outline-none focus:border-[#09408C]"
                />
              </div>

              <div>
                <label className="text-label-lg block mb-1.5" style={{ color: "var(--color-on-surface-variant)" }}>Embed Script / Iframe Widget (Opsional)</label>
                <textarea
                  value={embedCode}
                  onChange={(e) => setEmbedCode(e.target.value)}
                  placeholder="Kode embed Instagram post atau feed widget (jika ingin menampilkan postingan langsung)"
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border text-body-sm focus-ring resize-none font-mono text-xs"
                  style={{ borderColor: "var(--color-outline-variant)" }}
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="socActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="socActive" className="text-body-sm" style={{ color: "var(--color-on-surface)" }}>
                  Tampilkan di Website
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
