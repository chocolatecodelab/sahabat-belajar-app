/**
 * BIAS RISTEK - Smart Tutor Matching Engine & Expert Directory Pool
 * Implements PRD Phase #4: "Penjadwalan Siswa ke Tutor (Human in the Loop)"
 * Computes multi-attribute compatibility scores between student research metadata and expert profiles.
 */

export interface TutorAvailabilitySlot {
  dayOfWeek: "SENIN" | "SELASA" | "RABU" | "KAMIS" | "JUMAT" | "SABTU" | "MINGGU";
  timeStart: string; // e.g. "19:30"
  timeEnd: string;   // e.g. "21:00"
  isBooked: boolean;
}

export interface TutorProfileData {
  id: string;
  fullName: string;
  whatsappNumber: string;
  email: string;
  academicTitle: string;
  institution: string;
  specializations: string[];
  scopusId?: string | null;
  hIndex: number;
  maxActiveStudents: number;
  currentActive: number;
  isActive: boolean;
  rating: number;
  avatar?: string | null;
  bio?: string | null;
  availabilities: TutorAvailabilitySlot[];
}

export interface MatchCandidate {
  tutor: TutorProfileData;
  matchScore: number; // 0 - 100
  reasons: string[];
  recommendedSlots: string[];
  canAccept: boolean;
}

// ==============================================================================
// 1. CURATED CORE TUTOR DIRECTORY (POOL SEED)
// ==============================================================================

