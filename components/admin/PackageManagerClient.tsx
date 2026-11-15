"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FileCheck,
  Plus,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Users,
  Edit2,
  Trash2,
  Power,
  XCircle,
  AlertTriangle,
  Layers,
  Search,
  GraduationCap,
  X,
  Tag,
  Check,
  Download,
} from "lucide-react";
import { assignPackageToStudent } from "@/actions/pembayaran";
import {
  createPackage,
  updatePackage,
  deletePackage,
  togglePackageStatus,
  createProgram,
  updateProgram,
  deleteProgram,
  type ProgramItem,
  type PackageItem,
} from "@/actions/program";
import { useToast } from "@/components/ui/Toast";

function getCategoryBadge(category: string) {
  switch (category) {
    case "K12":
      return {
        label: "Bimbel K-12",
        bg: "bg-[#EAF1FA] text-[#09408C] border-[#9AC1E2]",
      };
    case "CPNS_BUMN":
      return {
        label: "CPNS & BUMN",
        bg: "bg-[#FEF7E6] text-[#B45309] border-[#F5B82E]",
      };
    case "S2_S3_BEASISWA":
      return {
        label: "S2/S3 & Beasiswa",
        bg: "bg-[#F3E8FF] text-[#6B21A8] border-[#D8B4FE]",
      };
    case "TOEFL_IELTS":
      return {
        label: "TOEFL / IELTS",
        bg: "bg-[#E0F2FE] text-[#0369A1] border-[#7DD3FC]",
      };
    case "PENULISAN_ILMIAH":
      return {
        label: "Karya Ilmiah",
        bg: "bg-[#ECFDF5] text-[#047857] border-[#6EE7B7]",
      };
    default:
      return {
        label: category,
        bg: "bg-[#F4F7FB] text-[#5B6882] border-[#D5DDEB]",
      };
  }
}

