import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDocuments } from "@/actions/dokumen";
import StudentDocumentClient from "@/components/portal/StudentDocumentClient";

export const metadata = {
  title: "Review Draf Esai & Naskah Akademik | Sahabat Belajar",
  description: "Layanan review dan bimbingan esai beasiswa LPDP, AAS, dan draf skripsi/tesis.",
};

export default async function StudentDocumentPortalPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Fallback demo student if generic login
  const studentId = session.user.id || "std_demo_01";
  const studentName = session.user.name || "Ahmad Fauzi";

  const docs = await getDocuments({ studentId });

  return (
    <StudentDocumentClient
      initialDocuments={docs}
      studentId={studentId}
      studentName={studentName}
    />
  );
}
