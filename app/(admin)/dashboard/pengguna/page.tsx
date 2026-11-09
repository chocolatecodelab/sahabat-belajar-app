import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth";
import PenggunaClient from "@/components/admin/PenggunaClient";
import { getUsers, getRoles } from "@/actions/pengguna";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Akun Pengguna & Staf | Sahabat Belajar",
  description: "Manajemen akun pengguna dan staf bimbingan belajar Sahabat Belajar",
};

export default async function PenggunaPage() {
  const allowed = await hasPermission("user.read");
  if (!allowed) {
    redirect("/dashboard");
  }

  let users: any[] = [];
  let roles: any[] = [];

  try {
    const [usersRes, rolesRes] = await Promise.all([
      getUsers(1, 50),
      getRoles(),
    ]);
    users = usersRes.data;
    roles = rolesRes;
  } catch (error) {
    console.error("Error in PenggunaPage:", error);
  }

  return <PenggunaClient users={users} roles={roles} />;
}
