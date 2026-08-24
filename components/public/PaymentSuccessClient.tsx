"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  QrCode,
  Building2,
  Copy,
  Upload,
  MessageSquare,
  ArrowRight,
  RefreshCw,
  Home,
  Check,
  Calendar,
  School,
  FileCheck,
} from "lucide-react";
import type { RegistrationItem } from "@/actions/pendaftaran";
import { uploadPaymentProof } from "@/actions/pendaftaran";

interface PaymentSuccessClientProps {
  registration: RegistrationItem;
}

export default function PaymentSuccessClient({ registration }: PaymentSuccessClientProps) {
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(registration.paymentProof || null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState("");
  const [copiedInvoice, setCopiedInvoice] = useState(false);

  const status = registration.status;

  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file);
      setProofPreview(URL.createObjectURL(file));
    }
  };

  const handleUploadProof = async () => {
    if (!proofFile) return;
    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", proofFile);
      formData.append("folder", "payments");

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Gagal mengunggah file");
      const uploadData = await uploadRes.json();

      const saveRes = await uploadPaymentProof(registration.invoiceNumber, uploadData.url);
      if (saveRes.success) {
        setUploadSuccess(true);
      } else {
        setError(saveRes.message || "Gagal menyimpan bukti pembayaran");
      }
    } catch (err: any) {
      setError(err?.message || "Gagal mengunggah bukti");
    } finally {
      setUploading(false);
    }
  };

  const handleCopyInvoice = () => {
    navigator.clipboard.writeText(registration.invoiceNumber);
    setCopiedInvoice(true);
    setTimeout(() => setCopiedInvoice(false), 2000);
  };

  // WhatsApp confirmation link
  const waMessage = encodeURIComponent(
    `Halo Tim Admin BIAS RISTEK, saya telah mendaftar program:\n\n*${registration.courseTitle}*\nNo. Invoice: *${registration.invoiceNumber}*\nNama: *${registration.name}*\nTotal: *Rp ${registration.totalAmount.toLocaleString("id-ID")}*\n\nMohon konfirmasi dan info link grup kelas/Zoom. Terima kasih!`
  );
  const waUrl = `https://wa.me/6281234567890?text=${waMessage}`;

  return (
    <div className="min-h-screen bg-slate-50 font-[var(--font-body)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Status Card Banner */}
        <div
          className="elevation-2 rounded-2xl p-6 sm:p-8 bg-white border text-center space-y-4"
          style={{
            borderColor: "var(--color-outline-variant)",
            borderTop: `4px solid ${
              status === "VERIFIED"
                ? "#10b981"
                : status === "PAYMENT_UPLOADED"
                ? "#3b82f6"
                : "#f59e0b"
            }`,
          }}
        >
          {status === "VERIFIED" ? (
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 size={36} />
            </div>
          ) : status === "PAYMENT_UPLOADED" || uploadSuccess ? (
            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
              <Clock size={36} />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
              <AlertCircle size={36} />
            </div>
          )}

          <div>
            <div className="inline-block px-3 py-1 rounded-full text-3xs font-extrabold uppercase tracking-wider mb-2"
              style={{
                background:
                  status === "VERIFIED"
                    ? "#d1fae5"
                    : status === "PAYMENT_UPLOADED" || uploadSuccess
                    ? "#dbeafe"
                    : "#fef3c7",
                color:
                  status === "VERIFIED"
                    ? "#065f46"
                    : status === "PAYMENT_UPLOADED" || uploadSuccess
                    ? "#1e40af"
                    : "#92400e",
              }}
            >
              {status === "VERIFIED"
                ? "Pembayaran Terverifikasi (Resmi Terdaftar)"
                : status === "PAYMENT_UPLOADED" || uploadSuccess
                ? "Menunggu Verifikasi Admin"
                : "Menunggu Pembayaran & Upload Bukti"}
            </div>

            <h1 className="text-headline-lg font-extrabold font-[var(--font-heading)] text-gray-900">
              {status === "VERIFIED"
                ? "Selamat, Pendaftaran Anda Telah Diterima!"
                : status === "PAYMENT_UPLOADED" || uploadSuccess
                ? "Bukti Pembayaran Berhasil Diterima"
                : "Pendaftaran Berhasil Dibuat!"}
            </h1>

            <p className="text-body-sm text-gray-600 max-w-md mx-auto mt-1.5">
              {status === "VERIFIED"
                ? "Anda telah resmi terdaftar sebagai peserta kelas. Informasi akses Zoom & materi telah dikirimkan."
                : status === "PAYMENT_UPLOADED" || uploadSuccess
                ? "Tim admin BIAS RISTEK sedang memverifikasi pembayaran Anda (maksimal 1x24 jam)."
                : "Silakan selesaikan pembayaran dan unggah bukti transfer di bawah untuk mengamankan kuota kelas Anda."}
            </p>
          </div>
        </div>

        {/* Invoice & Order Summary */}
        <div
          className="elevation-1 rounded-2xl p-6 bg-white border space-y-4"
          style={{ borderColor: "var(--color-outline-variant)" }}
        >
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: "var(--color-outline-variant)" }}>
            <h3 className="font-bold text-headline-sm font-[var(--font-heading)] text-gray-900">
              Rincian Tiket Pendaftaran
            </h3>
            <button
              type="button"
              onClick={handleCopyInvoice}
              className="px-2.5 py-1 rounded-lg border text-3xs font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-1"
            >
              {copiedInvoice ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
              <span>{registration.invoiceNumber}</span>
            </button>
          </div>

          <div className="space-y-3 text-body-sm">
            <div className="flex justify-between py-1 border-b" style={{ borderColor: "var(--color-outline-variant)" }}>
              <span className="text-gray-500">Program Kelas:</span>
              <strong className="text-gray-900 text-right max-w-xs">{registration.courseTitle}</strong>
            </div>

            <div className="flex justify-between py-1 border-b" style={{ borderColor: "var(--color-outline-variant)" }}>
              <span className="text-gray-500">Nama Calon Peneliti:</span>
              <span className="font-bold text-gray-900">{registration.name}</span>
            </div>

            <div className="flex justify-between py-1 border-b" style={{ borderColor: "var(--color-outline-variant)" }}>
              <span className="text-gray-500">Asal Kampus / Instansi:</span>
              <span className="font-medium text-gray-700">{registration.institution}</span>
            </div>

            <div className="flex justify-between py-1 border-b" style={{ borderColor: "var(--color-outline-variant)" }}>
              <span className="text-gray-500">Nomor WhatsApp:</span>
              <span className="font-medium text-gray-700">{registration.phone}</span>
            </div>

            <div className="flex justify-between py-1 border-b" style={{ borderColor: "var(--color-outline-variant)" }}>
              <span className="text-gray-500">Metode Pembayaran:</span>
              <span className="font-bold text-blue-900">{registration.paymentMethod}</span>
            </div>

            <div className="flex justify-between items-baseline pt-2">
              <span className="text-body-md font-bold text-gray-900">Total Biaya:</span>
              <span className="text-headline-md font-extrabold text-[var(--color-primary)]">
                Rp {registration.totalAmount.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>

        {/* Upload Proof Box (If not yet verified) */}
        {status !== "VERIFIED" && !uploadSuccess && (
          <div
            className="elevation-1 rounded-2xl p-6 bg-white border space-y-4"
            style={{ borderColor: "var(--color-outline-variant)" }}
          >
            <h3 className="font-bold text-headline-sm font-[var(--font-heading)] text-gray-900">
              Unggah / Perbarui Bukti Pembayaran
            </h3>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-2xs font-semibold">
                {error}
              </div>
            )}

            <div className="p-4 rounded-xl border-2 border-dashed bg-slate-50 text-center space-y-2" style={{ borderColor: "var(--color-outline-variant)" }}>
              {proofPreview ? (
                <div className="w-44 h-28 mx-auto rounded-lg overflow-hidden relative border my-2 shadow-xs">
                  <Image src={proofPreview} alt="Bukti Transfer" fill className="object-cover" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center mx-auto">
                  <Upload size={20} />
                </div>
              )}

              <p className="text-2xs text-gray-500">
                {proofPreview ? "File siap diunggah" : "Pilih screenshot/foto bukti struk transfer"}
              </p>

              <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border text-2xs font-bold text-gray-700 bg-white hover:bg-slate-100 cursor-pointer shadow-2xs">
                <Upload size={13} />
                {proofFile ? "Ganti File Struk" : "Pilih Bukti Transfer"}
                <input type="file" accept="image/*" onChange={handleProofChange} className="hidden" />
              </label>
            </div>

            {proofFile && (
              <button
                type="button"
                disabled={uploading}
                onClick={handleUploadProof}
                className="w-full py-2.5 rounded-lg text-label-lg font-bold text-white shadow-xs transition-all flex items-center justify-center gap-2"
                style={{ background: "var(--color-primary)" }}
              >
                {uploading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" /> Mengunggah...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} /> Kirim Bukti Transfer
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 py-3 px-4 rounded-xl text-label-lg font-bold text-white shadow-xs transition-all flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            <MessageSquare size={18} />
            <span>Konfirmasi ke WhatsApp Admin</span>
          </a>

          <Link
            href="/"
            className="py-3 px-5 rounded-xl border text-label-lg font-bold text-gray-700 bg-white hover:bg-slate-50 shadow-xs flex items-center justify-center gap-2 transition-colors"
            style={{ borderColor: "var(--color-outline-variant)" }}
          >
            <Home size={18} />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
