"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { requirePermission } from "@/lib/auth";
import { hash } from "bcryptjs";
import { z } from "zod";
import type { ActionResponse } from "@/types";

const createUserSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(255),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  roleId: z.string().min(1, "Role wajib dipilih"),
});

const updateUserSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(255),
  email: z.string().email("Email tidak valid"),
  password: z.string().optional(),
  roleId: z.string().min(1, "Role wajib dipilih"),
  avatar: z.string().optional().nullable(),
});

export async function getUsers(
  page: number = 1,
  perPage: number = 10,
  search?: string
) {
  await requirePermission("user.read");

  let query = supabaseAdmin
    .from("User")
    .select(`
      id,
      name,
      email,
      avatar,
      roleId,
      createdAt,
      updatedAt,
      role:Role(name)
    `, { count: "exact" });

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data: users, count, error } = await query
    .order("createdAt", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error getUsers:", error);
    return { data: [], meta: { page, perPage, total: 0, totalPages: 0 } };
  }

  const total = count || 0;
  return {
    data: (users || []).map((u: any) => {
      const roleObj = Array.isArray(u.role) ? u.role[0] : u.role;
      return {
        ...u,
        role: roleObj || { name: "Peserta (Student)" },
      };
    }),
    meta: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    },
  };
}

export async function createUser(formData: FormData): Promise<ActionResponse> {
  await requirePermission("user.create");

  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    roleId: formData.get("roleId") as string,
  };

  const parsed = createUserSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: "Validasi gagal",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { data: existing } = await supabaseAdmin
    .from("User")
    .select("id")
    .eq("email", parsed.data.email)
    .maybeSingle();

  if (existing) {
    return { success: false, message: "Email sudah terdaftar" };
  }

  const hashedPassword = await hash(parsed.data.password, 12);
  const id = `user_${Date.now()}`;

  const { error } = await supabaseAdmin.from("User").insert({
    id,
    name: parsed.data.name,
    email: parsed.data.email,
    password: hashedPassword,
    roleId: parsed.data.roleId,
  });

  if (error) return { success: false, message: error.message };

  revalidatePath("/dashboard/pengguna");
  return { success: true, message: "Pengguna berhasil dibuat" };
}

export async function updateUser(
  id: string,
  formData: FormData
): Promise<ActionResponse> {
  await requirePermission("user.update");

  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: (formData.get("password") as string) || undefined,
    roleId: formData.get("roleId") as string,
    avatar: (formData.get("avatar") as string) || null,
  };

  const parsed = updateUserSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      message: "Validasi gagal",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const updateData: Record<string, any> = {
    name: parsed.data.name,
    email: parsed.data.email,
    roleId: parsed.data.roleId,
    updatedAt: new Date().toISOString(),
  };

  if (parsed.data.avatar !== undefined) {
    updateData.avatar = parsed.data.avatar;
  }

  if (parsed.data.password && parsed.data.password.length >= 6) {
    updateData.password = await hash(parsed.data.password, 12);
  }

  const { error } = await supabaseAdmin
    .from("User")
    .update(updateData)
    .eq("id", id);

  if (error) return { success: false, message: error.message };

  revalidatePath("/dashboard/pengguna");
  return { success: true, message: "Pengguna berhasil diperbarui" };
}

export async function deleteUser(id: string): Promise<ActionResponse> {
  const session = await requirePermission("user.delete");

  if (session.user.id === id) {
    return { success: false, message: "Tidak dapat menghapus akun sendiri" };
  }

  const { error } = await supabaseAdmin.from("User").delete().eq("id", id);
  if (error) return { success: false, message: error.message };

  revalidatePath("/dashboard/pengguna");
  return { success: true, message: "Pengguna berhasil dihapus" };
}

import { syncDatabasePermissions, ALL_SYSTEM_PERMISSIONS, SYSTEM_MODULES } from "@/lib/rbac_registry";

function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Non-HTTP context fallback
  }
}

export async function getRoles() {
  try {
    // Ensure permissions are in sync
    await syncDatabasePermissions();

    // 1. Fetch all roles
    const { data: roles, error: rErr } = await supabaseAdmin
      .from("Role")
      .select("id, name, description, createdAt, updatedAt")
      .order("name", { ascending: true });

    if (rErr || !roles) {
      console.error("getRoles error:", rErr);
      return [];
    }

    // 2. Fetch all permission pivot links
    const { data: pivots } = await supabaseAdmin
      .from("_PermissionToRole")
      .select("A, B");

    // 3. Fetch all permissions catalog
    const { data: perms } = await supabaseAdmin
      .from("Permission")
      .select("id, name, module, action");

    const permMap = new Map((perms || []).map((p: any) => [p.id, p]));

    // 4. Count users per role
    const { data: users } = await supabaseAdmin
      .from("User")
      .select("roleId");

    const userCountMap = new Map<string, number>();
    (users || []).forEach((u: any) => {
      if (u.roleId) {
        userCountMap.set(u.roleId, (userCountMap.get(u.roleId) || 0) + 1);
      }
    });

    return roles.map((role: any) => {
      const rolePermIds = (pivots || []).filter((p: any) => p.B === role.id).map((p: any) => p.A);
      const rolePerms = rolePermIds.map((pId: string) => permMap.get(pId)).filter(Boolean);

      return {
        id: role.id,
        name: role.name,
        description: role.description,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
        permissions: rolePerms,
        _count: { users: userCountMap.get(role.id) || 0 },
      };
    });
  } catch (err) {
    console.error("getRoles fatal error:", err);
    return [];
  }
}

