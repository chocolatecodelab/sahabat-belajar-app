"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, Plus, Edit, Trash2, X, Search, ShieldCheck } from "lucide-react";
import { getUsers, createUser, updateUser, deleteUser } from "@/actions/pengguna";
import { formatDate } from "@/lib/date";
import PengaturanTabs from "@/components/admin/PengaturanTabs";
import { useToast } from "@/components/ui/Toast";

type UserItem = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  roleId: string | null;
  role?: { name: string } | null;
  createdAt: Date | string;
};

type RoleItem = {
  id: string;
  name: string;
};

interface PenggunaClientProps {
  users: UserItem[];
  roles: RoleItem[];
}

export default function PenggunaClient({ users: initialUsers, roles }: PenggunaClientProps) {
  const router = useRouter();
  const toast = useToast();
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<UserItem | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowModal(false);
    };
    if (showModal) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showModal]);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");

  const dynamicRoleTabs = [
    { key: "ALL", label: "Semua Role", count: users.length },
    ...roles.map((r) => ({
      key: r.id,
      label: r.name,
      count: users.filter(
        (u) =>
          u.roleId === r.id ||
          (u.role?.name && u.role.name.toLowerCase() === r.name.toLowerCase())
      ).length,
    })),
  ];

  const filteredUsers = users.filter((u) => {
    const matchesRole =
      selectedRoleFilter === "ALL" ||
      u.roleId === selectedRoleFilter ||
      (u.role?.name &&
        roles.find((r) => r.id === selectedRoleFilter)?.name?.toLowerCase() ===
          u.role.name.toLowerCase());
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const openCreate = () => {
    setEditing(null);
    setName("");
    setEmail("");
    setPassword("");
    setRoleId(roles[0]?.id || "");
    setError("");
    setShowModal(true);
  };

  const openEdit = (u: UserItem) => {
    setEditing(u);
    setName(u.name);
    setEmail(u.email);
    setPassword("");
    setRoleId(u.roleId || roles[0]?.id || "");
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.set("name", name);
    formData.set("email", email);
    formData.set("roleId", roleId);
    if (password) formData.set("password", password);

    const result = editing
      ? await updateUser(editing.id, formData)
      : await createUser(formData);

    if (result.success) {
      setShowModal(false);
      const res = await getUsers(1, 50);
      setUsers(res.data);
      router.refresh();
    } else {
      setError(result.message || "Gagal menyimpan data");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const result = await deleteUser(id);
    if (result.success) {
      toast.success("Pengguna Dihapus", "Akun pengguna berhasil dihapus.");
      setUsers((prev) => prev.filter((u) => u.id !== id));
      const res = await getUsers(1, 50);
      setUsers(res.data);
      router.refresh();
    } else {
      toast.error("Gagal Menghapus", result.message || "Gagal menghapus pengguna.");
    }
  };

  const getRoleBadgeClass = (roleName: string) => {
    const r = roleName.toLowerCase();
    if (r.includes("super")) return "bg-slate-900 text-white border-slate-900";
    if (r.includes("mentor")) return "bg-amber-50 text-amber-900 border-amber-200";
    if (r.includes("admin")) return "bg-blue-50 text-blue-900 border-blue-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <div
      className="space-y-6 font-[var(--font-body)] animate-fade-in"
      suppressHydrationWarning
    >
      {/* Shared Navigation Hub Tabs */}
      <PengaturanTabs />

      {/* Header Banner */}
      <div className="rounded-2xl p-6 bg-white border border-[#D5DDEB] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EAF1FA] text-[#09408C] flex items-center justify-center shadow-2xs shrink-0">
            <Users size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold font-display text-[#0A2650]">
                Manajemen Pengguna
              </h1>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase bg-[#EAF1FA] text-[#09408C] tabular-nums">
                {users.length} Akun
              </span>
            </div>
            <p className="text-xs text-[#5B6882] mt-1">
              Kelola data akun pengguna, hak akses peran (Admin, Staf, Tutor, Siswa & Orang Tua), serta kredensial masuk.
            </p>
          </div>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#09408C] hover:bg-[#0E3571] text-white shadow-xs transition-all self-start sm:self-center cursor-pointer"
        >
          <Plus size={16} />
          <span>Tambah Pengguna</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-2xl p-4 bg-white border border-[#D5DDEB] shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Role Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {dynamicRoleTabs.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setSelectedRoleFilter(item.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                selectedRoleFilter === item.key
                  ? "bg-[#09408C] text-white shadow-2xs"
                  : "bg-[#F4F7FB] text-[#5B6882] hover:bg-[#EAF1FA] hover:text-[#09408C]"
              }`}
            >
              <span>{item.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold tabular-nums ${
                  selectedRoleFilter === item.key
                    ? "bg-white/20 text-white"
                    : "bg-white text-[#09408C]"
                }`}
              >
                {item.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5B6882]" />
          <input
            type="text"
            aria-label="Cari nama atau email pengguna"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau email..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D5DDEB] text-xs text-[#1B2A41] focus:outline-none focus:border-[#09408C] bg-[#F4F7FB]/50"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-[#D5DDEB] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4F7FB] border-b border-[#D5DDEB] text-[#5B6882] font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4">Email Akun</th>
                <th className="py-3 px-4">Role Hak Akses</th>
                <th className="py-3 px-4">Terdaftar</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D5DDEB]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#5B6882] text-xs">
                    Tidak ada akun pengguna ditemukan.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const roleName = u.role?.name || "Peserta (Student)";
                  const initial = u.name ? u.name.charAt(0).toUpperCase() : "U";

                  return (
                    <tr key={u.id} className="hover:bg-[#EAF1FA]/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#09408C] text-white font-bold text-xs shrink-0 ring-2 ring-[#EAF1FA]">
                            {initial}
                          </div>
                          <div>
                            <p className="font-bold text-[#1B2A41] truncate max-w-xs">{u.name}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-[#5B6882] font-mono text-[11px]">
                        {u.email}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getRoleBadgeClass(roleName)}`}>
                          {roleName}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-[#5B6882] tabular-nums text-xs">
                        {formatDate(u.createdAt)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEdit(u)}
                            className="p-1.5 rounded-xl border border-[#D5DDEB] hover:bg-[#EAF1FA] text-[#09408C] transition-colors cursor-pointer"
                            title="Edit Role & Data"
                            aria-label={`Edit pengguna ${u.name}`}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(u.id)}
                            className="p-1.5 rounded-xl border border-[#D5DDEB] hover:bg-[#FBE9E5] hover:border-[#B4381F]/30 text-[#B4381F] transition-colors cursor-pointer"
                            title="Hapus Pengguna"
                            aria-label={`Hapus pengguna ${u.name}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal CRUD User */}
      {showModal && (
        <div role="dialog" aria-modal="true" aria-labelledby="modal-user-title" className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0A2650]/50 backdrop-blur-xs p-4" onClick={() => setShowModal(false)}>
          <div
            className="rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto bg-white border border-[#D5DDEB] shadow-2xl space-y-4 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#D5DDEB] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-[#09408C]" />
                <h2 id="modal-user-title" className="text-base font-bold font-display text-[#0A2650]">
                  {editing ? "Edit Akun Pengguna" : "Tambah Akun Baru"}
                </h2>
              </div>
              <button onClick={() => setShowModal(false)} aria-label="Tutup dialog" className="p-1 rounded-lg hover:bg-[#F4F7FB] text-[#5B6882]">
                <X size={18} />
              </button>
            </div>

            {error && <div className="p-3 rounded-xl text-xs bg-[#FBE9E5] text-[#B4381F] border border-[#B4381F]/20">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label htmlFor="user-name-input" className="text-xs font-semibold text-[#1B2A41] block mb-1">Nama Lengkap</label>
                <input
                  id="user-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama pengguna"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D5DDEB] text-xs text-[#1B2A41] focus:outline-none focus:border-[#09408C] bg-[#F4F7FB]/50"
                />
              </div>

              <div>
                <label htmlFor="user-email-input" className="text-xs font-semibold text-[#1B2A41] block mb-1">Alamat Email</label>
                <input
                  id="user-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@sahabatbelajar.id"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D5DDEB] text-xs text-[#1B2A41] focus:outline-none focus:border-[#09408C] bg-[#F4F7FB]/50"
                />
              </div>

              <div>
                <label htmlFor="user-password-input" className="text-xs font-semibold text-[#1B2A41] block mb-1">
                  {editing ? "Password Baru (Kosongkan jika tidak diubah)" : "Password"}
                </label>
                <input
                  id="user-password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editing ? "••••••••" : "Minimal 6 karakter"}
                  required={!editing}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D5DDEB] text-xs text-[#1B2A41] focus:outline-none focus:border-[#09408C] bg-[#F4F7FB]/50"
                />
              </div>

              <div>
                <label htmlFor="user-role-select" className="text-xs font-semibold text-[#1B2A41] block mb-1">Pilih Role Akses</label>
                <select
                  id="user-role-select"
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D5DDEB] text-xs text-[#1B2A41] focus:outline-none focus:border-[#09408C] bg-white"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#D5DDEB]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#D5DDEB] text-xs font-semibold text-[#5B6882] hover:bg-[#F4F7FB]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#09408C] hover:bg-[#0E3571] text-white shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
