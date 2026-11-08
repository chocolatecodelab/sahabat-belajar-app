import { getSahabatBelajarDashboardData } from "@/actions/dashboard";
import SahabatBelajarDashboard from "@/components/admin/SahabatBelajarDashboard";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [data, session] = await Promise.all([
    getSahabatBelajarDashboardData(),
    auth(),
  ]);

  return (
    <SahabatBelajarDashboard
      data={data}
      userName={session?.user?.name || "Admin"}
    />
  );
}
