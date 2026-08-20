"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Share2, Plus, Edit, Trash2, X, ExternalLink, Code } from "lucide-react";
import { InstagramIcon, FacebookIcon, TwitterIcon, YoutubeIcon } from "@/components/ui/SocialIcons";
import { getSocialMedia, createSocialMedia, updateSocialMedia, deleteSocialMedia } from "@/actions/tampilan";

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
  const [items, setItems] = useState<SocialItem[]>(initial);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<SocialItem | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setItems(initial);
  }, [initial]);

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
    if (!confirm("Hapus akun sosial media ini?")) return;
    const result = await deleteSocialMedia(id);
    if (result.success) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      const updated = await getSocialMedia();
      setItems(updated);
      router.refresh();
    } else {
      alert(result.message || "Gagal menghapus sosial media");
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

      <div className="elevation-1 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ background: "var(--color-surface-container)" }}>
              <th className="text-left px-5 py-3.5 text-label-lg" style={{ color: "var(--color-on-surface-variant)" }}>Platform</th>
              <th className="text-left px-5 py-3.5 text-label-lg" style={{ color: "var(--color-on-surface-variant)" }}>Username</th>
              <th className="text-left px-5 py-3.5 text-label-lg" style={{ color: "var(--color-on-surface-variant)" }}>Link Profil</th>
              <th className="text-left px-5 py-3.5 text-label-lg" style={{ color: "var(--color-on-surface-variant)" }}>Embed Feed</th>
              <th className="text-left px-5 py-3.5 text-label-lg" style={{ color: "var(--color-on-surface-variant)" }}>Status</th>
              <th className="text-right px-5 py-3.5 text-label-lg" style={{ color: "var(--color-on-surface-variant)" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-body-md text-gray-500">
                  Belum ada akun sosial media yang ditambahkan.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-t hover:bg-black/[0.02] transition-colors" style={{ borderColor: "var(--color-outline-variant)" }}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(item.platform)}
                      <span className="capitalize font-medium text-body-sm">{item.platform}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-body-md font-semibold" style={{ color: "var(--color-on-surface)" }}>
                    @{item.username}
                  </td>
                  <td className="px-5 py-3 text-body-sm text-gray-500">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline text-blue-600">
                      {item.url} <ExternalLink size={12} />
                    </a>
                  </td>
                  <td className="px-5 py-3">
                    {item.embedCode ? (
                      <span className="text-label-md px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 flex items-center gap-1 w-fit">
                        <Code size={12} /> Ada Widget Embed
                      </span>
                    ) : (
                      <span className="text-label-md text-gray-400">Link Saja</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-label-md px-2.5 py-1 rounded-full ${item.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {item.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(item)} className="p-2 rounded-lg hover:bg-black/5" style={{ color: "var(--color-primary-container)" }}>
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg hover:bg-red-50" style={{ color: "var(--color-error)" }}>
                        <Trash2 size={16} />
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" onClick={() => setShowModal(false)}>
          <div className="elevation-2 rounded-2xl p-6 w-full max-w-lg mx-4" style={{ background: "var(--color-surface-container-lowest)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-headline-md" style={{ color: "var(--color-on-surface)" }}>
                {editing ? "Edit Sosial Media" : "Tambah Akun Sosial Media"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-black/5"><X size={20} /></button>
            </div>

            {error && <div className="p-3 rounded-lg mb-4 text-body-sm bg-red-50 text-red-700">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-label-lg block mb-1.5" style={{ color: "var(--color-on-surface-variant)" }}>Platform</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border text-body-sm focus-ring"
                  style={{ borderColor: "var(--color-outline-variant)" }}
                >
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="twitter">Twitter / X</option>
                  <option value="youtube">YouTube</option>
                </select>
              </div>

              <div>
                <label className="text-label-lg block mb-1.5" style={{ color: "var(--color-on-surface-variant)" }}>Username / Handle</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: labterpadu_ulm"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border text-body-sm focus-ring"
                  style={{ borderColor: "var(--color-outline-variant)" }}
                />
              </div>

              <div>
                <label className="text-label-lg block mb-1.5" style={{ color: "var(--color-on-surface-variant)" }}>URL Profil Lengkap</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://instagram.com/labterpadu_ulm"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border text-body-sm focus-ring"
                  style={{ borderColor: "var(--color-outline-variant)" }}
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
