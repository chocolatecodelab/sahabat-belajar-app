import { notFound } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import { Calendar, User, ArrowLeft, Newspaper } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage(props: CategoryPageProps) {
  const { slug } = await props.params;

  let category: any = null;
  try {
    const { data: catData } = await supabaseAdmin
      .from("Category")
      .select(`
        id,
        name,
        slug,
        description,
        color,
        articles:Article (
          id,
          title,
          slug,
          excerpt,
          featuredImage,
          publishedAt,
          createdAt,
          author:User(name)
        )
      `)
      .eq("slug", slug)
      .maybeSingle();

    if (catData) {
      category = {
        ...catData,
        articles: (catData.articles || []).map((a: any) => ({
          ...a,
          author: Array.isArray(a.author) ? a.author[0] : a.author,
        })),
      };
    }
  } catch (error) {
    console.error("Database connection error in CategoryPage:", error);
  }

  if (!category) notFound();

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/berita"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-blue-900 transition-colors"
          >
            <ArrowLeft size={16} /> Semua Berita
          </Link>
        </div>

        {/* Category Header */}
        <div className="bg-white rounded-2xl p-8 shadow-xs border border-gray-100 mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-4 h-4 rounded-full" style={{ background: category.color || "var(--color-primary)" }} />
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Kategori Berita</span>
          </div>
          <h1 className="text-display-md font-extrabold text-gray-900">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-body-md text-gray-600 mt-2 max-w-2xl">{category.description}</p>
          )}
          <span className="text-xs text-gray-500 mt-4 block">
            Menampilkan {category.articles.length} artikel
          </span>
        </div>

        {/* Articles Grid */}
        {category.articles.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <Newspaper size={48} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-bold text-gray-700">Belum ada artikel dalam kategori ini</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {category.articles.map((article: any) => {
              const dateToFormat = article.publishedAt || article.createdAt;

              return (
                <article
                  key={article.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-xs border border-gray-100 flex flex-col justify-between hover:shadow-lg transition-all duration-300 group hover:-translate-y-1"
                >
                  <div>
                    <Link href={`/berita/${article.slug}`} className="block relative aspect-[16/9] overflow-hidden bg-gray-100">
                      {article.featuredImage ? (
                        <img
                          src={article.featuredImage}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-900">
                          <Newspaper size={40} className="opacity-30" />
                        </div>
                      )}
                    </Link>

                    <div className="p-6">
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar size={13} />
                          {formatDate(dateToFormat)}
                        </span>
                        <span className="flex items-center gap-1">
                          <User size={13} />
                          {article.author?.name || "Admin"}
                        </span>
                      </div>

                      <h2 className="text-headline-md font-bold line-clamp-2 group-hover:text-blue-900 transition-colors mb-3">
                        <Link href={`/berita/${article.slug}`}>
                          {article.title}
                        </Link>
                      </h2>

                      {article.excerpt && (
                        <p className="text-body-sm text-gray-600 line-clamp-3 leading-relaxed">
                          {article.excerpt}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-2">
                    <Link
                      href={`/berita/${article.slug}`}
                      className="text-sm font-bold transition-colors text-[var(--color-primary-container)] group-hover:underline"
                    >
                      Baca Selengkapnya →
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
