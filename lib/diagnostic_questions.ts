export interface DiagnosticQuestion {
  id: string;
  category: "VERBAL" | "KUANTITATIF" | "LOGIKA";
  categoryLabel: string;
  questionText: string;
  options: { key: string; text: string }[];
  correctKey: string;
  explanation: string;
}

export interface DiagnosticResult {
  score: number;
  maxScore: number;
  percentage: number;
  breakdown: {
    verbal: { correct: number; total: number; percentage: number };
    kuantitatif: { correct: number; total: number; percentage: number };
    logika: { correct: number; total: number; percentage: number };
  };
  strengths: string[];
  areasToImprove: string[];
  recommendedPackage: string;
  leadId?: string;
}

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  // 1. Verbal
  {
    id: "diag_01",
    category: "VERBAL",
    categoryLabel: "Kemampuan Verbal & Analogi",
    questionText: "KAYU : MEJA = BENANG : ...",
    options: [
      { key: "A", text: "Jarum" },
      { key: "B", text: "Kain" },
      { key: "C", text: "Kapas" },
      { key: "D", text: "Pakaian" },
      { key: "E", text: "Jahit" },
    ],
    correctKey: "B",
    explanation: "Hubungan bahan baku langsung: Meja dibuat dari bahan dasar kayu; Kain dibuat dari bahan dasar benang.",
  },
  {
    id: "diag_02",
    category: "VERBAL",
    categoryLabel: "Kemampuan Verbal & Penalaran Wacana",
    questionText: "Semua mahasiswa teladan aktif di organisasi kampus. Sebagian atlet berprestasi adalah mahasiswa teladan. Kesimpulan yang sah adalah...",
    options: [
      { key: "A", text: "Semua atlet berprestasi aktif di organisasi kampus" },
      { key: "B", text: "Sebagian atlet berprestasi aktif di organisasi kampus" },
      { key: "C", text: "Semua yang aktif di organisasi kampus adalah atlet" },
      { key: "D", text: "Tidak ada atlet yang aktif di organisasi kampus" },
      { key: "E", text: "Mahasiswa teladan pasti seorang atlet berprestasi" },
    ],
    correctKey: "B",
    explanation: "Premis partikular + universal afirmatif: Sebagian atlet berprestasi yang merupakan mahasiswa teladan pasti aktif di organisasi kampus.",
  },
  {
    id: "diag_03",
    category: "VERBAL",
    categoryLabel: "Kemampuan Verbal & Sinonim / Kosakata",
    questionText: "Lawan kata (Antonym) dari kata 'TENTATIF' adalah...",
    options: [
      { key: "A", text: "Sementara" },
      { key: "B", text: "Pasti / Definitif" },
      { key: "C", text: "Bersifat sementara" },
      { key: "D", text: "Dapat berubah" },
      { key: "E", text: "Ragu-ragu" },
    ],
    correctKey: "B",
    explanation: "Tentatif berarti belum pasti / masih dapat berubah. Lawan katanya adalah pasti atau definitif.",
  },

  // 2. Kuantitatif / Numerik
  {
    id: "diag_04",
    category: "KUANTITATIF",
    categoryLabel: "Penalaran Numerik & Deret Angka",
    questionText: "Tentukan angka selanjutnya pada deret berikut: 3, 6, 12, 15, 30, 33, ...",
    options: [
      { key: "A", text: "36" },
      { key: "B", text: "45" },
      { key: "C", text: "66" },
      { key: "D", text: "60" },
      { key: "E", text: "63" },
    ],
    correctKey: "C",
    explanation: "Pola operasi bergantian: (+3, ×2, +3, ×2, +3, ×2). 33 × 2 = 66.",
  },
  {
    id: "diag_05",
    category: "KUANTITATIF",
    categoryLabel: "Aritmatika & Aljabar Cepat",
    questionText: "Jika nilai x = 5/8 dari 64, dan nilai y = 40% dari 110, maka hubungan x dan y yang tepat adalah...",
    options: [
      { key: "A", text: "x > y" },
      { key: "B", text: "x < y" },
      { key: "C", text: "x = y" },
      { key: "D", text: "2x = 3y" },
      { key: "E", text: "Hubungan x dan y tidak dapat ditentukan" },
    ],
    correctKey: "B",
    explanation: "x = 5/8 × 64 = 40. y = 40% × 110 = 44. Maka x (40) < y (44).",
  },
  {
    id: "diag_06",
    category: "KUANTITATIF",
    categoryLabel: "Kuantitatif Soal Cerita & Kecepatan",
    questionText: "Sebuah pekerjaan renovasi dapat diselesaikan oleh 6 orang pekerja dalam waktu 15 hari. Jika pekerjaan tersebut ingin diselesaikan dalam waktu 10 hari, berapa jumlah tambahan pekerja yang dibutuhkan?",
    options: [
      { key: "A", text: "2 orang" },
      { key: "B", text: "3 orang" },
      { key: "C", text: "4 orang" },
      { key: "D", text: "5 orang" },
      { key: "E", text: "9 orang" },
    ],
    correctKey: "B",
    explanation: "Perbandingan berbalik nilai: 6 × 15 = P2 × 10 -> 90 = 10 P2 -> P2 = 9 pekerja total. Tambahan pekerja = 9 - 6 = 3 orang.",
  },
  {
    id: "diag_07",
    category: "KUANTITATIF",
    categoryLabel: "Persentase & Laba/Rugi",
    questionText: "Seorang pedagang membeli barang seharga Rp 200.000 dan menjualnya dengan keuntungan 25%. Berapakah harga jual barang tersebut?",
    options: [
      { key: "A", text: "Rp 225.000" },
      { key: "B", text: "Rp 240.000" },
      { key: "C", text: "Rp 250.000" },
      { key: "D", text: "Rp 260.000" },
      { key: "E", text: "Rp 275.000" },
    ],
    correctKey: "C",
    explanation: "Harga jual = Modal + (25% × 200.000) = 200.000 + 50.000 = Rp 250.000.",
  },

  // 3. Logika & Analitis
  {
    id: "diag_08",
    category: "LOGIKA",
    categoryLabel: "Penalaran Posisi & Urutan",
    questionText: "Lima orang anak (A, B, C, D, E) sedang mengantre tiket. A berada di depan B. C berada di antara A dan D. E berada tepat di belakang B. Siapakah anak yang posisinya berada di paling belakang?",
    options: [
      { key: "A", text: "A" },
      { key: "B", text: "B" },
      { key: "C", text: "C" },
      { key: "D", text: "D" },
      { key: "E", text: "E" },
    ],
    correctKey: "E",
    explanation: "Karena E berada tepat di belakang B, dan B berada di belakang A (serta C & D di antara A/D), posisi paling belakang adalah E.",
  },
  {
    id: "diag_09",
    category: "LOGIKA",
    categoryLabel: "Logika Syarat & Kondisi",
    questionText: "Jika musim kemarau panjang tiba, maka debit air waduk berkurang. Saat ini debit air waduk melimpah ruah dan tidak berkurang sama sekali. Kesimpulan yang paling logis adalah...",
    options: [
      { key: "A", text: "Musim kemarau panjang sedang berlangsung" },
      { key: "B", text: "Musim kemarau panjang belum tiba atau tidak terjadi" },
      { key: "C", text: "Pintu air waduk sedang rusak" },
      { key: "D", text: "Waduk akan segera mengering dalam 2 hari" },
      { key: "E", text: "Hujan tidak pernah turun" },
    ],
    correctKey: "B",
    explanation: "Modus Tollens: Jika P maka Q. Bukan Q. Maka Bukan P (Musim kemarau panjang belum tiba/tidak terjadi).",
  },
  {
    id: "diag_10",
    category: "LOGIKA",
    categoryLabel: "Logika Analisis Hubungan",
    questionText: "Semua peserta seminar wajib memakai batik atau kemeja putih. Dani adalah peserta seminar dan dia tidak memakai batik. Maka kesimpulannya...",
    options: [
      { key: "A", text: "Dani tidak boleh masuk ruang seminar" },
      { key: "B", text: "Dani memakai kemeja putih" },
      { key: "C", text: "Dani memakai kaos polos" },
      { key: "D", text: "Dani bukan peserta seminar yang sah" },
      { key: "E", text: "Dani melanggar aturan seminar" },
    ],
    correctKey: "B",
    explanation: "Disjungtif: P atau Q. Bukan P. Maka Q (Dani memakai kemeja putih).",
  },
];
