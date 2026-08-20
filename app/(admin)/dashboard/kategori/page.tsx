import KategoriClient from "@/components/admin/KategoriClient";
import { getCategories } from "@/actions/kategori";

export const dynamic = "force-dynamic";

export default async function KategoriPage() {
  let categories: any[] = [];
  try {
    categories = await getCategories();
  } catch (error) {
    console.error("Error in KategoriPage:", error);
  }
  return <KategoriClient categories={categories} />;
}
