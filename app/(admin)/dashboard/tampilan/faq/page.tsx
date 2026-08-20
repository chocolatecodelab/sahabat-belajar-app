import { getFaqs } from "@/actions/tampilan";
import FaqClient from "@/components/admin/FaqClient";

export const dynamic = "force-dynamic";

export default async function FaqPage() {
  const faqs = await getFaqs();

  return <FaqClient faqs={faqs} />;
}
