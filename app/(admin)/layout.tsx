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

  // Role Gatekeeping (QA-FUNC-02): Prevent Students from accessing Admin Dashboard
  const userRole = (session.user as any)?.role || "Student";
  const staffRoles = ["Super Admin", "Admin", "Editor", "Tutor", "Mentor", "Reviewer"];
  if (!staffRoles.includes(userRole)) {
    redirect("/belajar");
  }

  const menus = await getAdminMenus();

  return (
    <Providers>
      <AdminLayoutClient menus={menus} sessionUser={session.user}>
        {children}
      </AdminLayoutClient>
    </Providers>
  );
}