const CORE_FEATURED_TUTORS: TutorProfileData[] = [
  {
    id: "tut_budi_rahardjo",
    fullName: "Dr. techn. Budi Rahardjo, S.T., M.T.",
    whatsappNumber: "6281211110001",
    email: "budi.rahardjo@biasristek.id",
    academicTitle: "Doktor Bidang Teknik Elektro & Informatika",
    institution: "Institut Teknologi Bandung (ITB)",
    specializations: ["Python & AI", "Deep Learning", "Teknik Informatika", "Systematic Literature Review", "Scopus Q1"],
    scopusId: "57193847291",
    hIndex: 18,
    maxActiveStudents: 5,
    currentActive: 2,
    isActive: true,
    rating: 4.95,
    avatar: "/uploads/avatars/tutor_budi.webp",
    bio: "Reviewer aktif di IEEE Transactions dan Elsevier. Berpengalaman membimbing 120+ publikasi Scopus Q1/Q2 di bidang AI dan rekayasa komputasi.",
    availabilities: [
      { dayOfWeek: "SABTU", timeStart: "19:30", timeEnd: "21:00", isBooked: false },
      { dayOfWeek: "MINGGU", timeStart: "10:00", timeEnd: "11:30", isBooked: false },
      { dayOfWeek: "KAMIS", timeStart: "20:00", timeEnd: "21:30", isBooked: false },
    ],
  },
  {
    id: "tut_hendra_wijaya",
    fullName: "Dr. Hendra Wijaya, S.E., M.Si., Ak., CA",
    whatsappNumber: "6281211110002",
    email: "hendra.wijaya@biasristek.id",
    academicTitle: "Doktor Ilmu Manajemen & Akuntansi Keuangan",
    institution: "Universitas Indonesia (UI)",
    specializations: ["SmartPLS 4", "SEM-Amos", "Manajemen & Bisnis", "Akuntansi Keuangan", "Kuantitatif"],
    scopusId: "57204928173",
    hIndex: 14,
    maxActiveStudents: 6,
    currentActive: 3,
    isActive: true,
    rating: 4.98,
    avatar: "/uploads/avatars/tutor_hendra.webp",
    bio: "Spesialis metode structural equation modeling (PLS-SEM & CB-SEM). Telah menguji model mediasi, moderasi, dan higher-order constructs.",
    availabilities: [
      { dayOfWeek: "SENIN", timeStart: "19:30", timeEnd: "21:00", isBooked: false },
      { dayOfWeek: "RABU", timeStart: "19:30", timeEnd: "21:00", isBooked: false },
      { dayOfWeek: "SABTU", timeStart: "16:00", timeEnd: "17:30", isBooked: false },
    ],
  },
  {
    id: "tut_sarah_amanda",
    fullName: "dr. Sarah Amanda, Sp.A., M.Kes., Ph.D.",
    whatsappNumber: "6281211110003",
    email: "sarah.amanda@biasristek.id",
    academicTitle: "Doktor Ilmu Kedokteran Klinis & Kesehatan",
    institution: "Universitas Gadjah Mada (UGM)",
    specializations: ["SPSS 29", "Kedokteran & Kesehatan", "Meta-Analysis PRISMA", "Uji Klinis", "Scopus Q1"],
    scopusId: "57182930491",
    hIndex: 12,
    maxActiveStudents: 4,
    currentActive: 1,
    isActive: true,
    rating: 4.92,
    avatar: "/uploads/avatars/tutor_sarah.webp",
    bio: "Peneliti klinis dengan pengalaman publikasi di jurnal Lancet Regional dan BMC Public Health. Menguasai analisis kesintasan, regresi logistik, dan meta-analisis.",
    availabilities: [
      { dayOfWeek: "SELASA", timeStart: "20:00", timeEnd: "21:30", isBooked: false },
      { dayOfWeek: "JUMAT", timeStart: "19:30", timeEnd: "21:00", isBooked: false },
      { dayOfWeek: "MINGGU", timeStart: "14:00", timeEnd: "15:30", isBooked: false },
    ],
  },
  {
    id: "tut_maya_anggraini",
    fullName: "Dr. Maya Anggraini, S.Psi., M.A.",
    whatsappNumber: "6281211110004",
    email: "maya.anggraini@biasristek.id",
    academicTitle: "Doktor Psikologi Sosial & Organisasi",
    institution: "Universitas Airlangga (UNAIR)",
    specializations: ["NVivo", "Kualitatif Tematik", "Psikologi & SDM", "Lisrel", "Fenomenologi"],
    scopusId: "57211029384",
    hIndex: 9,
    maxActiveStudents: 5,
    currentActive: 2,
    isActive: true,
    rating: 4.90,
    avatar: "/uploads/avatars/tutor_maya.webp",
    bio: "Pakar analisis kualitatif berbasis perangkat lunak NVivo 14 dan studi grounded theory. Membimbing naskah studi perilaku dan kepemimpinan.",
    availabilities: [
      { dayOfWeek: "RABU", timeStart: "19:00", timeEnd: "20:30", isBooked: false },
      { dayOfWeek: "KAMIS", timeStart: "19:30", timeEnd: "21:00", isBooked: false },
      { dayOfWeek: "SABTU", timeStart: "13:30", timeEnd: "15:00", isBooked: false },
    ],
  },
  {
    id: "tut_dedi_kurniawan",
    fullName: "Dr. Dedi Kurniawan, S.T., M.Eng.",
    whatsappNumber: "6281211110005",
    email: "dedi.kurniawan@biasristek.id",
    academicTitle: "Doktor Teknik Mesin & Material Maju",
    institution: "Institut Teknologi Sepuluh Nopember (ITS)",
    specializations: ["Bibliometrik", "VOSviewer & Biblioshiny", "Scopus Teknik Mesin", "Matlab", "Simulasi FEA"],
    scopusId: "57199049281",
    hIndex: 13,
    maxActiveStudents: 5,
    currentActive: 2,
    isActive: true,
    rating: 4.94,
    avatar: "/uploads/avatars/tutor_dedi.webp",
    bio: "Ahli pemetaan saintometri dan bibliometrik global menggunakan Scopus & Web of Science API, VOSviewer, dan R Biblioshiny.",
    availabilities: [
      { dayOfWeek: "SENIN", timeStart: "20:00", timeEnd: "21:30", isBooked: false },
      { dayOfWeek: "KAMIS", timeStart: "20:00", timeEnd: "21:30", isBooked: false },
      { dayOfWeek: "SABTU", timeStart: "19:30", timeEnd: "21:00", isBooked: false },
    ],
  },
  {
    id: "tut_agus_suprianto",
    fullName: "Prof. Dr. Agus Suprianto, M.Pd.",
    whatsappNumber: "6281211110006",
    email: "agus.suprianto@biasristek.id",
    academicTitle: "Guru Besar Teknologi Pendidikan & Evaluasi",
    institution: "Universitas Negeri Malang (UM)",
    specializations: ["R & D Borg & Gall", "Pendidikan", "SPSS 29", "PTK & Eksperimen Semu", "SINTA 1-2"],
    scopusId: "57188201948",
    hIndex: 16,
    maxActiveStudents: 5,
    currentActive: 1,
    isActive: true,
    rating: 4.97,
    avatar: "/uploads/avatars/tutor_agus.webp",
    bio: "Spesialis metodologi Research and Development (ADDIE, 4D, Borg & Gall) dan uji keefektifan model pembelajaran inovatif.",
    availabilities: [
      { dayOfWeek: "SELASA", timeStart: "19:30", timeEnd: "21:00", isBooked: false },
      { dayOfWeek: "JUMAT", timeStart: "16:00", timeEnd: "17:30", isBooked: false },
      { dayOfWeek: "MINGGU", timeStart: "09:00", timeEnd: "10:30", isBooked: false },
    ],
  },
  {
    id: "tut_rian_pratama",
    fullName: "Dr. Rian Pratama, S.Si., M.Stat.",
    whatsappNumber: "6281211110007",
    email: "rian.pratama@biasristek.id",
    academicTitle: "Doktor Statistika Terapan & Ekonometrika",
    institution: "Institut Pertanian Bogor (IPB)",
    specializations: ["EViews & Stata", "Ekonometrika", "Regresi Data Panel", "Time Series ARIMA", "SmartPLS 4"],
    scopusId: "57201948271",
    hIndex: 11,
    maxActiveStudents: 5,
    currentActive: 3,
    isActive: true,
    rating: 4.89,
    avatar: "/uploads/avatars/tutor_rian.webp",
    bio: "Pakar pemodelan ekonometrika spasial, Vector Autoregression (VAR/VECM), dan regresi data panel statis maupun dinamis (GMM).",
    availabilities: [
      { dayOfWeek: "SENIN", timeStart: "19:00", timeEnd: "20:30", isBooked: false },
      { dayOfWeek: "RABU", timeStart: "20:00", timeEnd: "21:30", isBooked: false },
      { dayOfWeek: "SABTU", timeStart: "10:00", timeEnd: "11:30", isBooked: false },
    ],
  },
  {
    id: "tut_ratih_kumalasari",
    fullName: "Dr. Ratih Kumalasari, M.Farm., Apt., Ph.D.",
    whatsappNumber: "6281211110008",
    email: "ratih.kumalasari@biasristek.id",
    academicTitle: "Doktor Farmasi Klinis & Bioteknologi",
    institution: "Universitas Padjadjaran (UNPAD)",
    specializations: ["SPSS 29", "GraphPad Prism", "Farmakologi & Biologi", "Desain Eksperimen", "Scopus Q1"],
    scopusId: "57219482019",
    hIndex: 10,
    maxActiveStudents: 4,
    currentActive: 1,
    isActive: true,
    rating: 4.93,
    avatar: "/uploads/avatars/tutor_ratih.webp",
    bio: "Spesialis analisis statistik komputasi in-vivo/in-vitro, docking molekuler, ANOVA two-way, dan kurva respon dosis (IC50).",
    availabilities: [
      { dayOfWeek: "SELASA", timeStart: "19:30", timeEnd: "21:00", isBooked: false },
      { dayOfWeek: "KAMIS", timeStart: "19:30", timeEnd: "21:00", isBooked: false },
      { dayOfWeek: "SABTU", timeStart: "15:30", timeEnd: "17:00", isBooked: false },
    ],
  },
  {
    id: "tut_fitri_hidayah",
    fullName: "Dr. Fitri Nurul Hidayah, S.H., M.H.",
    whatsappNumber: "6281211110009",
    email: "fitri.hidayah@biasristek.id",
    academicTitle: "Doktor Ilmu Hukum & Kebijakan Publik",
    institution: "Universitas Diponegoro (UNDIP)",
    specializations: ["Hukum Normatif", "Studi Kebijakan Publik", "NVivo", "Analisis Putusan Pengadilan", "SINTA 1-2"],
    scopusId: "57220194832",
    hIndex: 7,
    maxActiveStudents: 5,
    currentActive: 2,
    isActive: true,
    rating: 4.88,
    avatar: "/uploads/avatars/tutor_fitri.webp",
    bio: "Pendamping riset naskah hukum yuridis normatif, perbandingan hukum perdata/bisnis internasional, dan harmonisasi regulasi.",
    availabilities: [
      { dayOfWeek: "RABU", timeStart: "19:30", timeEnd: "21:00", isBooked: false },
      { dayOfWeek: "JUMAT", timeStart: "19:30", timeEnd: "21:00", isBooked: false },
      { dayOfWeek: "MINGGU", timeStart: "13:00", timeEnd: "14:30", isBooked: false },
    ],
  },
  {
    id: "tut_wahyu_hidayat",
    fullName: "Dr. Wahyu Hidayat, S.Sos., M.Si.",
    whatsappNumber: "6281211110010",
    email: "wahyu.hidayat@biasristek.id",
    academicTitle: "Doktor Ilmu Komunikasi & Media Baru",
    institution: "Universitas Hasanuddin (UNHAS)",
    specializations: ["Analisis Wacana Kritis", "Bibliometrik", "Komunikasi Digital", "Media Sosial & Persepsi", "Scopus Q2"],
    scopusId: "57209384712",
    hIndex: 8,
    maxActiveStudents: 5,
    currentActive: 1,
    isActive: true,
    rating: 4.86,
    avatar: "/uploads/avatars/tutor_wahyu.webp",
    bio: "Pakar analisis isi kuantitatif dan analisis framing/wacana media sosial (Twitter/X, TikTok, berita online) serta studi netnografi.",
    availabilities: [
      { dayOfWeek: "SENIN", timeStart: "20:00", timeEnd: "21:30", isBooked: false },
      { dayOfWeek: "KAMIS", timeStart: "19:00", timeEnd: "20:30", isBooked: false },
      { dayOfWeek: "SABTU", timeStart: "19:30", timeEnd: "21:00", isBooked: false },
    ],
  },
];