export async function getAllPermissions() {
  try {
    await syncDatabasePermissions();

    const { data: perms } = await supabaseAdmin
      .from("Permission")
      .select("*")
      .order("module", { ascending: true })
      .order("action", { ascending: true });

    const descMap = new Map(ALL_SYSTEM_PERMISSIONS.map((p) => [p.name, { label: p.label, description: p.description }]));

    return (perms || []).map((p: any) => ({
      ...p,
      label: descMap.get(p.name)?.label || p.name,
      description: descMap.get(p.name)?.description || `Izin untuk ${p.action} pada modul ${p.module}`,
    }));
  } catch (err) {
    console.error("getAllPermissions error:", err);
    return ALL_SYSTEM_PERMISSIONS;
  }
}

export async function createRole(formData: FormData): Promise<ActionResponse<{ id: string }>> {
  await requirePermission("role.create");

  try {
    const name = (formData.get("name") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() || null;
    const permissionIds = formData.getAll("permissions") as string[];

    if (!name) {
      return { success: false, message: "Nama role wajib diisi" };
    }

    // Check duplicate name
    const { data: existing } = await supabaseAdmin
      .from("Role")
      .select("id")
      .ilike("name", name)
      .maybeSingle();

    if (existing) {
      return { success: false, message: `Role dengan nama "${name}" sudah ada` };
    }

    const id = `role_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // 1. Insert Role
    const { error: roleErr } = await supabaseAdmin.from("Role").insert({
      id,
      name,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    if (roleErr) throw roleErr;

    // 2. Insert Permissions to Pivot Table
    if (permissionIds.length > 0) {
      const pivots = permissionIds.map((pId) => ({ A: pId, B: id }));
      const { error: pivotErr } = await supabaseAdmin.from("_PermissionToRole").insert(pivots);
      if (pivotErr) {
        console.warn("createRole pivot insert warning:", pivotErr);
      }
    }

    safeRevalidatePath("/dashboard/pengguna/role");
    safeRevalidatePath("/dashboard/pengguna");
    return { success: true, message: `Role "${name}" berhasil dibuat`, data: { id } };
  } catch (err: any) {
    console.error("createRole error:", err);
    return { success: false, message: err?.message || "Gagal membuat role" };
  }
}

export async function updateRole(
  id: string,
  formData: FormData
): Promise<ActionResponse> {
  await requirePermission("role.update");

  try {
    const name = (formData.get("name") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() || null;
    const permissionIds = formData.getAll("permissions") as string[];

    if (!name) {
      return { success: false, message: "Nama role wajib diisi" };
    }

    // 1. Update Role info
    const updatePayload: Record<string, any> = {
      description,
      updatedAt: new Date().toISOString(),
    };

    // Protect Super Admin name renaming
    if (id !== "role_superadmin") {
      updatePayload.name = name;
    }

    const { error: updateErr } = await supabaseAdmin
      .from("Role")
      .update(updatePayload)
      .eq("id", id);

    if (updateErr) throw updateErr;

    // 2. Sync Pivot Permissions (_PermissionToRole)
    // Delete existing links for this role
    await supabaseAdmin.from("_PermissionToRole").delete().eq("B", id);

    // Insert new links
    if (permissionIds.length > 0) {
      const pivots = permissionIds.map((pId) => ({ A: pId, B: id }));
      const { error: pivotErr } = await supabaseAdmin.from("_PermissionToRole").insert(pivots);
      if (pivotErr) {
        console.warn("updateRole pivot insert warning:", pivotErr);
      }
    }

    safeRevalidatePath("/dashboard/pengguna/role");
    safeRevalidatePath("/dashboard/pengguna");
    return { success: true, message: `Hak akses role "${name}" berhasil diperbarui` };
  } catch (err: any) {
    console.error("updateRole error:", err);
    return { success: false, message: err?.message || "Gagal memperbarui role" };
  }
}

export async function deleteRole(id: string): Promise<ActionResponse> {
  await requirePermission("role.delete");

  try {
    // 1. Protect system core roles
    const protectedRoleIds = ["role_superadmin", "role_admin", "role_mentor", "role_student"];
    if (protectedRoleIds.includes(id)) {
      return { success: false, message: "Role sistem utama tidak dapat dihapus" };
    }

    const { data: role } = await supabaseAdmin
      .from("Role")
      .select("name")
      .eq("id", id)
      .maybeSingle();

    if (role?.name === "Super Admin" || role?.name === "Admin") {
      return { success: false, message: `Role "${role?.name}" tidak dapat dihapus` };
    }

    // 2. Check if any user is currently assigned to this role
    const { count } = await supabaseAdmin
      .from("User")
      .select("id", { count: "exact", head: true })
      .eq("roleId", id);

    if (count && count > 0) {
      return {
        success: false,
        message: `Tidak dapat menghapus role ini karena masih digunakan oleh ${count} pengguna`,
      };
    }

    // 3. Clean up pivot table
    await supabaseAdmin.from("_PermissionToRole").delete().eq("B", id);

    // 4. Delete Role record
    const { error: delErr } = await supabaseAdmin.from("Role").delete().eq("id", id);
    if (delErr) throw delErr;

    safeRevalidatePath("/dashboard/pengguna/role");
    safeRevalidatePath("/dashboard/pengguna");
    return { success: true, message: "Role berhasil dihapus permanen" };
  } catch (err: any) {
    console.error("deleteRole error:", err);
    return { success: false, message: err?.message || "Gagal menghapus role" };
  }
}
