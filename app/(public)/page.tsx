import Link from "next/link";
import {
  Sparkles,
  Phone,
  GraduationCap,
  BookOpen,
  Award,
  Clock,
  CheckCircle2,
  Users,
  Video,
  Home,
  ArrowRight,
  ShieldCheck,
  Target,
  FileText,
  Lightbulb,
  HeartHandshake,
} from "lucide-react";
import PublicLeadForm from "@/components/public/PublicLeadForm";
import TutorShowcaseSection from "@/components/public/TutorShowcaseSection";
import TestimoniSiswaSection from "@/components/public/TestimoniSiswaSection";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const waUrl =
    "https://wa.me/628123456789?text=Halo%20Sahabat%20Belajar%2C%20saya%20tertarik%20untuk%20konsultasi%20bimbingan%20belajar.";

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO SECTION (Design 6.1) */}
      <section className="relative overflow-hidden pt-8 sm:pt-14 pb-12 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF1FA] border border-[#9AC1E2] text-xs font-bold text-[#09408C]">
                <span className="brand-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
                <span>Comprehensive Academic Solution</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold text-[#09408C] tracking-tight leading-[1.15] font-display">
                Paham Konsep Dasar hingga Siap Berprestasi.
              </h1>

              <p className="text-base sm:text-lg text-[#5B6882] max-w-xl leading-relaxed">
                Bimbingan belajar privat & semi-privat (2-5 siswa) bersama tutor pakar ramah. Pilihan kelas <strong>Online (Zoom)</strong> maupun <strong>Home Visit</strong> langsung ke rumah Anda.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#daftar"
                  className="px-6 py-3.5 rounded-xl bg-[#09408C] hover:bg-[#0E3571] text-white font-bold text-sm transition-all shadow-md flex items-center gap-2"
                >
                  <span>Daftar Bimbingan</span>
                  <ArrowRight size={16} />
                </a>

                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 rounded-xl border border-[#D5DDEB] bg-white hover:bg-[#EAF1FA] text-[#09408C] font-bold text-sm transition-all flex items-center gap-2"
                >
                  <Phone size={16} className="text-[#1F6F4A]" />
                  <span>Konsultasi via WhatsApp</span>
                </a>
              </div>

              {/* Mini Highlights */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-[#5B6882] border-t border-[#D5DDEB]/60">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-[#09408C]" />
                  <span>Standar <strong>90 Menit</strong> / Pertemuan</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-[#09408C]" />
                  <span>Semi-Privat Maks <strong>5 Siswa</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#1F6F4A]" />
                  <span>Jaminan Pemahaman Konsep</span>
                </div>
              </div>
            </div>

            {/* Right Graphic: Circular Navy Frame (Design 3) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative">
                {/* Navy thick circular border */}
                <div className="w-72 h-72 sm:w-88 sm:h-88 rounded-full border-8 border-[#09408C] p-2 bg-white shadow-xl relative z-10 flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full rounded-full bg-linear-to-br from-[#EAF1FA] to-[#D5DDEB] flex flex-col items-center justify-center p-6 text-center">
                    <GraduationCap size={64} className="text-[#09408C] mb-2" />
                    <span className="font-extrabold text-[#09408C] text-lg font-display">
                      Sahabat Belajar
                    </span>
                    <span className="text-xs text-[#5B6882] font-semibold mt-1">
                      K-12 & Program Lanjutan
                    </span>
                    <div className="mt-3 px-3 py-1 bg-[#09408C] text-white rounded-full text-[11px] font-bold">
                      #BersamaSahabat
                    </div>
                  </div>
                </div>

                {/* Decorative Soft Badges */}
                <div className="absolute -top-3 -right-3 z-20 bg-white p-3 rounded-2xl shadow-md border border-[#D5DDEB] flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#E3F4EC] text-[#1F6F4A] flex items-center justify-center">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-[#1B2A41]">100% Personal</div>
                    <div className="text-[10px] text-[#5B6882]">Kurikulum fleksibel</div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-4 z-20 bg-white p-3 rounded-2xl shadow-md border border-[#D5DDEB] flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#FEF7E6] text-[#B45309] flex items-center justify-center">
                    <Clock size={18} />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-[#1B2A41]">90 Menit / Sesi</div>
                    <div className="text-[10px] text-[#5B6882]">Waktu belajar optimal</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MENGAPA KAMI HADIR (3 TANTANGAN PEMBELAJAR) */}
      <section id="tentang" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#09408C] uppercase tracking-wider bg-[#EAF1FA] px-3 py-1 rounded-full">
            Tantangan Belajar
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#09408C] mt-2 font-display">
            Mengapa Sahabat Belajar Hadir?
          </h2>
          <p className="text-xs sm:text-sm text-[#5B6882] mt-1.5">
            Banyak pembelajar mengalami kendala yang sama saat belajar mandiri atau di kelas besar:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#D5DDEB] shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-[#FBE9E5] text-[#B4381F] flex items-center justify-center mb-4">
              <Lightbulb size={24} />
            </div>
            <h3 className="text-base font-bold text-[#1B2A41] font-display">
              1. Terjebak Menghafal Rumus
            </h3>
            <p className="text-xs text-[#5B6882] mt-2 leading-relaxed">
              Siswa sering menghafal rumus tanpa mengerti logika dasarnya, sehingga bingung saat tipe soal divariasikan atau saat ujian sesungguhnya.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#D5DDEB] shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-[#FEF7E6] text-[#B45309] flex items-center justify-center mb-4">
              <Users size={24} />
            </div>
            <h3 className="text-base font-bold text-[#1B2A41] font-display">
              2. Ritme Kelas Terlalu Cepat
            </h3>
            <p className="text-xs text-[#5B6882] mt-2 leading-relaxed">
              Di kelas sekolah atau bimbingan massal, siswa yang ragu sering merasa sungkan bertanya karena tertinggal ritme rekan-rekannya.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#D5DDEB] shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-[#EAF1FA] text-[#09408C] flex items-center justify-center mb-4">
              <HeartHandshake size={24} />
            </div>
            <h3 className="text-base font-bold text-[#1B2A41] font-display">
              3. Minim Evaluasi Terarah
            </h3>
            <p className="text-xs text-[#5B6882] mt-2 leading-relaxed">
              Tidak adanya pencatatan perkembangan berkala membuat orang tua dan siswa tidak tahu pasti di bagian topik mana kelemahan sebenarnya.
            </p>
          </div>
        </div>
      </section>

      {/* 3. SOLUSI KAMI (3 PILAR SAHABAT BELAJAR) */}
      <section className="bg-white py-14 sm:py-20 border-y border-[#D5DDEB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-[#1F6F4A] uppercase tracking-wider bg-[#E3F4EC] px-3 py-1 rounded-full">
              Solusi Kami
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#09408C] mt-2 font-display">
              Belajar Bersahabat, Terarah, dan Berbasis Data
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#F4F7FB] border border-[#D5DDEB]">
              <div className="w-10 h-10 rounded-full bg-[#09408C] text-white flex items-center justify-center font-bold text-sm mb-3">
                1
              </div>
              <h3 className="font-bold text-base text-[#09408C] font-display">
                Pondasi Konsep Kokoh
              </h3>
              <p className="text-xs text-[#5B6882] mt-2 leading-relaxed">
                Kami membongkar konsep dasar dari nol sampai siswa benar-benar memahami &apos;mengapa&apos; dan &apos;bagaimana&apos; rumus tersebut bekerja.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F4F7FB] border border-[#D5DDEB]">
              <div className="w-10 h-10 rounded-full bg-[#09408C] text-white flex items-center justify-center font-bold text-sm mb-3">
                2
              </div>
              <h3 className="font-bold text-base text-[#09408C] font-display">
                Tutor Ramah & Berpengalaman
              </h3>
              <p className="text-xs text-[#5B6882] mt-2 leading-relaxed">
                Tutor diseleksi secara ketat, menguasai komunikasi edukatif yang sabar dan hangat seperti sahabat belajar sendiri.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F4F7FB] border border-[#D5DDEB]">
              <div className="w-10 h-10 rounded-full bg-[#09408C] text-white flex items-center justify-center font-bold text-sm mb-3">
                3
              </div>
              <h3 className="font-bold text-base text-[#09408C] font-display">
                Jurnal & Kuota Transparan
              </h3>
              <p className="text-xs text-[#5B6882] mt-2 leading-relaxed">
                Setiap pertemuan tercatat absensinya, sisa kuota terpantau real-time, dan jurnal materi dilaporkan langsung ke orang tua.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PROGRAM BELAJAR (K-12 & PROGRAM LANJUTAN) */}
      <section id="program" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#09408C] uppercase tracking-wider bg-[#EAF1FA] px-3 py-1 rounded-full">
            Katalog Program
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#09408C] mt-2 font-display">
            Program Bimbingan Lengkap untuk Setiap Jenjang
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* K-12 */}
          <div className="bg-white rounded-2xl border border-[#D5DDEB] p-6 shadow-xs hover:border-[#09408C] transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#EAF1FA] text-[#09408C] flex items-center justify-center mb-3">
              <GraduationCap size={20} />
            </div>
            <h3 className="text-lg font-bold text-[#09408C] font-display">
              Bimbel K-12 (SD, SMP, SMA)
            </h3>
            <p className="text-xs text-[#5B6882] mt-2 leading-relaxed">
              Pendampingan belajar mapel sekolah (Matematika, IPA, Fisika, Kimia, Bahasa Inggris, dll.), tugas sekolah, dan persiapan UTBK / SNBT.
            </p>
            <div className="mt-4 pt-3 border-t border-[#D5DDEB] text-xs font-semibold text-[#09408C]">
              Privat 1-on-1 • Semi-Privat (2-5 Siswa)
            </div>
          </div>

          {/* CPNS / BUMN */}
          <div className="bg-white rounded-2xl border border-[#D5DDEB] p-6 shadow-xs hover:border-[#09408C] transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#EAF1FA] text-[#295897] flex items-center justify-center mb-3">
              <Target size={20} />
            </div>
            <h3 className="text-lg font-bold text-[#09408C] font-display">
              Persiapan CPNS, BUMN & PPPK
            </h3>
            <p className="text-xs text-[#5B6882] mt-2 leading-relaxed">
              Bimbingan intensif materi Seleksi Kompetensi Dasar (SKD): Tes Wawasan Kebangsaan (TWK), Intelegensia Umum (TIU), dan Karakteristik Pribadi (TKP).
            </p>
            <div className="mt-4 pt-3 border-t border-[#D5DDEB] text-xs font-semibold text-[#09408C]">
              Latihan Soal & Pembahasan Konseptual
            </div>
          </div>

          {/* S2 / S3 & Beasiswa */}
          <div className="bg-white rounded-2xl border border-[#D5DDEB] p-6 shadow-xs hover:border-[#09408C] transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#EAF1FA] text-[#0CC0DF] flex items-center justify-center mb-3">
              <Award size={20} />
            </div>
            <h3 className="text-lg font-bold text-[#09408C] font-display">
              Persiapan S2/S3 & Beasiswa
            </h3>
            <p className="text-xs text-[#5B6882] mt-2 leading-relaxed">
              Bimbingan Tes Potensi Akademik (TPA), review berkas esai beasiswa LPDP / kampus top, dan simulasi wawancara akademik.
            </p>
            <div className="mt-4 pt-3 border-t border-[#D5DDEB] text-xs font-semibold text-[#09408C]">
              Mentoring Bersama Alumni Penerima Beasiswa
            </div>
          </div>

          {/* TOEFL & IELTS */}
          <div className="bg-white rounded-2xl border border-[#D5DDEB] p-6 shadow-xs hover:border-[#09408C] transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#EAF1FA] text-[#09408C] flex items-center justify-center mb-3">
              <BookOpen size={20} />
            </div>
            <h3 className="text-lg font-bold text-[#09408C] font-display">
              TOEFL & IELTS Preparation
            </h3>
            <p className="text-xs text-[#5B6882] mt-2 leading-relaxed">
              Strategi menaikkan skor Listening Comprehension, Structure & Written Expression, Reading, dan Speaking secara terarah.
            </p>
            <div className="mt-4 pt-3 border-t border-[#D5DDEB] text-xs font-semibold text-[#09408C]">
              Diagnostic Test & Latihan Terstruktur
            </div>
          </div>

          {/* Penulisan Ilmiah */}
          <div className="bg-white rounded-2xl border border-[#D5DDEB] p-6 shadow-xs hover:border-[#09408C] transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#EAF1FA] text-[#295897] flex items-center justify-center mb-3">
              <FileText size={20} />
            </div>
            <h3 className="text-lg font-bold text-[#09408C] font-display">
              Kepenulisan Ilmiah & Skripsi
            </h3>
            <p className="text-xs text-[#5B6882] mt-2 leading-relaxed">
              Bimbingan metodologi penelitian, teknik pengolahan data statistik, serta penyusunan karya tulis ilmiah dan artikel.
            </p>
            <div className="mt-4 pt-3 border-t border-[#D5DDEB] text-xs font-semibold text-[#09408C]">
              Privat 1-on-1 Bersama Tutor Peneliti
            </div>
          </div>

          {/* Model Kelas Banner */}
          <div className="bg-[#09408C] text-white rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-[#9AC1E2] uppercase tracking-wider">
                Model Kelas Sahabat Belajar
              </span>
              <h3 className="text-xl font-bold font-display mt-2">
                Pilih Model yang Paling Nyaman untuk Anda
              </h3>
              <p className="text-xs text-white/80 mt-2 leading-relaxed">
                Tersedia opsi <strong>Privat 1 Siswa</strong> untuk fokus penuh atau <strong>Semi-Privat (2-5 Siswa)</strong> untuk belajar seru bersama sahabat.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <span className="px-3 py-1 bg-white/10 rounded-lg text-xs font-semibold">
                Online Zoom
              </span>
              <span className="px-3 py-1 bg-white/10 rounded-lg text-xs font-semibold">
                Home Visit
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ALUR BELAJAR (5 LANGKAH) */}
      <section className="bg-white py-14 sm:py-20 border-y border-[#D5DDEB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-[#09408C] uppercase tracking-wider bg-[#EAF1FA] px-3 py-1 rounded-full">
              Alur Belajar
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#09408C] mt-2 font-display">
              5 Langkah Mudah Memulai Bimbingan
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                step: "01",
                title: "Konsultasi",
                desc: "Sampaikan kebutuhan dan target belajar melalui WhatsApp atau formulir website.",
              },
              {
                step: "02",
                title: "Tes Awal / Level",
                desc: "Pemetaan tingkat pemahaman awal agar materi yang diajarkan tepat sasaran.",
              },
              {
                step: "03",
                title: "Pencocokan Tutor",
                desc: "Admin mencocokkan tutor yang paling sesuai dengan topik dan jadwal Anda.",
              },
              {
                step: "04",
                title: "Sesi 90 Menit",
                desc: "Bimbingan berlangsung 90 menit per sesi (Online atau Home visit).",
              },
              {
                step: "05",
                title: "Evaluasi & Rapor",
                desc: "Jurnal materi dan evaluasi perkembangan dikomunikasikan secara transparan.",
              },
            ].map((st, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-[#F4F7FB] border border-[#D5DDEB] relative"
              >
                <div className="text-2xl font-extrabold text-[#09408C] font-display mb-2">
                  {st.step}
                </div>
                <h3 className="font-bold text-sm text-[#1B2A41] mb-1">{st.title}</h3>
                <p className="text-xs text-[#5B6882] leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. TUTOR BERPENGALAMAN & TIM PENGAJAR PAKAR */}
      <TutorShowcaseSection />

      {/* 7. PAKET BELAJAR (90 MENIT PER SESI) */}
      <section id="paket" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#09408C] uppercase tracking-wider bg-[#EAF1FA] px-3 py-1 rounded-full">
            Pilihan Paket
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#09408C] mt-2 font-display">
            Pilihan Paket Bimbingan Belajar
          </h2>
          <p className="text-xs sm:text-sm text-[#5B6882] mt-1.5">
            Durasi standar <strong>90 menit per pertemuan</strong>. Kuota berkurang hanya jika sesi terlaksana (BR-1).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Paket Kuota */}
          <div className="bg-white rounded-3xl border-2 border-[#09408C] p-6 sm:p-8 shadow-md relative flex flex-col justify-between">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#09408C] text-white text-[11px] font-bold">
              Paling Populer
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#09408C] font-display">
                Paket Berbasis Kuota
              </h3>
              <p className="text-xs text-[#5B6882] mt-1">
                Pilihan 5, 10, atau 20 pertemuan bebas atur jadwal.
              </p>
              <div className="mt-4 pt-4 border-t border-[#D5DDEB] space-y-2 text-xs text-[#1B2A41]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#1F6F4A]" />
                  <span>Durasi 90 menit per pertemuan</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#1F6F4A]" />
                  <span>Kuota hanya berkurang saat sesi selesai</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#1F6F4A]" />
                  <span>Jadwal fleksibel (Online / Home visit)</span>
                </div>
              </div>
            </div>
            <a
              href="#daftar"
              className="mt-6 block w-full py-2.5 rounded-xl bg-[#09408C] hover:bg-[#0E3571] text-white font-bold text-xs text-center transition-colors shadow-xs"
            >
              Pilih Paket Kuota
            </a>
          </div>

          {/* Paket Waktu */}
          <div className="bg-white rounded-3xl border border-[#D5DDEB] p-6 sm:p-8 shadow-xs hover:border-[#9AC1E2] transition-colors flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#09408C] font-display">
                Paket Berbasis Waktu
              </h3>
              <p className="text-xs text-[#5B6882] mt-1">
                Bimbingan teratur 1 bulan, 3 bulan, atau 6 bulan.
              </p>
              <div className="mt-4 pt-4 border-t border-[#D5DDEB] space-y-2 text-xs text-[#1B2A41]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#1F6F4A]" />
                  <span>Jadwal rutin mingguan terstruktur</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#1F6F4A]" />
                  <span>Durasi 90 menit per pertemuan</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#1F6F4A]" />
                  <span>Cocok untuk pendampingan semester</span>
                </div>
              </div>
            </div>
            <a
              href="#daftar"
              className="mt-6 block w-full py-2.5 rounded-xl border border-[#D5DDEB] hover:bg-[#EAF1FA] text-[#09408C] font-bold text-xs text-center transition-colors"
            >
              Pilih Paket Waktu
            </a>
          </div>

          {/* Paket Custom */}
          <div className="bg-white rounded-3xl border border-[#D5DDEB] p-6 sm:p-8 shadow-xs hover:border-[#9AC1E2] transition-colors flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#09408C] font-display">
                Paket Kustom
              </h3>
              <p className="text-xs text-[#5B6882] mt-1">
                Disesuaikan dengan kebutuhan khusus dan target ujian.
              </p>
              <div className="mt-4 pt-4 border-t border-[#D5DDEB] space-y-2 text-xs text-[#1B2A41]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#1F6F4A]" />
                  <span>Intensif persiapan ujian dalam 2 minggu</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#1F6F4A]" />
                  <span>Fokus mapel tertentu yang paling sulit</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#1F6F4A]" />
                  <span>Konsultasi gratis penyesuaian kurikulum</span>
                </div>
              </div>
            </div>
            <a
              href="#daftar"
              className="mt-6 block w-full py-2.5 rounded-xl border border-[#D5DDEB] hover:bg-[#EAF1FA] text-[#09408C] font-bold text-xs text-center transition-colors"
            >
              Konsultasikan Paket Kustom
            </a>
          </div>
        </div>
      </section>

      {/* 8. TESTIMONI SISWA & ORANG TUA */}
      <TestimoniSiswaSection />

      {/* 7. FORMULIR PENDAFTARAN & LEAD CAPTURE (A2) */}
      <section id="daftar" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <PublicLeadForm />
      </section>
    </div>
  );
}