export default function PackageManagerClient({
  programs = [],
  studentPackages = [],
  students = [],
}: {
  programs: any[];
  studentPackages: any[];
  students: any[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  // Navigation Tabs: katalog (default) | monitoring | program
  const [activeTab, setActiveTab] = useState<"katalog" | "monitoring" | "program">("katalog");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  // Modals state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any | null>(null);

  const [showProgramModal, setShowProgramModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState<any | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{
    type: "PACKAGE" | "PROGRAM";
    item: any;
    enrolledCount?: number;
  } | null>(null);

  // Assign Package States
  const [studentId, setStudentId] = useState(students[0]?.id || "");
  const [packageId, setPackageId] = useState(programs[0]?.packages?.[0]?.id || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Package Form States
  const [pkgProgramId, setPkgProgramId] = useState(programs[0]?.id || "");
  const [pkgName, setPkgName] = useState("");
  const [pkgQuotaSessions, setPkgQuotaSessions] = useState("10");
  const [pkgSessionMinutes] = useState("90"); // BR-5 default 90 menit
  const [pkgPrice, setPkgPrice] = useState("1500000");
  const [pkgIsActive, setPkgIsActive] = useState(true);

  // Program Form States
  const [prName, setPrName] = useState("");
  const [prCategory, setPrCategory] = useState("K12");
  const [prDescription, setPrDescription] = useState("");
  const [prSortOrder, setPrSortOrder] = useState("0");
  const [prIsActive, setPrIsActive] = useState(true);

  // URL Query Sync
  useEffect(() => {
    const paramStudentId = searchParams.get("studentId");
    const paramAction = searchParams.get("action");
    const paramTab = searchParams.get("tab");

    if (paramTab === "monitoring" || paramTab === "program" || paramTab === "katalog") {
      setActiveTab(paramTab);
    }
    if (paramStudentId) {
      const matched = students.find((s) => s.id === paramStudentId);
      if (matched) {
        setStudentId(matched.id);
      } else {
        setStudentId("");
      }
    }
    if (paramAction === "assign" || paramStudentId) {
      setShowAssignModal(true);
    }
  }, [searchParams, students]);

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowAssignModal(false);
        setShowPackageModal(false);
        setShowProgramModal(false);
        setDeleteTarget(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Total Statistics
  const totalPackages = programs.reduce((acc, p) => acc + (p.packages || []).length, 0);
  const activePackages = programs.reduce(
    (acc, p) => acc + (p.packages || []).filter((pk: any) => pk.isActive !== false).length,
    0
  );

  // ============================
  // HANDLERS: ASSIGN PACKAGE
  // ============================
  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !packageId) return;
    setIsSubmitting(true);

    const res = await assignPackageToStudent({ studentId, packageId });
    setIsSubmitting(false);

    if (res.success) {
      toast.success("Paket Diaktifkan", res.message);
      setShowAssignModal(false);
      startTransition(() => router.refresh());
    } else {
      toast.error("Gagal Menetapkan Paket", res.message);
    }
  };

  // ============================
  // HANDLERS: PACKAGE CRUD
  // ============================
  const handleOpenCreatePackage = (prefilledProgramId?: string) => {
    setEditingPackage(null);
    setPkgProgramId(prefilledProgramId || programs[0]?.id || "");
    setPkgName("");
    setPkgQuotaSessions("10");
    setPkgPrice("1500000");
    setPkgIsActive(true);
    setShowPackageModal(true);
  };

  const handleOpenEditPackage = (pkg: any) => {
    setEditingPackage(pkg);
    setPkgProgramId(pkg.programId || programs[0]?.id || "");
    setPkgName(pkg.name);
    setPkgQuotaSessions(String(pkg.quotaSessions || 10));
    setPkgPrice(String(pkg.price || 0));
    setPkgIsActive(pkg.isActive ?? true);
    setShowPackageModal(true);
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkgName.trim()) {
      toast.error("Validasi Gagal", "Nama paket wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    let res;

    if (editingPackage) {
      res = await updatePackage(editingPackage.id, {
        programId: pkgProgramId || null,
        name: pkgName,
        type: "QUOTA",
        quotaSessions: parseInt(pkgQuotaSessions, 10) || 10,
        sessionMinutes: 90, // BR-5 durasi standar 90 menit
        price: parseInt(pkgPrice, 10) || 0,
        isActive: pkgIsActive,
      });
    } else {
      res = await createPackage({
        programId: pkgProgramId || undefined,
        name: pkgName,
        type: "QUOTA",
        quotaSessions: parseInt(pkgQuotaSessions, 10) || 10,
        sessionMinutes: 90, // BR-5
        price: parseInt(pkgPrice, 10) || 0,
        isActive: pkgIsActive,
      });
    }

    setIsSubmitting(false);

    if (res.success) {
      toast.success(editingPackage ? "Paket Diperbarui" : "Paket Dibuat", res.message);
      setShowPackageModal(false);
      startTransition(() => router.refresh());
    } else {
      toast.error("Gagal Menyimpan Paket", res.message);
    }
  };

  const handleTogglePackage = async (pkg: any) => {
    const nextState = !pkg.isActive;
    const res = await togglePackageStatus(pkg.id, nextState);
    if (res.success) {
      toast.success("Status Diperbarui", res.message);
      startTransition(() => router.refresh());
    } else {
      toast.error("Gagal Mengubah Status", res.message);
    }
  };

  const handleDeletePackageConfirm = async () => {
    if (!deleteTarget || deleteTarget.type !== "PACKAGE") return;
    setIsSubmitting(true);
    const res = await deletePackage(deleteTarget.item.id);
    setIsSubmitting(false);

    if (res.success) {
      toast.success("Paket Diproses", res.message);
      setDeleteTarget(null);
      startTransition(() => router.refresh());
    } else {
      toast.error("Gagal Menghapus Paket", res.message);
    }
  };

  // ============================
  // HANDLERS: PROGRAM CRUD
  // ============================
  const handleOpenCreateProgram = () => {
    setEditingProgram(null);
    setPrName("");
    setPrCategory("K12");
    setPrDescription("");
    setPrSortOrder(String(programs.length + 1));
    setPrIsActive(true);
    setShowProgramModal(true);
  };

  const handleOpenEditProgram = (pr: any) => {
    setEditingProgram(pr);
    setPrName(pr.name);
    setPrCategory(pr.category || "K12");
    setPrDescription(pr.description || "");
    setPrSortOrder(String(pr.sortOrder || 0));
    setPrIsActive(pr.isActive ?? true);
    setShowProgramModal(true);
  };

  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prName.trim()) {
      toast.error("Validasi Gagal", "Nama program wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    let res;

    if (editingProgram) {
      res = await updateProgram(editingProgram.id, {
        name: prName,
        category: prCategory,
        description: prDescription,
        sortOrder: parseInt(prSortOrder, 10) || 0,
        isActive: prIsActive,
      });
    } else {
      res = await createProgram({
        name: prName,
        category: prCategory,
        description: prDescription,
        sortOrder: parseInt(prSortOrder, 10) || 0,
      });
    }

    setIsSubmitting(false);

    if (res.success) {
      toast.success(editingProgram ? "Program Diperbarui" : "Program Dibuat", res.message);
      setShowProgramModal(false);
      startTransition(() => router.refresh());
    } else {
      toast.error("Gagal Menyimpan Program", res.message);
    }
  };

  const handleDeleteProgramConfirm = async () => {
    if (!deleteTarget || deleteTarget.type !== "PROGRAM") return;
    setIsSubmitting(true);
    const res = await deleteProgram(deleteTarget.item.id);
    setIsSubmitting(false);

    if (res.success) {
      toast.success("Program Diproses", res.message);
      setDeleteTarget(null);
      startTransition(() => router.refresh());
    } else {
      toast.error("Gagal Menghapus Program", res.message);
    }
  };

  const exportQuotaToCsv = () => {
    if (studentPackages.length === 0) return;
    const header =
      "Nama Siswa,Jenjang,Sekolah,Paket Bimbingan,Model Kelas,Durasi Menit,Kuota Terpakai,Total Kuota,Sisa Pertemuan,Status Kuota\n";
    const rows = studentPackages
      .map((sp) => {
        const studentName = (sp.student?.name || "").replace(/"/g, '""');
        const level = sp.student?.level || "-";
        const school = (sp.student?.school || "").replace(/"/g, '""');
        const pkgName = (sp.package?.name || "").replace(/"/g, '""');
        const classModel = sp.package?.classModel || "PRIVAT";
        const duration = sp.package?.sessionMinutes || 90;
        const used = sp.quotaUsed || 0;
        const total = sp.quotaTotal || 0;
        const remaining = Math.max(0, total - used);
        const status = sp.status || (remaining <= 2 ? "HAMPIR HABIS" : "AKTIF");
        return `"${studentName}","${level}","${school}","${pkgName}","${classModel}",${duration},${used},${total},${remaining},"${status}"`;
      })
      .join("\n");

    const blob = new Blob(["\uFEFF" + header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `monitoring-kuota-siswa-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportCatalogToCsv = () => {
    const header =
      "Program,Kategori,Nama Paket,Tipe,Model Kelas,Jumlah Sesi,Durasi (Menit),Harga (Rp),Biaya per Sesi (Rp),Status,Siswa Terdaftar\n";
    const rows: string[] = [];

    programs.forEach((pr) => {
      const prName = (pr.name || "").replace(/"/g, '""');
      const cat = pr.category || "";
      (pr.packages || []).forEach((pk: any) => {
        const pkName = (pk.name || "").replace(/"/g, '""');
        const type = pk.type || "SESSION_BASED";
        const classModel = pk.classModel || "PRIVAT";
        const sessions = pk.sessionCount || 0;
        const minutes = pk.sessionMinutes || 90;
        const price = pk.price || 0;
        const costPerSession = sessions > 0 ? Math.round(price / sessions) : price;
        const status = pk.isActive ? "AKTIF" : "NONAKTIF";
        const enrolled = pk._count?.studentPackages || 0;
        rows.push(
          `"${prName}","${cat}","${pkName}","${type}","${classModel}",${sessions},${minutes},${price},${costPerSession},"${status}",${enrolled}`
        );
      });
    });

    if (rows.length === 0) return;
    const blob = new Blob(["\uFEFF" + header + rows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `katalog-paket-bimbingan-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Programs & Packages
  const filteredPrograms = programs.filter((pr) => {
    if (selectedCategory !== "ALL" && pr.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchPr = pr.name.toLowerCase().includes(q) || (pr.description || "").toLowerCase().includes(q);
      const matchPkg = (pr.packages || []).some((pk: any) => pk.name.toLowerCase().includes(q));
      return matchPr || matchPkg;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EAF1FA] text-[#09408C] border border-[#9AC1E2]">
              Katalog & Penjadwalan
            </span>
            <span className="text-xs text-[#5B6882]">Durasi Standar 90 Menit (BR-5)</span>
          </div>
          <h1 className="text-2xl font-bold text-[#09408C] font-display">
            Manajemen Paket & Program Bimbingan
          </h1>
          <p className="text-xs sm:text-sm text-[#5B6882] mt-0.5">
            Atur katalog paket belajar, tarif biaya, kuota pertemuan, serta monitoring kuota terpakai siswa.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={activeTab === "monitoring" ? exportQuotaToCsv : exportCatalogToCsv}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#D5DDEB] bg-white text-[#09408C] text-xs font-semibold hover:bg-[#EAF1FA] transition-colors shadow-2xs"
            title="Unduh data dalam format CSV"
          >
            <Download size={14} />
            <span>{activeTab === "monitoring" ? "Ekspor Kuota CSV" : "Ekspor Katalog CSV"}</span>
          </button>
          <button
            onClick={() => handleOpenCreatePackage()}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#D5DDEB] bg-white text-[#09408C] text-xs font-semibold hover:bg-[#EAF1FA] transition-colors shadow-2xs"
          >
            <Plus size={14} />
            <span>Tambah Paket</span>
          </button>
          <button
            onClick={handleOpenCreateProgram}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#D5DDEB] bg-white text-[#1B2A41] text-xs font-semibold hover:bg-[#F4F7FB] transition-colors shadow-2xs"
          >
            <Layers size={14} />
            <span>Program Baru</span>
          </button>
          <button
            onClick={() => setShowAssignModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571] transition-colors shadow-xs"
          >
            <FileCheck size={14} />
            <span>Tetapkan ke Siswa</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-[#D5DDEB] shadow-2xs">
          <div className="text-[11px] text-[#5B6882] font-semibold uppercase">Total Program</div>
          <div className="text-xl font-bold text-[#09408C] font-display mt-1">{programs.length}</div>
          <div className="text-[10px] text-[#5B6882] mt-0.5">Jenjang bimbingan aktif</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#D5DDEB] shadow-2xs">
          <div className="text-[11px] text-[#5B6882] font-semibold uppercase">Paket Belajar</div>
          <div className="text-xl font-bold text-[#1F6F4A] font-display mt-1">
            {activePackages}{" "}
            <span className="text-xs font-normal text-[#5B6882]">/ {totalPackages} paket</span>
          </div>
          <div className="text-[10px] text-[#1F6F4A] mt-0.5">Siap didaftarkan siswa</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#D5DDEB] shadow-2xs">
          <div className="text-[11px] text-[#5B6882] font-semibold uppercase">Siswa Terdaftar</div>
          <div className="text-xl font-bold text-[#09408C] font-display mt-1">
            {studentPackages.length}
          </div>
          <div className="text-[10px] text-[#5B6882] mt-0.5">Paket belajar aktif siswa</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#D5DDEB] shadow-2xs">
          <div className="text-[11px] text-[#5B6882] font-semibold uppercase">Sesi Kritis (≤2)</div>
          <div className="text-xl font-bold text-[#B45309] font-display mt-1">
            {
              studentPackages.filter(
                (sp) => Math.max(0, sp.quotaTotal - sp.quotaUsed) <= 2 && sp.status !== "HABIS"
              ).length
            }
          </div>
          <div className="text-[10px] text-[#B45309] mt-0.5">Perlu perpanjangan (BR-4)</div>
        </div>
      </div>

      {/* 3. Navigation Tabs & Search Toolbar */}
      <div className="bg-white rounded-2xl border border-[#D5DDEB] p-2 sm:p-3 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-[#F4F7FB] rounded-xl border border-[#D5DDEB] self-start sm:self-auto">
            <button
              onClick={() => setActiveTab("katalog")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "katalog"
                  ? "bg-[#09408C] text-white shadow-2xs"
                  : "text-[#5B6882] hover:text-[#09408C]"
              }`}
            >
              Katalog Paket ({totalPackages})
            </button>
            <button
              onClick={() => setActiveTab("monitoring")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "monitoring"
                  ? "bg-[#09408C] text-white shadow-2xs"
                  : "text-[#5B6882] hover:text-[#09408C]"
              }`}
            >
              Monitoring Siswa ({studentPackages.length})
            </button>
            <button
              onClick={() => setActiveTab("program")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "program"
                  ? "bg-[#09408C] text-white shadow-2xs"
                  : "text-[#5B6882] hover:text-[#09408C]"
              }`}
            >
              Kelola Program ({programs.length})
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-60">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5B6882]" />
              <input
                type="text"
                placeholder="Cari paket / program..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#D5DDEB] bg-white focus:outline-none focus:border-[#09408C]"
              />
            </div>

            {activeTab === "katalog" && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-xl border border-[#D5DDEB] bg-white text-[#1B2A41] focus:outline-none focus:border-[#09408C]"
              >
                <option value="ALL">Semua Kategori</option>
                <option value="K12">Bimbel K-12</option>
                <option value="CPNS_BUMN">CPNS & BUMN</option>
                <option value="S2_S3_BEASISWA">S2/S3 & Beasiswa</option>
                <option value="TOEFL_IELTS">TOEFL / IELTS</option>
                <option value="PENULISAN_ILMIAH">Karya Ilmiah</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: KATALOG PAKET BIMBINGAN (FULL CRUD) */}
      {/* ======================================================== */}
      {activeTab === "katalog" && (
        <div className="space-y-6">
          {filteredPrograms.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#D5DDEB] p-12 text-center shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#EAF1FA] text-[#09408C] flex items-center justify-center mx-auto mb-3">
                <Search size={20} />
              </div>
              <h3 className="font-bold text-sm text-[#1B2A41]">Tidak Ada Paket yang Sesuai</h3>
              <p className="text-xs text-[#5B6882] mt-1">
                Coba sesuaikan kata kunci pencarian atau ubah filter kategori.
              </p>
            </div>
          ) : (
            filteredPrograms.map((pr) => {
              const catBadge = getCategoryBadge(pr.category);
              const packages = pr.packages || [];

              return (
                <div
                  key={pr.id}
                  className="bg-white rounded-3xl border border-[#D5DDEB] p-5 sm:p-6 shadow-xs space-y-4"
                >
                  {/* Program Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#D5DDEB]">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base sm:text-lg font-bold text-[#09408C] font-display">
                          {pr.name}
                        </h2>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${catBadge.bg}`}
                        >
                          {catBadge.label}
                        </span>
                        {!pr.isActive && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F4F7FB] text-[#5B6882] border border-[#D5DDEB]">
                            Nonaktif
                          </span>
                        )}
                      </div>
                      {pr.description && (
                        <p className="text-xs text-[#5B6882] mt-0.5">{pr.description}</p>
                      )}
                    </div>

                    <button
                      onClick={() => handleOpenCreatePackage(pr.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EAF1FA] hover:bg-[#9AC1E2]/30 text-[#09408C] text-xs font-bold border border-[#9AC1E2] transition-colors self-start sm:self-auto cursor-pointer"
                    >
                      <Plus size={13} />
                      <span>Tambah Paket di Program Ini</span>
                    </button>
                  </div>

                  {/* List Paket in this Program */}
                  {packages.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#5B6882] bg-[#F4F7FB] rounded-2xl border border-dashed border-[#D5DDEB]">
                      Belum ada paket bimbingan untuk program ini. Klik tombol di atas untuk membuat paket baru.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {packages.map((pk: any) => {
                        const quota = pk.quotaSessions || 10;
                        const price = pk.price || 0;
                        const costPerSession = quota > 0 ? Math.round(price / quota) : 0;
                        const enrolledCount = studentPackages.filter(
                          (sp) => sp.packageId === pk.id
                        ).length;

                        return (
                          <div
                            key={pk.id}
                            className={`rounded-2xl border p-4.5 flex flex-col justify-between transition-all relative ${
                              pk.isActive
                                ? "bg-white border-[#D5DDEB] hover:border-[#09408C] hover:shadow-xs"
                                : "bg-gray-50 border-gray-200 opacity-75"
                            }`}
                          >
                            <div className="space-y-3">
                              {/* Header Card: Nama & Status */}
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h3 className="font-bold text-sm text-[#1B2A41] leading-tight font-display">
                                    {pk.name}
                                  </h3>
                                  <div className="text-[11px] text-[#5B6882] flex items-center gap-1.5 mt-1">
                                    <Clock size={12} className="text-[#09408C]" />
                                    <span>{pk.sessionMinutes || 90} menit / sesi</span>
                                    <span>•</span>
                                    <span className="font-semibold text-[#09408C]">
                                      {quota} Pertemuan
                                    </span>
                                  </div>
                                </div>

                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                                    pk.isActive
                                      ? "bg-[#E3F4EC] text-[#1F6F4A]"
                                      : "bg-gray-200 text-gray-600"
                                  }`}
                                >
                                  {pk.isActive ? "Aktif" : "Nonaktif"}
                                </span>
                              </div>

                              {/* Price Box */}
                              <div className="bg-[#F4F7FB] p-3 rounded-xl border border-[#D5DDEB]">
                                <div className="text-[10px] text-[#5B6882] uppercase font-semibold">
                                  Tarif Bimbingan
                                </div>
                                <div className="text-lg font-bold text-[#09408C] font-mono tabular-nums">
                                  Rp {price.toLocaleString("id-ID")}
                                </div>
                                <div className="text-[10px] text-[#5B6882] mt-0.5 tabular-nums">
                                  Setara <strong>Rp {costPerSession.toLocaleString("id-ID")}</strong> / sesi
                                </div>
                              </div>

                              {/* Enrolled Students info */}
                              <div className="flex items-center gap-1.5 text-xs text-[#5B6882]">
                                <Users size={13} className="text-[#09408C]" />
                                <span>
                                  <strong>{enrolledCount}</strong> siswa aktif terdaftar
                                </span>
                              </div>
                            </div>

                            {/* Actions Bar */}
                            <div className="pt-3.5 mt-3.5 border-t border-[#D5DDEB] flex items-center justify-between gap-2">
                              <button
                                onClick={() => handleTogglePackage(pk)}
                                className={`text-[11px] font-semibold flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-colors ${
                                  pk.isActive
                                    ? "text-[#B45309] border-[#F5B82E] hover:bg-[#FEF7E6]"
                                    : "text-[#1F6F4A] border-[#1F6F4A] hover:bg-[#E3F4EC]"
                                }`}
                                title={pk.isActive ? "Nonaktifkan paket" : "Aktifkan kembali"}
                              >
                                <Power size={12} />
                                <span>{pk.isActive ? "Nonaktifkan" : "Aktifkan"}</span>
                              </button>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleOpenEditPackage(pk)}
                                  className="p-1.5 text-[#09408C] hover:bg-[#EAF1FA] rounded-lg transition-colors"
                                  title="Edit Rincian Paket"
                                >
                                  <Edit2 size={15} />
                                </button>
                                <button
                                  onClick={() =>
                                    setDeleteTarget({
                                      type: "PACKAGE",
                                      item: pk,
                                      enrolledCount,
                                    })
                                  }
                                  className="p-1.5 text-[#B4381F] hover:bg-[#FBE9E5] rounded-lg transition-colors"
                                  title="Hapus / Nonaktifkan Paket"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: MONITORING KUOTA SISWA */}
      {/* ======================================================== */}
      {activeTab === "monitoring" && (
        <div className="bg-white rounded-2xl border border-[#D5DDEB] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#D5DDEB] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-bold text-sm text-[#09408C]">Monitoring Paket Aktif Siswa</h2>
              <p className="text-xs text-[#5B6882]">
                Pantau kuota pertemuan terlaksana (BR-1) dan siswa dengan sisa sesi menipis (BR-4).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={exportQuotaToCsv}
                disabled={studentPackages.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#D5DDEB] bg-white text-[#09408C] text-xs font-semibold hover:bg-[#EAF1FA] transition-colors disabled:opacity-50"
              >
                <Download size={13} />
                <span>Ekspor CSV</span>
              </button>
              <span className="text-xs font-semibold text-[#5B6882] bg-[#F4F7FB] px-3 py-1 rounded-full border border-[#D5DDEB]">
                Total {studentPackages.length} paket aktif
              </span>
            </div>
          </div>

          {studentPackages.length === 0 ? (
            <div className="p-12 text-center text-sm text-[#5B6882]">
              Belum ada paket yang ditetapkan ke siswa. Klik tombol "Tetapkan ke Siswa" di kanan atas.
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
                    <th className="py-3 px-4">Status Kuota</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D5DDEB]">
                  {studentPackages.map((sp) => {
                    const remaining = Math.max(0, sp.quotaTotal - sp.quotaUsed);
                    const isLow = remaining <= 2 && sp.status !== "HABIS";

                    return (
                      <tr key={sp.id} className="hover:bg-[#EAF1FA]/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-sm text-[#1B2A41]">{sp.student?.name}</div>
                          <div className="text-[11px] text-[#5B6882]">
                            {sp.student?.level || "Umum"} {sp.student?.school ? `— ${sp.student.school}` : ""}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-[#09408C]">{sp.package?.name}</div>
                          <div className="text-[11px] text-[#5B6882]">
                            Durasi {sp.package?.sessionMinutes || 90} menit / sesi
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
                            {sp.status === "HABIS"
                              ? "HABIS"
                              : isLow
                              ? "HAMPIR HABIS"
                              : "AKTIF"}
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
      )}

      {/* ======================================================== */}
      {/* TAB 3: KELOLA PROGRAM & JENJANG (FULL CRUD) */}
      {/* ======================================================== */}
      {activeTab === "program" && (
        <div className="bg-white rounded-3xl border border-[#D5DDEB] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D5DDEB]">
            <div>
              <h2 className="text-lg font-bold text-[#09408C] font-display">
                Direktori Program & Jenjang Bimbingan
              </h2>
              <p className="text-xs text-[#5B6882] mt-0.5">
                Kelola kategori program (K-12, CPNS & BUMN, S2/S3 Beasiswa, TOEFL/IELTS, Karya Ilmiah).
              </p>
            </div>
            <button
              onClick={handleOpenCreateProgram}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571] transition-colors self-start sm:self-auto cursor-pointer"
            >
              <Plus size={14} />
              <span>Tambah Program Baru</span>
            </button>
          </div>

          <div className="divide-y divide-[#D5DDEB]">
            {programs.map((pr) => {
              const catBadge = getCategoryBadge(pr.category);
              const pkgCount = (pr.packages || []).length;

              return (
                <div
                  key={pr.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F4F7FB]/50 px-2 rounded-xl transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-[#1B2A41]">{pr.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${catBadge.bg}`}>
                        {catBadge.label}
                      </span>
                      {!pr.isActive && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500">
                          Nonaktif
                        </span>
                      )}
                    </div>
                    {pr.description && <p className="text-xs text-[#5B6882]">{pr.description}</p>}
                    <div className="text-[11px] text-[#5B6882]">
                      Memiliki <strong>{pkgCount}</strong> paket belajar terdaftar
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleOpenEditProgram(pr)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#D5DDEB] bg-white text-xs font-semibold text-[#09408C] hover:bg-[#EAF1FA] transition-colors"
                    >
                      <Edit2 size={13} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() =>
                        setDeleteTarget({
                          type: "PROGRAM",
                          item: pr,
                          enrolledCount: pkgCount,
                        })
                      }
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#D5DDEB] bg-white text-xs font-semibold text-[#B4381F] hover:bg-[#FBE9E5] transition-colors"
                    >
                      <Trash2 size={13} />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: ASSIGN PACKAGE TO STUDENT */}
      {/* ======================================================== */}
      {showAssignModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="assign-pkg-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200"
        >
          <form
            onSubmit={handleAssign}
            className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#D5DDEB] shadow-2xl space-y-4 relative"
          >
            <button
              type="button"
              onClick={() => setShowAssignModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-[#5B6882] hover:bg-[#EAF1FA] transition-colors"
            >
              <X size={18} />
            </button>

            <div>
              <h3 id="assign-pkg-modal-title" className="text-lg font-bold text-[#09408C] font-display">
                Tetapkan Paket Bimbingan ke Siswa
              </h3>
              <p className="text-xs text-[#5B6882] mt-0.5">
                Pilih siswa dan paket belajar untuk mengaktifkan kuota pertemuan resmi.
              </p>
            </div>

            <div>
              <label htmlFor="assign-student-select" className="block text-xs font-bold text-[#1B2A41] mb-1">
                Pilih Siswa *
              </label>
              <select
                id="assign-student-select"
                required
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-[#D5DDEB] focus-ring bg-white"
              >
                <option value="" disabled>
                  -- Pilih Siswa --
                </option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.level} — {s.school || "Umum"})
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
                required
                value={packageId}
                onChange={(e) => setPackageId(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-[#D5DDEB] focus-ring bg-white"
              >
                {programs.flatMap((pr) =>
                  (pr.packages || []).map((pk: any) => (
                    <option key={pk.id} value={pk.id}>
                      [{pr.name}] {pk.name} — {pk.quotaSessions || 10} Sesi (Rp{" "}
                      {(pk.price || 0).toLocaleString("id-ID")})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="bg-[#EAF1FA] p-3 rounded-xl border border-[#9AC1E2] text-xs text-[#09408C]">
              ℹ <strong>Sesuai BR-1 & BR-5:</strong> Kuota akan bertambah sesuai isi paket dengan durasi standar 90 menit per sesi. Pemotongan kuota terjadi saat sesi berstatus <em>Terlaksana</em>.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D5DDEB]">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2.5 text-xs font-semibold text-[#5B6882] hover:bg-[#F4F7FB] rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 text-xs font-bold bg-[#09408C] text-white hover:bg-[#0E3571] rounded-xl transition-colors shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? "Menyimpan..." : "Aktifkan Paket"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: CREATE / EDIT PACKAGE */}
      {/* ======================================================== */}
      {showPackageModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="package-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200"
        >
          <form
            onSubmit={handleSavePackage}
            className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#D5DDEB] shadow-2xl space-y-4 relative"
          >
            <button
              type="button"
              onClick={() => setShowPackageModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-[#5B6882] hover:bg-[#EAF1FA] transition-colors"
            >
              <X size={18} />
            </button>

            <div>
              <h3 id="package-modal-title" className="text-lg font-bold text-[#09408C] font-display">
                {editingPackage ? "Edit Paket Belajar" : "Buat Paket Belajar Baru"}
              </h3>
              <p className="text-xs text-[#5B6882] mt-0.5">
                Tentukan kuota sesi, durasi (90 menit - BR-5), dan tarif biaya paket.
              </p>
            </div>

            <div>
              <label htmlFor="pkg-prog-select" className="block text-xs font-bold text-[#1B2A41] mb-1">
                Program Terkait *
              </label>
              <select
                id="pkg-prog-select"
                value={pkgProgramId}
                onChange={(e) => setPkgProgramId(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-[#D5DDEB] focus-ring bg-white"
              >
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({getCategoryBadge(p.category).label})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="pkg-name" className="block text-xs font-bold text-[#1B2A41] mb-1">
                Nama Paket Bimbingan *
              </label>
              <input
                id="pkg-name"
                type="text"
                required
                placeholder="Contoh: Paket Intensif SKD CPNS 10 Sesi"
                value={pkgName}
                onChange={(e) => setPkgName(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-[#D5DDEB] focus-ring"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="pkg-quota" className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Jumlah Kuota Sesi *
                </label>
                <input
                  id="pkg-quota"
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={pkgQuotaSessions}
                  onChange={(e) => setPkgQuotaSessions(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-[#D5DDEB] focus-ring"
                />
              </div>

              <div>
                <label htmlFor="pkg-duration" className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Durasi Sesi (Menit)
                </label>
                <input
                  id="pkg-duration"
                  type="number"
                  disabled
                  value={pkgSessionMinutes}
                  className="w-full text-xs p-3 rounded-xl border border-[#D5DDEB] bg-gray-100 font-bold text-[#09408C]"
                />
                <span className="text-[10px] text-[#5B6882]">Standar 90 Menit (BR-5)</span>
              </div>
            </div>

            <div>
              <label htmlFor="pkg-price" className="block text-xs font-bold text-[#1B2A41] mb-1">
                Biaya Total Paket (Rp) *
              </label>
              <input
                id="pkg-price"
                type="number"
                min="0"
                step="50000"
                required
                value={pkgPrice}
                onChange={(e) => setPkgPrice(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-[#D5DDEB] focus-ring font-mono"
              />
              {Number(pkgPrice) > 0 && (
                <div className="flex items-center justify-between text-[11px] text-[#09408C] font-semibold mt-1">
                  <span>Terbaca: Rp {Number(pkgPrice).toLocaleString("id-ID")}</span>
                  {Number(pkgQuotaSessions) > 0 && (
                    <span className="text-[#5B6882]">
                      (Rp {Math.round(Number(pkgPrice) / Number(pkgQuotaSessions)).toLocaleString("id-ID")} / sesi)
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="pkg-active"
                checked={pkgIsActive}
                onChange={(e) => setPkgIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-[#09408C] focus:ring-[#09408C]"
              />
              <label htmlFor="pkg-active" className="text-xs font-semibold text-[#1B2A41] cursor-pointer">
                Paket Aktif (dapat dipilih untuk pendaftaran siswa baru)
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D5DDEB]">
              <button
                type="button"
                onClick={() => setShowPackageModal(false)}
                className="px-4 py-2.5 text-xs font-semibold text-[#5B6882] hover:bg-[#F4F7FB] rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 text-xs font-bold bg-[#09408C] text-white hover:bg-[#0E3571] rounded-xl transition-colors shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? "Menyimpan..." : editingPackage ? "Simpan Perubahan" : "Buat Paket"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: CREATE / EDIT PROGRAM */}
      {/* ======================================================== */}
      {showProgramModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="program-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200"
        >
          <form
            onSubmit={handleSaveProgram}
            className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#D5DDEB] shadow-2xl space-y-4 relative"
          >
            <button
              type="button"
              onClick={() => setShowProgramModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-[#5B6882] hover:bg-[#EAF1FA] transition-colors"
            >
              <X size={18} />
            </button>

            <div>
              <h3 id="program-modal-title" className="text-lg font-bold text-[#09408C] font-display">
                {editingProgram ? "Edit Program Bimbingan" : "Buat Program Baru"}
              </h3>
              <p className="text-xs text-[#5B6882] mt-0.5">
                Kelola jenjang dan kategori bimbingan belajar resmi Sahabat Belajar.
              </p>
            </div>

            <div>
              <label htmlFor="pr-name" className="block text-xs font-bold text-[#1B2A41] mb-1">
                Nama Program *
              </label>
              <input
                id="pr-name"
                type="text"
                required
                placeholder="Contoh: Persiapan Kedinasan & BUMN"
                value={prName}
                onChange={(e) => setPrName(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-[#D5DDEB] focus-ring"
              />
            </div>

            <div>
              <label htmlFor="pr-category" className="block text-xs font-bold text-[#1B2A41] mb-1">
                Kategori Segmentasi *
              </label>
              <select
                id="pr-category"
                value={prCategory}
                onChange={(e) => setPrCategory(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-[#D5DDEB] focus-ring bg-white"
              >
                <option value="K12">K12 (SD, SMP, SMA, PAS/PAT)</option>
                <option value="CPNS_BUMN">CPNS & BUMN (SKD CAT: TWK, TIU, TKP)</option>
                <option value="S2_S3_BEASISWA">S2/S3 & Beasiswa (LPDP, AAS, Proposal)</option>
                <option value="TOEFL_IELTS">TOEFL / IELTS (Persiapan Tes)</option>
                <option value="PENULISAN_ILMIAH">Penulisan Ilmiah & Skripsi</option>
              </select>
            </div>

            <div>
              <label htmlFor="pr-desc" className="block text-xs font-bold text-[#1B2A41] mb-1">
                Deskripsi Singkat Program
              </label>
              <textarea
                id="pr-desc"
                rows={2}
                placeholder="Deskripsi ringkas layanan bimbingan..."
                value={prDescription}
                onChange={(e) => setPrDescription(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-[#D5DDEB] focus-ring resize-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="pr-active"
                checked={prIsActive}
                onChange={(e) => setPrIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-[#09408C] focus:ring-[#09408C]"
              />
              <label htmlFor="pr-active" className="text-xs font-semibold text-[#1B2A41] cursor-pointer">
                Program Aktif
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D5DDEB]">
              <button
                type="button"
                onClick={() => setShowProgramModal(false)}
                className="px-4 py-2.5 text-xs font-semibold text-[#5B6882] hover:bg-[#F4F7FB] rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 text-xs font-bold bg-[#09408C] text-white hover:bg-[#0E3571] rounded-xl transition-colors shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? "Menyimpan..." : editingProgram ? "Simpan Perubahan" : "Buat Program"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: IMPACT-AWARE DELETE CONFIRMATION */}
      {/* ======================================================== */}
      {deleteTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#D5DDEB] shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FBE9E5] text-[#B4381F] flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-[#1B2A41] font-display">
                Konfirmasi Hapus {deleteTarget.type === "PACKAGE" ? "Paket Belajar" : "Program"}
              </h3>
              <p className="text-xs font-semibold text-[#09408C]">"{deleteTarget.item.name}"</p>
            </div>

            {/* Impact-Aware Warning Box */}
            {deleteTarget.enrolledCount && deleteTarget.enrolledCount > 0 ? (
              <div className="bg-[#FEF7E6] border border-[#F5B82E] p-3.5 rounded-2xl text-xs text-[#B45309] space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle size={14} />
                  <span>Perhatian Integritas Data (Soft Delete):</span>
                </div>
                <p className="leading-relaxed">
                  {deleteTarget.type === "PACKAGE"
                    ? `Paket ini sedang digunakan oleh ${deleteTarget.enrolledCount} siswa aktif. Sistem akan melakukan Soft Deactivate (menonaktifkan paket) agar riwayat sesi dan invoice pembayaran siswa tetap terlindungi.`
                    : `Program ini memiliki ${deleteTarget.enrolledCount} paket bimbingan terkait. Program akan dinonaktifkan secara aman tanpa merusak paket dan jadwal sesi.`}
                </p>
              </div>
            ) : (
              <p className="text-xs text-[#5B6882] text-center leading-relaxed">
                Item ini belum memiliki riwayat siswa terdaftar dan akan dihapus secara permanen dari sistem.
              </p>
            )}

            <div className="flex items-center justify-center gap-2 pt-2 border-t border-[#D5DDEB]">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="w-1/2 py-2.5 text-xs font-semibold text-[#5B6882] hover:bg-[#F4F7FB] rounded-xl transition-colors border border-[#D5DDEB]"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={
                  deleteTarget.type === "PACKAGE"
                    ? handleDeletePackageConfirm
                    : handleDeleteProgramConfirm
                }
                className="w-1/2 py-2.5 text-xs font-bold bg-[#B4381F] text-white hover:bg-[#962D18] rounded-xl transition-colors shadow-xs disabled:opacity-50"
              >
                {isSubmitting
                  ? "Memproses..."
                  : deleteTarget.enrolledCount && deleteTarget.enrolledCount > 0
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
