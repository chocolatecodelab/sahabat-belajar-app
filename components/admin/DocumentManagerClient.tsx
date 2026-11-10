"use client";

import { useState, useEffect } from "react";
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
  Sparkles,
  Send,
  MessageSquare,
  ChevronRight,
  Eye,
  Trash2,
  X,
  RotateCcw,
  Layers,
} from "lucide-react";
import type { AcademicDocument, DocumentStage, DocumentCategory } from "@/actions/dokumen";
import { reviewDocument, deleteDocument } from "@/actions/dokumen";
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
  const [selectedDoc, setSelectedDoc] = useState<AcademicDocument | null>(null);
  const [previewDoc, setPreviewDoc] = useState<AcademicDocument | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Escape key listener to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (previewDoc) setPreviewDoc(null);
        if (isReviewModalOpen) setIsReviewModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewDoc, isReviewModalOpen]);

  // Review Form State
  const [reviewStage, setReviewStage] = useState<DocumentStage>("APPROVED");
  const [mentorName, setMentorName] = useState("Tim Mentor Akademik Sahabat Belajar");
  const [mentorNotes, setMentorNotes] = useState("");

  const filteredDocs = documents.filter((doc) => {
    const matchStage = stageFilter === "ALL" || doc.stage === stageFilter;
    const matchCat = categoryFilter === "ALL" || doc.category === categoryFilter;
    const matchSearch =
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.studentName.toLowerCase().includes(search.toLowerCase()) ||
      (doc.targetInstitution && doc.targetInstitution.toLowerCase().includes(search.toLowerCase()));
    return matchStage && matchCat && matchSearch;
  });

  // Metrics
  const totalWaiting = documents.filter((d) => d.stage === "REVIEW_MENTOR").length;
  const totalRevision = documents.filter((d) => d.stage === "REVISI").length;
  const totalApproved = documents.filter((d) => d.stage === "APPROVED").length;

  const openReviewModal = (doc: AcademicDocument) => {
    setSelectedDoc(doc);
    setReviewStage(doc.stage === "REVIEW_MENTOR" ? "APPROVED" : doc.stage);
    setMentorName(doc.mentorName || "Dr. Hendra Wijaya / Mentor Akademik");
    setMentorNotes(doc.mentorNotes || "");
    setIsReviewModalOpen(true);
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
              }
            : d
        )
      );
      setIsReviewModalOpen(false);
      toast.success(
        "Evaluasi Disimpan",
        "Catatan telaah mentor dan status draf naskah berhasil diperbarui di database."
      );
    } else {
      toast.error("Gagal Menyimpan", res.message);
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
            <span>Siap Diajukan (Approved)</span>
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
            Bimbingan & Koreksi Naskah Akademik
          </h1>
          <p className="text-sm text-[#5B6882] mt-0.5">
            Layanan telaah proposal tesis, esai LPDP/AAS, motivation letter, dan skripsi untuk peserta program lanjutan.
          </p>
        </div>
      </div>

      {/* Production Notice Banner */}
      <div className="bg-[#EAF1FA]/80 border border-[#9AC1E2] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-[#09408C]">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-white text-[#09408C] shadow-2xs shrink-0 mt-0.5">
            <Layers size={18} />
          </div>
          <div>
            <div className="font-bold text-sm text-[#09408C]">
              Sinkronisasi Langsung ke Portal Siswa (Database Cloud Terhubung)
            </div>
            <p className="text-[#5B6882] mt-0.5 leading-relaxed">
              Seluruh telaah mentor, draf revisi, dan status persetujuan tersimpan di cloud database Supabase dan langsung dapat diakses oleh siswa di menu <strong>Review Dokumen</strong> pada Portal Siswa.
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#09408C] text-white font-bold text-[11px] flex items-center gap-1">
            <CheckCircle2 size={12} />
            <span>Database Aktif</span>
          </span>
        </div>
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
              Siap submit ke beasiswa/sidang
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#E3F4EC] text-[#1F6F4A] flex items-center justify-center">
            <CheckCircle2 size={22} />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#D5DDEB] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-2.5 text-[#5B6882]" />
          <input
            type="text"
            placeholder="Cari judul draf, siswa, atau beasiswa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D5DDEB] focus-ring bg-white text-[#1B2A41]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { key: "ALL", label: "Semua Status" },
            { key: "REVIEW_MENTOR", label: "Menunggu Review" },
            { key: "REVISI", label: "Perlu Revisi" },
            { key: "APPROVED", label: "Disetujui" },
          ].map((st) => (
            <button
              key={st.key}
              onClick={() => setStageFilter(st.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                stageFilter === st.key
                  ? "bg-[#09408C] text-white shadow-2xs"
                  : "bg-[#F4F7FB] text-[#5B6882] hover:bg-[#EAF1FA] hover:text-[#09408C]"
              }`}
            >
              {st.label}
            </button>
          ))}

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-[#D5DDEB] bg-white text-[#5B6882] focus-ring"
          >
            <option value="ALL">Semua Kategori</option>
            <option value="ESAI_BEASISWA">Esai Beasiswa</option>
            <option value="PROPOSAL_TESIS">Proposal Tesis</option>
            <option value="SKRIPSI_KTI">Skripsi / KTI</option>
            <option value="MOTIVATION_LETTER">Motivation Letter</option>
          </select>

          {(stageFilter !== "ALL" || categoryFilter !== "ALL" || search) && (
            <button
              onClick={() => {
                setStageFilter("ALL");
                setCategoryFilter("ALL");
                setSearch("");
              }}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[#B4381F] hover:bg-[#FBE9E5] transition-colors flex items-center gap-1"
              title="Reset Filter"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Documents List */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#D5DDEB]">
          <FileText size={40} className="mx-auto text-[#9AC1E2] mb-3" />
          <h3 className="text-base font-bold text-[#1B2A41]">
            Tidak ada draf dokumen
          </h3>
          <p className="text-xs text-[#5B6882] mt-1 mb-4">
            Belum ada naskah yang dikirimkan pada filter ini.
          </p>
          <button
            onClick={() => {
              setStageFilter("ALL");
              setCategoryFilter("ALL");
              setSearch("");
            }}
            className="px-4 py-2 rounded-xl bg-[#EAF1FA] text-[#09408C] text-xs font-semibold hover:bg-[#D5DDEB]"
          >
            Tampilkan Semua Naskah
          </button>
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

                <div className="flex items-center gap-2 shrink-0">
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

                  <button
                    onClick={() => openReviewModal(doc)}
                    className="px-4 py-2 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571] transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <MessageSquare size={14} />
                    <span>Beri Catatan Review</span>
                  </button>

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
                      <Sparkles size={13} />
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

              <div className="pt-3 border-t border-[#D5DDEB] flex items-center justify-end gap-2">
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
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
