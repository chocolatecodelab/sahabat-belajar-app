import { getPrograms } from "@/actions/program";
import { getStudentPackages } from "@/actions/pembayaran";
import { getStudents } from "@/actions/siswa";
import PackageManagerClient from "@/components/admin/PackageManagerClient";

export const dynamic = "force-dynamic";

export default async function PaketPage() {
  const [programs, studentPackages, studentsRes] = await Promise.all([
    getPrograms(),
    getStudentPackages(),
    getStudents({ perPage: 100 }),
  ]);

  return (
    <PackageManagerClient
      programs={programs}
      studentPackages={studentPackages}
      students={studentsRes.data}
    />
  );
}
