"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, Plus, Edit, Trash2, X, CheckSquare, Square } from "lucide-react";
import { getRoles, createRole, updateRole, deleteRole } from "@/actions/pengguna";

type PermissionItem = {
  id: string;
  name: string;
  module: string;
  action: string;
};

type RoleItem = {
  id: string;
  name: string;
  description: string | null;
  permissions: { id: string; name: string }[];
  _count: { users: number };
};

interface RoleClientProps {
  roles: RoleItem[];
  allPermissions: PermissionItem[];
}

export default function RoleClient({ roles: initialRoles, allPermissions }: RoleClientProps) {
  const router = useRouter();
  const [roles, setRoles] = useState<RoleItem[]>(initialRoles);
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

  // Group permissions by module
  const modules = Array.from(new Set(allPermissions.map((p) => p.module)));

  const openCreate = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setSelectedPerms([]);
    setError("");
    setShowModal(true);
  };

  const openEdit = (role: RoleItem) => {
    setEditing(role);
    setName(role.name);
    setDescription(role.description || "");
    setSelectedPerms(role.permissions.map((p) => p.id));
    setError("");
    setShowModal(true);
  };

  const togglePermission = (id: string) => {
    setSelectedPerms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleAllInModule = (moduleName: string) => {
    const modPermIds = allPermissions.filter((p) => p.module === moduleName).map((p) => p.id);
    const allSelected = modPermIds.every((id) => selectedPerms.includes(id));
    if (allSelected) {
      setSelectedPerms((prev) => prev.filter((id) => !modPermIds.includes(id)));
    } else {
      setSelectedPerms((prev) => Array.from(new Set([...prev, ...modPermIds])));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.set("name", name);
    formData.set("description", description);
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
      setError(result.message || "Gagal");
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus role ini?")) return;
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-headline-lg flex items-center gap-3" style={{ color: "var(--color-on-surface)" }}>
            <Shield size={28} /> Role & Hak Akses
          </h1>
          <p className="text-body-md mt-1" style={{ color: "var(--color-on-surface-variant)" }}>
            Kelola role pengguna dan hak akses modul (permissions matrix)
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-label-lg transition-colors"
          style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
        >
          <Plus size={18} /> Tambah Role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((role) => (
          <div key={role.id} className="elevation-1 rounded-2xl p-6 border flex flex-col justify-between" style={{ borderColor: "var(--color-outline-variant)" }}>
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: "var(--color-primary-fixed)", color: "var(--color-on-primary-fixed)" }}
                  >
                    <Shield size={20} />
                  </div>
                  <div>
                    <h3 className="text-headline-md font-bold" style={{ color: "var(--color-on-surface)" }}>
                      {role.name}
                    </h3>
                    <span className="text-xs text-gray-500">{role._count.users} pengguna dengan role ini</span>
                  </div>
                </div>
                {role.name === "Super Admin" ? (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-semibold">
                    Sistem Default
                  </span>
                ) : (
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(role)} className="p-2 rounded-lg hover:bg-black/5" style={{ color: "var(--color-primary-container)" }}>
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(role.id)} className="p-2 rounded-lg hover:bg-red-50" style={{ color: "var(--color-error)" }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-body-sm text-gray-600 mb-4">{role.description || "Tidak ada deskripsi"}</p>

              <div className="pt-3 border-t" style={{ borderColor: "var(--color-outline-variant)" }}>
                <span className="text-label-md text-gray-500 block mb-2">Hak Akses ({role.permissions.length} izin):</span>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                  {role.permissions.map((p) => (
                    <span key={p.id} className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-mono">
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal CRUD Role */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" onClick={() => setShowModal(false)}>
          <div className="elevation-2 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ background: "var(--color-surface-container-lowest)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-headline-md" style={{ color: "var(--color-on-surface)" }}>
                {editing ? "Edit Role & Hak Akses" : "Tambah Role Baru"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-black/5"><X size={20} /></button>
            </div>

            {error && <div className="p-3 rounded-lg mb-4 text-body-sm bg-red-50 text-red-700">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-label-lg block mb-1.5" style={{ color: "var(--color-on-surface-variant)" }}>Nama Role</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Content Manager / Penulis"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border text-body-sm focus-ring"
                  style={{ borderColor: "var(--color-outline-variant)" }}
                />
              </div>

              <div>
                <label className="text-label-lg block mb-1.5" style={{ color: "var(--color-on-surface-variant)" }}>Deskripsi</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Jelaskan cakupan wewenang role ini"
                  className="w-full px-4 py-2.5 rounded-lg border text-body-sm focus-ring resize-none"
                  style={{ borderColor: "var(--color-outline-variant)" }}
                />
              </div>

              <div>
                <label className="text-label-lg block mb-2" style={{ color: "var(--color-on-surface-variant)" }}>
                  Matrix Permission (Pilih Izin yang Diizinkan)
                </label>
                <div className="space-y-3 border rounded-xl p-4" style={{ borderColor: "var(--color-outline-variant)" }}>
                  {modules.map((mod) => {
                    const modPerms = allPermissions.filter((p) => p.module === mod);
                    const isAllSelected = modPerms.every((p) => selectedPerms.includes(p.id));

                    return (
                      <div key={mod} className="pb-3 border-b last:border-b-0" style={{ borderColor: "var(--color-outline-variant)" }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-body-sm capitalize text-gray-900">
                            Modul {mod}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleAllInModule(mod)}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            {isAllSelected ? "Batal Semua" : "Pilih Semua"}
                          </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {modPerms.map((perm) => {
                            const checked = selectedPerms.includes(perm.id);
                            return (
                              <button
                                key={perm.id}
                                type="button"
                                onClick={() => togglePermission(perm.id)}
                                className={`flex items-center gap-1.5 p-2 rounded-lg text-xs transition-colors text-left ${
                                  checked ? "bg-blue-50 text-blue-700 font-semibold border border-blue-200" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                }`}
                              >
                                {checked ? <CheckSquare size={14} /> : <Square size={14} />}
                                <span>{perm.action}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
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
