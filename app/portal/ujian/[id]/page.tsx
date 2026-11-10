import { getExamById } from "@/actions/ujian";
import ExamSimulationClient from "@/components/portal/ExamSimulationClient";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "Simulasi Ujian Online (CAT) | Sahabat Belajar",
};

export default async function PortalExamRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;
  const exam = await getExamById(id);

  if (!exam) {
    notFound();
  }

  return (
    <ExamSimulationClient
      exam={exam}
      studentId={session.user.id}
      studentName={session.user.name || "Siswa"}
    />
  );
}
