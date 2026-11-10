"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Plus,
  Search,
  Upload,
  Download,
  Phone,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
} from "lucide-react";
import { createStudent, updateStudent, importStudentsFromCsv } from "@/actions/siswa";
import { StudentStatus } from "@prisma/client";
import { useToast } from "@/components/ui/Toast";

export default function StudentManagerClient({
  initialStudents,
}: {
  initialStudents: any[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [students, setStudents] = useState(initialStudents);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvContent, setCsvContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [level, setLevel] = useState("SMA");
  const [school, setSchool] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [notes, setNotes] = useState("");

  const filteredStudents = students.filter((s) => {
    const matchLevel = levelFilter === "ALL" || s.level === levelFilter;
    const matchSearch =
      !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.school && s.school.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.parentPhone && s.parentPhone.includes(searchQuery));
    return matchLevel && matchSearch;
  });

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !level) return;
    setIsSubmitting(true);

    const res = await createStudent({
      name,
      level,
      school,
      parentName,
      parentPhone,
      notes,
    });
    setIsSubmitting(false);

    if (res.success && res.data) {
      setStudents((prev) => [
        {
          id: res.data!.id,
          name,
          level,
          school,
          parentName,
          parentPhone,
          status: "AKTIF",
          packages: [],
          notes,
          createdAt: new Date(),
        },
        ...prev,
      ]);
      setShowAddModal(false);
      toast.success("Siswa Ditambahkan", `Data siswa ${name} berhasil didaftarkan.`);
      setName("");
      setSchool("");
      setParentName("");
      setParentPhone("");
      setNotes("");
    } else {
      toast.error("Gagal Menambah Siswa", res.message);
    }
  };

  const handleImportCsv = async () => {
    if (!csvContent.trim()) return;
    setIsSubmitting(true);

    // Format: nama, jenjang, sekolah, nama_ortu, no_ortu
    const lines = csvContent.trim().split("\n");
    const rows = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || (i === 0 && line.toLowerCase().includes("nama"))) continue; // skip header
      const parts = line.split(",").map((p) => p.trim());
      if (parts.length >= 2) {
        rows.push({
          name: parts[0],
          level: parts[1],
          school: parts[2] || undefined,
          parentName: parts[3] || undefined,
          parentPhone: parts[4] || undefined,
        });
      }
    }

    const res = await importStudentsFromCsv(rows);
    setIsSubmitting(false);

    if (res.success) {
      toast.success("Impor Berhasil", res.message);
      setShowCsvModal(false);
      setCsvContent("");
      router.refresh();
    } else {
      toast.error("Gagal Impor CSV", res.message);
    }
  };

  const exportToCsv = () => {
    if (students.length === 0) return;
    const header = "Nama Siswa,Jenjang,Sekolah/Kampus,Nama Wali,Kontak Wali,Status,Catatan\n";
    const rows = students
      .map((s) => {
        const name = (s.name || "").replace(/"/g, '""');
        const level = s.level || "";
        const school = (s.school || "").replace(/"/g, '""');
        const parentName = (s.parentName || "").replace(/"/g, '""');
        const parentPhone = s.parentPhone || "";
        const status = s.status || "AKTIF";
        const notes = (s.notes || "").replace(/"/g, '""');
        return `"${name}","${level}","${school}","${parentName}","${parentPhone}","${status}","${notes}"`;
      })
      .join("\n");

    const blob = new Blob(["\uFEFF" + header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `data-master-siswa-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#09408C] font-display">
            Data Master Siswa
          </h1>
          <p className="text-sm text-[#5B6882] mt-0.5">
            Daftar seluruh peserta didik aktif dan rekap sisa kuota pertemuan bimbingan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCsv}
            disabled={students.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#D5DDEB] bg-white text-[#09408C] text-xs font-semibold hover:bg-[#EAF1FA] transition-colors disabled:opacity-50"
          >
            <Download size={14} />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={() => setShowCsvModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#D5DDEB] bg-white text-[#09408C] text-xs font-semibold hover:bg-[#EAF1FA] transition-colors"
          >
            <Upload size={14} />
            <span>Impor CSV</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571] transition-colors shadow-xs"
          >
            <Plus size={14} />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#D5DDEB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {["ALL", "SD", "SMP", "SMA", "Kuliah", "Umum"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(lvl)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                levelFilter === lvl
                  ? "bg-[#09408C] text-white"
                  : "bg-[#F4F7FB] text-[#5B6882] hover:bg-[#EAF1FA]"
              }`}
            >
              {lvl === "ALL" ? "Semua Jenjang" : lvl}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search size={16} className="absolute left-3 top-2.5 text-[#5B6882]" />
          <input
            type="text"
            placeholder="Cari siswa, sekolah, orang tua..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D5DDEB] focus-ring bg-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#D5DDEB] shadow-xs overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-sm text-[#5B6882]">
            Belum ada data siswa yang cocok dengan kriteria pencarian.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F7FB] border-b border-[#D5DDEB] text-[#5B6882] font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4">Jenjang & Sekolah</th>
                  <th className="py-3 px-4">Orang Tua / Wali</th>
                  <th className="py-3 px-4">Paket & Sisa Pertemuan</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D5DDEB]">
                {filteredStudents.map((student) => {
                  const activePkg = student.packages?.[0];
                  const remainingQuota = activePkg
                    ? Math.max(0, activePkg.quotaTotal - activePkg.quotaUsed)
                    : 0;

                  return (
                    <tr key={student.id} className="hover:bg-[#EAF1FA]/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-sm text-[#1B2A41]">{student.name}</div>
                        {student.notes && (
                          <div className="text-[11px] text-[#5B6882] line-clamp-1 mt-0.5">
                            {student.notes}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-[#09408C] bg-[#EAF1FA] px-2 py-0.5 rounded-md">
                          {student.level}
                        </span>
                        <div className="text-[#5B6882] mt-1">{student.school || "-"}</div>
                      </td>

                      <td className="py-3.5 px-4 text-[#5B6882]">
                        <div className="font-medium text-[#1B2A41]">
                          {student.parentName || "-"}
                        </div>
                        {student.parentPhone && (
                          <a
                            href={`https://wa.me/${student.parentPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-[#1F6F4A] hover:underline mt-0.5"
                          >
                            <Phone size={10} />
                            <span>{student.parentPhone}</span>
                          </a>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {activePkg ? (
                          <div>
                            <div className="font-semibold text-[#1B2A41]">
                              {activePkg.package.name}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              {/* Progress bar sisa kuota (Design 5.5) */}
                              <div className="w-24 h-2 bg-[#D5DDEB] rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${
                                    remainingQuota <= 2 ? "bg-[#F5B82E]" : "bg-[#09408C]"
                                  }`}
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      (activePkg.quotaUsed / activePkg.quotaTotal) * 100
                                    )}%`,
                                  }}
                                />
                              </div>
                              <span
                                className={`text-[11px] font-bold tabular-nums ${
                                  remainingQuota <= 2 ? "text-[#B45309]" : "text-[#09408C]"
                                }`}
                              >
                                {activePkg.quotaUsed} / {activePkg.quotaTotal}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#5B6882] italic">
                            Belum ada paket aktif
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E3F4EC] text-[#1F6F4A] border border-[#A3E635]">
                          <CheckCircle2 size={11} />
                          <span>{student.status}</span>
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

      {/* Modal Tambah Siswa */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateStudent}
            className="bg-white rounded-2xl p-6 max-w-lg w-full border border-[#D5DDEB] shadow-xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-lg font-bold text-[#09408C] font-display">
              Tambah Data Siswa Baru
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label htmlFor="student-name-input" className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Nama Lengkap Siswa *
                </label>
                <input
                  id="student-name-input"
                  type="text"
                  required
                  placeholder="Contoh: Aisyah Putri"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring"
                />
              </div>

              <div>
                <label htmlFor="student-level-select" className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Jenjang Pendidikan *
                </label>
                <select
                  id="student-level-select"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring bg-white"
                >
                  <option value="SD">SD (Sekolah Dasar)</option>
                  <option value="SMP">SMP</option>
                  <option value="SMA">SMA</option>
                  <option value="Kuliah">Kuliah (S1/S2)</option>
                  <option value="Umum">Umum / Persiapan Kerja</option>
                </select>
              </div>

              <div>
                <label htmlFor="student-school-input" className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Asal Sekolah / Kampus
                </label>
                <input
                  id="student-school-input"
                  type="text"
                  placeholder="Contoh: SMAN 1 Kandangan"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring"
                />
              </div>

              <div>
                <label htmlFor="student-parent-name" className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Nama Orang Tua / Wali
                </label>
                <input
                  id="student-parent-name"
                  type="text"
                  placeholder="Contoh: Ibu Rina"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring"
                />
              </div>

              <div>
                <label htmlFor="student-parent-phone" className="block text-xs font-bold text-[#1B2A41] mb-1">
                  WhatsApp Orang Tua
                </label>
                <input
                  id="student-parent-phone"
                  type="text"
                  placeholder="Contoh: 08123456789"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="student-notes-input" className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Catatan Khusus / Target Belajar
                </label>
                <textarea
                  id="student-notes-input"
                  rows={2}
                  placeholder="Contoh: Persiapan ujian akhir semester mapel Matematika & Fisika..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D5DDEB]">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#5B6882] hover:bg-[#F4F7FB] rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold bg-[#09408C] text-white hover:bg-[#0E3571] rounded-xl transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Data Siswa"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Impor CSV (PRD B5) */}
      {showCsvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-[#D5DDEB] shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-[#09408C] font-display">
              Impor Data Siswa Massal (CSV)
            </h3>
            <p className="text-xs text-[#5B6882]">
              Tempelkan teks berformat CSV (pisahkan dengan koma):
              <br />
              <code className="text-[#09408C] font-semibold">
                Nama, Jenjang, Sekolah, Nama Orang Tua, WhatsApp
              </code>
            </p>

            <textarea
              rows={6}
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              placeholder="Ahmad Fauzi, SMA, SMAN 1 Kandangan, Pak Hasan, 08123456789&#10;Siti Rahma, SMP, SMPN 2 Banjarmasin, Ibu Wati, 08529876543"
              className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] font-mono focus-ring"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCsvModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#5B6882] hover:bg-[#F4F7FB] rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleImportCsv}
                disabled={isSubmitting || !csvContent.trim()}
                className="px-4 py-2 text-xs font-semibold bg-[#09408C] text-white hover:bg-[#0E3571] rounded-xl transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Mengimpor..." : "Mulai Impor Siswa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
