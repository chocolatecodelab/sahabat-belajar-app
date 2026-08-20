import NavigasiClient from "@/components/admin/NavigasiClient";
import { getNavigations } from "@/actions/navigasi";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function NavigasiPage() {
  const [navigations, pagesRes, catRes] = await Promise.all([
    getNavigations(),
    supabaseAdmin
      .from("Page")
      .select("id, title, slug")
      .eq("status", "PUBLISHED")
      .order("title", { ascending: true }),
    supabaseAdmin
      .from("Category")
      .select("id, name, slug")
      .order("name", { ascending: true }),
  ]);

  return (
    <NavigasiClient
      initialNavigations={navigations as any}
      pages={pagesRes.data || []}
      categories={catRes.data || []}
    />
  );
}
