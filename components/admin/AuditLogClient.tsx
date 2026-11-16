"use client";

import { useState } from "react";
import {
  ShieldAlert,
  Search,
  Download,
  RotateCcw,
  Clock,
  User,
  Activity,
  Layers,
  AlertTriangle,
  CheckCircle2,
  FileEdit,
  Trash2,
  Power,
  Plus,
} from "lucide-react";
import type { AuditLogEntry, AuditActionType, AuditEntityType } from "@/lib/audit";
import PengaturanTabs from "./PengaturanTabs";

function getActionBadge(action: AuditActionType) {
  switch (action) {
    case "CREATE":
      return {
        label: "Tambah",
        bg: "bg-[#E3F4EC] text-[#1F6F4A] border-[#1F6F4A]/25",
        icon: Plus,
      };
    case "UPDATE":
      return {
        label: "Ubah",
        bg: "bg-[#EAF1FA] text-[#09408C] border-[#9AC1E2]",
        icon: FileEdit,
      };
    case "STATUS_CHANGE":
      return {
        label: "Status",
        bg: "bg-[#FEF7E6] text-[#B45309] border-[#F5B82E]",
        icon: Power,
      };
    case "DELETE":
      return {
        label: "Hapus",
        bg: "bg-[#FBE9E5] text-[#B4381F] border-[#B4381F]/25",
        icon: Trash2,
      };
    default:
      return {
        label: action,
        bg: "bg-[#F4F7FB] text-[#5B6882] border-[#D5DDEB]",
        icon: Activity,
      };
  }
}

