import { getLeads } from "@/actions/lead";
import LeadManagerClient from "@/components/admin/LeadManagerClient";

export const dynamic = "force-dynamic";

export default async function LeadPage() {
  const result = await getLeads({ perPage: 50 });

  return <LeadManagerClient initialLeads={result.data} />;
}
