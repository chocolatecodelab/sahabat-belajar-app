import { getPayments, getStudentPackages } from "@/actions/pembayaran";
import PaymentManagerClient from "@/components/admin/PaymentManagerClient";

export const dynamic = "force-dynamic";

export default async function PembayaranPage() {
  const [payments, studentPackages] = await Promise.all([
    getPayments(),
    getStudentPackages(),
  ]);

  return (
    <PaymentManagerClient
      initialPayments={payments}
      studentPackages={studentPackages}
    />
  );
}
