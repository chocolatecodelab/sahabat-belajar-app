import {
  FileText,
  Newspaper,
  FolderOpen,
  Users,
  Plus,
  ArrowRight,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let pageCount = 0;
  let articleCount = 0;
  let categoryCount = 0;
  let userCount = 0;
  let recentArticles: any[] = [];

  try {
    const [pageRes, articleRes, categoryRes, userRes, recentRes] = await Promise.all([
      supabaseAdmin.from("Page").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("Article").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("Category").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("User").select("*", { count: "exact", head: true }),
      supabaseAdmin
        .from("Article")
        .select(`
          id,
          title,
          slug,
          status,
          viewCount,
          createdAt,
          author:User(name),
          category:Category(name, color)
        `)
        .order("createdAt", { ascending: false })
        .limit(5),
    ]);

    pageCount = pageRes.count || 0;
    articleCount = articleRes.count || 0;
    categoryCount = categoryRes.count || 0;
    userCount = userRes.count || 0;
    recentArticles = (recentRes.data || []).map((a: any) => ({
      ...a,
      author: Array.isArray(a.author) ? a.author[0] : a.author,
      category: Array.isArray(a.category) ? a.category[0] : a.category,
    }));
  } catch (error) {
    console.error("Database connection error in DashboardPage:", error);
  }

  const stats = [
    {
      label: "Total Halaman",
      value: pageCount,
      icon: <FileText size={24} />,
      href: "/dashboard/halaman",
      color: "var(--color-primary)",
    },
    {
      label: "Total Berita",
      value: articleCount,
      icon: <Newspaper size={24} />,
      href: "/dashboard/berita",
      color: "var(--color-primary-container)",
    },
    {
      label: "Kategori",
      value: categoryCount,
      icon: <FolderOpen size={24} />,
      href: "/dashboard/kategori",
      color: "var(--color-secondary)",
    },
    {
      label: "Pengguna",
      value: userCount,
      icon: <Users size={24} />,
      href: "/dashboard/pengguna",
      color: "var(--color-secondary-container)",
    },
  ];

  const quickActions = [
    {
      label: "Buat Berita Baru",
      desc: "Tulis artikel atau publikasi ilmiah",
      href: "/dashboard/berita/buat",
      icon: <Newspaper size={20} />,
    },
    {
      label: "Buat Halaman Baru",
      desc: "Tambah profil, struktur, atau info lab",
      href: "/dashboard/halaman/buat",
      icon: <FileText size={20} />,
    },
    {
      label: "Kelola Hero Banner",
      desc: "Ubah slide dan banner beranda",
      href: "/dashboard/tampilan/hero",
      icon: <Eye size={20} />,
    },
    {
      label: "Kelola Layanan",
      desc: "Perbarui daftar fasilitas & tarif pengujian",
      href: "/dashboard/tampilan/layanan",
      icon: <FolderOpen size={20} />,
    },
  ];

  const statusColors: Record<string, string> = {
    DRAFT: "bg-amber-50 text-amber-700",
    PUBLISHED: "bg-green-50 text-green-700",
    ARCHIVED: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div
        className="rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-container))",
        }}
      >
        <div className="relative z-10 max-w-2xl">
          <span
            className="inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3"
            style={{
              background: "var(--color-secondary-container)",
              color: "var(--color-on-secondary-container)",
            }}
          >
            Panel Administrator
          </span>
          <h1 className="text-display-md font-extrabold mb-2 leading-tight">
            Selamat Datang di BIAS RISTEK CMS
          </h1>
          <p className="text-body-md text-white/80">
            Kelola konten halaman dinamis, publikasi berita riset, layanan pengujian, menu navigasi, dan hak akses pengguna secara terpadu.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="elevation-1 rounded-2xl p-5 transition-all duration-200 hover:elevation-2 hover:-translate-y-0.5 group"
            style={{ background: "var(--color-surface-container-lowest)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                style={{
                  background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
                  color: stat.color,
                }}
              >
                {stat.icon}
              </div>
              <span className="text-body-sm text-gray-400 group-hover:text-blue-900 transition-colors">
                Kelola →
              </span>
            </div>
            <p className="text-body-md text-gray-500 font-medium">{stat.label}</p>
            <p className="text-display-md font-extrabold mt-1" style={{ color: "var(--color-on-surface)" }}>
              {stat.value}
            </p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-headline-md font-bold mb-4" style={{ color: "var(--color-on-surface)" }}>
          Aksi Cepat
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="elevation-1 rounded-2xl p-5 transition-all hover:elevation-2 hover:-translate-y-0.5 flex flex-col justify-between group"
              style={{ background: "var(--color-surface-container-lowest)" }}
            >
              <div>
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                  style={{
                    background: "var(--color-primary-fixed)",
                    color: "var(--color-on-primary-fixed)",
                  }}
                >
                  {action.icon}
                </div>
                <h3 className="font-bold text-body-md group-hover:text-blue-900 transition-colors" style={{ color: "var(--color-on-surface)" }}>
                  {action.label}
                </h3>
                <p className="text-body-sm text-gray-500 mt-1">
                  {action.desc}
                </p>
              </div>
              <div className="flex items-center gap-1 text-body-sm font-semibold text-[var(--color-primary-container)] mt-4">
                <span>Buka</span>
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Articles */}
      <div className="elevation-1 rounded-2xl overflow-hidden" style={{ background: "var(--color-surface-container-lowest)" }}>
        <div className="p-5 sm:p-6 border-b flex items-center justify-between" style={{ borderColor: "var(--color-outline-variant)" }}>
          <div>
            <h2 className="text-headline-md font-bold" style={{ color: "var(--color-on-surface)" }}>
              Berita Terbaru
            </h2>
            <p className="text-body-sm text-gray-500 mt-0.5">5 artikel yang baru saja ditambahkan</p>
          </div>
          <Link
            href="/dashboard/berita/buat"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-label-lg font-semibold text-white shadow-xs"
            style={{ background: "var(--color-primary)" }}
          >
            <Plus size={16} /> Buat Berita
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--color-surface-container)" }}>
                <th className="text-left px-5 py-3 text-label-lg" style={{ color: "var(--color-on-surface-variant)" }}>Judul</th>
                <th className="text-left px-5 py-3 text-label-lg" style={{ color: "var(--color-on-surface-variant)" }}>Kategori</th>
                <th className="text-left px-5 py-3 text-label-lg" style={{ color: "var(--color-on-surface-variant)" }}>Status</th>
                <th className="text-left px-5 py-3 text-label-lg" style={{ color: "var(--color-on-surface-variant)" }}>Penulis</th>
                <th className="text-left px-5 py-3 text-label-lg" style={{ color: "var(--color-on-surface-variant)" }}>Views</th>
                <th className="text-right px-5 py-3 text-label-lg" style={{ color: "var(--color-on-surface-variant)" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {recentArticles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-body-md text-gray-400">
                    Belum ada berita. Klik &quot;Buat Berita&quot; untuk menambahkan.
                  </td>
                </tr>
              ) : (
                recentArticles.map((article: any) => (
                  <tr key={article.id} className="border-t hover:bg-black/[0.02] transition-colors" style={{ borderColor: "var(--color-outline-variant)" }}>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-body-md truncate max-w-xs" style={{ color: "var(--color-on-surface)" }}>
                        {article.title}
                      </p>
                      <span className="text-xs text-gray-400">/{article.slug}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      {article.category ? (
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{
                            background: article.category.color ? `${article.category.color}20` : "var(--color-surface-container)",
                            color: article.category.color || "var(--color-on-surface-variant)",
                          }}
                        >
                          {article.category.name}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[article.status]}`}>
                        {article.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-body-sm text-gray-600">
                      {article.author?.name || "Admin"}
                    </td>
                    <td className="px-5 py-3.5 text-body-sm text-gray-500">
                      {article.viewCount || 0}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/dashboard/berita/${article.id}/edit`}
                        className="text-body-sm font-semibold text-[var(--color-primary-container)] hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
