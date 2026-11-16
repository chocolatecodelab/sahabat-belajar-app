import { promises as fs } from "fs";
import path from "path";

export type AuditActionType =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "STATUS_CHANGE"
  | "ASSIGN"
  | "IMPORT";

export type AuditEntityType =
  | "Siswa"
  | "Tutor"
  | "Paket"
  | "Program"
  | "Jadwal"
  | "Pembayaran"
  | "Lead"
  | "FAQ"
  | "Sistem";

export type AuditLogEntry = {
  id: string;
  actorName: string;
  actorRole: string;
  action: AuditActionType;
  entity: AuditEntityType;
  targetId?: string;
  targetName: string;
  details: string;
  timestamp: string;
};

const LOG_FILE = path.join(process.cwd(), "data", "activity_logs.json");

/**
 * Membaca seluruh catatan audit trail
 */
export async function readAuditLogs(): Promise<AuditLogEntry[]> {
  try {
    const raw = await fs.readFile(LOG_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Inisialisasi awal log jika berkas belum ada
    return [];
  }
}

/**
 * Mencatat aktivitas baru ke dalam audit trail log (disimpan hingga 1000 entri terakhir)
 */
export async function logActivity(
  entry: Omit<AuditLogEntry, "id" | "timestamp">
): Promise<void> {
  try {
    const logs = await readAuditLogs();
    const newEntry: AuditLogEntry = {
      id: "log_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toISOString(),
      ...entry,
    };

    const updated = [newEntry, ...logs].slice(0, 1000);
    await fs.mkdir(path.dirname(LOG_FILE), { recursive: true });
    await fs.writeFile(LOG_FILE, JSON.stringify(updated, null, 2), "utf-8");
  } catch (err) {
    console.error("Gagal mencatat audit log:", err);
  }
}
