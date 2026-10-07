"use client";

import { useState } from "react";
import {
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Search,
  Filter,
  UserCheck,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  Video,
  Send,
  GraduationCap,
  BookOpen,
  Award,
  RefreshCw,
  Plus,
  ChevronRight,
  Building2,
  SlidersHorizontal,
} from "lucide-react";
import {
  getRecommendedTutors,
  createMentorshipProposal,
  getDispatcherBoardData,
  type MentorshipBookingItem,
} from "@/actions/penjadwalan";
import type { TutorProfileData, MatchCandidate } from "@/lib/tutor-matching";

interface Props {
  initialData: {
    studentsNeedingMatch: any[];
    activeBookings: MentorshipBookingItem[];
    tutors: TutorProfileData[];
    metrics: {
      pendingMatching: number;
      awaitingTutorConfirm: number;
      confirmedBookings: number;
      activeTutorsCount: number;
    };
  };
}

export default function DispatcherBoardClient({ initialData }: Props) {
  const [data, setData] = useState(initialData);
  const [activeTab, setActiveTab] = useState<"queue" | "bookings" | "tutors">("queue");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("Semua");
  const [bookingFilter, setBookingFilter] = useState("ALL");

  // Matching Modal State
  const [matchingModalOpen, setMatchingModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [matchingCandidates, setMatchingCandidates] = useState<MatchCandidate[]>([]);
  const [matchingLoading, setMatchingLoading] = useState(false);

  // Proposal Submission State
  const [selectedCandidate, setSelectedCandidate] = useState<MatchCandidate | null>(null);
  const [proposalDate, setProposalDate] = useState("");
  const [proposalSlot, setProposalSlot] = useState("19:30 - 21:00 WIB");
  const [proposalNotes, setProposalNotes] = useState("");
  const [submittingProposal, setSubmittingProposal] = useState(false);
  const [proposalSuccessMessage, setProposalSuccessMessage] = useState<string | null>(null);

  // Copied token state
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const refreshData = async () => {
    try {
      const refreshed = await getDispatcherBoardData();
      setData(refreshed);
    } catch (err) {
      console.error("Failed to refresh data:", err);
    }
  };

  const handleOpenMatchingModal = async (student: any) => {
    setSelectedStudent(student);
    setMatchingModalOpen(true);
    setMatchingLoading(true);
    setSelectedCandidate(null);
    setProposalSuccessMessage(null);

    // Default proposal date: 3 days from now
    const d = new Date();
    d.setDate(d.getDate() + 3);
    setProposalDate(d.toISOString().split("T")[0]);

    try {
      const res = await getRecommendedTutors(student.id);
      if (res.success && res.data) {
        setMatchingCandidates(res.data.candidates);
        if (res.data.candidates.length > 0) {
          setSelectedCandidate(res.data.candidates[0]);
          if (res.data.candidates[0].recommendedSlots.length > 0) {
            setProposalSlot(res.data.candidates[0].recommendedSlots[0]);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMatchingLoading(false);
    }
  };

  const handleDispatchProposal = async () => {
    if (!selectedStudent || !selectedCandidate) return;
    setSubmittingProposal(true);
    setProposalSuccessMessage(null);

    try {
      const res = await createMentorshipProposal({
        registrationId: selectedStudent.id,
        studentName: selectedStudent.name,
        studentWhatsapp: selectedStudent.phone,
        studentEmail: selectedStudent.email,
        studentInstitution: selectedStudent.institution,
        studentEducationLevel: selectedStudent.educationLevel,
        tutorId: selectedCandidate.tutor.id,
        researchTopic: selectedStudent.researchTopic || selectedStudent.courseTitle || "Bimbingan Riset",
        researchSoftware: selectedStudent.researchSoftware || undefined,
        scheduledDate: proposalDate,
        timeSlot: proposalSlot,
        tutorNotes: proposalNotes,
      });

      if (res.success) {
        setProposalSuccessMessage(res.message || null);
        await refreshData();
        setTimeout(() => {
          setMatchingModalOpen(false);
          setActiveTab("bookings");
        }, 1800);
      } else {
        alert(res.message);
      }
    } catch {
      alert("Terjadi kesalahan sistem saat mengirim penugasan.");
    } finally {
      setSubmittingProposal(false);
    }
  };

  const copyMagicLink = (token: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const url = `${origin}/tutor/konfirmasi/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  // Filter Bookings
  const filteredBookings = data.activeBookings.filter((b) => {
    if (bookingFilter === "ALL") return true;
    return b.status === bookingFilter;
  });

  // Filter Tutors
  const filteredTutors = data.tutors.filter((t) => {
    const matchesSearch =
      !searchQuery ||
      t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.specializations.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSpec =
      selectedSpecialization === "Semua" ||
      t.specializations.some((s) => s.toLowerCase().includes(selectedSpecialization.toLowerCase()));

    return matchesSearch && matchesSpec;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#001847] font-display">
              Papan Penjadwalan 200+ Tutor
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fdbc13]/20 text-[#7a5900] border border-[#fdbc13]/40">
              Human in the Loop
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Matching cerdas topik mahasiswa dengan 200+ tutor pakar & konfirmasi satu klik WhatsApp.
          </p>
        </div>

        <button
          type="button"
          onClick={refreshData}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-white border border-[#e2e8f0] rounded-lg text-slate-700 hover:bg-slate-50 shadow-sm transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Perbarui Data
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#fdbc13]" />
          <span className="text-xs font-medium text-slate-500 block uppercase tracking-wider">
            Mahasiswa Siap Dijadwalkan
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-[#001847] font-display">
              {data.metrics.pendingMatching}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
              Perlu Mentor
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
          <span className="text-xs font-medium text-slate-500 block uppercase tracking-wider">
            Menunggu Konfirmasi Tutor
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-[#001847] font-display">
              {data.metrics.awaitingTutorConfirm}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              Pending WA
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
          <span className="text-xs font-medium text-slate-500 block uppercase tracking-wider">
            Bimbingan Terkonfirmasi
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-[#001847] font-display">
              {data.metrics.confirmedBookings}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Jadwal Terkunci
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#001847]" />
          <span className="text-xs font-medium text-slate-500 block uppercase tracking-wider">
            Direktori 200+ Tutor Pakar
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-[#001847] font-display">
              {data.metrics.activeTutorsCount}+
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              Aktif Siap Sesi
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#e2e8f0] gap-8">
        <button
          type="button"
          onClick={() => setActiveTab("queue")}
          className={`pb-3 text-sm font-semibold transition relative flex items-center gap-2 ${
            activeTab === "queue"
              ? "text-[#001847] border-b-2 border-[#001847]"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Antrean Mahasiswa ({data.studentsNeedingMatch.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("bookings")}
          className={`pb-3 text-sm font-semibold transition relative flex items-center gap-2 ${
            activeTab === "bookings"
              ? "text-[#001847] border-b-2 border-[#001847]"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Calendar className="w-4 h-4" />
          Papan Bimbingan Berjalan ({data.activeBookings.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tutors")}
          className={`pb-3 text-sm font-semibold transition relative flex items-center gap-2 ${
            activeTab === "tutors"
              ? "text-[#001847] border-b-2 border-[#001847]"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Users className="w-4 h-4" />
          Direktori 200+ Tutor Pakar ({data.tutors.length}+)
        </button>
      </div>

      {/* TAB 1: Antrean Mahasiswa */}
      {activeTab === "queue" && (
        <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#e2e8f0] bg-[#f8f9ff] flex items-center justify-between">
            <span className="text-xs font-bold text-[#001847] uppercase tracking-wider">
              Mahasiswa Terverifikasi yang Belum Memiliki Tutor
            </span>
            <span className="text-xs text-slate-500">
              Total {data.studentsNeedingMatch.length} Mahasiswa
            </span>
          </div>

          {data.studentsNeedingMatch.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="font-semibold text-slate-800">Semua Mahasiswa Telah Terjadwalkan!</p>
              <p className="text-xs mt-1">Tidak ada antrean mahasiswa yang menunggu pencocokan tutor saat ini.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#e2e8f0]">
              {data.studentsNeedingMatch.map((s) => (
                <div key={s.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">{s.name}</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-[#001847] border border-blue-200">
                        {s.educationLevel}
                      </span>
                      <span className="text-xs text-slate-500">
                        • {s.institution}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        ({s.invoiceNumber})
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-[#e2e8f0] max-w-3xl">
                      <span className="font-semibold text-[#001847]">Topik Riset:</span>{" "}
                      {s.researchTopic || s.courseTitle || "Bimbingan Komprehensif Riset"}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-0.5">
                      <span>WhatsApp: +{s.phone}</span>
                      <span>Email: {s.email}</span>
                      <span className="text-emerald-700 font-medium">Status: {s.status}</span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenMatchingModal(s)}
                      className="w-full md:w-auto px-4 py-2.5 rounded-lg bg-[#001847] hover:bg-[#0b2c6b] text-white text-xs font-semibold shadow-sm transition flex items-center justify-center gap-2"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-[#fdbc13]" />
                      Cocokkan Tutor Pakar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Papan Bimbingan Berjalan */}
      {activeTab === "bookings" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Filter Status:</span>
              {(["ALL", "PENDING_TUTOR_CONFIRMATION", "CONFIRMED", "DECLINED_BY_TUTOR"] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setBookingFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    bookingFilter === st
                      ? "bg-[#001847] text-white"
                      : "bg-white text-slate-600 border border-[#e2e8f0] hover:bg-slate-50"
                  }`}
                >
                  {st === "ALL"
                    ? "Semua"
                    : st === "PENDING_TUTOR_CONFIRMATION"
                    ? "Menunggu Konfirmasi"
                    : st === "CONFIRMED"
                    ? "Terkonfirmasi"
                    : "Ditolak Tutor"}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
            {filteredBookings.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">Belum Ada Sesi Bimbingan pada Kategori Ini</p>
              </div>
            ) : (
              <div className="divide-y divide-[#e2e8f0]">
                {filteredBookings.map((b) => (
                  <div key={b.id} className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/70 transition">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {b.status === "CONFIRMED" && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Terkonfirmasi
                          </span>
                        )}
                        {b.status === "PENDING_TUTOR_CONFIRMATION" && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-blue-600" />
                            Menunggu Konfirmasi Tutor
                          </span>
                        )}
                        {b.status === "DECLINED_BY_TUTOR" && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            Ditolak / Reschedule
                          </span>
                        )}

                        <span className="text-xs font-semibold text-slate-900">
                          {b.studentName}
                        </span>
                        <span className="text-slate-400 text-xs">➔</span>
                        <span className="text-xs font-bold text-[#001847]">
                          {b.tutorName}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 bg-[#f8f9ff] p-2.5 rounded-lg border border-[#d5e3fc]">
                        <span className="font-semibold text-[#001847]">Topik:</span> {b.researchTopic}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {b.scheduledDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {b.timeSlot}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <button
                        type="button"
                        onClick={() => copyMagicLink(b.confirmationToken)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1 transition"
                      >
                        {copiedToken === b.confirmationToken ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        {copiedToken === b.confirmationToken ? "Link Disalin" : "Salin Link WA Tutor"}
                      </button>

                      <a
                        href={`/tutor/konfirmasi/${b.confirmationToken}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg border border-[#001847] text-[#001847] hover:bg-blue-50 text-xs font-semibold flex items-center gap-1 transition"
                      >
                        Lihat Halaman <ExternalLink className="w-3 h-3" />
                      </a>

                      {b.zoomJoinUrl && (
                        <a
                          href={b.zoomJoinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-[#001847] hover:bg-[#0b2c6b] text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition"
                        >
                          <Video className="w-3.5 h-3.5 text-[#fdbc13]" />
                          Buka Zoom
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Direktori 200+ Tutor Pakar */}
      {activeTab === "tutors" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari tutor, universitas, keahlian..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-[#e2e8f0] rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#001847]"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
              {["Semua", "SmartPLS", "SPSS", "NVivo", "Python", "Bibliometrik", "Kedokteran"].map((sp) => (
                <button
                  key={sp}
                  type="button"
                  onClick={() => setSelectedSpecialization(sp)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    selectedSpecialization === sp
                      ? "bg-[#001847] text-white"
                      : "bg-white text-slate-600 border border-[#e2e8f0] hover:bg-slate-50"
                  }`}
                >
                  {sp}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTutors.slice(0, 30).map((t) => (
              <div key={t.id} className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-sm space-y-3 hover:border-blue-300 transition">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-[#001847] font-display">{t.fullName}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{t.institution}</p>
                    <p className="text-[11px] text-[#7a5900] font-medium">{t.academicTitle}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#fdbc13]/20 text-[#7a5900] border border-[#fdbc13]/50">
                    ★ {t.rating}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {t.specializations.map((spec, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#f8f9ff] text-slate-700 border border-[#d5e3fc]"
                    >
                      {spec}
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t border-[#e2e8f0] flex items-center justify-between text-xs text-slate-600">
                  <span>h-index: {t.hIndex} (Scopus)</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-500">Kapasitas:</span>
                    <span className={`font-semibold ${t.currentActive >= t.maxActiveStudents ? "text-rose-600" : "text-emerald-600"}`}>
                      {t.currentActive}/{t.maxActiveStudents} Siswa
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredTutors.length > 30 && (
            <p className="text-center text-xs text-slate-500 pt-4">
              Menampilkan 30 dari total {filteredTutors.length} tutor pakar aktif. Gunakan pencarian untuk memfilter.
            </p>
          )}
        </div>
      )}

      {/* SMART MATCHING MODAL */}
      {matchingModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="bg-[#001847] p-5 text-white flex items-center justify-between rounded-t-2xl">
              <div>
                <span className="text-xs font-semibold text-[#fdbc13] uppercase tracking-wider">
                  Algoritma Smart Matching Tutor
                </span>
                <h2 className="text-lg font-bold font-display text-white mt-0.5">
                  Pencocokan Pakar Riset: {selectedStudent.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setMatchingModalOpen(false)}
                className="text-white/70 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Student Research Snapshot */}
              <div className="bg-[#f8f9ff] rounded-xl p-4 border border-[#d5e3fc] space-y-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-[#001847] text-sm">{selectedStudent.name}</span>
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-[#001847] font-semibold">
                    {selectedStudent.educationLevel} • {selectedStudent.institution}
                  </span>
                </div>
                <p className="text-slate-700">
                  <strong className="text-[#001847]">Topik:</strong> {selectedStudent.researchTopic || selectedStudent.courseTitle}
                </p>
              </div>

              {proposalSuccessMessage && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  {proposalSuccessMessage}
                </div>
              )}

              {/* Recommended Candidate Cards */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#001847] mb-3 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#7a5900]" />
                  Top Rekomendasi Tutor Pakar Terbaik
                </h3>

                {matchingLoading ? (
                  <div className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#001847] mx-auto mb-2" />
                    <p className="text-xs">Menganalisis kecocokan metodologi dan ketersediaan slot...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {matchingCandidates.map((cand, idx) => {
                      const isSelected = selectedCandidate?.tutor.id === cand.tutor.id;
                      return (
                        <div
                          key={cand.tutor.id}
                          onClick={() => {
                            setSelectedCandidate(cand);
                            if (cand.recommendedSlots.length > 0) {
                              setProposalSlot(cand.recommendedSlots[0]);
                            }
                          }}
                          className={`p-4 rounded-xl border cursor-pointer transition ${
                            isSelected
                              ? "border-[#001847] bg-blue-50/40 shadow-sm"
                              : "border-[#e2e8f0] bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-[#001847]">
                                  {cand.tutor.fullName}
                                </span>
                                <span className="text-xs text-slate-500">• {cand.tutor.institution}</span>
                              </div>
                              <p className="text-xs text-slate-600">{cand.tutor.academicTitle}</p>
                            </div>

                            {/* Match Score Badge */}
                            <div className="text-right shrink-0">
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#fdbc13] text-[#001847] shadow-sm">
                                <CheckCircle2 className="w-3 h-3" />
                                {cand.matchScore}% Cocok
                              </span>
                            </div>
                          </div>

                          {/* Reason Chips */}
                          <div className="mt-2.5 flex flex-wrap gap-1.5">
                            {cand.reasons.map((r, ri) => (
                              <span
                                key={ri}
                                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                              >
                                ✓ {r}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Schedule Configuration for Selected Tutor */}
              {selectedCandidate && (
                <div className="bg-[#f8f9ff] p-4 rounded-xl border border-[#d5e3fc] space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#001847]">
                    Konfigurasi Jadwal Penugasan ke {selectedCandidate.tutor.fullName}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Tanggal Sesi</label>
                      <input
                        type="date"
                        value={proposalDate}
                        onChange={(e) => setProposalDate(e.target.value)}
                        className="w-full p-2 bg-white border border-[#e2e8f0] rounded-lg text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-semibold mb-1">Slot Waktu Bimbingan</label>
                      <input
                        type="text"
                        value={proposalSlot}
                        onChange={(e) => setProposalSlot(e.target.value)}
                        placeholder="Contoh: 19:30 - 21:00 WIB"
                        className="w-full p-2 bg-white border border-[#e2e8f0] rounded-lg text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 text-xs font-semibold mb-1">
                      Catatan Tambahan untuk Tutor (Opsional)
                    </label>
                    <input
                      type="text"
                      value={proposalNotes}
                      onChange={(e) => setProposalNotes(e.target.value)}
                      placeholder="Contoh: Fokus pada pembedahan Outer Model & Moderasi SmartPLS..."
                      className="w-full p-2 bg-white border border-[#e2e8f0] rounded-lg text-xs text-slate-800"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 px-6 border-t border-[#e2e8f0] rounded-b-2xl flex items-center justify-between">
              <button
                type="button"
                onClick={() => setMatchingModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={!selectedCandidate || submittingProposal}
                onClick={handleDispatchProposal}
                className="px-5 py-2.5 rounded-lg bg-[#001847] hover:bg-[#0b2c6b] text-white text-xs font-semibold shadow-md transition flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5 text-[#fdbc13]" />
                {submittingProposal ? "Mengirim Usulan..." : "Kirim Usulan Bimbingan ke WhatsApp Tutor"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
