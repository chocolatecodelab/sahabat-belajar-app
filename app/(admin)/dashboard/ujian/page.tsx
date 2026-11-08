import { getExams } from "@/actions/ujian";
import ExamManagerClient from "@/components/admin/ExamManagerClient";

export const metadata = {
  title: "Bank Soal & Ruang Ujian Online | Sahabat Belajar",
};

export default async function UjianDashboardPage() {
  const exams = await getExams();

  return <ExamManagerClient initialExams={exams} />;
}
