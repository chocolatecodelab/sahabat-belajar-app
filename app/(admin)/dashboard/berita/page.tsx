import Link from "next/link";
import { Newspaper, Plus, Edit, Trash2, Search, Eye } from "lucide-react";
import { getArticles, deleteArticle } from "@/actions/berita";
import { supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

import DeleteButton from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

interface BeritaPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BeritaPage(props: BeritaPageProps) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams?.page) || 1;
  const search = (searchParams?.search as string) || "";
  const status = (searchParams?.status as string) || "ALL";
  const categoryId = (searchParams?.categoryId as string) || "";

  let result = {
    data: [] as any[],
    meta: { page: 1, perPage: 10, total: 0, totalPages: 0 },
  };
  let categories: any[] = [];

  try {
    const [articlesRes, categoriesRes] = await Promise.all([
      getArticles(page, 10, search || undefined, status || undefined, categoryId || undefined),
      supabaseAdmin.from("Category").select("id, name").order("name", { ascending: true }),
    ]);
    result = articlesRes;
    categories = categoriesRes.data || [];
  } catch (error) {
    console.error("Error fetching articles in BeritaPage:", error);
  }

  async function handleDelete(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await deleteArticle(id);
    revalidatePath("/dashboard/berita");
  }

  const statusColors: Record<string, string> = {
    DRAFT: "bg-amber-50 text-amber-700",
    PUBLISHED: "bg-green-50 text-green-700",
    ARCHIVED: "bg-gray-100 text-gray-600",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-headline-lg flex items-center gap-3" style={{ color: "var(--color-on-surface)" }}>
            <Newspaper size={28} /> Berita
          </h1>
          <p className="text-body-md mt-1" style={{ color: "var(--color-on-surface-variant)" }}>Kelola berita dan artikel</p>
        </div>
        <Link href="/dashboard/berita/buat" className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-label-lg transition-colors" style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}>
          <Plus size={18} /> Buat Berita
        </Link>
      </div>

      {/* Filters */}
      <div className="elevation-1 rounded-2xl p-4 mb-6 flex flex-wrap gap-3">
        <form className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-outline)" }} />
            <input name="search" type="text" placeholder="Cari berita..." defaultValue={search} className="w-full pl-10 pr-4 py-2.5 rounded-lg border text-body-sm focus-ring" style={{ borderColor: "var(--color-outline-variant)", background: "var(--color-surface-container-lowest)" }} />
          </div>
        </form>
        <div className="flex gap-2">
          {["ALL", "DRAFT", "PUBLISHED"].map((s) => (
            <Link key={s} href={`/dashboard/berita?status=${s}${search ? `&search=${search}` : ""}${categoryId ? `&categoryId=${categoryId}` : ""}`}
              className={`px-4 py-2.5 rounded-lg text-body-sm font-medium transition-colors ${status === s ? "text-white" : "hover:bg-black/5"}`}
              style={status === s ? { background: "var(--color-primary)", color: "var(--color-on-primary)" } : { color: "var(--color-on-surface-variant)" }}>
              {s === "ALL" ? "Semua" : s === "DRAFT" ? "Draft" : "Published"}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="elevation-1 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ background: "var(--color-surface-container)" }}>
              <th className="text-left px-5 py-3.5 text-label-lg" style={{ color: "var(--color-on-surface-variant)" }}>Cover</th>
              <th className="text-left px-5 py-3.5 text-label-lg" style={{ color: "var(--color-on-surface-variant)" }}>Judul</th>
              <th className="text-left px-5 py-3.5 text-label-lg" style={{ color: "var(--color-on-surface-variant)" }}>Kategori</th>
              <th className="text-left px-5 py-3.5 text-label-lg" style={{ color: "var(--color-on-surface-variant)" }}>Status</th>
              <th className="text-left px-5 py-3.5 text-label-lg" style={{ color: "var(--color-on-surface-variant)" }}>Views</th>
              <th className="text-right px-5 py-3.5 text-label-lg" style={{ color: "var(--color-on-surface-variant)" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {result.data.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-body-md" style={{ color: "var(--color-outline)" }}>Belum ada berita</td></tr>
            ) : (
              result.data.map((article) => (
                <tr key={article.id} className="border-t hover:bg-black/[0.02] transition-colors" style={{ borderColor: "var(--color-outline-variant)" }}>
                  <td className="px-5 py-3">
                    {article.featuredImage ? (
                      <img src={article.featuredImage} alt="" className="w-16 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-16 h-10 rounded-lg flex items-center justify-center" style={{ background: "var(--color-surface-container)" }}>
                        <Newspaper size={16} style={{ color: "var(--color-outline)" }} />
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-body-md font-medium truncate max-w-[250px]" style={{ color: "var(--color-on-surface)" }}>{article.title}</p>
                    <p className="text-label-md mt-0.5" style={{ color: "var(--color-outline)" }}>{article.author?.name || "Admin"}</p>
                  </td>
                  <td className="px-5 py-3">
                    {article.category ? (
                      <span className="text-label-md px-2.5 py-1 rounded-full" style={{ background: article.category.color ? `${article.category.color}20` : "var(--color-surface-container)", color: article.category.color || "var(--color-on-surface-variant)" }}>
                        {article.category.name}
                      </span>
                    ) : (
                      <span className="text-label-md" style={{ color: "var(--color-outline)" }}>—</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-label-md px-2.5 py-1 rounded-full ${statusColors[article.status]}`}>{article.status}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-body-sm flex items-center gap-1" style={{ color: "var(--color-outline)" }}>
                      <Eye size={14} /> {article.viewCount || 0}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/dashboard/berita/${article.id}/edit`} className="p-2 rounded-lg transition-colors hover:bg-black/5" style={{ color: "var(--color-primary-container)" }}>
                        <Edit size={16} />
                      </Link>
                      <form action={handleDelete}>
                        <input type="hidden" name="id" value={article.id} />
                        <DeleteButton confirmMessage="Hapus berita ini?" />
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {result.meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: "var(--color-outline-variant)" }}>
            <p className="text-body-sm" style={{ color: "var(--color-outline)" }}>
              {(result.meta.page - 1) * result.meta.perPage + 1}-{Math.min(result.meta.page * result.meta.perPage, result.meta.total)} dari {result.meta.total}
            </p>
            <div className="flex gap-1">
              {Array.from({ length: result.meta.totalPages }, (_, i) => (
                <Link key={i + 1} href={`/dashboard/berita?page=${i + 1}${search ? `&search=${search}` : ""}${status !== "ALL" ? `&status=${status}` : ""}${categoryId ? `&categoryId=${categoryId}` : ""}`}
                  className={`px-3 py-1.5 rounded-lg text-body-sm transition-colors ${result.meta.page === i + 1 ? "text-white" : "hover:bg-black/5"}`}
                  style={result.meta.page === i + 1 ? { background: "var(--color-primary)" } : { color: "var(--color-on-surface-variant)" }}>
                  {i + 1}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
