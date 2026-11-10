"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileEdit,
  ArrowLeft,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Upload,
  Sparkles,
  MessageSquare,
  ExternalLink,
  ChevronRight,
  Award,
  Eye,
  Download,
  X,
  RotateCcw,
  Send,
} from "lucide-react";
import type { AcademicDocument, DocumentCategory, DocumentStage } from "@/actions/dokumen";
import { submitStudentDocument, uploadRevisedDraft } from "@/actions/dokumen";
import { useToast } from "@/components/ui/Toast";

export default function StudentDocumentClient({
  initialDocuments = [],
  studentId = "std_demo_01",
  studentName = "Ahmad Fauzi",
}: {
  initialDocuments: AcademicDocument[];
  studentId?: string;
  studentName?: string;
}) {
  const toast = useToast();
  const [documents, setDocuments] = useState<AcademicDocument[]>(initialDocuments);
  const [stageFilter, setStageFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form State for New Submission
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<DocumentCategory>("ESAI_BEASISWA");
  const [targetInstitution, setTargetInstitution] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [studentNotes, setStudentNotes] = useState("");

  // Revision Modal State
  const [revisionDoc, setRevisionDoc] = useState<AcademicDocument | null>(null);
  const [revisionFileName, setRevisionFileName] = useState("");
  const [revisionFileUrl, setRevisionFileUrl] = useState("");
  const [revisionNotes, setRevisionNotes] = useState("");
  const [isRevisionSubmitting, setIsRevisionSubmitting] = useState(false);
  const [isRevisionUploading, setIsRevisionUploading] = useState(false);

  // Document Preview Modal State
  const [previewDoc, setPreviewDoc] = useState<AcademicDocument | null>(null);

  const filteredDocs = documents.filter((doc) => {
    return stageFilter === "ALL" || doc.stage === stageFilter;
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isRevision: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error("File Terlalu Besar", "Ukuran file maksimal 15MB.");
      return;
    }

    try {
      if (isRevision) {
        setIsRevisionUploading(true);
      } else {
        setIsUploading(true);
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "submissions");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Gagal mengunggah berkas");
      }

      if (isRevision) {
        setRevisionFileUrl(data.url);
        setRevisionFileName(file.name);
      } else {
        setFileUrl(data.url);
        setFileName(file.name);
      }

      toast.success("File Terunggah", `Berkas ${file.name} siap dikirim.`);
    } catch (err: any) {
      toast.error("Gagal Mengunggah", err.message || "Terjadi kesalahan unggah berkas.");
    } finally {
      if (isRevision) {
        setIsRevisionUploading(false);
      } else {
        setIsUploading(false);
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Judul Wajib Diisi", "Mohon masukkan judul dokumen/esai.");
      return;
    }

    setIsSubmitting(true);
    const res = await submitStudentDocument({
      studentId,
      studentName,
      title,
      category,
      targetInstitution,
      fileName: fileName || `${title.replace(/\s+/g, "_")}_Draft.pdf`,
      fileUrl: fileUrl || "/materials/sample-document.pdf",
      studentNotes,
    });
    setIsSubmitting(false);

    if (res.success && res.data) {
      const newDoc: AcademicDocument = {
        id: res.data.id,
        studentId,
        studentName,
        title,
        category,
        targetInstitution: targetInstitution || null,
        stage: "REVIEW_MENTOR",
        version: 1,
        fileName: fileName || `${title.replace(/\s+/g, "_")}_Draft.pdf`,
        fileUrl: fileUrl || "/materials/sample-document.pdf",
        studentNotes: studentNotes || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setDocuments([newDoc, ...documents]);
      setIsModalOpen(false);
      toast.success(
        "Draf Berhasil Dikirim",
        "Naskah Anda telah masuk ke antrean telaah mentor akademik Sahabat Belajar."
      );
      // Reset
      setTitle("");
      setTargetInstitution("");
      setFileName("");
      setFileUrl("");
      setStudentNotes("");
    } else {
      toast.error("Gagal Mengunggah", res.message);
    }
  };

  const handleOpenRevision = (doc: AcademicDocument) => {
    setRevisionDoc(doc);
    setRevisionFileName("");
    setRevisionFileUrl("");
    setRevisionNotes("");
  };

  const handleSubmitRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionDoc) return;

    if (!revisionFileName && !revisionFileUrl) {
      toast.error("Berkas Revisi Diperlukan", "Mohon pilih file draf yang telah Anda revisi.");
      return;
    }

    setIsRevisionSubmitting(true);
    const res = await uploadRevisedDraft(revisionDoc.id, {
      fileName: revisionFileName || `${revisionDoc.title}_Rev.pdf`,
      fileUrl: revisionFileUrl || revisionDoc.fileUrl || "/materials/sample-document.pdf",
      studentNotes: revisionNotes,
    });
    setIsRevisionSubmitting(false);

    if (res.success && res.data) {
      setDocuments(
        documents.map((d) =>
          d.id === revisionDoc.id
            ? {
                ...d,
                stage: "REVIEW_MENTOR",
                version: res.data!.newVersion,
                fileName: revisionFileName || d.fileName,
                fileUrl: revisionFileUrl || d.fileUrl,
                studentNotes: revisionNotes || d.studentNotes,
                updatedAt: new Date().toISOString(),
              }
            : d
        )
      );
      setRevisionDoc(null);
      toast.success(
        "Draf Revisi Terkirim",
        `Revisi Versi ${res.data.newVersion} berhasil dikirim kembali ke mentor.`
      );
    } else {
      toast.error("Gagal Mengunggah Revisi", res.message);
    }
  };

  const getStageInfo = (stage: DocumentStage) => {
    switch (stage) {
      case "REVIEW_MENTOR":
        return {
          label: "Sedang Ditelaah Mentor",
          bg: "bg-[#EAF1FA] text-[#09408C] border-[#9AC1E2]",
          icon: <Clock size={14} />,
        };
      case "REVISI":
        return {
          label: "Perlu Revisi (Cek Catatan)",
          bg: "bg-[#FEF7E6] text-[#B45309] border-[#F5B82E]/50",
          icon: <AlertCircle size={14} />,
        };
      case "APPROVED":
        return {
          label: "Disetujui / Siap Submit (Approved)",
          bg: "bg-[#E3F4EC] text-[#1F6F4A] border-[#1F6F4A]/30",
          icon: <CheckCircle2 size={14} />,
        };
      default:
        return {
          label: "Draf Awal",
          bg: "bg-slate-100 text-[#5B6882] border-[#D5DDEB]",
          icon: <FileText size={14} />,
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-[#1B2A41] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/portal"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B6882] hover:text-[#09408C] mb-2 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Kembali ke Portal Siswa</span>
            </Link>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF1FA] text-[#09408C] text-xs font-bold border border-[#9AC1E2] mb-1 block w-fit">
              <Sparkles size={13} />
              <span>Layanan Bimbingan Program Lanjutan</span>
            </div>

            <h1 className="text-2xl font-bold text-[#09408C] font-display">
              Review Draf Dokumen & Esai Beasiswa
            </h1>
            <p className="text-xs sm:text-sm text-[#5B6882] mt-0.5 max-w-xl">
              Kirimkan draf esai LPDP/AAS, proposal riset tesis/disertasi, atau motivation letter Anda untuk ditelaah mendalam oleh mentor ahli Sahabat Belajar.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571] transition-colors shadow-xs shrink-0"
          >
            <Upload size={15} />
            <span>Kirim Draf Baru</span>
          </button>
        </div>

        {/* Informative Guidance Banner */}
        <div className="bg-white rounded-3xl p-6 border border-[#D5DDEB] shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-[#09408C] font-display flex items-center gap-2">
            <Award size={16} />
            <span>Alur Koreksi Akademik 4 Tahap</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-3 rounded-2xl bg-[#F4F7FB] border border-[#D5DDEB]">
              <div className="font-bold text-[#09408C]">1. Unggah Draf</div>
              <div className="text-[10px] text-[#5B6882] mt-0.5">Format PDF / DOCX</div>
            </div>
            <div className="p-3 rounded-2xl bg-[#F4F7FB] border border-[#D5DDEB]">
              <div className="font-bold text-[#09408C]">2. Telaah Mentor</div>
              <div className="text-[10px] text-[#5B6882] mt-0.5">Review argumen & data</div>
            </div>
            <div className="p-3 rounded-2xl bg-[#F4F7FB] border border-[#D5DDEB]">
              <div className="font-bold text-[#B45309]">3. Revisi Siswa</div>
              <div className="text-[10px] text-[#5B6882] mt-0.5">Catatan & masukan</div>
            </div>
            <div className="p-3 rounded-2xl bg-[#F4F7FB] border border-[#D5DDEB]">
              <div className="font-bold text-[#1F6F4A]">4. Final Approved</div>
              <div className="text-[10px] text-[#5B6882] mt-0.5">Siap submit pendaftaran</div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { key: "ALL", label: "Semua Naskah" },
            { key: "REVIEW_MENTOR", label: "Sedang Ditelaah" },
            { key: "REVISI", label: "Perlu Revisi" },
            { key: "APPROVED", label: "Disetujui" },
          ].map((st) => (
            <button
              key={st.key}
              onClick={() => setStageFilter(st.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
                stageFilter === st.key
                  ? "bg-[#09408C] text-white border-[#09408C] shadow-2xs"
                  : "bg-white text-[#5B6882] border-[#D5DDEB] hover:border-[#9AC1E2] hover:text-[#1B2A41]"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Documents List */}
        {filteredDocs.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#D5DDEB]">
            <FileEdit size={40} className="mx-auto text-[#9AC1E2] mb-3" />
            <h3 className="text-base font-bold text-[#1B2A41]">
              Belum Ada Draf yang Dikirim
            </h3>
            <p className="text-xs text-[#5B6882] mt-1 max-w-md mx-auto">
              Mulai kirimkan draf esai atau proposal penelitian Anda untuk mendapatkan masukan mendalam dari tim mentor Sahabat Belajar.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571]"
            >
              <Upload size={15} />
              <span>Kirim Draf Pertama</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDocs.map((doc) => {
              const stageBadge = getStageInfo(doc.stage);

              return (
                <div
                  key={doc.id}
                  className="bg-white rounded-3xl border border-[#D5DDEB] p-5 sm:p-6 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${stageBadge.bg}`}
                        >
                          {stageBadge.icon}
                          <span>{stageBadge.label}</span>
                        </span>

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
                        <p className="text-xs text-[#09408C] font-semibold">
                          Target: <strong>{doc.targetInstitution}</strong>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {doc.fileUrl && (
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="px-3 py-1.5 rounded-xl bg-[#EAF1FA] text-[#09408C] text-xs font-semibold hover:bg-[#D5DDEB] transition-colors flex items-center gap-1"
                        >
                          <Eye size={13} />
                          <span>Baca Draf</span>
                        </button>
                      )}

                      {doc.stage === "REVISI" && (
                        <button
                          onClick={() => handleOpenRevision(doc)}
                          className="px-3 py-1.5 rounded-xl bg-[#B45309] text-white text-xs font-semibold hover:bg-[#92400E] transition-colors flex items-center gap-1 shadow-xs"
                        >
                          <Upload size={13} />
                          <span>Unggah Revisi V{doc.version + 1}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* File Attachment Pill */}
                  <div className="bg-[#F4F7FB] rounded-2xl p-3 border border-[#D5DDEB] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-[#09408C] font-semibold truncate">
                      <FileText size={16} className="shrink-0" />
                      <span className="truncate">{doc.fileName}</span>
                    </div>
                    {doc.fileUrl ? (
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-[#09408C] font-bold hover:underline shrink-0 flex items-center gap-1"
                      >
                        <Download size={13} />
                        <span>Unduh Berkas</span>
                      </a>
                    ) : (
                      <span className="text-[11px] text-[#5B6882] shrink-0 font-medium">
                        Tersimpan Aman
                      </span>
                    )}
                  </div>

                  {/* Student Request Notes */}
                  {doc.studentNotes && (
                    <div className="text-xs bg-amber-50/50 rounded-xl p-3 border border-amber-200/60 text-[#1B2A41]">
                      <strong className="text-amber-800 block mb-0.5">Catatan Anda untuk Mentor:</strong>
                      <p className="leading-relaxed">{doc.studentNotes}</p>
                    </div>
                  )}

                  {/* Mentor Feedback Box */}
                  {doc.mentorNotes ? (
                    <div className="bg-[#EAF1FA] rounded-2xl p-4 border border-[#9AC1E2] text-xs text-[#1B2A41] space-y-1">
                      <div className="flex items-center justify-between text-[#09408C] font-bold text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Sparkles size={14} className="text-[#09408C]" />
                          <span>Masukan & Telaah dari {doc.mentorName || "Mentor Akademik"}:</span>
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
                      <p className="leading-relaxed whitespace-pre-line pt-0.5">
                        {doc.mentorNotes}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-[#F4F7FB] rounded-xl p-3 border border-dashed border-[#D5DDEB] text-xs text-[#5B6882] text-center">
                      Naskah Anda sedang dalam antrean telaah oleh tim mentor akademik Sahabat Belajar.
                    </div>
                  )}
                </div>
              );
            })}
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
                    <h3 className="text-sm sm:text-base font-bold text-[#09408C] font-heading truncate">
                      {previewDoc.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-[#5B6882] mt-0.5">
                      <span className="font-semibold text-[#295897]">{previewDoc.category.replace(/_/g, " ")}</span>
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
                  <iframe
                    src={`${previewDoc.fileUrl}#toolbar=1`}
                    title={previewDoc.title}
                    className="w-full h-full rounded-2xl bg-white border border-[#D5DDEB] shadow-inner"
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#5B6882]">
                    <FileText size={48} className="text-[#9AC1E2] mb-3" />
                    <p className="text-sm font-bold text-[#1B2A41]">Berkas tidak dapat dipratinjau secara inline</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal Unggah Revisi Naskah */}
        {revisionDoc && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-xl border border-[#D5DDEB] space-y-5 animate-in fade-in duration-200">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FEF7E6] text-[#B45309] text-[11px] font-bold border border-[#F5B82E]/50 mb-1">
                  <span>Unggah Revisi Versi {revisionDoc.version + 1}</span>
                </div>
                <h3 className="text-xl font-bold text-[#09408C] font-display">
                  Kirim Draf Revisi Naskah
                </h3>
                <p className="text-xs text-[#5B6882] mt-0.5">
                  Naskah: <strong>{revisionDoc.title}</strong>
                </p>
              </div>

              <form onSubmit={handleSubmitRevision} className="space-y-4">
                {/* File Picker */}
                <div className="p-3.5 rounded-2xl bg-[#F4F7FB] border border-[#D5DDEB] space-y-2">
                  <label className="block text-xs font-bold text-[#09408C]">
                    Unggah Berkas Naskah yang Telah Direvisi (PDF / DOCX) *
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={(e) => handleFileUpload(e, true)}
                      disabled={isRevisionUploading}
                      className="text-xs text-[#5B6882] file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#09408C] file:text-white hover:file:bg-[#0E3571] cursor-pointer"
                    />
                    {isRevisionUploading && (
                      <span className="text-xs text-[#09408C] font-semibold animate-pulse">
                        Mengunggah...
                      </span>
                    )}
                  </div>
                  {revisionFileName && (
                    <div className="text-[11px] text-[#1F6F4A] flex items-center gap-1 font-medium mt-1">
                      <CheckCircle2 size={12} />
                      <span>Berkas revisi siap: {revisionFileName}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="rev-notes" className="block text-xs font-bold text-[#1B2A41] mb-1">
                    Catatan Perbaikan Siswa (Poin-poin yang Telah Direvisi)
                  </label>
                  <textarea
                    id="rev-notes"
                    rows={4}
                    placeholder="Uraikan perbaikan yang telah Anda lakukan berdasarkan masukan mentor sebelumnya..."
                    value={revisionNotes}
                    onChange={(e) => setRevisionNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring text-[#1B2A41]"
                  />
                </div>

                <div className="pt-3 border-t border-[#D5DDEB] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setRevisionDoc(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5B6882] hover:bg-[#F4F7FB]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isRevisionSubmitting || isRevisionUploading}
                    className="px-5 py-2.5 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571] disabled:opacity-50"
                  >
                    {isRevisionSubmitting ? "Mengirim..." : "Kirim Revisi ke Mentor"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Unggah Draf Dokumen Baru */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-xl border border-[#D5DDEB] space-y-5 animate-in fade-in duration-200 max-h-[90vh] overflow-y-auto">
              <div>
                <h3 className="text-xl font-bold text-[#09408C] font-display">
                  Kirim Draf Naskah untuk Ditelaah
                </h3>
                <p className="text-xs text-[#5B6882] mt-0.5">
                  Layanan review akademik komprehensif oleh tim mentor Sahabat Belajar.
                </p>
              </div>

              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label htmlFor="doc-title" className="block text-xs font-bold text-[#1B2A41] mb-1">
                    Judul Dokumen / Esai *
                  </label>
                  <input
                    id="doc-title"
                    type="text"
                    required
                    placeholder="Contoh: Esai Kontribusi LPDP - Rencana Studi S2"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring text-[#1B2A41]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="doc-category" className="block text-xs font-bold text-[#1B2A41] mb-1">
                      Kategori Dokumen
                    </label>
                    <select
                      id="doc-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring bg-white text-[#1B2A41]"
                    >
                      <option value="ESAI_BEASISWA">Esai Beasiswa (LPDP/AAS/dll)</option>
                      <option value="PROPOSAL_TESIS">Proposal Tesis / Disertasi</option>
                      <option value="MOTIVATION_LETTER">Motivation Letter / Personal Statement</option>
                      <option value="SKRIPSI_KTI">Skripsi / Karya Tulis Ilmiah</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="doc-institution" className="block text-xs font-bold text-[#1B2A41] mb-1">
                      Target Lembaga / Kampus
                    </label>
                    <input
                      id="doc-institution"
                      type="text"
                      placeholder="Contoh: LPDP, UI, ITB, Monash Univ"
                      value={targetInstitution}
                      onChange={(e) => setTargetInstitution(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring text-[#1B2A41]"
                    />
                  </div>
                </div>

                {/* Upload File PDF / DOCX */}
                <div className="p-3.5 rounded-2xl bg-[#F4F7FB] border border-[#D5DDEB] space-y-2">
                  <label className="block text-xs font-bold text-[#09408C]">
                    Pilih Berkas Naskah (PDF atau DOCX)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={(e) => handleFileUpload(e, false)}
                      disabled={isUploading}
                      className="text-xs text-[#5B6882] file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#09408C] file:text-white hover:file:bg-[#0E3571] cursor-pointer"
                    />
                    {isUploading && (
                      <span className="text-xs text-[#09408C] font-semibold animate-pulse">
                        Mengunggah...
                      </span>
                    )}
                  </div>
                  {fileName && (
                    <div className="text-[11px] text-[#1F6F4A] flex items-center gap-1 font-medium mt-1">
                      <CheckCircle2 size={12} />
                      <span>Berkas siap: {fileName}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="doc-notes" className="block text-xs font-bold text-[#1B2A41] mb-1">
                    Catatan / Bagian Khusus yang Ingin Diberi Masukan
                  </label>
                  <textarea
                    id="doc-notes"
                    rows={4}
                    placeholder="Tuliskan jika ada bagian tertentu yang Anda rasa kurang meyakinkan, misalnya latar belakang masalah, transisi paragraf, atau kesimpulan..."
                    value={studentNotes}
                    onChange={(e) => setStudentNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring text-[#1B2A41]"
                  />
                </div>

                <div className="pt-3 border-t border-[#D5DDEB] flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5B6882] hover:bg-[#F4F7FB]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || isUploading}
                    className="px-5 py-2.5 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571] disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Send size={14} />
                    <span>{isSubmitting ? "Mengunggah..." : "Kirim untuk Ditelaah"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
