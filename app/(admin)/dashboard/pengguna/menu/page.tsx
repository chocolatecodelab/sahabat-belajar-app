import { getAdminMenus } from "@/actions/menu";
import AdminMenuClient from "@/components/admin/AdminMenuClient";

export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  const menus = await getAdminMenus();

  return <AdminMenuClient menus={menus} />;
}
