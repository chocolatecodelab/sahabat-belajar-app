import { getAdminSubmissions } from "@/actions/tugas";
import SubmissionReviewClient from "@/components/admin/SubmissionReviewClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Review Draf Naskah Riset | Admin Dashboard BIAS RISTEK",
  description: "Panel penilaian dan catatan koreksi naskah ilmiah peserta bimbingan riset.",
};

export default async function AdminSubmissionsPage() {
  const submissions = await getAdminSubmissions();

  return <SubmissionReviewClient initialSubmissions={submissions} />;
}
