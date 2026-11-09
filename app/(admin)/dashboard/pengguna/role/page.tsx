import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth";
import RoleClient from "@/components/admin/RoleClient";
import { getRoles, getAllPermissions } from "@/actions/pengguna";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Role & Hak Akses | Sahabat Belajar",
  description: "Pengaturan peran pengguna dan matriks hak akses sistem Sahabat Belajar",
};

export default async function RolePage() {
  const allowed = await hasPermission("role.read");
  if (!allowed) {
    redirect("/dashboard");
  }

  let roles: any[] = [];
  let allPermissions: any[] = [];

  try {
    const results = await Promise.all([
      getRoles(),
      getAllPermissions(),
    ]);
    roles = results[0];
    allPermissions = results[1];
  } catch (error) {
    console.error("Error in RolePage:", error);
  }

  return <RoleClient roles={roles as any} allPermissions={allPermissions} />;
}
