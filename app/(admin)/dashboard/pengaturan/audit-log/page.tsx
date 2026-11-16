import { getAuditLogs } from "@/actions/audit";
import AuditLogClient from "@/components/admin/AuditLogClient";

export const dynamic = "force-dynamic";

export default async function AuditLogPage() {
  const logs = await getAuditLogs({ limit: 300 });

  return <AuditLogClient initialLogs={logs} />;
}
