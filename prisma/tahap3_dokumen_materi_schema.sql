-- ==============================================================================
-- TAHAP 3 SCHEMA MIGRATION: REVIEW DOKUMEN ILMIAH & BANK MATERI DIGITAL
-- Sahabat Belajar (Comprehensive Academic Solution)
-- ==============================================================================

-- 1. Tabel Dokumen Akademik & Draf Siswa (PRD Modul I: Review Dokumen)
CREATE TABLE IF NOT EXISTS "AcademicDocument" (
  "id" TEXT PRIMARY KEY,
  "studentId" TEXT NOT NULL,
  "studentName" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'ESAI_BEASISWA', -- ESAI_BEASISWA, PROPOSAL_TESIS, SKRIPSI_KTI, MOTIVATION_LETTER
  "targetInstitution" TEXT, -- LPDP, AAS, Universitas Indonesia, dsb.
  "stage" TEXT NOT NULL DEFAULT 'DRAFTING', -- DRAFTING, REVIEW_MENTOR, REVISI, APPROVED
  "version" INTEGER NOT NULL DEFAULT 1,
  "fileName" TEXT NOT NULL,
  "fileUrl" TEXT,
  "studentNotes" TEXT,
  "mentorId" TEXT,
  "mentorName" TEXT,
  "mentorNotes" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_academic_doc_student" ON "AcademicDocument"("studentId");
CREATE INDEX IF NOT EXISTS "idx_academic_doc_stage" ON "AcademicDocument"("stage");

-- 2. Tabel Bank Modul & Materi Belajar Digital (PRD Modul H2: Materi Belajar)
CREATE TABLE IF NOT EXISTS "LearningMaterial" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "programCategory" TEXT NOT NULL, -- K12, CPNS_BUMN, UTBK_SNBT, TOEFL_IELTS, S2_BEASISWA
  "subject" TEXT NOT NULL, -- Matematika Lanjutan, TWK Nasionalisme, Structure TOEFL, dsb.
  "description" TEXT,
  "fileUrl" TEXT,
  "fileName" TEXT,
  "fileSize" TEXT DEFAULT '1.5 MB',
  "authorTutor" TEXT DEFAULT 'Tim Akademik Sahabat Belajar',
  "downloadCount" INTEGER NOT NULL DEFAULT 0,
  "isPublished" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_learning_material_cat" ON "LearningMaterial"("programCategory");