export default function AuditLogClient({
  initialLogs = [],
}: {
  initialLogs: AuditLogEntry[];
}) {
  const [logs] = useState<AuditLogEntry[]>(initialLogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntity, setSelectedEntity] = useState("ALL");
  const [selectedAction, setSelectedAction] = useState("ALL");

  const filteredLogs = logs.filter((log) => {
    if (selectedEntity !== "ALL" && log.entity !== selectedEntity) {
      return false;
    }
    if (selectedAction !== "ALL" && log.action !== selectedAction) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTarget = (log.targetName || "").toLowerCase().includes(q);
      const matchDetails = (log.details || "").toLowerCase().includes(q);
      const matchActor = (log.actorName || "").toLowerCase().includes(q);
      return matchTarget || matchDetails || matchActor;
    }
    return true;
  });

  const createCount = logs.filter((l) => l.action === "CREATE").length;
  const updateCount = logs.filter((l) => l.action === "UPDATE").length;
  const statusChangeCount = logs.filter(
    (l) => l.action === "STATUS_CHANGE" || l.action === "DELETE"
  ).length;

  const exportToCsv = () => {
    if (filteredLogs.length === 0) return;
    const header = "Waktu (WITA),Pengguna / Aktor,Peran,Tipe Aksi,Entitas,Target,Detail Mutasi\n";
    const rows = filteredLogs
      .map((l) => {
        const time = new Date(l.timestamp).toLocaleString("id-ID", {
          timeZone: "Asia/Makassar",
        });
        const actor = (l.actorName || "").replace(/"/g, '""');
        const role = l.actorRole || "-";
        const action = l.action || "-";
        const entity = l.entity || "-";
        const target = (l.targetName || "").replace(/"/g, '""');
        const details = (l.details || "").replace(/"/g, '""');
        return `"${time}","${actor}","${role}","${action}","${entity}","${target}","${details}"`;
      })
      .join("\n");

    const blob = new Blob(["\uFEFF" + header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `audit-trail-log-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigasi Pengaturan Mobile */}
      <PengaturanTabs />

      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EAF1FA] text-[#09408C] border border-[#9AC1E2]">
              Tata Kelola & Keamanan
            </span>
            <span className="text-xs text-[#5B6882]">Histori Mutasi Terkunci (Read-Only)</span>
          </div>
          <h1 className="text-2xl font-bold text-[#09408C] font-display flex items-center gap-2.5">
            <ShieldAlert size={26} className="text-[#09408C]" />
            <span>Audit Trail & Rekam Jejak Sistem</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#5B6882] mt-0.5">
            Log transparansi riwayat penambahan, modifikasi, dan penonaktifan data master secara real-time.
          </p>
        </div>

        <button
          onClick={exportToCsv}
          disabled={filteredLogs.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D5DDEB] bg-white text-[#09408C] text-xs font-bold hover:bg-[#EAF1FA] transition-colors shadow-2xs shrink-0 self-start sm:self-auto disabled:opacity-50"
        >
          <Download size={15} />
          <span>Ekspor Log CSV</span>
        </button>
      </div>

      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-[#D5DDEB] shadow-2xs">
          <div className="text-[11px] text-[#5B6882] font-semibold uppercase">Total Aktivitas</div>
          <div className="text-xl font-bold text-[#09408C] font-display mt-1">{logs.length}</div>
          <div className="text-[10px] text-[#5B6882] mt-0.5">Catatan audit tersimpan</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#D5DDEB] shadow-2xs">
          <div className="text-[11px] text-[#5B6882] font-semibold uppercase">Data Baru Dibuat</div>
          <div className="text-xl font-bold text-[#1F6F4A] font-display mt-1">{createCount}</div>
          <div className="text-[10px] text-[#1F6F4A] mt-0.5">Aksi penambahan (CREATE)</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#D5DDEB] shadow-2xs">
          <div className="text-[11px] text-[#5B6882] font-semibold uppercase">Data Dimodifikasi</div>
          <div className="text-xl font-bold text-[#09408C] font-display mt-1">{updateCount}</div>
          <div className="text-[10px] text-[#09408C] mt-0.5">Aksi perubahan profil / tarif</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#D5DDEB] shadow-2xs">
          <div className="text-[11px] text-[#5B6882] font-semibold uppercase">Status / Soft Delete</div>
          <div className="text-xl font-bold text-[#B45309] font-display mt-1">
            {statusChangeCount}
          </div>
          <div className="text-[10px] text-[#B45309] mt-0.5">Proteksi data historis</div>
        </div>
      </div>

      {/* 3. Filter & Search Toolbar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-[#D5DDEB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Entity Filter */}
          <select
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-[#D5DDEB] bg-white text-[#1B2A41] font-semibold focus-ring"
          >
            <option value="ALL">Semua Entitas</option>
            <option value="Siswa">Siswa</option>
            <option value="Tutor">Tutor</option>
            <option value="Paket">Paket Belajar</option>
            <option value="Program">Program Bimbingan</option>
            <option value="FAQ">FAQ Konten</option>
            <option value="Jadwal">Jadwal & Sesi</option>
            <option value="Pembayaran">Pembayaran</option>
            <option value="Sistem">Sistem</option>
          </select>

          {/* Action Filter */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {["ALL", "CREATE", "UPDATE", "STATUS_CHANGE", "DELETE"].map((act) => (
              <button
                key={act}
                onClick={() => setSelectedAction(act)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedAction === act
                    ? "bg-[#09408C] text-white shadow-2xs"
                    : "bg-[#F4F7FB] text-[#5B6882] hover:bg-[#EAF1FA]"
                }`}
              >
                {act === "ALL"
                  ? "Semua Aksi"
                  : act === "STATUS_CHANGE"
                  ? "Status"
                  : act}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search size={15} className="absolute left-3 top-2.5 text-[#5B6882]" />
          <input
            type="text"
            placeholder="Cari target, aktor, atau detail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#D5DDEB] focus-ring bg-white"
          />
        </div>
      </div>

      {/* 4. Log List (Mobile Cards + Desktop Table) */}
      <div className="bg-white rounded-2xl border border-[#D5DDEB] shadow-xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF1FA] text-[#09408C] flex items-center justify-center mx-auto">
              <Activity size={22} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#1B2A41]">Tidak Ada Log yang Sesuai</h3>
              <p className="text-xs text-[#5B6882] mt-0.5">
                Coba sesuaikan kata kunci pencarian atau ubah filter entitas dan aksi.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedEntity("ALL");
                setSelectedAction("ALL");
                setSearchQuery("");
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EAF1FA] text-[#09408C] text-xs font-bold hover:bg-[#9AC1E2]/40 transition-colors"
            >
              <RotateCcw size={13} />
              <span>Reset Filter</span>
            </button>
          </div>
        ) : (
          <>
            {/* Mobile Cards (sm:hidden) */}
            <div className="sm:hidden divide-y divide-[#D5DDEB]">
              {filteredLogs.map((log) => {
                const badge = getActionBadge(log.action);
                const ActionIcon = badge.icon;
                const formattedDate = new Date(log.timestamp).toLocaleString("id-ID", {
                  dateStyle: "medium",
                  timeStyle: "short",
                });

                return (
                  <div key={log.id} className="p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.bg}`}>
                          <ActionIcon size={11} />
                          <span>{badge.label}</span>
                        </span>
                        <span className="font-bold text-xs text-[#09408C] bg-[#EAF1FA] px-2 py-0.5 rounded-md">
                          {log.entity}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#5B6882] flex items-center gap-1 shrink-0">
                        <Clock size={11} />
                        <span>{formattedDate}</span>
                      </span>
                    </div>

                    <div>
                      <div className="font-bold text-sm text-[#1B2A41]">{log.targetName}</div>
                      <div className="text-xs text-[#5B6882] mt-1 leading-relaxed bg-[#F4F7FB] p-2.5 rounded-xl border border-[#D5DDEB]">
                        {log.details}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#5B6882] pt-1">
                      <div className="flex items-center gap-1.5">
                        <User size={12} className="text-[#09408C]" />
                        <span className="font-medium text-[#1B2A41]">{log.actorName}</span>
                        <span className="text-[10px] bg-[#D5DDEB]/50 px-1.5 py-0.2 rounded font-semibold">
                          {log.actorRole}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-[#5B6882]/70">
                        ID: {log.id.substring(0, 12)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table (hidden sm:block) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F4F7FB] border-b border-[#D5DDEB] text-[#5B6882] font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Waktu (WITA)</th>
                    <th className="py-3 px-4">Aksi & Entitas</th>
                    <th className="py-3 px-4">Target / Objek</th>
                    <th className="py-3 px-4">Detail Mutasi</th>
                    <th className="py-3 px-4">Aktor / Pengguna</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D5DDEB]">
                  {filteredLogs.map((log) => {
                    const badge = getActionBadge(log.action);
                    const ActionIcon = badge.icon;
                    const dateObj = new Date(log.timestamp);
                    const formattedDate = dateObj.toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    });
                    const formattedTime = dateObj.toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <tr key={log.id} className="hover:bg-[#EAF1FA]/40 transition-colors">
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-semibold text-[#1B2A41]">{formattedTime}</div>
                          <div className="text-[11px] text-[#5B6882]">{formattedDate}</div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.bg}`}>
                              <ActionIcon size={11} />
                              <span>{badge.label}</span>
                            </span>
                            <span className="font-semibold text-[#09408C] bg-[#EAF1FA] px-2 py-0.5 rounded-md">
                              {log.entity}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#1B2A41]">{log.targetName}</div>
                          {log.targetId && (
                            <div className="text-[10px] text-[#5B6882] font-mono mt-0.5">
                              ID: {log.targetId}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-[#5B6882] max-w-md">
                          <div className="line-clamp-2 leading-relaxed">{log.details}</div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-semibold text-[#1B2A41] flex items-center gap-1">
                            <User size={12} className="text-[#09408C]" />
                            <span>{log.actorName}</span>
                          </div>
                          <div className="text-[11px] text-[#5B6882]">{log.actorRole}</div>
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
    </div>
  );
}
