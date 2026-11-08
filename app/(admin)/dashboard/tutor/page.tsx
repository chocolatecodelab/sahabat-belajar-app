import { getTutors } from "@/actions/tutor";
import TutorManagerClient from "@/components/admin/TutorManagerClient";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function TutorPage() {
  const session = await auth();
  const isStaff = session?.user?.role === "Staf";
  const tutors = await getTutors({ isStaffViewer: isStaff });

  return <TutorManagerClient initialTutors={tutors} isStaffViewer={isStaff} />;
}
