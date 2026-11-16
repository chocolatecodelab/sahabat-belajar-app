"use server";

import { readAuditLogs, logActivity, AuditLogEntry, AuditActionType, AuditEntityType } from "@/lib/audit";
import { requireStaffOrAdmin } from "@/lib/auth";

export async function getAuditLogs(params?: {
  entity?: string;
  action?: string;
  search?: string;
  limit?: number;
}): Promise<AuditLogEntry[]> {
  try {
    await requireStaffOrAdmin();
    let logs = await readAuditLogs();

    if (params?.entity && params.entity !== "ALL") {
      logs = logs.filter((l) => l.entity === params.entity);
    }

    if (params?.action && params.action !== "ALL") {
      logs = logs.filter((l) => l.action === params.action);
    }

    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      logs = logs.filter(
        (l) =>
          l.targetName.toLowerCase().includes(q) ||
          l.details.toLowerCase().includes(q) ||
          l.actorName.toLowerCase().includes(q)
      );
    }

    const limit = params?.limit || 200;
    return logs.slice(0, limit);
  } catch (error) {
    console.error("getAuditLogs error:", error);
    return [];
  }
}
