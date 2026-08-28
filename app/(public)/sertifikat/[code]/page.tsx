import { notFound } from "next/navigation";
import { getCertificateByCode } from "@/actions/sertifikat";
import CertificateVerificationClient from "@/components/public/CertificateVerificationClient";

export const dynamic = "force-dynamic";

interface CertificatePageProps {
  params: Promise<{
    code: string;
  }>;
}

export async function generateMetadata({ params }: CertificatePageProps) {
  const { code } = await params;
  return {
    title: `Verifikasi E-Sertifikat: ${code} | BIAS RISTEK`,
    description: "Halaman resmi verifikasi keabsahan E-Sertifikat pelatihan riset dan publikasi ilmiah BIAS RISTEK.",
  };
}

export default async function CertificatePage({ params }: CertificatePageProps) {
  const { code } = await params;

  const cert = await getCertificateByCode(code);
  if (!cert) {
    notFound();
  }

  return <CertificateVerificationClient cert={cert} />;
}
