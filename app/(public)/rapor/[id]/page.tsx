import { notFound } from "next/navigation";
import { getMonthlyReportByNumber } from "@/actions/rapor";
import MonthlyReportViewClient from "@/components/public/MonthlyReportViewClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const report = await getMonthlyReportByNumber(id);

  if (!report) {
    return {
      title: "e-Rapor Tidak Ditemukan | BIAS RISTEK",
      description: "Dokumen rapor kemajuan riset tidak ditemukan dalam sistem validasi.",
    };
  }

  return {
    title: `e-Rapor Kemajuan Riset: ${report.studentName} (${report.reportNumber}) | BIAS RISTEK`,
    description: `Dokumen resmi kemajuan riset dan evaluasi bimbingan akademik periode bulan ${report.periodMonth} ${report.periodYear}.`,
  };
}

export default async function MonthlyReportPage({ params }: Props) {
  const { id } = await params;
  const report = await getMonthlyReportByNumber(id);

  if (!report) {
    notFound();
  }

  return <MonthlyReportViewClient report={report} />;
}
