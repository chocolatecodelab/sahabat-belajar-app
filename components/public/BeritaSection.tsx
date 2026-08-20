import Link from "next/link";
import { Calendar, User, ArrowRight, Newspaper } from "lucide-react";
import { formatDate } from "@/lib/utils";

type ArticleItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featuredImage: string | null;
  publishedAt: Date | string | null;
  createdAt: Date | string;
  author: { name: string };
  category: { name: string; slug: string; color: string | null } | null;
};

export default function BeritaSection({ articles }: { articles: ArticleItem[] }) {
  if (articles.length === 0) return null;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-1 rounded-full" style={{ background: "var(--color-secondary-container)" }} />
              <span
                className="text-label-lg font-bold uppercase tracking-wider"
                style={{ color: "var(--color-primary)" }}
              >
                Kabar Terkini
              </span>
            </div>
            <h2
              className="text-display-md font-extrabold"
              style={{ color: "var(--color-on-surface)" }}
            >
              Berita & Informasi Terbaru
            </h2>
            <p className="text-body-md text-gray-600 mt-2">
              Dapatkan berita terbaru seputar kegiatan riset, publikasi ilmiah, dan agenda inovasi.
            </p>
          </div>

          <Link
            href="/berita"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all border group self-start md:self-auto hover:bg-gray-50"
            style={{
              borderColor: "var(--color-primary)",
              color: "var(--color-primary)",
            }}
          >
            <span>Semua Berita</span>
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Grid Articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => {
            const dateToFormat = article.publishedAt || article.createdAt;

            return (
              <article
                key={article.id}
                className="elevation-1 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:elevation-2 hover:-translate-y-1.5 group bg-white border border-gray-100"
              >
                <div>
                  {/* Cover Image */}
                  <Link href={`/berita/${article.slug}`} className="block relative aspect-[16/9] overflow-hidden bg-gray-100">
                    {article.featuredImage ? (
                      <img
                        src={article.featuredImage}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-900">
                        <Newspaper size={40} className="opacity-40" />
                      </div>
                    )}

                    {/* Category Badge */}
                    {article.category && (
                      <span
                        className="absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full shadow-sm"
                        style={{
                          background: article.category.color || "var(--color-primary)",
                          color: "#ffffff",
                        }}
                      >
                        {article.category.name}
                      </span>
                    )}
                  </Link>

                  {/* Body Content */}
                  <div className="p-6">
                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar size={13} />
                        {formatDate(dateToFormat)}
                      </span>
                      <span className="flex items-center gap-1">
                        <User size={13} />
                        {article.author.name}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-headline-md font-bold line-clamp-2 group-hover:text-blue-900 transition-colors mb-3">
                      <Link href={`/berita/${article.slug}`}>
                        {article.title}
                      </Link>
                    </h3>

                    {/* Excerpt */}
                    {article.excerpt && (
                      <p className="text-body-sm text-gray-600 line-clamp-3 leading-relaxed">
                        {article.excerpt}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Footer Link */}
                <div className="px-6 pb-6 pt-2">
                  <Link
                    href={`/berita/${article.slug}`}
                    className="inline-flex items-center gap-1 text-sm font-bold transition-colors group-hover:text-blue-900"
                    style={{ color: "var(--color-primary-container)" }}
                  >
                    <span>Baca Selengkapnya</span>
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
