import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth";
import { getAdminMenus } from "@/actions/menu";
import AdminMenuClient from "@/components/admin/AdminMenuClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Kelola Menu Sidebar | Sahabat Belajar",
  description: "Pengaturan susunan menu navigasi dan permission guard sidebar dashboard",
};

export default async function AdminMenuPage() {
  const allowed = await hasPermission("menu.read");
  if (!allowed) {
    redirect("/dashboard");
  }

  const menus = await getAdminMenus();

  return <AdminMenuClient menus={menus} />;
}
