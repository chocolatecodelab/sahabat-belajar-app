import { supabaseAdmin } from "@/lib/supabase";
import HeroSection from "@/components/public/HeroSection";
import StatsSection from "@/components/public/StatsSection";
import LayananSection from "@/components/public/LayananSection";
import AlurBelajarSection from "@/components/public/AlurBelajarSection";
import KeunggulanSection from "@/components/public/KeunggulanSection";
import TestimonialSection from "@/components/public/TestimonialSection";
import BeritaSection from "@/components/public/BeritaSection";
import SosialMediaSection from "@/components/public/SosialMediaSection";
import FaqSection from "@/components/public/FaqSection";
import CtaSection from "@/components/public/CtaSection";
import { getStats, getLearningSteps, getAdvantages, getTestimonials, getFaqs } from "@/actions/tampilan";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let slides: any[] = [];
  let services: any[] = [];
  let settings: any = null;
  let socialMedia: any[] = [];
  let articles: any[] = [];
  let stats: any[] = [];
  let learningSteps: any[] = [];
  let advantages: any[] = [];
  let testimonials: any[] = [];
  let faqs: any[] = [];

  try {
    const [
      slidesRes,
      servicesRes,
      settingsRes,
      socialRes,
      statsData,
      stepsData,
      advantagesData,
      testiData,
      faqsData,
    ] = await Promise.all([
      supabaseAdmin.from("HeroSlide").select("*").eq("isActive", true).order("sortOrder", { ascending: true }),
      supabaseAdmin.from("Service").select("*").eq("isActive", true).order("sortOrder", { ascending: true }),
      supabaseAdmin.from("SiteSettings").select("*").limit(1).maybeSingle(),
      supabaseAdmin.from("SocialMedia").select("*").eq("isActive", true).order("sortOrder", { ascending: true }),
      getStats(),
      getLearningSteps(),
      getAdvantages(),
      getTestimonials(),
      getFaqs(),
    ]);

    slides = slidesRes.data || [];
    services = servicesRes.data || [];
    settings = settingsRes.data;
    socialMedia = socialRes.data || [];
    stats = (statsData || []).filter((s: any) => s.isActive);
    learningSteps = (stepsData || []).filter((s: any) => s.isActive);
    advantages = (advantagesData || []).filter((a: any) => a.isActive);
    testimonials = (testiData || []).filter((t: any) => t.isActive);
    faqs = (faqsData || []).filter((f: any) => f.isActive);

    const newsLimit = settings?.newsPerPage || 6;
    if (settings?.newsEnabled !== false) {
      const { data: artData } = await supabaseAdmin
        .from("Article")
        .select(`
          id,
          title,
          slug,
          excerpt,
          featuredImage,
          publishedAt,
          createdAt,
          author:User(name),
          category:Category(name, slug, color)
        `)
        .eq("status", "PUBLISHED")
        .order("publishedAt", { ascending: false })
        .limit(newsLimit);

      articles = (artData || []).map((a: any) => ({
        ...a,
        author: Array.isArray(a.author) ? a.author[0] : a.author,
        category: Array.isArray(a.category) ? a.category[0] : a.category,
      }));
    }
  } catch (error) {
    console.error("Database connection error in HomePage:", error);
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Banner Section */}
      {settings?.heroEnabled !== false && <HeroSection slides={slides} />}

      {/* 2. Key Stats Counter */}
      <StatsSection stats={stats} />

      {/* 3. Program Kursus & Mentorship */}
      {settings?.serviceEnabled !== false && <LayananSection services={services} />}

      {/* 4. Alur Belajar & Roadmap Bimbingan */}
      <AlurBelajarSection steps={learningSteps} />

      {/* 5. Mengapa Belajar di BIAS RISTEK (Keunggulan) */}
      <KeunggulanSection advantages={advantages} />

      {/* 6. Testimoni & Kisah Sukses Alumni */}
      <TestimonialSection testimonials={testimonials} />

      {/* 7. Artikel & Tips Riset Terbaru */}
      {settings?.newsEnabled !== false && <BeritaSection articles={articles} />}

      {/* 8. Media Sosial & Dokumentasi */}
      {settings?.socialEnabled !== false && <SosialMediaSection socialMedia={socialMedia} />}

      {/* 9. FAQ Interaktif */}
      <FaqSection faqs={faqs} />

      {/* 10. Call-to-Action Banner */}
      <CtaSection contactPhone={settings?.contactPhone} contactEmail={settings?.contactEmail} />
    </div>
  );
}
