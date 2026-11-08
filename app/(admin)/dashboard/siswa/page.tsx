import { getStudents } from "@/actions/siswa";
import StudentManagerClient from "@/components/admin/StudentManagerClient";

export const dynamic = "force-dynamic";

export default async function SiswaPage() {
  const result = await getStudents({ perPage: 50 });

  return <StudentManagerClient initialStudents={result.data} />;
}
