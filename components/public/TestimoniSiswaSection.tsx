import {
  Star,
  Quote,
  Award,
  CheckCircle2,
  Users,
  Video,
  Home,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export interface StudentTestimonial {
  id: string;
  name: string;
  role: string;
  schoolOrInstitution: string;
  program: string;
  classMode: string;
  modeIcon?: "home" | "video" | "users";
  achievement: string;
  rating: number;
  content: string;
  avatarColor: string;
  initials: string;
}

const DEFAULT_TESTIMONIALS: StudentTestimonial[] = [
  {
    id: "testi-1",
    name: "Ahmad Fauzi",
    role: "Siswa SMA Kelas 12",
    schoolOrInstitution: "SMA Negeri 1",
    program: "Bimbel K-12 (Matematika & Fisika Lanjutan)",
    classMode: "Privat Home Visit",
    modeIcon: "home",
    achievement: "🏆 Lolos SNBT Kedokteran Unair",
    rating: 5,
    content:
      "Dulu saya sangat takut fisika dan matematika karena di sekolah pembahasannya terlalu cepat. Bersama tutor Sahabat Belajar, materi 90 menit terasa sangat padat tapi santai. Konsep dasarnya dibongkar tuntas dari akar sampai saya bisa mengerjakan soal variasi tersulit.",
    avatarColor: "bg-[#09408C]",
    initials: "AF",
  },
  {
    id: "testi-2",
    name: "Ibu Ratna Dewi",
    role: "Orang Tua dari Kevin (Siswa SMP Kelas 8)",
    schoolOrInstitution: "SMP Negeri Unggulan",
    program: "Bimbel Reguler IPA & Matematika",
    classMode: "Privat Home Visit",
    modeIcon: "home",
    achievement: "📈 Nilai Rapor Naik dari 68 ke 94",
    rating: 5,
    content:
      "Sebagai ibu yang bekerja, saya sangat terbantu dengan jurnal pertemuan dan laporan sisa kuota yang transparan. Tutornya sangat sopan, santun, dan sabar mendampingi Kevin yang awalnya malas belajar. Sekarang nilai tugas dan ujiannya konsisten di atas 90.",
    avatarColor: "bg-[#295897]",
    initials: "RD",
  },
  {
    id: "testi-3",
    name: "Bima Wicaksono",
    role: "Peserta Seleksi CASN",
    schoolOrInstitution: "Kementerian BUMN / CPNS",
    program: "Persiapan Intensif SKD (TWK, TIU, TKP)",
    classMode: "Online Zoom Interaktif",
    modeIcon: "video",
    achievement: "⭐ Skor SKD 442 (Peringkat 1 Formasi)",
    rating: 5,
    content:
      "Materi TIU (penalaran dan numerik cepat) dari tutor benar-benar membuka cara berpikir logis di bawah tekanan waktu ujian. Bukan cuma rumus cepat instan, tapi paham pola soalnya. Kuota sesi belajarnya juga fleksibel dan tidak ada yang terbuang sia-sia.",
    avatarColor: "bg-[#0A2650]",
    initials: "BW",
  },
  {
    id: "testi-4",
    name: "Dinda Kirana",
    role: "Mahasiswi S1 / Calon Penerima Beasiswa",
    schoolOrInstitution: "Universitas Negeri",
    program: "TOEFL ITP Preparation & Structure",
    classMode: "Semi-Privat Online (3 Peserta)",
    modeIcon: "users",
    achievement: "🎯 Skor TOEFL Naik dari 465 ke 575",
    rating: 5,
    content:
      "Kelas semi-privatnya seru banget karena dibatasi maksimal 5 orang, jadi tutor tetap bisa mengoreksi satu per satu kelemahan grammar dan listening kami. Dalam 10 pertemuan, skor TOEFL saya naik lebih dari 100 poin dan lolos berkas beasiswa!",
    avatarColor: "bg-[#09408C]",
    initials: "DK",
  },
  {
    id: "testi-5",
    name: "Fathir & Sahabat",
    role: "Kelompok Belajar Siswa SMA Kelas 11",
    schoolOrInstitution: "SMA Swasta Favorit",
    program: "Semi-Privat Matematika & Kimia",
    classMode: "Semi-Privat Home Visit",
    modeIcon: "home",
    achievement: "✨ Juara Kelas & Juara Olimpiade Sains",
    rating: 5,
    content:
      "Belajar bertiga bareng sahabat rasanya asyik banget, tidak kaku tapi fokus. Tutornya seperti kakak sendiri yang asyik diajak diskusi soal sulit sampai paham. Nilai ujian harian kelompok kami semuanya kompak naik!",
    avatarColor: "bg-[#295897]",
    initials: "FS",
  },
  {
    id: "testi-6",
    name: "Drg. Maya Novitasari",
    role: "Dokter Gigi / Pendaftar Program Spesialis",
    schoolOrInstitution: "Program Pendidikan Dokter Gigi Spesialis",
    program: "Persiapan TPA Bappenas & Penulisan Proposal",
    classMode: "Privat Online 1-on-1",
    modeIcon: "video",
    achievement: "📜 Lolos Seleksi S2 Spesialis",
    rating: 5,
    content:
      "Di sela jadwal praktik klinik yang padat, durasi 90 menit per sesi di Sahabat Belajar sangat pas dan efisien. Tutor membantu mereview proposal riset serta melatih kecepatan penalaran TPA dengan pendekatan akademis bermutu tinggi.",
    avatarColor: "bg-[#0A2650]",
    initials: "MN",
  },
];

export default function TestimoniSiswaSection({
  testimonials = DEFAULT_TESTIMONIALS,
}: {
  testimonials?: StudentTestimonial[];
}) {
  return (
    <section id="testimoni" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF1FA] border border-[#9AC1E2] text-xs font-bold text-[#09408C] mb-3">
          <span className="brand-dots">
            <span></span>
            <span></span>
            <span></span>
          </span>
          <Award size={15} className="text-[#09408C]" />
          <span>Cerita Nyata Siswa & Orang Tua</span>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#09408C] tracking-tight font-display">
          Bukti Nyata Paham Konsep hingga Raih Prestasi
        </h2>

        <p className="text-xs sm:text-sm text-[#5B6882] mt-3 leading-relaxed">
          Ratusan siswa K-12, pejuang CPNS/BUMN, pemburu beasiswa, dan orang tua telah merasakan peningkatan pemahaman dan pencapaian target akademik bersama Sahabat Belajar.
        </p>
      </div>

      {/* Grid of Testimonials */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testi) => (
          <div
            key={testi.id}
            className="bg-white rounded-3xl border border-[#D5DDEB] p-6 shadow-xs hover:border-[#09408C] hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Top Bar: Achievement Badge & Stars */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E3F4EC] text-[#1F6F4A] text-xs font-bold border border-[#1F6F4A]/20 shadow-2xs">
                  {testi.achievement}
                </span>

                <div className="flex items-center gap-0.5 shrink-0 pt-0.5">
                  {Array.from({ length: testi.rating }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className="fill-[#F5B82E] text-[#F5B82E]"
                    />
                  ))}
                </div>
              </div>

              {/* Kutipan Testimoni */}
              <div className="mb-6 space-y-2">
                <div className="text-[#9AC1E2]">
                  <Quote size={22} className="fill-[#9AC1E2]/40" />
                </div>
                <p className="text-xs sm:text-[13px] text-[#1B2A41] leading-relaxed italic">
                  &ldquo;{testi.content}&rdquo;
                </p>
              </div>
            </div>

            {/* Profile Info */}
            <div className="pt-4 border-t border-[#D5DDEB] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Avatar Bulat dengan Border Navy */}
                <div className="w-11 h-11 rounded-full border-2 border-[#09408C] p-0.5 bg-white shrink-0">
                  <div
                    className={`w-full h-full rounded-full ${testi.avatarColor} text-white flex items-center justify-center font-bold text-xs font-display`}
                  >
                    {testi.initials}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-[#1B2A41] font-display">
                    {testi.name}
                  </h3>
                  <p className="text-[11px] text-[#5B6882]">
                    {testi.role}
                  </p>
                  <p className="text-[10px] font-semibold text-[#09408C]">
                    {testi.schoolOrInstitution}
                  </p>
                </div>
              </div>

              {/* Class Mode Icon / Chip */}
              <div className="text-right shrink-0">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F4F7FB] border border-[#D5DDEB] text-[10px] font-medium text-[#5B6882]">
                  {testi.modeIcon === "video" && <Video size={10} className="text-[#09408C]" />}
                  {testi.modeIcon === "home" && <Home size={10} className="text-[#1F6F4A]" />}
                  {testi.modeIcon === "users" && <Users size={10} className="text-[#295897]" />}
                  <span>{testi.classMode}</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trust & Satisfaction Metrics */}
      <div className="mt-12 bg-white rounded-3xl border border-[#D5DDEB] p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-[#D5DDEB]">
          <div className="pt-3 md:pt-0">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#09408C] font-display flex items-center justify-center gap-1">
              <span>4.9</span>
              <Star size={20} className="fill-[#F5B82E] text-[#F5B82E]" />
            </div>
            <div className="text-xs text-[#5B6882] mt-1 font-medium">
              Rata-rata Kepuasan Siswa
            </div>
          </div>

          <div className="pt-3 md:pt-0">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#09408C] font-display flex items-center justify-center gap-1">
              <span>94%</span>
              <TrendingUp size={20} className="text-[#1F6F4A]" />
            </div>
            <div className="text-xs text-[#5B6882] mt-1 font-medium">
              Kenaikan Nilai & Capaian Target
            </div>
          </div>

          <div className="pt-3 md:pt-0">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#09408C] font-display">
              1.200+
            </div>
            <div className="text-xs text-[#5B6882] mt-1 font-medium">
              Jam Sesi 90 Menit Terlaksana
            </div>
          </div>

          <div className="pt-3 md:pt-0">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#09408C] font-display flex items-center justify-center gap-1">
              <span>100%</span>
              <CheckCircle2 size={20} className="text-[#1F6F4A]" />
            </div>
            <div className="text-xs text-[#5B6882] mt-1 font-medium">
              Jurnal & Kuota Transparan
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
