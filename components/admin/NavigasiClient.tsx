"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navigation as NavIcon, Plus, Edit, Trash2, X, ExternalLink, FileText, FolderOpen, ArrowUp, ArrowDown } from "lucide-react";
import { getNavigations, createNavigation, updateNavigation, deleteNavigation, reorderNavigations } from "@/actions/navigasi";

type NavItem = {
  id: string;
  label: string;
  type: string;
  url: string | null;
  pageId: string | null;
  categoryId: string | null;
  parentId: string | null;
  sortOrder: number;
  location: string;
  isActive: boolean;
  openInNewTab: boolean;
  page?: { title: string; slug: string } | null;
  category?: { name: string; slug: string } | null;
  children: NavItem[];
};

interface NavigasiClientProps {
  initialNavigations: NavItem[];
  pages: { id: string; title: string; slug: string }[];
  categories: { id: string; name: string; slug: string }[];
}

export default function NavigasiClient({
  initialNavigations,
  pages,
  categories,
}: NavigasiClientProps) {
  const router = useRouter();
  const [navigations, setNavigations] = useState<NavItem[]>(initialNavigations);
  const [activeTab, setActiveTab] = useState<"HEADER" | "FOOTER">("HEADER");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<NavItem | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setNavigations(initialNavigations);
  }, [initialNavigations]);

  // Form State
  const [label, setLabel] = useState("");
  const [type, setType] = useState<"PAGE" | "CATEGORY" | "EXTERNAL" | "LINK">("PAGE");
  const [url, setUrl] = useState("");
  const [pageId, setPageId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [openInNewTab, setOpenInNewTab] = useState(false);

  const filteredNavs = navigations.filter((n) => n.location === activeTab);

  const openCreate = (defaultParentId?: string) => {
    setEditing(null);
    setLabel("");
    setType("PAGE");
    setUrl("");
    setPageId(pages[0]?.id || "");
    setCategoryId(categories[0]?.id || "");
    setParentId(defaultParentId || "");
    setOpenInNewTab(false);
    setError("");
    setShowModal(true);
  };

  const openEdit = (nav: NavItem) => {
    setEditing(nav);
    setLabel(nav.label);
    setType(nav.type as any);
    setUrl(nav.url || "");
    setPageId(nav.pageId || "");
    setCategoryId(nav.categoryId || "");
    setParentId(nav.parentId || "");
    setOpenInNewTab(nav.openInNewTab);
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.set("label", label);
    formData.set("type", type);
    formData.set("location", activeTab);
    formData.set("openInNewTab", String(openInNewTab));
    if (parentId) formData.set("parentId", parentId);
    if (type === "PAGE") formData.set("pageId", pageId);
    if (type === "CATEGORY") formData.set("categoryId", categoryId);
    if (type === "EXTERNAL" || type === "LINK") formData.set("url", url);

    const result = editing
      ? await updateNavigation(editing.id, formData)
      : await createNavigation(formData);

    if (result.success) {
      setShowModal(false);
      const updated = await getNavigations();
      setNavigations(updated);
      router.refresh();
    } else {
      setError(result.message || "Gagal menyimpan navigasi");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus menu navigasi ini? Menu anak (jika ada) juga akan terhapus.")) return;
    const result = await deleteNavigation(id);
    if (result.success) {
      const updated = await getNavigations();
      setNavigations(updated);
      router.refresh();
    } else {
      alert(result.message);
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const list = [...filteredNavs];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    const updates = list.map((item, idx) => ({ id: item.id, sortOrder: idx }));
    await reorderNavigations(updates);
    const updated = await getNavigations();
    setNavigations(updated);
    router.refresh();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-headline-lg flex items-center gap-3" style={{ color: "var(--color-on-surface)" }}>
            <NavIcon size={28} /> Navigasi Menu
          </h1>
          <p className="text-body-md mt-1" style={{ color: "var(--color-on-surface-variant)" }}>
            Kelola menu navigasi header dan footer
          </p>
        </div>
        <button
          onClick={() => openCreate()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-label-lg transition-colors"
          style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
        >
          <Plus size={18} /> Tambah Menu
        </button>
      </div>

      {/* Tabs Header/Footer */}
      <div className="flex gap-2 mb-6 border-b" style={{ borderColor: "var(--color-outline-variant)" }}>
        {(["HEADER", "FOOTER"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-body-md font-medium border-b-2 transition-colors -mb-[2px] ${
              activeTab === tab ? "border-[var(--color-primary)] font-semibold" : "border-transparent text-gray-500 hover:text-black"
            }`}
            style={activeTab === tab ? { color: "var(--color-primary)", borderColor: "var(--color-primary)" } : {}}
          >
            {tab === "HEADER" ? "Menu Header (Navbar Atas)" : "Menu Footer (Bawah)"}
          </button>
        ))}
      </div>

      {/* Navigation Tree List */}
      <div className="elevation-1 rounded-2xl p-6">
        {filteredNavs.length === 0 ? (
          <div className="text-center py-12 text-body-md" style={{ color: "var(--color-outline)" }}>
            Belum ada menu navigasi untuk {activeTab.toLowerCase()}. Klik &quot;Tambah Menu&quot; untuk memulai.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNavs.map((nav, index) => (
              <div key={nav.id} className="border rounded-xl p-4 transition-colors hover:bg-black/[0.01]" style={{ borderColor: "var(--color-outline-variant)" }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-body-md" style={{ color: "var(--color-on-surface)" }}>
                      {nav.label}
                    </span>
                    <span className="text-label-md px-2.5 py-0.5 rounded-full flex items-center gap-1" style={{ background: "var(--color-surface-container)", color: "var(--color-on-surface-variant)" }}>
                      {nav.type === "PAGE" && <FileText size={12} />}
                      {nav.type === "CATEGORY" && <FolderOpen size={12} />}
                      {nav.type === "EXTERNAL" && <ExternalLink size={12} />}
                      {nav.type}
                    </span>
                    <span className="text-body-sm text-gray-500">
                      {nav.type === "PAGE" && nav.page ? `/${nav.page.slug}` : nav.type === "CATEGORY" && nav.category ? `/kategori/${nav.category.slug}` : nav.url}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button onClick={() => handleMove(index, "up")} disabled={index === 0} className="p-1.5 rounded hover:bg-black/5 disabled:opacity-30">
                      <ArrowUp size={16} />
                    </button>
                    <button onClick={() => handleMove(index, "down")} disabled={index === filteredNavs.length - 1} className="p-1.5 rounded hover:bg-black/5 disabled:opacity-30">
                      <ArrowDown size={16} />
                    </button>
                    {activeTab === "HEADER" && (
                      <button onClick={() => openCreate(nav.id)} title="Tambah Submenu" className="px-2.5 py-1 text-label-md rounded border hover:bg-black/5 ml-2" style={{ borderColor: "var(--color-outline-variant)" }}>
                        + Submenu
                      </button>
                    )}
                    <button onClick={() => openEdit(nav)} className="p-2 rounded-lg hover:bg-black/5 ml-1" style={{ color: "var(--color-primary-container)" }}>
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(nav.id)} className="p-2 rounded-lg hover:bg-red-50" style={{ color: "var(--color-error)" }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Submenu / Children */}
                {nav.children && nav.children.length > 0 && (
                  <div className="mt-3 ml-6 pl-4 border-l-2 space-y-2" style={{ borderColor: "var(--color-outline-variant)" }}>
                    {nav.children.map((child) => (
                      <div key={child.id} className="flex items-center justify-between p-2 rounded-lg bg-black/[0.02]">
                        <div className="flex items-center gap-2">
                          <span className="text-body-sm font-medium">{child.label}</span>
                          <span className="text-label-md text-gray-500">({child.type})</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(child)} className="p-1 rounded hover:bg-black/5" style={{ color: "var(--color-primary-container)" }}>
                            <Edit size={14} />
                          </button>
                          <button onClick={() => handleDelete(child.id)} className="p-1 rounded hover:bg-red-50" style={{ color: "var(--color-error)" }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal CRUD Navigasi */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="elevation-2 rounded-2xl p-6 w-full max-w-lg mx-4" style={{ background: "var(--color-surface-container-lowest)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-headline-md" style={{ color: "var(--color-on-surface)" }}>
                {editing ? "Edit Menu Navigasi" : "Tambah Menu Navigasi"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-black/5"><X size={20} /></button>
            </div>

            {error && (
              <div className="p-3 rounded-lg mb-4 text-body-sm bg-red-50 text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-label-lg block mb-1.5" style={{ color: "var(--color-on-surface-variant)" }}>Label Menu</label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Contoh: Tentang Kami / Layanan / Pengumuman"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border text-body-sm focus-ring"
                  style={{ borderColor: "var(--color-outline-variant)" }}
                />
              </div>

              <div>
                <label className="text-label-lg block mb-1.5" style={{ color: "var(--color-on-surface-variant)" }}>Tipe Menu</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-lg border text-body-sm focus-ring"
                  style={{ borderColor: "var(--color-outline-variant)" }}
                >
                  <option value="PAGE">Halaman Dinamis</option>
                  <option value="CATEGORY">Kategori Berita</option>
                  <option value="EXTERNAL">Link Luar / URL Custom</option>
                  <option value="LINK">Link Internal</option>
                </select>
              </div>

              {type === "PAGE" && (
                <div>
                  <label className="text-label-lg block mb-1.5" style={{ color: "var(--color-on-surface-variant)" }}>Pilih Halaman</label>
                  <select
                    value={pageId}
                    onChange={(e) => setPageId(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border text-body-sm focus-ring"
                    style={{ borderColor: "var(--color-outline-variant)" }}
                  >
                    <option value="">-- Pilih Halaman --</option>
                    {pages.map((p) => (
                      <option key={p.id} value={p.id}>{p.title} (/{p.slug})</option>
                    ))}
                  </select>
                </div>
              )}

              {type === "CATEGORY" && (
                <div>
                  <label className="text-label-lg block mb-1.5" style={{ color: "var(--color-on-surface-variant)" }}>Pilih Kategori</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-lg border text-body-sm focus-ring"
                    style={{ borderColor: "var(--color-outline-variant)" }}
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} (/kategori/{c.slug})</option>
                    ))}
                  </select>
                </div>
              )}

              {(type === "EXTERNAL" || type === "LINK") && (
                <div>
                  <label className="text-label-lg block mb-1.5" style={{ color: "var(--color-on-surface-variant)" }}>URL Target</label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com atau /berita"
                    required
                    className="w-full px-4 py-2.5 rounded-lg border text-body-sm focus-ring"
                    style={{ borderColor: "var(--color-outline-variant)" }}
                  />
                </div>
              )}

              {activeTab === "HEADER" && (
                <div>
                  <label className="text-label-lg block mb-1.5" style={{ color: "var(--color-on-surface-variant)" }}>Induk Menu (Parent)</label>
                  <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border text-body-sm focus-ring"
                    style={{ borderColor: "var(--color-outline-variant)" }}
                  >
                    <option value="">Tidak Ada (Menu Utama)</option>
                    {filteredNavs
                      .filter((n) => !editing || n.id !== editing.id)
                      .map((n) => (
                        <option key={n.id} value={n.id}>{n.label}</option>
                      ))}
                  </select>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="tabCheck"
                  checked={openInNewTab}
                  onChange={(e) => setOpenInNewTab(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="tabCheck" className="text-body-sm" style={{ color: "var(--color-on-surface)" }}>
                  Buka di tab baru (target=&quot;_blank&quot;)
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
