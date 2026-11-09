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
  FolderOpen,
  Image as ImageIcon,
  FileEdit,
  CreditCard,
  Settings as SettingsIcon,
  LayoutDashboard,
  Calendar,
  Trophy,
  Menu as MenuIcon,
  Info,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { getRoles, createRole, updateRole, deleteRole } from "@/actions/pengguna";
import { SYSTEM_MODULES, ALL_SYSTEM_PERMISSIONS } from "@/lib/rbac_registry";
import PengaturanTabs from "@/components/admin/PengaturanTabs";

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
  dashboard: <LayoutDashboard size={18} className="text-[#09408C]" />,
  lead: <Users size={18} className="text-[#295897]" />,
  student: <GraduationCap size={18} className="text-[#09408C]" />,
  tutor: <BookOpen size={18} className="text-[#09408C]" />,
  schedule: <Calendar size={18} className="text-[#09408C]" />,
  package: <FileCheck size={18} className="text-[#295897]" />,
  payment: <CreditCard size={18} className="text-[#1F6F4A]" />,
  payout: <Trophy size={18} className="text-[#B45309]" />,
  material: <FolderOpen size={18} className="text-[#09408C]" />,
  exam: <Award size={18} className="text-[#09408C]" />,
  document: <FileEdit size={18} className="text-[#295897]" />,
  media: <ImageIcon size={18} className="text-[#5B6882]" />,
  user: <Users size={18} className="text-[#09408C]" />,
  role: <Shield size={18} className="text-[#09408C]" />,
  menu: <MenuIcon size={18} className="text-[#09408C]" />,
  settings: <SettingsIcon size={18} className="text-[#5B6882]" />,
};

