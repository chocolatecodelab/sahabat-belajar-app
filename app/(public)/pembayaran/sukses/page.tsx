import { notFound } from "next/navigation";
import { getRegistrationByInvoice } from "@/actions/pendaftaran";
import PaymentSuccessClient from "@/components/public/PaymentSuccessClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Status Pendaftaran & Pembayaran | BIAS RISTEK",
  description: "Informasi tiket invoice dan konfirmasi pendaftaran program kelas riset BIAS RISTEK.",
};

interface PaymentSuccessPageProps {
  searchParams: Promise<{ inv?: string }>;
}

export default async function PaymentSuccessPage({ searchParams }: PaymentSuccessPageProps) {
  const { inv } = await searchParams;

  if (!inv) {
    notFound();
  }

  const registration = await getRegistrationByInvoice(inv);

  if (!registration) {
    notFound();
  }

  return <PaymentSuccessClient registration={registration} />;
}
