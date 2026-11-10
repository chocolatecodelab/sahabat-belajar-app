import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Heart, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#09408C] text-white pt-16 pb-12 border-t border-[#0E3571]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white p-1 flex items-center justify-center shadow-sm shrink-0">
                <Image
                  src="/images/logo-sahabat-belajar.png"
                  alt="Logo Sahabat Belajar"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-bold text-lg text-white font-display block">
                  Sahabat Belajar
                </span>
                <span className="text-[11px] text-[#9AC1E2] uppercase font-semibold tracking-wider">
                  Bimbingan Belajar
                </span>
              </div>
            </div>

            <p className="text-xs text-white/80 leading-relaxed">
              Lembaga bimbingan belajar privat & semi-privat (2-5 siswa). Menemani siswa memahami konsep dasar hingga siap berprestasi.
            </p>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#9AC1E2] text-xs font-semibold">
              <Sparkles size={12} className="text-[#0CC0DF]" />
              <span>#BersamaSahabat</span>
            </div>
          </div>

          {/* Program Bimbingan */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-[#9AC1E2] uppercase tracking-wider font-display">
              Program Belajar
            </h4>
            <ul className="space-y-2 text-xs text-white/80">
              <li>• Bimbel K-12 (SD, SMP, SMA)</li>
              <li>• Persiapan Tes CPNS, BUMN & PPPK</li>
              <li>• Persiapan S2/S3 & Beasiswa</li>
              <li>• TOEFL & IELTS Preparation</li>
              <li>• Pendampingan Kepenulisan Ilmiah</li>
            </ul>
          </div>

          {/* Model & Fasilitas */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-[#9AC1E2] uppercase tracking-wider font-display">
              Model Kelas
            </h4>
            <ul className="space-y-2 text-xs text-white/80">
              <li>• Kelas Privat 1-on-1 Intensif</li>
              <li>• Kelas Semi-Privat (2-5 Siswa)</li>
              <li>• Mode Online (Zoom / Google Meet)</li>
              <li>• Mode Home Visit (Tutor Datang)</li>
              <li>• Durasi Standar 90 Menit per Sesi</li>
            </ul>
          </div>

          {/* Kontak & Alamat */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-[#9AC1E2] uppercase tracking-wider font-display">
              Hubungi Kami
            </h4>
            <div className="space-y-2.5 text-xs text-white/80">
              <a
                href="https://wa.me/628123456789"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Phone size={14} className="text-[#0CC0DF]" />
                <span>+62 812-3456-789 (WhatsApp CS)</span>
              </a>

              <div className="flex items-center gap-2">
                <Mail size={14} className="text-[#0CC0DF]" />
                <span>halo@sahabatbelajar.id</span>
              </div>

              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-[#0CC0DF] shrink-0 mt-0.5" />
                <span>Layanan Home Visit & Online Terpadu Seluruh Indonesia</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <p suppressHydrationWarning>© {new Date().getFullYear()} Sahabat Belajar. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Comprehensive Academic Solution • Paham Konsep Dasar hingga Siap Berprestasi
          </p>
        </div>
      </div>
    </footer>
  );
}
