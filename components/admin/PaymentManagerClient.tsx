"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  CreditCard,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  Calendar,
  Printer,
  Share2,
  X,
  ExternalLink,
  Download,
  Search,
  Clock,
  Filter,
  Eye,
} from "lucide-react";
import { recordManualPayment, updatePaymentStatus } from "@/actions/pembayaran";
import { PaymentStatus } from "@prisma/client";
import { formatDate } from "@/lib/date";
import { useToast } from "@/components/ui/Toast";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function PaymentManagerClient({
  initialPayments,
  studentPackages,
}: {
  initialPayments: any[];
  studentPackages: any[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const [payments, setPayments] = useState(initialPayments);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "LUNAS" | "BELUM" | "SEBAGIAN">("ALL");
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [previewProof, setPreviewProof] = useState<any | null>(null);
  const [confirmVerifyPayment, setConfirmVerifyPayment] = useState<any | null>(null);

  useEffect(() => {
    setPayments(initialPayments);
  }, [initialPayments]);

  // Form states
  const [studentPackageId, setStudentPackageId] = useState(
    studentPackages[0]?.id || ""
  );
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("TRANSFER_BANK");
  const [status, setStatus] = useState<PaymentStatus>("LUNAS");
  const [proofFile, setProofFile] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const pkgId = searchParams.get("packageId");
    const act = searchParams.get("action");
    if (pkgId) {
      const match = studentPackages.find((sp) => sp.id === pkgId);
      if (match) {
        setStudentPackageId(match.id);
        if (match.package?.price) {
          setAmount(String(match.package.price));
        }
      }
    }
    if (act === "record" || pkgId) {
      setShowAddModal(true);
    }
  }, [searchParams, studentPackages]);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentPackageId || !amount) return;
    setIsSubmitting(true);

    const res = await recordManualPayment({
      studentPackageId,
      amount: parseInt(amount) || 0,
      method,
      status,
      proofFile: proofFile || undefined,
      notes: notes || undefined,
    });
    setIsSubmitting(false);

    if (res.success) {
      toast.success("Pembayaran Dicatat", res.message);
      setShowAddModal(false);
      setAmount("");
      setProofFile("");
      setNotes("");
      router.refresh();
    } else {
      toast.error("Gagal Mencatat Pembayaran", res.message);
    }
  };

  const handleVerifyPayment = async (payment: any) => {
    setVerifyingId(payment.id);
    const res = await updatePaymentStatus(payment.id, "LUNAS");
    setVerifyingId(null);

    if (res.success) {
      toast.success("Pembayaran Diverifikasi", res.message);
      setPayments((prev) =>
        prev.map((item) =>
          item.id === payment.id
            ? {
                ...item,
                status: "LUNAS",
                notes:
                  typeof item.notes === "string"
                    ? item.notes.replace("[MENUNGGU VERIFIKASI]", "[TERVERIFIKASI ADMIN]")
                    : item.notes,
              }
            : item
        )
      );
      setConfirmVerifyPayment(null);
      router.refresh();
    } else {
      toast.error("Gagal Memverifikasi", res.message);
    }
  };

  const filteredPayments = payments.filter((p) => {
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchesStatus;
    const studentName = (p.studentPackage?.student?.name || "").toLowerCase();
    const pkgName = (p.studentPackage?.package?.name || "").toLowerCase();
    const notesText = (p.notes || "").toLowerCase();
    const methodText = (p.method || "").toLowerCase();
    return (
      matchesStatus &&
      (studentName.includes(q) ||
        pkgName.includes(q) ||
        notesText.includes(q) ||
        methodText.includes(q))
    );
  });

  const pendingVerificationCount = payments.filter(
    (p) => p.status !== "LUNAS"
  ).length;

  const getWhatsAppConfirmationUrl = (p: any) => {
    const phone = p.studentPackage?.student?.parentPhone || "";
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.startsWith("0") ? `62${cleanPhone.slice(1)}` : cleanPhone;
    const targetName =
      p.studentPackage?.student?.parentName ||
      p.studentPackage?.student?.name ||
      "Orang Tua/Wali";
    const pkgName = p.studentPackage?.package?.name || "Paket Belajar";
    const msg = `Halo ${targetName}, pembayaran bimbingan Sahabat Belajar untuk paket *${pkgName}* sebesar *Rp ${(p.amount || 0).toLocaleString("id-ID")}* telah kami terima dengan status *${p.status}*. Terima kasih! #BersamaSahabat`;
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`;
  };

  const exportToCsv = () => {
    if (filteredPayments.length === 0) return;
    const header = "Nama Siswa,Nomor Wali,Paket Terdaftar,Program,Nominal (Rp),Metode,Tanggal Pembayaran,Status,Catatan\n";
    const rows = filteredPayments
      .map((p) => {
        const studentName = p.studentPackage?.student?.name || "Siswa";
        const parentPhone = p.studentPackage?.student?.parentPhone || "-";
        const packageName = p.studentPackage?.package?.name || "-";
        const programName =
          p.studentPackage?.package?.program?.name ||
          p.studentPackage?.program?.name ||
          p.studentPackage?.package?.name ||
          "-";
        const amount = p.amount || 0;
        const method = p.method || "TRANSFER_BANK";
        const date = formatDate(p.paidAt);
        const status = p.status || "LUNAS";
        const notes = (p.notes || "").replace(/"/g, '""');
        return `"${studentName}","${parentPhone}","${packageName}","${programName}",${amount},"${method}","${date}","${status}","${notes}"`;
      })
      .join("\n");

    const blob = new Blob(["\uFEFF" + header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `laporan-pembayaran-siswa-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#09408C] font-heading">
            Pencatatan Pembayaran Siswa
          </h1>
          <p className="text-sm text-[#5B6882] mt-0.5">
            Rekap transaksi pembayaran paket belajar manual (Transfer Bank, QRIS, Tunai) & kwitansi resmi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCsv}
            disabled={payments.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#D5DDEB] bg-white text-[#09408C] text-xs font-semibold hover:bg-[#EAF1FA] transition-colors disabled:opacity-50"
          >
            <Download size={14} />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571] transition-colors shadow-xs cursor-pointer"
          >
            <Plus size={14} />
            <span>Catat Pembayaran Manual</span>
          </button>
        </div>
      </div>

      {/* Search & Status Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#D5DDEB] p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5B6882]"
          />
          <input
            type="text"
            placeholder="Cari nama siswa, paket belajar, atau catatan transfer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#D5DDEB] bg-[#F4F7FB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#09408C]/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5B6882] mr-1">
            <Filter size={12} /> Status:
          </span>
          {(
            [
              { key: "ALL", label: "Semua" },
              { key: "BELUM", label: "Menunggu Verifikasi / Belum" },
              { key: "SEBAGIAN", label: "Sebagian (DP)" },
              { key: "LUNAS", label: "Lunas" },
            ] as const
          ).map((tab) => {
            const active = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  active
                    ? "bg-[#09408C] text-white shadow-2xs"
                    : "bg-[#F4F7FB] text-[#5B6882] hover:bg-[#EAF1FA] hover:text-[#09408C]"
                }`}
              >
                {tab.label}
                {tab.key === "BELUM" && pendingVerificationCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-[#F5B82E] text-[#1B2A41] font-bold">
                    {pendingVerificationCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table & Responsive Mobile Cards */}
      <div className="bg-white rounded-2xl border border-[#D5DDEB] shadow-xs overflow-hidden">
        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center text-sm text-[#5B6882]">
            {payments.length === 0
              ? "Belum ada catatan pembayaran."
              : "Tidak ada transaksi yang cocok dengan filter pencarian."}
          </div>
        ) : (
          <>
            {/* Mobile Card View (DESIGN.md 5.5.1) */}
            <div className="sm:hidden divide-y divide-[#D5DDEB]">
              {filteredPayments.map((p) => {
                const isPaid = p.status === "LUNAS";
                const isPendingVerif =
                  p.status === "BELUM" &&
                  typeof p.notes === "string" &&
                  p.notes.includes("[MENUNGGU VERIFIKASI]");
                const studentName = p.studentPackage?.student?.name || "Siswa";
                const parentPhone = p.studentPackage?.student?.parentPhone;
                const pkgName = p.studentPackage?.package?.name || "Paket Belajar";

                return (
                  <div key={p.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-sm text-[#1B2A41]">{studentName}</div>
                        <div className="text-xs font-semibold text-[#09408C] mt-0.5">
                          {pkgName}
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${
                          isPaid
                            ? "bg-[#E3F4EC] text-[#1F6F4A] border border-[#1F6F4A]/30"
                            : isPendingVerif
                            ? "bg-[#EAF1FA] text-[#09408C] border border-[#9AC1E2]"
                            : "bg-[#FEF7E6] text-[#B45309] border border-[#F5B82E]"
                        }`}
                      >
                        {isPaid ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                        {isPendingVerif ? "MENUNGGU VERIFIKASI" : p.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#5B6882] bg-[#F4F7FB] rounded-xl p-2.5">
                      <div>
                        <div className="font-semibold text-[#1B2A41]">{p.method}</div>
                        <div className="text-[11px] tabular-nums">{formatDate(p.paidAt)}</div>
                      </div>
                      <div className="font-bold text-sm text-[#09408C] tabular-nums">
                        Rp {(p.amount || 0).toLocaleString("id-ID")}
                      </div>
                    </div>

                    {p.notes && (
                      <p className="text-[11px] text-[#5B6882] line-clamp-2">{p.notes}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {p.proofFile && (
                        <button
                          onClick={() => setPreviewProof(p)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#9AC1E2] bg-[#EAF1FA] text-xs font-semibold text-[#09408C] hover:bg-[#D5DDEB] transition-colors"
                          title="Lihat Bukti Foto Transfer / QRIS"
                        >
                          <Eye size={13} />
                          <span>Bukti</span>
                        </button>
                      )}
                      {!isPaid && (
                        <button
                          onClick={() => setConfirmVerifyPayment(p)}
                          disabled={verifyingId === p.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1F6F4A] text-white text-xs font-semibold hover:bg-[#18583B] transition-colors disabled:opacity-50"
                        >
                          <CheckCircle2 size={13} />
                          <span>
                            {verifyingId === p.id ? "Memverifikasi..." : "Verifikasi Lunas"}
                          </span>
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedReceipt(p)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#D5DDEB] text-xs font-semibold text-[#09408C] hover:bg-[#EAF1FA] transition-colors"
                      >
                        <Printer size={13} />
                        <span>Kwitansi</span>
                      </button>
                      {parentPhone && (
                        <a
                          href={getWhatsAppConfirmationUrl(p)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold transition-colors"
                        >
                          <Share2 size={13} />
                          <span>WA</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F4F7FB] border-b border-[#D5DDEB] text-[#5B6882] font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Nama Siswa</th>
                    <th className="py-3 px-4">Paket Terdaftar</th>
                    <th className="py-3 px-4">Nominal</th>
                    <th className="py-3 px-4">Metode & Tanggal</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Aksi & Verifikasi</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#D5DDEB]">
                  {filteredPayments.map((p) => {
                    const isPaid = p.status === "LUNAS";
                    const isPendingVerif =
                      p.status === "BELUM" &&
                      typeof p.notes === "string" &&
                      p.notes.includes("[MENUNGGU VERIFIKASI]");
                    const studentName = p.studentPackage?.student?.name || "Siswa";
                    const parentPhone = p.studentPackage?.student?.parentPhone;
                    const pkgName = p.studentPackage?.package?.name || "Paket Belajar";

                    return (
                      <tr key={p.id} className="hover:bg-[#EAF1FA]/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-sm text-[#1B2A41]">
                            {studentName}
                          </div>
                          {parentPhone && (
                            <div className="text-[11px] text-[#5B6882]">
                              Wali: {parentPhone}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-[#09408C]">
                            {pkgName}
                          </span>
                          {p.notes && (
                            <div className="text-[11px] text-[#5B6882] max-w-xs truncate mt-0.5" title={p.notes}>
                              {p.notes}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-bold text-sm text-[#09408C] tabular-nums">
                            Rp {(p.amount || 0).toLocaleString("id-ID")}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-[#5B6882]">
                          <div className="font-semibold text-[#1B2A41]">{p.method}</div>
                          <div className="text-[11px] tabular-nums">
                            {formatDate(p.paidAt)}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                              isPaid
                                ? "bg-[#E3F4EC] text-[#1F6F4A] border border-[#1F6F4A]/30"
                                : isPendingVerif
                                ? "bg-[#EAF1FA] text-[#09408C] border border-[#9AC1E2]"
                                : "bg-[#FEF7E6] text-[#B45309] border border-[#F5B82E]"
                            }`}
                          >
                            {isPaid ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                            {isPendingVerif ? "MENUNGGU VERIFIKASI" : p.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="flex flex-wrap items-center justify-center gap-2">
                            {p.proofFile && (
                              <button
                                onClick={() => setPreviewProof(p)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#9AC1E2] bg-[#EAF1FA] text-xs font-semibold text-[#09408C] hover:bg-[#D5DDEB] transition-colors"
                                title="Lihat Bukti Foto Transfer / QRIS"
                              >
                                <Eye size={13} />
                                <span>Bukti</span>
                              </button>
                            )}
                            {!isPaid && (
                              <button
                                onClick={() => setConfirmVerifyPayment(p)}
                                disabled={verifyingId === p.id}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#1F6F4A] text-white text-xs font-semibold hover:bg-[#18583B] transition-colors disabled:opacity-50 cursor-pointer"
                                title="Verifikasi pembayaran mandiri menjadi LUNAS"
                              >
                                <CheckCircle2 size={13} />
                                <span>
                                  {verifyingId === p.id ? "Memproses..." : "Verifikasi Lunas"}
                                </span>
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedReceipt(p)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#D5DDEB] text-xs font-semibold text-[#09408C] hover:bg-[#EAF1FA] transition-colors"
                              title="Cetak Kwitansi Resmi"
                            >
                              <Printer size={13} />
                              <span>Kwitansi</span>
                            </button>
                            {parentPhone && (
                              <a
                                href={getWhatsAppConfirmationUrl(p)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                                title="Kirim Konfirmasi via WhatsApp"
                              >
                                <Share2 size={13} />
                              </a>
                            )}
                          </div>
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

      {/* Modal Konfirmasi Verifikasi Pembayaran Lunas */}
      <ConfirmModal
        open={Boolean(confirmVerifyPayment)}
        title="Verifikasi Pembayaran Lunas?"
        description={
          <>
            Konfirmasi bahwa pembayaran dari{" "}
            <strong className="text-[#1B2A41]">
              {confirmVerifyPayment?.studentPackage?.student?.name || "Siswa"}
            </strong>{" "}
            sebesar{" "}
            <strong className="text-[#1F6F4A]">
              Rp {(confirmVerifyPayment?.amount || 0).toLocaleString("id-ID")}
            </strong>{" "}
            untuk paket{" "}
            <strong>
              {confirmVerifyPayment?.studentPackage?.package?.name || "Paket Belajar"}
            </strong>{" "}
            sudah diterima dengan benar.
          </>
        }
        confirmLabel="Ya, Verifikasi Lunas"
        variant="success"
        loading={Boolean(verifyingId)}
        onConfirm={() => {
          if (confirmVerifyPayment) {
            handleVerifyPayment(confirmVerifyPayment);
          }
        }}
        onCancel={() => setConfirmVerifyPayment(null)}
      />

      {/* Kwitansi Modal (Printable) */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#D5DDEB] shadow-2xl space-y-6 relative">
            <button
              onClick={() => setSelectedReceipt(null)}
              aria-label="Tutup dialog kwitansi"
              className="absolute top-4 right-4 p-2 text-[#5B6882] hover:text-[#1B2A41] rounded-full hover:bg-slate-100"
            >
              <X size={18} />
            </button>

            {/* Receipt Printable Card */}
            <div id="kwitansi-print" className="border-2 border-[#09408C] rounded-2xl p-6 space-y-5 bg-white">
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
                    <p className="text-[10px] text-[#5B6882]">
                      Comprehensive Academic Solution • #BersamaSahabat
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-[#5B6882] block">
                    Kwitansi Pembayaran
                  </span>
                  <span className="text-xs font-mono font-bold text-[#09408C]">
                    SB-{selectedReceipt.id.slice(-6).toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-dashed border-[#D5DDEB]">
                  <span className="text-[#5B6882]">Telah Diterima Dari:</span>
                  <strong className="text-[#1B2A41] font-heading">
                    {selectedReceipt.studentPackage.student.name}
                  </strong>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed border-[#D5DDEB]">
                  <span className="text-[#5B6882]">Untuk Pembayaran:</span>
                  <span className="font-semibold text-[#09408C]">
                    {selectedReceipt.studentPackage.package.name} (
                    {selectedReceipt.studentPackage.quotaTotal} Pertemuan @ 90 Mnt)
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-dashed border-[#D5DDEB]">
                  <span className="text-[#5B6882]">Metode & Tanggal:</span>
                  <span className="text-[#1B2A41]">
                    {selectedReceipt.method} • {formatDate(selectedReceipt.paidAt, true)}
                  </span>
                </div>
                <div className="flex justify-between py-2 items-center bg-[#F4F7FB] px-3 rounded-xl mt-3">
                  <span className="font-bold text-[#5B6882]">Jumlah Bayar:</span>
                  <span className="text-lg font-bold text-[#09408C] font-heading">
                    Rp {selectedReceipt.amount.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                {selectedReceipt.status === "LUNAS" ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E3F4EC] text-[#1F6F4A] text-xs font-bold border border-[#1F6F4A]/30">
                    <CheckCircle2 size={14} /> STATUS {selectedReceipt.status}
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF7E6] text-[#B45309] text-xs font-bold border border-[#F5B82E]">
                    <Clock size={14} /> STATUS {selectedReceipt.status}
                  </div>
                )}
                <div className="text-right text-[11px] text-[#5B6882]">
                  <p>Administrasi Sahabat Belajar</p>
                  <p className="font-bold text-[#1B2A41] mt-4">Sahabat Belajar Official</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571] transition-colors shadow-xs"
              >
                <Printer size={14} /> Cetak Kwitansi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Catat Pembayaran */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-record-payment-title"
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowAddModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
        >
          <form
            onSubmit={handleRecordPayment}
            className="bg-white rounded-2xl p-6 max-w-md w-full border border-[#D5DDEB] shadow-xl space-y-4"
          >
            <h3 id="modal-record-payment-title" className="text-lg font-bold text-[#09408C] font-display">
              Catat Pembayaran Manual
            </h3>

            <div>
              <label htmlFor="pay-student-package-select" className="block text-xs font-bold text-[#1B2A41] mb-1">
                Pilih Siswa & Paket *
              </label>
              <select
                id="pay-student-package-select"
                value={studentPackageId}
                onChange={(e) => setStudentPackageId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring bg-white"
              >
                {studentPackages.map((sp) => (
                  <option key={sp.id} value={sp.id}>
                    {sp.student.name} — {sp.package.name} (Sisa {sp.quotaTotal - sp.quotaUsed})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="pay-amount-input" className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Nominal Bayar (Rp) <span className="text-[#B4381F]">(Wajib)</span>
                </label>
                <input
                  id="pay-amount-input"
                  type="number"
                  required
                  placeholder="1500000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring"
                />
                {Number(amount) > 0 && (
                  <p className="text-[11px] font-semibold text-[#09408C] mt-1 tabular-nums">
                    Terbaca: Rp {Number(amount).toLocaleString("id-ID")}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="pay-method-select" className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Metode Bayar
                </label>
                <select
                  id="pay-method-select"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring bg-white"
                >
                  <option value="TRANSFER_BANK">Transfer Bank (BCA/Mandiri/BSI)</option>
                  <option value="QRIS">QRIS</option>
                  <option value="TUNAI">Tunai / Cash</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="pay-status-select" className="block text-xs font-bold text-[#1B2A41] mb-1">
                Status Pembayaran
              </label>
              <select
                id="pay-status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring bg-white"
              >
                <option value="LUNAS">Lunas</option>
                <option value="SEBAGIAN">Sebagian (DP / Cicilan)</option>
                <option value="BELUM">Belum Bayar</option>
              </select>
            </div>

            <div>
              <label htmlFor="pay-proof-input" className="block text-xs font-bold text-[#1B2A41] mb-1">
                Tautan / File Bukti Transfer
              </label>
              <input
                id="pay-proof-input"
                type="text"
                placeholder="https://... atau nomor referensi transfer"
                value={proofFile}
                onChange={(e) => setProofFile(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring"
              />
            </div>

            <div>
              <label htmlFor="pay-notes-input" className="block text-xs font-bold text-[#1B2A41] mb-1">
                Catatan Transaksi
              </label>
              <input
                id="pay-notes-input"
                type="text"
                placeholder="Keterangan transfer..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D5DDEB]">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#5B6882] hover:bg-[#F4F7FB] rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold bg-[#09408C] text-white hover:bg-[#0E3571] rounded-xl transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Pembayaran"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Pratinjau Bukti Transfer / QRIS untuk Admin */}
      {previewProof && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-[#D5DDEB] relative">
            <button
              onClick={() => setPreviewProof(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-[#5B6882] hover:bg-[#EAF1FA] hover:text-[#1B2A41] transition-colors"
            >
              <X size={18} />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF1FA] text-[#09408C] border border-[#9AC1E2]">
                  Foto Bukti Transaksi
                </span>
                <span className="text-xs text-[#5B6882] font-mono">
                  {previewProof.id}
                </span>
              </div>
              <h3 className="font-heading font-bold text-base text-[#1B2A41] mt-1">
                {previewProof.studentPackage?.student?.name || "Siswa"} — Rp {(previewProof.amount || 0).toLocaleString("id-ID")}
              </h3>
              <p className="text-xs text-[#5B6882]">
                Paket: {previewProof.studentPackage?.package?.name || "Paket Belajar"} | Metode: {previewProof.method}
              </p>
            </div>

            {/* Container Foto */}
            <div className="bg-slate-100 rounded-2xl overflow-hidden border border-[#D5DDEB] max-h-[55vh] flex items-center justify-center p-2">
              <img
                src={previewProof.proofFile}
                alt="Bukti Transfer Pembayaran"
                className="w-full h-auto max-h-[50vh] object-contain rounded-xl"
              />
            </div>

            {previewProof.notes && (
              <div className="text-[11px] text-[#5B6882] bg-[#F4F7FB] p-2.5 rounded-xl border border-[#D5DDEB]">
                <strong className="text-[#1B2A41]">Catatan Pengirim:</strong> {previewProof.notes}
              </div>
            )}

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#D5DDEB]">
              <a
                href={previewProof.proofFile}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl border border-[#D5DDEB] text-xs font-semibold text-[#09408C] hover:bg-[#EAF1FA] flex items-center gap-1.5"
              >
                <ExternalLink size={14} />
                <span>Buka Tab Baru</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewProof(null)}
                  className="px-4 py-2 rounded-xl border border-[#D5DDEB] text-xs font-semibold text-[#5B6882] hover:bg-slate-50"
                >
                  Tutup
                </button>
                {previewProof.status !== "LUNAS" && (
                  <button
                    type="button"
                    onClick={async () => {
                      const p = previewProof;
                      setPreviewProof(null);
                      await handleVerifyPayment(p);
                    }}
                    disabled={verifyingId === previewProof.id}
                    className="px-4 py-2 rounded-xl bg-[#1F6F4A] hover:bg-[#18583B] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <CheckCircle2 size={14} />
                    <span>Verifikasi Lunas</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
