import ArticleForm from "@/components/admin/ArticleForm";
import { createArticle } from "@/actions/berita";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function BuatBeritaPage() {
  const { data: categories } = await supabaseAdmin
    .from("Category")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div>
      <h1 className="text-headline-lg mb-6" style={{ color: "var(--color-on-surface)" }}>
        Buat Berita Baru
      </h1>
      <ArticleForm categories={categories || []} action={createArticle} />
    </div>
  );
}
