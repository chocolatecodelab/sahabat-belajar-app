"use client";

import { useState, useEffect } from "react";
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
  GraduationCap,
  MessageSquare,
  ExternalLink,
  ChevronRight,
  Award,
  Eye,
  Download,
  X,
  RotateCcw,
  Send,
  ListChecks,
  History,
  Sparkles,
} from "lucide-react";
import type { AcademicDocument, DocumentCategory, DocumentStage } from "@/actions/dokumen";
import { submitStudentDocument, uploadRevisedDraft } from "@/actions/dokumen";
import { useToast } from "@/components/ui/Toast";
import { DEFAULT_SITE_CONFIG, getWhatsAppUrl } from "@/lib/site-config";

export default function StudentDocumentClient({
  initialDocuments = [],
  studentId = "std_demo_01",
  studentName = "Ahmad Fauzi",
  studentLevel = "",
  programCategory = "",
}: {
  initialDocuments: AcademicDocument[];
  studentId?: string;
  studentName?: string;
  studentLevel?: string;
  programCategory?: string;
}) {
  const toast = useToast();
  const [documents, setDocuments] = useState<AcademicDocument[]>(initialDocuments);
  const [stageFilter, setStageFilter] = useState("ALL");
  const [activeDocTab, setActiveDocTab] = useState<Record<string, "FEEDBACK" | "CHECKLIST" | "HISTORY">>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // K-12 Program Guard
  const isK12 =
    studentLevel.toLowerCase().includes("sd") ||
    studentLevel.toLowerCase().includes("smp") ||
    studentLevel.toLowerCase().includes("sma") ||
    studentLevel.toLowerCase().includes("k-12") ||
    studentLevel.toLowerCase().includes("k12") ||
    programCategory.toLowerCase().includes("k12") ||
    programCategory.toLowerCase().includes("k-12");

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

  // Keyboard Escape listener to dismiss any open modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (previewDoc) setPreviewDoc(null);
        if (revisionDoc) setRevisionDoc(null);
        if (isModalOpen) setIsModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewDoc, revisionDoc, isModalOpen]);

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
        <div className="flex flex-col sm:flex-row sm:items-start sm:items-center justify-between gap-4">
          <div>
            <div className="mb-3">
              <Link
                href={studentId ? `/portal?studentId=${encodeURIComponent(studentId)}` : "/portal"}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B6882] hover:text-[#09408C] transition-colors"
              >
                <ArrowLeft size={16} />
                <span>Kembali ke Portal Siswa</span>
              </Link>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF1FA] text-[#09408C] text-xs font-bold border border-[#9AC1E2] mb-2">
              <GraduationCap size={13} />
              <span>Layanan Bimbingan Program Lanjutan</span>
            </div>

            <h1 className="text-2xl font-bold text-[#09408C] font-display">
              Review Draf Dokumen & Esai Beasiswa
            </h1>
            <p className="text-xs sm:text-sm text-[#5B6882] mt-0.5 max-w-xl">
              Kirimkan draf esai LPDP/AAS, proposal riset tesis/disertasi, atau motivation letter Anda untuk ditelaah mendalam oleh mentor ahli Sahabat Belajar.
            </p>
          </div>

          {isK12 ? (
            <a
              href={getWhatsAppUrl(
                DEFAULT_SITE_CONFIG.officialPhone,
                "Halo Admin Sahabat Belajar, saya siswa K-12 ingin konsultasi bimbingan karya tulis atau esai seleksi PTN"
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#EAF1FA] text-[#09408C] border border-[#9AC1E2] text-xs font-semibold hover:bg-[#D5DDEB] transition-colors shadow-xs shrink-0"
            >
              <span>Konsultasi via WA</span>
              <ExternalLink size={13} />
            </a>
          ) : (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571] transition-colors shadow-xs shrink-0"
            >
              <Upload size={15} />
              <span>Kirim Draf Baru</span>
            </button>
          )}
        </div>

        {/* K-12 Segment Notice if K-12 Student visits this page */}
        {isK12 && (
          <div className="bg-[#EAF1FA] border border-[#9AC1E2] rounded-2xl p-4 flex items-start gap-3 shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-white text-[#09408C] flex items-center justify-center shrink-0 shadow-2xs font-bold text-sm">
              ℹ
            </div>
            <div className="flex-1 text-xs">
              <h4 className="font-bold text-[#09408C] text-sm font-heading">
                Informasi Program Belajar: Khusus Peserta Program Lanjutan
              </h4>
              <p className="text-[#5B6882] mt-1 leading-relaxed">
                Halo <strong>{studentName}</strong>! Halaman ini dikhususkan untuk peserta <strong>Program Lanjutan</strong> (persiapan beasiswa LPDP/AAS & riset tesis/disertasi S2/S3). Karena Anda terdaftar pada bimbingan jenjang <strong>{studentLevel || "K-12 (Sekolah)"}</strong>, Anda tidak perlu mengunggah berkas beasiswa di menu ini.
              </p>
              <div className="mt-2.5 flex items-center gap-3">
                <a
                  href={getWhatsAppUrl(
                    DEFAULT_SITE_CONFIG.officialPhone,
                    "Halo Admin Sahabat Belajar, saya siswa K-12 ingin konsultasi esai seleksi PTN atau lomba"
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#09408C] text-white font-semibold text-[11px] hover:bg-[#0E3571] transition-colors"
                >
                  <span>Konsultasi Esai Masuk PTN / Lomba via WhatsApp</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        )}

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
            {isK12 ? (
              <a
                href={getWhatsAppUrl(
                  DEFAULT_SITE_CONFIG.officialPhone,
                  "Halo Admin Sahabat Belajar, saya siswa K-12 ingin konsultasi bimbingan karya tulis, PR, atau esai seleksi PTN"
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#EAF1FA] text-[#09408C] border border-[#9AC1E2] text-xs font-semibold hover:bg-[#D5DDEB] transition-colors"
              >
                <span>Konsultasi Tugas / Esai via WhatsApp</span>
                <ExternalLink size={14} />
              </a>
            ) : (
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571]"
              >
                <Upload size={15} />
                <span>Kirim Draf Pertama</span>
              </button>
            )}
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
                    <div className="text-xs bg-amber-50/50 rounded-2xl p-3.5 border border-amber-200/60 text-[#1B2A41]">
                      <strong className="text-amber-800 block mb-0.5">Catatan Pengajuan Siswa:</strong>
                      <p className="leading-relaxed">{doc.studentNotes}</p>
                    </div>
                  )}

                  {/* Enhanced Mentor Review & Version History Section */}
                  {doc.mentorNotes ? (
                    <div className="bg-[#F4F7FB] rounded-2xl p-4 sm:p-5 border border-[#D5DDEB] space-y-4">
                      {/* Sub-Tabs: Catatan & Rubrik | Checklist Revisi | Riwayat Versi */}
                      <div className="flex items-center justify-between border-b border-[#D5DDEB] pb-3 flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-[#D5DDEB]">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveDocTab((prev) => ({ ...prev, [doc.id]: "FEEDBACK" }))
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                              (activeDocTab[doc.id] || "FEEDBACK") === "FEEDBACK"
                                ? "bg-[#09408C] text-white shadow-2xs"
                                : "text-[#5B6882] hover:text-[#1B2A41]"
                            }`}
                          >
                            <MessageSquare size={13} />
                            <span>Catatan & Rubrik</span>
                          </button>

                          {doc.actionChecklist && doc.actionChecklist.length > 0 && (
                            <button
                              type="button"
                              onClick={() =>
                                setActiveDocTab((prev) => ({ ...prev, [doc.id]: "CHECKLIST" }))
                              }
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                                activeDocTab[doc.id] === "CHECKLIST"
                                  ? "bg-[#09408C] text-white shadow-2xs"
                                  : "text-[#5B6882] hover:text-[#1B2A41]"
                              }`}
                            >
                              <ListChecks size={13} />
                              <span>
                                Tindak Lanjut ({doc.actionChecklist.filter((c) => c.completed).length}/
                                {doc.actionChecklist.length})
                              </span>
                            </button>
                          )}

                          {doc.versionHistory && doc.versionHistory.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setActiveDocTab((prev) => ({ ...prev, [doc.id]: "HISTORY" }))
                              }
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                                activeDocTab[doc.id] === "HISTORY"
                                  ? "bg-[#09408C] text-white shadow-2xs"
                                  : "text-[#5B6882] hover:text-[#1B2A41]"
                              }`}
                            >
                              <History size={13} />
                              <span>Riwayat Versi ({doc.versionHistory.length})</span>
                            </button>
                          )}
                        </div>

                        {doc.reviewedAt && (
                          <span className="text-[11px] text-[#5B6882] font-medium">
                            Ditinjau:{" "}
                            {new Date(doc.reviewedAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                        )}
                      </div>

                      {/* Content Panel 1: FEEDBACK & RUBRIC */}
                      {(activeDocTab[doc.id] || "FEEDBACK") === "FEEDBACK" && (
                        <div className="space-y-4">
                          {/* Mentor Quote */}
                          <div className="bg-white rounded-2xl p-4 border border-[#9AC1E2] space-y-2">
                            <div className="flex items-center gap-2 text-[#09408C] font-bold text-xs">
                              <div className="w-7 h-7 rounded-lg bg-[#EAF1FA] text-[#09408C] flex items-center justify-center font-bold text-xs">
                                ✍️
                              </div>
                              <div>
                                <span>Telaah & Ulasan {doc.mentorName || "Mentor Beasiswa LPDP"}</span>
                                <span className="text-[10px] text-[#1F6F4A] font-semibold block">
                                  Mentor Spesialis Naskah & Esai Akademik
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-[#1B2A41] leading-relaxed whitespace-pre-line pl-9 border-l-2 border-[#09408C]/30 ml-3.5">
                              {doc.mentorNotes}
                            </p>
                          </div>

                          {/* Rubric Evaluation Bars */}
                          {doc.rubricScores && (
                            <div className="bg-white rounded-2xl p-4 border border-[#D5DDEB] space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[#09408C] flex items-center gap-1.5">
                                  <Sparkles size={14} className="text-[#0CC0DF]" />
                                  <span>Rubrik Penilaian 4 Pilar Esai Akademik:</span>
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-bold text-[#1F6F4A]">
                                    Rata-rata:{" "}
                                    {Math.round(
                                      (doc.rubricScores.argumentation +
                                        doc.rubricScores.structure +
                                        doc.rubricScores.relevance +
                                        doc.rubricScores.academicWriting) /
                                        4
                                    )}
                                    /100
                                  </span>
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E3F4EC] text-[#1F6F4A] border border-[#1F6F4A]/30">
                                    ✓ Sangat Siap
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                {/* Argumen */}
                                <div className="p-3 bg-[#F4F7FB] rounded-xl border border-[#D5DDEB] space-y-1.5">
                                  <div className="flex justify-between items-center font-semibold">
                                    <span className="text-[#1B2A41]">1. Argumen & Urgensi Masalah</span>
                                    <span className="text-[#09408C] font-bold">
                                      {doc.rubricScores.argumentation}/100
                                    </span>
                                  </div>
                                  <div className="w-full h-2 rounded-full bg-[#D5DDEB] overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-[#09408C]"
                                      style={{ width: `${doc.rubricScores.argumentation}%` }}
                                    ></div>
                                  </div>
                                </div>

                                {/* Struktur */}
                                <div className="p-3 bg-[#F4F7FB] rounded-xl border border-[#D5DDEB] space-y-1.5">
                                  <div className="flex justify-between items-center font-semibold">
                                    <span className="text-[#1B2A41]">2. Struktur & Alur Paragraf</span>
                                    <span className="text-[#09408C] font-bold">
                                      {doc.rubricScores.structure}/100
                                    </span>
                                  </div>
                                  <div className="w-full h-2 rounded-full bg-[#D5DDEB] overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-[#295897]"
                                      style={{ width: `${doc.rubricScores.structure}%` }}
                                    ></div>
                                  </div>
                                </div>

                                {/* Relevansi */}
                                <div className="p-3 bg-[#F4F7FB] rounded-xl border border-[#D5DDEB] space-y-1.5">
                                  <div className="flex justify-between items-center font-semibold">
                                    <span className="text-[#1B2A41]">
                                      3. Relevansi Studi & Rencana Kontribusi
                                    </span>
                                    <span className="text-[#1F6F4A] font-bold">
                                      {doc.rubricScores.relevance}/100
                                    </span>
                                  </div>
                                  <div className="w-full h-2 rounded-full bg-[#D5DDEB] overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-[#1F6F4A]"
                                      style={{ width: `${doc.rubricScores.relevance}%` }}
                                    ></div>
                                  </div>
                                </div>

                                {/* Tata Bahasa */}
                                <div className="p-3 bg-[#F4F7FB] rounded-xl border border-[#D5DDEB] space-y-1.5">
                                  <div className="flex justify-between items-center font-semibold">
                                    <span className="text-[#1B2A41]">4. Gaya Penulisan & Tata Bahasa</span>
                                    <span className="text-[#09408C] font-bold">
                                      {doc.rubricScores.academicWriting}/100
                                    </span>
                                  </div>
                                  <div className="w-full h-2 rounded-full bg-[#D5DDEB] overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-[#0CC0DF]"
                                      style={{ width: `${doc.rubricScores.academicWriting}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Content Panel 2: CHECKLIST TINDAK LANJUT */}
                      {activeDocTab[doc.id] === "CHECKLIST" && (
                        <div className="bg-white rounded-2xl p-4 border border-[#D5DDEB] space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#09408C]">
                              Daftar Poin Perbaikan Rekomendasi Mentor:
                            </span>
                            <span className="text-[11px] text-[#5B6882]">
                              Centang hijau menandakan poin yang sudah disesuaikan pada naskah ini.
                            </span>
                          </div>

                          <div className="space-y-2">
                            {doc.actionChecklist?.map((item, idx) => (
                              <div
                                key={idx}
                                className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition-colors ${
                                  item.completed
                                    ? "bg-[#E3F4EC]/60 border-[#1F6F4A]/30 text-[#1B2A41]"
                                    : "bg-[#FEF7E6]/60 border-[#F5B82E]/50 text-[#1B2A41]"
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-white font-bold text-xs ${
                                      item.completed ? "bg-[#1F6F4A]" : "bg-[#B45309]"
                                    }`}
                                  >
                                    {item.completed ? "✓" : "!"}
                                  </div>
                                  <span className={item.completed ? "line-through text-[#5B6882]" : "font-medium"}>
                                    {item.task}
                                  </span>
                                </div>

                                {item.priority && (
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                                      item.priority === "TINGGI"
                                        ? "bg-red-100 text-red-700"
                                        : item.priority === "SEDANG"
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-slate-100 text-slate-600"
                                    }`}
                                  >
                                    Prioritas {item.priority}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Content Panel 3: RIWAYAT VERSI DRAF */}
                      {activeDocTab[doc.id] === "HISTORY" && (
                        <div className="bg-white rounded-2xl p-4 border border-[#D5DDEB] space-y-4">
                          <span className="text-xs font-bold text-[#09408C] block">
                            Kronologi Revisi & Catatan Mentor per Versi Naskah:
                          </span>

                          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#D5DDEB]">
                            {doc.versionHistory?.map((ver, vIdx) => (
                              <div key={vIdx} className="relative space-y-2 text-xs">
                                {/* Bullet indicator */}
                                <div
                                  className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black text-white ${
                                    ver.versionNumber === doc.version
                                      ? "bg-[#09408C]"
                                      : "bg-[#5B6882]"
                                  }`}
                                >
                                  {ver.versionNumber}
                                </div>

                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-[#1B2A41]">
                                      Versi {ver.versionNumber}
                                    </span>
                                    {ver.versionNumber === doc.version && (
                                      <span className="px-2 py-0.5 rounded-full bg-[#EAF1FA] text-[#09408C] font-bold text-[10px] border border-[#9AC1E2]">
                                        Naskah Terkini
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-[#5B6882]">
                                    Diunggah:{" "}
                                    {new Date(ver.uploadedAt).toLocaleDateString("id-ID", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </span>
                                </div>

                                {ver.studentNotes && (
                                  <p className="text-[#5B6882] bg-[#F4F7FB] p-2.5 rounded-xl border border-[#D5DDEB]">
                                    <strong className="text-[#1B2A41]">Catatan Siswa:</strong>{" "}
                                    {ver.studentNotes}
                                  </p>
                                )}

                                {ver.mentorNotes && (
                                  <p className="text-[#09408C] bg-[#EAF1FA] p-2.5 rounded-xl border border-[#9AC1E2]">
                                    <strong className="text-[#09408C]">
                                      Masukan Mentor ({ver.mentorName || "Mentor"}):
                                    </strong>{" "}
                                    {ver.mentorNotes}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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
                        Browser tidak mendukung pratinjau inline untuk format dokumen Word (.docx / .doc). Silakan unduh berkas untuk membaca dan mengedit di Microsoft Word atau Google Docs.
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
