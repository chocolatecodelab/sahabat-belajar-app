import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDocuments } from "@/actions/dokumen";
import { getStudentPortalData } from "@/actions/portal";
import StudentDocumentClient from "@/components/portal/StudentDocumentClient";

export const metadata = {
  title: "Review Draf Esai & Naskah Akademik | Sahabat Belajar",
  description: "Layanan review dan bimbingan esai beasiswa LPDP, AAS, dan draf skripsi/tesis.",
};

export default async function StudentDocumentPortalPage({
  searchParams,
}: {
  searchParams?: Promise<{ studentId?: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const resolvedParams = searchParams ? await searchParams : {};
  const requestedStudentId = resolvedParams.studentId || session.user.id || "student_01";

  const [portalRes, docs] = await Promise.all([
    getStudentPortalData(requestedStudentId),
    getDocuments({ studentId: requestedStudentId }),
  ]);

  const student = portalRes.data?.student;
  const packages = portalRes.data?.packages || [];

  return (
    <StudentDocumentClient
      initialDocuments={docs}
      studentId={student?.id || requestedStudentId}
      studentName={student?.name || session.user.name || "Ahmad Fauzi"}
      studentLevel={student?.level || ""}
      programCategory={packages[0]?.programName || ""}
    />
  );
}
