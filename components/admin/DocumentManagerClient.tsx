"use client";

import { useState } from "react";
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
} from "lucide-react";
import type { AcademicDocument, DocumentStage, DocumentCategory } from "@/actions/dokumen";
import { reviewDocument } from "@/actions/dokumen";
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
  const [selectedDoc, setSelectedDoc] = useState<AcademicDocument | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Review Form State
  const [reviewStage, setReviewStage] = useState<DocumentStage>("APPROVED");
  const [mentorName, setMentorName] = useState("Tim Mentor Akademik Sahabat Belajar");
  const [mentorNotes, setMentorNotes] = useState("");

  const filteredDocs = documents.filter((doc) => {
    const matchStage = stageFilter === "ALL" || doc.stage === stageFilter;
    const matchSearch =
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.studentName.toLowerCase().includes(search.toLowerCase()) ||
      (doc.targetInstitution && doc.targetInstitution.toLowerCase().includes(search.toLowerCase()));
    return matchStage && matchSearch;
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
    if (!selectedDoc || !mentorNotes.trim()) return;

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
        "Catatan telaah mentor dan status draf naskah berhasil diperbarui."
      );
    } else {
      toast.error("Gagal Menyimpan", res.message);
    }
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
            <span>Roadmap Fase 3: Review Dokumen Ilmiah & Esai Beasiswa</span>
          </div>
          <h1 className="text-2xl font-bold text-[#09408C] font-display">
            Bimbingan & Koreksi Naskah Akademik
          </h1>
          <p className="text-sm text-[#5B6882] mt-0.5">
            Layanan telaah proposal tesis, esai LPDP/AAS, motivation letter, dan skripsi untuk peserta program lanjutan.
          </p>
        </div>
      </div>

      {/* Roadmap Phase 3 Notice Banner */}
      <div className="bg-[#EAF1FA]/80 border border-[#9AC1E2] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-[#09408C]">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-white text-[#09408C] shadow-2xs shrink-0 mt-0.5">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="font-bold text-sm text-[#09408C]">
              Pratinjau Interaktif — Roadmap Fase 3 (Review Dokumen & Esai Beasiswa)
            </div>
            <p className="text-[#5B6882] mt-0.5 leading-relaxed">
              Modul bimbingan khusus untuk telaah berkas akademik peserta (esai LPDP, proposal tesis S2/S3, dan personal statement) sesuai PRD Modul I. Anda dapat menguji alur review mentor, status revisi, dan catatan perbaikan secara interaktif.
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#09408C] text-white font-bold text-[11px]">
            Preview Aktif
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
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D5DDEB] focus-ring bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { key: "ALL", label: "Semua Draf" },
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
        </div>
      </div>

      {/* Documents List */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#D5DDEB]">
          <FileText size={40} className="mx-auto text-[#9AC1E2] mb-3" />
          <h3 className="text-base font-bold text-[#1B2A41]">
            Tidak ada draf dokumen
          </h3>
          <p className="text-xs text-[#5B6882] mt-1">
            Belum ada naskah yang dikirimkan pada kategori filter ini.
          </p>
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
                      {doc.category.replace("_", " ")}
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
                  <button
                    onClick={() => openReviewModal(doc)}
                    className="px-4 py-2 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571] transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <MessageSquare size={14} />
                    <span>Beri Catatan Review</span>
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
                        {new Date(doc.reviewedAt).toLocaleDateString("id-ID")}
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

      {/* Modal Beri Catatan Review Mentor */}
      {isReviewModalOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-xl border border-[#D5DDEB] space-y-5 animate-in fade-in duration-200">
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
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring bg-white font-bold"
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
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring"
                />
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
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring"
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
                  className="px-5 py-2.5 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571] disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Evaluasi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
