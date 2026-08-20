import LayananClient from "@/components/admin/LayananClient";
import { getServices } from "@/actions/tampilan";

export default async function LayananPage() {
  const services = await getServices();
  return <LayananClient services={services} />;
}
