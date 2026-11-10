import Link from "next/link";
import { FileText, Plus, Edit, Search } from "lucide-react";
import { getPages, deletePage } from "@/actions/halaman";
import { revalidatePath } from "next/cache";
import DeleteButton from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

interface HalamanPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HalamanPage(props: HalamanPageProps) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams?.page) || 1;
  const search = (searchParams?.search as string) || "";
  const status = (searchParams?.status as string) || "ALL";

  let result = {
    data: [] as any[],
    meta: { page: 1, perPage: 10, total: 0, totalPages: 0 },
  };

  try {
    result = await getPages(page, 10, search || undefined, status || undefined);
  } catch (error) {
    console.error("Error fetching pages in HalamanPage:", error);
  }

  async function handleDelete(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    await deletePage(id);
    revalidatePath("/dashboard/halaman");
  }

  const statusColors: Record<string, string> = {
    DRAFT: "bg-amber-50 text-amber-700",
    PUBLISHED: "bg-green-50 text-green-700",
    ARCHIVED: "bg-gray-100 text-gray-600",
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-headline-lg flex items-center gap-3" style={{ color: "var(--color-on-surface)" }}>
            <FileText size={28} />
            Halaman
          </h1>
          <p className="text-body-md mt-1" style={{ color: "var(--color-on-surface-variant)" }}>
            Kelola halaman statis website
          </p>
        </div>
        <Link
          href="/dashboard/halaman/buat"
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-label-lg transition-colors"
          style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
        >
          <Plus size={18} />
          Buat Halaman
        </Link>
      </div>

      {/* Filters */}
      <div className="elevation-1 rounded-2xl p-4 mb-6 flex flex-wrap gap-3">
        <form className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-outline)" }} />
            <input
              name="search"
              type="text"
              placeholder="Cari halaman..."
              defaultValue={search}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border text-body-sm focus-ring"
              style={{ borderColor: "var(--color-outline-variant)", background: "var(--color-surface-container-lowest)" }}
            />
          </div>
        </form>
        <div className="flex gap-2">
          {["ALL", "DRAFT", "PUBLISHED", "ARCHIVED"].map((s) => (
            <Link
              key={s}
              href={`/dashboard/halaman?status=${s}${search ? `&search=${search}` : ""}`}
              className={`px-4 py-2.5 rounded-lg text-body-sm font-medium transition-colors ${
                status === s
                  ? "text-white"
                  : "hover:bg-black/5"
              }`}
              style={
                status === s
                  ? { background: "var(--color-primary)", color: "var(--color-on-primary)" }
                  : { color: "var(--color-on-surface-variant)" }
              }
            >
              {s === "ALL" ? "Semua" : s === "DRAFT" ? "Draft" : s === "PUBLISHED" ? "Published" : "Archived"}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#D5DDEB] overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F4F7FB] border-b border-[#D5DDEB] text-[#5B6882] font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="px-4 py-3">Judul Halaman</th>
              <th className="px-4 py-3">Slug URL</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Penulis</th>
              <th className="text-right px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D5DDEB]">
            {result.data.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-[#5B6882] text-xs">
                  Belum ada halaman
                </td>
              </tr>
            ) : (
              result.data.map((pg) => (
                <tr key={pg.id} className="hover:bg-[#EAF1FA]/50 transition-colors">
                  <td className="px-4 py-3.5">
                    <p className="font-bold text-[#1B2A41]">{pg.title}</p>
                  </td>
                  <td className="px-4 py-3.5 text-[#5B6882] font-mono text-[11px]">/{pg.slug}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${statusColors[pg.status]}`}>
                      {pg.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-[#5B6882]">
                    {pg.author.name}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/dashboard/halaman/${pg.id}/edit`}
                        className="p-1.5 rounded-xl border border-[#D5DDEB] hover:bg-[#EAF1FA] text-[#09408C] transition-colors"
                      >
                        <Edit size={14} />
                      </Link>
                      <form action={handleDelete}>
                        <input type="hidden" name="id" value={pg.id} />
                        <DeleteButton confirmMessage="Hapus halaman ini?" />
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {result.meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: "var(--color-outline-variant)" }}>
            <p className="text-body-sm" style={{ color: "var(--color-outline)" }}>
              Menampilkan {(result.meta.page - 1) * result.meta.perPage + 1}-{Math.min(result.meta.page * result.meta.perPage, result.meta.total)} dari {result.meta.total}
            </p>
            <div className="flex gap-1">
              {Array.from({ length: result.meta.totalPages }, (_, i) => (
                <Link
                  key={i + 1}
                  href={`/dashboard/halaman?page=${i + 1}${search ? `&search=${search}` : ""}${status !== "ALL" ? `&status=${status}` : ""}`}
                  className={`px-3 py-1.5 rounded-lg text-body-sm transition-colors ${
                    result.meta.page === i + 1 ? "text-white" : "hover:bg-black/5"
                  }`}
                  style={
                    result.meta.page === i + 1
                      ? { background: "var(--color-primary)" }
                      : { color: "var(--color-on-surface-variant)" }
                  }
                >
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
