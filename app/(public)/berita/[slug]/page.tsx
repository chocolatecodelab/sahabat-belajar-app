import { notFound } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import { Calendar, User, Eye, ArrowLeft, Newspaper } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

interface BeritaDetailPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata(props: BeritaDetailPageProps): Promise<Metadata> {
  const { slug } = await props.params;
  try {
    const { data: article } = await supabaseAdmin
      .from("Article")
      .select("title, excerpt, metaTitle, metaDescription, featuredImage")
      .eq("slug", slug)
      .maybeSingle();

    if (!article) return { title: "Berita Tidak Ditemukan" };

    return {
      title: `${article.metaTitle || article.title} — Sahabat Belajar`,
      description: article.metaDescription || article.excerpt || undefined,
      openGraph: {
        title: article.title,
        description: article.excerpt || undefined,
        images: article.featuredImage ? [article.featuredImage] : undefined,
      },
    };
  } catch {
    return { title: "Berita — Sahabat Belajar" };
  }
}

export default async function BeritaDetailPage(props: BeritaDetailPageProps) {
  const { slug } = await props.params;

  let article: any = null;
  let relatedArticles: any[] = [];

  try {
    const { data: rawArticle } = await supabaseAdmin
      .from("Article")
      .select(`
        id,
        title,
        slug,
        content,
        excerpt,
        featuredImage,
        status,
        categoryId,
        publishedAt,
        viewCount,
        createdAt,
        author:User(name),
        category:Category(name, color, slug)
      `)
      .eq("slug", slug)
      .maybeSingle();

    if (rawArticle && rawArticle.status === "PUBLISHED") {
      article = {
        ...rawArticle,
        author: Array.isArray(rawArticle.author) ? rawArticle.author[0] : rawArticle.author,
        category: Array.isArray(rawArticle.category) ? rawArticle.category[0] : rawArticle.category,
      };

      // Increment view count
      await supabaseAdmin
        .from("Article")
        .update({ viewCount: (article.viewCount || 0) + 1 })
        .eq("id", article.id);

      if (article.categoryId) {
        const { data: relData } = await supabaseAdmin
          .from("Article")
          .select("id, title, slug, featuredImage, publishedAt, createdAt")
          .eq("categoryId", article.categoryId)
          .neq("id", article.id)
          .eq("status", "PUBLISHED")
          .order("publishedAt", { ascending: false })
          .limit(3);

        relatedArticles = relData || [];
      }
    }
  } catch (error) {
    console.error("Database connection error in BeritaDetailPage:", error);
  }

  if (!article || article.status !== "PUBLISHED") {
    notFound();
  }

  const dateToFormat = article.publishedAt || article.createdAt;

  return (
    <article className="py-12 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/berita"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-blue-900 transition-colors"
          >
            <ArrowLeft size={16} /> Kembali ke Semua Berita
          </Link>
        </div>

        {/* Category & Title */}
        <div className="space-y-4 mb-8">
          {article.category && (
            <Link
              href={`/berita?kategori=${article.category.slug}`}
              className="inline-block text-xs font-bold px-3 py-1 rounded-full text-white"
              style={{ background: article.category.color || "var(--color-primary)" }}
            >
              {article.category.name}
            </Link>
          )}

          <h1 className="text-display-md sm:text-display-lg font-extrabold text-gray-950 leading-tight">
            {article.title}
          </h1>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 py-3 border-y border-gray-100">
            <span className="flex items-center gap-1.5 font-medium text-gray-700">
              <User size={14} className="text-blue-900" />
              {article.author?.name || "Admin"}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {formatDate(dateToFormat)}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye size={14} />
              {(article.viewCount || 0) + 1} kali dibaca
            </span>
          </div>
        </div>

        {/* Cover Image */}
        {article.featuredImage && (
          <div className="mb-10 rounded-2xl overflow-hidden shadow-md aspect-[16/9] bg-gray-100">
            <img
              src={article.featuredImage}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Article HTML Body rendered from TinyMCE */}
        <div
          className="prose-content max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="pt-10 border-t border-gray-200 mt-12">
            <h3 className="text-headline-md font-bold mb-6 text-gray-900">
              Berita Terkait
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedArticles.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/berita/${rel.slug}`}
                  className="group block space-y-2"
                >
                  <div className="aspect-[16/9] rounded-xl overflow-hidden bg-gray-100 relative">
                    {rel.featuredImage ? (
                      <img
                        src={rel.featuredImage}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-900">
                        <Newspaper size={24} className="opacity-30" />
                      </div>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-blue-900 transition-colors">
                    {rel.title}
                  </h4>
                  <span className="text-xs text-gray-400 block">
                    {formatDate(rel.publishedAt || rel.createdAt)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
