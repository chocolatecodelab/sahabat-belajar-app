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
    data: (users || []).map((u: any) => ({
      ...u,
      role: Array.isArray(u.role) ? u.role[0] : u.role,
    })),
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

export async function getRoles() {
  const { data: roles } = await supabaseAdmin
    .from("Role")
    .select(`
      id,
      name,
      description,
      permissions:Permission(id, name),
      users:User(count)
    `)
    .order("name", { ascending: true });

  return (roles || []).map((r: any) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    permissions: r.permissions || [],
    _count: { users: r.users?.[0]?.count || 0 },
  }));
}

export async function getAllPermissions() {
  const { data: perms } = await supabaseAdmin
    .from("Permission")
    .select("*")
    .order("module", { ascending: true })
    .order("action", { ascending: true });
  return perms || [];
}

export async function createRole(formData: FormData): Promise<ActionResponse> {
  await requirePermission("role.create");

  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;

  if (!name) {
    return { success: false, message: "Nama role wajib diisi" };
  }

  const id = `role_${Date.now()}`;
  const { error } = await supabaseAdmin.from("Role").insert({
    id,
    name,
    description,
  });

  if (error) return { success: false, message: error.message };

  revalidatePath("/dashboard/pengguna/role");
  return { success: true, message: "Role berhasil dibuat" };
}

export async function updateRole(
  id: string,
  formData: FormData
): Promise<ActionResponse> {
  await requirePermission("role.update");

  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;

  if (!name) {
    return { success: false, message: "Nama role wajib diisi" };
  }

  const { error } = await supabaseAdmin
    .from("Role")
    .update({ name, description, updatedAt: new Date().toISOString() })
    .eq("id", id);

  if (error) return { success: false, message: error.message };

  revalidatePath("/dashboard/pengguna/role");
  return { success: true, message: "Role berhasil diperbarui" };
}

export async function deleteRole(id: string): Promise<ActionResponse> {
  await requirePermission("role.delete");

  const { data: role } = await supabaseAdmin
    .from("Role")
    .select("name")
    .eq("id", id)
    .single();

  if (role?.name === "Super Admin") {
    return { success: false, message: 'Role "Super Admin" tidak dapat dihapus' };
  }

  const { error } = await supabaseAdmin.from("Role").delete().eq("id", id);
  if (error) return { success: false, message: error.message };

  revalidatePath("/dashboard/pengguna/role");
  return { success: true, message: "Role berhasil dihapus" };
}