/**
 * Generate full pool of specialized tutors across all Indonesian university faculties
 */
export function generateTutorPool(): TutorProfileData[] {
  const tutors: TutorProfileData[] = [...CORE_FEATURED_TUTORS];

  const facultyNames = [
    { faculty: "Manajemen & Bisnis", tools: ["SmartPLS 4", "SEM-Amos", "SPSS 29"], insts: ["UI", "UGM", "UNAIR", "UB", "UNPAD", "UNDIP"] },
    { faculty: "Teknik Informatika & AI", tools: ["Python & AI", "Systematic Literature Review", "Deep Learning"], insts: ["ITB", "ITS", "UI", "UGM", "Telkom University"] },
    { faculty: "Kedokteran & Kesehatan", tools: ["SPSS 29", "Meta-Analysis PRISMA", "GraphPad Prism"], insts: ["UI", "UGM", "UNAIR", "UNHAS", "UNDIP", "UNAND"] },
    { faculty: "Pendidikan & Evaluasi", tools: ["R & D Borg & Gall", "SPSS 29", "PTK & Eksperimen Semu"], insts: ["UM", "UNY", "UPI", "UNJ", "UNM"] },
    { faculty: "Sains & Statistika", tools: ["EViews & Stata", "Bibliometrik", "R Studio"], insts: ["IPB", "ITS", "UGM", "UNPAD"] },
    { faculty: "Hukum & Sosial Humaniora", tools: ["NVivo", "Analisis Wacana Kritis", "Hukum Normatif"], insts: ["UI", "UNDIP", "UNAIR", "UGM", "UNHAS"] },
  ];

  const days: TutorAvailabilitySlot["dayOfWeek"][] = ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU", "MINGGU"];
  const times = [
    { start: "19:30", end: "21:00" },
    { start: "20:00", end: "21:30" },
    { start: "16:00", end: "17:30" },
    { start: "10:00", end: "11:30" },
    { start: "13:30", end: "15:00" },
  ];

  // Synthesize realistic faculty specialist pool
  let idCounter = 11;
  for (let i = 0; i < facultyNames.length; i++) {
    const f = facultyNames[i];
    for (let j = 0; j < 4; j++) {
      if (tutors.length >= 34) break;
      const inst = f.insts[j % f.insts.length];
      const tool1 = f.tools[j % f.tools.length];
      const tool2 = f.tools[(j + 1) % f.tools.length];
      const day1 = days[j % days.length];
      const day2 = days[(j + 2) % days.length];
      const timeSlot = times[j % times.length];
      const isProf = j % 6 === 0;
      const title = isProf ? `Prof. Dr., M.Sc. (${f.faculty})` : `Dr., M.Si. (${f.faculty})`;
      const scopusQ = j % 3 === 0 ? "Scopus Q1" : j % 3 === 1 ? "Scopus Q2" : "SINTA 1-2";

      tutors.push({
        id: `tut_pool_${idCounter}`,
        fullName: `${isProf ? "Prof. " : "Dr. "}Pakar Riset ${f.faculty.split(" ")[0]} #${idCounter}`,
        whatsappNumber: `62812${String(10000000 + idCounter).slice(1)}`,
        email: `tutor.${idCounter}@biasristek.id`,
        academicTitle: title,
        institution: inst,
        specializations: [tool1, tool2, f.faculty, scopusQ],
        scopusId: `57${String(100000000 + idCounter)}`,
        hIndex: Math.floor(5 + (j % 12)),
        maxActiveStudents: 5,
        currentActive: (j % 4), // 0 to 3 active students
        isActive: true,
        rating: +(4.80 + (j % 18) * 0.01).toFixed(2),
        avatar: null,
        bio: `Konsultan riset senior spesialis ${tool1} dan publikasi ${scopusQ} dari ${inst}.`,
        availabilities: [
          { dayOfWeek: day1, timeStart: timeSlot.start, timeEnd: timeSlot.end, isBooked: false },
          { dayOfWeek: day2, timeStart: timeSlot.start, timeEnd: timeSlot.end, isBooked: false },
        ],
      });
      idCounter++;
    }
  }

  return tutors;
}

