import { notFound } from "next/navigation";
import ArticleForm from "@/components/admin/ArticleForm";
import { getArticleById, updateArticle } from "@/actions/berita";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

interface EditBeritaPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBeritaPage(props: EditBeritaPageProps) {
  const { id } = await props.params;

  const [article, catRes] = await Promise.all([
    getArticleById(id),
    supabaseAdmin.from("Category").select("*").order("name", { ascending: true }),
  ]);

  if (!article) notFound();

  async function handleUpdate(formData: FormData) {
    "use server";
    return updateArticle(id, formData);
  }

  return (
    <div>
      <h1 className="text-headline-lg mb-6" style={{ color: "var(--color-on-surface)" }}>
        Edit Berita
      </h1>
      <ArticleForm initialData={article} categories={catRes.data || []} action={handleUpdate} />
    </div>
  );
}
