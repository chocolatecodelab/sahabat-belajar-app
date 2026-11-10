"use client";

import { useState } from "react";
import { Send, CheckCircle2, AlertCircle, Phone, FileText, ArrowRight, ArrowLeft } from "lucide-react";
import { createPublicLead } from "@/actions/lead";

export default function PublicLeadForm() {
  const [step, setStep] = useState<1 | 2>(1);
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

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStep(2);
  };

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
    <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#D5DDEB] shadow-md space-y-6">
      <div className="border-b border-[#D5DDEB] pb-4">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#09408C] uppercase tracking-wider mb-1">
          <FileText size={14} className="text-[#09408C]" />
          <span>Formulir Pendaftaran & Konsultasi</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-[#09408C] font-display">
          Mulai Bimbingan Belajar Bersama Sahabat
        </h3>
        <p className="text-xs text-[#5B6882] mt-1">
          {step === 1
            ? "Langkah 1 dari 2: Tentukan program bimbingan dan metode belajar yang Anda butuhkan."
            : "Langkah 2 dari 2: Masukkan data kontak Anda agar tim konselor dapat menghubungi."}
        </p>

        {/* Progressive Disclosure Step Indicator */}
        <div className="flex items-center gap-2 pt-4">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              step === 1
                ? "bg-[#09408C] text-white shadow-xs"
                : "bg-[#EAF1FA] text-[#09408C] hover:bg-[#D5DDEB]"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[11px]">
              1
            </span>
            <span>Kebutuhan Belajar</span>
          </button>
          <div className="h-0.5 w-6 bg-[#D5DDEB]" />
          <button
            type="button"
            onClick={() => setStep(2)}
            className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              step === 2
                ? "bg-[#09408C] text-white shadow-xs"
                : "bg-[#F4F7FB] text-[#5B6882] hover:bg-[#EAF1FA]"
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center text-[11px]">
              2
            </span>
            <span>Data Kontak & Target</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 bg-[#FBE9E5] border border-[#B4381F] text-[#B4381F] rounded-xl text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleNextStep} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="lead-program" className="block text-xs font-bold text-[#1B2A41] mb-1.5">
                Program Bimbingan yang Diminati *
              </label>
              <select
                id="lead-program"
                value={programInterest}
                onChange={(e) => {
                  const selectedProg = e.target.value;
                  setProgramInterest(selectedProg);
                  // UX-FORM-001: Smart Default Synchronization antara Program & Jenjang
                  if (selectedProg === "K-12 (SD/SMP/SMA)") {
                    setLevel("SMA");
                  } else if (selectedProg === "Persiapan CPNS / BUMN / PPPK") {
                    setLevel("Umum / Fresh Graduate");
                  } else if (
                    selectedProg === "Persiapan S2 / S3 & Beasiswa" ||
                    selectedProg === "Kepenulisan Ilmiah & Skripsi/Tesis"
                  ) {
                    setLevel("Kuliah (S1/S2)");
                  } else if (selectedProg === "TOEFL & IELTS Preparation") {
                    setLevel("Kuliah (S1/S2)");
                  }
                }}
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
              <label htmlFor="lead-level" className="block text-xs font-bold text-[#1B2A41] mb-1.5">
                Jenjang Pendidikan Saat Ini
              </label>
              <select
                id="lead-level"
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
              <label htmlFor="lead-class-model" className="block text-xs font-bold text-[#1B2A41] mb-1.5">
                Model Kelas
              </label>
              <select
                id="lead-class-model"
                value={classModel}
                onChange={(e) => setClassModel(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-[#D5DDEB] focus-ring bg-white font-medium text-[#1B2A41]"
              >
                <option value="PRIVAT">Privat 1-on-1 (Intensif)</option>
                <option value="SEMI_PRIVAT">Semi-Privat (2-5 Siswa Bersama Teman)</option>
              </select>
            </div>

            <div>
              <label htmlFor="lead-learning-mode" className="block text-xs font-bold text-[#1B2A41] mb-1.5">
                Metode Pembelajaran
              </label>
              <select
                id="lead-learning-mode"
                value={learningMode}
                onChange={(e) => setLearningMode(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-[#D5DDEB] focus-ring bg-white font-medium text-[#1B2A41]"
              >
                <option value="ONLINE">Online (Live Zoom / Google Meet)</option>
                <option value="HOME_VISIT">Home Visit (Tutor Datang ke Rumah)</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-xl bg-[#09408C] hover:bg-[#0E3571] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Lanjut ke Data Kontak & Jadwal</span>
              <ArrowRight size={16} />
            </button>
            <p className="text-[11px] text-[#5B6882] text-center mt-2">
              Langkah 1 dari 2 • Bebas biaya pendaftaran awal
            </p>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-[#EAF1FA] p-3 rounded-xl border border-[#9AC1E2] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#09408C] font-semibold">
              <span>Program Dipilih:</span>
              <strong className="text-[#1B2A41]">{programInterest} ({level})</strong>
              <span className="hidden sm:inline text-[#5B6882]">• {classModel === "PRIVAT" ? "Privat" : "Semi-Privat"} • {learningMode === "ONLINE" ? "Online" : "Home Visit"}</span>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-[#09408C] hover:underline font-bold text-[11px] shrink-0"
            >
              Ubah
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="lead-name" className="block text-xs font-bold text-[#1B2A41] mb-1.5">
                Nama Lengkap Anda / Siswa *
              </label>
              <input
                id="lead-name"
                type="text"
                required
                placeholder="Contoh: Nabil Ramadhan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-[#D5DDEB] focus-ring bg-white"
              />
            </div>

            <div>
              <label htmlFor="lead-phone" className="block text-xs font-bold text-[#1B2A41] mb-1.5">
                Nomor WhatsApp Aktif *
              </label>
              <input
                id="lead-phone"
                type="tel"
                required
                placeholder="Contoh: 08123456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-[#D5DDEB] focus-ring bg-white"
              />
            </div>
          </div>

          <div>
            <label htmlFor="lead-email" className="block text-xs font-bold text-[#1B2A41] mb-1.5">
              Alamat Email (Opsional)
            </label>
            <input
              id="lead-email"
              type="email"
              placeholder="Contoh: nabil@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-[#D5DDEB] focus-ring bg-white"
            />
          </div>

          <div>
            <label htmlFor="lead-notes" className="block text-xs font-bold text-[#1B2A41] mb-1.5">
              Keluhan Belajar / Target yang Ingin Dicapai (Opsional)
            </label>
            <textarea
              id="lead-notes"
              rows={3}
              placeholder="Misal: Kesulitan memahami rumus fisika dasar, ingin persiapan UTBK / tes SKD CPNS bulan depan..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-[#D5DDEB] focus-ring bg-white"
            />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full sm:w-auto py-3 px-5 rounded-xl border border-[#D5DDEB] text-[#5B6882] hover:text-[#1B2A41] hover:bg-[#F4F7FB] font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft size={15} />
              <span>Kembali</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-[#09408C] hover:bg-[#0E3571] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Send size={16} />
              <span>{isSubmitting ? "Mengirim Pendaftaran..." : "Daftar & Konsultasi Gratis Sekarang"}</span>
            </button>
          </div>
          <p className="text-[11px] text-[#5B6882] text-center mt-2">
            Privasi Anda terjamin. Data hanya digunakan untuk kebutuhan koordinasi bimbingan Sahabat Belajar.
          </p>
        </form>
      )}
    </div>
  );
}
