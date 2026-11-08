export const APP_NAME = "Sahabat Belajar";
export const APP_TAGLINE = "Comprehensive Academic Solution";
export const APP_DESCRIPTION =
  "Lembaga Bimbingan Belajar Privat & Semi-Privat - Paham Konsep Dasar hingga Siap Berprestasi";
export const APP_HASHTAG = "#BersamaSahabat";

export const ITEMS_PER_PAGE = 10;

// Status Lead (PRD Modul A)
export const LEAD_STATUS = {
  BARU: "Baru",
  DIHUBUNGI: "Dihubungi",
  IKUT_PLACEMENT: "Ikut Placement",
  DAFTAR: "Daftar",
  BATAL: "Batal",
} as const;

// Status Sesi (PRD Modul C)
export const SESSION_STATUS = {
  TERJADWAL: "Terjadwal",
  TERLAKSANA: "Terlaksana",
  DIJADWAL_ULANG: "Dijadwal Ulang",
  DIBATALKAN: "Dibatalkan",
} as const;

// Status Absensi (PRD Modul C)
export const ATTENDANCE_STATUS = {
  HADIR: "Hadir",
  IZIN: "Izin",
  ALPA: "Alpa",
} as const;

// Status Pembayaran (PRD Modul D)
export const PAYMENT_STATUS = {
  LUNAS: "Lunas",
  SEBAGIAN: "Sebagian",
  BELUM: "Belum Bayar",
} as const;

// Status Paket Siswa (PRD Modul D)
export const PACKAGE_STATUS = {
  AKTIF: "Aktif",
  HAMPIR_HABIS: "Hampir Habis",
  HABIS: "Habis",
  KEDALUWARSA: "Kedaluwarsa",
} as const;

// Model Kelas
export const CLASS_MODELS = [
  { value: "PRIVAT", label: "Privat (1 Siswa)" },
  { value: "SEMI_PRIVAT", label: "Semi-Privat (2-5 Siswa)" },
] as const;

// Mode Pembelajaran
export const LEARNING_MODES = [
  { value: "ONLINE", label: "Online (Zoom / Meet)" },
  { value: "HOME_VISIT", label: "Home Visit (Tutor Datang ke Rumah)" },
] as const;

// Kategori Program
export const PROGRAM_CATEGORIES = [
  { value: "K12", label: "K-12 (SD, SMP, SMA)" },
  { value: "CPNS_BUMN", label: "Persiapan CPNS, BUMN & PPPK" },
  { value: "S2_S3_BEASISWA", label: "Persiapan S2/S3 & Beasiswa" },
  { value: "TOEFL_IELTS", label: "TOEFL & IELTS Preparation" },
  { value: "PENULISAN_ILMIAH", label: "Kepenulisan Ilmiah & Skripsi/Tesis" },
] as const;

// Tipe Paket Belajar (PRD B4)
export const PACKAGE_TYPES = [
  { value: "QUOTA", label: "Berbasis Kuota Pertemuan" },
  { value: "TIME", label: "Berbasis Waktu (Bulan)" },
  { value: "CUSTOM", label: "Paket Kustom" },
] as const;

export const DEFAULT_ROLES = [
  {
    name: "Admin",
    description: "Akses penuh ke semua modul operasional dan laporan keuangan",
  },
  {
    name: "Staf",
    description: "Mengelola pendaftaran, siswa, jadwal, dan pembayaran (tanpa tarif honor)",
  },
  {
    name: "Tutor",
    description: "Melihat jadwal bimbingan, mengisi absensi dan jurnal, melihat honor pribadi",
  },
  {
    name: "Siswa",
    description: "Melihat jadwal belajar, sisa kuota, dan hasil evaluasi",
  },
  {
    name: "Orang Tua",
    description: "Memantau perkembangan belajar, kehadiran, dan sisa kuota anak",
  },
] as const;

export const UPLOAD_MAX_SIZE = 5 * 1024 * 1024; // 5MB
export const UPLOAD_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
];
