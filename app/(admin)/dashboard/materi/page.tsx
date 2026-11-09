import { getLearningMaterials } from "@/actions/materi";
import MaterialManagerClient from "@/components/admin/MaterialManagerClient";

export const metadata = {
  title: "Bank Modul & Materi Belajar Digital | Sahabat Belajar",
};

export default async function LearningMaterialsAdminPage() {
  const materials = await getLearningMaterials();

  return <MaterialManagerClient initialMaterials={materials} />;
}
