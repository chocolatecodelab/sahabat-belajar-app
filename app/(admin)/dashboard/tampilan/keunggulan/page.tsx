import { getAdvantages } from "@/actions/tampilan";
import KeunggulanClient from "@/components/admin/KeunggulanClient";

export const dynamic = "force-dynamic";

export default async function KeunggulanPage() {
  const advantages = await getAdvantages();

  return <KeunggulanClient advantages={advantages} />;
}
