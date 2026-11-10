import Link from "next/link";
import Image from "next/image";
import {
  GraduationCap,
  Sparkles,
  Star,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export interface TutorShowcaseItem {
  id: string;
  name: string;
  degree: string;
  campus: string;
  expertise: string[];
  experienceYears: number;
  totalSessions: number;
  rating: number;
  quote: string;
  avatarColor: string;
  initials: string;
  avatarUrl?: string;
  highlightTag: string;
}

const DEFAULT_FEATURED_TUTORS: TutorShowcaseItem[] = [
  {
    id: "tutor-1",
    name: "Dr. Hendra Wijaya",
    degree: "M.Pd",
    campus: "Universitas Indonesia",
    expertise: ["Matematika Lanjutan", "Fisika SMA", "Persiapan UTBK SNBT"],
    experienceYears: 8,
    totalSessions: 520,
    rating: 4.9,
    quote:
      "Membantu siswa menaklukkan soal hitungan dengan membongkar konsep dasar secara visual dan aplikatif, bukan hafalan rumus.",
    avatarColor: "bg-[#09408C]",
    initials: "HW",
    avatarUrl: "/images/tutors/tutor-hendra.jpg",
    highlightTag: "Pakar SNBT & Sains",
  },
  {
    id: "tutor-2",
    name: "Sarah Amelia",
    degree: "S.Si",
    campus: "Universitas Gadjah Mada",
    expertise: ["Biologi Medis", "Kimia Terapan", "Pendampingan K-12"],
    experienceYears: 5,
    totalSessions: 380,
    rating: 4.9,
    quote:
      "Belajar sains itu menyenangkan saat dipandu dengan sabar dan contoh riil kehidupan sehari-hari.",
    avatarColor: "bg-[#295897]",
    initials: "SA",
    avatarUrl: "/images/tutors/tutor-sarah.jpg",
    highlightTag: "Persiapan Kedokteran",
  },
  {
    id: "tutor-3",
    name: "Rizky Pratama",
    degree: "S.T., M.Sc",
    campus: "Institut Teknologi Bandung",
    expertise: ["Tes Intelegensia Umum (TIU)", "TPA Bappenas", "Logika Analitik SKD"],
    experienceYears: 6,
    totalSessions: 410,
    rating: 5.0,
    quote:
      "Trik berhitung cepat hanya ampuh bila pemahaman logikanya kokoh. Kami latih strategi menembus passing grade tinggi.",
    avatarColor: "bg-[#0A2650]",
    initials: "RP",
    avatarUrl: "/images/tutors/tutor-rizky.jpg",
    highlightTag: "Master SKD CPNS & Kedinasan",
  },
  {
    id: "tutor-4",
    name: "Nadia Safitri",
    degree: "M.Hum",
    campus: "Universitas Airlangga",
    expertise: ["TOEFL ITP/iBT", "IELTS Academic (Skor 8.0)", "Academic Writing"],
    experienceYears: 7,
    totalSessions: 460,
    rating: 4.9,
    quote:
      "Diagnostik tepat sasaran: kita langsung perbaiki kelemahan grammar dan listening tanpa membuang waktu.",
    avatarColor: "bg-[#09408C]",
    initials: "NS",
    avatarUrl: "/images/tutors/tutor-nadia.jpg",
    highlightTag: "IELTS 8.0 & TOEFL Specialist",
  },
];

export default function TutorShowcaseSection({
  tutors = DEFAULT_FEATURED_TUTORS,
}: {
  tutors?: TutorShowcaseItem[];
}) {
  return (
    <section id="tutor" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF1FA] border border-[#9AC1E2] text-xs font-bold text-[#09408C] mb-3">
          <span className="brand-dots">
            <span></span>
            <span></span>
            <span></span>
          </span>
          <GraduationCap size={15} className="text-[#09408C]" />
          <span>Tim Pengajar Pakar</span>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#09408C] tracking-tight font-display">
          Belajar Bersama Tutor Berpengalaman & Bersahabat
        </h2>

        <p className="text-xs sm:text-sm text-[#5B6882] mt-3 leading-relaxed">
          Tutor Sahabat Belajar diseleksi secara ketat dari perguruan tinggi terkemuka. Memiliki kompetensi akademis unggul, penguasaan pedagogik hangat, dan komitmen mendampingi perkembangan siswa hingga tuntas.
        </p>
      </div>

      {/* Grid of Tutors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tutors.map((tutor) => (
          <div
            key={tutor.id}
            className="bg-white rounded-3xl border border-[#D5DDEB] p-5 sm:p-6 shadow-xs hover:border-[#09408C] hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Badge Kategori */}
              <div className="flex items-center justify-between gap-2 mb-5">
                <span className="px-2.5 py-1 rounded-full bg-[#EAF1FA] text-[#09408C] text-[11px] font-bold border border-[#9AC1E2]/60">
                  {tutor.highlightTag}
                </span>

                <div className="flex items-center gap-1 text-[11px] font-bold text-[#1B2A41]">
                  <Star size={13} className="fill-[#F5B82E] text-[#F5B82E]" />
                  <span>{tutor.rating.toFixed(1)}</span>
                </div>
              </div>

              {/* Avatar dengan Frame Lingkaran Tebal Navy (Motif Visual 2 DESIGN.md) */}
              <div className="flex flex-col items-center text-center mb-4">
                <div className="w-20 h-20 rounded-full border-4 border-[#09408C] p-0.5 bg-white shadow-sm mb-3 group-hover:scale-105 transition-transform overflow-hidden relative">
                  {tutor.avatarUrl ? (
                    <Image
                      src={tutor.avatarUrl}
                      alt={tutor.name}
                      width={80}
                      height={80}
                      className="w-full h-full rounded-full object-cover object-top"
                    />
                  ) : (
                    <div
                      className={`w-full h-full rounded-full ${tutor.avatarColor} text-white flex items-center justify-center font-extrabold text-xl font-display shadow-inner`}
                    >
                      {tutor.initials}
                    </div>
                  )}
                </div>

                <h3 className="font-bold text-base text-[#1B2A41] font-display">
                  {tutor.name}, {tutor.degree}
                </h3>
                <p className="text-xs font-semibold text-[#295897] mt-0.5">
                  {tutor.campus}
                </p>
              </div>

              {/* Kutipan Pendek */}
              <div className="bg-[#F4F7FB] rounded-2xl p-3.5 mb-4 text-center border border-[#D5DDEB]/80">
                <p className="text-[11px] text-[#5B6882] italic leading-relaxed">
                  &ldquo;{tutor.quote}&rdquo;
                </p>
              </div>

              {/* Spesialisasi Chips */}
              <div className="space-y-1.5 mb-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#5B6882]">
                  Bidang Keahlian:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {tutor.expertise.map((exp, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-lg bg-[#EAF1FA] text-[#09408C] text-[11px] font-medium"
                    >
                      {exp}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Stats & Experience */}
            <div className="pt-4 border-t border-[#D5DDEB] flex items-center justify-between text-xs text-[#5B6882]">
              <div className="flex items-center gap-1.5">
                <Clock size={13} className="text-[#09408C]" />
                <span className="font-semibold text-[#1B2A41]">
                  {tutor.experienceYears}+ Thn
                </span>
                <span>Mengajar</span>
              </div>

              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-[#1F6F4A]" />
                <span className="font-semibold text-[#1B2A41]">
                  {tutor.totalSessions}+ Sesi
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mini CTA Bar */}
      <div className="mt-10 p-5 rounded-2xl bg-linear-to-r from-[#EAF1FA] to-[#F4F7FB] border border-[#9AC1E2] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-xl bg-[#09408C] text-white flex items-center justify-center shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="text-sm font-bold text-[#09408C]">
              Butuh Tutor untuk Mapel Tertentu atau Jadwal Khusus?
            </div>
            <div className="text-xs text-[#5B6882]">
              Tim akademik kami siap mencocokkan tutor paling tepat sesuai gaya belajar Anda.
            </div>
          </div>
        </div>

        <a
          href="#daftar"
          className="px-5 py-2.5 rounded-xl bg-[#09408C] hover:bg-[#0E3571] text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-1.5 shrink-0"
        >
          <span>Pilih & Konsultasi Tutor</span>
          <ArrowRight size={14} />
        </a>
      </div>
    </section>
  );
}
