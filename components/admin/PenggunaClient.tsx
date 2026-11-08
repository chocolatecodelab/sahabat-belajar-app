"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, Plus, Edit, Trash2, X, Search, ShieldCheck } from "lucide-react";
import { getUsers, createUser, updateUser, deleteUser } from "@/actions/pengguna";
import { formatDate } from "@/lib/date";

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
    if (!confirm("Hapus akun pengguna ini secara permanen?")) return;
    const result = await deleteUser(id);
    if (result.success) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      const res = await getUsers(1, 50);
      setUsers(res.data);
      router.refresh();
    } else {
      alert(result.message);
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
      {/* Header Banner */}
      <div
        className="elevation-1 rounded-2xl p-6 bg-white border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{
          borderColor: "var(--color-outline-variant)",
          borderTop: "4px solid var(--color-primary)",
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xs"
            style={{
              background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
              color: "var(--color-primary)",
            }}
          >
            <Users size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-display-md font-extrabold font-[var(--font-heading)]" style={{ color: "var(--color-on-surface)" }}>
                Manajemen Pengguna
              </h1>
              <span
                className="text-label-md font-bold px-2.5 py-0.5 rounded-full uppercase"
                style={{
                  background: "var(--color-secondary-container)",
                  color: "var(--color-on-secondary-container)",
                }}
              >
                {users.length} Akun
              </span>
            </div>
            <p className="text-body-sm text-gray-500 mt-1">
              Kelola data akun pengguna, role hak akses (Admin, Mentor, Peserta), dan kredensial login
            </p>
          </div>
        </div>

        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-label-lg font-bold text-white shadow-xs hover:opacity-90 transition-all self-start sm:self-center cursor-pointer"
          style={{ background: "var(--color-primary)" }}
        >
          <Plus size={18} />
          <span>Tambah Pengguna</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div
        className="elevation-1 rounded-2xl p-4 bg-white border flex flex-col md:flex-row items-center justify-between gap-4"
        style={{ borderColor: "var(--color-outline-variant)" }}
      >
        {/* Role Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {dynamicRoleTabs.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setSelectedRoleFilter(item.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                selectedRoleFilter === item.key
                  ? "bg-[#001847] text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>{item.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  selectedRoleFilter === item.key
                    ? "bg-white/20 text-white"
                    : "bg-slate-200/80 text-slate-700"
                }`}
              >
                {item.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau email..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border text-2xs focus-ring bg-white"
            style={{ borderColor: "var(--color-outline-variant)" }}
          />
        </div>
      </div>

      {/* Users Table */}
      <div
        className="elevation-1 rounded-2xl bg-white border overflow-hidden"
        style={{ borderColor: "var(--color-outline-variant)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-body-sm">
            <thead>
              <tr className="border-b text-label-md bg-slate-50/60" style={{ borderColor: "var(--color-outline-variant)", color: "var(--color-on-surface-variant)" }}>
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4">Email Akun</th>
                <th className="py-3 px-4">Role Hak Akses</th>
                <th className="py-3 px-4">Terdaftar</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--color-outline-variant)" }}>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    Tidak ada akun pengguna ditemukan.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const roleName = u.role?.name || "Peserta (Student)";
                  const initial = u.name ? u.name.charAt(0).toUpperCase() : "U";

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                            style={{ background: "var(--color-primary)" }}
                          >
                            {initial}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 truncate max-w-xs">{u.name}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600 text-2xs font-mono">
                        {u.email}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-3xs font-semibold border ${getRoleBadgeClass(roleName)}`}>
                          {roleName}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-500 text-3xs">
                        {formatDate(u.createdAt)}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEdit(u)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
                            title="Edit Role & Data"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(u.id)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-rose-600 transition-colors cursor-pointer"
                            title="Hapus Pengguna"
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4" onClick={() => setShowModal(false)}>
          <div
            className="elevation-3 rounded-2xl p-6 w-full max-w-md bg-white border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-[#001847]" />
                <h2 className="text-headline-sm font-bold text-slate-900">
                  {editing ? "Edit Akun Pengguna" : "Tambah Akun Baru"}
                </h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                <X size={18} />
              </button>
            </div>

            {error && <div className="p-3 rounded-xl text-2xs bg-rose-50 text-rose-700 border border-rose-200">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="text-label-md font-semibold text-slate-700 block mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama pengguna"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-body-sm focus-ring bg-slate-50/50"
                />
              </div>

              <div>
                <label className="text-label-md font-semibold text-slate-700 block mb-1">Alamat Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@biasristek.id"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-body-sm focus-ring bg-slate-50/50"
                />
              </div>

              <div>
                <label className="text-label-md font-semibold text-slate-700 block mb-1">
                  {editing ? "Password Baru (Kosongkan jika tidak diubah)" : "Password"}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editing ? "••••••••" : "Minimal 6 karakter"}
                  required={!editing}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-body-sm focus-ring bg-slate-50/50"
                />
              </div>

              <div>
                <label className="text-label-md font-semibold text-slate-700 block mb-1">Pilih Role Akses</label>
                <select
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-body-sm focus-ring bg-white"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-body-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl text-body-sm font-bold text-white shadow-2xs hover:opacity-95 transition-all disabled:opacity-50 cursor-pointer"
                  style={{ background: "var(--color-primary)" }}
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
