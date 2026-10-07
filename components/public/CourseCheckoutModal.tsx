"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  CheckCircle2,
  QrCode,
  Building2,
  Copy,
  Upload,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  Check,
  Calendar,
  Clock,
  User,
  School,
  FileText,
  GraduationCap,
} from "lucide-react";
import Image from "next/image";
import { createEnrollment, uploadPaymentProof } from "@/actions/pendaftaran";
import { getPaymentAccounts, type PaymentAccountItem } from "@/actions/pembayaran";
import type { CourseItem } from "@/actions/kursus";

interface CourseCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: CourseItem;
}

export default function CourseCheckoutModal({
  isOpen,
  onClose,
  course,
}: CourseCheckoutModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State Step 1: Biodata
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [institution, setInstitution] = useState("");
  const [educationLevel, setEducationLevel] = useState("S1 (Skripsi)");
  const [researchTopic, setResearchTopic] = useState("");

  // Payment Methods
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccountItem[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<"QRIS" | "BANK_TRANSFER">("QRIS");
  const [selectedBank, setSelectedBank] = useState<PaymentAccountItem | null>(null);

  // Result from Step 1 submit
  const [invoiceData, setInvoiceData] = useState<{
    invoiceNumber: string;
    totalAmount: number;
    uniqueCode: number;
  } | null>(null);

  // Upload proof state
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [copiedBank, setCopiedBank] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Reset scroll container position when switching between step 1 and step 2
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [step]);

  useEffect(() => {
    if (isOpen) {
      getPaymentAccounts().then((accounts) => {
        setPaymentAccounts(accounts);
        const firstBank = accounts.find((a) => a.type === "BANK");
        if (firstBank) setSelectedBank(firstBank);
      });
    }
  }, [isOpen]);

  const qrisAccount = paymentAccounts.find((a) => a.type === "QRIS");
  const bankAccounts = paymentAccounts.filter((a) => a.type === "BANK");

  const basePrice = course.isFree ? 0 : (course.salePrice !== null && course.salePrice !== undefined ? course.salePrice : course.price);

  // Handle Step 1 Submit: Create Enrollment
  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !institution) {
      setError("Mohon lengkapi semua kolom biodata pendaftaran");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await createEnrollment({
        courseId: course.id,
        name,
        email,
        phone,
        institution,
        educationLevel,
        researchTopic,
        paymentMethod: course.isFree ? "FREE" : selectedMethod,
        bankName: selectedMethod === "BANK_TRANSFER" ? selectedBank?.bankName : "QRIS",
      });

      if (res.success && res.data) {
        setInvoiceData(res.data);
        if (course.isFree) {
          router.push(`/pembayaran/sukses?inv=${res.data.invoiceNumber}`);
          onClose();
        } else {
          setStep(2);
        }
      } else {
        setError(res.message || "Gagal membuat pendaftaran");
      }
    } catch {
      setError("Terjadi kesalahan jaringan saat memproses pendaftaran");
    } finally {
      setLoading(false);
    }
  };

  // Handle Proof File Change
  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file);
      setProofPreview(URL.createObjectURL(file));
    }
  };

  // Handle Step 2 / 3 Submit: Upload Proof
  const handleSubmitProof = async () => {
    if (!invoiceData) return;
    if (!proofFile) {
      setError("Silakan pilih foto/screenshot bukti transfer terlebih dahulu");
      return;
    }

    setUploadingProof(true);
    setError("");

    try {
      // 1. Upload image to /api/upload
      const formData = new FormData();
      formData.append("file", proofFile);
      formData.append("folder", "payments");

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Gagal mengunggah file bukti");
      const uploadData = await uploadRes.json();

      // 2. Save payment proof URL to enrollment
      const saveRes = await uploadPaymentProof(invoiceData.invoiceNumber, uploadData.url);
      if (saveRes.success) {
        router.push(`/pembayaran/sukses?inv=${invoiceData.invoiceNumber}`);
        onClose();
      } else {
        setError(saveRes.message || "Gagal menyimpan bukti pembayaran");
      }
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan saat mengunggah bukti");
    } finally {
      setUploadingProof(false);
    }
  };

  const handleCopyAccount = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in font-[var(--font-body)]">
      <div
        className="elevation-2 rounded-2xl bg-white w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border shadow-2xl"
        style={{
          borderColor: "var(--color-outline-variant)",
          borderTop: "4px solid var(--color-primary)",
        }}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b flex items-center justify-between" style={{ borderColor: "var(--color-outline-variant)" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-xs"
              style={{
                background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
                color: "var(--color-primary)",
              }}
            >
              <GraduationCap size={20} />
            </div>
            <div>
              <h3 className="font-bold text-headline-sm font-[var(--font-heading)]" style={{ color: "var(--color-on-surface)" }}>
                Pendaftaran Program Riset
              </h3>
              <p className="text-2xs text-gray-500 truncate max-w-sm sm:max-w-md">
                {course.title}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="px-6 py-2.5 bg-slate-50 border-b flex items-center justify-center gap-3 text-2xs font-bold text-gray-500" style={{ borderColor: "var(--color-outline-variant)" }}>
          <div className={`flex items-center gap-1.5 ${step >= 1 ? "text-[var(--color-primary)] font-extrabold" : ""}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-3xs ${step >= 1 ? "bg-[var(--color-primary)] text-white" : "bg-gray-200 text-gray-600"}`}>
              1
            </span>
            <span>Data Calon Peneliti</span>
          </div>
          <span className="text-gray-300">──</span>
          <div className={`flex items-center gap-1.5 ${step >= 2 ? "text-[var(--color-primary)] font-extrabold" : ""}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-3xs ${step >= 2 ? "bg-[var(--color-primary)] text-white" : "bg-gray-200 text-gray-600"}`}>
              2
            </span>
            <span>Pembayaran & Bukti</span>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-2xs font-semibold flex items-center justify-between">
            <span>{error}</span>
            <button type="button" onClick={() => setError("")}><X size={14} /></button>
          </div>
        )}

        {/* Modal Content */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6">
          {/* STEP 1: FORM BIODATA */}
          {step === 1 && (
            <form onSubmit={handleProceedToPayment} className="space-y-4">
              {/* Course Mini Summary */}
              <div className="p-3.5 rounded-xl bg-slate-50 border flex items-center justify-between" style={{ borderColor: "var(--color-outline-variant)" }}>
                <div>
                  <span className="text-3xs font-bold uppercase text-[var(--color-primary)] px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                    {course.category}
                  </span>
                  <h4 className="font-bold text-body-sm text-gray-900 mt-1">{course.title}</h4>
                  <div className="flex items-center gap-3 text-3xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1"><Calendar size={11} /> {course.startDate || "Jadwal Fleksibel"}</span>
                    <span className="flex items-center gap-1"><Clock size={11} /> {course.duration || "4 Minggu"}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-3xs text-gray-400 block">Biaya Program</span>
                  <strong className="text-headline-sm font-extrabold text-[var(--color-primary)]">
                    {course.isFree ? "GRATIS" : `Rp ${basePrice.toLocaleString("id-ID")}`}
                  </strong>
                </div>
              </div>

              {/* Biodata Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="checkout-name" className="text-label-md font-bold block mb-1" style={{ color: "var(--color-on-surface)" }}>
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      id="checkout-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nama lengkap + gelar (untuk sertifikat)"
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-lg border text-body-sm focus-ring bg-white"
                      style={{ borderColor: "var(--color-outline-variant)" }}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="checkout-phone" className="text-label-md font-bold block mb-1" style={{ color: "var(--color-on-surface)" }}>
                    Nomor WhatsApp Aktif <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    required
                    className="w-full px-3 py-2 rounded-lg border text-body-sm focus-ring bg-white"
                    style={{ borderColor: "var(--color-outline-variant)" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="checkout-email" className="text-label-md font-bold block mb-1" style={{ color: "var(--color-on-surface)" }}>
                    Email Aktif <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="checkout-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alamat.email@gmail.com"
                    required
                    className="w-full px-3 py-2 rounded-lg border text-body-sm focus-ring bg-white"
                    style={{ borderColor: "var(--color-outline-variant)" }}
                  />
                </div>

                <div>
                  <label htmlFor="checkout-institution" className="text-label-md font-bold block mb-1" style={{ color: "var(--color-on-surface)" }}>
                    Asal Kampus / Instansi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <School size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      id="checkout-institution"
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="Universitas / Lembaga Riset"
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-lg border text-body-sm focus-ring bg-white"
                      style={{ borderColor: "var(--color-outline-variant)" }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="checkout-education-level" className="text-label-md font-bold block mb-1" style={{ color: "var(--color-on-surface)" }}>
                    Jenjang Studi / Profesi
                  </label>
                  <select
                    id="checkout-education-level"
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border text-body-sm focus-ring bg-white font-medium"
                    style={{ borderColor: "var(--color-outline-variant)" }}
                  >
                    <option value="S1 (Skripsi)">S1 (Mahasiswa Skripsi)</option>
                    <option value="S2 (Tesis)">S2 (Mahasiswa Tesis)</option>
                    <option value="S3 (Disertasi)">S3 (Kandidat Doktor/Disertasi)</option>
                    <option value="Dosen / Peneliti">Dosen / Peneliti Institusi</option>
                    <option value="Praktisi / Umum">Praktisi / Umum</option>
                  </select>
                </div>

                {!course.isFree && (
                  <div>
                    <label className="text-label-md font-bold block mb-1" style={{ color: "var(--color-on-surface)" }}>
                      Metode Pembayaran
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedMethod("QRIS")}
                        className={`p-2 rounded-lg border text-2xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          selectedMethod === "QRIS"
                            ? "bg-blue-50 border-[var(--color-primary)] text-[var(--color-primary)] shadow-xs"
                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <QrCode size={14} /> QRIS (Instant)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedMethod("BANK_TRANSFER")}
                        className={`p-2 rounded-lg border text-2xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                          selectedMethod === "BANK_TRANSFER"
                            ? "bg-blue-50 border-[var(--color-primary)] text-[var(--color-primary)] shadow-xs"
                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <Building2 size={14} /> Transfer Bank
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="checkout-research-topic" className="text-label-md font-bold block mb-1" style={{ color: "var(--color-on-surface)" }}>
                  Topik Penelitian / Kendala Riset Anda (Opsional)
                </label>
                <textarea
                  id="checkout-research-topic"
                  value={researchTopic}
                  onChange={(e) => setResearchTopic(e.target.value)}
                  rows={2}
                  placeholder="Contoh: Sedang menyusun Bab 4 dengan SmartPLS 4, mengalami kendala pada uji mediasi..."
                  className="w-full px-3 py-2 rounded-lg border text-body-sm focus-ring bg-white resize-none"
                  style={{ borderColor: "var(--color-outline-variant)" }}
                />
              </div>

              <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: "var(--color-outline-variant)" }}>
                <div className="flex items-center gap-1 text-2xs text-gray-400">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>Data aman & terenkripsi</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-lg text-label-lg font-bold text-white shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                  style={{ background: "var(--color-primary)" }}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" /> Memproses...
                    </>
                  ) : course.isFree ? (
                    <>
                      <Check size={16} /> Daftar Sekarang (Gratis)
                    </>
                  ) : (
                    <>
                      Lanjut ke Pembayaran <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: INVOICE & INSTRUKSI PEMBAYARAN */}
          {step === 2 && invoiceData && (
            <div className="space-y-5 animate-fade-in">
              {/* Total Amount Box with Unique Code */}
              <div
                className="p-4 rounded-xl text-center border relative overflow-hidden"
                style={{
                  background: "var(--color-surface-container-low)",
                  borderColor: "var(--color-outline-variant)",
                }}
              >
                <span className="text-3xs font-bold uppercase text-gray-500 tracking-wider">
                  Total Biaya yang Harus Ditransfer
                </span>
                <div className="text-display-md font-extrabold text-[var(--color-primary)] my-1">
                  Rp {invoiceData.totalAmount.toLocaleString("id-ID")}
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-300 text-amber-900 text-2xs font-semibold">
                  <ShieldCheck size={12} className="text-amber-800" />
                  <span>Sudah termasuk 3 digit kode unik verifikasi: <strong>{invoiceData.uniqueCode}</strong></span>
                </div>
                <p className="text-3xs text-gray-400 mt-2">
                  Nomor Invoice: <strong className="text-gray-700">{invoiceData.invoiceNumber}</strong>
                </p>
              </div>

              {/* QRIS Display */}
              {selectedMethod === "QRIS" ? (
                <div className="p-4 rounded-xl border bg-slate-50 text-center space-y-3" style={{ borderColor: "var(--color-outline-variant)" }}>
                  <div className="flex items-center justify-center gap-2 text-label-lg font-bold text-gray-900">
                    <QrCode size={18} className="text-[#001847]" />
                    <span>Scan QRIS Resmi BIAS RISTEK</span>
                  </div>
                  <p className="text-2xs text-gray-500 max-w-sm mx-auto">
                    {qrisAccount?.instructions || "Buka aplikasi GoPay, OVO, Dana, ShopeePay, atau BCA/Mandiri Mobile lalu scan barcode di bawah."}
                  </p>

                  <div className="w-52 h-52 mx-auto rounded-xl overflow-hidden bg-white p-2 border shadow-sm relative" style={{ borderColor: "var(--color-outline-variant)" }}>
                    {qrisAccount?.qrisImage ? (
                      <Image
                        src={qrisAccount.qrisImage}
                        alt="QRIS Barcode"
                        fill
                        className="object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <QrCode size={64} className="text-blue-900" />
                        <span className="text-3xs font-bold text-gray-600 mt-1">QRIS BIAS RISTEK</span>
                      </div>
                    )}
                  </div>
                  <span className="text-3xs text-gray-400 block">NMID: ID1020084920194 • BIAS RISTEK INDONESIA</span>
                </div>
              ) : (
                /* Bank Transfer Display */
                <div className="space-y-3">
                  <label className="text-label-md font-bold block" style={{ color: "var(--color-on-surface)" }}>
                    Pilih Rekening Tujuan Transfer:
                  </label>
                  <div className="space-y-2">
                    {bankAccounts.map((b) => {
                      const isSelected = selectedBank?.id === b.id;
                      return (
                        <div
                          key={b.id}
                          onClick={() => setSelectedBank(b)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? "bg-blue-50/70 border-[var(--color-primary)] shadow-xs"
                              : "bg-white border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-[#001847] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                              {b.bankName.slice(0, 3)}
                            </div>
                            <div>
                              <p className="text-body-sm font-bold text-gray-900">{b.bankName}</p>
                              <p className="text-2xs text-gray-500 font-mono">
                                No. Rek: <strong className="text-gray-900">{b.accountNumber}</strong>
                              </p>
                              <p className="text-3xs text-gray-400">a.n. {b.accountHolder}</p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (b.accountNumber) handleCopyAccount(b.accountNumber);
                            }}
                            className="px-2.5 py-1.5 rounded-lg border text-2xs font-bold flex items-center gap-1 text-gray-700 bg-white hover:bg-gray-100 shadow-2xs"
                            style={{ borderColor: "var(--color-outline-variant)" }}
                          >
                            {copiedBank ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                            Salin
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Upload Proof Dropzone */}
              <div className="p-4 rounded-xl border-2 border-dashed bg-slate-50 text-center space-y-2" style={{ borderColor: "var(--color-outline-variant)" }}>
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center mx-auto">
                  <Upload size={20} />
                </div>
                <h5 className="text-body-sm font-bold text-gray-900">
                  Unggah Bukti Struk Transfer (Screenshot/Foto)
                </h5>
                <p className="text-3xs text-gray-500 max-w-sm mx-auto">
                  Format JPG, PNG, atau WebP untuk mempercepat verifikasi otomatis admin
                </p>

                {proofPreview && (
                  <div className="w-32 h-20 mx-auto rounded-lg overflow-hidden relative border my-2">
                    <Image src={proofPreview} alt="Preview Bukti" fill className="object-cover" />
                  </div>
                )}

                <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border text-2xs font-bold text-gray-700 bg-white hover:bg-slate-100 cursor-pointer shadow-2xs">
                  <Upload size={13} />
                  {proofFile ? "Ganti File Bukti" : "Pilih File Struk"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProofChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Step 2 Actions */}
              <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: "var(--color-outline-variant)" }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-lg border text-body-sm font-semibold hover:bg-gray-100"
                  style={{ borderColor: "var(--color-outline-variant)" }}
                >
                  Kembali
                </button>

                <button
                  type="button"
                  disabled={uploadingProof || !proofFile}
                  onClick={handleSubmitProof}
                  className="px-6 py-2.5 rounded-lg text-label-lg font-bold text-white shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                  style={{ background: "var(--color-primary)" }}
                >
                  {uploadingProof ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" /> Mengunggah...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} /> Konfirmasi Pembayaran
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
