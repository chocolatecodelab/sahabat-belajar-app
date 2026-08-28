import { supabaseAdmin } from "@/lib/supabase";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import AiCounselorWidget from "@/components/public/AiCounselorWidget";

export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let headerNavs: any[] = [];
  let footerNavs: any[] = [];
  let siteSettings: any = null;
  let socialMedia: any[] = [];

  try {
    const [allNavsRes, settingsRes, socialRes] = await Promise.all([
      supabaseAdmin
        .from("Navigation")
        .select(`
          id,
          label,
          type,
          url,
          pageId,
          categoryId,
          parentId,
          sortOrder,
          location,
          isActive,
          openInNewTab,
          page:Page(title, slug),
          category:Category(name, slug)
        `)
        .eq("isActive", true)
        .order("sortOrder", { ascending: true }),
      supabaseAdmin.from("SiteSettings").select("*").limit(1).maybeSingle(),
      supabaseAdmin.from("SocialMedia").select("*").eq("isActive", true).order("sortOrder", { ascending: true }),
    ]);

    const allNavs = (allNavsRes.data || []).map((n: any) => ({
      ...n,
      page: Array.isArray(n.page) ? n.page[0] : n.page,
      category: Array.isArray(n.category) ? n.category[0] : n.category,
    }));

    // Header Navs with children
    headerNavs = allNavs
      .filter((n: any) => n.location === "HEADER" && !n.parentId)
      .map((nav: any) => ({
        ...nav,
        children: allNavs.filter((c: any) => c.parentId === nav.id),
      }));

    // Footer Navs
    footerNavs = allNavs.filter((n: any) => n.location === "FOOTER" && !n.parentId);

    siteSettings = settingsRes.data;
    socialMedia = socialRes.data || [];
  } catch (error) {
    console.error("Database connection error in PublicLayout:", error);
  }

  const defaultSettings = {
    siteName: siteSettings?.siteName || "BIAS RISTEK",
    siteDescription: siteSettings?.siteDescription || "Pusat Unggulan Riset dan Inovasi Teknologi",
    contactEmail: siteSettings?.contactEmail || "labterpadu@ulm.ac.id",
    contactPhone: siteSettings?.contactPhone || "+62-877-7765-9482",
    address: siteSettings?.address || "Jl. Jend. A. Yani Km. 36, Banjarbaru, Kalimantan Selatan 70714",
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar
        siteName={defaultSettings.siteName}
        navigations={headerNavs}
      />
      <main className="flex-1">{children}</main>
      <Footer
        siteSettings={defaultSettings}
        footerNavigations={footerNavs}
        socialMedia={socialMedia}
      />
      <AiCounselorWidget />
    </div>
  );
}
