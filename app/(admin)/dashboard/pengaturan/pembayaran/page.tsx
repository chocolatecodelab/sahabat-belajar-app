import { getPaymentAccounts } from "@/actions/pembayaran";
import PaymentSettingsClient from "@/components/admin/PaymentSettingsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pengaturan Metode Pembayaran | BIAS RISTEK Admin",
  description: "Pengaturan barcode QRIS resmi dan nomor rekening bank untuk checkout kelas",
};

export default async function AdminPaymentSettingsPage() {
  const accounts = await getPaymentAccounts(false);

  return <PaymentSettingsClient initialAccounts={accounts} />;
}
