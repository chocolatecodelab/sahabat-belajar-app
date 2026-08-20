"use client";

import { useState, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import {
  Menu as MenuIcon,
  Plus,
  Edit,
  Trash2,
  X,
  Link as LinkIcon,
  ShieldCheck,
  CheckCircle2,
  Power,
  ChevronRight,
  FolderTree,
} from "lucide-react";
import {
  getAdminMenus,
  createAdminMenu,
  updateAdminMenu,
  deleteAdminMenu,
  toggleAdminMenuStatus,
  AdminMenuItem,
} from "@/actions/menu";

interface AdminMenuClientProps {
  menus: AdminMenuItem[];
}

const AVAILABLE_ICONS = [
  "LayoutDashboard",
  "FileText",
  "Newspaper",
  "FolderOpen",
  "Navigation",
  "Palette",
  "Image",
  "Heart",
  "Rss",
  "Share2",
  "Users",
  "Shield",
  "Menu",
  "Settings",
  "Link",
  "BookOpen",
  "Award",
  "GraduationCap",
  "Compass",
  "Video",
  "FileEdit",
  "Send",
  "Sparkles",
  "Clock",
  "HelpCircle",
  "MessageSquare",
  "Trophy",
];

export default function AdminMenuClient({ menus: initial }: AdminMenuClientProps) {
  const router = useRouter();
  const [menus, setMenus] = useState<AdminMenuItem[]>(initial);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AdminMenuItem | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMenus(initial);
  }, [initial]);

  // Form State
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [icon, setIcon] = useState("Link");
  const [permission, setPermission] = useState("");
  const [parentId, setParentId] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const openCreate = (defaultParentId?: string) => {
    setEditing(null);
    setLabel("");
    setUrl("");
    setIcon("Link");
    setPermission("");
    setParentId(defaultParentId || "");
    setSortOrder(0);
    setIsActive(true);
    setError("");
    setShowModal(true);
  };

  const openEdit = (menu: AdminMenuItem) => {
    setEditing(menu);
    setLabel(menu.label);
    setUrl(menu.url);
    setIcon(menu.icon || "Link");
    setPermission(menu.permission || "");
    setParentId(menu.parentId || "");
    setSortOrder(menu.sortOrder || 0);
    setIsActive(menu.isActive);
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.set("label", label);
    formData.set("url", url);
    formData.set("icon", icon);
    formData.set("permission", permission);
    formData.set("parentId", parentId);
    formData.set("sortOrder", String(sortOrder));
    formData.set("isActive", String(isActive));

    const result = editing
      ? await updateAdminMenu(editing.id, formData)
      : await createAdminMenu(formData);

    if (result.success) {
      setShowModal(false);
      const updated = await getAdminMenus();
      setMenus(updated);
      setSuccess(result.message || "Berhasil");
      setTimeout(() => setSuccess(""), 3000);
      router.refresh();
    } else {
      setError(result.message || "Gagal menyimpan menu admin");
    }
    setLoading(false);
  };

  const handleToggle = async (item: AdminMenuItem) => {
    const nextStatus = !item.isActive;
    const result = await toggleAdminMenuStatus(item.id, nextStatus);
    if (result.success) {
      const updated = await getAdminMenus();
      setMenus(updated);
      router.refresh();
    } else {
      alert(result.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus menu admin ini? Jika menu ini memiliki sub-menu, semuanya akan ikut terhapus.")) return;
    const result = await deleteAdminMenu(id);
    if (result.success) {
      const updated = await getAdminMenus();
      setMenus(updated);
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
            <MenuIcon size={28} /> Pengaturan Menu Admin
          </h1>
          <p className="text-body-md mt-1" style={{ color: "var(--color-on-surface-variant)" }}>
            Kelola visibilitas, urutan, dan izin menu sidebar secara dinamis
          </p>
        </div>
        <button
          onClick={() => openCreate()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-label-lg font-semibold text-white transition-all shadow-sm hover:shadow-md"
          style={{ background: "var(--color-primary)" }}
        >
          <Plus size={18} /> Tambah Menu Baru
        </button>
      </div>

      {success && (
        <div className="flex items-center gap-2 p-4 rounded-xl mb-6 bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-medium">
          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          {success}
        </div>
      )}

      <div className="bg-white elevation-1 rounded-2xl overflow-hidden border border-gray-100 shadow-xs">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-600 uppercase">
            <tr>
              <th className="px-6 py-4">Menu & Submenu</th>
              <th className="px-6 py-4">URL / Path</th>
              <th className="px-6 py-4">Permission Guard</th>
              <th className="px-6 py-4 text-center">Urutan</th>
              <th className="px-6 py-4 text-center">Status Sidebar</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {menus.map((item) => (
              <Fragment key={item.id}>
                {/* Parent Row */}
                <tr className="hover:bg-gray-50/50 transition-colors bg-white">
                  <td className="px-6 py-4 font-semibold text-gray-900 flex items-center gap-2.5">
                    <FolderTree size={18} className="text-blue-900 shrink-0" />
                    <span>{item.label}</span>
                    {item.children && item.children.length > 0 && (
                      <span className="text-2xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-normal">
                        {item.children.length} sub-item
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-mono text-xs">{item.url}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {item.permission ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800">
                        <ShieldCheck size={12} /> {item.permission}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs font-normal">Semua Admin</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center text-xs font-semibold text-gray-500">{item.sortOrder}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleToggle(item)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                        item.isActive
                          ? "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200"
                      }`}
                    >
                      <Power size={12} />
                      {item.isActive ? "Tampil" : "Sembunyi"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right space-x-1">
                    <button
                      onClick={() => openCreate(item.id)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-blue-900 hover:bg-blue-50 transition-colors"
                      title="Tambah Submenu"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      onClick={() => openEdit(item)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-blue-900 hover:bg-blue-50 transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Hapus"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>

                {/* Submenu Children */}
                {item.children?.map((child) => (
                  <tr key={child.id} className="bg-slate-50/60 hover:bg-slate-100/60 transition-colors">
                    <td className="px-6 py-3 pl-12 font-medium text-gray-700 flex items-center gap-2">
                      <ChevronRight size={14} className="text-gray-400 shrink-0" />
                      <span className="text-sm">{child.label}</span>
                    </td>
                    <td className="px-6 py-3 text-gray-500 font-mono text-xs">{child.url}</td>
                    <td className="px-6 py-3 text-gray-500">
                      {child.permission ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800">
                          <ShieldCheck size={12} /> {child.permission}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">Warisi Induk</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-center text-xs font-semibold text-gray-400">{child.sortOrder}</td>
                    <td className="px-6 py-3 text-center">
                      <button
                        onClick={() => handleToggle(child)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-semibold transition-all ${
                          child.isActive
                            ? "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200"
                        }`}
                      >
                        <Power size={10} />
                        {child.isActive ? "Tampil" : "Sembunyi"}
                      </button>
                    </td>
                    <td className="px-6 py-3 text-right space-x-1">
                      <button
                        onClick={() => openEdit(child)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-blue-900 hover:bg-blue-50 transition-colors"
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(child.id)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Hapus"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h2 className="text-title-lg font-bold text-gray-900">
                {editing ? "Edit Menu Admin" : "Tambah Menu Admin"}
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
                <label className="text-xs font-bold uppercase text-gray-600 block mb-1">Label Menu</label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Contoh: Laporan Riset"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border text-sm focus-ring bg-gray-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-gray-600 block mb-1">URL / Target Path</label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="/dashboard/laporan atau #"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border text-sm font-mono focus-ring bg-gray-50 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase text-gray-600 block mb-1">Menu Induk (Parent)</label>
                  <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border text-sm focus-ring bg-gray-50 focus:bg-white"
                  >
                    <option value="">-- Menu Utama (Top Level) --</option>
                    {menus
                      .filter((m) => !editing || m.id !== editing.id)
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-gray-600 block mb-1">Ikon</label>
                  <select
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border text-sm focus-ring bg-gray-50 focus:bg-white"
                  >
                    {AVAILABLE_ICONS.map((ic) => (
                      <option key={ic} value={ic}>
                        {ic}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase text-gray-600 block mb-1">Permission Guard</label>
                  <input
                    type="text"
                    value={permission}
                    onChange={(e) => setPermission(e.target.value)}
                    placeholder="misal: article.read"
                    className="w-full px-4 py-2.5 rounded-lg border text-sm focus-ring bg-gray-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-gray-600 block mb-1">Nomor Urutan</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    min={0}
                    className="w-full px-4 py-2.5 rounded-lg border text-sm focus-ring bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="menuActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-900"
                />
                <label htmlFor="menuActive" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Tampilkan di Sidebar (Status Aktif)
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
                  {loading ? "Menyimpan..." : "Simpan Menu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
