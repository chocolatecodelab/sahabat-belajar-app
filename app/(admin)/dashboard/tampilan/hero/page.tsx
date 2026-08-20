import HeroClient from "@/components/admin/HeroClient";
import { getHeroSlides } from "@/actions/tampilan";

export default async function HeroPage() {
  const slides = await getHeroSlides();
  return <HeroClient slides={slides} />;
}
