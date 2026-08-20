import PenggunaClient from "@/components/admin/PenggunaClient";
import { getUsers, getRoles } from "@/actions/pengguna";

export const dynamic = "force-dynamic";

export default async function PenggunaPage() {
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
