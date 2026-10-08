"use client";

import { useState } from "react";
import {
  Headphones,
  Search,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  RefreshCw,
  ExternalLink,
  Bot,
  User,
  X,
  FileText,
  UserCheck,
  Check,
  RotateCcw,
} from "lucide-react";
import {
  getSupportTickets,
  updateTicketStatus,
  reactivateAiBot,
  type SupportTicketItem,
} from "@/actions/support";

interface Props {
  initialTickets: SupportTicketItem[];
  initialMetrics: {
    waitingAdmin: number;
    inProgress: number;
    resolved: number;
    activeHandoffs: number;
    totalTickets: number;
  };
}

export default function SupportTicketsClient({ initialTickets, initialMetrics }: Props) {
  const [tickets, setTickets] = useState<SupportTicketItem[]>(initialTickets);
  const [metrics, setMetrics] = useState(initialMetrics);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal for Conversation Log
  const [selectedTicketForLog, setSelectedTicketForLog] = useState<SupportTicketItem | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const refreshed = await getSupportTickets();
      setTickets(refreshed);
      setMetrics({
        waitingAdmin: refreshed.filter((t) => t.status === "WAITING_ADMIN").length,
        inProgress: refreshed.filter((t) => t.status === "IN_PROGRESS").length,
        resolved: refreshed.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED").length,
        activeHandoffs: refreshed.filter((t) => t.handoffActive).length,
        totalTickets: refreshed.length,
      });
    } catch (err) {
      console.error("Failed to refresh tickets:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleUpdateStatus = async (
    ticketId: string,
    newStatus: "IN_PROGRESS" | "RESOLVED" | "CLOSED",
    adminNotes?: string
  ) => {
    setActionLoadingId(ticketId);
    try {
      const res = await updateTicketStatus({
        ticketId,
        status: newStatus,
        adminNotes,
        adminName: "Admin CS Senior",
      });

      if (res.success) {
        await refreshData();
      } else {
        alert(res.message);
      }
    } catch {
      alert("Terjadi kesalahan sistem saat memperbarui status tiket.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReactivateBot = async (ticketId: string) => {
    setActionLoadingId(ticketId);
    try {
      const res = await reactivateAiBot(ticketId);
      if (res.success) {
        await refreshData();
        alert("Bot AI berhasil diaktifkan kembali untuk kontak ini.");
      } else {
        alert(res.message);
      }
    } catch {
      alert("Terjadi kesalahan sistem saat mengaktifkan bot.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
    if (sourceFilter !== "ALL" && t.source !== sourceFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = t.customerName.toLowerCase().includes(q);
      const matchNumber = t.ticketNumber.toLowerCase().includes(q);
      const matchPhone = t.customerPhone.includes(q);
      const matchSummary = t.summary.toLowerCase().includes(q);
      return matchName || matchNumber || matchPhone || matchSummary;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#001847] font-display">
              Layanan CS & Tiket Human Handoff
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fdbc13]/20 text-[#7a5900] border border-[#fdbc13]/40">
              Bot AI + Human in the Loop
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Monitoring eskalasi chat WhatsApp & Web: bot otomatis dijeda agar konsultasi riset ditangani staf ahli.
          </p>
        </div>

        <button
          type="button"
          onClick={refreshData}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-white border border-[#e2e8f0] rounded-lg text-slate-700 hover:bg-slate-50 shadow-sm transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#001847]" : ""}`} />
          <span>Perbarui Antrean</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500" />
          <span className="text-xs font-medium text-slate-500 block uppercase tracking-wider">
            Menunggu Admin CS
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-[#001847] font-display">
              {metrics.waitingAdmin}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
              Prioritas Tindakan
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
          <span className="text-xs font-medium text-slate-500 block uppercase tracking-wider">
            Sedang Ditangani Staf
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-[#001847] font-display">
              {metrics.inProgress}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              In Progress
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
          <span className="text-xs font-medium text-slate-500 block uppercase tracking-wider">
            Tiket Terselesaikan
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-[#001847] font-display">
              {metrics.resolved}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Tuntas
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#fdbc13]" />
          <span className="text-xs font-medium text-slate-500 block uppercase tracking-wider">
            Handoff Aktif (Bot Dijeda)
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold text-[#001847] font-display">
              {metrics.activeHandoffs}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
              Human Only
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari tiket, nama, nomor WA, kendala..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#e2e8f0] rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#001847]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
          {(["ALL", "WAITING_ADMIN", "IN_PROGRESS", "RESOLVED"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === st
                  ? "bg-[#001847] text-white"
                  : "bg-white text-slate-600 border border-[#e2e8f0] hover:bg-slate-50"
              }`}
            >
              {st === "ALL"
                ? "Semua Tiket"
                : st === "WAITING_ADMIN"
                ? "Menunggu Admin"
                : st === "IN_PROGRESS"
                ? "Sedang Ditangani"
                : "Selesai"}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] shadow-sm overflow-hidden">
        {filteredTickets.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="font-semibold text-slate-800">Tidak Ada Tiket pada Kategori Ini</p>
            <p className="text-xs mt-1">Seluruh eskalasi pertanyaan dan konsultasi riset telah tuntas tertangani.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#e2e8f0]">
            {filteredTickets.map((t) => (
              <div
                key={t.id}
                className="p-5 flex flex-col lg:flex-row lg:items-start justify-between gap-4 hover:bg-slate-50/70 transition"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Status Badge */}
                    {t.status === "WAITING_ADMIN" && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-rose-600" />
                        Menunggu Admin
                      </span>
                    )}
                    {t.status === "IN_PROGRESS" && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                        <User className="w-3 h-3 text-blue-600" />
                        Sedang Ditangani
                      </span>
                    )}
                    {(t.status === "RESOLVED" || t.status === "CLOSED") && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Selesai
                      </span>
                    )}

                    {/* Handoff Active Badge */}
                    {t.handoffActive && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#fdbc13]/20 text-[#7a5900] border border-[#fdbc13]/40">
                        Bot Dijeda
                      </span>
                    )}

                    <span className="font-mono text-xs font-bold text-[#001847]">
                      {t.ticketNumber}
                    </span>

                    <span className="text-xs text-slate-400">•</span>

                    <span className="text-xs font-semibold text-slate-900">
                      {t.customerName}
                    </span>

                    <span className="text-xs text-slate-500">
                      (+{t.customerPhone})
                    </span>

                    <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {t.source}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 bg-[#f8f9ff] p-3 rounded-lg border border-[#d5e3fc]">
                    <span className="font-semibold text-[#001847]">Pemicu Handoff:</span>{" "}
                    <span className="font-medium text-slate-800">{t.triggerReason}</span>
                    <span className="block mt-1 text-slate-600">
                      <strong>Ringkasan:</strong> {t.summary}
                    </span>
                  </p>

                  <div className="text-xs text-slate-500 italic bg-white p-2.5 rounded-lg border border-slate-200">
                    &ldquo;{t.lastUserMessage}&rdquo;
                  </div>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-0.5">
                    <span>Dibuat: {new Date(t.createdAt).toLocaleString("id-ID")}</span>
                    {t.assignedAdminName && <span>Staf: {t.assignedAdminName}</span>}
                    {t.adminNotes && <span className="text-slate-600">Catatan: {t.adminNotes}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap lg:flex-col lg:items-end">
                  {/* WhatsApp Quick Action */}
                  <a
                    href={`https://wa.me/${t.customerPhone}?text=${encodeURIComponent(
                      `Halo ${t.customerName}, saya dari Tim Konsultan Akademik Senior BIAS RISTEK menindaklanjuti Tiket Anda #${t.ticketNumber}. Terkait konsultasi: "${t.summary.slice(0, 80)}", ada yang bisa kami bantu secara langsung?`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      if (t.status === "WAITING_ADMIN") {
                        handleUpdateStatus(t.id, "IN_PROGRESS", "Sedang dihubungi via WhatsApp.");
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Chat WhatsApp</span>
                  </a>

                  {/* Log Modal Trigger */}
                  {t.conversationLog && (
                    <button
                      type="button"
                      onClick={() => setSelectedTicketForLog(t)}
                      className="px-3 py-1.5 rounded-lg border border-[#001847] text-[#001847] hover:bg-blue-50 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Log Chat</span>
                    </button>
                  )}

                  {/* Mark as In Progress */}
                  {t.status === "WAITING_ADMIN" && (
                    <button
                      type="button"
                      disabled={actionLoadingId === t.id}
                      onClick={() => handleUpdateStatus(t.id, "IN_PROGRESS")}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 transition disabled:opacity-50"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Tandai Ditangani</span>
                    </button>
                  )}

                  {/* Mark as Resolved & Reactivate Bot */}
                  {t.status !== "RESOLVED" && t.status !== "CLOSED" && (
                    <button
                      type="button"
                      disabled={actionLoadingId === t.id}
                      onClick={() => handleReactivateBot(t.id)}
                      className="px-3 py-1.5 rounded-lg bg-[#001847] hover:bg-[#0b2c6b] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5 text-[#fdbc13]" />
                      <span>Selesai & Aktifkan Bot</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Conversation Log Modal */}
      {selectedTicketForLog && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="bg-[#001847] p-5 text-white flex items-center justify-between rounded-t-2xl">
              <div>
                <span className="text-xs font-semibold text-[#fdbc13] uppercase tracking-wider">
                  Riwayat Percakapan Chat
                </span>
                <h2 className="text-base font-bold font-display text-white mt-0.5">
                  Tiket #{selectedTicketForLog.ticketNumber} - {selectedTicketForLog.customerName}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicketForLog(null)}
                className="text-white/70 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-[#f8f9ff] p-3.5 rounded-xl border border-[#d5e3fc] text-xs space-y-1">
                <p>
                  <strong>Kendala Terdeteksi:</strong> {selectedTicketForLog.summary}
                </p>
                <p className="text-slate-500">
                  Sumber: {selectedTicketForLog.source} • WhatsApp: +{selectedTicketForLog.customerPhone}
                </p>
              </div>

              <div className="space-y-3 max-h-[50vh] overflow-y-auto p-2">
                {(() => {
                  try {
                    const logs = JSON.parse(selectedTicketForLog.conversationLog || "[]");
                    if (!Array.isArray(logs) || logs.length === 0) {
                      return <p className="text-xs text-slate-500">Tidak ada detail riwayat tersimpan.</p>;
                    }
                    return logs.map((m: any, idx: number) => {
                      const isUser = m.role === "user";
                      return (
                        <div
                          key={idx}
                          className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                        >
                          <span className="text-[10px] text-slate-400 font-mono mb-1">
                            {isUser ? selectedTicketForLog.customerName : "Dr. Ristek AI"}
                          </span>
                          <div
                            className={`p-3 rounded-xl max-w-[85%] text-xs leading-relaxed ${
                              isUser
                                ? "bg-[#001847] text-white"
                                : "bg-slate-100 text-slate-800 border border-slate-200"
                            }`}
                          >
                            {m.content}
                          </div>
                        </div>
                      );
                    });
                  } catch {
                    return (
                      <p className="text-xs text-slate-700 font-mono">
                        {selectedTicketForLog.conversationLog}
                      </p>
                    );
                  }
                })()}
              </div>
            </div>

            <div className="bg-slate-50 p-4 px-6 border-t border-[#e2e8f0] rounded-b-2xl flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedTicketForLog(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200"
              >
                Tutup
              </button>

              <a
                href={`https://wa.me/${selectedTicketForLog.customerPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Chat di WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
