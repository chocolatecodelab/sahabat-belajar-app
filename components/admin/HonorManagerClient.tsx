"use client";

import { useState } from "react";
import {
  Trophy,
  Calculator,
  Calendar,
  CheckCircle2,
  DollarSign,
  Download,
} from "lucide-react";
import { calculateTutorPayout, updatePayoutStatus } from "@/actions/honor";
import { PayoutStatus } from "@prisma/client";
import { formatDate } from "@/lib/date";

export default function HonorManagerClient({
  initialPayouts,
  tutors,
}: {
  initialPayouts: any[];
  tutors: any[];
}) {
  const [payouts, setPayouts] = useState(initialPayouts);
  const [showCalcModal, setShowCalcModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [tutorId, setTutorId] = useState(tutors[0]?.id || "");
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      .toISOString()
      .split("T")[0]
  );
  const [notes, setNotes] = useState("");

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorId || !startDate || !endDate) return;
    setIsSubmitting(true);

    const res = await calculateTutorPayout({
      tutorId,
      periodStart: startDate,
      periodEnd: endDate,
      notes,
    });
    setIsSubmitting(false);

    if (res.success) {
      alert(res.message);
      setShowCalcModal(false);
      window.location.reload();
    } else {
      alert(res.message);
    }
  };

  const handleUpdateStatus = async (id: string, status: PayoutStatus) => {
    const res = await updatePayoutStatus(id, status);
    if (res.success) {
      setPayouts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status } : p))
      );
    } else {
      alert(res.message);
    }
  };

  const exportToCsv = () => {
    if (payouts.length === 0) return;
    const header = "Nama Tutor,Periode Mulai,Periode Selesai,Total Sesi Terlaksana,Total Honor (Rp),Status\n";
    const rows = payouts
      .map(
        (p) =>
          `"${p.tutor.name}","${formatDate(p.periodStart)}","${formatDate(p.periodEnd)}",${p.totalSessions},${p.totalAmount},"${p.status}"`
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `rekap-honor-tutor-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#09408C] font-display">
            Rekap Honor Tutor
          </h1>
          <p className="text-sm text-[#5B6882] mt-0.5">
            Perhitungan honor otomatis berdasarkan sesi terlaksana (BR-6) dan ekspor laporan periode.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCsv}
            disabled={payouts.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#D5DDEB] bg-white text-[#09408C] text-xs font-semibold hover:bg-[#EAF1FA] transition-colors disabled:opacity-50"
          >
            <Download size={14} />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={() => setShowCalcModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#09408C] text-white text-xs font-semibold hover:bg-[#0E3571] transition-colors shadow-xs"
          >
            <Calculator size={14} />
            <span>+ Hitung Rekap Periode</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#D5DDEB] shadow-xs overflow-hidden">
        {payouts.length === 0 ? (
          <div className="p-12 text-center text-sm text-[#5B6882]">
            Belum ada rekapitulasi honor tutor yang dibuat.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F7FB] border-b border-[#D5DDEB] text-[#5B6882] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Nama Tutor</th>
                  <th className="py-3 px-4">Periode Bimbingan</th>
                  <th className="py-3 px-4">Sesi Terlaksana</th>
                  <th className="py-3 px-4">Tarif per Sesi</th>
                  <th className="py-3 px-4">Total Honor</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D5DDEB]">
                {payouts.map((p) => {
                  const isPaid = p.status === "DIBAYAR";

                  return (
                    <tr key={p.id} className="hover:bg-[#EAF1FA]/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-sm text-[#1B2A41]">
                          {p.tutor.name}
                        </div>
                        <div className="text-[11px] text-[#5B6882]">{p.tutor.phone}</div>
                      </td>

                      <td className="py-3.5 px-4 text-[#5B6882] tabular-nums">
                        {formatDate(p.periodStart)} - {formatDate(p.periodEnd)}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-[#09408C] tabular-nums">
                        {p.totalSessions} sesi
                      </td>

                      <td className="py-3.5 px-4 text-[#5B6882] tabular-nums">
                        Rp {p.tutor.ratePerSession?.toLocaleString("id-ID")}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-sm text-[#09408C] tabular-nums">
                          Rp {p.totalAmount.toLocaleString("id-ID")}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isPaid
                              ? "bg-[#E3F4EC] text-[#1F6F4A] border border-[#A3E635]"
                              : p.status === "DISETUJUI"
                              ? "bg-[#EAF1FA] text-[#09408C] border border-[#9AC1E2]"
                              : "bg-[#FEF7E6] text-[#B45309] border border-[#F5B82E]"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {!isPaid && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(
                                p.id,
                                p.status === "DRAFT" ? "DISETUJUI" : "DIBAYAR"
                              )
                            }
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#09408C] text-white hover:bg-[#0E3571] transition-colors"
                          >
                            {p.status === "DRAFT" ? "Setujui" : "Tandai Dibayar"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Hitung Rekap */}
      {showCalcModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCalculate}
            className="bg-white rounded-2xl p-6 max-w-md w-full border border-[#D5DDEB] shadow-xl space-y-4"
          >
            <h3 className="text-lg font-bold text-[#09408C] font-display">
              Hitung Rekap Honor Tutor
            </h3>

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
                    {t.name} (Tarif: Rp {t.ratePerSession?.toLocaleString("id-ID")} / sesi)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Mulai Periode *
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                  Akhir Periode *
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1B2A41] mb-1">
                Catatan
              </label>
              <input
                type="text"
                placeholder="Misal: Periode bimbingan November 2026..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-[#D5DDEB] focus-ring"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D5DDEB]">
              <button
                type="button"
                onClick={() => setShowCalcModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#5B6882] hover:bg-[#F4F7FB] rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold bg-[#09408C] text-white hover:bg-[#0E3571] rounded-xl transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Menghitung..." : "Hitung Honor Sekarang"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
