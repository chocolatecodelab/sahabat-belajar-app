import RoleClient from "@/components/admin/RoleClient";
import { getRoles, getAllPermissions } from "@/actions/pengguna";

export const dynamic = "force-dynamic";

export default async function RolePage() {
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
