import { getTestimonials } from "@/actions/tampilan";
import TestimoniClient from "@/components/admin/TestimoniClient";

export const dynamic = "force-dynamic";

export default async function TestimoniPage() {
  const testimonials = await getTestimonials();

  return <TestimoniClient testimonials={testimonials} />;
}
