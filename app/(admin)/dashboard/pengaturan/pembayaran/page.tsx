import { getPaymentAccounts } from "@/actions/pembayaran";
import PaymentSettingsClient from "@/components/admin/PaymentSettingsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pengaturan Metode Pembayaran | Sahabat Belajar Admin",
  description: "Pengaturan barcode QRIS resmi dan nomor rekening bank untuk checkout paket bimbingan",
};

export default async function AdminPaymentSettingsPage() {
  const accounts = await getPaymentAccounts(false);

  return <PaymentSettingsClient initialAccounts={accounts} />;
}
