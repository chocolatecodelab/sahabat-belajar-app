import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth";
import { getSiteSettings } from "@/actions/tampilan";
import PengaturanClient from "@/components/admin/PengaturanClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pengaturan Umum | Sahabat Belajar",
  description: "Pengaturan identitas dan profil instansi Sahabat Belajar",
};

export default async function PengaturanPage() {
  const allowed = await hasPermission("settings.read");
  if (!allowed) {
    redirect("/dashboard");
  }

  const settings = await getSiteSettings();

  return <PengaturanClient settings={settings} />;
}
