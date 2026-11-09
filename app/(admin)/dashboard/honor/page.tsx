import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTutorPayouts } from "@/actions/honor";
import { getTutors } from "@/actions/tutor";
import HonorManagerClient from "@/components/admin/HonorManagerClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Rekap Honor Tutor | Sahabat Belajar",
  description: "Manajemen dan rekapitulasi honorarium sesi bimbingan pengajar Sahabat Belajar.",
};

export default async function HonorPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Enforce BR-7: Tarif honor tutor hanya boleh dilihat oleh peran Admin dan Tutor bersangkutan.
  // Staf dilarang melihat tarif honor seluruh pengajar.
  const userRole = ((session.user as any)?.role || "").toLowerCase();
  const isAdmin = userRole.includes("admin") || userRole.includes("super");

  if (!isAdmin) {
    if (userRole.includes("tutor")) {
      redirect("/tutor");
    }
    redirect("/dashboard?error=unauthorized_honor_access");
  }

  const [payouts, tutors] = await Promise.all([
    getTutorPayouts(),
    getTutors({ isStaffViewer: false }),
  ]);

  return <HonorManagerClient initialPayouts={payouts} tutors={tutors} />;
}
