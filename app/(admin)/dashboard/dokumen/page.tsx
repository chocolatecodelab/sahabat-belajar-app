import { getDocuments } from "@/actions/dokumen";
import DocumentManagerClient from "@/components/admin/DocumentManagerClient";

export const metadata = {
  title: "Review Dokumen & Esai Beasiswa | Sahabat Belajar",
};

export default async function DocumentReviewAdminPage() {
  const documents = await getDocuments();

  return <DocumentManagerClient initialDocuments={documents} />;
}
