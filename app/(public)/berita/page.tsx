import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import { Calendar, User, Search, Newspaper } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface BeritaPublicProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BeritaPublicPage(props: BeritaPublicProps) {
  const searchParams = await props.searchParams;
  const search = (searchParams?.search as string) || "";
  const categorySlug = (searchParams?.kategori as string) || "";

  let articles: any[] = [];
  let categories: any[] = [];

  try {
    let query = supabaseAdmin
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
      .eq("status", "PUBLISHED");

    if (search) {
      query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
    }

    const [articlesRes, categoriesRes] = await Promise.all([
      query.order("publishedAt", { ascending: false }),
      supabaseAdmin
        .from("Category")
        .select(`
          id,
          name,
          slug,
          articles:Article(count)
        `)
        .order("name", { ascending: true }),
    ]);

    let rawArticles = (articlesRes.data || []).map((a: any) => ({
      ...a,
      author: Array.isArray(a.author) ? a.author[0] : a.author,
      category: Array.isArray(a.category) ? a.category[0] : a.category,
    }));

    if (categorySlug) {
      rawArticles = rawArticles.filter((a: any) => a.category?.slug === categorySlug);
    }

    articles = rawArticles;
    categories = (categoriesRes.data || []).map((c: any) => ({
      ...c,
      _count: {
        articles: c.articles?.[0]?.count || 0,
      },
    }));
  } catch (error) {
    console.error("Database connection error in BeritaPublicPage:", error);
  }

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Banner Header */}
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <h1 className="text-display-md font-extrabold text-gray-900">
            Berita & Informasi
          </h1>
          <p className="text-body-md text-gray-600 mt-2">
            Ikuti informasi terkini, publikasi riset, dan agenda ilmiah BIAS RISTEK
          </p>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 mb-10 flex flex-wrap gap-4 items-center justify-between">
          <form className="flex-1 min-w-[240px]">
            <div className="relative">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Cari berita atau artikel..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus-ring bg-gray-50 focus:bg-white transition-all"
              />
            </div>
          </form>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-2">
            <Link
              href="/berita"
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                !categorySlug ? "bg-[var(--color-primary)] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Semua Kategori
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/berita?kategori=${cat.slug}${search ? `&search=${search}` : ""}`}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  categorySlug === cat.slug
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span>{cat.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                  {cat._count.articles}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        {articles.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <Newspaper size={48} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-bold text-gray-700">Tidak ada berita ditemukan</h3>
            <p className="text-sm text-gray-500 mt-1">Coba gunakan kata kunci pencarian lain atau pilih kategori berbeda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => {
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

                      {article.category && (
                        <span
                          className="absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full shadow-sm text-white"
                          style={{
                            background: article.category.color || "var(--color-primary)",
                          }}
                        >
                          {article.category.name}
                        </span>
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
