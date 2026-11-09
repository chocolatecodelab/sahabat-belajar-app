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
  RotateCcw,
  Sparkles,
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  FileCheck,
  CreditCard,
  Trophy,
  FolderOpen,
  Award,
  FileEdit,
  Image as ImageIcon,
  Settings,
  Shield,
  Compass,
} from "lucide-react";
import {
  getAdminMenus,
  createAdminMenu,
  updateAdminMenu,
  deleteAdminMenu,
  toggleAdminMenuStatus,
  resetDefaultAdminMenus,
} from "@/actions/menu";
import type { AdminMenuItem } from "@/actions/menu";
import { ALL_SYSTEM_PERMISSIONS } from "@/lib/rbac_registry";
import PengaturanTabs from "@/components/admin/PengaturanTabs";

interface AdminMenuClientProps {
  menus: AdminMenuItem[];
}

const ICON_COMPONENTS: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard size={18} />,
  Users: <Users size={18} />,
  GraduationCap: <GraduationCap size={18} />,
  BookOpen: <BookOpen size={18} />,
  Compass: <Compass size={18} />,
  Calendar: <Calendar size={18} />,
  FileCheck: <FileCheck size={18} />,
  CreditCard: <CreditCard size={18} />,
  Trophy: <Trophy size={18} />,
  FolderOpen: <FolderOpen size={18} />,
  Award: <Award size={18} />,
  FileEdit: <FileEdit size={18} />,
  Image: <ImageIcon size={18} />,
  Settings: <Settings size={18} />,
  Shield: <Shield size={18} />,
  Menu: <MenuIcon size={18} />,
  Sparkles: <Sparkles size={18} />,
  Link: <LinkIcon size={18} />,
};

const AVAILABLE_ICONS = Object.keys(ICON_COMPONENTS);

