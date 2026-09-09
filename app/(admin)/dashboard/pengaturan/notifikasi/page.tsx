import { getNotificationSettingsAction, getNotificationLogsAction } from "@/actions/notifikasi";
import NotificationSettingsClient from "@/components/admin/NotificationSettingsClient";

export const dynamic = "force-dynamic";

export default async function NotificationSettingsPage() {
  const [settings, logs] = await Promise.all([
    getNotificationSettingsAction(),
    getNotificationLogsAction({ limit: 50 }),
  ]);

  return <NotificationSettingsClient initialSettings={settings} initialLogs={logs} />;
}
