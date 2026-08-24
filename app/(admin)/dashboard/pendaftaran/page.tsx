import { getAdminRegistrations } from "@/actions/pendaftaran";
import RegistrationManagerClient from "@/components/admin/RegistrationManagerClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pendaftaran & Transaksi Kelas | BIAS RISTEK Admin",
  description: "Pusat verifikasi pembayaran dan manajemen pendaftaran peserta kelas riset",
};

export default async function AdminRegistrationsPage() {
  const initialData = await getAdminRegistrations({ limit: 50 });

  return <RegistrationManagerClient initialData={initialData} />;
}
