import { getExamById } from "@/actions/ujian";
import { getStudentPortalData } from "@/actions/portal";
import ExamSimulationClient from "@/components/portal/ExamSimulationClient";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "Ruang Ujian & Evaluasi Terpadu | Sahabat Belajar",
};

export default async function PortalExamRoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ studentId?: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const [{ id }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams ? searchParams : Promise.resolve({ studentId: undefined }),
  ]);

  const [exam, portalRes] = await Promise.all([
    getExamById(id),
    getStudentPortalData(resolvedSearchParams?.studentId),
  ]);

  if (!exam) {
    notFound();
  }

  const activeStudentId =
    portalRes.success && portalRes.data?.student?.id
      ? portalRes.data.student.id
      : resolvedSearchParams?.studentId || session.user.id;
  const activeStudentName =
    portalRes.success && portalRes.data?.student?.name
      ? portalRes.data.student.name
      : session.user.name || "Siswa";

  return (
    <ExamSimulationClient
      exam={exam}
      studentId={activeStudentId}
      studentName={activeStudentName}
    />
  );
}
