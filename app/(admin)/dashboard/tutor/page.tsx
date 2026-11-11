import { getTutors } from "@/actions/tutor";
import TutorManagerClient from "@/components/admin/TutorManagerClient";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function TutorPage() {
  const session = await auth();
  const roleLower = ((session?.user as any)?.role || "").toLowerCase();
  const isAdmin = roleLower.includes("admin") || roleLower.includes("super");
  const isStaff = !isAdmin;
  const tutors = await getTutors({ isStaffViewer: isStaff });

  return <TutorManagerClient initialTutors={tutors} isStaffViewer={isStaff} />;
}
