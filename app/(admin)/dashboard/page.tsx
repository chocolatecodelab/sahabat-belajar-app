import { getDashboardAnalyticsData } from "@/actions/analytics";
import DashboardAnalyticsClient from "@/components/admin/DashboardAnalyticsClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const analyticsData = await getDashboardAnalyticsData("7d");

  return <DashboardAnalyticsClient initialData={analyticsData} />;
}