export default function AdminMenuClient({ menus: initial }: AdminMenuClientProps) {
  const router = useRouter();
  const [menus, setMenus] = useState<AdminMenuItem[]>(initial);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AdminMenuItem | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    setMenus(initial);
  }, [initial]);

  // Form State
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [icon, setIcon] = useState("LayoutDashboard");
  const [permission, setPermission] = useState("");
  const [parentId, setParentId] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const openCreate = (defaultParentId?: string) => {
    setEditing(null);
    setLabel("");
    setUrl("");
    setIcon("LayoutDashboard");
    setPermission("");
    setParentId(defaultParentId || "");
    setSortOrder(menus.length + 1);
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
      setTimeout(() => setSuccess(""), 3500);
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

  const handleDelete = async (id: string, itemLabel: string) => {
    if (!confirm(`Hapus menu "${itemLabel}"? Jika menu ini memiliki sub-menu, seluruh sub-menunya juga akan terhapus.`)) return;
    const result = await deleteAdminMenu(id);
    if (result.success) {
      const updated = await getAdminMenus();
      setMenus(updated);
      router.refresh();
    } else {
      alert(result.message);
    }
  };

  const handleResetDefaults = async () => {
    if (!confirm("Pulihkan seluruh susunan menu standar resmi Sahabat Belajar (15 menu utama & sub-menu pengaturan)? Perubahan menu kustom Anda mungkin ditimpa.")) return;
    setIsResetting(true);
    const res = await resetDefaultAdminMenus();
    setIsResetting(false);
    if (res.success) {
      const updated = await getAdminMenus();
      setMenus(updated);
      setSuccess(res.message || "Susunan menu standar Sahabat Belajar berhasil dipulihkan.");
      setTimeout(() => setSuccess(""), 4000);
      router.refresh();
    } else {
      alert(res.message);
    }
  };

  // Get list of parent candidates (items without parentId)
  const parentCandidates = menus.filter((m) => !m.parentId && m.id !== editing?.id);

  return (
    <div className="space-y-6">
      {/* Shared Navigation Hub Tabs */}
      <PengaturanTabs />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF1FA] text-[#09408C] text-xs font-bold border border-[#9AC1E2] mb-2">
            <MenuIcon size={14} />
            <span>Navigasi Sidebar Dashboard</span>
          </div>
          <h1 className="text-2xl font-bold text-[#09408C] font-display">
            Pengaturan Menu Navigasi
          </h1>
          <p className="text-sm text-[#5B6882] mt-0.5">
            Atur susunan, hierarki sub-menu, ikon, izin akses, dan visibilitas menu sidebar dashboard.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            disabled={isResetting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#D5DDEB] bg-white text-[#5B6882] hover:text-[#09408C] hover:bg-[#F4F7FB] text-xs font-semibold transition-all disabled:opacity-50"
            title="Kembalikan susunan menu standar Sahabat Belajar"
          >
            <RotateCcw size={14} />
            <span>{isResetting ? "Memulihkan..." : "Reset Default"}</span>
          </button>
          <button
            onClick={() => openCreate()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#09408C] hover:bg-[#0E3571] transition-all shadow-xs"
          >
            <Plus size={16} />
            <span>Tambah Menu Baru</span>
          </button>
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-[#E3F4EC] text-[#1F6F4A] border border-[#A3E635] text-xs font-medium animate-in fade-in">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Table of Menus */}
      <div className="bg-white rounded-2xl border border-[#D5DDEB] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4F7FB] border-b border-[#D5DDEB] text-[#5B6882] font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Menu & Submenu</th>
                <th className="py-3 px-4">Path URL</th>
                <th className="py-3 px-4">Hak Akses Guard</th>
                <th className="py-3 px-4 text-center">Urutan</th>
                <th className="py-3 px-4 text-center">Status Sidebar</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D5DDEB]">
              {menus.map((item) => (
                <Fragment key={item.id}>
                  {/* Parent Menu Row */}
                  <tr className="hover:bg-[#EAF1FA]/40 transition-colors bg-white">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5 font-bold text-sm text-[#1B2A41]">
                        <span className="w-8 h-8 rounded-lg bg-[#EAF1FA] text-[#09408C] flex items-center justify-center shrink-0">
                          {ICON_COMPONENTS[item.icon || ""] || <LinkIcon size={16} />}
                        </span>
                        <span>{item.label}</span>
                        {item.children && item.children.length > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EAF1FA] text-[#09408C] font-semibold">
                            {item.children.length} sub-item
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#5B6882] font-mono text-[11px]">
                      {item.url}
                    </td>
                    <td className="py-3.5 px-4">
                      {item.permission ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EAF1FA] text-[#09408C] border border-[#9AC1E2]">
                          <ShieldCheck size={12} />
                          <span>{item.permission}</span>
                        </span>
                      ) : (
                        <span className="text-[#5B6882] text-[11px] italic">Semua Role Login</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-[#09408C] tabular-nums">
                      {item.sortOrder}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggle(item)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                          item.isActive
                            ? "bg-[#E3F4EC] text-[#1F6F4A] border border-[#A3E635] hover:bg-[#d5eedf]"
                            : "bg-[#F4F7FB] text-[#5B6882] border border-[#D5DDEB] hover:bg-slate-200"
                        }`}
                      >
                        <Power size={11} />
                        <span>{item.isActive ? "Tampil" : "Sembunyi"}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => openCreate(item.id)}
                        className="p-1.5 rounded-lg text-[#5B6882] hover:text-[#09408C] hover:bg-[#EAF1FA] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#09408C]"
                        title="Tambah Sub-Menu di dalam menu ini"
                        aria-label={`Tambah Sub-Menu di dalam ${item.label}`}
                      >
                        <Plus size={15} />
                      </button>
                      <button
                        onClick={() => openEdit(item)}
                        className="p-1.5 rounded-lg text-[#5B6882] hover:text-[#09408C] hover:bg-[#EAF1FA] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#09408C]"
                        title="Edit Menu"
                        aria-label={`Edit menu ${item.label}`}
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.label)}
                        className="p-1.5 rounded-lg text-[#5B6882] hover:text-red-600 hover:bg-red-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                        title="Hapus Menu"
                        aria-label={`Hapus menu ${item.label}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>

                  {/* Child Menus (Submenu) */}
                  {item.children &&
                    item.children.map((child) => (
                      <tr key={child.id} className="bg-[#F4F7FB]/50 hover:bg-[#EAF1FA]/30 transition-colors">
                        <td className="py-2.5 px-4 pl-12">
                          <div className="flex items-center gap-2 text-xs font-semibold text-[#1B2A41]">
                            <ChevronRight size={14} className="text-[#9AC1E2] shrink-0" />
                            <span className="w-6 h-6 rounded-md bg-white text-[#09408C] flex items-center justify-center shrink-0 border border-[#D5DDEB]">
                              {ICON_COMPONENTS[child.icon || ""] || <LinkIcon size={12} />}
                            </span>
                            <span>{child.label}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 text-[#5B6882] font-mono text-[11px]">
                          {child.url}
                        </td>
                        <td className="py-2.5 px-4">
                          {child.permission ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EAF1FA] text-[#09408C]">
                              <ShieldCheck size={11} />
                              <span>{child.permission}</span>
                            </span>
                          ) : (
                            <span className="text-[#5B6882] text-[10px] italic">Mengikuti Parent</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-center font-medium text-[#5B6882] tabular-nums">
                          {child.sortOrder}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <button
                            onClick={() => handleToggle(child)}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-all ${
                              child.isActive
                                ? "bg-[#E3F4EC] text-[#1F6F4A] border border-[#A3E635]"
                                : "bg-slate-100 text-slate-500 border border-slate-200"
                            }`}
                          >
                            <Power size={10} />
                            <span>{child.isActive ? "Tampil" : "Sembunyi"}</span>
                          </button>
                        </td>
                        <td className="py-2.5 px-4 text-right space-x-1">
                          <button
                            onClick={() => openEdit(child)}
                            className="p-1 rounded-md text-[#5B6882] hover:text-[#09408C] hover:bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#09408C]"
                            title="Edit Submenu"
                            aria-label={`Edit submenu ${child.label}`}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(child.id, child.label)}
                            className="p-1 rounded-md text-[#5B6882] hover:text-red-600 hover:bg-red-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                            title="Hapus Submenu"
                            aria-label={`Hapus submenu ${child.label}`}
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
      </div>

      {/* Add / Edit Menu Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#D5DDEB] animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#D5DDEB] mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#EAF1FA] text-[#09408C]">
                  {editing ? <Edit size={18} /> : <Plus size={18} />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#09408C] font-display">
                    {editing ? "Edit Menu Navigasi" : "Tambah Menu Baru"}
                  </h3>
                  <p className="text-xs text-[#5B6882]">
                    Konfigurasikan label, icon, URL, dan izin akses sidebar.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-[#5B6882] hover:bg-[#F4F7FB]"
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-[#FBE9E5] text-[#B4381F] border border-[#FBE9E5] text-xs font-semibold mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                    Label Menu *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Bank Soal & CAT"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                    Path / URL Navigasi *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: /dashboard/ujian"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] font-mono focus-ring"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                    Ikon Lucide
                  </label>
                  <select
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring bg-white"
                  >
                    {AVAILABLE_ICONS.map((ic) => (
                      <option key={ic} value={ic}>
                        {ic}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                    Urutan Tampil (Sort)
                  </label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                    Menu Induk (Parent)
                  </label>
                  <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring bg-white"
                  >
                    <option value="">-- Menu Utama (Tanpa Induk) --</option>
                    {parentCandidates.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                    Hak Akses Guard (RBAC)
                  </label>
                  <select
                    value={permission}
                    onChange={(e) => setPermission(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring bg-white"
                  >
                    <option value="">Bebas (Semua Role Login)</option>
                    {ALL_SYSTEM_PERMISSIONS.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name} — {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  id="menu-active-check"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-[#D5DDEB] text-[#09408C] focus:ring-[#09408C]"
                />
                <label htmlFor="menu-active-check" className="text-xs font-medium text-[#1B2A41]">
                  Aktifkan menu ini (langsung tampil di sidebar bagi yang berhak)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#D5DDEB]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#5B6882] hover:bg-[#F4F7FB] rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-xs font-semibold bg-[#09408C] text-white hover:bg-[#0E3571] rounded-xl transition-colors disabled:opacity-50"
                >
                  {loading ? "Menyimpan..." : editing ? "Perbarui Menu" : "Simpan Menu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
