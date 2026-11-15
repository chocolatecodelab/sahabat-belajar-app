"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  ExternalLink,
  MessageSquare,
  ArrowRight,
  Filter,
  UserPlus,
  FileEdit,
  RotateCcw,
} from "lucide-react";
import { updateLeadStatus, deleteLead } from "@/actions/lead";
import { convertLeadToStudent } from "@/actions/siswa";
import { LeadStatus } from "@prisma/client";
import { formatDate } from "@/lib/date";
import { useToast } from "@/components/ui/Toast";

const STATUS_CONFIG: Record<
  LeadStatus,
  { label: string; bg: string; text: string; border: string; icon: any }
> = {
  BARU: {
    label: "Baru",
    bg: "bg-[#EAF1FA]",
    text: "text-[#09408C]",
    border: "border-[#9AC1E2]",
    icon: Clock,
  },
  DIHUBUNGI: {
    label: "Dihubungi",
    bg: "bg-[#FEF7E6]",
    text: "text-[#B45309]",
    border: "border-[#F5B82E]",
    icon: AlertCircle,
  },
  IKUT_PLACEMENT: {
    label: "Ikut Placement",
    bg: "bg-[#E0F7FA]",
    text: "text-[#006064]",
    border: "border-[#0CC0DF]",
    icon: Calendar,
  },
  DAFTAR: {
    label: "Daftar",
    bg: "bg-[#E3F4EC]",
    text: "text-[#1F6F4A]",
    border: "border-[#1F6F4A]/25",
    icon: CheckCircle2,
  },
  BATAL: {
    label: "Batal",
    bg: "bg-[#F1F5F9]",
    text: "text-[#5B6882]",
    border: "border-[#CBD5E1]",
    icon: XCircle,
  },
};

