"use client";

import { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Phone, Sparkles } from "lucide-react";
import { createPublicLead } from "@/actions/lead";

export default function PublicLeadForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [programInterest, setProgramInterest] = useState("K-12 (SD/SMP/SMA)");
  const [level, setLevel] = useState("SMA");
  const [classModel, setClassModel] = useState("PRIVAT");
  const [learningMode, setLearningMode] = useState("ONLINE");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim() || !phone.trim()) {
      setErrorMessage("Nama lengkap dan nomor WhatsApp wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    const res = await createPublicLead({
      name,
      phone,
      email: email || undefined,
      programInterest,
      level,
      classModel,
      learningMode,
      notes,
    });
    setIsSubmitting(false);

    if (res.success) {
      setIsSuccess(true);
    } else {
      setErrorMessage(res.message || "Gagal mengirim formulir.");
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-[#9AC1E2] shadow-sm text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-[#E3F4EC] text-[#1F6F4A] flex items-center justify-center mx-auto">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-2xl font-bold text-[#09408C] font-display">
          Terima Kasih, {name}!
        </h3>
        <p className="text-sm text-[#5B6882] max-w-md mx-auto leading-relaxed">
          Pendaftaran konsultasi Anda telah berhasil tercatat di sistem Sahabat Belajar. Tim konselor kami akan segera menghubungi nomor WhatsApp <strong>{phone}</strong> untuk mendiskusikan jadwal dan rencana belajar terbaik.
        </p>

        <div className="pt-4">
          <a
            href={`https://wa.me/628123456789?text=Halo%20Sahabat%20Belajar%2C%20saya%20sudah%20mengisi%20formulir%20pendaftaran%20atas%20nama%20${encodeURIComponent(
              name
            )}.`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1F6F4A] text-white text-sm font-semibold hover:bg-[#165538] transition-colors shadow-xs"
          >
            <Phone size={16} />
            <span>Chat Admin WhatsApp Sekarang</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-3xl p-6 sm:p-10 border border-[#D5DDEB] shadow-md space-y-5"
    >
      <div className="border-b border-[#D5DDEB] pb-4">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#09408C] uppercase tracking-wider mb-1">
          <Sparkles size={14} className="text-[#0CC0DF]" />
          <span>Formulir Pendaftaran & Konsultasi</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-[#09408C] font-display">
          Mulai Bimbingan Belajar Bersama Sahabat
        </h3>
        <p className="text-xs text-[#5B6882] mt-1">
          Isi data diri Anda di bawah ini. Tim kami akan menyiapkan rekomendasi tutor dan rancangan jadwal belajar.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 bg-[#FBE9E5] border border-[#B4381F] text-[#B4381F] rounded-xl text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-[#1B2A41] mb-1.5">
            Nama Lengkap Anda / Siswa *
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Nabil Ramadhan"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-xs p-3 rounded-xl border border-[#D5DDEB] focus-ring bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#1B2A41] mb-1.5">
            Nomor WhatsApp Aktif *
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: 08123456789"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full text-xs p-3 rounded-xl border border-[#D5DDEB] focus-ring bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#1B2A41] mb-1.5">
            Program Bimbingan yang Diminati
          </label>
          <select
            value={programInterest}
            onChange={(e) => setProgramInterest(e.target.value)}
            className="w-full text-xs p-3 rounded-xl border border-[#D5DDEB] focus-ring bg-white font-medium text-[#1B2A41]"
          >
            <option value="K-12 (SD/SMP/SMA)">Bimbel K-12 (SD, SMP, SMA)</option>
            <option value="Persiapan CPNS / BUMN / PPPK">Persiapan CPNS / BUMN / PPPK</option>
            <option value="Persiapan S2 / S3 & Beasiswa">Persiapan S2 / S3 & Beasiswa</option>
            <option value="TOEFL & IELTS Preparation">TOEFL & IELTS Preparation</option>
            <option value="Kepenulisan Ilmiah & Skripsi/Tesis">Kepenulisan Ilmiah & Skripsi/Tesis</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#1B2A41] mb-1.5">
            Jenjang Pendidikan Saat Ini
          </label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full text-xs p-3 rounded-xl border border-[#D5DDEB] focus-ring bg-white font-medium text-[#1B2A41]"
          >
            <option value="SD">SD (Sekolah Dasar)</option>
            <option value="SMP">SMP</option>
            <option value="SMA">SMA</option>
            <option value="Kuliah (S1/S2)">Kuliah (S1 / S2)</option>
            <option value="Umum / Fresh Graduate">Umum / Fresh Graduate</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#1B2A41] mb-1.5">
            Model Kelas
          </label>
          <select
            value={classModel}
            onChange={(e) => setClassModel(e.target.value)}
            className="w-full text-xs p-3 rounded-xl border border-[#D5DDEB] focus-ring bg-white font-medium text-[#1B2A41]"
          >
            <option value="PRIVAT">Privat 1-on-1 (Intensif)</option>
            <option value="SEMI_PRIVAT">Semi-Privat (2-5 Siswa Bersama Teman)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#1B2A41] mb-1.5">
            Metode Pembelajaran
          </label>
          <select
            value={learningMode}
            onChange={(e) => setLearningMode(e.target.value)}
            className="w-full text-xs p-3 rounded-xl border border-[#D5DDEB] focus-ring bg-white font-medium text-[#1B2A41]"
          >
            <option value="ONLINE">Online (Live Zoom / Google Meet)</option>
            <option value="HOME_VISIT">Home Visit (Tutor Datang ke Rumah)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-[#1B2A41] mb-1.5">
          Keluhan Belajar / Target yang Ingin Dicapai (Opsional)
        </label>
        <textarea
          rows={3}
          placeholder="Misal: Kesulitan memahami rumus fisika dasar, ingin persiapan UTBK / tes SKD CPNS bulan depan..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full text-xs p-3 rounded-xl border border-[#D5DDEB] focus-ring bg-white"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-6 rounded-xl bg-[#09408C] hover:bg-[#0E3571] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Send size={16} />
          <span>{isSubmitting ? "Mengirim Pendaftaran..." : "Kirim Formulir Pendaftaran"}</span>
        </button>
        <p className="text-[11px] text-[#5B6882] text-center mt-2">
          Privasi Anda terjamin. Data hanya digunakan untuk kebutuhan koordinasi bimbingan Sahabat Belajar.
        </p>
      </div>
    </form>
  );
}
