import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getStudentPortalData } from "@/actions/portal";
import StudentPortalClient from "@/components/portal/StudentPortalClient";

export const metadata = {
  title: "Portal Siswa & Orang Tua | Sahabat Belajar",
  description: "Pantau jadwal bimbingan, sisa kuota pertemuan, dan evaluasi hasil belajar di Sahabat Belajar.",
};

export default async function StudentPortalPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const res = await getStudentPortalData();

  return <StudentPortalClient initialData={res.success && res.data ? res.data : null} />;
}