export default function LeadManagerClient({
  initialLeads,
}: {
  initialLeads: any[];
}) {
  const toast = useToast();
  const [leads, setLeads] = useState(initialLeads);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState<LeadStatus>("DIHUBUNGI");
  const [notes, setNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const filteredLeads = leads.filter((l) => {
    const matchStatus = selectedStatus === "ALL" || l.status === selectedStatus;
    const matchSearch =
      !searchQuery ||
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.phone.includes(searchQuery) ||
      (l.email && l.email.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchStatus && matchSearch;
  });

  const handleUpdateStatus = async () => {
    if (!selectedLead) return;
    setIsUpdating(true);
    const res = await updateLeadStatus(selectedLead.id, newStatus, notes);
    setIsUpdating(false);

    if (res.success) {
      toast.success("Status Diperbarui", "Status prospek berhasil diperbarui.");
      setLeads((prev) =>
        prev.map((l) =>
          l.id === selectedLead.id
            ? { ...l, status: newStatus, notes: notes || l.notes }
            : l
        )
      );
      setSelectedLead(null);
      setNotes("");
    } else {
      toast.error("Gagal Memperbarui", res.message);
    }
  };

  const handleConvertToStudent = async (leadId: string) => {
    setIsConverting(true);
    const res = await convertLeadToStudent(leadId);
    setIsConverting(false);

    if (res.success) {
      const createdStudentId = (res as any).data?.id || "";
      toast.success(
        "Berhasil Didaftarkan Jadi Siswa",
        `${res.message} Silakan klik 'Atur Paket' untuk mengaktifkan kuota bimbingan.`
      );
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId
            ? { ...l, status: "DAFTAR", convertedStudentId: createdStudentId }
            : l
        )
      );
      setSelectedLead(null);
    } else {
      toast.error("Gagal Konversi", res.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#09408C] font-heading">
            Manajemen Prospek (Lead)
          </h1>
          <p className="text-sm text-[#5B6882] mt-0.5">
            Daftar calon siswa dari formulir website publik dan konsultasi WhatsApp.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#D5DDEB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedStatus("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedStatus === "ALL"
                ? "bg-[#09408C] text-white"
                : "bg-[#F4F7FB] text-[#5B6882] hover:bg-[#EAF1FA]"
            }`}
          >
            Semua ({leads.length})
          </button>
          {Object.entries(STATUS_CONFIG).map(([key, config]) => {
            const count = leads.filter((l) => l.status === key).length;
            return (
              <button
                key={key}
                onClick={() => setSelectedStatus(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedStatus === key
                    ? "bg-[#09408C] text-white"
                    : `${config.bg} ${config.text} hover:opacity-80`
                }`}
              >
                {config.label} ({count})
              </button>
            );
          })}
        </div>

        <div className="relative min-w-[260px]">
          <Search size={16} className="absolute left-3 top-3 text-[#5B6882]" />
          <input
            type="text"
            placeholder="Cari nama atau telepon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D5DDEB] focus-ring bg-white"
          />
        </div>
      </div>

      {/* Leads List (Mobile Cards sm:hidden + Desktop Table hidden sm:block - UX-RESP-001) */}
      <div className="bg-white rounded-2xl border border-[#D5DDEB] shadow-xs overflow-hidden">
        {filteredLeads.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF1FA] text-[#09408C] flex items-center justify-center mx-auto">
              <Users size={22} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1B2A41] font-display">
                Prospek Tidak Ditemukan
              </h3>
              <p className="text-xs text-[#5B6882] mt-0.5 max-w-sm mx-auto">
                Tidak ada calon siswa yang cocok dengan filter status atau kata kunci pencarian saat ini.
              </p>
            </div>
            {(selectedStatus !== "ALL" || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedStatus("ALL");
                  setSearchQuery("");
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EAF1FA] text-[#09408C] text-xs font-bold hover:bg-[#9AC1E2]/40 transition-colors"
              >
                <RotateCcw size={13} />
                <span>Reset Filter & Pencarian</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile Card List (DESIGN.md 5.5.1) */}
            <div className="sm:hidden divide-y divide-[#D5DDEB]">
              {filteredLeads.map((lead) => {
                const conf = STATUS_CONFIG[lead.status as LeadStatus] || STATUS_CONFIG.BARU;
                const Icon = conf.icon;
                const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
                const formattedPhone = cleanPhone.startsWith("0") ? `62${cleanPhone.slice(1)}` : cleanPhone;
                const waUrl = `https://wa.me/${formattedPhone}?text=Halo%20${encodeURIComponent(
                  lead.name
                )}%2C%20terima%20kasih%20telah%20menghubungi%20Sahabat%20Belajar.%20Apakah%20ada%20yang%20bisa%20kami%20bantu%20mengenai%20bimbingan%20belajar%3F`;

                return (
                  <div key={lead.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-sm text-[#1B2A41]">{lead.name}</div>
                        <div className="text-xs text-[#5B6882] flex items-center gap-1.5 mt-0.5">
                          <Phone size={11} />
                          <span>{lead.phone}</span>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 ${conf.bg} ${conf.text} border ${conf.border}`}
                      >
                        <Icon size={11} />
                        <span>{conf.label}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-[#F4F7FB] p-2.5 rounded-xl text-xs">
                      <div>
                        <span className="text-[10px] text-[#5B6882] block">Minat Program</span>
                        <span className="font-semibold text-[#09408C]">
                          {lead.programInterest || "Umum"} ({lead.level || "-"})
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#5B6882] block">Model & Mode</span>
                        <span className="font-medium text-[#1B2A41]">
                          {lead.classModel === "SEMI_PRIVAT" ? "Semi-Privat" : "Privat"} •{" "}
                          {lead.learningMode === "HOME_VISIT" ? "Home Visit" : "Online"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-1.5 pt-1">
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1F6F4A] text-white text-xs font-semibold hover:bg-[#165538] transition-colors"
                      >
                        <Phone size={12} />
                        <span>Hubungi WA</span>
                      </a>

                      <button
                        onClick={() => {
                          setSelectedLead(lead);
                          setNewStatus(lead.status);
                          setNotes(lead.notes || "");
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#D5DDEB] bg-white text-[#09408C] text-xs font-semibold hover:bg-[#EAF1FA] transition-colors"
                      >
                        <FileEdit size={12} />
                        <span>Tindak Lanjut</span>
                      </button>

                      {lead.status !== "DAFTAR" ? (
                        <button
                          onClick={() => handleConvertToStudent(lead.id)}
                          disabled={isConverting}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571] transition-colors shadow-xs"
                        >
                          <UserPlus size={12} />
                          <span>Jadi Siswa</span>
                        </button>
                      ) : (
                        <Link
                          href={`/dashboard/paket?${lead.convertedStudentId ? `studentId=${lead.convertedStudentId}&` : ""}action=assign`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#EAF1FA] text-[#09408C] border border-[#9AC1E2] text-xs font-bold hover:bg-[#09408C] hover:text-white transition-colors"
                        >
                          <span>Atur Paket</span>
                          <ArrowRight size={12} />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F4F7FB] border-b border-[#D5DDEB] text-[#5B6882] font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Calon Siswa</th>
                    <th className="py-3 px-4">Minat Program</th>
                    <th className="py-3 px-4">Model & Mode</th>
                    <th className="py-3 px-4">Tanggal Masuk</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi Tindak Lanjut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D5DDEB]">
                  {filteredLeads.map((lead) => {
                    const conf = STATUS_CONFIG[lead.status as LeadStatus] || STATUS_CONFIG.BARU;
                    const Icon = conf.icon;
                    const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
                    const formattedPhone = cleanPhone.startsWith("0") ? `62${cleanPhone.slice(1)}` : cleanPhone;
                    const waUrl = `https://wa.me/${formattedPhone}?text=Halo%20${encodeURIComponent(
                      lead.name
                    )}%2C%20terima%20kasih%20telah%20menghubungi%20Sahabat%20Belajar.%20Apakah%20ada%20yang%20bisa%20kami%20bantu%20mengenai%20bimbingan%20belajar%3F`;

                    return (
                      <tr key={lead.id} className="hover:bg-[#EAF1FA]/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-sm text-[#1B2A41]">{lead.name}</div>
                          <div className="text-[#5B6882] flex items-center gap-1.5 mt-0.5">
                            <Phone size={11} />
                            <span>{lead.phone}</span>
                            {lead.email && (
                              <>
                                <span>•</span>
                                <Mail size={11} />
                                <span>{lead.email}</span>
                              </>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-[#09408C]">
                            {lead.programInterest || "Umum"}
                          </span>
                          <div className="text-[11px] text-[#5B6882]">Jenjang: {lead.level || "-"}</div>
                        </td>

                        <td className="py-3.5 px-4 text-[#5B6882]">
                          <div>{lead.classModel === "SEMI_PRIVAT" ? "Semi-Privat" : "Privat (1-on-1)"}</div>
                          <div className="text-[11px] font-medium text-[#295897]">
                            {lead.learningMode === "HOME_VISIT" ? "Home Visit" : "Online (Zoom)"}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-[#5B6882] tabular-nums">
                          {formatDate(lead.createdAt)}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${conf.bg} ${conf.text} border ${conf.border}`}
                          >
                            <Icon size={12} />
                            <span>{conf.label}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right space-x-1.5">
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#1F6F4A] text-white font-semibold hover:bg-[#165538] transition-colors"
                            title="Hubungi via WhatsApp"
                          >
                            <Phone size={12} />
                            <span>WA</span>
                          </a>

                          <button
                            onClick={() => {
                              setSelectedLead(lead);
                              setNewStatus(lead.status);
                              setNotes(lead.notes || "");
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#D5DDEB] bg-white text-[#09408C] font-semibold hover:bg-[#EAF1FA] transition-colors"
                          >
                            <FileEdit size={12} />
                            <span>Tindak Lanjut</span>
                          </button>

                          {lead.status !== "DAFTAR" ? (
                            <button
                              onClick={() => handleConvertToStudent(lead.id)}
                              disabled={isConverting}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#09408C] text-white font-semibold hover:bg-[#0E3571] transition-colors shadow-xs"
                              title="Konversi langsung menjadi siswa aktif"
                            >
                              <UserPlus size={12} />
                              <span>Jadi Siswa</span>
                            </button>
                          ) : (
                            <Link
                              href={`/dashboard/paket?${lead.convertedStudentId ? `studentId=${lead.convertedStudentId}&` : ""}action=assign`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#EAF1FA] text-[#09408C] border border-[#9AC1E2] font-bold hover:bg-[#09408C] hover:text-white transition-colors"
                              title="Tetapkan paket bimbingan untuk siswa baru ini"
                            >
                              <span>Atur Paket</span>
                              <ArrowRight size={12} />
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal Ubah Status Lead */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-[#D5DDEB] shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-[#09408C] font-heading">
              Tindak Lanjut Prospek: {selectedLead.name}
            </h3>

            <div>
              <label htmlFor="lead-status-select" className="block text-xs font-bold text-[#1B2A41] mb-1">
                Ubah Status Prospek
              </label>
              <select
                id="lead-status-select"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as LeadStatus)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring bg-white font-medium"
              >
                <option value="BARU">Baru (Belum Ditindaklanjuti)</option>
                <option value="DIHUBUNGI">Dihubungi (Sedang Komunikasi WA)</option>
                <option value="IKUT_PLACEMENT">Ikut Placement Test</option>
                <option value="DAFTAR">Daftar Resmi (Jadi Siswa)</option>
                <option value="BATAL">Batal / Tidak Berminat</option>
              </select>
            </div>

            <div>
              <label htmlFor="lead-notes-textarea" className="block text-xs font-bold text-[#1B2A41] mb-1">
                Catatan Hasil Konsultasi / Tindak Lanjut
              </label>
              <textarea
                id="lead-notes-textarea"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Misal: Tertarik paket 10 pertemuan kimia SMA, minta jadwal Sabtu sore..."
                className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#D5DDEB]">
              {selectedLead.status !== "DAFTAR" ? (
                <button
                  type="button"
                  onClick={() => handleConvertToStudent(selectedLead.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#09408C] hover:bg-[#EAF1FA] rounded-xl transition-colors cursor-pointer"
                >
                  <UserPlus size={14} />
                  <span>Jadikan Siswa</span>
                </button>
              ) : (
                <div></div>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedLead(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#5B6882] hover:bg-[#F4F7FB] rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleUpdateStatus}
                  disabled={isUpdating}
                  className="px-4 py-2 text-xs font-semibold bg-[#09408C] text-white hover:bg-[#0E3571] rounded-xl transition-colors disabled:opacity-50"
                >
                  {isUpdating ? "Menyimpan..." : "Simpan Status"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
