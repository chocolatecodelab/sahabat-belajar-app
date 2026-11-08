import { getExamById } from "@/actions/ujian";
import ExamDetailClient from "@/components/admin/ExamDetailClient";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Kelola Soal & Kisi-Kisi Ujian | Sahabat Belajar",
};

export default async function ExamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const exam = await getExamById(id);

  if (!exam) {
    notFound();
  }

  return <ExamDetailClient exam={exam} />;
}
