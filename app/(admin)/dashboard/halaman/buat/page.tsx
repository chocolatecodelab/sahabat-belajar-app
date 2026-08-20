import PageForm from "@/components/admin/PageForm";
import { createPage } from "@/actions/halaman";

export default function BuatHalamanPage() {
  return (
    <div>
      <h1 className="text-headline-lg mb-6" style={{ color: "var(--color-on-surface)" }}>
        Buat Halaman Baru
      </h1>
      <PageForm action={createPage} />
    </div>
  );
}
