"use client";

import { useState } from "react";
import Link from "next/link";
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
  FileEdit,
  RotateCcw,
  Trash2,
  Power,
  AlertTriangle,
  X,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import {
  createStudent,
  updateStudent,
  importStudentsFromCsv,
  deleteStudent,
  toggleStudentStatus,
} from "@/actions/siswa";
import { StudentStatus } from "@prisma/client";
import { useToast } from "@/components/ui/Toast";

function getStudentStatusBadge(status: string) {
  switch (status) {
    case "AKTIF":
      return {
        label: "AKTIF",
        bg: "bg-[#E3F4EC] text-[#1F6F4A] border-[#1F6F4A]/25",
        icon: CheckCircle2,
      };
    case "NONAKTIF":
      return {
        label: "NONAKTIF",
        bg: "bg-[#FBE9E5] text-[#B4381F] border-[#B4381F]/25",
        icon: XCircle,
      };
    case "LULUS":
      return {
        label: "LULUS",
        bg: "bg-[#EAF1FA] text-[#09408C] border-[#9AC1E2]",
        icon: GraduationCap,
      };
    case "CUTI":
      return {
        label: "CUTI",
        bg: "bg-[#FEF7E6] text-[#B45309] border-[#F5B82E]",
        icon: AlertCircle,
      };
    default:
      return {
        label: status,
        bg: "bg-[#F4F7FB] text-[#5B6882] border-[#D5DDEB]",
        icon: CheckCircle2,
      };
  }
}

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
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvContent, setCsvContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [level, setLevel] = useState("SMA");
  const [school, setSchool] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [status, setStatus] = useState<StudentStatus>("AKTIF");
  const [notes, setNotes] = useState("");

  const openCreateModal = () => {
    setEditingStudent(null);
    setName("");
    setLevel("SMA");
    setSchool("");
    setParentName("");
    setParentPhone("");
    setStatus("AKTIF");
    setNotes("");
    setShowAddModal(true);
  };

  const openEditModal = (student: any) => {
    setEditingStudent(student);
    setName(student.name || "");
    setLevel(student.level || "SMA");
    setSchool(student.school || "");
    setParentName(student.parentName || "");
    setParentPhone(student.parentPhone || "");
    setStatus(student.status || "AKTIF");
    setNotes(student.notes || "");
    setShowAddModal(true);
  };

  const filteredStudents = students.filter((s) => {
    const matchStatus = statusFilter === "ALL" || s.status === statusFilter;
    const matchLevel = levelFilter === "ALL" || s.level === levelFilter;
    const matchSearch =
      !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.school && s.school.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.parentPhone && s.parentPhone.includes(searchQuery));
    return matchStatus && matchLevel && matchSearch;
  });

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !level) return;
    setIsSubmitting(true);

    if (editingStudent) {
      const res = await updateStudent(editingStudent.id, {
        name,
        level,
        school,
        parentName,
        parentPhone,
        status,
        notes,
      });
      setIsSubmitting(false);

      if (res.success) {
        setStudents((prev) =>
          prev.map((s) =>
            s.id === editingStudent.id
              ? { ...s, name, level, school, parentName, parentPhone, status, notes }
              : s
          )
        );
        setShowAddModal(false);
        setEditingStudent(null);
        toast.success("Data Diperbarui", `Profil siswa ${name} berhasil diperbarui.`);
      } else {
        toast.error("Gagal Memperbarui", res.message);
      }
      return;
    }

    const res = await createStudent({
      name,
      level,
      school,
      parentName,
      parentPhone,
      status,
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
          status,
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
      setStatus("AKTIF");
      setNotes("");
    } else {
      toast.error("Gagal Menambah Siswa", res.message);
    }
  };

  const handleToggleStatus = async (student: any) => {
    const nextStatus: StudentStatus = student.status === "AKTIF" ? "NONAKTIF" : "AKTIF";
    const res = await toggleStudentStatus(student.id, nextStatus);
    if (res.success) {
      setStudents((prev) =>
        prev.map((s) => (s.id === student.id ? { ...s, status: nextStatus } : s))
      );
      toast.success("Status Diperbarui", res.message);
    } else {
      toast.error("Gagal Mengubah Status", res.message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    const res = await deleteStudent(deleteTarget.id);
    setIsSubmitting(false);

    if (res.success) {
      setStudents((prev) =>
        prev
          .map((s) =>
            s.id === deleteTarget.id ? { ...s, status: "NONAKTIF" as StudentStatus } : s
          )
          .filter((s) =>
            res.message?.includes("soft delete") ? true : s.id !== deleteTarget.id
          )
      );
      toast.success("Data Siswa Diproses", res.message);
      setDeleteTarget(null);
    } else {
      toast.error("Gagal Memproses Siswa", res.message);
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
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571] transition-colors shadow-xs"
          >
            <Plus size={14} />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#D5DDEB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Level Filter */}
          <div className="flex flex-wrap items-center gap-1">
            {["ALL", "SD", "SMP", "SMA", "Kuliah", "Umum"].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevelFilter(lvl)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  levelFilter === lvl
                    ? "bg-[#09408C] text-white shadow-2xs"
                    : "bg-[#F4F7FB] text-[#5B6882] hover:bg-[#EAF1FA]"
                }`}
              >
                {lvl === "ALL" ? "Semua Jenjang" : lvl}
              </button>
            ))}
          </div>

          <div className="hidden sm:block h-5 w-[1px] bg-[#D5DDEB]" />

          {/* Status Filter */}
          <div className="flex items-center gap-1">
            {["ALL", "AKTIF", "NONAKTIF"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === st
                    ? "bg-[#09408C] text-white shadow-2xs"
                    : "bg-[#F4F7FB] text-[#5B6882] hover:bg-[#EAF1FA]"
                }`}
              >
                {st === "ALL" ? "Semua Status" : st}
              </button>
            ))}
          </div>
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

      {/* Student List (Mobile Cards sm:hidden + Desktop Table hidden sm:block - UX-RESP-001 & UX-FLOW-001) */}
      <div className="bg-white rounded-2xl border border-[#D5DDEB] shadow-xs overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF1FA] text-[#09408C] flex items-center justify-center mx-auto">
              <GraduationCap size={22} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1B2A41] font-display">
                Data Siswa Tidak Ditemukan
              </h3>
              <p className="text-xs text-[#5B6882] mt-0.5 max-w-sm mx-auto">
                Belum ada data siswa yang cocok dengan filter jenjang atau kata kunci pencarian.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2">
              {(levelFilter !== "ALL" || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setLevelFilter("ALL");
                    setSearchQuery("");
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EAF1FA] text-[#09408C] text-xs font-bold hover:bg-[#9AC1E2]/40 transition-colors"
                >
                  <RotateCcw size={13} />
                  <span>Reset Filter</span>
                </button>
              )}
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#09408C] text-white text-xs font-bold hover:bg-[#0E3571] transition-colors"
              >
                <Plus size={13} />
                <span>Tambah Siswa Baru</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile Card List (DESIGN.md 5.5.1) */}
            <div className="sm:hidden divide-y divide-[#D5DDEB]">
              {filteredStudents.map((student) => {
                const activePkg = student.packages?.[0];
                const remainingQuota = activePkg
                  ? Math.max(0, activePkg.quotaTotal - activePkg.quotaUsed)
                  : 0;
                const statusBadge = getStudentStatusBadge(student.status);
                const StatusIcon = statusBadge.icon;

                return (
                  <div key={student.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-sm text-[#1B2A41]">{student.name}</div>
                        <div className="text-xs text-[#5B6882] mt-0.5">
                          <span className="font-semibold text-[#09408C] bg-[#EAF1FA] px-2 py-0.5 rounded-md mr-1.5">
                            {student.level}
                          </span>
                          <span>{student.school || "Umum"}</span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border shrink-0 ${statusBadge.bg}`}>
                        <StatusIcon size={11} />
                        <span>{statusBadge.label}</span>
                      </span>
                    </div>

                    <div className="bg-[#F4F7FB] p-3 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[#5B6882]">Wali Murid:</span>
                        <span className="font-medium text-[#1B2A41]">
                          {student.parentName || "-"}{" "}
                          {student.parentPhone ? `(${student.parentPhone})` : ""}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#5B6882]">Paket & Sisa Kuota:</span>
                        {activePkg ? (
                          <span
                            className={`font-bold tabular-nums ${
                              remainingQuota <= 2 ? "text-[#B45309]" : "text-[#09408C]"
                            }`}
                          >
                            {activePkg.package.name} ({activePkg.quotaUsed}/{activePkg.quotaTotal})
                          </span>
                        ) : (
                          <span className="italic text-[#B45309] font-medium">
                            Belum ada paket aktif
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(student)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          student.status === "AKTIF"
                            ? "border-[#D5DDEB] bg-white text-[#1F6F4A] hover:bg-[#E3F4EC]"
                            : "border-[#B4381F]/30 bg-[#FBE9E5] text-[#B4381F] hover:bg-[#FBE9E5]/80"
                        }`}
                        title={student.status === "AKTIF" ? "Nonaktifkan siswa" : "Aktifkan siswa"}
                      >
                        <Power size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditModal(student)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#D5DDEB] bg-white text-[#1B2A41] text-xs font-semibold hover:bg-[#EAF1FA] transition-colors"
                      >
                        <FileEdit size={12} />
                        <span>Edit</span>
                      </button>

                      <Link
                        href={`/dashboard/paket?studentId=${student.id}&action=assign`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571] transition-colors shadow-2xs"
                      >
                        <Plus size={12} />
                        <span>{activePkg ? "Perpanjang" : "Paket"}</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => setDeleteTarget(student)}
                        className="p-1.5 rounded-lg border border-[#D5DDEB] bg-white text-[#B4381F] hover:bg-[#FBE9E5] transition-colors"
                        title="Hapus / Nonaktifkan siswa"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F4F7FB] border-b border-[#D5DDEB] text-[#5B6882] font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Nama Siswa</th>
                    <th className="py-3 px-4">Jenjang & Sekolah</th>
                    <th className="py-3 px-4">Orang Tua / Wali</th>
                    <th className="py-3 px-4">Paket & Sisa Pertemuan</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D5DDEB]">
                  {filteredStudents.map((student) => {
                    const activePkg = student.packages?.[0];
                    const remainingQuota = activePkg
                      ? Math.max(0, activePkg.quotaTotal - activePkg.quotaUsed)
                      : 0;
                    const statusBadge = getStudentStatusBadge(student.status);
                    const StatusIcon = statusBadge.icon;

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
                            <span className="text-[11px] text-[#B45309] font-medium italic">
                              Belum ada paket aktif
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusBadge.bg}`}>
                            <StatusIcon size={11} />
                            <span>{statusBadge.label}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(student)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              student.status === "AKTIF"
                                ? "border-[#D5DDEB] bg-white text-[#1F6F4A] hover:bg-[#E3F4EC]"
                                : "border-[#B4381F]/30 bg-[#FBE9E5] text-[#B4381F] hover:bg-[#FBE9E5]/80"
                            }`}
                            title={student.status === "AKTIF" ? "Nonaktifkan siswa" : "Aktifkan siswa"}
                          >
                            <Power size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditModal(student)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#D5DDEB] bg-white text-[#1B2A41] font-semibold hover:bg-[#EAF1FA] hover:text-[#09408C] transition-colors"
                            title="Edit profil & kontak wali siswa"
                          >
                            <FileEdit size={12} />
                            <span>Edit</span>
                          </button>

                          <Link
                            href={`/dashboard/paket?studentId=${student.id}&action=assign`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#09408C] text-white font-semibold hover:bg-[#0E3571] transition-colors shadow-2xs"
                            title="Tetapkan atau perpanjang paket bimbingan"
                          >
                            <Plus size={12} />
                            <span>{activePkg ? "Perpanjang" : "Paket"}</span>
                          </Link>

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(student)}
                            className="p-1.5 rounded-lg border border-[#D5DDEB] bg-white text-[#B4381F] hover:bg-[#FBE9E5] transition-colors"
                            title="Hapus / Nonaktifkan siswa"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal Tambah / Edit Siswa */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="student-modal-title"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setShowAddModal(false);
              setEditingStudent(null);
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
        >
          <form
            onSubmit={handleSaveStudent}
            className="bg-white rounded-2xl p-6 max-w-lg w-full border border-[#D5DDEB] shadow-xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <h3 id="student-modal-title" className="text-lg font-bold text-[#09408C] font-display">
              {editingStudent ? `Edit Profil Siswa: ${editingStudent.name}` : "Tambah Data Siswa Baru"}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label htmlFor="student-name-input" className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Nama Lengkap Siswa <span className="text-[#B4381F] font-semibold">(Wajib)</span>
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
                  Jenjang Pendidikan <span className="text-[#B4381F] font-semibold">(Wajib)</span>
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

              <div>
                <label htmlFor="student-status-select" className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Status Keaktifan
                </label>
                <select
                  id="student-status-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as StudentStatus)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring bg-white font-semibold"
                >
                  <option value="AKTIF">AKTIF (Bimbingan Berjalan)</option>
                  <option value="NONAKTIF">NONAKTIF (Tidak Aktif)</option>
                  <option value="LULUS">LULUS (Selesai Bimbingan)</option>
                  <option value="CUTI">CUTI (Istirahat Sementara)</option>
                </select>
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
                onClick={() => {
                  setShowAddModal(false);
                  setEditingStudent(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-[#5B6882] hover:bg-[#F4F7FB] rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold bg-[#09408C] text-white hover:bg-[#0E3571] rounded-xl transition-colors disabled:opacity-50"
              >
                {isSubmitting
                  ? "Menyimpan..."
                  : editingStudent
                  ? "Simpan Perubahan"
                  : "Simpan Data Siswa"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Impor CSV (PRD B5 & UX-COG-001) */}
      {showCsvModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="csv-import-modal-title"
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowCsvModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
        >
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-[#D5DDEB] shadow-xl space-y-4">
            <h3 id="csv-import-modal-title" className="text-lg font-bold text-[#09408C] font-display">
              Impor Data Siswa Massal (CSV)
            </h3>
            <p className="text-xs text-[#5B6882]">
              Unggah file <code>.csv</code> atau tempelkan teks berformat CSV:
              <br />
              <code className="text-[#09408C] font-semibold">
                Nama, Jenjang, Sekolah, Nama Orang Tua, WhatsApp
              </code>
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2 bg-[#F4F7FB] p-2.5 rounded-xl border border-[#D5DDEB]">
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#D5DDEB] text-[#09408C] text-xs font-semibold hover:bg-[#EAF1FA] transition-colors cursor-pointer">
                <Upload size={13} />
                <span>Pilih File .CSV</span>
                <input
                  type="file"
                  accept=".csv,text/csv,text/plain"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      setCsvContent(String(ev.target?.result || ""));
                    };
                    reader.readAsText(file);
                  }}
                />
              </label>

              <button
                type="button"
                onClick={() =>
                  setCsvContent(
                    "Ahmad Fauzi, SMA, SMAN 1 Kandangan, Pak Hasan, 08123456789\nSiti Rahma, SMP, SMPN 2 Banjarmasin, Ibu Wati, 08529876543"
                  )
                }
                className="text-xs font-semibold text-[#09408C] hover:underline px-2 py-1"
              >
                Isi Contoh Format
              </button>
            </div>

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

      {/* Modal Konfirmasi Hapus / Soft Deactivate (Impact-Aware) */}
      {deleteTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-student-modal-title"
          onKeyDown={(e) => {
            if (e.key === "Escape") setDeleteTarget(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
        >
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-[#D5DDEB] shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-[#FBE9E5] text-[#B4381F] flex items-center justify-center">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3
                    id="delete-student-modal-title"
                    className="text-base font-bold text-[#1B2A41] font-display"
                  >
                    Hapus / Nonaktifkan Siswa
                  </h3>
                  <p className="text-xs text-[#5B6882]">
                    Konfirmasi tindakan terhadap data master siswa
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDeleteTarget(null)}
                className="p-1 rounded-lg text-[#5B6882] hover:bg-[#F4F7FB]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3.5 bg-[#F4F7FB] rounded-xl border border-[#D5DDEB] text-xs space-y-1.5">
              <div className="font-bold text-[#09408C] text-sm">{deleteTarget.name}</div>
              <div className="text-[#5B6882]">
                Jenjang: <span className="font-semibold text-[#1B2A41]">{deleteTarget.level}</span>
                {deleteTarget.school ? ` • ${deleteTarget.school}` : ""}
              </div>
              <div className="text-[#5B6882]">
                Paket Terdaftar:{" "}
                <span className="font-semibold text-[#1B2A41]">
                  {deleteTarget.packages?.length || 0} paket
                </span>
              </div>
            </div>

            {/* Impact-Aware Explanation */}
            {deleteTarget.packages && deleteTarget.packages.length > 0 ? (
              <div className="p-3 bg-[#EAF1FA] border border-[#9AC1E2] rounded-xl text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-[#09408C]">
                  <ShieldCheck size={16} />
                  <span>Proteksi Integritas Data Akademik</span>
                </div>
                <p className="text-[#1B2A41] leading-relaxed">
                  Siswa ini memiliki riwayat{" "}
                  <strong>{deleteTarget.packages.length} paket belajar</strong> atau sesi presensi.
                  Sesuai standar tata kelola data, sistem akan melakukan{" "}
                  <strong>Nonaktifkan Aman (Soft Deactivate)</strong> agar riwayat pembayaran dan nilai
                  siswa tetap terjaga.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-[#FEF7E6] border border-[#F5B82E] rounded-xl text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-[#B45309]">
                  <AlertCircle size={16} />
                  <span>Penghapusan Permanen</span>
                </div>
                <p className="text-[#1B2A41] leading-relaxed">
                  Siswa ini belum memiliki riwayat paket belajar atau sesi bimbingan. Data dapat
                  dihapus secara permanen dari basis data.
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D5DDEB]">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-[#5B6882] hover:bg-[#F4F7FB] rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteConfirm}
                className={`px-4 py-2 text-xs font-semibold text-white rounded-xl transition-colors shadow-xs ${
                  deleteTarget.packages && deleteTarget.packages.length > 0
                    ? "bg-[#09408C] hover:bg-[#0E3571]"
                    : "bg-[#B4381F] hover:bg-[#8F2C18]"
                }`}
              >
                {isSubmitting
                  ? "Memproses..."
                  : deleteTarget.packages && deleteTarget.packages.length > 0
                  ? "Nonaktifkan Aman"
                  : "Hapus Permanen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
