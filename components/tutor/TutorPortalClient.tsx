"use client";

import { useState } from "react";
import Link from "next/link";
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
  Sparkles,
  ChevronRight,
  User,
  Award,
  DollarSign,
  Phone,
  Printer,
  X,
  Users,
  Check,
  FileEdit,
  Navigation,
  MessageCircle,
  ShieldCheck,
  Zap,
  FolderOpen,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { formatTime, formatDate } from "@/lib/date";
import type { TutorPortalData, TutorSessionItem } from "@/actions/tutor-portal";
import { submitTutorJournalQuick } from "@/actions/tutor-portal";
import { AttendanceStatus } from "@prisma/client";
import { useToast } from "@/components/ui/Toast";

export default function TutorPortalClient({
  initialData,
  currentTutorId,
}: {
  initialData: TutorPortalData;
  currentTutorId?: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"jadwal" | "jurnal" | "honor">("jadwal");

  // Journal Modal State
  const [selectedSessionForJournal, setSelectedSessionForJournal] =
    useState<TutorSessionItem | null>(null);
  const [isSubmittingJournal, setIsSubmittingJournal] = useState(false);

  // Form states
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [homework, setHomework] = useState("");
  const [attendances, setAttendances] = useState<
    Record<string, AttendanceStatus>
  >({});

  const {
    tutor,
    availableTutors = [],
    todaySessions = [],
    upcomingSessions = [],
    completedSessions = [],
    financialSummary,
  } = initialData;

  const handleSwitchTutor = (tutorId: string) => {
    router.push(`/tutor?tutorId=${tutorId}`);
  };

  const openJournalModal = (session: TutorSessionItem) => {
    setSelectedSessionForJournal(session);
    setTopic(session.journal?.topic || "");
    setNotes(session.journal?.notes || "");
    setHomework(session.journal?.homework || "");

    const initialAtt: Record<string, AttendanceStatus> = {};
    session.students.forEach((st) => {
      initialAtt[st.participantId] = st.attendance || AttendanceStatus.HADIR;
    });
    setAttendances(initialAtt);
  };

  const handleSaveJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionForJournal || !topic.trim()) {
      toast.warning(
        "Topik Wajib Diisi",
        "Mohon masukkan topik materi bimbingan yang diajarkan."
      );
      return;
    }

    setIsSubmittingJournal(true);
    const attList = Object.entries(attendances).map(([participantId, att]) => ({
      participantId,
      attendance: att,
    }));

    const res = await submitTutorJournalQuick({
      sessionId: selectedSessionForJournal.id,
      topic,
      notes,
      homework,
      attendances: attList,
    });
    setIsSubmittingJournal(false);

    if (res.success) {
      toast.success("Jurnal Tersimpan", res.message);
      setSelectedSessionForJournal(null);
      router.refresh();
    } else {
      toast.error("Gagal Menyimpan", res.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-[#1B2A41] font-sans pb-16">
      {/* Top Mobile-First Header */}
      <header className="bg-white border-b border-[#D5DDEB] sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#09408C] flex items-center justify-center text-white font-heading font-bold text-lg shadow-sm">
              SB
            </div>
            <div>
              <span className="font-heading font-bold text-base text-[#09408C] block leading-tight">
                Sahabat Belajar
              </span>
              <span className="text-[11px] text-[#5B6882] font-semibold block">
                Portal Mandiri Tutor (Pengajar)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tutor Switcher Dropdown */}
            <select
              value={tutor.id}
              onChange={(e) => handleSwitchTutor(e.target.value)}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-[#D5DDEB] bg-[#F4F7FB] text-[#09408C] focus:outline-none focus:border-[#09408C] max-w-[150px] sm:max-w-none truncate"
            >
              {availableTutors.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            <Link
              href="/dashboard/materi"
              className="text-xs text-[#09408C] bg-[#EAF1FA] hover:bg-[#D5DDEB] px-3 py-1.5 rounded-xl border border-[#9AC1E2] transition-colors flex items-center gap-1.5 font-semibold"
            >
              <FolderOpen size={13} />
              <span className="hidden sm:inline">Bank Modul</span>
            </Link>

            <Link
              href="/dashboard/ujian"
              className="text-xs text-[#09408C] bg-[#EAF1FA] hover:bg-[#D5DDEB] px-3 py-1.5 rounded-xl border border-[#9AC1E2] transition-colors flex items-center gap-1.5 font-semibold"
            >
              <Award size={13} />
              <span className="hidden sm:inline">Ruang Ujian</span>
            </Link>

            <Link
              href="/dashboard"
              className="text-xs text-[#5B6882] hover:text-[#09408C] px-3 py-1.5 rounded-xl border border-[#D5DDEB] hover:bg-slate-50 transition-colors hidden sm:inline"
            >
              Admin
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {/* Tutor Profile Banner */}
        <div className="bg-gradient-to-r from-[#09408C] via-[#0E3571] to-[#295897] rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs bg-white/20 text-white px-2.5 py-0.5 rounded-full font-semibold">
                  Tutor Sahabat Belajar
                </span>
                <span className="text-xs text-[#9AC1E2] font-semibold bg-white/10 px-2.5 py-0.5 rounded-full">
                  Tarif: Rp {tutor.ratePerSession.toLocaleString("id-ID")} / 90 Mnt (BR-7)
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white">
                {tutor.name}
              </h1>
              <p className="text-xs text-white/80">
                Spesialisasi: {tutor.expertise.join(", ")}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-2xl p-3.5 text-center min-w-[110px]">
                <div className="text-[11px] text-white/80 uppercase font-semibold">Sesi Selesai</div>
                <div className="text-2xl font-bold font-heading text-white">
                  {financialSummary.sessionsThisMonth}
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-2xl p-3.5 text-center min-w-[140px]">
                <div className="text-[11px] text-white/80 uppercase font-semibold">Honor Berjalan</div>
                <div className="text-lg font-bold font-heading text-[#9AC1E2]">
                  Rp {(financialSummary.totalHonorThisMonth / 1000).toFixed(0)}k
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Main Tabs (Mobile First) */}
        <div className="flex items-center gap-2 border-b border-[#D5DDEB] overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("jadwal")}
            className={`pb-3 px-3.5 text-sm font-heading font-semibold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === "jadwal"
                ? "border-[#09408C] text-[#09408C]"
                : "border-transparent text-[#5B6882] hover:text-[#1B2A41]"
            }`}
          >
            <Calendar size={16} />
            Jadwal Mengajar ({todaySessions.length + upcomingSessions.length})
          </button>

          <button
            onClick={() => setActiveTab("jurnal")}
            className={`pb-3 px-3.5 text-sm font-heading font-semibold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === "jurnal"
                ? "border-[#09408C] text-[#09408C]"
                : "border-transparent text-[#5B6882] hover:text-[#1B2A41]"
            }`}
          >
            <BookOpen size={16} />
            Jurnal Pertemuan ({completedSessions.length})
          </button>

          <button
            onClick={() => setActiveTab("honor")}
            className={`pb-3 px-3.5 text-sm font-heading font-semibold transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === "honor"
                ? "border-[#09408C] text-[#09408C]"
                : "border-transparent text-[#5B6882] hover:text-[#1B2A41]"
            }`}
          >
            <DollarSign size={16} />
            Rekap Honor Mandiri (BR-6 & 7)
          </button>
        </div>

        {/* ================= TAB 1: JADWAL MENGAJAR HARI INI & MENDATANG ================= */}
        {activeTab === "jadwal" && (
          <div className="space-y-6">
            {/* Sesi Hari Ini */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-base text-[#09408C] flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1F6F4A] animate-pulse"></span>
                  Sesi Bimbingan Hari Ini ({todaySessions.length})
                </h3>
                <span className="text-xs font-semibold text-[#5B6882]">
                  Durasi Standar 90 Menit (BR-5)
                </span>
              </div>

              {todaySessions.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#D5DDEB] p-8 text-center text-[#5B6882]">
                  <Calendar size={32} className="mx-auto text-[#9AC1E2] mb-2" />
                  <p className="text-sm font-semibold text-[#1B2A41]">
                    Tidak ada jadwal mengajar untuk hari ini.
                  </p>
                  <p className="text-xs mt-1">
                    Silakan periksa sesi bimbingan pada hari berikutnya.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todaySessions.map((session) => {
                    const startTime = formatTime(session.startAt);
                    const endTime = formatTime(session.endAt);
                    const isDone = session.status === "TERLAKSANA";

                    return (
                      <div
                        key={session.id}
                        className="bg-white rounded-3xl border border-[#D5DDEB] p-5 shadow-xs hover:border-[#09408C] transition-all space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D5DDEB] pb-3">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-xl bg-[#EAF1FA] text-[#09408C] font-bold text-xs">
                              {startTime} - {endTime} WIB (90 Mnt)
                            </span>
                            <span className="text-xs font-bold text-[#09408C]">
                              {session.programName}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F4F7FB] text-[#5B6882]">
                              {session.classType === "PRIVAT" ? "Privat (1 Siswa)" : "Semi-Privat"}
                            </span>
                            <span
                              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                                isDone
                                  ? "bg-[#E3F4EC] text-[#1F6F4A]"
                                  : "bg-blue-50 text-blue-700"
                              }`}
                            >
                              {isDone ? "Selesai (Terlaksana)" : "Akan Datang"}
                            </span>
                          </div>
                        </div>

                        {/* Student and Location Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="bg-[#F4F7FB] p-3 rounded-2xl border border-[#D5DDEB] space-y-1">
                            <span className="text-[#5B6882] block">Peserta Didik:</span>
                            <div className="font-bold text-[#1B2A41] text-sm">
                              {session.students.map((st) => st.name).join(", ")}
                            </div>
                            {session.students[0]?.phone && (
                              <a
                                href={`https://wa.me/${session.students[0].phone.replace(/[^0-9]/g, "")}?text=Halo%20${encodeURIComponent(session.students[0].name)}%2C%20saya%20${encodeURIComponent(tutor.name)}%20dari%20Sahabat%20Belajar%20...`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-[#1F6F4A] font-semibold hover:underline mt-1"
                              >
                                <Phone size={12} />
                                <span>Hubungi Siswa / Wali ({session.students[0].phone})</span>
                              </a>
                            )}
                          </div>

                          <div className="bg-[#F4F7FB] p-3 rounded-2xl border border-[#D5DDEB] space-y-1">
                            <span className="text-[#5B6882] block">Metode Belajar:</span>
                            {session.mode === "ONLINE" ? (
                              <div>
                                <div className="font-bold text-[#09408C] flex items-center gap-1 text-sm">
                                  <Video size={14} className="text-[#0CC0DF]" />
                                  <span>Online (Zoom / Meet)</span>
                                </div>
                                <span className="text-[11px] text-[#5B6882] block mt-0.5">
                                  Buka tautan ruang belajar 5 menit sebelum sesi dimulai.
                                </span>
                              </div>
                            ) : (
                              <div>
                                <div className="font-bold text-[#B45309] flex items-center gap-1 text-sm">
                                  <MapPin size={14} className="text-[#F5B82E]" />
                                  <span>Home Visit (Tatap Muka)</span>
                                </div>
                                <span className="text-[11px] text-[#1B2A41] block mt-0.5">
                                  {session.address || "Alamat rumah siswa"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                          {session.mode === "ONLINE" && session.meetingLink && (
                            <a
                              href={session.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#0CC0DF]/15 hover:bg-[#0CC0DF]/25 text-[#09408C] text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                            >
                              <Video size={14} />
                              <span>Masuk Ruang Belajar (Zoom/Meet)</span>
                              <ExternalLink size={12} />
                            </a>
                          )}

                          {session.mode === "HOME_VISIT" && session.address && (
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(session.address)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#FEF7E6] hover:bg-amber-100 text-[#B45309] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-[#F5B82E]/40"
                            >
                              <Navigation size={14} />
                              <span>Petunjuk Arah Google Maps</span>
                            </a>
                          )}

                          <button
                            onClick={() => openJournalModal(session)}
                            className="w-full sm:w-auto ml-auto px-5 py-2.5 rounded-xl bg-[#09408C] hover:bg-[#0E3571] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <FileEdit size={14} />
                            <span>
                              {isDone ? "Perbarui Absensi & Jurnal" : "Isi Absensi & Jurnal 90 Menit"}
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sesi Mendatang */}
            {upcomingSessions.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-[#D5DDEB]">
                <h3 className="font-heading font-bold text-base text-[#1B2A41]">
                  Jadwal Sesi Mendatang ({upcomingSessions.length})
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {upcomingSessions.map((session) => (
                    <div
                      key={session.id}
                      className="bg-white p-4 rounded-2xl border border-[#D5DDEB] space-y-2 text-xs shadow-2xs"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#09408C]">
                          {formatDate(session.startAt)}
                        </span>
                        <span className="text-[#5B6882]">
                          {formatTime(session.startAt)} - {formatTime(session.endAt)} WIB
                        </span>
                      </div>
                      <div className="font-bold text-sm text-[#1B2A41]">
                        {session.students.map((st) => st.name).join(", ")}
                      </div>
                      <div className="text-[#5B6882]">
                        {session.programName} ({session.mode === "ONLINE" ? "Online" : "Home Visit"})
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: RIWAYAT JURNAL MENGAJAR ================= */}
        {activeTab === "jurnal" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-base text-[#09408C]">
                  Riwayat Jurnal Mengajar & Catatan Pemahaman Siswa
                </h3>
                <p className="text-xs text-[#5B6882] mt-0.5">
                  Arsip materi pembelajaran yang telah dibahas dan tugas evaluasi siswa.
                </p>
              </div>
            </div>

            {completedSessions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#D5DDEB] p-8 text-center text-[#5B6882]">
                <BookOpen size={32} className="mx-auto text-[#9AC1E2] mb-2" />
                <p className="text-sm font-semibold text-[#1B2A41]">
                  Belum ada jurnal sesi yang tercatat.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {completedSessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="bg-white rounded-3xl border border-[#D5DDEB] p-5 shadow-xs space-y-3 text-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D5DDEB] pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1F6F4A]"></span>
                        <strong className="text-sm text-[#1B2A41]">{formatDate(sess.startAt)}</strong>
                        <span className="text-[#5B6882]">
                          ({formatTime(sess.startAt)} - {formatTime(sess.endAt)} WIB)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#EAF1FA] text-[#09408C] font-semibold">
                          {sess.programName}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#E3F4EC] text-[#1F6F4A] font-bold">
                          Terlaksana (Kuota -1)
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div>
                        <span className="text-[#5B6882] block text-[11px]">Siswa Bimbingan:</span>
                        <strong className="text-[#1B2A41] text-sm">
                          {sess.students.map((st) => st.name).join(", ")}
                        </strong>
                      </div>

                      {sess.journal && (
                        <div className="space-y-2 pt-2">
                          <div className="bg-[#F4F7FB] p-3 rounded-2xl border border-[#D5DDEB]">
                            <span className="text-[#09408C] font-bold block mb-0.5">
                              Topik Materi yang Dibahas:
                            </span>
                            <p className="text-[#1B2A41] font-medium leading-relaxed">
                              {sess.journal.topic}
                            </p>
                          </div>

                          {sess.journal.notes && (
                            <div className="bg-[#FEF7E6] p-3 rounded-2xl border border-[#F5B82E]/30">
                              <span className="text-[#B45309] font-bold block mb-0.5">
                                Catatan Pemahaman Siswa:
                              </span>
                              <p className="text-[#1B2A41] leading-relaxed">
                                {sess.journal.notes}
                              </p>
                            </div>
                          )}

                          {sess.journal.homework && (
                            <div className="bg-[#E3F4EC] p-3 rounded-2xl border border-[#1F6F4A]/30">
                              <span className="text-[#1F6F4A] font-bold block mb-0.5">
                                Tugas / Latihan Mandiri:
                              </span>
                              <p className="text-[#1B2A41] leading-relaxed">
                                {sess.journal.homework}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: REKAP HONOR MANDIRI (BR-6 & BR-7) ================= */}
        {activeTab === "honor" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-[#D5DDEB] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF1FA] text-[#09408C] text-xs font-bold border border-[#9AC1E2] mb-1.5">
                    <ShieldCheck size={14} />
                    <span>Transparan & Sesuai Sesi Terlaksana (BR-6 & BR-7)</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#09408C] font-heading">
                    Rekapitulasi Honorarium Mengajar
                  </h3>
                  <p className="text-xs text-[#5B6882]">
                    Data honor tutor diproteksi secara privat dan dihitung dari akumulasi sesi terlaksana dikalikan tarif per sesi.
                  </p>
                </div>
              </div>

              {/* Financial KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-[#F4F7FB] p-4 rounded-2xl border border-[#D5DDEB]">
                  <div className="text-[11px] text-[#5B6882] font-semibold">Tarif Honor Anda (BR-7)</div>
                  <div className="text-xl font-black text-[#09408C] font-heading mt-1">
                    Rp {financialSummary.ratePerSession.toLocaleString("id-ID")}
                  </div>
                  <div className="text-[10px] text-[#5B6882] mt-0.5">Per sesi bimbingan (90 menit)</div>
                </div>

                <div className="bg-[#F4F7FB] p-4 rounded-2xl border border-[#D5DDEB]">
                  <div className="text-[11px] text-[#5B6882] font-semibold">Sesi Terlaksana Bulan Ini</div>
                  <div className="text-xl font-black text-[#1B2A41] font-heading mt-1">
                    {financialSummary.sessionsThisMonth} Sesi
                  </div>
                  <div className="text-[10px] text-[#5B6882] mt-0.5">
                    Total {financialSummary.sessionsThisMonth * 1.5} jam mengajar
                  </div>
                </div>

                <div className="bg-[#E3F4EC] p-4 rounded-2xl border border-[#1F6F4A]/30">
                  <div className="text-[11px] text-[#1F6F4A] font-semibold">Total Honor Berjalan</div>
                  <div className="text-xl font-black text-[#1F6F4A] font-heading mt-1">
                    Rp {financialSummary.totalHonorThisMonth.toLocaleString("id-ID")}
                  </div>
                  <div className="text-[10px] text-[#1F6F4A] mt-0.5">Status: Siap Dicairkan Akhir Bulan</div>
                </div>
              </div>
            </div>

            {/* List of Billable Sessions */}
            <div className="bg-white rounded-3xl border border-[#D5DDEB] p-6 shadow-xs space-y-4">
              <h4 className="font-heading font-bold text-base text-[#1B2A41]">
                Rincian Sesi yang Telah Dihonorariumkan
              </h4>

              <div className="space-y-3">
                {completedSessions.map((sess, idx) => (
                  <div
                    key={sess.id}
                    className="p-3.5 rounded-2xl bg-[#F4F7FB] border border-[#D5DDEB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#09408C]">Sesi #{idx + 1}</span>
                        <span className="text-[#5B6882]">• {formatDate(sess.startAt)}</span>
                        <span className="text-[10px] bg-[#E3F4EC] text-[#1F6F4A] px-2 py-0.5 rounded-full font-bold">
                          Valid
                        </span>
                      </div>
                      <div className="font-bold text-sm text-[#1B2A41] mt-0.5">
                        {sess.students.map((st) => st.name).join(", ")}
                      </div>
                      <div className="text-[11px] text-[#5B6882]">
                        Program: {sess.programName} ({sess.mode === "ONLINE" ? "Online" : "Home Visit"})
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-[#5B6882]">Honor Diterima</div>
                      <div className="text-base font-extrabold text-[#09408C] font-heading">
                        Rp {financialSummary.ratePerSession.toLocaleString("id-ID")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal: Formulir Cepat Absensi & Jurnal Pertemuan (Mobile First - BR-1) */}
        {selectedSessionForJournal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#D5DDEB] space-y-5 relative max-h-[90vh] overflow-y-auto no-scrollbar">
              <button
                onClick={() => setSelectedSessionForJournal(null)}
                aria-label="Tutup dialog jurnal"
                className="absolute top-5 right-5 p-1.5 rounded-full text-[#5B6882] hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>

              <div>
                <span className="text-[10px] font-bold text-[#09408C] uppercase tracking-wider bg-[#EAF1FA] px-2.5 py-0.5 rounded-full">
                  Formulir Cepat Absensi & Jurnal (90 Mnt)
                </span>
                <h3 className="text-lg font-heading font-bold text-[#1B2A41] mt-1.5">
                  Laporan Hasil Sesi Bimbingan
                </h3>
                <p className="text-xs text-[#5B6882]">
                  Siswa: {selectedSessionForJournal.students.map((st) => st.name).join(", ")} |{" "}
                  {selectedSessionForJournal.programName}
                </p>
              </div>

              <form onSubmit={handleSaveJournal} className="space-y-4 text-xs">
                {/* 1. Presensi Kehadiran Peserta Didik */}
                <div className="space-y-2 bg-[#F4F7FB] p-3.5 rounded-2xl border border-[#D5DDEB]">
                  <span className="font-bold text-[#1B2A41] block">
                    Presensi Kehadiran Siswa (BR-1: Hadir memotong 1 kuota):
                  </span>
                  {selectedSessionForJournal.students.map((st) => (
                    <div
                      key={st.participantId}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-xl bg-white border border-[#D5DDEB]"
                    >
                      <span className="font-semibold text-sm text-[#1B2A41]">{st.name}</span>
                      <div className="flex items-center gap-1">
                        {(["HADIR", "IZIN", "SAKIT", "ALPA"] as AttendanceStatus[]).map((att) => (
                          <button
                            type="button"
                            key={att}
                            onClick={() =>
                              setAttendances((prev) => ({
                                ...prev,
                                [st.participantId]: att,
                              }))
                            }
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                              attendances[st.participantId] === att
                                ? att === "HADIR"
                                  ? "bg-[#1F6F4A] text-white"
                                  : "bg-[#B45309] text-white"
                                : "bg-[#F4F7FB] text-[#5B6882] hover:bg-slate-200"
                            }`}
                          >
                            {att}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 2. Topik Materi yang Diajarkan */}
                <div>
                  <label htmlFor="tutor-journal-topic" className="block font-semibold text-[#1B2A41] mb-1">
                    Topik Materi yang Dibahas <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="tutor-journal-topic"
                    type="text"
                    required
                    placeholder="Contoh: Trik Cepat Silogisme & Penalaran Logis Bab 4"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5DDEB] text-xs bg-[#F4F7FB] focus:outline-none focus:border-[#09408C]"
                  />
                </div>

                {/* 3. Catatan Pemahaman Siswa */}
                <div>
                  <label htmlFor="tutor-journal-notes" className="block font-semibold text-[#1B2A41] mb-1">
                    Catatan Pemahaman & Evaluasi Siswa (Terbaca di Portal Siswa/Ortu)
                  </label>
                  <textarea
                    id="tutor-journal-notes"
                    rows={2}
                    placeholder="Contoh: Siswa memahami konsep dasar silogisme dengan baik. Tingkatkan ketelitian pada penarikan kesimpulan negatif."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5DDEB] text-xs bg-[#F4F7FB] focus:outline-none focus:border-[#09408C]"
                  />
                </div>

                {/* 4. Tugas / PR Siswa */}
                <div>
                  <label htmlFor="tutor-journal-homework" className="block font-semibold text-[#1B2A41] mb-1">
                    Tugas / Latihan Mandiri (Opsional)
                  </label>
                  <input
                    id="tutor-journal-homework"
                    type="text"
                    placeholder="Contoh: Kerjakan 10 butir soal latihan mandiri di modul halaman 35"
                    value={homework}
                    onChange={(e) => setHomework(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5DDEB] text-xs bg-[#F4F7FB] focus:outline-none focus:border-[#09408C]"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#D5DDEB] sticky bottom-0 bg-white">
                  <button
                    type="button"
                    onClick={() => setSelectedSessionForJournal(null)}
                    className="px-4 py-2.5 rounded-xl border border-[#D5DDEB] text-xs font-semibold text-[#5B6882] hover:bg-slate-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingJournal}
                    className="px-5 py-2.5 rounded-xl bg-[#09408C] hover:bg-[#0E3571] text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 size={15} />
                    <span>
                      {isSubmittingJournal
                        ? "Menyimpan & Memotong Kuota..."
                        : "Tandai Selesai & Potong Kuota (BR-1)"}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
