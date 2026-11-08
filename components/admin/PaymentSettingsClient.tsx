"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import {
  CreditCard,
  Plus,
  Edit2,
  Trash2,
  QrCode,
  Building2,
  CheckCircle2,
  RefreshCw,
  X,
  Save,
  HardDrive,
} from "lucide-react";
import CoverImageUpload from "@/components/admin/CoverImageUpload";
import {
  upsertPaymentAccount,
  deletePaymentAccount,
  type PaymentAccountItem,
} from "@/actions/pembayaran";

interface PaymentSettingsClientProps {
  initialAccounts: PaymentAccountItem[];
}

export default function PaymentSettingsClient({ initialAccounts }: PaymentSettingsClientProps) {
  const [accounts, setAccounts] = useState<PaymentAccountItem[]>(initialAccounts);
  const [editingItem, setEditingItem] = useState<PaymentAccountItem | null>(null);
  const [isNew, setIsNew] = useState(false);

  // Form State
  const [type, setType] = useState<"BANK" | "QRIS">("BANK");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [qrisImage, setQrisImage] = useState<string | null>(null);
  const [instructions, setInstructions] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleOpenAdd = () => {
    setIsNew(true);
    setEditingItem({
      id: "",
      type: "BANK",
      bankName: "",
      accountNumber: "",
      accountHolder: "BIAS RISTEK INDONESIA",
      qrisImage: null,
      instructions: "Transfer tepat hingga 3 digit kode unik verifikasi.",
      isActive: true,
      sortOrder: accounts.length + 1,
      createdAt: "",
      updatedAt: "",
    });
    setType("BANK");
    setBankName("");
    setAccountNumber("");
    setAccountHolder("Sahabat Belajar");
    setQrisImage(null);
    setInstructions("Transfer tepat hingga nominal verifikasi.");
    setIsActive(true);
  };

  const handleOpenEdit = (item: PaymentAccountItem) => {
    setIsNew(false);
    setEditingItem(item);
    setType((item.type as "BANK" | "QRIS") || "BANK");
    setBankName(item.bankName);
    setAccountNumber(item.accountNumber || "");
    setAccountHolder(item.accountHolder || "");
    setQrisImage(item.qrisImage || null);
    setInstructions(item.instructions || "");
    setIsActive(item.isActive ?? true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName.trim()) {
      setError("Nama Bank / Metode Pembayaran wajib diisi");
      return;
    }

    setError("");
    startTransition(async () => {
      const formData = new FormData();
      if (!isNew && editingItem?.id) formData.append("id", editingItem.id);
      formData.append("type", type);
      formData.append("bankName", bankName);
      formData.append("accountNumber", accountNumber);
      formData.append("accountHolder", accountHolder);
      formData.append("qrisImage", qrisImage || "");
      formData.append("instructions", instructions);
      formData.append("isActive", isActive.toString());

      const res = await upsertPaymentAccount(formData);
      if (res.success) {
        setSuccess("Akun pembayaran berhasil disimpan!");
        setEditingItem(null);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(res.message || "Gagal menyimpan akun pembayaran");
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus rekening ini?")) return;
    startTransition(async () => {
      const res = await deletePaymentAccount(id);
      if (res.success) {
        setAccounts(accounts.filter((a) => a.id !== id));
      }
    });
  };

  return (
    <div className="space-y-6 font-[var(--font-body)] animate-fade-in">
      {/* Header Banner */}
      <div
        className="elevation-1 rounded-2xl p-6 bg-white border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{
          borderColor: "var(--color-outline-variant)",
          borderTop: "4px solid var(--color-primary)",
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xs"
            style={{
              background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
              color: "var(--color-primary)",
            }}
          >
            <CreditCard size={28} />
          </div>
          <div>
            <h1 className="text-display-md font-extrabold font-[var(--font-heading)]" style={{ color: "var(--color-on-surface)" }}>
              Pengaturan Metode Pembayaran
            </h1>
            <p className="text-body-sm text-gray-500 mt-1">
              Atur barcode QRIS resmi dan nomor rekening bank untuk checkout pendaftaran peserta kelas
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-label-lg font-bold text-white shadow-xs hover:opacity-90 transition-all self-start sm:self-center"
          style={{ background: "var(--color-primary)" }}
        >
          <Plus size={18} />
          <span>Tambah Rekening Baru</span>
        </button>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-body-sm font-semibold">
          {success}
        </div>
      )}

      {/* Payment Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {accounts.map((acc) => {
          const isQris = acc.type === "QRIS";

          return (
            <div
              key={acc.id}
              className="elevation-1 rounded-2xl p-6 bg-white border flex flex-col justify-between space-y-4 relative"
              style={{ borderColor: "var(--color-outline-variant)" }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-xs"
                    style={{ background: isQris ? "var(--color-primary)" : "#1e3a8a" }}
                  >
                    {isQris ? <QrCode size={24} /> : <Building2 size={24} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-headline-sm text-gray-900">{acc.bankName}</h3>
                    <span className="text-3xs font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                      {acc.type}
                    </span>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-3xs font-bold ${
                    acc.isActive ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {acc.isActive ? "Aktif" : "Non-aktif"}
                </span>
              </div>

              {isQris ? (
                <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border" style={{ borderColor: "var(--color-outline-variant)" }}>
                  <div className="w-20 h-20 rounded-lg overflow-hidden relative border bg-white shrink-0">
                    {acc.qrisImage ? (
                      <Image src={acc.qrisImage} alt="QRIS" fill className="object-contain p-1" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <QrCode size={32} />
                      </div>
                    )}
                  </div>
                  <div className="text-2xs text-gray-600 space-y-0.5">
                    <p className="font-bold text-gray-900">QRIS All E-Wallet</p>
                    <p className="text-3xs text-gray-500">Mendukung GoPay, OVO, Dana, ShopeePay & M-Banking</p>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-50 border space-y-1 text-2xs" style={{ borderColor: "var(--color-outline-variant)" }}>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Nomor Rekening:</span>
                    <strong className="font-mono text-gray-900 text-body-sm">{acc.accountNumber}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Atas Nama:</span>
                    <span className="font-bold text-gray-800">{acc.accountHolder}</span>
                  </div>
                </div>
              )}

              {acc.instructions && (
                <p className="text-3xs text-gray-500 line-clamp-2 leading-relaxed">
                  {acc.instructions}
                </p>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t flex items-center justify-end gap-2" style={{ borderColor: "var(--color-outline-variant)" }}>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(acc)}
                  className="px-3 py-1.5 rounded-lg border text-2xs font-bold text-blue-900 hover:bg-blue-50 flex items-center gap-1 transition-colors"
                >
                  <Edit2 size={13} /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => acc.id && handleDelete(acc.id)}
                  className="px-3 py-1.5 rounded-lg border text-2xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-1 transition-colors"
                >
                  <Trash2 size={13} /> Hapus
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* EDIT / CREATE MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <form
            onSubmit={handleSave}
            className="elevation-2 rounded-2xl bg-white w-full max-w-lg overflow-hidden border shadow-2xl space-y-4"
            style={{
              borderColor: "var(--color-outline-variant)",
              borderTop: "4px solid var(--color-primary)",
            }}
          >
            <div className="p-4 sm:p-5 border-b flex items-center justify-between" style={{ borderColor: "var(--color-outline-variant)" }}>
              <h3 className="font-bold text-headline-sm text-gray-900 font-[var(--font-heading)]">
                {isNew ? "Tambah Akun Pembayaran" : "Edit Akun Pembayaran"}
              </h3>
              <button type="button" onClick={() => setEditingItem(null)} className="p-1.5 text-gray-400 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-body-sm max-h-[75vh] overflow-y-auto">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-2xs font-semibold">
                  {error}
                </div>
              )}

              <div>
                <label className="text-2xs font-bold text-gray-700 block mb-1">Tipe Pembayaran</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType("BANK")}
                    className={`py-2 rounded-lg border text-2xs font-bold flex items-center justify-center gap-1.5 ${
                      type === "BANK"
                        ? "bg-blue-50 border-blue-900 text-blue-900 shadow-xs"
                        : "bg-white border-gray-200 text-gray-600"
                    }`}
                  >
                    <Building2 size={14} /> Transfer Bank
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("QRIS")}
                    className={`py-2 rounded-lg border text-2xs font-bold flex items-center justify-center gap-1.5 ${
                      type === "QRIS"
                        ? "bg-blue-50 border-blue-900 text-blue-900 shadow-xs"
                        : "bg-white border-gray-200 text-gray-600"
                    }`}
                  >
                    <QrCode size={14} /> Barcode QRIS
                  </button>
                </div>
              </div>

              <div>
                <label className="text-2xs font-bold text-gray-700 block mb-1">
                  Nama Bank / Label Metode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Contoh: Bank Central Asia (BCA)"
                  required
                  className="w-full px-3 py-2 rounded-lg border text-2xs font-bold bg-white"
                  style={{ borderColor: "var(--color-outline-variant)" }}
                />
              </div>

              {type === "BANK" ? (
                <>
                  <div>
                    <label className="text-2xs font-bold text-gray-700 block mb-1">
                      Nomor Rekening
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Contoh: 8392019283"
                      className="w-full px-3 py-2 rounded-lg border text-2xs font-mono font-bold bg-white"
                      style={{ borderColor: "var(--color-outline-variant)" }}
                    />
                  </div>

                  <div>
                    <label className="text-2xs font-bold text-gray-700 block mb-1">
                      Atas Nama Pemilik Rekening
                    </label>
                    <input
                      type="text"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      placeholder="Contoh: BIAS RISTEK INDONESIA"
                      className="w-full px-3 py-2 rounded-lg border text-2xs bg-white"
                      style={{ borderColor: "var(--color-outline-variant)" }}
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="text-2xs font-bold text-gray-700 block mb-1">
                    Upload Barcode QRIS
                  </label>
                  <CoverImageUpload
                    value={qrisImage}
                    onChange={(url) => setQrisImage(url)}
                    folder="general"
                  />
                </div>
              )}

              <div>
                <label className="text-2xs font-bold text-gray-700 block mb-1">
                  Instruksi Pembayaran
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={2}
                  placeholder="Instruksi transfer..."
                  className="w-full px-3 py-2 rounded-lg border text-2xs bg-white"
                  style={{ borderColor: "var(--color-outline-variant)" }}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="accActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-900"
                />
                <label htmlFor="accActive" className="text-2xs font-bold text-gray-800 cursor-pointer">
                  Metode Pembayaran Aktif & Tampil di Checkout
                </label>
              </div>
            </div>

            <div className="p-4 border-t bg-slate-50 flex items-center justify-end gap-2" style={{ borderColor: "var(--color-outline-variant)" }}>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-lg border text-2xs font-bold text-gray-700 hover:bg-gray-100"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2 rounded-lg text-xs font-semibold text-white bg-[#001847] hover:bg-[#0b2c6b] flex items-center gap-1.5 shadow-sm transition"
              >
                {isPending ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                <span>Simpan Rekening</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
