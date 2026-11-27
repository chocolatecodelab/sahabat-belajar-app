"use client";

import { useState } from "react";
import {
  BookOpen,
  Plus,
  Phone,
  Mail,
  Award,
  DollarSign,
  CheckCircle2,
  Calendar,
  Search,
  Edit2,
  Trash2,
  Power,
  Download,
  AlertTriangle,
  AlertCircle,
  X,
  ShieldCheck,
} from "lucide-react";
import {
  createTutor,
  updateTutor,
  deleteTutor,
  toggleTutorStatus,
} from "@/actions/tutor";
import { TutorStatus } from "@prisma/client";
import { useToast } from "@/components/ui/Toast";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function TutorManagerClient({
  initialTutors,
  isStaffViewer = false,
}: {
  initialTutors: any[];
  isStaffViewer?: boolean;
}) {
  const toast = useToast();
  const [tutors, setTutors] = useState(initialTutors);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTutor, setEditingTutor] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [confirmToggleTutor, setConfirmToggleTutor] = useState<any | null>(null);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [expertiseString, setExpertiseString] = useState("");
  const [ratePerSession, setRatePerSession] = useState("100000");
  const [bio, setBio] = useState("");
  const [status, setStatus] = useState<TutorStatus>("AKTIF");

  const filteredTutors = tutors.filter((t) => {
    if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
    const query = searchQuery.toLowerCase();
    const matchName = t.name.toLowerCase().includes(query);
    const matchPhone = t.phone.includes(query);
    const matchExp = t.expertise?.some((e: string) => e.toLowerCase().includes(query));
    return matchName || matchPhone || matchExp;
  });

  const openCreateModal = () => {
    setEditingTutor(null);
    setName("");
    setPhone("");
    setEmail("");
    setExpertiseString("");
    setRatePerSession("100000");
    setBio("");
    setStatus("AKTIF");
    setShowAddModal(true);
  };

  const openEditModal = (tutor: any) => {
    setEditingTutor(tutor);
    setName(tutor.name);
    setPhone(tutor.phone);
    setEmail(tutor.email || "");
    setExpertiseString((tutor.expertise || []).join(", "));
    setRatePerSession(String(tutor.ratePerSession || 100000));
    setBio(tutor.bio || "");
    setStatus(tutor.status || "AKTIF");
    setShowAddModal(true);
  };

  const handleSaveTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      toast.error("Validasi Gagal", "Nama tutor dan nomor WhatsApp wajib diisi.");
      return;
    }
    setIsSubmitting(true);

    const expertise = expertiseString
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingTutor) {
      const res = await updateTutor(editingTutor.id, {
        name,
        phone,
        email: email || undefined,
        expertise,
        ratePerSession: isStaffViewer ? undefined : parseInt(ratePerSession, 10) || 100000,
        bio,
        status,
      });
      setIsSubmitting(false);

      if (res.success) {
        setTutors((prev) =>
          prev.map((t) =>
            t.id === editingTutor.id
              ? {
                  ...t,
                  name,
                  phone,
                  email,
                  expertise,
                  ratePerSession: isStaffViewer ? t.ratePerSession : parseInt(ratePerSession, 10) || 100000,
                  bio,
                  status,
                }
              : t
          )
        );
        setShowAddModal(false);
        toast.success("Tutor Diperbarui", `Data profil ${name} berhasil disimpan.`);
      } else {
        toast.error("Gagal Memperbarui", res.message);
      }
    } else {
      const res = await createTutor({
        name,
        phone,
        email: email || undefined,
        expertise,
        ratePerSession: parseInt(ratePerSession, 10) || 100000,
        bio,
        status,
      });
      setIsSubmitting(false);

      if (res.success && res.data) {
        setTutors((prev) => [
          {
            id: res.data!.id,
            name,
            phone,
            email,
            expertise,
            ratePerSession: parseInt(ratePerSession, 10) || 100000,
            status,
            bio,
            _count: { sessions: 0 },
          },
          ...prev,
        ]);
        setShowAddModal(false);
        toast.success("Tutor Ditambahkan", `Profil tutor ${name} berhasil didaftarkan.`);
      } else {
        toast.error("Gagal Menambah Tutor", res.message);
      }
    }
  };

  const executeToggleStatus = async (tutor: any) => {
    const nextStatus: TutorStatus = tutor.status === "AKTIF" ? "NONAKTIF" : "AKTIF";
    setIsTogglingStatus(true);
    const res = await toggleTutorStatus(tutor.id, nextStatus);
    setIsTogglingStatus(false);
    if (res.success) {
      setTutors((prev) =>
        prev.map((t) => (t.id === tutor.id ? { ...t, status: nextStatus } : t))
      );
      setConfirmToggleTutor(null);
      toast.success("Status Diperbarui", res.message);
    } else {
      toast.error("Gagal Mengubah Status", res.message);
    }
  };

  const handleToggleStatus = (tutor: any) => {
    if (tutor.status === "AKTIF") {
      setConfirmToggleTutor(tutor);
    } else {
      executeToggleStatus(tutor);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    const res = await deleteTutor(deleteTarget.id);
    setIsSubmitting(false);

    if (res.success) {
      setTutors((prev) =>
        prev
          .map((t) => (t.id === deleteTarget.id ? { ...t, status: "NONAKTIF" } : t))
          .filter((t) =>
            // If soft deleted, keep with status NONAKTIF, else filter out if hard deleted
            res.message?.includes("soft delete") ? true : t.id !== deleteTarget.id
          )
      );
      toast.success("Tutor Diproses", res.message);
      setDeleteTarget(null);
    } else {
      toast.error("Gagal Menghapus Tutor", res.message);
    }
  };

  const exportToCsv = () => {
    if (tutors.length === 0) return;
    const header = "Nama Tutor,No. WhatsApp,Email,Keahlian,Status,Total Sesi Mengajar" + (isStaffViewer ? "" : ",Tarif per Sesi (Rp)") + "\n";
    const rows = tutors
      .map((t) => {
        const exp = (t.expertise || []).join("; ");
        const base = `"${t.name}","${t.phone}","${t.email || "-"}","${exp}","${t.status}",${t._count?.sessions || 0}`;
        return isStaffViewer ? base : `${base},${t.ratePerSession || 0}`;
      })
      .join("\n");

    const blob = new Blob(["\uFEFF" + header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `direktori-tutor-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF1FA] text-[#09408C] text-xs font-bold border border-[#9AC1E2] mb-2">
            <Award size={14} />
            <span>Pengajar & Tutor Ahli</span>
          </div>
          <h1 className="text-2xl font-bold text-[#09408C] font-display">
            Direktori Tutor Pakar
          </h1>
          <p className="text-sm text-[#5B6882] mt-0.5">
            Daftar pengajar bimbingan belajar privat & semi-privat Sahabat Belajar.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCsv}
            disabled={tutors.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#D5DDEB] bg-white text-[#09408C] text-xs font-semibold hover:bg-[#EAF1FA] transition-colors shadow-2xs disabled:opacity-50"
          >
            <Download size={14} />
            <span>Ekspor CSV</span>
          </button>

          {!isStaffViewer && (
            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571] transition-colors shadow-xs cursor-pointer"
            >
              <Plus size={14} />
              <span>Tambah Tutor Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-[#D5DDEB] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search size={16} className="absolute left-3 top-2.5 text-[#5B6882]" />
          <input
            type="text"
            placeholder="Cari nama tutor atau bidang keahlian..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D5DDEB] focus-ring bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-[#5B6882] font-semibold mr-1">Status:</span>
          {["ALL", "AKTIF", "NONAKTIF", "CUTI"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === st
                  ? "bg-[#09408C] text-white"
                  : "bg-[#F4F7FB] text-[#5B6882] hover:bg-[#EAF1FA] hover:text-[#09408C]"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Tutors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTutors.map((tutor) => {
          const sessionCount = tutor._count?.sessions || 0;

          return (
            <div
              key={tutor.id}
              className={`bg-white rounded-3xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                tutor.status === "AKTIF"
                  ? "border-[#D5DDEB] hover:border-[#09408C] hover:shadow-xs"
                  : "border-gray-200 bg-gray-50/70 opacity-80"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-base text-[#1B2A41] font-display">
                      {tutor.name}
                    </h3>
                    <div className="text-xs text-[#5B6882] flex items-center gap-1 mt-0.5">
                      <Phone size={11} className="text-[#1F6F4A]" />
                      <a
                        href={`https://wa.me/${tutor.phone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline text-[#1F6F4A] font-semibold"
                      >
                        {tutor.phone}
                      </a>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border shrink-0 ${
                      tutor.status === "AKTIF"
                        ? "bg-[#E3F4EC] text-[#1F6F4A] border-[#1F6F4A]/25"
                        : tutor.status === "CUTI"
                        ? "bg-[#FEF7E6] text-[#B45309] border-[#F5B82E]"
                        : "bg-gray-100 text-gray-500 border-gray-200"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        tutor.status === "AKTIF"
                          ? "bg-[#1F6F4A]"
                          : tutor.status === "CUTI"
                          ? "bg-[#B45309]"
                          : "bg-gray-400"
                      }`}
                    />
                    <span>{tutor.status}</span>
                  </span>
                </div>

                {/* Keahlian Tags */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {tutor.expertise?.map((exp: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-[#EAF1FA] text-[#09408C] rounded-md text-[11px] font-medium"
                    >
                      {exp}
                    </span>
                  ))}
                </div>

                {tutor.bio && (
                  <p className="text-xs text-[#5B6882] mt-2.5 line-clamp-2 leading-relaxed">
                    {tutor.bio}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3.5 border-t border-[#D5DDEB] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[#5B6882]">Honor Sesi: </span>
                    {isStaffViewer || !tutor.ratePerSession ? (
                      <span className="italic text-[#5B6882] font-medium bg-[#F4F7FB] px-2 py-0.5 rounded-md text-[11px]">
                        Dirahasiakan (BR-7)
                      </span>
                    ) : (
                      <span className="font-bold text-[#09408C] font-mono tabular-nums">
                        Rp {tutor.ratePerSession?.toLocaleString("id-ID")}
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-[#5B6882]">
                    <strong>{sessionCount}</strong> sesi mengajar
                  </div>
                </div>

                {/* Actions Footer */}
                {!isStaffViewer && (
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => handleToggleStatus(tutor)}
                      className={`text-[11px] font-semibold flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-colors ${
                        tutor.status === "AKTIF"
                          ? "text-[#B45309] border-[#F5B82E] hover:bg-[#FEF7E6]"
                          : "text-[#1F6F4A] border-[#1F6F4A] hover:bg-[#E3F4EC]"
                      }`}
                      title={tutor.status === "AKTIF" ? "Nonaktifkan tutor" : "Aktifkan kembali"}
                    >
                      <Power size={11} />
                      <span>{tutor.status === "AKTIF" ? "Nonaktifkan" : "Aktifkan"}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(tutor)}
                        className="p-1.5 text-[#09408C] hover:bg-[#EAF1FA] rounded-lg transition-colors"
                        title="Edit Profil Tutor"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(tutor)}
                        className="p-1.5 text-[#B4381F] hover:bg-[#FBE9E5] rounded-lg transition-colors"
                        title="Hapus / Nonaktifkan Tutor"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* MODAL: CREATE / EDIT TUTOR */}
      {/* ======================================================== */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="tutor-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200"
        >
          <form
            onSubmit={handleSaveTutor}
            className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#D5DDEB] shadow-2xl space-y-4 relative"
          >
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-[#5B6882] hover:bg-[#EAF1FA] transition-colors"
            >
              <X size={18} />
            </button>

            <div>
              <h3 id="tutor-modal-title" className="text-lg font-bold text-[#09408C] font-display">
                {editingTutor ? "Edit Profil Tutor" : "Tambah Profil Tutor Baru"}
              </h3>
              <p className="text-xs text-[#5B6882] mt-0.5">
                Isi identitas pengajar, nomor kontak WhatsApp, dan bidang keahlian.
              </p>
            </div>

            <div>
              <label htmlFor="tutor-name-input" className="block text-xs font-bold text-[#1B2A41] mb-1">
                Nama Lengkap & Gelar *
              </label>
              <input
                id="tutor-name-input"
                type="text"
                required
                placeholder="Contoh: Hendra Wijaya, M.Pd."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-[#D5DDEB] focus-ring"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="tutor-phone-input" className="block text-xs font-bold text-[#1B2A41] mb-1">
                  No. WhatsApp *
                </label>
                <input
                  id="tutor-phone-input"
                  type="text"
                  required
                  placeholder="08123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-[#D5DDEB] focus-ring"
                />
              </div>

              <div>
                <label htmlFor="tutor-status-select" className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Status Keaktifan
                </label>
                <select
                  id="tutor-status-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TutorStatus)}
                  className="w-full text-xs p-3 rounded-xl border border-[#D5DDEB] focus-ring bg-white"
                >
                  <option value="AKTIF">AKTIF</option>
                  <option value="NONAKTIF">NONAKTIF</option>
                  <option value="CUTI">CUTI</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="tutor-email-input" className="block text-xs font-bold text-[#1B2A41] mb-1">
                Email Pengajar (Opsional)
              </label>
              <input
                id="tutor-email-input"
                type="email"
                placeholder="tutor@sahabatbelajar.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-[#D5DDEB] focus-ring"
              />
            </div>

            <div>
              <label htmlFor="tutor-exp-input" className="block text-xs font-bold text-[#1B2A41] mb-1">
                Keahlian & Mata Pelajaran (Pisahkan dengan koma) *
              </label>
              <input
                id="tutor-exp-input"
                type="text"
                required
                placeholder="Contoh: Matematika, TIU CPNS, Fisika SMA"
                value={expertiseString}
                onChange={(e) => setExpertiseString(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-[#D5DDEB] focus-ring"
              />
            </div>

            {!isStaffViewer && (
              <div>
                <label htmlFor="tutor-rate-input" className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Tarif Honor per Sesi (Rp) *
                </label>
                <input
                  id="tutor-rate-input"
                  type="number"
                  min="0"
                  step="10000"
                  required
                  value={ratePerSession}
                  onChange={(e) => setRatePerSession(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-[#D5DDEB] focus-ring font-mono"
                />
                <span className="text-[10px] text-[#5B6882] mt-0.5 block">
                  Sesuai BR-7: Tarif honor hanya terlihat oleh Admin & Tutor bersangkutan.
                </span>
              </div>
            )}

            <div>
              <label htmlFor="tutor-bio-input" className="block text-xs font-bold text-[#1B2A41] mb-1">
                Bio & Pengalaman Singkat
              </label>
              <textarea
                id="tutor-bio-input"
                rows={2}
                placeholder="Lulusan S2 Pendidikan Matematika, berpengalaman 5 tahun mengajar..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-[#D5DDEB] focus-ring resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D5DDEB]">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 text-xs font-semibold text-[#5B6882] hover:bg-[#F4F7FB] rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 text-xs font-bold bg-[#09408C] text-white hover:bg-[#0E3571] rounded-xl transition-colors shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? "Menyimpan..." : editingTutor ? "Simpan Perubahan" : "Simpan Profil"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: IMPACT-AWARE DELETE CONFIRMATION */}
      {/* ======================================================== */}
      {deleteTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200"
        >
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#D5DDEB] shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FBE9E5] text-[#B4381F] flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-[#1B2A41] font-display">
                Konfirmasi Hapus Tutor
              </h3>
              <p className="text-xs font-semibold text-[#09408C]">"{deleteTarget.name}"</p>
            </div>

            {/* Impact-Aware Warning Box */}
            {(deleteTarget._count?.sessions || 0) > 0 ? (
              <div className="bg-[#FEF7E6] border border-[#F5B82E] p-3.5 rounded-2xl text-xs text-[#B45309] space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle size={14} />
                  <span>Perhatian Integritas Data (Soft Delete):</span>
                </div>
                <p className="leading-relaxed">
                  Tutor ini memiliki riwayat <strong>{deleteTarget._count?.sessions} sesi mengajar</strong>.
                  Sistem akan melakukan <strong>Soft Deactivate</strong> (mengubah status menjadi NONAKTIF)
                  agar riwayat jurnal mengajar dan rekapitulasi honor tutor (BR-6) tetap aman dan tidak terhapus.
                </p>
              </div>
            ) : (
              <p className="text-xs text-[#5B6882] text-center leading-relaxed">
                Tutor ini belum memiliki riwayat sesi mengajar dan akan dihapus secara permanen dari sistem.
              </p>
            )}

            <div className="flex items-center justify-center gap-2 pt-2 border-t border-[#D5DDEB]">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="w-1/2 py-2.5 text-xs font-semibold text-[#5B6882] hover:bg-[#F4F7FB] rounded-xl transition-colors border border-[#D5DDEB]"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteConfirm}
                className="w-1/2 py-2.5 text-xs font-bold bg-[#B4381F] text-white hover:bg-[#962D18] rounded-xl transition-colors shadow-xs disabled:opacity-50"
              >
                {isSubmitting
                  ? "Memproses..."
                  : (deleteTarget._count?.sessions || 0) > 0
                  ? "Nonaktifkan Aman"
                  : "Hapus Permanen"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Nonaktifkan Tutor */}
      <ConfirmModal
        open={Boolean(confirmToggleTutor)}
        title="Nonaktifkan Status Tutor?"
        description={
          <>
            Tutor{" "}
            <strong className="text-[#1B2A41]">{confirmToggleTutor?.name}</strong>{" "}
            akan ditandai <strong>NONAKTIF</strong> dan tidak akan muncul pada pilihan penjadwalan baru. Anda dapat mengaktifkannya kembali kapan saja.
          </>
        }
        confirmLabel="Ya, Nonaktifkan"
        variant="warning"
        loading={isTogglingStatus}
        onConfirm={() => {
          if (confirmToggleTutor) {
            executeToggleStatus(confirmToggleTutor);
          }
        }}
        onCancel={() => setConfirmToggleTutor(null)}
      />
    </div>
  );
}
