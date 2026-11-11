import { Suspense } from "react";
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
    <Suspense fallback={<div className="p-8 text-center text-sm text-[#5B6882]">Memuat manajemen paket...</div>}>
      <PackageManagerClient
        programs={programs}
        studentPackages={studentPackages}
        students={studentsRes.data}
      />
    </Suspense>
  );
}
