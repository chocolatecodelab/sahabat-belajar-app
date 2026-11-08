"use client";

import { useState } from "react";
import {
  CreditCard,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  Calendar,
} from "lucide-react";
import { recordManualPayment } from "@/actions/pembayaran";
import { PaymentStatus } from "@prisma/client";

export default function PaymentManagerClient({
  initialPayments,
  studentPackages,
}: {
  initialPayments: any[];
  studentPackages: any[];
}) {
  const [payments, setPayments] = useState(initialPayments);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [studentPackageId, setStudentPackageId] = useState(
    studentPackages[0]?.id || ""
  );
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("TRANSFER_BANK");
  const [status, setStatus] = useState<PaymentStatus>("LUNAS");
  const [proofFile, setProofFile] = useState("");
  const [notes, setNotes] = useState("");

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
      alert(res.message);
      setShowAddModal(false);
      window.location.reload();
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#09408C] font-display">
            Pencatatan Pembayaran Siswa
          </h1>
          <p className="text-sm text-[#5B6882] mt-0.5">
            Rekap transaksi pembayaran paket belajar manual (Transfer Bank, QRIS, Tunai).
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571] transition-colors shadow-xs"
        >
          <Plus size={14} />
          <span>+ Catat Pembayaran Manual</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#D5DDEB] shadow-xs overflow-hidden">
        {payments.length === 0 ? (
          <div className="p-12 text-center text-sm text-[#5B6882]">
            Belum ada catatan pembayaran.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F7FB] border-b border-[#D5DDEB] text-[#5B6882] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4">Paket Terdaftar</th>
                  <th className="py-3 px-4">Nominal</th>
                  <th className="py-3 px-4">Metode & Tanggal</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D5DDEB]">
                {payments.map((p) => {
                  const isPaid = p.status === "LUNAS";
                  return (
                    <tr key={p.id} className="hover:bg-[#EAF1FA]/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-sm text-[#1B2A41]">
                          {p.studentPackage.student.name}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-[#09408C]">
                          {p.studentPackage.package.name}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-sm text-[#09408C] tabular-nums">
                          Rp {p.amount.toLocaleString("id-ID")}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-[#5B6882]">
                        <div className="font-semibold text-[#1B2A41]">{p.method}</div>
                        <div className="text-[11px] tabular-nums">
                          {new Date(p.paidAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isPaid
                              ? "bg-[#E3F4EC] text-[#1F6F4A] border border-[#A3E635]"
                              : "bg-[#FEF7E6] text-[#B45309] border border-[#F5B82E]"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-[#5B6882]">
                        {p.notes || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Catat Pembayaran */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <form
            onSubmit={handleRecordPayment}
            className="bg-white rounded-2xl p-6 max-w-md w-full border border-[#D5DDEB] shadow-xl space-y-4"
          >
            <h3 className="text-lg font-bold text-[#09408C] font-display">
              Catat Pembayaran Manual
            </h3>

            <div>
              <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                Pilih Siswa & Paket *
              </label>
              <select
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
                <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Nominal Bayar (Rp) *
                </label>
                <input
                  type="number"
                  required
                  placeholder="1500000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Metode Bayar
                </label>
                <select
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
              <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                Status Pembayaran
              </label>
              <select
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
              <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                Tautan / File Bukti Transfer
              </label>
              <input
                type="text"
                placeholder="https://... atau nomor referensi transfer"
                value={proofFile}
                onChange={(e) => setProofFile(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                Catatan Transaksi
              </label>
              <input
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
    </div>
  );
}
