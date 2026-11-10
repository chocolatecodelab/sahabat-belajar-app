import { getExamById, getExamSessionResult } from "@/actions/ujian";
import ExamResultClient from "@/components/portal/ExamResultClient";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "Hasil & Pembahasan Ujian (CAT) | Sahabat Belajar",
};

export default async function ExamResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sessionId?: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;
  const { sessionId = "sess_demo" } = await searchParams;

  const [exam, sessionData] = await Promise.all([
    getExamById(id),
    getExamSessionResult(sessionId),
  ]);

  if (!exam) {
    notFound();
  }

  return (
    <ExamResultClient
      exam={exam}
      sessionId={sessionId}
      initialSession={sessionData}
    />
  );
}
