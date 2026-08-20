import { notFound } from "next/navigation";
import PageForm from "@/components/admin/PageForm";
import { getPageById, updatePage } from "@/actions/halaman";

interface EditHalamanPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditHalamanPage(props: EditHalamanPageProps) {
  const { id } = await props.params;
  const page = await getPageById(id);

  if (!page) notFound();

  async function handleUpdate(formData: FormData) {
    "use server";
    return updatePage(id, formData);
  }

  return (
    <div>
      <h1 className="text-headline-lg mb-6" style={{ color: "var(--color-on-surface)" }}>
        Edit Halaman
      </h1>
      <PageForm initialData={page} action={handleUpdate} />
    </div>
  );
}