export default function RoleClient({ roles: initialRoles, allPermissions }: RoleClientProps) {
  const router = useRouter();
  const [roles, setRoles] = useState<RoleItem[]>(initialRoles);
  const [roleSearch, setRoleSearch] = useState("");
  const [permSearch, setPermSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<RoleItem | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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

  const applyPreset = (presetType: "staf" | "tutor" | "siswa" | "admin") => {
    let targetNames: string[] = [];

    if (presetType === "staf") {
      // Staf Operasional: mengelola lead, siswa, jadwal, paket, pembayaran (tanpa honor BR-7)
      targetNames = allPermissions
        .filter((p) => !p.name.startsWith("payout.") && !p.name.startsWith("role.create") && !p.name.startsWith("role.delete") && p.name !== "tutor.manage")
        .map((p) => p.name);
    } else if (presetType === "tutor") {
      targetNames = [
        "dashboard.read",
        "tutor.read",
        "schedule.read", "schedule.manage",
        "payout.read",
        "material.read",
        "exam.read",
        "document.read", "document.update",
        "media.read", "media.create",
      ];
    } else if (presetType === "siswa") {
      targetNames = [
        "dashboard.read",
        "schedule.read",
        "material.read",
        "exam.read",
        "document.read",
      ];
    } else if (presetType === "admin") {
      targetNames = allPermissions.map((p) => p.name);
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
      setSuccess(result.message || "Hak akses role berhasil diperbarui.");
      setTimeout(() => setSuccess(""), 4000);
      router.refresh();
    } else {
      setError(result.message || "Gagal menyimpan role");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string, roleName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus role "${roleName}"? Role kustom ini akan dihapus permanen.`)) return;
    const result = await deleteRole(id);
    if (result.success) {
      setRoles((prev) => prev.filter((r) => r.id !== id));
      const updated = await getRoles();
      setRoles(updated);
      setSuccess("Role berhasil dihapus.");
      setTimeout(() => setSuccess(""), 3500);
      router.refresh();
    } else {
      alert(result.message);
    }
  };

  const isProtectedRole = (id: string, roleName: string) => {
    const protectedIds = ["role_superadmin", "role_admin", "role_staf", "role_tutor", "role_siswa", "role_ortu"];
    const protectedNames = ["super admin", "admin", "staf", "tutor", "siswa", "orang tua"];
    return protectedIds.includes(id) || protectedNames.includes(roleName.toLowerCase());
  };

  return (
    <div className="space-y-6" suppressHydrationWarning>
      {/* Shared Navigation Hub Tabs */}
      <PengaturanTabs />

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-[#D5DDEB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF1FA] text-[#09408C] flex items-center justify-center font-bold shadow-2xs">
              <Shield size={26} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF1FA] text-[#09408C] text-xs font-bold border border-[#9AC1E2] mb-1">
                <span>Access Control & Permissions</span>
              </div>
              <h1 className="text-2xl font-bold text-[#09408C] font-display">
                Role & Hak Akses Menu (RBAC)
              </h1>
              <p className="text-sm text-[#5B6882] mt-0.5">
                Atur wewenang dinamis untuk {allPermissions.length} hak akses pada {SYSTEM_MODULES.length} modul operasional Sahabat Belajar.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B6882]" />
            <input
              type="text"
              value={roleSearch}
              onChange={(e) => setRoleSearch(e.target.value)}
              placeholder="Cari peran / role..."
              className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#F4F7FB] border border-[#D5DDEB] rounded-xl focus-ring"
            />
          </div>
          <button
            onClick={openCreate}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#09408C] text-white hover:bg-[#0E3571] shadow-xs transition-all whitespace-nowrap"
          >
            <Plus size={16} />
            <span>Tambah Role</span>
          </button>
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-[#E3F4EC] text-[#1F6F4A] border border-[#A3E635] text-xs font-medium animate-in fade-in">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Role Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRoles.map((role) => {
          const isSuper = role.id === "role_superadmin" || role.name === "Super Admin";
          const permCount = isSuper ? allPermissions.length : role.permissions.length;
          const permPercent = Math.round((permCount / Math.max(allPermissions.length, 1)) * 100);

          return (
            <div
              key={role.id}
              className="bg-white rounded-2xl p-5 border border-[#D5DDEB] shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header Card */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                        isSuper ? "bg-[#FEF7E6] text-[#B45309]" : "bg-[#EAF1FA] text-[#09408C]"
                      }`}
                    >
                      <Shield size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#1B2A41] text-base flex items-center gap-2 font-display">
                        {role.name}
                        {isSuper && (
                          <span className="text-[10px] uppercase tracking-wider font-bold bg-[#FEF7E6] text-[#B45309] border border-[#F5B82E] px-2 py-0.5 rounded-full">
                            Full Access
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-[#5B6882] mt-0.5">
                        <span className="flex items-center gap-1 font-medium text-[#1B2A41]">
                          <Users size={12} className="text-[#5B6882]" />
                          {role._count?.users || 0} Akun
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-[#09408C] tabular-nums">
                          {permCount} / {allPermissions.length} Izin ({permPercent}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(role)}
                      title="Atur Hak Akses & Edit Role"
                      className="p-2 rounded-xl text-[#09408C] bg-[#EAF1FA] hover:bg-[#9AC1E2]/30 transition-colors"
                    >
                      <Edit3 size={15} />
                    </button>
                    {!isProtectedRole(role.id, role.name) && (
                      <button
                        onClick={() => handleDelete(role.id, role.name)}
                        title="Hapus Role"
                        className="p-2 rounded-xl text-[#5B6882] hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-[#5B6882] mb-3 line-clamp-2 min-h-[32px] leading-relaxed">
                  {role.description || "Tidak ada deskripsi wewenang khusus untuk role ini."}
                </p>

                {/* Progress Bar */}
                <div className="w-full bg-[#F4F7FB] rounded-full h-1.5 mb-3 overflow-hidden border border-[#D5DDEB]">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isSuper ? "bg-[#F5B82E]" : "bg-[#09408C]"
                    }`}
                    style={{ width: `${permPercent}%` }}
                  />
                </div>

                {/* Permission Tags Preview */}
                <div className="pt-3 border-t border-[#D5DDEB]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B6882]">
                      Cakupan Menu & Modul:
                    </span>
                    <button
                      onClick={() => openEdit(role)}
                      className="text-[11px] font-bold text-[#09408C] hover:underline"
                    >
                      Atur Hak Akses →
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1 scrollbar-thin">
                    {isSuper ? (
                      <span className="text-[11px] px-2.5 py-1 rounded-lg bg-[#EAF1FA] text-[#09408C] font-semibold border border-[#9AC1E2] inline-flex items-center gap-1.5">
                        <ShieldCheck size={13} className="text-[#09408C]" />
                        Semua Menu & Modul Terbuka (Full Administrator)
                      </span>
                    ) : role.permissions.length > 0 ? (
                      role.permissions.slice(0, 6).map((p) => (
                        <span
                          key={p.id}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-[#F4F7FB] text-[#1B2A41] border border-[#D5DDEB] font-mono"
                        >
                          {p.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-[#5B6882] italic">Belum ada izin menu yang dipilih</span>
                    )}
                    {!isSuper && role.permissions.length > 6 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#EAF1FA] text-[#09408C] font-semibold">
                        +{role.permissions.length - 6} izin lainnya
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Matrix Hak Akses & Edit Role */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] shadow-2xl flex flex-col overflow-hidden border border-[#D5DDEB]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-[#D5DDEB] flex items-center justify-between bg-[#F4F7FB]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#09408C] text-white flex items-center justify-center font-bold">
                  <Shield size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#09408C] font-display">
                    {editing ? `Atur Hak Akses: Role ${editing.name}` : "Buat Role Baru & Atur Hak Akses"}
                  </h2>
                  <p className="text-xs text-[#5B6882]">
                    Centang modul & menu yang diizinkan untuk diakses oleh pengguna dengan peran ini.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl text-[#5B6882] hover:bg-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="mx-6 mt-4 p-3.5 rounded-xl bg-[#FBE9E5] border border-[#FBE9E5] text-[#B4381F] text-xs font-semibold flex items-center gap-2">
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
                    <label className="text-xs font-bold text-[#1B2A41] block mb-1">
                      Nama Role *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={editing?.id === "role_superadmin"}
                      placeholder="Contoh: Staf Front Office / Reviewer Esai"
                      required
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#D5DDEB] rounded-xl focus-ring disabled:bg-[#F4F7FB]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#1B2A41] block mb-1">
                      Deskripsi Wewenang
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Jelaskan peran tugas dan batas tanggung jawab role ini"
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#D5DDEB] rounded-xl focus-ring"
                    />
                  </div>
                </div>

                {/* Preset Actions & Filter */}
                <div className="pt-4 border-t border-[#D5DDEB]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-[#1B2A41] flex items-center gap-2 font-display">
                        Matriks Hak Akses Menu
                        <span className="text-xs font-bold text-[#09408C] bg-[#EAF1FA] px-2.5 py-0.5 rounded-full">
                          {selectedPerms.length} dari {allPermissions.length} Izin Terpilih
                        </span>
                      </h3>
                      <p className="text-xs text-[#5B6882] mt-0.5">
                        Centang per modul atau gunakan template peran siap pakai di bawah ini:
                      </p>
                    </div>

                    {/* Quick Presets */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={selectAllGlobal}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#EAF1FA] hover:bg-[#9AC1E2]/30 text-[#09408C] transition-colors"
                      >
                        Pilih Semua
                      </button>
                      <button
                        type="button"
                        onClick={deselectAllGlobal}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#F4F7FB] hover:bg-slate-200 text-[#5B6882] transition-colors"
                      >
                        Kosongkan
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset("staf")}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 hover:bg-blue-100 text-[#09408C] transition-colors border border-blue-200"
                        title="Template Staf: Lead, Siswa, Jadwal, Paket, Pembayaran (Tanpa Honor)"
                      >
                        Template Staf
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset("tutor")}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#1F6F4A] transition-colors border border-emerald-200"
                        title="Template Tutor: Jadwal mengajar, Absensi/Jurnal, Honor pribadi, Modul & Ujian"
                      >
                        Template Tutor
                      </button>
                    </div>
                  </div>

                  {/* Search inside Modal */}
                  <div className="relative mb-4">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B6882]" />
                    <input
                      type="text"
                      value={permSearch}
                      onChange={(e) => setPermSearch(e.target.value)}
                      placeholder="Cari izin hak akses (misal: 'honor', 'jadwal', 'siswa', 'pembayaran')..."
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#F4F7FB] border border-[#D5DDEB] rounded-xl focus-ring"
                    />
                  </div>

                  {/* Modules Grouping Cards */}
                  <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
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
                      const isSensitiveModule = mod.key === "payout" || mod.key === "tutor";

                      return (
                        <div
                          key={mod.key}
                          className={`border rounded-2xl p-4 transition-all ${
                            selectedCountInMod > 0
                              ? "bg-white border-[#9AC1E2] shadow-2xs"
                              : "bg-[#F4F7FB]/50 border-[#D5DDEB]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 mb-3 pb-2.5 border-b border-[#D5DDEB]">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-[#EAF1FA] flex items-center justify-center shrink-0">
                                {MODULE_ICONS[mod.key] || <Shield size={16} />}
                              </div>
                              <div>
                                <h4 className="font-bold text-xs sm:text-sm text-[#1B2A41] flex items-center gap-2 font-display">
                                  {mod.label}
                                  <span className="text-[11px] font-semibold text-[#09408C] bg-[#EAF1FA] px-2 py-0.5 rounded-full">
                                    {selectedCountInMod}/{modPerms.length} aktif
                                  </span>
                                  {isSensitiveModule && (
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#B45309] bg-[#FEF7E6] px-1.5 py-0.5 rounded-md border border-[#F5B82E]">
                                      Sensitif (BR-7)
                                    </span>
                                  )}
                                </h4>
                                <p className="text-[11px] text-[#5B6882]">{mod.description}</p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => toggleAllInModule(mod.key)}
                              className="text-xs font-bold text-[#09408C] hover:underline shrink-0"
                            >
                              {isAllSelected ? "Batal Pilih" : "Pilih Semua Modul Ini"}
                            </button>
                          </div>

                          {/* Permission Grid for this Module */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {matchingPerms.map((perm) => {
                              const checked = selectedPerms.includes(perm.id);

                              return (
                                <div
                                  key={perm.id}
                                  onClick={() => togglePermission(perm.id)}
                                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all select-none ${
                                    checked
                                      ? "bg-[#EAF1FA]/60 border-[#9AC1E2] text-[#1B2A41]"
                                      : "bg-white border-[#D5DDEB] text-[#5B6882] hover:border-slate-400"
                                  }`}
                                >
                                  <div className="mt-0.5 shrink-0 text-[#09408C]">
                                    {checked ? (
                                      <CheckSquare size={16} className="text-[#09408C]" />
                                    ) : (
                                      <Square size={16} className="text-slate-300" />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-bold text-[#1B2A41] flex items-center gap-1.5">
                                      <span>{perm.label || perm.name}</span>
                                    </div>
                                    <p className="text-[11px] text-[#5B6882] mt-0.5 leading-snug">
                                      {perm.description}
                                    </p>
                                    <span className="text-[10px] text-[#09408C] font-mono mt-1 block">
                                      guard: {perm.name}
                                    </span>
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
              <div className="p-4 px-6 border-t border-[#D5DDEB] bg-[#F4F7FB] flex items-center justify-between gap-4">
                <span className="text-xs text-[#5B6882]">
                  Perubahan hak akses akan langsung aktif pada login sesi pengguna berikutnya.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-[#5B6882] hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 text-xs font-semibold bg-[#09408C] text-white hover:bg-[#0E3571] rounded-xl transition-colors shadow-xs disabled:opacity-50"
                  >
                    {loading ? "Menyimpan..." : "Simpan Hak Akses Role"}
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
