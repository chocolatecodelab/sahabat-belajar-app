"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileCheck,
  Plus,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Users,
} from "lucide-react";
import { assignPackageToStudent } from "@/actions/pembayaran";
import { createPackage } from "@/actions/program";
import { useToast } from "@/components/ui/Toast";

export default function PackageManagerClient({
  programs,
  studentPackages,
  students,
}: {
  programs: any[];
  studentPackages: any[];
  students: any[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [stPackages, setStPackages] = useState(studentPackages);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAddPackageModal, setShowAddPackageModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Assign Package states
  const [studentId, setStudentId] = useState(students[0]?.id || "");
  const [packageId, setPackageId] = useState(
    programs[0]?.packages?.[0]?.id || ""
  );

  // Create Package states
  const [progId, setProgId] = useState(programs[0]?.id || "");
  const [packageName, setPackageName] = useState("");
  const [quotaSessions, setQuotaSessions] = useState("10");
  const [sessionMinutes, setSessionMinutes] = useState("90");
  const [price, setPrice] = useState("1500000");

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !packageId) return;
    setIsSubmitting(true);

    const res = await assignPackageToStudent({
      studentId,
      packageId,
    });
    setIsSubmitting(false);

    if (res.success) {
      toast.success("Paket Diaktifkan", res.message);
      setShowAssignModal(false);
      router.refresh();
    } else {
      toast.error("Gagal Menetapkan Paket", res.message);
    }
  };

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageName) return;
    setIsSubmitting(true);

    const res = await createPackage({
      programId: progId,
      name: packageName,
      type: "QUOTA",
      quotaSessions: parseInt(quotaSessions) || 10,
      sessionMinutes: parseInt(sessionMinutes) || 90,
      price: parseInt(price) || 0,
    });
    setIsSubmitting(false);

    if (res.success) {
      toast.success("Paket Dibuat", res.message);
      setShowAddPackageModal(false);
      setPackageName("");
      router.refresh();
    } else {
      toast.error("Gagal Membuat Paket", res.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#09408C] font-display">
            Paket Belajar & Kuota Siswa
          </h1>
          <p className="text-sm text-[#5B6882] mt-0.5">
            Kelola katalog paket bimbingan (durasi standar 90 menit) dan pantau sisa kuota siswa.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddPackageModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#D5DDEB] bg-white text-[#09408C] text-xs font-semibold hover:bg-[#EAF1FA] transition-colors cursor-pointer"
          >
            <Plus size={14} />
            <span>Buat Paket Baru</span>
          </button>
          <button
            onClick={() => setShowAssignModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571] transition-colors shadow-xs"
          >
            <FileCheck size={14} />
            <span>Tetapkan Paket ke Siswa</span>
          </button>
        </div>
      </div>

      {/* Tabel Kuota Siswa */}
      <div className="bg-white rounded-2xl border border-[#D5DDEB] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#D5DDEB] flex items-center justify-between">
          <h2 className="font-bold text-sm text-[#09408C]">
            Monitoring Paket Aktif Siswa
          </h2>
          <span className="text-xs text-[#5B6882]">
            Total {stPackages.length} paket terdaftar
          </span>
        </div>

        {stPackages.length === 0 ? (
          <div className="p-12 text-center text-sm text-[#5B6882]">
            Belum ada paket yang ditetapkan ke siswa.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F7FB] border-b border-[#D5DDEB] text-[#5B6882] font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4">Paket Bimbingan</th>
                  <th className="py-3 px-4">Progress Kuota</th>
                  <th className="py-3 px-4">Sisa Pertemuan</th>
                  <th className="py-3 px-4">Status Paket</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D5DDEB]">
                {stPackages.map((sp) => {
                  const remaining = Math.max(0, sp.quotaTotal - sp.quotaUsed);
                  const isLow = remaining <= 2;

                  return (
                    <tr key={sp.id} className="hover:bg-[#EAF1FA]/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-sm text-[#1B2A41]">
                          {sp.student.name}
                        </div>
                        <div className="text-[11px] text-[#5B6882]">{sp.student.level}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#09408C]">{sp.package.name}</div>
                        <div className="text-[11px] text-[#5B6882]">
                          Durasi {sp.package.sessionMinutes || 90} menit / sesi
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="w-32 h-2.5 bg-[#D5DDEB] rounded-full overflow-hidden">
                          <div
                            className={`h-full ${isLow ? "bg-[#F5B82E]" : "bg-[#09408C]"}`}
                            style={{
                              width: `${Math.min(100, (sp.quotaUsed / sp.quotaTotal) * 100)}%`,
                            }}
                          />
                        </div>
                        <div className="text-[10px] text-[#5B6882] mt-1 tabular-nums">
                          {sp.quotaUsed} dari {sp.quotaTotal} pertemuan terlaksana
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`text-sm font-bold tabular-nums ${
                            isLow ? "text-[#B45309]" : "text-[#09408C]"
                          }`}
                        >
                          {remaining} pertemuan
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            sp.status === "HABIS"
                              ? "bg-[#FBE9E5] text-[#B4381F]"
                              : isLow
                              ? "bg-[#FEF7E6] text-[#B45309] border border-[#F5B82E]"
                              : "bg-[#E3F4EC] text-[#1F6F4A]"
                          }`}
                        >
                          {sp.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tetapkan Paket ke Siswa */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <form
            onSubmit={handleAssign}
            className="bg-white rounded-2xl p-6 max-w-md w-full border border-[#D5DDEB] shadow-xl space-y-4"
          >
            <h3 className="text-lg font-bold text-[#09408C] font-display">
              Tetapkan Paket ke Siswa
            </h3>

            <div>
              <label htmlFor="assign-student-select" className="block text-xs font-bold text-[#1B2A41] mb-1">
                Pilih Siswa *
              </label>
              <select
                id="assign-student-select"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring bg-white"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.level} - {s.school || "Umum"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="assign-package-select" className="block text-xs font-bold text-[#1B2A41] mb-1">
                Pilih Paket Bimbingan *
              </label>
              <select
                id="assign-package-select"
                value={packageId}
                onChange={(e) => setPackageId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring bg-white"
              >
                {programs.flatMap((pr) =>
                  pr.packages.map((pk: any) => (
                    <option key={pk.id} value={pk.id}>
                      {pk.name} — {pk.quotaSessions || 10} Pertemuan (Rp{" "}
                      {pk.price?.toLocaleString("id-ID")})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D5DDEB]">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#5B6882] hover:bg-[#F4F7FB] rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold bg-[#09408C] text-white hover:bg-[#0E3571] rounded-xl transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Menyimpan..." : "Aktifkan Paket"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Tambah Paket Baru */}
      {showAddPackageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreatePackage}
            className="bg-white rounded-2xl p-6 max-w-md w-full border border-[#D5DDEB] shadow-xl space-y-4"
          >
            <h3 className="text-lg font-bold text-[#09408C] font-display">
              Buat Paket Belajar Baru
            </h3>

            <div>
              <label htmlFor="create-prog-select" className="block text-xs font-bold text-[#1B2A41] mb-1">
                Program Terkait *
              </label>
              <select
                id="create-prog-select"
                value={progId}
                onChange={(e) => setProgId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring bg-white"
              >
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="create-package-name" className="block text-xs font-bold text-[#1B2A41] mb-1">
                Nama Paket *
              </label>
              <input
                id="create-package-name"
                type="text"
                required
                placeholder="Contoh: Paket 10 Sesi Privat Kimia"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="create-quota-sessions" className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Jumlah Kuota Sesi *
                </label>
                <input
                  id="create-quota-sessions"
                  type="number"
                  required
                  value={quotaSessions}
                  onChange={(e) => setQuotaSessions(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring"
                />
              </div>

              <div>
                <label htmlFor="create-session-minutes" className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Durasi per Sesi (Menit)
                </label>
                <input
                  id="create-session-minutes"
                  type="number"
                  disabled
                  value={sessionMinutes}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] bg-gray-100 font-semibold text-[#09408C]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="create-package-price" className="block text-xs font-bold text-[#1B2A41] mb-1">
                Biaya Paket (Rp) *
              </label>
              <input
                id="create-package-price"
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D5DDEB]">
              <button
                type="button"
                onClick={() => setShowAddPackageModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#5B6882] hover:bg-[#F4F7FB] rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold bg-[#09408C] text-white hover:bg-[#0E3571] rounded-xl transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Paket"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
