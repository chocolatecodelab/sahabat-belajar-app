"use client";

import { useState, useTransition } from "react";
import {
  Calendar,
  Clock,
  Plus,
  Video,
  Home,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Users,
  BookOpen,
  FileText,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  Filter,
  Check,
  X,
  ExternalLink,
  MapPin,
  CalendarDays,
  UserCheck,
  RefreshCw,
  Search,
} from "lucide-react";
import {
  createSession,
  updateSessionStatus,
  saveSessionJournal,
} from "@/actions/penjadwalan";
import {
  DAYS_OF_WEEK,
  TIME_SLOTS,
  TimeSlotKey,
  TutorAvailabilityGrid,
  TutorRecommendation,
  RecurrenceSimulationItem,
} from "@/types/scheduling";
import {
  calculateSmartTutorRecommendations,
  simulateRecurringSessions,
  toggleTutorAvailabilitySlot,
} from "@/actions/smart-scheduling";
import { SessionStatus, AttendanceStatus } from "@prisma/client";
import { formatDayDate, formatDate, formatTime } from "@/lib/date";

export default function ScheduleManagerClient({
  initialSessions,
  tutors,
  students,
  programs,
  initialAvailability,
}: {
  initialSessions: any[];
  tutors: any[];
  students: any[];
  programs: any[];
  initialAvailability: TutorAvailabilityGrid;
}) {
  const [activeTab, setActiveTab] = useState<"agenda" | "matriks" | "smart-match">("agenda");
  const [sessions, setSessions] = useState(initialSessions);
  const [availability, setAvailability] = useState<TutorAvailabilityGrid>(initialAvailability);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Search & Filters in Agenda
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Matriks filter
  const [matrixTutorFilter, setMatrixTutorFilter] = useState<string>("ALL");

  // Form states for Create Session
  const [tutorId, setTutorId] = useState(tutors[0]?.id || "");
  const [programId, setProgramId] = useState(programs[0]?.id || "");
  const [classType, setClassType] = useState<"PRIVAT" | "SEMI_PRIVAT">("PRIVAT");
  const [mode, setMode] = useState<"ONLINE" | "HOME_VISIT">("ONLINE");
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("16:00");
  const [endTime, setEndTime] = useState("17:30"); // 90 min default (BR-5)
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [meetingLink, setMeetingLink] = useState("");
  const [address, setAddress] = useState("");
  const [recurrenceWeeks, setRecurrenceWeeks] = useState(1);
  const [simulatedRecurrences, setSimulatedRecurrences] = useState<RecurrenceSimulationItem[]>([]);

  // Smart Match Engine State
  const [matchProgramId, setMatchProgramId] = useState(programs[0]?.id || "");
  const [matchStudentId, setMatchStudentId] = useState(students[0]?.id || "");
  const [matchDate, setMatchDate] = useState(new Date().toISOString().split("T")[0]);
  const [matchStartTime, setMatchStartTime] = useState("16:00");
  const [matchEndTime, setMatchEndTime] = useState("17:30");
  const [matchMode, setMatchMode] = useState<"ONLINE" | "HOME_VISIT">("ONLINE");
  const [recommendations, setRecommendations] = useState<TutorRecommendation[]>([]);
  const [isCalculatingMatch, setIsCalculatingMatch] = useState(false);
  const [matchCalculated, setMatchCalculated] = useState(false);

  // Journal form states
  const [journalTopic, setJournalTopic] = useState("");
  const [journalNotes, setJournalNotes] = useState("");
  const [journalHomework, setJournalHomework] = useState("");
  const [participantAttendances, setParticipantAttendances] = useState<
    Array<{ participantId: string; attendance: AttendanceStatus }>
  >([]);

  // 90-minute helper
  const handleSet90Min = (start: string, setter: (val: string) => void) => {
    const [h, m] = start.split(":").map(Number);
    const date = new Date();
    date.setHours(h, m + 90, 0, 0);
    const newH = String(date.getHours()).padStart(2, "0");
    const newM = String(date.getMinutes()).padStart(2, "0");
    setter(`${newH}:${newM}`);
  };

  const handleStudentToggle = (id: string) => {
    if (classType === "PRIVAT") {
      setSelectedStudentIds([id]);
    } else {
      if (selectedStudentIds.includes(id)) {
        setSelectedStudentIds((prev) => prev.filter((s) => s !== id));
      } else {
        if (selectedStudentIds.length >= 5) {
          alert("Kelas semi-privat maksimal 5 peserta (BR-3).");
          return;
        }
        setSelectedStudentIds((prev) => [...prev, id]);
      }
    }
  };

  // Recurrence Simulation update
  const handleRecurrenceChange = async (weeks: number) => {
    setRecurrenceWeeks(weeks);
    if (weeks > 1 && tutorId) {
      const items = await simulateRecurringSessions({
        tutorId,
        studentIds: selectedStudentIds,
        startDateStr: sessionDate,
        startTime,
        endTime,
        weeksCount: weeks,
      });
      setSimulatedRecurrences(items);
    } else {
      setSimulatedRecurrences([]);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError(null);

    if (selectedStudentIds.length === 0) {
      alert("Pilih minimal 1 siswa.");
      return;
    }

    const startAt = new Date(`${sessionDate}T${startTime}:00`);
    const endAt = new Date(`${sessionDate}T${endTime}:00`);

    setIsSubmitting(true);
    const res = await createSession({
      tutorId,
      programId,
      classType,
      mode,
      startAt,
      endAt,
      studentIds: selectedStudentIds,
      meetingLink: mode === "ONLINE" ? meetingLink : undefined,
      address: mode === "HOME_VISIT" ? address : undefined,
      recurrenceWeeks: recurrenceWeeks > 1 ? recurrenceWeeks : undefined,
    });
    setIsSubmitting(false);

    if (res.success) {
      alert(res.message);
      setShowCreateModal(false);
      window.location.reload();
    } else {
      setConflictError(res.message || "Gagal membuat sesi.");
    }
  };

  const handleMarkCompleted = async (session: any) => {
    const confirm = window.confirm(
      `Tandai sesi ini Terlaksana? Kuota bimbingan masing-masing siswa yang hadir akan terpotong tepat 1 (BR-1).`
    );
    if (!confirm) return;

    setIsSubmitting(true);
    const res = await updateSessionStatus(session.id, SessionStatus.TERLAKSANA);
    setIsSubmitting(false);

    if (res.success) {
      alert(res.message);
      window.location.reload();
    } else {
      alert(res.message);
    }
  };

  const openJournalModal = (session: any) => {
    setSelectedSession(session);
    setJournalTopic(session.journal?.topic || "");
    setJournalNotes(session.journal?.notes || "");
    setJournalHomework(session.journal?.homework || "");
    setParticipantAttendances(
      session.participants.map((p: any) => ({
        participantId: p.id,
        attendance: p.attendance,
      }))
    );
  };

  const handleSaveJournal = async () => {
    if (!selectedSession || !journalTopic.trim()) {
      alert("Topik materi wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    const res = await saveSessionJournal(selectedSession.id, {
      topic: journalTopic,
      notes: journalNotes,
      homework: journalHomework,
      attendances: participantAttendances,
    });
    setIsSubmitting(false);

    if (res.success) {
      alert(res.message);
      setSelectedSession(null);
      window.location.reload();
    } else {
      alert(res.message);
    }
  };

  // Run Smart Match Calculation
  const runSmartMatch = async () => {
    setIsCalculatingMatch(true);
    const selProg = programs.find((p) => p.id === matchProgramId);

    const recs = await calculateSmartTutorRecommendations({
      programName: selProg?.name,
      programCategory: selProg?.category,
      studentId: matchStudentId,
      dateStr: matchDate,
      startTime: matchStartTime,
      endTime: matchEndTime,
      mode: matchMode,
    });

    setRecommendations(recs);
    setIsCalculatingMatch(false);
    setMatchCalculated(true);
  };

  // Select Tutor from Smart Match and open create modal
  const handleSelectRecommendedTutor = (rec: TutorRecommendation) => {
    setTutorId(rec.tutorId);
    setProgramId(matchProgramId);
    setSessionDate(matchDate);
    setStartTime(matchStartTime);
    setEndTime(matchEndTime);
    setMode(matchMode);
    if (matchStudentId) {
      setSelectedStudentIds([matchStudentId]);
    }
    setConflictError(null);
    setShowCreateModal(true);
  };

  // Toggle Matrix Slot
  const handleToggleSlot = async (
    tId: string,
    dayIndex: number,
    slotKey: TimeSlotKey,
    currentVal: boolean
  ) => {
    const newVal = !currentVal;
    // Optimistic state update
    setAvailability((prev) => ({
      ...prev,
      [tId]: {
        ...(prev[tId] || {}),
        [dayIndex]: {
          ...((prev[tId] || {})[dayIndex] || { pagi: false, siang: false, sore: false, malam: false }),
          [slotKey]: newVal,
        },
      },
    }));

    startTransition(async () => {
      await toggleTutorAvailabilitySlot(tId, dayIndex, slotKey, newVal);
    });
  };

  // Filter sessions
  const filteredSessions = sessions.filter((s) => {
    if (statusFilter !== "ALL" && s.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const tutorMatch = s.tutor?.name?.toLowerCase().includes(q);
      const studentMatch = (s.participants || []).some((p: any) =>
        p.student?.name?.toLowerCase().includes(q)
      );
      const programMatch = s.program?.name?.toLowerCase().includes(q);
      if (!tutorMatch && !studentMatch && !programMatch) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#D5DDEB] shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#EAF1FA] text-[#09408C] text-xs font-semibold mb-2">
            <Sparkles size={13} className="text-[#0CC0DF]" />
            <span>Asisten Cerdas Sahabat Belajar (PRD C2/C3)</span>
          </div>
          <h1 className="text-2xl font-bold text-[#09408C] font-display">
            Jadwal Sesi & Ketersediaan Tutor
          </h1>
          <p className="text-xs text-[#5B6882] mt-0.5">
            Manajemen agenda bimbingan, pencocokan otomatis tutor berbasis keahlian & waktu luang, serta matriks ketersediaan mingguan.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setActiveTab("smart-match");
              runSmartMatch();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#9AC1E2] bg-[#EAF1FA] text-[#09408C] text-xs font-bold hover:bg-[#d8e7f8] transition-colors"
          >
            <Sparkles size={14} className="text-[#09408C]" />
            <span>Cari Tutor Cerdas</span>
          </button>

          <button
            onClick={() => {
              setConflictError(null);
              setShowCreateModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#09408C] text-white text-xs font-bold hover:bg-[#0E3571] transition-colors shadow-2xs"
          >
            <Plus size={14} />
            <span>+ Jadwalkan Sesi</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#D5DDEB] pb-2">
        <button
          onClick={() => setActiveTab("agenda")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "agenda"
              ? "bg-[#09408C] text-white shadow-xs"
              : "text-[#5B6882] hover:text-[#09408C] hover:bg-[#EAF1FA]"
          }`}
        >
          <Calendar size={15} />
          <span>Agenda Sesi & Kehadiran</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === "agenda"
                ? "bg-white/20 text-white"
                : "bg-[#EAF1FA] text-[#09408C]"
            }`}
          >
            {sessions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("matriks")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "matriks"
              ? "bg-[#09408C] text-white shadow-xs"
              : "text-[#5B6882] hover:text-[#09408C] hover:bg-[#EAF1FA]"
          }`}
        >
          <Clock size={15} />
          <span>Matriks Ketersediaan Tutor</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("smart-match");
            if (!matchCalculated) runSmartMatch();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "smart-match"
              ? "bg-[#09408C] text-white shadow-xs"
              : "text-[#5B6882] hover:text-[#09408C] hover:bg-[#EAF1FA]"
          }`}
        >
          <Sparkles size={15} className="text-[#0CC0DF]" />
          <span>Auto-Match Tutor (Cerdas)</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: AGENDA SESI & KEHADIRAN                                 */}
      {/* ============================================================== */}
      {activeTab === "agenda" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#D5DDEB]">
            <div className="relative w-full sm:w-72">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5B6882]"
              />
              <input
                type="text"
                placeholder="Cari tutor, siswa, program..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-[#5B6882] shrink-0">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs py-1.5 px-3 rounded-xl border border-[#D5DDEB] bg-white text-[#1B2A41] focus-ring"
              >
                <option value="ALL">Semua Status</option>
                <option value="TERJADWAL">Terjadwal</option>
                <option value="TERLAKSANA">Terlaksana (Selesai)</option>
                <option value="DIBATALKAN">Dibatalkan</option>
              </select>
            </div>
          </div>

          {/* Sesi List */}
          <div className="space-y-3">
            {filteredSessions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#D5DDEB] p-12 text-center text-sm text-[#5B6882]">
                Tidak ada sesi bimbingan yang cocok dengan filter.
              </div>
            ) : (
              filteredSessions.map((session) => {
                const dateStr = formatDayDate(session.startAt);
                const timeStr = `${formatTime(session.startAt)} - ${formatTime(session.endAt)} WIB`;
                const isDone = session.status === "TERLAKSANA";

                return (
                  <div
                    key={session.id}
                    className="bg-white rounded-2xl border border-[#D5DDEB] p-5 shadow-2xs hover:border-[#9AC1E2] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="px-3 py-2 rounded-xl bg-[#EAF1FA] text-[#09408C] text-center min-w-[90px] shrink-0 border border-[#9AC1E2]/40">
                        <div className="text-xs font-bold tabular-nums">
                          {formatDate(session.startAt)}
                        </div>
                        <div className="text-[10px] text-[#5B6882] font-semibold mt-0.5">
                          {formatTime(session.startAt)} WIB
                        </div>
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-sm sm:text-base text-[#1B2A41]">
                            {session.participants.map((p: any) => p.student.name).join(", ")}
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#F4F7FB] text-[#09408C]">
                            {session.program.name}
                          </span>
                          <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-[#EAF1FA] text-[#295897]">
                            {session.classType === "SEMI_PRIVAT"
                              ? `Semi-Privat (${session.participants.length} Siswa)`
                              : "Privat 1-on-1"}
                          </span>
                        </div>

                        <div className="text-xs text-[#5B6882] mt-1.5 flex flex-wrap items-center gap-2">
                          <span>
                            Tutor: <strong>{session.tutor.name}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            {dateStr} ({timeStr})
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 font-medium">
                            {session.mode === "ONLINE" ? (
                              <>
                                <Video size={12} className="text-[#0CC0DF]" />
                                Online Zoom/Meet
                              </>
                            ) : (
                              <>
                                <Home size={12} className="text-[#F5B82E]" />
                                Home Visit: {session.address || "Alamat siswa"}
                              </>
                            )}
                          </span>
                        </div>

                        {session.journal && (
                          <div className="mt-2 text-xs text-[#09408C] bg-[#EAF1FA] px-2.5 py-1 rounded-lg inline-block border border-[#9AC1E2]/40">
                            Materi: <strong>{session.journal.topic}</strong>
                            {session.journal.homework && (
                              <span className="ml-2 text-[#5B6882]">
                                (Tugas: {session.journal.homework})
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          isDone
                            ? "bg-[#E3F4EC] text-[#1F6F4A] border border-[#A3E635]"
                            : session.status === "DIBATALKAN"
                            ? "bg-[#F1F5F9] text-[#5B6882] line-through"
                            : "bg-[#EAF1FA] text-[#09408C] border border-[#9AC1E2]"
                        }`}
                      >
                        {session.status}
                      </span>

                      <button
                        onClick={() => openJournalModal(session)}
                        className="px-3 py-1.5 rounded-xl border border-[#D5DDEB] text-xs font-semibold text-[#09408C] hover:bg-[#EAF1FA] transition-colors"
                      >
                        Isi Jurnal & Absensi
                      </button>

                      {!isDone && session.status !== "DIBATALKAN" && (
                        <button
                          onClick={() => handleMarkCompleted(session)}
                          disabled={isSubmitting}
                          className="px-3 py-1.5 rounded-xl bg-[#1F6F4A] text-white text-xs font-semibold hover:bg-[#165538] transition-colors shadow-2xs"
                        >
                          Tandai Selesai (BR-1 Potong Kuota)
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: MATRIKS KETERSEDIAAN TUTOR (WEEKLY AVAILABILITY GRID)  */}
      {/* ============================================================== */}
      {activeTab === "matriks" && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-[#D5DDEB] shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-[#09408C] font-display">
                  Matriks Jadwal Luang Mingguan Tutor
                </h3>
                <p className="text-xs text-[#5B6882]">
                  Klik pada kotak slot waktu untuk mengaktifkan atau menonaktifkan jam ketersediaan mengajar tutor.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#5B6882]">Pilih Tutor:</span>
                <select
                  value={matrixTutorFilter}
                  onChange={(e) => setMatrixTutorFilter(e.target.value)}
                  className="text-xs p-2 rounded-xl border border-[#D5DDEB] bg-white text-[#1B2A41] focus-ring"
                >
                  <option value="ALL">Semua Tutor ({tutors.length})</option>
                  {tutors.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Grid per Tutor */}
            {tutors
              .filter((t) => matrixTutorFilter === "ALL" || t.id === matrixTutorFilter)
              .map((tutor) => {
                const tutorAvail = availability[tutor.id] || {};

                return (
                  <div
                    key={tutor.id}
                    className="border border-[#D5DDEB] rounded-2xl p-4 bg-[#F4F7FB]/40 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#09408C] text-white flex items-center justify-center font-bold text-xs">
                          {tutor.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#1B2A41]">{tutor.name}</h4>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            {(tutor.expertise || []).map((exp: string, idx: number) => (
                              <span
                                key={idx}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-[#EAF1FA] text-[#09408C] font-medium"
                              >
                                {exp}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-[#5B6882] hidden sm:block">
                        WhatsApp: <span className="font-semibold text-[#1B2A41]">{tutor.phone}</span>
                      </div>
                    </div>

                    {/* Weekly Schedule Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-center border-collapse">
                        <thead>
                          <tr className="border-b border-[#D5DDEB] bg-white">
                            <th className="py-2.5 px-3 text-left font-bold text-[#5B6882] text-[11px] w-28">
                              Slot Waktu
                            </th>
                            {DAYS_OF_WEEK.map((d) => (
                              <th
                                key={d.index}
                                className="py-2.5 px-2 font-bold text-[#09408C] text-[11px]"
                              >
                                {d.name}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#D5DDEB] bg-white">
                          {TIME_SLOTS.map((slot) => (
                            <tr key={slot.key} className="hover:bg-[#F4F7FB]/50">
                              <td className="py-2.5 px-3 text-left font-semibold text-[#1B2A41]">
                                <div>{slot.label}</div>
                                <div className="text-[10px] text-[#5B6882]">
                                  {slot.startHour} - {slot.endHour}
                                </div>
                              </td>

                              {DAYS_OF_WEEK.map((day) => {
                                const isAvailable = Boolean(tutorAvail[day.index]?.[slot.key]);

                                return (
                                  <td key={day.index} className="py-2 px-1.5">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleToggleSlot(
                                          tutor.id,
                                          day.index,
                                          slot.key,
                                          isAvailable
                                        )
                                      }
                                      className={`w-full py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                                        isAvailable
                                          ? "bg-[#E3F4EC] text-[#1F6F4A] hover:bg-[#c9eedc] border border-[#A3E635]"
                                          : "bg-[#F4F7FB] text-[#5B6882] hover:bg-[#EAF1FA] border border-[#D5DDEB]"
                                      }`}
                                      title="Klik untuk ubah ketersediaan"
                                    >
                                      {isAvailable ? (
                                        <>
                                          <Check size={12} className="stroke-[3]" />
                                          <span>Luang</span>
                                        </>
                                      ) : (
                                        <>
                                          <X size={12} />
                                          <span>Libur</span>
                                        </>
                                      )}
                                    </button>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-[#D5DDEB] text-xs text-[#5B6882]">
              <span className="font-bold text-[#1B2A41]">Petunjuk:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#E3F4EC] border border-[#1F6F4A]"></span>
                <span>Luang (Siap Menerima Sesi Baru)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#F4F7FB] border border-[#D5DDEB]"></span>
                <span>Libur / Tidak Tersedia</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#09408C]"></span>
                <span>Terjadwal Sesi Bimbingan (BR-2 Terproteksi)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: SMART AUTO-MATCH TUTOR (PRD C2)                         */}
      {/* ============================================================== */}
      {activeTab === "smart-match" && (
        <div className="space-y-6">
          {/* Query Filter Box */}
          <div className="bg-white p-5 rounded-2xl border border-[#D5DDEB] shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#D5DDEB] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#09408C] font-display flex items-center gap-2">
                  <Sparkles size={16} className="text-[#0CC0DF]" />
                  <span>Mesin Pencari Tutor Cerdas (Auto-Match Engine)</span>
                </h3>
                <p className="text-xs text-[#5B6882]">
                  Sistem otomatis menganalisis kesesuaian kurikulum/keahlian, slot luang tutor, dan pencegahan bentrok jadwal (BR-2).
                </p>
              </div>

              <button
                onClick={runSmartMatch}
                disabled={isCalculatingMatch}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#09408C] text-white text-xs font-bold hover:bg-[#0E3571] transition-colors disabled:opacity-50 shadow-2xs"
              >
                <RefreshCw
                  size={13}
                  className={isCalculatingMatch ? "animate-spin" : ""}
                />
                <span>{isCalculatingMatch ? "Menganalisis..." : "Hitung Ulang Kecocokan"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                  1. Program Bimbingan
                </label>
                <select
                  value={matchProgramId}
                  onChange={(e) => setMatchProgramId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] bg-white focus-ring"
                >
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                  2. Siswa Peserta
                </label>
                <select
                  value={matchStudentId}
                  onChange={(e) => setMatchStudentId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] bg-white focus-ring"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.level})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                  3. Tanggal Bimbingan
                </label>
                <input
                  type="date"
                  value={matchDate}
                  onChange={(e) => setMatchDate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#1B2A41]">
                    4. Jam (Default 90 Mnt BR-5)
                  </label>
                  <button
                    type="button"
                    onClick={() => handleSet90Min(matchStartTime, setMatchEndTime)}
                    className="text-[10px] text-[#09408C] font-bold hover:underline"
                  >
                    +90 mnt
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="time"
                    value={matchStartTime}
                    onChange={(e) => setMatchStartTime(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-[#D5DDEB] focus-ring"
                  />
                  <input
                    type="time"
                    value={matchEndTime}
                    onChange={(e) => setMatchEndTime(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-[#D5DDEB] focus-ring"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations Results */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[#09408C] font-display flex items-center gap-2">
              <UserCheck size={16} />
              <span>Hasil Analisis Rekomendasi Tutor ({recommendations.length} Tutor Dianalisis)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendations.map((rec) => {
                const isTopMatch = rec.matchGrade === "SANGAT_COCOK";
                const isConflict = rec.matchGrade === "BENTROK";

                return (
                  <div
                    key={rec.tutorId}
                    className={`rounded-2xl border p-5 bg-white shadow-2xs flex flex-col justify-between transition-all ${
                      isTopMatch
                        ? "border-[#09408C] ring-2 ring-[#09408C]/10"
                        : isConflict
                        ? "border-[#B4381F]/40 bg-[#FBE9E5]/20 opacity-80"
                        : "border-[#D5DDEB]"
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top Match Badge */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                            isTopMatch
                              ? "bg-[#E3F4EC] text-[#1F6F4A] border border-[#A3E635]"
                              : isConflict
                              ? "bg-[#FBE9E5] text-[#B4381F]"
                              : "bg-[#EAF1FA] text-[#09408C]"
                          }`}
                        >
                          {isTopMatch && <Sparkles size={11} />}
                          {rec.statusText}
                        </span>

                        <div className="text-right">
                          <span className="text-base font-extrabold text-[#09408C] tabular-nums">
                            {rec.matchScore}%
                          </span>
                          <span className="text-[10px] text-[#5B6882] block">Match Score</span>
                        </div>
                      </div>

                      {/* Tutor Profile Header */}
                      <div>
                        <h4 className="text-sm font-bold text-[#1B2A41]">{rec.name}</h4>
                        <div className="text-xs text-[#5B6882] mt-0.5">
                          Tarif Sesi:{" "}
                          <strong className="text-[#09408C]">
                            Rp {rec.ratePerSession.toLocaleString("id-ID")}
                          </strong>{" "}
                          / 90 mnt
                        </div>
                      </div>

                      {/* Expertise Badges */}
                      <div className="flex flex-wrap gap-1">
                        {rec.expertise.map((exp, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-[#F4F7FB] text-[#1B2A41] border border-[#D5DDEB]"
                          >
                            {exp}
                          </span>
                        ))}
                      </div>

                      {/* Conflict details if any */}
                      {rec.hasConflict && rec.conflictDetails && (
                        <div className="p-2.5 rounded-xl bg-[#FBE9E5] text-[#B4381F] text-xs flex items-start gap-1.5 font-medium">
                          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                          <span>{rec.conflictDetails}</span>
                        </div>
                      )}

                      {/* Rationales */}
                      <div className="space-y-1.5 pt-2 border-t border-[#D5DDEB]/60">
                        {rec.reasons.map((reason, idx) => (
                          <div
                            key={idx}
                            className="text-[11px] text-[#5B6882] flex items-start gap-1.5"
                          >
                            <span className="text-[#09408C] font-bold">•</span>
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="pt-4 mt-2">
                      <button
                        type="button"
                        disabled={rec.hasConflict}
                        onClick={() => handleSelectRecommendedTutor(rec)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-colors shadow-2xs flex items-center justify-center gap-1.5 ${
                          rec.hasConflict
                            ? "bg-[#D5DDEB] text-[#5B6882] cursor-not-allowed"
                            : isTopMatch
                            ? "bg-[#09408C] text-white hover:bg-[#0E3571]"
                            : "bg-[#EAF1FA] text-[#09408C] hover:bg-[#d8e7f8]"
                        }`}
                      >
                        {rec.hasConflict ? (
                          <span>Tidak Dapat Dipilih (Bentrok)</span>
                        ) : (
                          <>
                            <CheckCircle2 size={13} />
                            <span>Pilih & Jadwalkan Sesi</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL JADWALKAN SESI BARU (DILENGKAPI SIMULATOR SESI BERULANG) */}
      {/* ============================================================== */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateSession}
            className="bg-white rounded-2xl p-6 max-w-xl w-full border border-[#D5DDEB] shadow-xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-[#D5DDEB] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#09408C] font-display">
                  Jadwalkan Sesi Bimbingan
                </h3>
                <p className="text-xs text-[#5B6882]">
                  Validasi bentrok otomatis BR-2, durasi standar 90 menit BR-5, & limit semi-privat 5 siswa BR-3.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-[#5B6882] hover:text-[#1B2A41]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Conflict Alert Banner */}
            {conflictError && (
              <div className="p-3 bg-[#FEF7E6] border border-[#F5B82E] rounded-xl text-xs text-[#B45309] flex items-start gap-2">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <span>{conflictError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Pilih Tutor *
                </label>
                <select
                  value={tutorId}
                  onChange={(e) => {
                    setTutorId(e.target.value);
                    if (recurrenceWeeks > 1) handleRecurrenceChange(recurrenceWeeks);
                  }}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring bg-white"
                >
                  {tutors.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({(t.expertise || []).slice(0, 2).join(", ")})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Program Bimbingan *
                </label>
                <select
                  value={programId}
                  onChange={(e) => setProgramId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring bg-white"
                >
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Model Kelas *
                </label>
                <select
                  value={classType}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    setClassType(val);
                    if (val === "PRIVAT" && selectedStudentIds.length > 1) {
                      setSelectedStudentIds([selectedStudentIds[0]]);
                    }
                  }}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring bg-white"
                >
                  <option value="PRIVAT">Privat (1 Siswa)</option>
                  <option value="SEMI_PRIVAT">Semi-Privat (2-5 Siswa - BR-3)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Mode Pertemuan *
                </label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring bg-white"
                >
                  <option value="ONLINE">Online (Zoom / Meet)</option>
                  <option value="HOME_VISIT">Home Visit (Datang ke Rumah)</option>
                </select>
              </div>
            </div>

            {/* Pilih Siswa */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#1B2A41]">
                  Pilih Siswa Peserta ({selectedStudentIds.length} terpilih
                  {classType === "SEMI_PRIVAT" && " - maks 5 peserta"}) *
                </label>
              </div>
              <div className="max-h-36 overflow-y-auto border border-[#D5DDEB] rounded-xl p-2 space-y-1 bg-[#F4F7FB]/50">
                {students.map((s) => {
                  const isChecked = selectedStudentIds.includes(s.id);
                  return (
                    <label
                      key={s.id}
                      className={`flex items-center gap-2 p-1.5 rounded-lg text-xs cursor-pointer ${
                        isChecked ? "bg-[#EAF1FA] font-semibold text-[#09408C]" : "hover:bg-white"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleStudentToggle(s.id)}
                        className="rounded"
                      />
                      <span>
                        {s.name} ({s.level} - {s.school || "Umum"})
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Waktu & Durasi Default 90 Menit (BR-5) */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Tanggal Mulai *
                </label>
                <input
                  type="date"
                  required
                  value={sessionDate}
                  onChange={(e) => {
                    setSessionDate(e.target.value);
                    if (recurrenceWeeks > 1) handleRecurrenceChange(recurrenceWeeks);
                  }}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Mulai *
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    handleSet90Min(e.target.value, setEndTime);
                  }}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#1B2A41]">
                    Selesai (BR-5) *
                  </label>
                  <button
                    type="button"
                    onClick={() => handleSet90Min(startTime, setEndTime)}
                    className="text-[10px] text-[#09408C] font-bold hover:underline"
                  >
                    90 mnt
                  </button>
                </div>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring"
                />
              </div>
            </div>

            {mode === "ONLINE" ? (
              <div>
                <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Tautan Zoom / Google Meet
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/sb-..."
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Alamat Home Visit
                </label>
                <input
                  type="text"
                  placeholder="Jl. Boulevard Barat No. 45..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring"
                />
              </div>
            )}

            {/* Recurrence (PRD C3) */}
            <div className="p-3 bg-[#EAF1FA]/60 rounded-xl border border-[#9AC1E2]/40 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#09408C] flex items-center gap-1.5">
                  <CalendarDays size={14} />
                  <span>Sesi Berulang Mingguan (PRD C3)</span>
                </label>
                <span className="text-[10px] text-[#5B6882]">Otomatis terjadwal mingguan</span>
              </div>

              <select
                value={recurrenceWeeks}
                onChange={(e) => handleRecurrenceChange(parseInt(e.target.value))}
                className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring bg-white"
              >
                <option value={1}>Hanya 1 Sesi (Tidak Berulang)</option>
                <option value={2}>2 Sesi Berulang (2 Minggu)</option>
                <option value={4}>4 Sesi Berulang (1 Bulan / 4 Minggu)</option>
                <option value={8}>8 Sesi Berulang (2 Bulan / 8 Minggu)</option>
                <option value={12}>12 Sesi Berulang (3 Bulan / 12 Minggu)</option>
              </select>

              {/* Simulation Breakdown Preview */}
              {simulatedRecurrences.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-[#D5DDEB]/60 max-h-36 overflow-y-auto">
                  <div className="text-[10px] font-bold text-[#5B6882]">
                    Simulasi {simulatedRecurrences.length} Tanggal Jadwal Masa Depan:
                  </div>
                  {simulatedRecurrences.map((item) => (
                    <div
                      key={item.weekIndex}
                      className={`flex items-center justify-between p-1.5 rounded-lg text-[11px] ${
                        item.hasConflict
                          ? "bg-[#FBE9E5] text-[#B4381F] font-semibold"
                          : "bg-white text-[#1B2A41]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#EAF1FA] text-[#09408C] flex items-center justify-center font-bold text-[10px]">
                          {item.weekIndex}
                        </span>
                        <span>
                          {item.dayName}, {item.dateStr}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[10px]">
                        {item.hasConflict ? (
                          <>
                            <X size={12} className="text-[#B4381F]" />
                            <span>{item.conflictDetails || "Bentrok"}</span>
                          </>
                        ) : (
                          <>
                            <Check size={12} className="text-[#1F6F4A]" />
                            <span className="text-[#1F6F4A]">Aman Bebas Bentrok</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D5DDEB]">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#5B6882] hover:bg-[#F4F7FB] rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold bg-[#09408C] text-white hover:bg-[#0E3571] rounded-xl transition-colors disabled:opacity-50 shadow-2xs"
              >
                {isSubmitting ? "Menyimpan & Validasi BR-2..." : "Simpan & Buat Jadwal"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL JURNAL & ABSENSI                                         */}
      {/* ============================================================== */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-[#D5DDEB] shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-[#09408C] font-display">
              Jurnal Pertemuan & Absensi
            </h3>

            {/* Daftar Siswa & Status Kehadiran */}
            <div>
              <label className="block text-xs font-bold text-[#1B2A41] mb-1.5">
                Absensi Kehadiran Siswa
              </label>
              <div className="space-y-2">
                {selectedSession.participants.map((p: any) => {
                  const currentAtt =
                    participantAttendances.find((a) => a.participantId === p.id)?.attendance ||
                    p.attendance;

                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-2 rounded-xl border border-[#D5DDEB] text-xs"
                    >
                      <span className="font-semibold text-[#1B2A41]">{p.student.name}</span>
                      <select
                        value={currentAtt}
                        onChange={(e) => {
                          const val = e.target.value as AttendanceStatus;
                          setParticipantAttendances((prev) =>
                            prev.map((a) =>
                              a.participantId === p.id ? { ...a, attendance: val } : a
                            )
                          );
                        }}
                        className="text-xs p-1 rounded-lg border border-[#D5DDEB] bg-white font-medium focus-ring"
                      >
                        <option value="HADIR">Hadir</option>
                        <option value="IZIN">Izin</option>
                        <option value="SAKIT">Sakit</option>
                        <option value="ALPA">Alpa</option>
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                Topik Materi yang Dibahas *
              </label>
              <input
                type="text"
                required
                placeholder="Misal: Persamaan Kuadrat & Logaritma..."
                value={journalTopic}
                onChange={(e) => setJournalTopic(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                Catatan Evaluasi Pemahaman Siswa
              </label>
              <textarea
                rows={2}
                placeholder="Catatan perkembangan belajar siswa..."
                value={journalNotes}
                onChange={(e) => setJournalNotes(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                Tugas / PR Siswa
              </label>
              <input
                type="text"
                placeholder="Misal: Latihan Soal Bab 3 No 1-10..."
                value={journalHomework}
                onChange={(e) => setJournalHomework(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D5DDEB]">
              <button
                type="button"
                onClick={() => setSelectedSession(null)}
                className="px-4 py-2 text-xs font-semibold text-[#5B6882] hover:bg-[#F4F7FB] rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveJournal}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold bg-[#09408C] text-white hover:bg-[#0E3571] rounded-xl transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Jurnal & Absensi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
