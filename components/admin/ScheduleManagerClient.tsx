"use client";

import { useState } from "react";
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
} from "lucide-react";
import {
  createSession,
  updateSessionStatus,
  saveSessionJournal,
} from "@/actions/penjadwalan";
import { SessionStatus, AttendanceStatus } from "@prisma/client";

export default function ScheduleManagerClient({
  initialSessions,
  tutors,
  students,
  programs,
}: {
  initialSessions: any[];
  tutors: any[];
  students: any[];
  programs: any[];
}) {
  const [sessions, setSessions] = useState(initialSessions);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
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

  // Journal form states
  const [journalTopic, setJournalTopic] = useState("");
  const [journalNotes, setJournalNotes] = useState("");
  const [journalHomework, setJournalHomework] = useState("");
  const [participantAttendances, setParticipantAttendances] = useState<
    Array<{ participantId: string; attendance: AttendanceStatus }>
  >([]);

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
      // Menampilkan pesan bentrok jadwal atau validasi (BR-2 / BR-3)
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

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#09408C] font-display">
            Jadwal Sesi & Kehadiran
          </h1>
          <p className="text-sm text-[#5B6882] mt-0.5">
            Kelola jadwal privat dan semi-privat, deteksi bentrok otomatis, dan pencatatan jurnal.
          </p>
        </div>

        <button
          onClick={() => {
            setConflictError(null);
            setShowCreateModal(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571] transition-colors shadow-xs"
        >
          <Plus size={14} />
          <span>+ Jadwalkan Sesi Baru</span>
        </button>
      </div>

      {/* Sesi List */}
      <div className="space-y-3">
        {sessions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#D5DDEB] p-12 text-center text-sm text-[#5B6882]">
            Belum ada sesi bimbingan yang dijadwalkan. Klik tombol di atas untuk menjadwalkan sesi.
          </div>
        ) : (
          sessions.map((session) => {
            const start = new Date(session.startAt);
            const end = new Date(session.endAt);
            const dateStr = start.toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            const timeStr = `${start.toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })} - ${end.toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })} WIB`;

            const isDone = session.status === "TERLAKSANA";

            return (
              <div
                key={session.id}
                className="bg-white rounded-2xl border border-[#D5DDEB] p-5 shadow-xs hover:border-[#9AC1E2] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="px-3 py-2 rounded-xl bg-[#EAF1FA] text-[#09408C] text-center min-w-[90px]">
                    <div className="text-xs font-bold tabular-nums">
                      {start.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                    </div>
                    <div className="text-[10px] text-[#5B6882] font-semibold mt-0.5">
                      {start.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-base text-[#1B2A41]">
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
                      <span>Tutor: <strong>{session.tutor.name}</strong></span>
                      <span>•</span>
                      <span>{dateStr} ({timeStr})</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 font-medium">
                        {session.mode === "ONLINE" ? (
                          <>
                            <Video size={12} className="text-[#0CC0DF]" />
                            Online Zoom
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
                      <div className="mt-2 text-xs text-[#09408C] bg-[#EAF1FA] px-2.5 py-1 rounded-lg inline-block">
                        Materi: <strong>{session.journal.topic}</strong>
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
                      Tandai Terlaksana (Potong Kuota)
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Buat Sesi Baru (dengan validasi bentrok BR-2 & semi-privat max 5 BR-3) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateSession}
            className="bg-white rounded-2xl p-6 max-w-lg w-full border border-[#D5DDEB] shadow-xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-lg font-bold text-[#09408C] font-display">
              Jadwalkan Sesi Bimbingan
            </h3>

            {/* Conflict Alert Banner (Design 5.6) */}
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
                  onChange={(e) => setTutorId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring bg-white"
                >
                  {tutors.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.expertise.slice(0, 2).join(", ")})
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
                  <option value="SEMI_PRIVAT">Semi-Privat (2-5 Siswa)</option>
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
              <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                Pilih Siswa Peserta ({selectedStudentIds.length} terpilih
                {classType === "SEMI_PRIVAT" && " - maks 5"}) *
              </label>
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
                      <span>{s.name} ({s.level} - {s.school || "Umum"})</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Waktu & Durasi Default 90 Menit (BR-5) */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Tanggal *
                </label>
                <input
                  type="date"
                  required
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
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
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Selesai (90 mnt) *
                </label>
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
                  placeholder="https://zoom.us/j/..."
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
                  placeholder="Jl. Ahmad Yani No. 12..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring"
                />
              </div>
            )}

            {/* Recurrence (C3) */}
            <div>
              <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                Ulangi Mingguan (Opsional)
              </label>
              <select
                value={recurrenceWeeks}
                onChange={(e) => setRecurrenceWeeks(parseInt(e.target.value))}
                className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring bg-white"
              >
                <option value={1}>Hanya 1 Sesi (Tidak berulang)</option>
                <option value={4}>4 Minggu Berturut-turut (1 Bulan)</option>
                <option value={8}>8 Minggu Berturut-turut (2 Bulan)</option>
                <option value={12}>12 Minggu Berturut-turut (3 Bulan)</option>
              </select>
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
                className="px-4 py-2 text-xs font-semibold bg-[#09408C] text-white hover:bg-[#0E3571] rounded-xl transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Memeriksa bentrok..." : "Simpan Jadwal Sesi"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Jurnal & Absensi */}
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
                      className="p-2 rounded-xl border border-[#D5DDEB] bg-[#F4F7FB] flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-[#1B2A41]">{p.student.name}</span>
                      <div className="flex items-center gap-1">
                        {(["HADIR", "IZIN", "ALPA"] as AttendanceStatus[]).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => {
                              setParticipantAttendances((prev) =>
                                prev.map((item) =>
                                  item.participantId === p.id
                                    ? { ...item, attendance: st }
                                    : item
                                )
                              );
                            }}
                            className={`px-2 py-1 rounded-md text-[11px] font-bold ${
                              currentAtt === st
                                ? st === "HADIR"
                                  ? "bg-[#1F6F4A] text-white"
                                  : st === "IZIN"
                                  ? "bg-[#F5B82E] text-[#1B2A41]"
                                  : "bg-[#B4381F] text-white"
                                : "bg-white text-[#5B6882] hover:bg-gray-100"
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                Topik / Materi yang Dipelajari *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Konsep Dasar Trigonometri & Latihan Soal..."
                value={journalTopic}
                onChange={(e) => setJournalTopic(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                Catatan Perkembangan Siswa
              </label>
              <textarea
                rows={2}
                placeholder="Siswa sudah paham konsep kuadran, tinggal memperbanyak latihan..."
                value={journalNotes}
                onChange={(e) => setJournalNotes(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                Tugas Rumah (PR)
              </label>
              <input
                type="text"
                placeholder="Latihan soal halaman 45 No. 1-5"
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
                Tutup
              </button>
              <button
                type="button"
                onClick={handleSaveJournal}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold bg-[#09408C] text-white hover:bg-[#0E3571] rounded-xl transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Jurnal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
