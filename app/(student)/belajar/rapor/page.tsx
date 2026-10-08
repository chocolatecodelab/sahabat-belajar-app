import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getStudentMonthlyReports } from "@/actions/rapor";
import StudentReportsClient from "@/components/student/StudentReportsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "e-Rapor Kemajuan Riset | Ruang Belajar BIAS RISTEK",
  description: "Daftar e-Rapor bulanan dan evaluasi kemajuan bimbingan riset akademik Anda.",
};

export default async function StudentReportsPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/belajar/rapor");
  }

  const reports = await getStudentMonthlyReports(session.user.email);

  return (
    <StudentReportsClient
      reports={reports}
      user={{
        name: session.user.name || "Peserta Riset",
        email: session.user.email,
      }}
    />
  );
}
