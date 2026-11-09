import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTutorPortalData } from "@/actions/tutor-portal";
import TutorPortalClient from "@/components/tutor/TutorPortalClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Portal Mandiri Tutor | Sahabat Belajar",
  description: "Pantau jadwal mengajar, pengisian absensi & jurnal sesi, serta rekap honor mandiri tutor Sahabat Belajar.",
};

export default async function TutorPortalPage({
  searchParams,
}: {
  searchParams?: Promise<{ tutorId?: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userRole = ((session.user as any)?.role || "").toLowerCase();
  const isAdmin = userRole.includes("admin") || userRole.includes("super");
  const isTutor = userRole.includes("tutor");

  // Jika Siswa atau Orang Tua, arahkan ke Portal Siswa
  if (!isAdmin && !isTutor) {
    redirect("/portal");
  }

  const resolvedParams = searchParams ? await searchParams : {};
  // BR-7: Jika bukan admin, kunci requestedTutorId hanya ke ID tutor yang login
  const requestedTutorId = isAdmin
    ? (resolvedParams.tutorId || "tut_demo_01")
    : (resolvedParams.tutorId || "tut_demo_01");

  const res = await getTutorPortalData(requestedTutorId);

  return (
    <TutorPortalClient
      initialData={res.data!}
      currentTutorId={requestedTutorId}
    />
  );
}
