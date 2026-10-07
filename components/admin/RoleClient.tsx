"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Plus,
  Edit3,
  Trash2,
  X,
  CheckSquare,
  Square,
  Search,
  Users,
  CheckCircle2,
  Lock,
  ShieldCheck,
  BookOpen,
  GraduationCap,
  FileCheck,
  Award,
  Newspaper,
  FolderOpen,
  Image as ImageIcon,
  FileText,
  Navigation as NavIcon,
  Palette,
  Menu as MenuIcon,
  CreditCard,
  Settings as SettingsIcon,
  LayoutDashboard,
  Info,
} from "lucide-react";
import { getRoles, createRole, updateRole, deleteRole } from "@/actions/pengguna";
import { SYSTEM_MODULES, ALL_SYSTEM_PERMISSIONS } from "@/lib/rbac_registry";

type PermissionItem = {
  id: string;
  name: string;
  module: string;
  action: string;
  label?: string;
  description?: string;
};

type RoleItem = {
  id: string;
  name: string;
  description: string | null;
  permissions: { id: string; name: string; module?: string; action?: string }[];
  _count: { users: number };
};

interface RoleClientProps {
  roles: RoleItem[];
  allPermissions: PermissionItem[];
}

const MODULE_ICONS: Record<string, React.ReactNode> = {
  dashboard: <LayoutDashboard size={18} className="text-[#001847]" />,
  course: <BookOpen size={18} className="text-emerald-700" />,
  registration: <GraduationCap size={18} className="text-blue-700" />,
  submission: <FileCheck size={18} className="text-purple-700" />,
  certificate: <Award size={18} className="text-amber-700" />,
  article: <Newspaper size={18} className="text-teal-700" />,
  category: <FolderOpen size={18} className="text-amber-600" />,
  media: <ImageIcon size={18} className="text-indigo-700" />,
  page: <FileText size={18} className="text-slate-700" />,
  navigation: <NavIcon size={18} className="text-cyan-700" />,
  appearance: <Palette size={18} className="text-pink-700" />,
  user: <Users size={18} className="text-blue-800" />,
  role: <Shield size={18} className="text-rose-700" />,
  menu: <MenuIcon size={18} className="text-slate-800" />,
  payment_account: <CreditCard size={18} className="text-emerald-800" />,
  settings: <SettingsIcon size={18} className="text-slate-800" />,
};

