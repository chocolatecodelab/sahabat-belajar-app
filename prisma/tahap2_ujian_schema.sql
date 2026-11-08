-- ==========================================
-- TAHAP 2: RUANG UJIAN ONLINE, BANK SOAL & RAPOR DIGITAL
-- ==========================================

-- 1. Table: Exam (Paket Ujian / Tryout Online)
CREATE TABLE IF NOT EXISTS "Exam" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'CPNS_BUMN', -- CPNS_BUMN, UTBK_SNBT, TOEFL_IELTS, K12, KEDINASAN
    "durationMinutes" INTEGER NOT NULL DEFAULT 90,
    "passingGrade" INTEGER NOT NULL DEFAULT 300,
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- 2. Table: ExamQuestion (Bank Soal)
CREATE TABLE IF NOT EXISTS "ExamQuestion" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "questionNumber" INTEGER NOT NULL DEFAULT 1,
    "section" TEXT, -- TWK, TIU, TKP, Structure, Reading, Penalaran Matematika
    "questionText" TEXT NOT NULL,
    "image" TEXT,
    "options" JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{ "key": "A", "text": "...", "points": 5 }]
    "correctKey" TEXT NOT NULL DEFAULT 'A',
    "points" INTEGER NOT NULL DEFAULT 5,
    "explanation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamQuestion_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ExamQuestion_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 3. Table: StudentExamSession (Sesi & Rapor Ujian Siswa)
CREATE TABLE IF NOT EXISTS "StudentExamSession" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "studentName" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedAt" TIMESTAMP(3),
    "durationSecondsUsed" INTEGER NOT NULL DEFAULT 0,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isPassed" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'SEDANG_MENGERJAKAN', -- SEDANG_MENGERJAKAN, SELESAI
    "answers" JSONB NOT NULL DEFAULT '{}'::jsonb, -- { [questionId]: { "selectedKey": "A", "isDoubtful": false, "pointsEarned": 5 } }
    "sectionScores" JSONB NOT NULL DEFAULT '{}'::jsonb, -- { "TWK": 85, "TIU": 105, "TKP": 175 }
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentExamSession_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "StudentExamSession_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Exam_category_idx" ON "Exam"("category");
CREATE INDEX IF NOT EXISTS "ExamQuestion_examId_idx" ON "ExamQuestion"("examId");
CREATE INDEX IF NOT EXISTS "StudentExamSession_examId_idx" ON "StudentExamSession"("examId");
CREATE INDEX IF NOT EXISTS "StudentExamSession_studentId_idx" ON "StudentExamSession"("studentId");
