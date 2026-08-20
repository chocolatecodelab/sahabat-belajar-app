import { getLearningSteps } from "@/actions/tampilan";
import AlurBelajarClient from "@/components/admin/AlurBelajarClient";

export const dynamic = "force-dynamic";

export default async function AlurBelajarPage() {
  const steps = await getLearningSteps();

  return <AlurBelajarClient steps={steps} />;
}
