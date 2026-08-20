import { getSiteSettings } from "@/actions/tampilan";
import PengaturanClient from "@/components/admin/PengaturanClient";

export const dynamic = "force-dynamic";

export default async function PengaturanPage() {
  const settings = await getSiteSettings();

  return <PengaturanClient settings={settings} />;
}
