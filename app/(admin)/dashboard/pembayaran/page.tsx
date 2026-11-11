import { Suspense } from "react";
import { getPayments, getStudentPackages } from "@/actions/pembayaran";
import PaymentManagerClient from "@/components/admin/PaymentManagerClient";

export const dynamic = "force-dynamic";

export default async function PembayaranPage() {
  const [payments, studentPackages] = await Promise.all([
    getPayments(),
    getStudentPackages(),
  ]);

  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-[#5B6882]">Memuat manajemen pembayaran...</div>}>
      <PaymentManagerClient
        initialPayments={payments}
        studentPackages={studentPackages}
      />
    </Suspense>
  );
}
