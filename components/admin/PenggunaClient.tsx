"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, Plus, Edit, Trash2, X, AlertCircle } from "lucide-react";
import { getUsers, createUser, updateUser, deleteUser } from "@/actions/pengguna";

type UserItem = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  roleId: string;
  role: { name: string };
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
    setRoleId(u.roleId);
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
      const res = await getUsers();
      setUsers(res.data);
      router.refresh();
    } else {
      setError(result.message || "Gagal");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus pengguna ini?")) return;
    const result = await deleteUser(id);
    if (result.success) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      const res = await getUsers();
      setUsers(res.data);
      router.refresh();
    } else {
      alert(result.message);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-headline-lg flex items-center gap-3" style={{ color: "var(--color-on-surface)" }}>
            <Users size={28} /> Pengguna & Administrator
          </h1>
          <p className="text-body-md mt-1" style={{ color: "var(--color-on-surface-variant)" }}>
            Kelola data akun pengguna dan hak akses ke dashboard
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-label-lg transition-colors"
          style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
        >
          <Plus size={18} /> Tambah Pengguna
        </button>
      </div>

      <div className="elevation-1 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ background: "var(--color-surface-container)" }}>
              <th className="text-left px-5 py-3.5 text-label-lg" style={{ color: "var(--color-on-surface-variant)" }}>Nama</th>
              <th className="text-left px-5 py-3.5 text-label-lg" style={{ color: "var(--color-on-surface-variant)" }}>Email</th>
              <th className="text-left px-5 py-3.5 text-label-lg" style={{ color: "var(--color-on-surface-variant)" }}>Role</th>
              <th className="text-left px-5 py-3.5 text-label-lg" style={{ color: "var(--color-on-surface-variant)" }}>Terdaftar</th>
              <th className="text-right px-5 py-3.5 text-label-lg" style={{ color: "var(--color-on-surface-variant)" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t hover:bg-black/[0.02] transition-colors" style={{ borderColor: "var(--color-outline-variant)" }}>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold"
                      style={{ background: "var(--color-primary-fixed)", color: "var(--color-on-primary-fixed)" }}
                    >
                      {u.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="font-medium text-body-md" style={{ color: "var(--color-on-surface)" }}>{u.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-body-sm text-gray-600">{u.email}</td>
                <td className="px-5 py-3.5">
                  <span className="text-label-md px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold">
                    {u.role.name}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-body-sm text-gray-500">
                  {new Date(u.createdAt).toLocaleDateString("id-ID")}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(u)} className="p-2 rounded-lg hover:bg-black/5" style={{ color: "var(--color-primary-container)" }}>
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(u.id)} className="p-2 rounded-lg hover:bg-red-50" style={{ color: "var(--color-error)" }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal CRUD User */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" onClick={() => setShowModal(false)}>
          <div className="elevation-2 rounded-2xl p-6 w-full max-w-md mx-4" style={{ background: "var(--color-surface-container-lowest)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-headline-md" style={{ color: "var(--color-on-surface)" }}>
                {editing ? "Edit Pengguna" : "Tambah Pengguna Baru"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-black/5"><X size={20} /></button>
            </div>

            {error && <div className="p-3 rounded-lg mb-4 text-body-sm bg-red-50 text-red-700">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-label-lg block mb-1.5" style={{ color: "var(--color-on-surface-variant)" }}>Nama Lengkap</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama lengkap"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border text-body-sm focus-ring"
                  style={{ borderColor: "var(--color-outline-variant)" }}
                />
              </div>

              <div>
                <label className="text-label-lg block mb-1.5" style={{ color: "var(--color-on-surface-variant)" }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@biasristek.id"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border text-body-sm focus-ring"
                  style={{ borderColor: "var(--color-outline-variant)" }}
                />
              </div>

              <div>
                <label className="text-label-lg block mb-1.5" style={{ color: "var(--color-on-surface-variant)" }}>
                  {editing ? "Password Baru (Kosongkan jika tidak diubah)" : "Password"}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={editing ? "••••••••" : "Minimal 6 karakter"}
                  required={!editing}
                  className="w-full px-4 py-2.5 rounded-lg border text-body-sm focus-ring"
                  style={{ borderColor: "var(--color-outline-variant)" }}
                />
              </div>

              <div>
                <label className="text-label-lg block mb-1.5" style={{ color: "var(--color-on-surface-variant)" }}>Pilih Role</label>
                <select
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border text-body-sm focus-ring"
                  style={{ borderColor: "var(--color-outline-variant)" }}
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
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
