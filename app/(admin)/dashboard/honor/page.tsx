import { getTutorPayouts } from "@/actions/honor";
import { getTutors } from "@/actions/tutor";
import HonorManagerClient from "@/components/admin/HonorManagerClient";

export const dynamic = "force-dynamic";

export default async function HonorPage() {
  const [payouts, tutors] = await Promise.all([
    getTutorPayouts(),
    getTutors(),
  ]);

  return <HonorManagerClient initialPayouts={payouts} tutors={tutors} />;
}
