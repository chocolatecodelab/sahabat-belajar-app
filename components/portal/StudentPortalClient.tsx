"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Calendar,
  Clock,
  BookOpen,
  Video,
  MapPin,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  LogOut,
  ExternalLink,
  ChevronRight,
  User,
  Award,
  Play,
  RotateCcw,
  FileText,
  ArrowRight,
  Share2,
  FileEdit,
  Download,
  Search,
  Filter,
  CreditCard,
  Printer,
  X,
  Users,
  Copy,
  Plus,
  ShieldCheck,
  Check,
  Eye,
} from "lucide-react";
import { signOut } from "next-auth/react";
import type { StudentPortalData, StudentInvoice } from "@/actions/portal";
import { submitStudentPaymentConfirmation } from "@/actions/portal";
import type { ExamItem, StudentExamSession } from "@/actions/ujian";
import { trackMaterialDownload, type LearningMaterial, type ProgramCategory } from "@/actions/materi";
import { formatDayDate, formatTime, formatDate } from "@/lib/date";
import ScoreProgressChart from "@/components/portal/ScoreProgressChart";
import { useToast } from "@/components/ui/Toast";

export default function StudentPortalClient({
  initialData,
  availableExams = [],
  examHistory = [],
  materials = [],
  currentStudentId,
}: {
  initialData: StudentPortalData | null;
  availableExams?: ExamItem[];
  examHistory?: StudentExamSession[];
  materials?: LearningMaterial[];
  currentStudentId?: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<
    "overview" | "history" | "ujian" | "materi" | "tagihan"
  >("overview");

  // Segment Identification (K-12 vs CPNS vs S2/Beasiswa)
  const studentLevelStr = (initialData?.student?.level || "").toLowerCase();
  const programNamesStr = (initialData?.packages || []).map((p) => p.programName.toLowerCase()).join(" ");

  const isK12 =
    studentLevelStr.includes("sd") ||
    studentLevelStr.includes("smp") ||
    studentLevelStr.includes("sma") ||
    studentLevelStr.includes("k-12") ||
    studentLevelStr.includes("k12") ||
    studentLevelStr.includes("sekolah") ||
    programNamesStr.includes("k-12") ||
    programNamesStr.includes("sekolah");

  const isCPNS =
    studentLevelStr.includes("cpns") ||
    studentLevelStr.includes("alumni") ||
    studentLevelStr.includes("asn") ||
    studentLevelStr.includes("kedinasan") ||
    programNamesStr.includes("cpns") ||
    programNamesStr.includes("bumn");

  const isAdvancedProgram =
    studentLevelStr.includes("s2") ||
    studentLevelStr.includes("s3") ||
    studentLevelStr.includes("beasiswa") ||
    studentLevelStr.includes("tesis") ||
    programNamesStr.includes("beasiswa") ||
    programNamesStr.includes("penulisan ilmiah");

  const [selectedExamCategory, setSelectedExamCategory] = useState<string>(
    isK12 ? "RECOMMENDED_K12" : isCPNS ? "RECOMMENDED_CPNS" : "ALL"
  );
  const [selectedMaterialCategory, setSelectedMaterialCategory] =
    useState<ProgramCategory>(isK12 ? "K12" : isCPNS ? "CPNS_BUMN" : isAdvancedProgram ? "S2_BEASISWA" : "ALL");

  useEffect(() => {
    if (isK12) {
      setSelectedExamCategory("RECOMMENDED_K12");
      setSelectedMaterialCategory("K12");
    } else if (isCPNS) {
      setSelectedExamCategory("RECOMMENDED_CPNS");
      setSelectedMaterialCategory("CPNS_BUMN");
    } else if (isAdvancedProgram) {
      setSelectedExamCategory("ALL");
      setSelectedMaterialCategory("S2_BEASISWA");
    } else {
      setSelectedExamCategory("ALL");
      setSelectedMaterialCategory("ALL");
    }
  }, [initialData?.student?.id]);
  const [materialSearch, setMaterialSearch] = useState("");
  const [studentMaterials, setStudentMaterials] = useState<LearningMaterial[]>(materials);
  const [previewMaterial, setPreviewMaterial] = useState<LearningMaterial | null>(null);

  // Invoice & Receipt State
  const [selectedReceipt, setSelectedReceipt] = useState<StudentInvoice | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [isSubmittingPay, setIsSubmittingPay] = useState(false);

  // Payment Form States
  const [payBank, setPayBank] = useState("BCA (123-456-7890)");
  const [paySenderName, setPaySenderName] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [payNotes, setPayNotes] = useState("");

  if (!initialData) {
    return (
      <div className="min-h-screen bg-[#F4F7FB] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#D5DDEB] max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-xl font-bold font-heading text-[#1B2A41] mb-2">
            Data Belum Ditemukan
          </h2>
          <p className="text-sm text-[#5B6882] mb-6">
            Akun Anda belum ditautkan dengan data siswa aktif. Silakan hubungi
            admin Sahabat Belajar untuk verifikasi pendaftaran.
          </p>
          <div className="flex flex-col gap-2">
            <a
              href="https://wa.me/628123456789?text=Halo%20Admin%20Sahabat%20Belajar,%20saya%20ingin%20menanyakan%20status%20akun%20siswa"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#09408C] text-white font-medium text-sm hover:bg-[#0E3571] transition-colors"
            >
              Hubungi Admin via WhatsApp
            </a>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="px-4 py-2 text-sm text-[#5B6882] hover:text-[#1B2A41]"
            >
              Keluar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const {
    student,
    packages,
    upcomingSessions,
    pastSessions,
    siblings = [],
    invoices = [],
  } = initialData;

  const handleSwitchStudent = (id: string) => {
    router.push(`/portal?studentId=${id}`);
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.info("Berhasil Disalin", `${label} berhasil disalin ke clipboard.`);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paySenderName.trim() || !payAmount) return;

    setIsSubmittingPay(true);
    const res = await submitStudentPaymentConfirmation({
      studentId: student.id,
      studentName: student.name,
      packageName: packages[0]?.packageName || "Bimbingan Belajar",
      amount: parseInt(payAmount) || 0,
      bankDestination: payBank,
      senderAccountName: paySenderName,
      notes: payNotes,
    });
    setIsSubmittingPay(false);

    if (res.success) {
      toast.success("Konfirmasi Terkirim", res.message);
      setShowPayModal(false);
      setPaySenderName("");
      setPayAmount("");
      setPayNotes("");
      router.refresh();
    } else {
      toast.error("Gagal Mengirim", res.message);
    }
  };

  // WhatsApp Reminder Generator
  const generateWaReminderUrl = (session: typeof upcomingSessions[0]) => {
    const dateStr = formatDayDate(session.startAt);
    const timeStr = `${formatTime(session.startAt)} - ${formatTime(session.endAt)} WIB`;
    const locationInfo =
      session.mode === "ONLINE"
        ? session.meetingLink
          ? `Tautan Belajar (Zoom/Meet): ${session.meetingLink}`
          : "Tautan Zoom/Meet akan diaktifkan sebelum sesi."
        : `Lokasi Belajar: ${session.address || "Rumah Siswa"}`;

    const text =
      `Halo! 📚 Pengingat Sesi Bimbingan Sahabat Belajar:\n\n` +
      `• Siswa: ${student.name}\n` +
      `• Program: ${session.programName}\n` +
      `• Tutor: ${session.tutorName}\n` +
      `• Hari & Tanggal: ${dateStr}\n` +
      `• Waktu: ${timeStr} (Durasi 90 Menit)\n` +
      `• Metode: ${session.mode === "ONLINE" ? "Online (Zoom / Meet)" : "Home Visit (Tatap Muka)"}\n` +
      `• ${locationInfo}\n\n` +
      `Mohon hadir 5 menit sebelum sesi dimulai. Semangat belajarnya! ✨ #BersamaSahabat`;

    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  // Filtered Materials
  const filteredMaterials = studentMaterials.filter((m) => {
    const matchesCategory =
      selectedMaterialCategory === "ALL" || m.programCategory === selectedMaterialCategory;
    const matchesSearch =
      m.title.toLowerCase().includes(materialSearch.toLowerCase()) ||
      m.subject.toLowerCase().includes(materialSearch.toLowerCase()) ||
      m.authorTutor.toLowerCase().includes(materialSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Filtered Exams (Adaptive to K-12 vs CPNS)
  const filteredExams = availableExams.filter((exam) => {
    if (selectedExamCategory === "RECOMMENDED_K12") {
      return exam.category === "UTBK_SNBT" || exam.category === "K12";
    }
    if (selectedExamCategory === "RECOMMENDED_CPNS") {
      return exam.category === "CPNS_BUMN" || exam.category === "KEDINASAN";
    }
    if (selectedExamCategory === "ALL") {
      return true;
    }
    return exam.category === selectedExamCategory;
  });

  const handleDownloadMaterial = (mat: LearningMaterial) => {
    try {
      trackMaterialDownload(mat.id);
      setStudentMaterials((prev) =>
        prev.map((m) => (m.id === mat.id ? { ...m, downloadCount: m.downloadCount + 1 } : m))
      );
    } catch (e) {
      console.warn("Failed tracking download:", e);
    }
    window.open(mat.fileUrl, "_blank");
    toast.success("Modul Diunduh", `Modul ${mat.fileName} sedang diunduh.`);
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-[#1B2A41] font-sans pb-16">

      {/* Top Header */}
      <header className="bg-white border-b border-[#D5DDEB] sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white p-0.5 border border-[#D5DDEB] flex items-center justify-center shadow-xs shrink-0">
              <Image
                src="/images/logo-sahabat-belajar.png"
                alt="Sahabat Belajar"
                width={36}
                height={36}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <span className="font-heading font-bold text-base text-[#09408C] block leading-tight">
                Sahabat Belajar
              </span>
              <span className="text-[11px] text-[#5B6882] font-medium block">
                Portal Siswa & Orang Tua
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-[#EAF1FA] text-[#09408C] px-3 py-1.5 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#1F6F4A] animate-pulse"></span>
              #BersamaSahabat
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="inline-flex items-center gap-1.5 text-xs text-[#5B6882] hover:text-[#B4381F] px-3 py-1.5 rounded-lg border border-[#D5DDEB] hover:border-red-200 hover:bg-red-50 transition-colors"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        {/* Multi-Anak Switcher Pill (PRD Modul H3) */}
        {siblings.length > 1 && (
          <div className="bg-white rounded-2xl border border-[#D5DDEB] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-[#09408C]" />
              <span className="text-xs text-[#5B6882]">
                Akun Wali / Orang Tua:{" "}
                <strong className="text-[#1B2A41]">
                  {student.parentName || "Wali Murid"}
                </strong>
              </span>
              <span className="text-[10px] bg-[#EAF1FA] text-[#09408C] font-bold px-2 py-0.5 rounded-full">
                Multi-Anak ({siblings.length})
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-xs font-semibold text-[#5B6882] shrink-0 mr-1">
                Pilih Profil Anak:
              </span>
              {siblings.map((sib) => {
                const isActive = sib.id === student.id;
                return (
                  <button
                    key={sib.id}
                    onClick={() => handleSwitchStudent(sib.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                      isActive
                        ? "bg-[#09408C] text-white shadow-2xs"
                        : "bg-[#F4F7FB] text-[#5B6882] hover:bg-[#EAF1FA] hover:text-[#09408C] border border-[#D5DDEB]"
                    }`}
                  >
                    <GraduationCap size={13} />
                    <span>{sib.name}</span>
                    <span className="text-[10px] opacity-80">({sib.level})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Student Welcome Banner */}
        <div className="bg-gradient-to-r from-[#09408C] via-[#0E3571] to-[#295897] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-white/20 text-white px-2.5 py-0.5 rounded-full font-medium">
                  {student.level || "Siswa Terdaftar"}
                </span>
                <span className="text-xs text-white/80">
                  {student.school || "Sahabat Belajar"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white">
                Selamat Datang, {student.name}
              </h1>
              <p className="text-xs sm:text-sm text-white/80">
                Wali / Orang Tua:{" "}
                <strong className="text-white">
                  {student.parentName || "Orang Tua Siswa"}
                </strong>
                {student.parentPhone && ` (${student.parentPhone})`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-xl p-3 text-center min-w-[100px]">
                <div className="text-[11px] text-white/80">Total Sesi Diikuti</div>
                <div className="text-2xl font-bold font-heading text-white">
                  {pastSessions.length}
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-xl p-3 text-center min-w-[100px]">
                <div className="text-[11px] text-white/80">Paket Aktif</div>
                <div className="text-2xl font-bold font-heading text-white">
                  {packages.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contextual Academic Program Highlights (Adaptive to K-12 vs CPNS vs S2/Beasiswa) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Primary Action */}
          {isAdvancedProgram ? (
            <div className="bg-white rounded-2xl border border-[#D5DDEB] p-5 flex items-center justify-between gap-4 hover:border-[#09408C] transition-all shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#EAF1FA] text-[#09408C] flex items-center justify-center shrink-0">
                  <FileEdit size={22} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-[#09408C] uppercase tracking-wider">
                    Program S2 / S3 & Beasiswa
                  </div>
                  <h4 className="font-heading font-bold text-sm text-[#1B2A41]">
                    Review Draf Esai & Naskah Akademik
                  </h4>
                  <p className="text-xs text-[#5B6882] mt-0.5">
                    Konsultasikan draf esai LPDP/AAS & skripsi dengan mentor ahli.
                  </p>
                </div>
              </div>
              <Link
                href={`/portal/dokumen?studentId=${student.id}`}
                className="shrink-0 px-3.5 py-2 rounded-xl bg-[#09408C] hover:bg-[#0E3571] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <span>Buka Draf</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          ) : isK12 ? (
            <div className="bg-white rounded-2xl border border-[#D5DDEB] p-5 flex items-center justify-between gap-4 hover:border-[#09408C] transition-all shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#EAF1FA] text-[#09408C] flex items-center justify-center shrink-0">
                  <Award size={22} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-[#09408C] uppercase tracking-wider">
                    Simulasi Ujian & Evaluasi
                  </div>
                  <h4 className="font-heading font-bold text-sm text-[#1B2A41]">
                    Tryout UTBK-SNBT & Ujian Sekolah
                  </h4>
                  <p className="text-xs text-[#5B6882] mt-0.5">
                    Latih kemampuan Penalaran Matematika, TPS, dan evaluasi konsep dasar.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedExamCategory("RECOMMENDED_K12");
                  setActiveTab("ujian");
                }}
                className="shrink-0 px-3.5 py-2 rounded-xl bg-[#09408C] hover:bg-[#0E3571] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <span>Mulai Tryout</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#D5DDEB] p-5 flex items-center justify-between gap-4 hover:border-[#09408C] transition-all shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#EAF1FA] text-[#09408C] flex items-center justify-center shrink-0">
                  <Award size={22} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-[#09408C] uppercase tracking-wider">
                    Persiapan Seleksi CASN
                  </div>
                  <h4 className="font-heading font-bold text-sm text-[#1B2A41]">
                    Simulasi CAT SKD CPNS & BUMN
                  </h4>
                  <p className="text-xs text-[#5B6882] mt-0.5">
                    Uji simulasi CAT berstandar BKN dengan timer dan passing grade resmi.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedExamCategory("RECOMMENDED_CPNS");
                  setActiveTab("ujian");
                }}
                className="shrink-0 px-3.5 py-2 rounded-xl bg-[#09408C] hover:bg-[#0E3571] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <span>Mulai CAT</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* Card 2: Materi Digital Belajar */}
          <div className="bg-white rounded-2xl border border-[#D5DDEB] p-5 flex items-center justify-between gap-4 hover:border-[#1F6F4A] transition-all shadow-xs">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#E3F4EC] text-[#1F6F4A] flex items-center justify-center shrink-0">
                <BookOpen size={22} />
              </div>
              <div>
                <div className="text-[10px] font-bold text-[#1F6F4A] uppercase tracking-wider">
                  {isK12 ? "Materi Belajar Sekolah" : isCPNS ? "Kisi-Kisi & Modul Ujian" : "Repositori Materi Digital"}
                </div>
                <h4 className="font-heading font-bold text-sm text-[#1B2A41]">
                  {isK12
                    ? "Bank Modul & Rumus K-12"
                    : isCPNS
                    ? "Modul Rumus Cepat TIU & TWK"
                    : "Bank Modul & Ringkasan Rumus"}
                </h4>
                <p className="text-xs text-[#5B6882] mt-0.5">
                  {isK12
                    ? "Akses rangkuman rumus cepat Matematika, Fisika, dan bank soal UTBK."
                    : isCPNS
                    ? "Kumpulan rumus 40 detik TIU, intisari pilar negara TWK, dan TKP."
                    : "Akses e-book rumus praktis dan panduan belajar terkurasi."}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedMaterialCategory(isK12 ? "K12" : isCPNS ? "CPNS_BUMN" : "ALL");
                setActiveTab("materi");
              }}
              className="shrink-0 px-3.5 py-2 rounded-xl bg-[#1F6F4A] hover:bg-[#155337] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <span>{isK12 ? "Buka Modul K-12" : isCPNS ? "Buka Modul CPNS" : "Buka Modul"}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Paket & Sisa Kuota (BR-1, BR-4, BR-5) */}
        <div>
          <h2 className="text-lg font-heading font-bold text-[#1B2A41] mb-3 flex items-center gap-2">
            <BookOpen size={18} className="text-[#09408C]" />
            Paket Belajar & Sisa Pertemuan
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {packages.map((pkg) => {
              const percent =
                pkg.quotaTotal > 0
                  ? Math.round((pkg.quotaUsed / pkg.quotaTotal) * 100)
                  : 0;
              const isLow = pkg.quotaRemaining <= 2 && pkg.quotaRemaining > 0;
              const isExhausted = pkg.quotaRemaining === 0;

              return (
                <div
                  key={pkg.id}
                  className="bg-white rounded-2xl border border-[#D5DDEB] p-5 shadow-xs hover:border-[#9AC1E2] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#EAF1FA] text-[#09408C]">
                        {pkg.programName}
                      </span>
                      {isLow && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 animate-pulse">
                          Sisa ≤ 2 Sesi
                        </span>
                      )}
                      {isExhausted && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                          Kuota Habis
                        </span>
                      )}
                    </div>
                    <h3 className="font-heading font-bold text-base text-[#1B2A41] mb-1">
                      {pkg.packageName}
                    </h3>
                    <p className="text-xs text-[#5B6882] mb-4">
                      Durasi bimbingan: 90 Menit per sesi
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 mb-3">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-[#5B6882]">
                          Terlaksana: <strong className="text-[#1B2A41]">{pkg.quotaUsed}</strong>
                        </span>
                        <span className="text-[#09408C] font-bold">
                          Sisa: {pkg.quotaRemaining} Sesi
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-[#EAF1FA] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isExhausted
                              ? "bg-red-500"
                              : isLow
                              ? "bg-amber-500"
                              : "bg-[#09408C]"
                          }`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      <div className="text-[11px] text-right text-[#5B6882]">
                        Total Kuota: {pkg.quotaTotal} Pertemuan
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#D5DDEB] flex items-center justify-between text-xs">
                    <span className="text-[#5B6882]">
                      Status: <strong className="text-[#1B2A41]">{pkg.status}</strong>
                    </span>
                    <button
                      onClick={() => {
                        setActiveTab("tagihan");
                        setShowPayModal(true);
                      }}
                      className="text-[#09408C] font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      Top-Up / Perpanjang <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tab Navigation (5 Tabs) */}
        <div className="flex items-center gap-2 border-b border-[#D5DDEB] pt-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 px-3.5 text-sm font-heading font-semibold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === "overview"
                ? "border-[#09408C] text-[#09408C]"
                : "border-transparent text-[#5B6882] hover:text-[#1B2A41]"
            }`}
          >
            <Calendar size={16} />
            Jadwal Sesi Mendatang ({upcomingSessions.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-3 px-3.5 text-sm font-heading font-semibold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === "history"
                ? "border-[#09408C] text-[#09408C]"
                : "border-transparent text-[#5B6882] hover:text-[#1B2A41]"
            }`}
          >
            <CheckCircle2 size={16} />
            Riwayat Sesi & Catatan Guru ({pastSessions.length})
          </button>
          <button
            onClick={() => setActiveTab("ujian")}
            className={`pb-3 px-3.5 text-sm font-heading font-semibold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === "ujian"
                ? "border-[#09408C] text-[#09408C]"
                : "border-transparent text-[#5B6882] hover:text-[#1B2A41]"
            }`}
          >
            <Award size={16} />
            Ruang Ujian & CAT ({availableExams.length})
          </button>
          <button
            onClick={() => setActiveTab("materi")}
            className={`pb-3 px-3.5 text-sm font-heading font-semibold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === "materi"
                ? "border-[#09408C] text-[#09408C]"
                : "border-transparent text-[#5B6882] hover:text-[#1B2A41]"
            }`}
          >
            <BookOpen size={16} />
            Bank Modul & Materi ({materials.length})
          </button>
          <button
            onClick={() => setActiveTab("tagihan")}
            className={`pb-3 px-3.5 text-sm font-heading font-semibold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === "tagihan"
                ? "border-[#09408C] text-[#09408C]"
                : "border-transparent text-[#5B6882] hover:text-[#1B2A41]"
            }`}
          >
            <CreditCard size={16} />
            Tagihan & Kwitansi ({invoices.length})
          </button>
        </div>

        {/* Tab 1: Jadwal Sesi Mendatang */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            {upcomingSessions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#D5DDEB] p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-[#EAF1FA] text-[#09408C] flex items-center justify-center mx-auto mb-3">
                  <Calendar size={24} />
                </div>
                <h3 className="font-heading font-bold text-[#1B2A41] mb-1">
                  Belum Ada Jadwal Sesi Baru
                </h3>
                <p className="text-sm text-[#5B6882] max-w-md mx-auto mb-4">
                  Admin dan tutor sedang menyusun jadwal belajar terbaik untuk Anda.
                  Hubungi kami jika ada preferensi hari dan jam tertentu.
                </p>
                <a
                  href="https://wa.me/628123456789?text=Halo%20Admin%20Sahabat%20Belajar,%20saya%20ingin%20request%20jadwal%20bimbingan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571] transition-colors"
                >
                  Ajukan Permohonan Jadwal
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingSessions.map((session) => {
                  const formattedDate = formatDayDate(session.startAt);
                  const formattedTime = `${formatTime(session.startAt)} - ${formatTime(session.endAt)} WIB`;

                  return (
                    <div
                      key={session.id}
                      className="bg-white rounded-2xl border border-[#D5DDEB] p-5 shadow-xs hover:border-[#9AC1E2] transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#09408C] bg-[#EAF1FA] px-2.5 py-1 rounded-full">
                          {session.programName}
                        </span>
                        <span className="text-xs font-semibold text-[#5B6882] flex items-center gap-1">
                          <Clock size={13} /> 90 Menit
                        </span>
                      </div>

                      <div>
                        <h4 className="font-heading font-bold text-base text-[#1B2A41]">
                          {formattedDate}
                        </h4>
                        <p className="text-sm font-semibold text-[#09408C]">{formattedTime}</p>
                      </div>

                      <div className="bg-[#F4F7FB] rounded-xl p-3 text-xs space-y-1.5">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-[#5B6882]" />
                          <span className="text-[#5B6882]">Tutor:</span>
                          <strong className="text-[#1B2A41]">{session.tutorName}</strong>
                        </div>
                        <div className="flex items-center gap-2">
                          {session.mode === "ONLINE" ? (
                            <Video size={14} className="text-blue-600" />
                          ) : (
                            <MapPin size={14} className="text-emerald-600" />
                          )}
                          <span className="text-[#5B6882]">Metode:</span>
                          <strong className="text-[#1B2A41]">
                            {session.mode === "ONLINE"
                              ? "Online (Zoom / Meet)"
                              : "Home Visit (Tatap Muka)"}
                          </strong>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2 pt-1">
                        {session.mode === "ONLINE" ? (
                          session.meetingLink ? (
                            <a
                              href={session.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#09408C] text-white font-medium text-xs hover:bg-[#0E3571] transition-colors shadow-xs"
                            >
                              <Video size={14} /> Masuk Ruang Belajar (Zoom/Meet) <ExternalLink size={12} />
                            </a>
                          ) : (
                            <div className="text-center py-2 text-xs text-[#5B6882] bg-slate-50 rounded-xl border border-dashed border-[#D5DDEB]">
                              Tautan ruang belajar akan diaktifkan sebelum sesi dimulai
                            </div>
                          )
                        ) : (
                          <div className="text-xs text-[#5B6882] bg-slate-50 p-2.5 rounded-xl border border-[#D5DDEB] flex items-start gap-2">
                            <MapPin size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                            <div>
                              <span className="font-semibold text-[#1B2A41] block">Lokasi Belajar:</span>
                              {session.address || "Alamat rumah siswa"}
                            </div>
                          </div>
                        )}

                        {/* 1-Click WhatsApp Reminder Button */}
                        <a
                          href={generateWaReminderUrl(session)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#EAF1FA] text-[#09408C] hover:bg-[#9AC1E2]/30 font-semibold text-xs border border-[#9AC1E2]/50 transition-colors"
                          title="Bagikan detail dan pengingat sesi bimbingan ke WhatsApp siswa / wali"
                        >
                          <Share2 size={13} />
                          <span>Kirim Pengingat Jadwal ke WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Riwayat Pertemuan & Evaluasi Tutor */}
        {activeTab === "history" && (
          <div className="space-y-4">
            {pastSessions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#D5DDEB] p-8 text-center text-[#5B6882]">
                <CheckCircle2 size={32} className="mx-auto mb-2 text-[#9AC1E2]" />
                <h3 className="font-heading font-bold text-[#1B2A41] mb-1">
                  Belum Ada Riwayat Sesi
                </h3>
                <p className="text-sm">
                  Setelah sesi belajar pertama terlaksana, ringkasan materi, catatan pemahaman,
                  dan tugas dari tutor akan otomatis tercatat di sini.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pastSessions.map((session) => {
                  const dateStr = formatDayDate(session.startAt);
                  const timeStr = `${formatTime(session.startAt)} - ${formatTime(session.endAt)} WIB`;

                  return (
                    <div
                      key={session.id}
                      className="bg-white rounded-2xl border border-[#D5DDEB] p-5 shadow-xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D5DDEB] pb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#1F6F4A]"></span>
                          <span className="font-heading font-bold text-sm text-[#1B2A41]">
                            {dateStr}
                          </span>
                          <span className="text-xs text-[#5B6882]">({timeStr})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-[#EAF1FA] text-[#09408C] font-semibold px-2.5 py-0.5 rounded-full">
                            {session.programName}
                          </span>
                          <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">
                            {session.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div>
                          <span className="text-[#5B6882] block mb-0.5">Tutor Pengajar:</span>
                          <strong className="text-[#1B2A41] text-sm">{session.tutorName}</strong>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-[#5B6882] block mb-0.5">Materi yang Dipelajari:</span>
                          <p className="text-[#1B2A41] font-medium">
                            {session.topic || "Ringkasan konsep dan pendalaman soal evaluasi."}
                          </p>
                        </div>
                      </div>

                      {session.notes && (
                        <div className="bg-[#F4F7FB] p-3 rounded-xl border border-[#D5DDEB] text-xs space-y-1">
                          <div className="flex items-center gap-1.5 font-semibold text-[#09408C]">
                            <FileText size={14} />
                            Catatan & Rekomendasi Tutor:
                          </div>
                          <p className="text-[#5B6882] pl-5 leading-relaxed">{session.notes}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Ruang Ujian Online & Rapor Digital */}
        {activeTab === "ujian" && (
          <div className="space-y-6">
            {/* Visual Score Progress & Trend Analysis Chart (Modul G2) */}
            {examHistory.length > 0 && <ScoreProgressChart sessions={examHistory} />}

            {/* Header Ruang Ujian */}
            <div className="bg-white rounded-3xl border border-[#D5DDEB] p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF1FA] text-[#09408C] text-xs font-bold border border-[#9AC1E2] mb-2">
                  <Award size={14} />
                  <span>
                    {isK12
                      ? "Tryout Berstandar UTBK & Kurikulum Sekolah"
                      : isCPNS
                      ? "Simulasi CAT Berstandar Resmi BKN"
                      : "Ruang Ujian & Evaluasi Belajar"}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#09408C] font-heading">
                  {isK12
                    ? "Ruang Tryout Mandiri & Evaluasi Belajar"
                    : isCPNS
                    ? "Pilih Paket Ujian & Simulasi CAT SKD"
                    : "Pilih Paket Ujian & Evaluasi Belajar"}
                </h3>
                <p className="text-xs sm:text-sm text-[#5B6882] mt-0.5">
                  {isK12
                    ? "Latih penalaran matematika, pemahaman bacaan, dan penguasaan materi sekolah secara mandiri dengan evaluasi otomatis."
                    : "Latih kecepatan, akurasi penalaran, dan pemahaman konsep dasar dengan timer dan passing grade otomatis."}
                </p>
              </div>
            </div>

            {/* Exam Category Filter Chips (Adaptive to Student Level) */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {[
                ...(isK12
                  ? [{ key: "RECOMMENDED_K12", label: "★ Sesuai Jenjang Anda (UTBK & Sekolah)" }]
                  : isCPNS
                  ? [{ key: "RECOMMENDED_CPNS", label: "★ Sesuai Jenjang Anda (CPNS & BUMN)" }]
                  : []),
                { key: "UTBK_SNBT", label: "UTBK-SNBT" },
                { key: "K12", label: "Bimbel K-12" },
                { key: "CPNS_BUMN", label: "CPNS & BUMN" },
                { key: "TOEFL_IELTS", label: "TOEFL & IELTS" },
                { key: "ALL", label: "Semua Paket Tryout" },
              ].map((filter) => {
                const isSelected = selectedExamCategory === filter.key;
                const count =
                  filter.key === "RECOMMENDED_K12"
                    ? availableExams.filter((e) => e.category === "UTBK_SNBT" || e.category === "K12").length
                    : filter.key === "RECOMMENDED_CPNS"
                    ? availableExams.filter((e) => e.category === "CPNS_BUMN" || e.category === "KEDINASAN").length
                    : filter.key === "ALL"
                    ? availableExams.length
                    : availableExams.filter((e) => e.category === filter.key).length;

                return (
                  <button
                    key={filter.key}
                    onClick={() => setSelectedExamCategory(filter.key)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-[#09408C] text-white border-[#09408C] shadow-2xs"
                        : "bg-white text-[#5B6882] border-[#D5DDEB] hover:border-[#9AC1E2] hover:text-[#1B2A41]"
                    }`}
                  >
                    <span>{filter.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected ? "bg-white/20 text-white" : "bg-[#EAF1FA] text-[#09408C]"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Grid of Available Exams */}
            {filteredExams.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#D5DDEB] p-8 text-center text-[#5B6882]">
                <Award size={32} className="mx-auto mb-2 text-[#9AC1E2]" />
                <h3 className="font-heading font-bold text-[#1B2A41] mb-1">
                  Belum Ada Paket Ujian untuk Kategori Ini
                </h3>
                <p className="text-sm">
                  Silakan pilih filter "Semua Paket Tryout" atau hubungi admin untuk paket tryout baru.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredExams.map((exam) => (
                  <div
                    key={exam.id}
                    className="bg-white rounded-3xl border border-[#D5DDEB] p-6 shadow-xs hover:border-[#09408C] hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2.5 py-1 rounded-full bg-[#EAF1FA] text-[#09408C] text-[11px] font-bold border border-[#9AC1E2]/60">
                            {exam.category.replace("_", " ")}
                          </span>
                          {((isK12 && (exam.category === "UTBK_SNBT" || exam.category === "K12")) ||
                            (isCPNS && exam.category === "CPNS_BUMN")) && (
                            <span className="px-2 py-0.5 rounded-full bg-[#E3F4EC] text-[#1F6F4A] text-[10px] font-bold">
                              ★ Rekomendasi
                            </span>
                          )}
                        </div>
                        <span className="flex items-center gap-1 text-[11px] text-[#1F6F4A] font-semibold bg-[#E3F4EC] px-2 py-0.5 rounded-full shrink-0">
                          Tersedia
                        </span>
                      </div>

                      <h4 className="font-bold text-base text-[#1B2A41] font-heading leading-snug">
                        {exam.title}
                      </h4>
                      <p className="text-xs text-[#5B6882] mt-2 line-clamp-2 leading-relaxed">
                        {exam.description || "Simulasi tryout dengan sistem penilaian otomatis."}
                      </p>

                      <div className="mt-4 pt-4 border-t border-[#D5DDEB] grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-[#F4F7FB] p-2 rounded-xl">
                          <div className="text-[10px] text-[#5B6882]">Waktu</div>
                          <div className="font-bold text-[#09408C] mt-0.5 flex items-center justify-center gap-1">
                            <Clock size={12} />
                            <span>{exam.durationMinutes}m</span>
                          </div>
                        </div>

                        <div className="bg-[#F4F7FB] p-2 rounded-xl">
                          <div className="text-[10px] text-[#5B6882]">Passing Grade</div>
                          <div className="font-bold text-[#1F6F4A] mt-0.5">
                            {exam.passingGrade}
                          </div>
                        </div>

                        <div className="bg-[#F4F7FB] p-2 rounded-xl">
                          <div className="text-[10px] text-[#5B6882]">Soal</div>
                          <div className="font-bold text-[#1B2A41] mt-0.5">
                            {exam.totalQuestions} Butir
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-[#D5DDEB]">
                      <Link
                        href={`/portal/ujian/${exam.id}`}
                        className="w-full py-2.5 rounded-xl bg-[#09408C] text-white text-xs font-bold hover:bg-[#0E3571] transition-colors flex items-center justify-center gap-2 shadow-xs"
                      >
                        <Play size={14} className="fill-white" />
                        <span>{exam.category === "CPNS_BUMN" ? "Mulai Simulasi CAT" : "Mulai Tryout Ujian"}</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Riwayat Nilai & Rapor Digital */}
            {examHistory.length > 0 && (
              <div className="bg-white rounded-3xl border border-[#D5DDEB] p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-bold text-[#09408C] font-heading">
                      Riwayat Tryout & Rapor Nilai Digital
                    </h4>
                    <p className="text-xs text-[#5B6882] mt-0.5">
                      Hasil evaluasi pengerjaan simulasi ujian sebelumnya beserta pembahasan soal.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {examHistory.map((sess) => (
                    <div
                      key={sess.id}
                      className="p-4 rounded-2xl bg-[#F4F7FB] border border-[#D5DDEB] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#9AC1E2] transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                              sess.isPassed
                                ? "bg-[#E3F4EC] text-[#1F6F4A] border-[#1F6F4A]/30"
                                : "bg-[#FBE9E5] text-[#B4381F] border-[#B4381F]/30"
                            }`}
                          >
                            {sess.isPassed ? "LULUS PASSING GRADE" : "BELUM LULUS"}
                          </span>
                          <span className="text-xs text-[#5B6882]">
                            {new Date(
                              sess.submittedAt || sess.startedAt
                            ).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <h5 className="font-bold text-sm text-[#1B2A41]">
                          {sess.exam?.title || "Simulasi Ujian Digital"}
                        </h5>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <div className="text-[10px] text-[#5B6882]">Perolehan Skor</div>
                          <div className="text-xl font-extrabold text-[#09408C] font-heading">
                            {sess.score}
                          </div>
                        </div>

                        <Link
                          href={`/portal/ujian/${sess.examId}/hasil?sessionId=${sess.id}`}
                          className="px-3.5 py-2 rounded-xl bg-white border border-[#D5DDEB] text-xs font-semibold text-[#09408C] hover:bg-[#EAF1FA] transition-colors flex items-center gap-1.5 shadow-2xs"
                        >
                          <FileText size={14} />
                          <span>Lihat Pembahasan</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Bank Modul & Materi Belajar Digital */}
        {activeTab === "materi" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-[#D5DDEB] p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E3F4EC] text-[#1F6F4A] text-xs font-bold border border-[#1F6F4A]/30 mb-2">
                  <BookOpen size={14} />
                  <span>Modul Belajar & Pocket Book Eksklusif</span>
                </div>
                <h3 className="text-xl font-bold text-[#09408C] font-heading">
                  Bank Modul & Ringkasan Rumus Digital
                </h3>
                <p className="text-xs sm:text-sm text-[#5B6882] mt-0.5">
                  Unduh e-book, kisi-kisi, ringkasan rumus cepat, dan bank soal terkurasi untuk mendampingi bimbingan Anda.
                </p>
              </div>

              <div className="w-full sm:w-72 relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B6882]" />
                <input
                  type="text"
                  placeholder="Cari modul atau materi..."
                  value={materialSearch}
                  onChange={(e) => setMaterialSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#D5DDEB] text-xs text-[#1B2A41] placeholder:text-[#5B6882]/70 focus:outline-none focus:border-[#09408C] bg-[#F4F7FB]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {(isK12
                ? [
                    { key: "K12", label: "★ Bimbel K-12 (Jenjang Anda)" },
                    { key: "UTBK_SNBT", label: "UTBK-SNBT" },
                    { key: "ALL", label: "Semua Program" },
                    { key: "CPNS_BUMN", label: "CPNS & BUMN" },
                    { key: "TOEFL_IELTS", label: "TOEFL & IELTS" },
                    { key: "S2_BEASISWA", label: "S2 & Beasiswa" },
                    { key: "PENULISAN_ILMIAH", label: "Kepenulisan Ilmiah" },
                  ]
                : isCPNS
                ? [
                    { key: "CPNS_BUMN", label: "★ CPNS & BUMN (Jenjang Anda)" },
                    { key: "ALL", label: "Semua Program" },
                    { key: "UTBK_SNBT", label: "UTBK-SNBT" },
                    { key: "TOEFL_IELTS", label: "TOEFL & IELTS" },
                    { key: "S2_BEASISWA", label: "S2 & Beasiswa" },
                    { key: "PENULISAN_ILMIAH", label: "Kepenulisan Ilmiah" },
                    { key: "K12", label: "Bimbel K-12" },
                  ]
                : [
                    { key: "ALL", label: "Semua Program" },
                    { key: "CPNS_BUMN", label: "CPNS & BUMN" },
                    { key: "UTBK_SNBT", label: "UTBK-SNBT" },
                    { key: "TOEFL_IELTS", label: "TOEFL & IELTS" },
                    { key: "S2_BEASISWA", label: "S2 & Beasiswa" },
                    { key: "PENULISAN_ILMIAH", label: "Kepenulisan Ilmiah" },
                    { key: "K12", label: "Bimbel K-12" },
                  ]
              ).map((c) => {
                const count =
                  c.key === "ALL"
                    ? studentMaterials.length
                    : studentMaterials.filter((m) => m.programCategory === c.key).length;
                return (
                  <button
                    key={c.key}
                    onClick={() => setSelectedMaterialCategory(c.key as ProgramCategory)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border flex items-center gap-1.5 ${
                      selectedMaterialCategory === c.key
                        ? "bg-[#09408C] text-white border-[#09408C] shadow-2xs"
                        : "bg-white text-[#5B6882] border-[#D5DDEB] hover:border-[#9AC1E2] hover:text-[#1B2A41]"
                    }`}
                  >
                    <span>{c.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        selectedMaterialCategory === c.key
                          ? "bg-white/20 text-white"
                          : "bg-[#EAF1FA] text-[#09408C]"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {filteredMaterials.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#D5DDEB] p-8 text-center text-[#5B6882]">
                <BookOpen size={32} className="mx-auto mb-2 text-[#9AC1E2]" />
                <h3 className="font-heading font-bold text-[#1B2A41] mb-1">
                  Modul Belum Ditemukan
                </h3>
                <p className="text-sm">
                  Tidak ada modul materi yang sesuai dengan kata kunci atau kategori yang Anda pilih.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredMaterials.map((mat) => (
                  <div
                    key={mat.id}
                    className="bg-white rounded-3xl border border-[#D5DDEB] p-6 shadow-xs hover:border-[#09408C] hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-2.5 py-1 rounded-full bg-[#EAF1FA] text-[#09408C] text-[11px] font-bold border border-[#9AC1E2]/60">
                          {mat.programCategory.replace(/_/g, " ")}
                        </span>
                        <span className="text-[11px] text-[#5B6882] font-semibold bg-[#F4F7FB] px-2 py-0.5 rounded-full">
                          {mat.fileSize}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-[#295897] mb-1">
                        {mat.subject}
                      </div>

                      <h4 className="font-bold text-base text-[#1B2A41] font-heading leading-snug">
                        {mat.title}
                      </h4>

                      <p className="text-xs text-[#5B6882] mt-2 line-clamp-3 leading-relaxed">
                        {mat.description || "Modul dan rangkuman komprehensif dari tim akademik Sahabat Belajar."}
                      </p>

                      <div className="mt-4 pt-3 border-t border-[#D5DDEB] flex items-center justify-between text-xs text-[#5B6882]">
                        <span className="truncate max-w-[170px]" title={mat.authorTutor}>
                          Oleh: <strong className="text-[#1B2A41]">{mat.authorTutor}</strong>
                        </span>
                        <span>{mat.downloadCount}x diunduh</span>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-[#D5DDEB] grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleDownloadMaterial(mat)}
                        className="w-full py-2.5 rounded-xl bg-[#09408C] text-white text-xs font-bold hover:bg-[#0E3571] transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Download size={14} />
                        <span>Unduh</span>
                      </button>
                      <button
                        onClick={() => setPreviewMaterial(mat)}
                        className="w-full py-2.5 rounded-xl bg-[#EAF1FA] text-[#09408C] text-xs font-bold hover:bg-[#D5DDEB] transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Eye size={14} />
                        <span>Baca Modul</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Tagihan & Kwitansi Resmi (PRD Modul D4, H2) */}
        {activeTab === "tagihan" && (
          <div className="space-y-6">
            {/* Header Tagihan */}
            <div className="bg-white rounded-3xl border border-[#D5DDEB] p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF1FA] text-[#09408C] text-xs font-bold border border-[#9AC1E2] mb-2">
                  <CreditCard size={14} />
                  <span>Kwitansi & Pembayaran Resmi</span>
                </div>
                <h3 className="text-xl font-bold text-[#09408C] font-heading">
                  Riwayat Tagihan & Kwitansi Bimbingan Belajar
                </h3>
                <p className="text-xs sm:text-sm text-[#5B6882] mt-0.5">
                  Pantau status pelunasan paket, unduh kwitansi resmi, dan lakukan konfirmasi pembayaran mandiri.
                </p>
              </div>

              <button
                onClick={() => setShowPayModal(true)}
                className="px-4 py-2.5 rounded-xl bg-[#09408C] hover:bg-[#0E3571] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors shrink-0"
              >
                <Plus size={14} />
                <span>Konfirmasi Pembayaran Mandiri</span>
              </button>
            </div>

            {/* Official Bank Account Cards */}
            <div className="bg-white rounded-3xl border border-[#D5DDEB] p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#09408C]">
                <ShieldCheck size={16} />
                <span>Rekening Resmi Pembayaran Sahabat Belajar (Atas Nama Lembaga):</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#F4F7FB] p-3.5 rounded-2xl border border-[#D5DDEB] flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-[#5B6882] font-bold uppercase">Bank BCA</div>
                    <div className="text-sm font-bold text-[#1B2A41] font-mono">123-456-7890</div>
                    <div className="text-[10px] text-[#5B6882]">a.n. Sahabat Belajar</div>
                  </div>
                  <button
                    onClick={() => handleCopyText("1234567890", "No. Rekening BCA")}
                    className="p-2 rounded-xl text-[#09408C] hover:bg-[#EAF1FA] transition-colors"
                    title="Salin No. Rekening"
                  >
                    <Copy size={16} />
                  </button>
                </div>

                <div className="bg-[#F4F7FB] p-3.5 rounded-2xl border border-[#D5DDEB] flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-[#5B6882] font-bold uppercase">Bank Mandiri</div>
                    <div className="text-sm font-bold text-[#1B2A41] font-mono">137-00-1234567-8</div>
                    <div className="text-[10px] text-[#5B6882]">a.n. Sahabat Belajar</div>
                  </div>
                  <button
                    onClick={() => handleCopyText("1370012345678", "No. Rekening Mandiri")}
                    className="p-2 rounded-xl text-[#09408C] hover:bg-[#EAF1FA] transition-colors"
                    title="Salin No. Rekening"
                  >
                    <Copy size={16} />
                  </button>
                </div>

                <div className="bg-[#F4F7FB] p-3.5 rounded-2xl border border-[#D5DDEB] flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-[#5B6882] font-bold uppercase">QRIS Sahabat Belajar</div>
                    <div className="text-xs font-bold text-[#1F6F4A]">Scan Instan Semua Aplikasi</div>
                    <div className="text-[10px] text-[#5B6882]">GoPay, OVO, ShopeePay, BCA</div>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-[#E3F4EC] text-[#1F6F4A] flex items-center justify-center font-bold text-xs">
                    QR
                  </div>
                </div>
              </div>
            </div>

            {/* Invoices List */}
            <div className="bg-white rounded-3xl border border-[#D5DDEB] p-6 shadow-xs space-y-4">
              <h4 className="font-heading font-bold text-base text-[#1B2A41]">
                Daftar Tagihan & Bukti Kwitansi
              </h4>

              {invoices.length === 0 ? (
                <div className="p-8 text-center text-sm text-[#5B6882]">
                  Belum ada riwayat tagihan untuk profil siswa ini.
                </div>
              ) : (
                <div className="space-y-3">
                  {invoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-4 rounded-2xl bg-[#F4F7FB] border border-[#D5DDEB] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#9AC1E2] transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                              inv.status === "LUNAS"
                                ? "bg-[#E3F4EC] text-[#1F6F4A] border-[#1F6F4A]/30"
                                : "bg-[#FEF7E6] text-[#B45309] border-[#F5B82E]/50"
                            }`}
                          >
                            {inv.status === "LUNAS" ? "LUNAS" : "MENUNGGU PEMBAYARAN"}
                          </span>
                          <span className="text-xs text-[#5B6882] font-mono">
                            {inv.invoiceNumber}
                          </span>
                        </div>
                        <h5 className="font-bold text-sm text-[#1B2A41]">
                          {inv.packageName}
                        </h5>
                        <p className="text-xs text-[#5B6882]">
                          Metode: {inv.method.replace("_", " ")} | Tanggal:{" "}
                          {inv.paidAt ? formatDate(inv.paidAt) : "-"}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <div className="text-[10px] text-[#5B6882]">Total Tagihan</div>
                          <div className="text-lg font-extrabold text-[#09408C] font-heading">
                            Rp {inv.amount.toLocaleString("id-ID")}
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedReceipt(inv)}
                          className="px-3.5 py-2 rounded-xl bg-white border border-[#D5DDEB] text-xs font-semibold text-[#09408C] hover:bg-[#EAF1FA] transition-colors flex items-center gap-1.5 shadow-2xs"
                        >
                          <Printer size={14} />
                          <span>Lihat Kwitansi</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Kwitansi Resmi Sahabat Belajar */}
        {selectedReceipt && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#D5DDEB] space-y-6 relative print:p-0">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="absolute top-5 right-5 p-1.5 rounded-full text-[#5B6882] hover:bg-slate-100 transition-colors print:hidden"
              >
                <X size={18} />
              </button>

              {/* Receipt Header */}
              <div className="flex items-center justify-between border-b border-[#D5DDEB] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white p-0.5 border border-[#D5DDEB] flex items-center justify-center shadow-xs shrink-0">
                    <Image
                      src="/images/logo-sahabat-belajar.png"
                      alt="Sahabat Belajar"
                      width={44}
                      height={44}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base text-[#09408C] leading-tight">
                      Sahabat Belajar
                    </h3>
                    <p className="text-[11px] text-[#5B6882]">
                      Lembaga Bimbingan Belajar & Solusi Akademik
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-[#1F6F4A] bg-[#E3F4EC] px-2.5 py-0.5 rounded-full inline-block border border-[#1F6F4A]/30">
                    LUNAS
                  </div>
                  <div className="text-[10px] text-[#5B6882] font-mono mt-1">
                    {selectedReceipt.invoiceNumber}
                  </div>
                </div>
              </div>

              {/* Receipt Body */}
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3 bg-[#F4F7FB] p-3.5 rounded-2xl border border-[#D5DDEB]">
                  <div>
                    <span className="text-[#5B6882] block text-[11px]">Diterima dari:</span>
                    <strong className="text-[#1B2A41] text-sm block">{student.name}</strong>
                    <span className="text-[#5B6882]">Wali: {student.parentName || "-"}</span>
                  </div>
                  <div>
                    <span className="text-[#5B6882] block text-[11px]">Tanggal Pembayaran:</span>
                    <strong className="text-[#1B2A41] block">
                      {selectedReceipt.paidAt ? formatDate(selectedReceipt.paidAt) : "-"}
                    </strong>
                    <span className="text-[#5B6882]">Metode: {selectedReceipt.method.replace("_", " ")}</span>
                  </div>
                </div>

                <div className="border border-[#D5DDEB] rounded-2xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-[#F4F7FB] border-b border-[#D5DDEB] text-[11px] font-semibold uppercase tracking-wider text-[#5B6882]">
                      <tr>
                        <th className="p-3">Uraian Paket Bimbingan</th>
                        <th className="p-3 text-right">Nominal</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-3">
                          <strong className="text-[#1B2A41] block">{selectedReceipt.packageName}</strong>
                          <span className="text-[#5B6882] text-[11px]">{selectedReceipt.programName}</span>
                        </td>
                        <td className="p-3 text-right font-bold text-[#09408C]">
                          Rp {selectedReceipt.amount.toLocaleString("id-ID")}
                        </td>
                      </tr>
                    </tbody>
                    <tfoot className="border-t border-[#D5DDEB] bg-slate-50 font-bold">
                      <tr>
                        <td className="p-3">TOTAL PEMBAYARAN</td>
                        <td className="p-3 text-right text-sm text-[#09408C]">
                          Rp {selectedReceipt.amount.toLocaleString("id-ID")}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Stempel & Signature Preview */}
                <div className="pt-2 flex justify-between items-end">
                  <div className="text-[10px] text-[#5B6882] max-w-xs">
                    * Dokumen ini adalah bukti pembayaran sah yang diterbitkan oleh sistem digital Sahabat Belajar.
                  </div>
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#1F6F4A] flex flex-col items-center justify-center mx-auto text-[#1F6F4A] text-[9px] font-bold rotate-[-12deg] bg-[#E3F4EC]/30 mb-1">
                      <span>SAHABAT BELAJAR</span>
                      <span className="text-[11px]">★ LUNAS ★</span>
                      <span>TERVERIFIKASI</span>
                    </div>
                    <div className="text-[11px] font-bold text-[#1B2A41]">Bagian Keuangan</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-[#D5DDEB] flex items-center justify-end gap-2 print:hidden">
                <button
                  onClick={() => setSelectedReceipt(null)}
                  aria-label="Tutup kwitansi"
                  className="px-4 py-2 rounded-xl border border-[#D5DDEB] text-xs font-semibold text-[#5B6882] hover:bg-slate-50 transition-colors"
                >
                  Tutup
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-[#09408C] hover:bg-[#0E3571] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Printer size={14} />
                  <span>Cetak Kwitansi (PDF)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Konfirmasi Pembayaran Mandiri */}
        {showPayModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#D5DDEB] space-y-5 relative max-h-[90vh] overflow-y-auto no-scrollbar">
              <button
                onClick={() => setShowPayModal(false)}
                aria-label="Tutup dialog konfirmasi pembayaran"
                className="absolute top-5 right-5 p-1.5 rounded-full text-[#5B6882] hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>

              <div>
                <h3 className="text-lg font-heading font-bold text-[#09408C]">
                  Konfirmasi Pembayaran Mandiri
                </h3>
                <p className="text-xs text-[#5B6882] mt-0.5">
                  Kirimkan detail transfer Anda agar kuota sesi bimbingan segera diaktifkan.
                </p>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label htmlFor="pay-bank" className="block font-semibold text-[#1B2A41] mb-1">
                    Rekening Tujuan Transfer <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="pay-bank"
                    value={payBank}
                    onChange={(e) => setPayBank(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5DDEB] text-xs bg-[#F4F7FB] focus:outline-none focus:border-[#09408C]"
                  >
                    <option value="BCA (123-456-7890)">BCA — 123-456-7890 a.n Sahabat Belajar</option>
                    <option value="Mandiri (137-00-1234567-8)">Mandiri — 137-00-1234567-8 a.n Sahabat Belajar</option>
                    <option value="BSI (7123-456-789)">BSI — 7123-456-789 a.n Sahabat Belajar</option>
                    <option value="QRIS">QRIS Sahabat Belajar</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="pay-sender-name" className="block font-semibold text-[#1B2A41] mb-1">
                    Nama Pemilik Rekening Pengirim <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="pay-sender-name"
                    type="text"
                    required
                    placeholder="Contoh: Bambang Haryanto"
                    value={paySenderName}
                    onChange={(e) => setPaySenderName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5DDEB] text-xs bg-[#F4F7FB] focus:outline-none focus:border-[#09408C]"
                  />
                </div>

                <div>
                  <label htmlFor="pay-amount" className="block font-semibold text-[#1B2A41] mb-1">
                    Nominal Transfer (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="pay-amount"
                    type="number"
                    required
                    placeholder="Contoh: 2250000"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5DDEB] text-xs bg-[#F4F7FB] focus:outline-none focus:border-[#09408C]"
                  />
                </div>

                <div>
                  <label htmlFor="pay-notes" className="block font-semibold text-[#1B2A41] mb-1">
                    Catatan Tambahan (Opsional)
                  </label>
                  <input
                    id="pay-notes"
                    type="text"
                    placeholder="Contoh: Pelunasan sisa 5 sesi bimbingan"
                    value={payNotes}
                    onChange={(e) => setPayNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5DDEB] text-xs bg-[#F4F7FB] focus:outline-none focus:border-[#09408C]"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#D5DDEB] sticky bottom-0 bg-white">
                  <button
                    type="button"
                    onClick={() => setShowPayModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-[#D5DDEB] text-xs font-semibold text-[#5B6882] hover:bg-slate-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingPay}
                    className="px-5 py-2.5 rounded-xl bg-[#09408C] hover:bg-[#0E3571] text-white text-xs font-bold transition-colors shadow-xs disabled:opacity-50"
                  >
                    {isSubmittingPay ? "Mengirimkan..." : "Kirim Konfirmasi"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Pratinjau Berkas PDF untuk Siswa */}
        {previewMaterial && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-4xl w-full h-[90vh] shadow-2xl border border-[#D5DDEB] flex flex-col overflow-hidden">
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-[#D5DDEB] flex items-center justify-between gap-3 bg-[#F4F7FB]/70">
                <div className="flex items-center gap-3 truncate">
                  <div className="w-10 h-10 rounded-xl bg-[#EAF1FA] text-[#09408C] flex items-center justify-center shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="truncate">
                    <h3 className="text-sm sm:text-base font-bold text-[#09408C] font-heading truncate">
                      {previewMaterial.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-[#5B6882] mt-0.5">
                      <span className="font-semibold text-[#295897]">{previewMaterial.subject}</span>
                      <span>•</span>
                      <span>{previewMaterial.fileName} ({previewMaterial.fileSize})</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={previewMaterial.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl text-[#5B6882] hover:text-[#09408C] hover:bg-[#EAF1FA] transition-colors"
                    title="Buka di Tab Baru"
                  >
                    <ExternalLink size={16} />
                  </a>
                  <button
                    onClick={() => handleDownloadMaterial(previewMaterial)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571] transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <Download size={14} />
                    <span>Unduh Modul</span>
                  </button>
                  <button
                    onClick={() => setPreviewMaterial(null)}
                    className="p-2 rounded-xl text-[#5B6882] hover:text-[#1B2A41] hover:bg-[#EAF1FA] transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Modal Body: Embedded PDF Preview */}
              <div className="flex-1 bg-slate-100 p-2 sm:p-4 overflow-hidden">
                <iframe
                  src={`${previewMaterial.fileUrl}#toolbar=1`}
                  title={previewMaterial.title}
                  className="w-full h-full rounded-2xl bg-white border border-[#D5DDEB] shadow-inner"
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer Support Banner */}
        <div className="bg-[#EAF1FA] border border-[#9AC1E2] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#09408C] text-white flex items-center justify-center shrink-0">
              <HelpCircle size={20} />
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-[#09408C]">
                Perlu Konsultasi atau Ubah Jadwal?
              </h4>
              <p className="text-xs text-[#5B6882]">
                Admin Sahabat Belajar siap membantu kebutuhan bimbingan belajar Anda.
              </p>
            </div>
          </div>
          <a
            href="https://wa.me/628123456789?text=Halo%20Admin%20Sahabat%20Belajar,%20saya%20ingin%20konsultasi%20mengenai%20jadwal%20dan%20perkembangan%20belajar"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#09408C] hover:bg-[#0E3571] text-white text-xs font-semibold rounded-xl transition-colors shrink-0 shadow-xs"
          >
            Hubungi Admin WhatsApp
          </a>
        </div>
      </main>
    </div>
  );
}