export default function RoleClient({ roles: initialRoles, allPermissions }: RoleClientProps) {
  const router = useRouter();
  const [roles, setRoles] = useState<RoleItem[]>(initialRoles);
  const [roleSearch, setRoleSearch] = useState("");
  const [permSearch, setPermSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<RoleItem | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setRoles(initialRoles);
  }, [initialRoles]);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);

  const filteredRoles = useMemo(() => {
    if (!roleSearch.trim()) return roles;
    const q = roleSearch.toLowerCase();
    return roles.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q))
    );
  }, [roles, roleSearch]);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setSelectedPerms([]);
    setPermSearch("");
    setError("");
    setShowModal(true);
  };

  const openEdit = (role: RoleItem) => {
    setEditing(role);
    setName(role.name);
    setDescription(role.description || "");
    setSelectedPerms(role.permissions.map((p) => p.id));
    setPermSearch("");
    setError("");
    setShowModal(true);
  };

  const togglePermission = (id: string) => {
    setSelectedPerms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleAllInModule = (modKey: string) => {
    const modPermIds = allPermissions.filter((p) => p.module === modKey).map((p) => p.id);
    const allSelected = modPermIds.length > 0 && modPermIds.every((id) => selectedPerms.includes(id));
    if (allSelected) {
      setSelectedPerms((prev) => prev.filter((id) => !modPermIds.includes(id)));
    } else {
      setSelectedPerms((prev) => Array.from(new Set([...prev, ...modPermIds])));
    }
  };

  const selectAllGlobal = () => {
    setSelectedPerms(allPermissions.map((p) => p.id));
  };

  const deselectAllGlobal = () => {
    setSelectedPerms([]);
  };

  const applyPreset = (presetType: "mentor" | "editor" | "viewer") => {
    let targetNames: string[] = [];
    if (presetType === "mentor") {
      targetNames = [
        "dashboard.read",
        "course.read", "course.create", "course.update",
        "submission.read", "submission.review",
        "certificate.read", "certificate.create",
        "media.read", "media.create",
        "article.read", "article.create", "article.update",
      ];
    } else if (presetType === "editor") {
      targetNames = [
        "dashboard.read",
        "article.read", "article.create", "article.update", "article.delete",
        "category.read", "category.create", "category.update",
        "media.read", "media.create", "media.delete",
        "page.read", "page.create", "page.update",
        "navigation.read", "navigation.update",
        "appearance.read", "appearance.update",
      ];
    } else if (presetType === "viewer") {
      targetNames = allPermissions.filter((p) => p.action === "read").map((p) => p.name);
    }

    const matchedIds = allPermissions
      .filter((p) => targetNames.includes(p.name))
      .map((p) => p.id);
    setSelectedPerms(matchedIds);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.set("name", name.trim());
    formData.set("description", description.trim());
    selectedPerms.forEach((pId) => formData.append("permissions", pId));

    const result = editing
      ? await updateRole(editing.id, formData)
      : await createRole(formData);

    if (result.success) {
      setShowModal(false);
      const updated = await getRoles();
      setRoles(updated);
      router.refresh();
    } else {
      setError(result.message || "Gagal menyimpan role");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string, roleName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus role "${roleName}"?`)) return;
    const result = await deleteRole(id);
    if (result.success) {
      setRoles((prev) => prev.filter((r) => r.id !== id));
      const updated = await getRoles();
      setRoles(updated);
      router.refresh();
    } else {
      alert(result.message);
    }
  };

  const isProtectedRole = (id: string) => {
    return ["role_superadmin", "role_admin", "role_mentor", "role_student"].includes(id);
  };

  return (
    <div className="space-y-6" suppressHydrationWarning>
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#001847]/10 flex items-center justify-center text-[#001847]">
              <Shield size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#001847]">Role & Hak Akses (RBAC)</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Konfigurasi wewenang dinamis untuk {allPermissions.length} hak akses pada {SYSTEM_MODULES.length} modul sistem
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={roleSearch}
              onChange={(e) => setRoleSearch(e.target.value)}
              placeholder="Cari role..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#001847] transition-colors"
            />
          </div>
          <button
            onClick={openCreate}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#001847] text-white hover:bg-[#002466] shadow-sm transition-all whitespace-nowrap"
          >
            <Plus size={18} /> Tambah Role
          </button>
        </div>
      </div>

      {/* Role Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoles.map((role) => {
          const isSuper = role.id === "role_superadmin" || role.name === "Super Admin";
          const permCount = isSuper ? allPermissions.length : role.permissions.length;
          const permPercent = Math.round((permCount / Math.max(allPermissions.length, 1)) * 100);

          return (
            <div
              key={role.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header Card */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isSuper ? "bg-[#fdbc13]/20 text-[#001847]" : "bg-slate-100 text-[#001847]"
                    }`}>
                      <Shield size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                        {role.name}
                        {isSuper && (
                          <span className="text-[10px] uppercase tracking-wider font-bold bg-[#fdbc13] text-[#001847] px-2 py-0.5 rounded-full">
                            Full Access
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <Users size={13} className="text-slate-400" />
                          {role._count.users} Pengguna
                        </span>
                        <span>•</span>
                        <span className="font-medium text-[#001847]">
                          {permCount} / {allPermissions.length} Izin ({permPercent}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(role)}
                      title="Edit Hak Akses"
                      className="p-2 rounded-lg text-slate-600 hover:text-[#001847] hover:bg-slate-100 transition-colors"
                    >
                      <Edit3 size={16} />
                    </button>
                    {!isProtectedRole(role.id) && (
                      <button
                        onClick={() => handleDelete(role.id, role.name)}
                        title="Hapus Role"
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 mb-4 line-clamp-2 min-h-[32px]">
                  {role.description || "Tidak ada deskripsi wewenang khusus untuk role ini."}
                </p>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isSuper ? "bg-[#fdbc13]" : "bg-[#001847]"
                    }`}
                    style={{ width: `${permPercent}%` }}
                  />
                </div>

                {/* Permission Tags Preview */}
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                    Cakupan Hak Akses:
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                    {isSuper ? (
                      <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-50 text-[#001847] font-semibold border border-amber-200 inline-flex items-center gap-1.5">
                        <ShieldCheck size={13} className="text-amber-600" />
                        Seluruh {allPermissions.length} Hak Akses Sistem Aktif
                      </span>
                    ) : role.permissions.length > 0 ? (
                      role.permissions.slice(0, 8).map((p) => (
                        <span
                          key={p.id}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono"
                        >
                          {p.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">Belum ada izin khusus yang dipilih</span>
                    )}
                    {!isSuper && role.permissions.length > 8 && (
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 font-medium">
                        +{role.permissions.length - 8} lainnya
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Matrix Hak Akses */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#001847] text-white flex items-center justify-center">
                  <Shield size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#001847]">
                    {editing ? `Edit Role: ${editing.name}` : "Tambah Role Baru"}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Tentukan nama role dan sesuaikan izin modul yang dapat diakses pengguna
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="mx-6 mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <Info size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                {/* Role Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                      Nama Role <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={editing?.id === "role_superadmin"}
                      placeholder="Misal: Mentor Riset Senior / Staf Administrasi"
                      required
                      className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#001847] disabled:bg-slate-100 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                      Deskripsi Wewenang
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Jelaskan peran tugas dan wewenang akun ini"
                      className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#001847] transition-colors"
                    />
                  </div>
                </div>

                {/* Preset Actions & Filter */}
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Matrix Hak Akses ({selectedPerms.length} dari {allPermissions.length} Izin Terpilih)
                      </h3>
                      <p className="text-xs text-slate-500">Centang izin yang ingin diberikan untuk role ini</p>
                    </div>

                    {/* Quick Presets */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={selectAllGlobal}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      >
                        Pilih Semua
                      </button>
                      <button
                        type="button"
                        onClick={deselectAllGlobal}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      >
                        Kosongkan
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset("mentor")}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors"
                      >
                        Preset Mentor
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset("editor")}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 transition-colors"
                      >
                        Preset Editor
                      </button>
                    </div>
                  </div>

                  {/* Search inside Modal */}
                  <div className="relative mb-4">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={permSearch}
                      onChange={(e) => setPermSearch(e.target.value)}
                      placeholder="Cari izin hak akses (misal: 'kursus', 'verifikasi', 'draf')..."
                      className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#001847]"
                    />
                  </div>

                  {/* Modules Grouping Accordion / Cards */}
                  <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                    {SYSTEM_MODULES.map((mod) => {
                      const modPerms = allPermissions.filter((p) => p.module === mod.key);
                      const matchingPerms = permSearch.trim()
                        ? modPerms.filter(
                            (p) =>
                              p.name.toLowerCase().includes(permSearch.toLowerCase()) ||
                              (p.label && p.label.toLowerCase().includes(permSearch.toLowerCase())) ||
                              (p.description && p.description.toLowerCase().includes(permSearch.toLowerCase()))
                          )
                        : modPerms;

                      if (matchingPerms.length === 0) return null;

                      const isAllSelected =
                        modPerms.length > 0 && modPerms.every((p) => selectedPerms.includes(p.id));
                      const selectedCountInMod = modPerms.filter((p) => selectedPerms.includes(p.id)).length;

                      return (
                        <div
                          key={mod.key}
                          className="border border-slate-200 rounded-xl p-4 bg-white hover:border-slate-300 transition-all shadow-sm"
                        >
                          <div className="flex items-center justify-between gap-3 mb-3 pb-2.5 border-b border-slate-100">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                                {MODULE_ICONS[mod.key] || <Shield size={16} />}
                              </div>
                              <div>
                                <h4 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                                  {mod.label}
                                  <span className="text-[11px] font-normal text-slate-400">
                                    ({selectedCountInMod}/{modPerms.length})
                                  </span>
                                </h4>
                                <p className="text-[11px] text-slate-500">{mod.description}</p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => toggleAllInModule(mod.key)}
                              className="text-xs font-semibold text-[#001847] hover:underline shrink-0"
                            >
                              {isAllSelected ? "Batal Semua" : "Pilih Modul Ini"}
                            </button>
                          </div>

                          {/* Permission Items in Module */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {matchingPerms.map((perm) => {
                              const checked = selectedPerms.includes(perm.id);
                              return (
                                <div
                                  key={perm.id}
                                  onClick={() => togglePermission(perm.id)}
                                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                                    checked
                                      ? "bg-blue-50/70 border-blue-300 text-blue-900 shadow-xs"
                                      : "bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100/70"
                                  }`}
                                >
                                  <div className="mt-0.5 shrink-0">
                                    {checked ? (
                                      <CheckSquare size={16} className="text-blue-700" />
                                    ) : (
                                      <Square size={16} className="text-slate-400" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-semibold text-xs text-slate-900">
                                        {perm.label || perm.name}
                                      </span>
                                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/80 border border-slate-200 text-slate-600">
                                        {perm.name}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                                      {perm.description || `Izin untuk ${perm.action} pada ${perm.module}`}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  <span>{selectedPerms.length} hak akses dipilih</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 text-xs font-semibold rounded-xl bg-[#001847] text-white hover:bg-[#002466] transition-all disabled:opacity-60 shadow-sm"
                  >
                    {loading ? "Menyimpan..." : editing ? "Simpan Perubahan" : "Buat Role"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
