import { getExamById, getExamSessionResult } from "@/actions/ujian";
import { getStudentPortalData } from "@/actions/portal";
import ExamResultClient from "@/components/portal/ExamResultClient";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "Hasil & Pembahasan Evaluasi | Sahabat Belajar",
};

export default async function ExamResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sessionId?: string; studentId?: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const [{ id }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const sessionId = resolvedSearchParams.sessionId || "sess_demo";
  const requestedStudentId = resolvedSearchParams.studentId;

  const [exam, sessionData, portalRes] = await Promise.all([
    getExamById(id),
    getExamSessionResult(sessionId),
    requestedStudentId ? getStudentPortalData(requestedStudentId) : Promise.resolve(null),
  ]);

  if (!exam) {
    notFound();
  }

  const resolvedStudentId =
    requestedStudentId ||
    sessionData?.studentId ||
    portalRes?.data?.student?.id ||
    undefined;
  const resolvedStudentName =
    sessionData?.studentName ||
    portalRes?.data?.student?.name ||
    session.user.name ||
    undefined;

  return (
    <ExamResultClient
      exam={exam}
      sessionId={sessionId}
      initialSession={sessionData}
      studentId={resolvedStudentId}
      studentName={resolvedStudentName}
    />
  );
}
