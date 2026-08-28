import "dotenv/config";
import { supabaseAdmin as supabase } from "../lib/supabase.ts";
import { compare } from "bcryptjs";

async function runLMSComprehensiveVerification() {
  console.log("================================================================================");
  console.log("🎓 BIAS RISTEK LMS - END-TO-END FEATURE VERIFICATION SUITE");
  console.log("================================================================================\n");

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  function assert(condition, testName, extra = "") {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✅ [PASS] ${testName} ${extra ? `-> ${extra}` : ""}`);
    } else {
      failedTests++;
      console.error(`  ❌ [FAIL] ${testName} ${extra ? `-> ${extra}` : ""}`);
    }
  }

  // Import server actions dynamically
  const { createEnrollment, updateRegistrationStatus } = await import("../actions/pendaftaran.ts");
  const { getMyEnrolledCourses, getCourseClassroom, toggleLessonCompletion, getCourseCurriculumAdmin, upsertCourseModule, upsertCourseLesson, deleteCourseLesson, deleteCourseModule } = await import("../actions/belajar.ts");
  const { submitResearchDraft, getStudentSubmissions, getAdminSubmissions, reviewSubmission } = await import("../actions/tugas.ts");
  const { claimCertificate, getCertificateByCode } = await import("../actions/sertifikat.ts");
  const { getCourses, createCourse, deleteCourse } = await import("../actions/kursus.ts");

  // Step 0: Ensure a clean test course exists
  console.log("📌 [SETUP] Creating isolated Test Course for LMS Verification...");
  const testCourseId = `course_lms_qa_${Date.now()}`;
  const testCourseSlug = `mentorship-uji-coba-lms-${Date.now()}`;
  
  const { error: courseErr } = await supabase.from("Course").insert({
    id: testCourseId,
    title: "Mentorship Publikasi Scopus & Analisis Data - Kelas Pengujian",
    slug: testCourseSlug,
    category: "Scopus & SINTA",
    tagline: "Kelas uji coba komprehensif seluruh alur fitur LMS",
    description: "Deskripsi lengkap program kelas riset pengujian otomatis.",
    price: 750000,
    salePrice: 500000,
    isFree: false,
    maxQuota: 30,
    currentEnrolled: 0,
    mentorName: "Dr. Hendra Gunawan, M.Sc.",
    status: "OPEN",
    isActive: true,
    sortOrder: 1,
  });
  assert(!courseErr, "Setup Test Course creation in Supabase", `Course ID: ${testCourseId}`);

  // ============================================================================
  // 1. AUTENTIKASI TERPADU & HAK AKSES KETAT (Strict Gatekeeping & Auto-Provisioning)
  // ============================================================================
  console.log("\n🧪 [FITUR 1] Autentikasi Terpadu & Hak Akses Ketat (Strict Gatekeeping & Provisioning)");
  
  // 1.1 Unauthenticated query returns zero courses
  const unauthCourses = await getMyEnrolledCourses("");
  assert(Array.isArray(unauthCourses) && unauthCourses.length === 0, "1.1 Anonymous / Unauthenticated user returns empty course list (Strict Zero-Mock)");

  const unregisteredCourses = await getMyEnrolledCourses("unregistered_peserta@example.com");
  assert(Array.isArray(unregisteredCourses) && unregisteredCourses.length === 0, "1.2 Non-purchased email returns empty course list");

  // 1.3 Checkout & Auto-provisioning User + CourseEnrollment
  const testEmail = `peserta.lms.${Date.now()}@biasristek.id`;
  const testPhone = "081298765432";
  const testName = "Ahmad Mahasiswa Riset, S.Kom.";

  const checkoutRes = await createEnrollment({
    courseId: testCourseId,
    name: testName,
    email: testEmail,
    phone: testPhone,
    institution: "Universitas Indonesia",
    educationLevel: "Magister (S2)",
    researchTopic: "Penerapan Deep Learning pada Prediksi Publikasi Ilmiah",
    paymentMethod: "QRIS",
    bankName: "QRIS",
  });
  assert(checkoutRes.success && !!checkoutRes.data?.id, "1.3 Student completes checkout & creates CourseRegistration", `Invoice: ${checkoutRes.data?.invoiceNumber}`);

  const regId = checkoutRes.data.id;
  // Admin verifies payment
  const verifyRes = await updateRegistrationStatus(regId, "VERIFIED", "Pembayaran QRIS lunas terverifikasi");
  assert(verifyRes.success, "1.4 Admin verifies payment status to VERIFIED");

  // Verify User auto-created in Supabase
  const { data: createdUser } = await supabase.from("User").select("*").eq("email", testEmail).maybeSingle();
  assert(!!createdUser && createdUser.email === testEmail, "1.5 User account automatically provisioned in User table");
  
  // Verify default password matches bcrypt-hashed phone number
  const isPasswordValid = await compare(testPhone, createdUser.password);
  assert(isPasswordValid, "1.6 Default user password automatically set to phone number and bcrypt-hashed");

  // Verify CourseEnrollment auto-created
  const { data: enrollmentRecord } = await supabase.from("CourseEnrollment").select("*").eq("userEmail", testEmail).eq("courseId", testCourseId).maybeSingle();
  assert(!!enrollmentRecord && enrollmentRecord.status === "ACTIVE", "1.7 CourseEnrollment activated in Supabase with ACTIVE status", `Enrollment ID: ${enrollmentRecord?.id}`);

  const activeEnrollmentId = enrollmentRecord.id;

  // Student can now query their enrolled courses
  const studentEnrolledList = await getMyEnrolledCourses(testEmail);
  assert(studentEnrolledList.length === 1 && studentEnrolledList[0].courseSlug === testCourseSlug, "1.8 Student dashboard /belajar now unlocks the enrolled course", `Course: ${studentEnrolledList[0]?.courseTitle}`);

  // ============================================================================
  // 2. RUANG BELAJAR DIGITAL SISWA & MULTI-ATTACHMENTS
  // ============================================================================
  console.log("\n🧪 [FITUR 2] Ruang Belajar Digital Siswa & Multi-Attachment Uploads");

  // 2.1 Mentor creates dynamic curriculum module
  const modRes = await upsertCourseModule({
    courseId: testCourseId,
    title: "Modul 1: Fondasi State-of-the-Art & GAP Analysis Jurnal Bereputasi",
    sortOrder: 1,
  });
  assert(modRes.success && !!modRes.data?.id, "2.1 Mentor creates dynamic course module via Curriculum Builder", `Module ID: ${modRes.data?.id}`);
  const testModuleId = modRes.data.id;

  // 2.2 Mentor adds lesson with multi-attachments (PDF, SmartPLS, SPSS, Drive Link)
  const testAttachments = [
    { name: "Slide Materi Modul 1.pdf", url: "/uploads/modules/slide-materi-1.pdf", type: "PDF", size: "2.4 MB" },
    { name: "Dataset_SmartPLS_Latihan.spls", url: "/uploads/datasets/latihan.spls", type: "SMARTPLS", size: "1.1 MB" },
    { name: "Template Format IMRAD Scopus.docx", url: "/uploads/templates/imrad.docx", type: "DOCX", size: "850 KB" },
    { name: "Folder Google Drive Berkas Pendukung", url: "https://drive.google.com/drive/folders/sample-lms-bias", type: "LINK" }
  ];

  const lessonRes = await upsertCourseLesson({
    moduleId: testModuleId,
    title: "Sesi 1.1: Membedah Struktur Naskah Standar Q1-Q4",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    duration: "45 Menit",
    sortOrder: 1,
    isFreePreview: false,
    attachments: testAttachments,
  });
  assert(lessonRes.success && !!lessonRes.data?.id, "2.2 Mentor attaches multi-format files (PDF, SMARTPLS, DOCX, LINK) to Lesson", `Lesson ID: ${lessonRes.data?.id}`);
  const testLessonId = lessonRes.data.id;

  // 2.3 Student loads classroom details
  const classroom = await getCourseClassroom(testCourseSlug, testEmail);
  assert(!!classroom && !!classroom.course && classroom.modules.length >= 1, "2.3 Student loads classroom structure with enrolled status");
  
  const loadedLesson = classroom.modules[0]?.lessons?.find(l => l.id === testLessonId);
  assert(!!loadedLesson && Array.isArray(loadedLesson.attachments) && loadedLesson.attachments.length >= 1, "2.4 Classroom renders multi-file downloads playlist for student", `Attachments count: ${loadedLesson?.attachments?.length}`);

  // 2.5 Toggle Lesson Completion
  const toggleRes = await toggleLessonCompletion(activeEnrollmentId, testLessonId, true);
  assert(toggleRes.success, "2.5 Student toggles lesson completion status checkmark");

  // ============================================================================
  // 3. PENGUMPULAN DRAF NASKAH & REVIEW ILMIAH
  // ============================================================================
  console.log("\n🧪 [FITUR 3] Pengumpulan Draf Naskah & Review Ilmiah (Manuscript Workflow)");

  // 3.1 Student submits manuscript draft
  const draftSubmitRes = await submitResearchDraft({
    enrollmentId: activeEnrollmentId,
    lessonId: testLessonId,
    title: "Draf Naskah Scopus: Pengaruh Adopsi AI terhadap Kinerja Riset Dosen",
    fileUrl: "https://docs.google.com/document/d/sample-draf-naskah/edit",
    studentNotes: "Mohon review khusus pada bagian GAP Analysis dan Formula State-of-the-Art di Bab 1.",
    courseSlug: testCourseSlug,
  });
  assert(draftSubmitRes.success, "3.1 Student submits manuscript draft link with research notes");

  // 3.2 Mentor retrieves manuscript queue
  const adminQueue = await getAdminSubmissions();
  const foundSubmission = adminQueue.find(s => s.enrollmentId === activeEnrollmentId);
  assert(!!foundSubmission && foundSubmission.status === "SUBMITTED", "3.2 Mentor workspace (/dashboard/tugas) receives the submission in review queue", `Submission ID: ${foundSubmission?.id}`);

  // 3.3 Mentor reviews and approves manuscript with feedback
  if (foundSubmission) {
    const reviewRes = await reviewSubmission({
      submissionId: foundSubmission.id,
      status: "APPROVED",
      mentorFeedback: "GAP Analysis sudah sangat tajam dan novelty naskah sangat jelas. Lanjutkan ke tahap analisis data.",
      score: 92,
      courseSlug: testCourseSlug,
    });
    assert(reviewRes.success, "3.3 Mentor submits grading score (92/100), feedback notes, and updates status to APPROVED");

    // 3.4 Student views feedback
    const studentSubmissions = await getStudentSubmissions(activeEnrollmentId);
    assert(studentSubmissions.length > 0 && studentSubmissions[0].status === "APPROVED" && studentSubmissions[0].score === 92, "3.4 Student successfully sees mentor review score & feedback in classroom");
  }

  // ============================================================================
  // 4. PENERBITAN & VALIDASI E-SERTIFIKAT RESMI 32 JP
  // ============================================================================
  console.log("\n🧪 [FITUR 4] Penerbitan & Validasi E-Sertifikat Resmi 32 JP");

  // 4.1 Claim E-Certificate
  const certRes = await claimCertificate(activeEnrollmentId);
  assert(certRes.success && !!certRes.data?.certificateCode, "4.1 Student claims official 32 JP E-Certificate", `Code: ${certRes.data?.certificateCode}`);
  const certCode = certRes.data?.certificateCode;

  // 4.2 Public Certificate Validation page
  if (certCode) {
    const certDetails = await getCertificateByCode(certCode);
    assert(!!certDetails && certDetails.certificateCode === certCode, "4.2 Public certificate validation query succeeds", `Recipient: ${certDetails?.recipientName}`);
    assert(certDetails.totalHours === "32 JP", "4.3 Certificate metadata contains official '32 JP' credit hours");
    assert(certDetails.recipientName === testName, "4.4 Certificate accurately reflects student recipient name");
  }

  // ============================================================================
  // 5. PANEL PENGELOLAAN MENTOR & ADMIN (Curriculum Builder & Clean-Up)
  // ============================================================================
  console.log("\n🧪 [FITUR 5] Panel Pengelolaan Mentor & Dynamic Curriculum Builder");

  // 5.1 Admin / Mentor retrieves curriculum tree
  const curriculumTree = await getCourseCurriculumAdmin(testCourseId);
  assert(!!curriculumTree.course && Array.isArray(curriculumTree.modules) && curriculumTree.modules.length >= 1, "5.1 Mentor retrieves dynamic curriculum management tree");

  // 5.2 Delete lesson and module
  const delLessonRes = await deleteCourseLesson(testLessonId);
  assert(delLessonRes.success, "5.2 Mentor deletes lesson from curriculum builder");

  const delModRes = await deleteCourseModule(testModuleId);
  assert(delModRes.success, "5.3 Mentor deletes module from curriculum builder");

  // Clean up test course and test records
  console.log("\n🧹 [TEARDOWN] Cleaning up temporary test records...");
  await supabase.from("Certificate").delete().eq("enrollmentId", activeEnrollmentId);
  await supabase.from("StudentSubmission").delete().eq("enrollmentId", activeEnrollmentId);
  await supabase.from("CourseEnrollment").delete().eq("id", activeEnrollmentId);
  await supabase.from("CourseRegistration").delete().eq("id", regId);
  await supabase.from("User").delete().eq("email", testEmail);
  await deleteCourse(testCourseId);

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log("\n================================================================================");
  console.log(`📊 LMS VERIFICATION RESULT: ${passedTests}/${totalTests} TESTS PASSED (${failedTests === 0 ? "100% SUKSES" : "ADA KEGAGALAN"})`);
  console.log("================================================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runLMSComprehensiveVerification().catch(err => {
  console.error("FATAL ERROR IN LMS VERIFICATION:", err);
  process.exit(1);
});