// In-memory / fallback cache of tutors
let cachedTutorPool: TutorProfileData[] | null = null;

export function getTutorDirectoryPool(): TutorProfileData[] {
  if (!cachedTutorPool) {
    cachedTutorPool = generateTutorPool();
  }
  return cachedTutorPool;
}

// ==============================================================================
// 2. SMART TUTOR MATCHING ALGORITHM
// ==============================================================================

export interface StudentMatchingInput {
  researchTopic?: string | null;
  researchSoftware?: string | null;
  educationLevel?: string | null;
  preferredSchedule?: { day?: string; timeSlot?: string }[] | null;
  institution?: string | null;
}

/**
 * Normalizes string for fuzzy keyword comparison
 */
function cleanText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim();
}

/**
 * Calculates matching score between a student and a tutor
 */
export function computeTutorMatchScore(
  tutor: TutorProfileData,
  student: StudentMatchingInput
): { score: number; reasons: string[]; recommendedSlots: string[]; canAccept: boolean } {
  let score = 30; // Baseline base score for verified academic tutor
  const reasons: string[] = [];
  const recommendedSlots: string[] = [];

  const rawTopic = student.researchTopic || "";
  const rawSoftware = student.researchSoftware || "";
  const rawLevel = student.educationLevel || "";

  const topicText = cleanText(`${rawTopic} ${rawSoftware}`);
  const tutorSpecsText = cleanText(tutor.specializations.join(" ") + " " + (tutor.bio || ""));

  // 1. Tool / Software exact & partial match (+30 pts)
  if (rawSoftware) {
    const swClean = cleanText(rawSoftware);
    if (tutorSpecsText.includes(swClean)) {
      score += 25;
      reasons.push(`Pakar terverifikasi metode / software ${rawSoftware}`);
    } else {
      // Check individual words
      const swWords = swClean.split(/\s+/).filter((w) => w.length > 2);
      const matched = swWords.some((w) => tutorSpecsText.includes(w));
      if (matched) {
        score += 15;
        reasons.push(`Menguasai analisis terkait ${rawSoftware}`);
      }
    }
  }

  // 2. Keyword Topic & Field match (+25 pts)
  const keywords = cleanText(rawTopic)
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !["pada", "yang", "dengan", "dan", "untuk", "dalam", "studi", "pengaruh", "analisis", "terhadap"].includes(w));

  let matchedKeywordCount = 0;
  for (const kw of keywords) {
    if (tutorSpecsText.includes(kw) || cleanText(tutor.academicTitle).includes(kw)) {
      matchedKeywordCount++;
    }
  }

  if (matchedKeywordCount >= 3) {
    score += 20;
    reasons.push(`Kecocokan rumpun ilmu & variabel riset sangat tinggi (${matchedKeywordCount} indikator)`);
  } else if (matchedKeywordCount >= 1) {
    score += 12;
    reasons.push(`Sesuai dengan topik bahasan penelitian (${matchedKeywordCount} kata kunci)`);
  }

  // 3. Education Level Alignment (+15 pts)
  const isDoctorate = rawLevel.includes("S3") || rawLevel.includes("Disertasi") || rawLevel.includes("Dosen");
  if (isDoctorate) {
    if (tutor.hIndex >= 12 || tutor.academicTitle.includes("Prof") || tutor.academicTitle.includes("Doktor")) {
      score += 15;
      reasons.push(`Kualifikasi senior Dr./Prof. (h-index ${tutor.hIndex}) ideal untuk ${rawLevel}`);
    } else {
      score += 5;
    }
  } else {
    // S1 / S2 level
    score += 10;
    if (tutor.rating >= 4.9) {
      reasons.push(`Rating bimbingan sangat tinggi (${tutor.rating}/5.0) untuk bimbingan intensif`);
    }
  }

  // 4. Schedule Slot Matching (+15 pts)
  const requestedDay = student.preferredSchedule?.[0]?.day?.toUpperCase() || "";
  const requestedSlot = student.preferredSchedule?.[0]?.timeSlot || "";

  let hasSlotMatch = false;
  for (const slot of tutor.availabilities) {
    if (!slot.isBooked) {
      const slotString = `${slot.dayOfWeek}, ${slot.timeStart} - ${slot.timeEnd} WIB`;
      if (!recommendedSlots.includes(slotString)) {
        recommendedSlots.push(slotString);
      }
      if (requestedDay && slot.dayOfWeek === requestedDay) {
        hasSlotMatch = true;
      }
    }
  }

  if (hasSlotMatch) {
    score += 15;
    reasons.push(`Tersedia slot bimbingan pada hari preferensi siswa (${requestedDay})`);
  } else if (recommendedSlots.length > 0) {
    score += 8;
    reasons.push(`Tersedia ${recommendedSlots.length} slot waktu bimbingan fleksibel`);
  }

  // 5. Workload capacity check
  const capacityLeft = tutor.maxActiveStudents - tutor.currentActive;
  let canAccept = true;

  if (capacityLeft <= 0) {
    score = Math.max(10, score - 40);
    canAccept = false;
    reasons.push("Kuota bimbingan tutor saat ini sedang penuh");
  } else {
    score += Math.min(5, capacityLeft * 2);
  }

  // Clamp score between 0 and 99% (keep realistic)
  const finalScore = Math.min(98, Math.max(25, score));

  return {
    score: finalScore,
    reasons: reasons.slice(0, 3), // Top 3 reasons
    recommendedSlots: recommendedSlots.slice(0, 3),
    canAccept,
  };
}

/**
 * Matches and ranks top candidate tutors for a student registration
 */
export function matchTutorsForStudent(
  student: StudentMatchingInput,
  tutorsPool?: TutorProfileData[],
  limit = 5
): MatchCandidate[] {
  const pool = tutorsPool || getTutorDirectoryPool();

  const candidates: MatchCandidate[] = pool
    .filter((t) => t.isActive)
    .map((tutor) => {
      const { score, reasons, recommendedSlots, canAccept } = computeTutorMatchScore(tutor, student);
      return {
        tutor,
        matchScore: score,
        reasons,
        recommendedSlots,
        canAccept,
      };
    });

  // Sort descending by score, prioritizing tutors with open capacity
  candidates.sort((a, b) => {
    if (a.canAccept !== b.canAccept) {
      return a.canAccept ? -1 : 1;
    }
    return b.matchScore - a.matchScore;
  });

  return candidates.slice(0, limit);
}
