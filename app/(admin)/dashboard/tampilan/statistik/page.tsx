import { getStats } from "@/actions/tampilan";
import StatistikClient from "@/components/admin/StatistikClient";

export const dynamic = "force-dynamic";

export default async function StatistikPage() {
  const stats = await getStats();

  return <StatistikClient stats={stats} />;
}
