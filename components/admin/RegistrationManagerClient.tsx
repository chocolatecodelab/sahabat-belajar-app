"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import {
  GraduationCap,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Eye,
  MessageSquare,
  Download,
  Trash2,
  RefreshCw,
  X,
  ExternalLink,
  CreditCard,
  Building2,
  DollarSign,
  Users,
  Check,
  Calendar,
  ArrowUpRight,
  School,
  User,
  Copy,
  TrendingUp,
} from "lucide-react";
import {
  updateRegistrationStatus,
  deleteRegistration,
  type RegistrationItem,
} from "@/actions/pendaftaran";

interface RegistrationManagerClientProps {
  initialData: {
    data: RegistrationItem[];
    total: number;
    summary: {
      totalRegistrations: number;
      pendingPayment: number;
      paymentUploaded: number;
      verified: number;
      totalRevenue: number;
    };
  };
}

export default function RegistrationManagerClient({ initialData }: RegistrationManagerClientProps) {
  const [registrations, setRegistrations] = useState<RegistrationItem[]>(initialData.data);
  const [summary, setSummary] = useState(initialData.summary);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  // Detail Modal State
  const [selectedItem, setSelectedItem] = useState<RegistrationItem | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [copiedInvoice, setCopiedInvoice] = useState(false);

  // Delete modal
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredItems = registrations.filter((item) => {
    const matchesStatus = selectedStatus === "ALL" || item.status === selectedStatus;
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.email.toLowerCase().includes(search.toLowerCase()) ||
      item.phone.includes(search) ||
      item.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      item.institution.toLowerCase().includes(search.toLowerCase()) ||
      item.courseTitle.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleOpenDetail = (item: RegistrationItem) => {
    setSelectedItem(item);
    setAdminNotes(item.adminNotes || "");
  };

  const handleStatusChange = async (
    id: string,
    newStatus: "PENDING_PAYMENT" | "PAYMENT_UPLOADED" | "VERIFIED" | "REJECTED" | "CANCELLED",
    notes?: string
  ) => {
    setIsUpdating(true);
    try {
      const res = await updateRegistrationStatus(id, newStatus, notes);
      if (res.success) {
        setRegistrations((prev) =>
          prev.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: newStatus,
                  adminNotes: notes !== undefined ? notes : r.adminNotes,
                  verifiedAt: newStatus === "VERIFIED" ? new Date().toISOString() : r.verifiedAt,
                }
              : r
          )
        );

        if (selectedItem?.id === id) {
          setSelectedItem((prev) =>
            prev
              ? {
                  ...prev,
                  status: newStatus,
                  adminNotes: notes !== undefined ? notes : prev.adminNotes,
                }
              : null
          );
        }
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await deleteRegistration(id);
      if (res.success) {
        setRegistrations((prev) => prev.filter((r) => r.id !== id));
        if (selectedItem?.id === id) setSelectedItem(null);
        setDeleteId(null);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCSV = () => {
    if (filteredItems.length === 0) return;

    const headers = [
      "No Invoice",
      "Program Kelas",
      "Nama Peserta",
      "Email",
      "WhatsApp",
      "Institusi",
      "Jenjang",
      "Total Biaya",
      "Metode Pembayaran",
      "Status",
      "Tanggal Daftar",
    ];

    const rows = filteredItems.map((r) => [
      `"${r.invoiceNumber}"`,
      `"${r.courseTitle}"`,
      `"${r.name}"`,
      `"${r.email}"`,
      `"${r.phone}"`,
      `"${r.institution}"`,
      `"${r.educationLevel}"`,
      r.totalAmount,
      `"${r.paymentMethod}"`,
      `"${r.status}"`,
      `"${new Date(r.createdAt).toLocaleDateString("id-ID")}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Data_Pendaftaran_BIAS_RISTEK_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyInvoice = (inv: string) => {
    navigator.clipboard.writeText(inv);
    setCopiedInvoice(true);
    setTimeout(() => setCopiedInvoice(false), 2000);
  };

  return (
    <div className="space-y-6 font-[var(--font-body)] animate-fade-in text-slate-800">
      {/* 1. Header Banner - Academic Innovation Level 1 Elevation */}
      <div
        className="elevation-1 rounded-2xl p-6 sm:p-7 bg-white border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0px_4px_20px_rgba(11,44,107,0.04)]"
        style={{
          borderTop: "4px solid var(--color-primary)",
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xs shrink-0"
            style={{
              background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
              color: "var(--color-primary)",
            }}
          >
            <GraduationCap size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold font-[var(--font-heading)] text-slate-900 tracking-tight">
                Pusat Pendaftaran & Transaksi
              </h1>
              <span
                className="text-xs font-bold px-2.5 py-0.5 rounded-full uppercase"
                style={{
                  background: "var(--color-secondary-container)",
                  color: "var(--color-on-secondary-container)",
                }}
              >
                {summary.totalRegistrations} Tiket
              </span>
            </div>
            <p className="text-sm text-slate-500 font-normal mt-1 leading-relaxed">
              Verifikasi bukti transfer QRIS/Bank, kelola progres bimbingan, dan data calon peneliti
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-2xs self-start md:self-center transition-all hover:border-slate-300"
        >
          <Download size={16} className="text-slate-500" />
          <span>Ekspor Laporan (CSV)</span>
        </button>
      </div>

      {/* 2. Executive Stat Cards - Academic Innovation Tokens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Pendaftar */}
        <div className="elevation-1 rounded-2xl p-5 bg-white border border-slate-200/80 flex flex-col justify-between space-y-3 shadow-[0px_4px_20px_rgba(11,44,107,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Pendaftar
            </span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Users size={18} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold font-[var(--font-heading)] text-slate-900 tabular-nums">
              {summary.totalRegistrations}
            </div>
            <span className="text-3xs text-slate-400 font-medium mt-0.5 block">Semua program kelas</span>
          </div>
        </div>

        {/* Card 2: Belum Bayar */}
        <div className="elevation-1 rounded-2xl p-5 bg-white border border-slate-200/80 flex flex-col justify-between space-y-3 shadow-[0px_4px_20px_rgba(11,44,107,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Belum Bayar
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <CreditCard size={18} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold font-[var(--font-heading)] text-amber-700 tabular-nums">
              {summary.pendingPayment}
            </div>
            <span className="text-3xs text-amber-600/80 font-medium mt-0.5 block">Menunggu transfer peserta</span>
          </div>
        </div>

        {/* Card 3: Perlu Verifikasi (Highlighted Active Task) */}
        <div
          className="elevation-1 rounded-2xl p-5 bg-blue-50/50 border border-blue-200/80 flex flex-col justify-between space-y-3 shadow-[0px_4px_20px_rgba(11,44,107,0.06)] relative overflow-hidden"
          style={{ borderTop: "3px solid #1d4ed8" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
              Perlu Verifikasi
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <Clock size={18} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold font-[var(--font-heading)] text-blue-900 tabular-nums flex items-baseline gap-2">
              <span>{summary.paymentUploaded}</span>
              {summary.paymentUploaded > 0 && (
                <span className="text-3xs font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white animate-pulse">
                  Action Required
                </span>
              )}
            </div>
            <span className="text-3xs text-blue-700/80 font-medium mt-0.5 block">Bukti transfer sudah diunggah</span>
          </div>
        </div>

        {/* Card 4: Lunas & Terverifikasi */}
        <div className="elevation-1 rounded-2xl p-5 bg-white border border-slate-200/80 flex flex-col justify-between space-y-3 shadow-[0px_4px_20px_rgba(11,44,107,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Lunas & Terdaftar
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold font-[var(--font-heading)] text-emerald-700 tabular-nums">
              {summary.verified}
            </div>
            <span className="text-3xs text-emerald-600/80 font-medium mt-0.5 block">Peserta resmi terdaftar</span>
          </div>
        </div>

        {/* Card 5: Total Omset */}
        <div className="elevation-1 rounded-2xl p-5 bg-white border border-slate-200/80 flex flex-col justify-between space-y-3 shadow-[0px_4px_20px_rgba(11,44,107,0.03)] col-span-1 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Omset
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold font-[var(--font-heading)] text-slate-900 tabular-nums truncate">
              Rp {summary.totalRevenue.toLocaleString("id-ID")}
            </div>
            <span className="text-3xs text-slate-400 font-medium mt-0.5 block">Transaksi terverifikasi</span>
          </div>
        </div>
      </div>

      {/* 3. Filter & Search Controls */}
      <div
        className="elevation-1 rounded-2xl p-4 bg-white border border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0px_4px_20px_rgba(11,44,107,0.03)]"
      >
        {/* Status Filter Tabs using Lucide Icons */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setSelectedStatus("ALL")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedStatus === "ALL"
                ? "bg-[var(--color-primary)] text-white shadow-xs"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60"
            }`}
          >
            Semua Status
          </button>

          <button
            type="button"
            onClick={() => setSelectedStatus("PAYMENT_UPLOADED")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              selectedStatus === "PAYMENT_UPLOADED"
                ? "bg-[var(--color-primary)] text-white shadow-xs"
                : "bg-blue-50/70 text-blue-800 hover:bg-blue-100/70 border border-blue-200/70"
            }`}
          >
            <Clock size={13} />
            <span>Perlu Verifikasi</span>
            {summary.paymentUploaded > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-3xs font-extrabold">
                {summary.paymentUploaded}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setSelectedStatus("VERIFIED")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              selectedStatus === "VERIFIED"
                ? "bg-[var(--color-primary)] text-white shadow-xs"
                : "bg-emerald-50/70 text-emerald-800 hover:bg-emerald-100/70 border border-emerald-200/70"
            }`}
          >
            <CheckCircle2 size={13} />
            <span>Lunas</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedStatus("PENDING_PAYMENT")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              selectedStatus === "PENDING_PAYMENT"
                ? "bg-[var(--color-primary)] text-white shadow-xs"
                : "bg-amber-50/70 text-amber-800 hover:bg-amber-100/70 border border-amber-200/70"
            }`}
          >
            <AlertCircle size={13} />
            <span>Belum Bayar</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedStatus("REJECTED")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              selectedStatus === "REJECTED"
                ? "bg-[var(--color-primary)] text-white shadow-xs"
                : "bg-rose-50/70 text-rose-800 hover:bg-rose-100/70 border border-rose-200/70"
            }`}
          >
            <XCircle size={13} />
            <span>Ditolak</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari invoice / nama / kampus..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus-ring bg-white font-medium"
          />
        </div>
      </div>

      {/* 4. Transactions Data Table */}
      <div
        className="elevation-1 rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-[0px_4px_20px_rgba(11,44,107,0.03)]"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Invoice</th>
                <th className="py-3.5 px-4">Calon Peneliti</th>
                <th className="py-3.5 px-4">Program Riset</th>
                <th className="py-3.5 px-4">Total Biaya</th>
                <th className="py-3.5 px-4">Metode & Bukti</th>
                <th className="py-3.5 px-4">Status Transaksi</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <GraduationCap size={40} className="text-slate-300" />
                      <p className="font-semibold text-slate-600">Tidak ada data pendaftaran ditemukan</p>
                      <p className="text-xs text-slate-400">Coba ubah kata kunci pencarian atau filter status di atas</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const waUrl = `https://wa.me/${item.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                    `Halo Bapak/Ibu *${item.name}*, kami dari BIAS RISTEK mengonfirmasi pendaftaran program *${item.courseTitle}* (Invoice: *${item.invoiceNumber}*).`
                  )}`;

                  return (
                    <tr
                      key={item.id}
                      onClick={() => handleOpenDetail(item)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-xs text-slate-900 block">
                          {item.invoiceNumber}
                        </span>
                        <span className="text-3xs text-slate-400">
                          {new Date(item.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 truncate max-w-xs">{item.name}</p>
                        <p className="text-xs text-slate-500 truncate">{item.institution} • {item.educationLevel}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800 truncate max-w-xs">{item.courseTitle}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <strong className="text-xs font-extrabold text-slate-900 tabular-nums">
                          Rp {item.totalAmount.toLocaleString("id-ID")}
                        </strong>
                        {item.uniqueCode > 0 && (
                          <span className="text-3xs text-slate-400 block font-mono">Kode: {item.uniqueCode}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md text-3xs font-bold bg-slate-100 text-slate-700 uppercase">
                            {item.paymentMethod}
                          </span>
                          {item.paymentProof ? (
                            <span className="px-2 py-0.5 rounded-md text-3xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              Struk Ada
                            </span>
                          ) : (
                            <span className="text-3xs text-slate-400">Tanpa Struk</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {item.status === "VERIFIED" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={13} />
                            <span>Lunas</span>
                          </span>
                        )}
                        {item.status === "PAYMENT_UPLOADED" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
                            <Clock size={13} />
                            <span>Perlu Verifikasi</span>
                          </span>
                        )}
                        {item.status === "PENDING_PAYMENT" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertCircle size={13} />
                            <span>Belum Bayar</span>
                          </span>
                        )}
                        {item.status === "REJECTED" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle size={13} />
                            <span>Ditolak</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 text-emerald-700 transition-colors"
                            title="Chat WhatsApp Resmi"
                          >
                            <MessageSquare size={14} />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(item)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-300 text-blue-900 transition-colors"
                            title="Detail & Verifikasi"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteId(item.id)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:border-rose-300 text-rose-600 transition-colors"
                            title="Hapus"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Verification Drawer / Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div
            className="elevation-2 rounded-2xl bg-white w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 shadow-2xl"
            style={{
              borderTop: "4px solid var(--color-primary)",
            }}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-bold text-lg text-slate-900 font-[var(--font-heading)]">
                  Detail & Verifikasi Pendaftaran
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-mono text-slate-500">{selectedItem.invoiceNumber}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyInvoice(selectedItem.invoiceNumber)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded"
                    title="Salin No Invoice"
                  >
                    {copiedInvoice ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Status Header Banner */}
              <div
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  selectedItem.status === "VERIFIED"
                    ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                    : selectedItem.status === "PAYMENT_UPLOADED"
                    ? "bg-blue-50/80 border-blue-200 text-blue-950"
                    : "bg-amber-50/80 border-amber-200 text-amber-950"
                }`}
              >
                <div>
                  <span className="text-3xs font-extrabold uppercase text-slate-500 block">Status Transaksi</span>
                  <strong className="text-base font-extrabold">
                    {selectedItem.status === "VERIFIED"
                      ? "Lunas & Terverifikasi"
                      : selectedItem.status === "PAYMENT_UPLOADED"
                      ? "Menunggu Verifikasi Struk"
                      : "Belum Melakukan Pembayaran"}
                  </strong>
                </div>

                <div className="flex items-center gap-2">
                  {selectedItem.status !== "VERIFIED" && (
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleStatusChange(selectedItem.id, "VERIFIED", adminNotes)}
                      className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs flex items-center gap-1.5 transition-all"
                    >
                      <CheckCircle2 size={14} />
                      <span>Verifikasi Lunas</span>
                    </button>
                  )}

                  {selectedItem.status !== "REJECTED" && (
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleStatusChange(selectedItem.id, "REJECTED", adminNotes)}
                      className="px-3 py-2 rounded-lg text-xs font-bold text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 flex items-center gap-1 transition-all"
                    >
                      <XCircle size={14} /> Tolak
                    </button>
                  )}
                </div>
              </div>

              {/* Biodata & Receipt Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Biodata Box */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5 text-xs">
                  <h4 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-1.5">
                    Biodata Peserta
                  </h4>
                  <div>
                    <span className="text-slate-400 block font-medium">Nama Lengkap (Sertifikat):</span>
                    <p className="font-bold text-slate-900">{selectedItem.name}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Email:</span>
                    <p className="font-semibold text-slate-800">{selectedItem.email}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">WhatsApp:</span>
                    <p className="font-bold text-emerald-800">{selectedItem.phone}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Asal Kampus / Instansi:</span>
                    <p className="font-semibold text-slate-800">{selectedItem.institution}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Jenjang Studi:</span>
                    <p className="font-semibold text-slate-800">{selectedItem.educationLevel}</p>
                  </div>
                </div>

                {/* Proof Image Box */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5 text-xs">
                  <h4 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-1.5">
                    Bukti Transfer Struk
                  </h4>
                  {selectedItem.paymentProof ? (
                    <div className="space-y-2">
                      <div className="w-full aspect-video rounded-lg overflow-hidden relative border border-slate-200 bg-black/5">
                        <Image src={selectedItem.paymentProof} alt="Bukti Transfer" fill className="object-contain" />
                      </div>
                      <a
                        href={selectedItem.paymentProof}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-3xs font-bold text-blue-900 hover:underline"
                      >
                        <ExternalLink size={11} /> Buka Gambar Resolusi Penuh
                      </a>
                    </div>
                  ) : (
                    <div className="h-32 flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-300 rounded-lg">
                      <AlertCircle size={24} className="mb-1 text-slate-300" />
                      <span>Belum ada bukti diunggah</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Research Topic & Admin Notes */}
              <div className="space-y-3 text-xs">
                {selectedItem.researchTopic && (
                  <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/40">
                    <span className="text-blue-900 font-bold block mb-1">Topik / Kendala Riset Calon Peserta:</span>
                    <p className="font-medium text-slate-800 leading-relaxed">{selectedItem.researchTopic}</p>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold block mb-1 text-slate-900">
                    Catatan Internal Tim Mentor / Admin
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={2}
                    placeholder="Contoh: Sudah dikirimkan link Zoom & materi Batch 14 via WhatsApp..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus-ring bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <a
                href={`https://wa.me/${selectedItem.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                  `Halo Bapak/Ibu *${selectedItem.name}*, kami dari BIAS RISTEK mengonfirmasi pendaftaran program *${selectedItem.courseTitle}* (Invoice: *${selectedItem.invoiceNumber}*).`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
              >
                <MessageSquare size={14} />
                <span>Kirim WhatsApp Resmi</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleStatusChange(selectedItem.id, selectedItem.status, adminNotes)}
                  className="px-4 py-2 rounded-lg text-white text-xs font-bold shadow-xs transition-all"
                  style={{ background: "var(--color-primary)" }}
                >
                  {isUpdating ? "Menyimpan..." : "Simpan Catatan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="elevation-2 rounded-2xl bg-white p-6 max-w-sm w-full space-y-4 border border-slate-200 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div className="text-center">
              <h4 className="text-base font-bold text-slate-900 font-[var(--font-heading)]">Hapus Data Pendaftaran?</h4>
              <p className="text-xs text-slate-500 mt-1">
                Data pendaftaran dan riwayat invoice ini akan dihapus secara permanen.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                disabled={isDeleting}
                className="flex-1 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                {isDeleting ? <RefreshCw size={14} className="animate-spin" /> : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
