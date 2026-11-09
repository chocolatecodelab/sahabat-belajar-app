import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getStudentPortalData } from "@/actions/portal";
import { getExams, getStudentExamHistory } from "@/actions/ujian";
import { getLearningMaterials } from "@/actions/materi";
import StudentPortalClient from "@/components/portal/StudentPortalClient";

export const metadata = {
  title: "Portal Siswa & Orang Tua | Sahabat Belajar",
  description: "Pantau jadwal bimbingan, sisa kuota pertemuan, modul belajar digital, dan evaluasi hasil belajar di Sahabat Belajar.",
};

export default async function StudentPortalPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const [portalRes, exams, materials] = await Promise.all([
    getStudentPortalData(),
    getExams(),
    getLearningMaterials(),
  ]);

  const studentId = portalRes.data?.student?.id || "std_demo_01";
  const examHistory = await getStudentExamHistory(studentId);

  return (
    <StudentPortalClient
      initialData={portalRes.success && portalRes.data ? portalRes.data : null}
      availableExams={exams}
      examHistory={examHistory}
      materials={materials}
    />
  );
}
