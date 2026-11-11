import { getSahabatBelajarDashboardData } from "@/actions/dashboard";
import SahabatBelajarDashboard from "@/components/admin/SahabatBelajarDashboard";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [data, session] = await Promise.all([
    getSahabatBelajarDashboardData(),
    auth(),
  ]);

  const roleLower = ((session?.user as any)?.role || "").toLowerCase();
  const isAdmin = roleLower.includes("admin") || roleLower.includes("super");

  return (
    <SahabatBelajarDashboard
      data={data}
      userName={session?.user?.name || "Admin"}
      userRole={(session?.user as any)?.role || (isAdmin ? "Admin" : "Staf")}
      isAdmin={isAdmin}
    />
  );
}
