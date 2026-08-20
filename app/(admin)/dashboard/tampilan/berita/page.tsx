import { getSiteSettings } from "@/actions/tampilan";
import TampilanBeritaClient from "@/components/admin/TampilanBeritaClient";

export const dynamic = "force-dynamic";

export default async function TampilanBeritaPage() {
  const settings = await getSiteSettings();

  return <TampilanBeritaClient settings={settings} />;
}
