import SosialMediaClient from "@/components/admin/SosialMediaClient";
import { getSocialMedia } from "@/actions/tampilan";

export default async function SosialMediaPage() {
  const items = await getSocialMedia();
  return <SosialMediaClient items={items} />;
}
