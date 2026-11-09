import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTutorPortalData } from "@/actions/tutor-portal";
import TutorPortalClient from "@/components/tutor/TutorPortalClient";

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

  const resolvedParams = searchParams ? await searchParams : {};
  const requestedTutorId = resolvedParams.tutorId || "tut_demo_01";

  const res = await getTutorPortalData(requestedTutorId);

  return (
    <TutorPortalClient
      initialData={res.data!}
      currentTutorId={requestedTutorId}
    />
  );
}
