"use client";

import { useState, useEffect, useMemo } from "react";
import {
  FileEdit,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  FileText,
  Download,
  ExternalLink,
  User,
  GraduationCap,
  Send,
  MessageSquare,
  ChevronRight,
  Eye,
  Trash2,
  X,
  RotateCcw,
  Layers,
  Plus,
  Share2,
  Edit3,
  MessageCircle,
  Check,
  ArrowUpDown,
  BookOpen,
} from "lucide-react";
import type { AcademicDocument, DocumentStage, DocumentCategory } from "@/actions/dokumen";
import {
  reviewDocument,
  deleteDocument,
  createAdminDocument,
  updateDocumentDetails,
} from "@/actions/dokumen";
import { useToast } from "@/components/ui/Toast";

export default function DocumentManagerClient({
  initialDocuments = [],
}: {
  initialDocuments: AcademicDocument[];
}) {
  const toast = useToast();
  const [documents, setDocuments] = useState<AcademicDocument[]>(initialDocuments);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState<"NEWEST" | "STUDENT_ASC" | "TITLE_ASC" | "VERSION_DESC">("NEWEST");

  // Modals state
  const [previewDoc, setPreviewDoc] = useState<AcademicDocument | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<AcademicDocument | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<AcademicDocument | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Escape key listener to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (previewDoc) setPreviewDoc(null);
        if (isReviewModalOpen) setIsReviewModalOpen(false);
        if (isCreateModalOpen) setIsCreateModalOpen(false);
        if (isEditModalOpen) setIsEditModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewDoc, isReviewModalOpen, isCreateModalOpen, isEditModalOpen]);

  // Review Form State
  const [reviewStage, setReviewStage] = useState<DocumentStage>("APPROVED");
  const [mentorName, setMentorName] = useState("Dr. Hendra Wijaya / Mentor Akademik");
  const [mentorNotes, setMentorNotes] = useState("");

  // Create Form State
  const [newTitle, setNewTitle] = useState("");
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentId, setNewStudentId] = useState("std_demo_01");
  const [newCategory, setNewCategory] = useState<DocumentCategory>("ESAI_BEASISWA");
  const [newTargetInstitution, setNewTargetInstitution] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [newFileUrl, setNewFileUrl] = useState("");
  const [newStudentNotes, setNewStudentNotes] = useState("");

  // Edit Form State
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState<DocumentCategory>("ESAI_BEASISWA");
  const [editTargetInstitution, setEditTargetInstitution] = useState("");
  const [editFileName, setEditFileName] = useState("");
  const [editStudentNotes, setEditStudentNotes] = useState("");

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: documents.length };
    ["ESAI_BEASISWA", "PROPOSAL_TESIS", "SKRIPSI_KTI", "MOTIVATION_LETTER"].forEach((c) => {
      counts[c] = documents.filter((d) => d.category === c).length;
    });
    return counts;
  }, [documents]);

  // Stage counts
  const totalWaiting = useMemo(() => documents.filter((d) => d.stage === "REVIEW_MENTOR").length, [documents]);
  const totalRevision = useMemo(() => documents.filter((d) => d.stage === "REVISI").length, [documents]);
  const totalApproved = useMemo(() => documents.filter((d) => d.stage === "APPROVED").length, [documents]);

  // Filter & Sort Documents
  const filteredDocs = useMemo(() => {
    let list = documents.filter((doc) => {
      const matchStage = stageFilter === "ALL" || doc.stage === stageFilter;
      const matchCat = categoryFilter === "ALL" || doc.category === categoryFilter;
      const sLower = search.toLowerCase();
      const matchSearch =
        !search ||
        doc.title.toLowerCase().includes(sLower) ||
        doc.studentName.toLowerCase().includes(sLower) ||
        (doc.targetInstitution && doc.targetInstitution.toLowerCase().includes(sLower)) ||
        (doc.mentorNotes && doc.mentorNotes.toLowerCase().includes(sLower));
      return matchStage && matchCat && matchSearch;
    });

    list.sort((a, b) => {
      if (sortBy === "NEWEST") {
        return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
      }
      if (sortBy === "STUDENT_ASC") {
        return a.studentName.localeCompare(b.studentName);
      }
      if (sortBy === "TITLE_ASC") {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === "VERSION_DESC") {
        return (b.version || 1) - (a.version || 1);
      }
      return 0;
    });

    return list;
  }, [documents, stageFilter, categoryFilter, search, sortBy]);

  const openReviewModal = (doc: AcademicDocument) => {
    setSelectedDoc(doc);
    setReviewStage(doc.stage === "REVIEW_MENTOR" ? "APPROVED" : doc.stage);
    setMentorName(doc.mentorName || "Dr. Hendra Wijaya / Mentor Akademik");
    setMentorNotes(doc.mentorNotes || "");
    setIsReviewModalOpen(true);
  };

  const openEditModal = (doc: AcademicDocument) => {
    setEditingDoc(doc);
    setEditTitle(doc.title);
    setEditCategory(doc.category);
    setEditTargetInstitution(doc.targetInstitution || "");
    setEditFileName(doc.fileName || "");
    setEditStudentNotes(doc.studentNotes || "");
    setIsEditModalOpen(true);
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc || !mentorNotes.trim()) {
      toast.error("Catatan Wajib Diisi", "Mohon berikan catatan evaluasi mentor.");
      return;
    }

    setIsSubmitting(true);
    const res = await reviewDocument({
      id: selectedDoc.id,
      stage: reviewStage,
      mentorName,
      mentorNotes,
    });
    setIsSubmitting(false);

    if (res.success) {
      setDocuments(
        documents.map((d) =>
          d.id === selectedDoc.id
            ? {
                ...d,
                stage: reviewStage,
                mentorName,
                mentorNotes,
                reviewedAt: new Date().toISOString(),
                version: reviewStage === "REVISI" ? d.version + 1 : d.version,
                updatedAt: new Date().toISOString(),
              }
            : d
        )
      );
      setIsReviewModalOpen(false);
      toast.success(
        "Evaluasi Disimpan",
        `Catatan telaah mentor disimpan. Status: ${
          reviewStage === "APPROVED"
            ? "Disetujui (Approved)"
            : reviewStage === "REVISI"
            ? "Perlu Revisi"
            : "Sedang Ditelaah"
        }.`
      );
    } else {
      toast.error("Gagal Menyimpan", res.message);
    }
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newStudentName.trim()) {
      toast.warning("Form Belum Lengkap", "Judul naskah dan nama siswa wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    const res = await createAdminDocument({
      title: newTitle,
      studentName: newStudentName,
      studentId: newStudentId || "std_demo_01",
      category: newCategory,
      targetInstitution: newTargetInstitution,
      fileName: newFileName || `${newTitle.replace(/\s+/g, "_")}.pdf`,
      fileUrl: newFileUrl || "/materials/sample-document.pdf",
      studentNotes: newStudentNotes,
    });
    setIsSubmitting(false);

    if (res.success && res.data) {
      const newDoc: AcademicDocument = {
        id: res.data.id,
        title: newTitle,
        studentName: newStudentName,
        studentId: newStudentId || "std_demo_01",
        category: newCategory,
        targetInstitution: newTargetInstitution || null,
        stage: "REVIEW_MENTOR",
        version: 1,
        fileName: newFileName || `${newTitle.replace(/\s+/g, "_")}.pdf`,
        fileUrl: newFileUrl || "/materials/sample-document.pdf",
        studentNotes: newStudentNotes || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setDocuments([newDoc, ...documents]);
      setIsCreateModalOpen(false);
      toast.success("Draf Ditambahkan", `Draf dokumen "${newTitle}" berhasil ditambahkan.`);
      // Reset form
      setNewTitle("");
      setNewStudentName("");
      setNewTargetInstitution("");
      setNewFileName("");
      setNewFileUrl("");
      setNewStudentNotes("");
    } else {
      toast.error("Gagal Menambahkan", res.message);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc || !editTitle.trim()) return;

    setIsSubmitting(true);
    const res = await updateDocumentDetails(editingDoc.id, {
      title: editTitle,
      category: editCategory,
      targetInstitution: editTargetInstitution,
      fileName: editFileName,
      studentNotes: editStudentNotes,
    });
    setIsSubmitting(false);

    if (res.success) {
      setDocuments(
        documents.map((d) =>
          d.id === editingDoc.id
            ? {
                ...d,
                title: editTitle,
                category: editCategory,
                targetInstitution: editTargetInstitution || null,
                fileName: editFileName || d.fileName,
                studentNotes: editStudentNotes || null,
                updatedAt: new Date().toISOString(),
              }
            : d
        )
      );
      setIsEditModalOpen(false);
      toast.success("Data Diperbarui", "Perubahan data draf naskah berhasil disimpan.");
    } else {
      toast.error("Gagal Memperbarui", res.message);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Hapus draf naskah "${title}" secara permanen?`)) return;

    const res = await deleteDocument(id);
    if (res.success) {
      setDocuments(documents.filter((d) => d.id !== id));
      toast.success("Naskah Dihapus", `Naskah "${title}" berhasil dihapus.`);
    } else {
      toast.error("Gagal Menghapus", res.message);
    }
  };

  // WhatsApp Notification Sender
  const handleSendWhatsAppNotification = (doc: AcademicDocument) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const portalUrl = `${origin}/portal/dokumen`;
    const statusText =
      doc.stage === "APPROVED"
        ? "✅ DISETUJUI (APPROVED) — Siap diajukan ke beasiswa / seminar"
        : doc.stage === "REVISI"
        ? "⚠️ PERLU REVISI TAMBAHAN — Cek catatan mentor"
        : "⏳ SEDANG DITELAAH MENTOR";

    const feedbackSnippet = doc.mentorNotes
      ? doc.mentorNotes.length > 150
        ? doc.mentorNotes.substring(0, 150) + "..."
        : doc.mentorNotes
      : "Silakan periksa umpan balik lengkap di portal.";

    const text = `Halo *${doc.studentName}*!\n\nKabar baik dari tim Sahabat Belajar. Draf naskah kamu:\n📄 *${doc.title}* (Versi ${doc.version})\n\nTelah selesai ditelaah oleh mentor *${doc.mentorName || "Tim Akademik"}*.\n\nStatus: *${statusText}*\n\n💬 *Catatan Mentor:*\n"${feedbackSnippet}"\n\nBuka portal siswa untuk membaca telaah lengkap & mengunggah draf revisi:\n${portalUrl}\n\n#BersamaSahabat #SahabatBelajar`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
    toast.success("WhatsApp Terbuka", `Draf notifikasi telaah untuk ${doc.studentName} siap dikirim.`);
  };

  const insertTemplateNote = (text: string) => {
    setMentorNotes((prev) => (prev ? `${prev}\n- ${text}` : `- ${text}`));
  };

  const getStageBadge = (stage: DocumentStage) => {
    switch (stage) {
      case "REVIEW_MENTOR":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EAF1FA] text-[#09408C] text-[11px] font-bold border border-[#9AC1E2]">
            <Clock size={12} />
            <span>Menunggu Review</span>
          </span>
        );
      case "REVISI":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FEF7E6] text-[#B45309] text-[11px] font-bold border border-[#F5B82E]/50">
            <AlertCircle size={12} />
            <span>Perlu Revisi</span>
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E3F4EC] text-[#1F6F4A] text-[11px] font-bold border border-[#1F6F4A]/30">
            <CheckCircle2 size={12} />
            <span>Disetujui (Approved)</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-[#5B6882] text-[11px] font-semibold">
            Drafting
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF1FA] text-[#09408C] text-xs font-bold border border-[#9AC1E2] mb-2">
            <FileEdit size={14} />
            <span>Layanan Review Dokumen Ilmiah & Esai Beasiswa</span>
          </div>
          <h1 className="text-2xl font-bold text-[#09408C] font-display">
            Bimbingan & Telaah Naskah Akademik
          </h1>
          <p className="text-sm text-[#5B6882] mt-0.5">
            Layanan telaah proposal tesis, esai beasiswa LPDP/AAS/MEXT, motivation letter, dan skripsi terhubung langsung ke Portal Siswa.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571] transition-colors shadow-xs shrink-0"
        >
          <Plus size={16} />
          <span>Tambah Draf Naskah</span>
        </button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#D5DDEB] shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs text-[#5B6882] font-semibold">Menunggu Review</div>
            <div className="text-2xl font-bold text-[#09408C] font-display mt-0.5">
              {totalWaiting} Draf
            </div>
            <div className="text-[11px] text-[#09408C] mt-1 font-medium">
              Perlu evaluasi mentor
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#EAF1FA] text-[#09408C] flex items-center justify-center">
            <Clock size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#D5DDEB] shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs text-[#5B6882] font-semibold">Dalam Tahap Revisi</div>
            <div className="text-2xl font-bold text-[#B45309] font-display mt-0.5">
              {totalRevision} Draf
            </div>
            <div className="text-[11px] text-[#B45309] mt-1 font-medium">
              Sedang diperbaiki siswa
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#FEF7E6] text-[#B45309] flex items-center justify-center">
            <AlertCircle size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#D5DDEB] shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs text-[#5B6882] font-semibold">Disetujui (Approved)</div>
            <div className="text-2xl font-bold text-[#1F6F4A] font-display mt-0.5">
              {totalApproved} Draf
            </div>
            <div className="text-[11px] text-[#1F6F4A] mt-1 font-medium">
              Siap submit ke beasiswa / sidang
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#E3F4EC] text-[#1F6F4A] flex items-center justify-center">
            <CheckCircle2 size={22} />
          </div>
        </div>
      </div>

      {/* Filter, Search & Sort Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#D5DDEB] shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-2.5 text-[#5B6882]" />
            <input
              type="text"
              placeholder="Cari judul naskah, nama siswa, target beasiswa, atau catatan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D5DDEB] focus-ring bg-white text-[#1B2A41]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Stage Filter Pills with Badges */}
            <div className="inline-flex rounded-xl bg-[#F4F7FB] p-1 border border-[#D5DDEB] text-xs">
              <button
                type="button"
                onClick={() => setStageFilter("ALL")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  stageFilter === "ALL"
                    ? "bg-white text-[#09408C] shadow-2xs"
                    : "text-[#5B6882] hover:text-[#09408C]"
                }`}
              >
                Semua ({documents.length})
              </button>
              <button
                type="button"
                onClick={() => setStageFilter("REVIEW_MENTOR")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  stageFilter === "REVIEW_MENTOR"
                    ? "bg-white text-[#09408C] shadow-2xs"
                    : "text-[#5B6882] hover:text-[#09408C]"
                }`}
              >
                Menunggu ({totalWaiting})
              </button>
              <button
                type="button"
                onClick={() => setStageFilter("REVISI")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  stageFilter === "REVISI"
                    ? "bg-white text-[#B45309] shadow-2xs"
                    : "text-[#5B6882] hover:text-[#B45309]"
                }`}
              >
                Revisi ({totalRevision})
              </button>
              <button
                type="button"
                onClick={() => setStageFilter("APPROVED")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  stageFilter === "APPROVED"
                    ? "bg-white text-[#1F6F4A] shadow-2xs"
                    : "text-[#5B6882] hover:text-[#1F6F4A]"
                }`}
              >
                Disetujui ({totalApproved})
              </button>
            </div>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[#D5DDEB] bg-white text-xs">
              <ArrowUpDown size={13} className="text-[#5B6882]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-[#1B2A41] font-medium outline-hidden cursor-pointer"
              >
                <option value="NEWEST">Terbaru Diperbarui</option>
                <option value="VERSION_DESC">Versi Tertinggi</option>
                <option value="STUDENT_ASC">Nama Siswa A - Z</option>
                <option value="TITLE_ASC">Judul A - Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#D5DDEB]/60">
          {[
            { key: "ALL", label: "Semua Kategori" },
            { key: "ESAI_BEASISWA", label: "Esai Beasiswa" },
            { key: "PROPOSAL_TESIS", label: "Proposal Tesis" },
            { key: "SKRIPSI_KTI", label: "Skripsi / KTI" },
            { key: "MOTIVATION_LETTER", label: "Motivation Letter" },
          ].map((c) => {
            const isSelected = categoryFilter === c.key;
            const count = categoryCounts[c.key] || 0;
            return (
              <button
                key={c.key}
                onClick={() => setCategoryFilter(c.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[#09408C] text-white shadow-xs font-bold"
                    : "bg-[#F4F7FB] text-[#5B6882] hover:bg-[#EAF1FA] hover:text-[#09408C]"
                }`}
              >
                <span>{c.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-[#D5DDEB]/60 text-[#5B6882]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Documents List */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#D5DDEB]">
          <FileText size={40} className="mx-auto text-[#9AC1E2] mb-3" />
          <h3 className="text-base font-bold text-[#1B2A41]">
            {search
              ? `Tidak ditemukan draf naskah yang memuat "${search}"`
              : "Belum ada draf naskah pada filter ini"}
          </h3>
          <p className="text-xs text-[#5B6882] mt-1 max-w-md mx-auto">
            {search
              ? "Coba gunakan kata kunci pencarian yang berbeda atau bersihkan filter."
              : "Klik tombol di atas untuk menambahkan draf naskah baru."}
          </p>
          {(search || stageFilter !== "ALL" || categoryFilter !== "ALL") && (
            <button
              onClick={() => {
                setStageFilter("ALL");
                setCategoryFilter("ALL");
                setSearch("");
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-[#EAF1FA] text-[#09408C] text-xs font-bold hover:bg-[#9AC1E2]/30 transition-colors"
            >
              Reset Semua Filter
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-3xl border border-[#D5DDEB] p-5 sm:p-6 shadow-xs hover:border-[#9AC1E2] transition-colors space-y-4"
            >
              {/* Header Card */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getStageBadge(doc.stage)}
                    <span className="px-2.5 py-0.5 rounded-full bg-[#F4F7FB] border border-[#D5DDEB] text-[11px] font-semibold text-[#09408C]">
                      {doc.category.replace(/_/g, " ")}
                    </span>
                    <span className="text-[11px] font-bold text-[#5B6882] bg-slate-100 px-2 py-0.5 rounded-md">
                      Versi {doc.version}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-[#1B2A41] font-display mt-1">
                    {doc.title}
                  </h3>

                  {doc.targetInstitution && (
                    <p className="text-xs text-[#09408C] font-semibold flex items-center gap-1">
                      <span>Target Lembaga / Kampus:</span>
                      <strong>{doc.targetInstitution}</strong>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                  {/* WhatsApp Notification Button */}
                  <button
                    type="button"
                    onClick={() => handleSendWhatsAppNotification(doc)}
                    className="px-3 py-2 rounded-xl bg-[#E3F4EC] text-[#1F6F4A] text-xs font-semibold hover:bg-[#1F6F4A] hover:text-white transition-colors flex items-center gap-1.5"
                    title="Kirim notifikasi ulasan & status ke WhatsApp siswa"
                  >
                    <MessageCircle size={14} />
                    <span>Notif WA Siswa</span>
                  </button>

                  {/* Read Document Modal */}
                  {doc.fileUrl && (
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="px-3 py-2 rounded-xl bg-[#EAF1FA] text-[#09408C] text-xs font-semibold hover:bg-[#D5DDEB] transition-colors flex items-center gap-1"
                      title="Pratinjau Draf Naskah"
                    >
                      <Eye size={14} />
                      <span>Baca Naskah</span>
                    </button>
                  )}

                  {/* Review Button */}
                  <button
                    onClick={() => openReviewModal(doc)}
                    className="px-3.5 py-2 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571] transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <MessageSquare size={14} />
                    <span>Beri Telaah Review</span>
                  </button>

                  {/* Edit metadata button */}
                  <button
                    onClick={() => openEditModal(doc)}
                    className="p-2 rounded-xl text-[#5B6882] hover:text-[#09408C] hover:bg-[#EAF1FA] transition-colors"
                    title="Edit Data Naskah"
                  >
                    <Edit3 size={15} />
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(doc.id, doc.title)}
                    className="p-2 rounded-xl text-[#5B6882] hover:text-[#B4381F] hover:bg-[#FBE9E5] transition-colors"
                    title="Hapus Naskah"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Student & File Information */}
              <div className="bg-[#F4F7FB] rounded-2xl p-4 border border-[#D5DDEB]/80 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[#5B6882] block text-[11px]">Siswa Pemohon:</span>
                  <strong className="text-[#1B2A41] text-xs font-bold block mt-0.5">
                    {doc.studentName}
                  </strong>
                  <span className="text-[10px] text-[#5B6882]">ID: {doc.studentId}</span>
                </div>

                <div>
                  <span className="text-[#5B6882] block text-[11px]">File Draf:</span>
                  <div className="flex items-center gap-1.5 font-semibold text-[#09408C] mt-0.5 truncate">
                    <FileText size={14} className="shrink-0" />
                    <span className="truncate">{doc.fileName}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[#5B6882] block text-[11px]">Tanggal Diperbarui:</span>
                  <span className="text-[#1B2A41] font-semibold mt-0.5 block">
                    {new Date(doc.updatedAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Student Notes / Requests */}
              {doc.studentNotes && (
                <div className="text-xs bg-amber-50/50 rounded-xl p-3 border border-amber-200/60 text-[#1B2A41]">
                  <strong className="text-amber-800 block mb-0.5">Catatan Permohonan Siswa:</strong>
                  <p className="leading-relaxed">{doc.studentNotes}</p>
                </div>
              )}

              {/* Mentor Notes / Feedback */}
              {doc.mentorNotes && (
                <div className="text-xs bg-[#EAF1FA]/70 rounded-2xl p-4 border border-[#9AC1E2]/60 text-[#1B2A41] space-y-1">
                  <div className="flex items-center justify-between text-[#09408C] font-bold text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <MessageSquare size={13} />
                      <span>Umpan Balik Mentor ({doc.mentorName || "Tim Akademik"}):</span>
                    </div>
                    {doc.reviewedAt && (
                      <span className="text-[10px] font-normal text-[#5B6882]">
                        {new Date(doc.reviewedAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                  <p className="leading-relaxed text-[#1B2A41] whitespace-pre-line pt-0.5">
                    {doc.mentorNotes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Pratinjau Naskah PDF */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full h-[90vh] shadow-2xl border border-[#D5DDEB] flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#D5DDEB] flex items-center justify-between gap-3 bg-[#F4F7FB]/70">
              <div className="flex items-center gap-3 truncate">
                <div className="w-10 h-10 rounded-xl bg-[#EAF1FA] text-[#09408C] flex items-center justify-center shrink-0">
                  <FileText size={20} />
                </div>
                <div className="truncate">
                  <h3 className="text-sm sm:text-base font-bold text-[#09408C] font-display truncate">
                    {previewDoc.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-[#5B6882] mt-0.5">
                    <span className="font-semibold text-[#295897]">Siswa: {previewDoc.studentName}</span>
                    <span>•</span>
                    <span>{previewDoc.fileName} (Versi {previewDoc.version})</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {previewDoc.fileUrl && (
                  <a
                    href={previewDoc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl text-[#5B6882] hover:text-[#09408C] hover:bg-[#EAF1FA] transition-colors"
                    title="Buka di Tab Baru"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-2 rounded-xl text-[#5B6882] hover:text-[#1B2A41] hover:bg-[#EAF1FA] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-100 p-2 sm:p-4 overflow-hidden">
              {previewDoc.fileUrl ? (
                previewDoc.fileName?.toLowerCase().endsWith(".pdf") || previewDoc.fileUrl?.toLowerCase().includes(".pdf") ? (
                  <iframe
                    src={`${previewDoc.fileUrl}#toolbar=1`}
                    title={previewDoc.title}
                    className="w-full h-full rounded-2xl bg-white border border-[#D5DDEB] shadow-inner"
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl border border-[#D5DDEB]">
                    <div className="w-16 h-16 rounded-2xl bg-[#EAF1FA] text-[#09408C] flex items-center justify-center mb-4 shadow-xs">
                      <FileText size={32} />
                    </div>
                    <h4 className="text-base font-bold text-[#1B2A41] font-display">
                      Format Berkas: {previewDoc.fileName?.split(".").pop()?.toUpperCase() || "DOCX"}
                    </h4>
                    <p className="text-xs text-[#5B6882] mt-1.5 max-w-md leading-relaxed">
                      Browser tidak mendukung pratinjau inline untuk format dokumen Word (.docx / .doc). Silakan unduh berkas untuk membaca dan memeriksa di Microsoft Word atau Google Docs.
                    </p>
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                      <a
                        href={previewDoc.fileUrl}
                        download={previewDoc.fileName}
                        className="px-5 py-2.5 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571] flex items-center gap-2 shadow-xs transition-colors"
                      >
                        <Download size={15} />
                        <span>Unduh Berkas {previewDoc.fileName}</span>
                      </a>
                      <a
                        href={previewDoc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 rounded-xl border border-[#D5DDEB] text-[#09408C] text-xs font-semibold hover:bg-[#F4F7FB] flex items-center gap-1.5 transition-colors"
                      >
                        <ExternalLink size={14} />
                        <span>Buka Tautan Berkas</span>
                      </a>
                    </div>
                  </div>
                )
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#5B6882]">
                  <FileText size={48} className="text-[#9AC1E2] mb-3" />
                  <p className="text-sm font-bold text-[#1B2A41]">Berkas tidak dapat dipratinjau secara inline</p>
                  <p className="text-xs mt-1">Gunakan tombol buka di tab baru atau unduh berkas.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Beri Catatan Review Mentor */}
      {isReviewModalOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-xl border border-[#D5DDEB] space-y-5 animate-in fade-in duration-200 max-h-[90vh] overflow-y-auto">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF1FA] text-[#09408C] text-[11px] font-bold border border-[#9AC1E2] mb-1">
                <span>Versi {selectedDoc.version}</span>
              </div>
              <h3 className="text-xl font-bold text-[#09408C] font-display">
                Telaah & Evaluasi Naskah
              </h3>
              <p className="text-xs text-[#5B6882] mt-0.5">
                Draf: <strong>{selectedDoc.title}</strong> (Siswa: {selectedDoc.studentName})
              </p>
            </div>

            <form onSubmit={handleSaveReview} className="space-y-4">
              <div>
                <label htmlFor="doc-review-stage" className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Keputusan Tahap / Status Naskah *
                </label>
                <select
                  id="doc-review-stage"
                  value={reviewStage}
                  onChange={(e) => setReviewStage(e.target.value as DocumentStage)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring bg-white font-bold text-[#1B2A41]"
                >
                  <option value="REVIEW_MENTOR">Sedang Ditelaah Mentor</option>
                  <option value="REVISI">Perlu Revisi Tambahan (Versi Baru)</option>
                  <option value="APPROVED">Disetujui / Siap Diajukan (Approved)</option>
                </select>
              </div>

              <div>
                <label htmlFor="doc-mentor-name" className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Nama Mentor / Penelaah
                </label>
                <input
                  id="doc-mentor-name"
                  type="text"
                  required
                  value={mentorName}
                  onChange={(e) => setMentorName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring text-[#1B2A41]"
                />
              </div>

              {/* Template Feedback Cepat */}
              <div>
                <div className="text-[11px] font-semibold text-[#5B6882] mb-1.5">
                  Template Evaluasi Cepat:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Argumen latar belakang sudah runtut dan kuat.",
                    "Pertegas data kuantitatif daerah/studi kasus agar lebih meyakinkan.",
                    "Sesuaikan gaya bahasa academic writing agar lebih formal.",
                    "Sempurnakan perumusan Research Gap dan State of the Art.",
                    "Format sitasi pustaka perlu diselaraskan dengan Mendeley/APA style.",
                    "Novelty metodologi sudah sangat tajam dan siap diajukan.",
                  ].map((tip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => insertTemplateNote(tip)}
                      className="px-2.5 py-1 rounded-lg bg-[#F4F7FB] hover:bg-[#EAF1FA] text-[10px] text-[#09408C] font-medium border border-[#D5DDEB] transition-colors"
                    >
                      + {tip.slice(0, 32)}...
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="doc-mentor-notes" className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Catatan Evaluasi, Ulasan Argumen & Saran Perbaikan *
                </label>
                <textarea
                  id="doc-mentor-notes"
                  rows={5}
                  required
                  placeholder="Uraikan kelebihan naskah, bagian yang perlu penajaman data/sitasi, serta rekomendasi perbaikan tata bahasa..."
                  value={mentorNotes}
                  onChange={(e) => setMentorNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring text-[#1B2A41]"
                />
              </div>

              <div className="pt-3 border-t border-[#D5DDEB] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleSendWhatsAppNotification(selectedDoc)}
                  className="px-3 py-2 rounded-xl bg-[#E3F4EC] text-[#1F6F4A] text-xs font-semibold hover:bg-[#1F6F4A] hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <MessageCircle size={14} />
                  <span>Kirim via WA</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5B6882] hover:bg-[#F4F7FB]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571] disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Send size={14} />
                    <span>{isSubmitting ? "Menyimpan..." : "Simpan Evaluasi"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Draf Dokumen Baru (Admin) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-xl border border-[#D5DDEB] space-y-5 animate-in fade-in duration-200 max-h-[90vh] overflow-y-auto">
            <div>
              <h3 className="text-xl font-bold text-[#09408C] font-display">
                Tambah Draf Naskah Baru
              </h3>
              <p className="text-xs text-[#5B6882] mt-0.5">
                Unggah atau catat naskah akademik/esai beasiswa milik siswa.
              </p>
            </div>

            <form onSubmit={handleCreateDocument} className="space-y-4">
              <div>
                <label htmlFor="new-doc-title" className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Judul Dokumen / Esai *
                </label>
                <input
                  id="new-doc-title"
                  type="text"
                  required
                  placeholder="Contoh: Esai Kontribusi LPDP Tahap 1"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="new-student-name" className="block text-xs font-bold text-[#1B2A41] mb-1">
                    Nama Siswa *
                  </label>
                  <input
                    id="new-student-name"
                    type="text"
                    required
                    placeholder="Contoh: Dinda Kirana"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring"
                  />
                </div>

                <div>
                  <label htmlFor="new-category" className="block text-xs font-bold text-[#1B2A41] mb-1">
                    Kategori Naskah
                  </label>
                  <select
                    id="new-category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as DocumentCategory)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring bg-white"
                  >
                    <option value="ESAI_BEASISWA">Esai Beasiswa</option>
                    <option value="PROPOSAL_TESIS">Proposal Tesis</option>
                    <option value="SKRIPSI_KTI">Skripsi / KTI</option>
                    <option value="MOTIVATION_LETTER">Motivation Letter</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="new-target-inst" className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Target Lembaga / Beasiswa / Kampus
                </label>
                <input
                  id="new-target-inst"
                  type="text"
                  placeholder="Contoh: LPDP Kemenkeu RI / ITB S2 Informatika"
                  value={newTargetInstitution}
                  onChange={(e) => setNewTargetInstitution(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="new-file-name" className="block text-xs font-bold text-[#1B2A41] mb-1">
                    Nama Berkas
                  </label>
                  <input
                    id="new-file-name"
                    type="text"
                    placeholder="Contoh: Esai_LPDP_Dinda.pdf"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring"
                  />
                </div>

                <div>
                  <label htmlFor="new-file-url" className="block text-xs font-bold text-[#1B2A41] mb-1">
                    Tautan / URL Berkas
                  </label>
                  <input
                    id="new-file-url"
                    type="text"
                    placeholder="Contoh: /materials/sample-document.pdf"
                    value={newFileUrl}
                    onChange={(e) => setNewFileUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="new-notes" className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Catatan Siswa / Pokok Masalah yang Ingin Ditelaah
                </label>
                <textarea
                  id="new-notes"
                  rows={3}
                  placeholder="Misal: Mohon koreksi bagian Research Gap dan relevansi rencana studi..."
                  value={newStudentNotes}
                  onChange={(e) => setNewStudentNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring"
                />
              </div>

              <div className="pt-3 border-t border-[#D5DDEB] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5B6882] hover:bg-[#F4F7FB]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571] disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Draf Naskah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Data Dokumen */}
      {isEditModalOpen && editingDoc && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-xl border border-[#D5DDEB] space-y-5 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xl font-bold text-[#09408C] font-display">
                Edit Data Naskah
              </h3>
              <p className="text-xs text-[#5B6882] mt-0.5">
                Perbarui judul, kategori, atau target lembaga dokumen.
              </p>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label htmlFor="edit-doc-title" className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Judul Dokumen *
                </label>
                <input
                  id="edit-doc-title"
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="edit-category" className="block text-xs font-bold text-[#1B2A41] mb-1">
                    Kategori Naskah
                  </label>
                  <select
                    id="edit-category"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as DocumentCategory)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring bg-white"
                  >
                    <option value="ESAI_BEASISWA">Esai Beasiswa</option>
                    <option value="PROPOSAL_TESIS">Proposal Tesis</option>
                    <option value="SKRIPSI_KTI">Skripsi / KTI</option>
                    <option value="MOTIVATION_LETTER">Motivation Letter</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="edit-target-inst" className="block text-xs font-bold text-[#1B2A41] mb-1">
                    Target Lembaga / Kampus
                  </label>
                  <input
                    id="edit-target-inst"
                    type="text"
                    value={editTargetInstitution}
                    onChange={(e) => setEditTargetInstitution(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="edit-file-name" className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Nama Berkas
                </label>
                <input
                  id="edit-file-name"
                  type="text"
                  value={editFileName}
                  onChange={(e) => setEditFileName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring"
                />
              </div>

              <div>
                <label htmlFor="edit-notes" className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Catatan Permohonan Siswa
                </label>
                <textarea
                  id="edit-notes"
                  rows={3}
                  value={editStudentNotes}
                  onChange={(e) => setEditStudentNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring"
                />
              </div>

              <div className="pt-3 border-t border-[#D5DDEB] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5B6882] hover:bg-[#F4F7FB]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571] disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
