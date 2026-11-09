import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAdminMenus } from "@/actions/menu";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";
import Providers from "@/components/Providers";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Role Gatekeeping: Allow Admin, Staf, and Tutor to access Dashboard
  const userRole = (session.user as any)?.role || "Siswa";
  const staffRoles = ["Super Admin", "Admin", "Staf", "Tutor"];
  if (!staffRoles.includes(userRole)) {
    redirect("/portal");
  }

  const menus = await getAdminMenus();

  return (
    <AdminLayoutClient menus={menus} sessionUser={session.user}>
      {children}
    </AdminLayoutClient>
  );
}
