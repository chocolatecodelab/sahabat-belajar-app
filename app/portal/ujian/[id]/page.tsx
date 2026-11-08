import { getExamById } from "@/actions/ujian";
import ExamSimulationClient from "@/components/portal/ExamSimulationClient";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Simulasi Ujian Online (CAT) | Sahabat Belajar",
};

export default async function PortalExamRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const exam = await getExamById(id);

  if (!exam) {
    notFound();
  }

  return (
    <ExamSimulationClient
      exam={exam}
      studentId="std_demo_01"
      studentName="Ahmad Fauzi"
    />
  );
}
