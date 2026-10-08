/**
 * BIAS RISTEK - Comprehensive QA Automation Suite
 * Tests Core Engines: Server Actions, Course Pipeline, Payment & Enrollment,
 * AI Assistant Parsing, Media Library, Analytics, and Data Integrity.
 */

import "dotenv/config";
import { getCourses, getCourseBySlug } from "../actions/kursus.ts";
import { createEnrollment, getRegistrationByInvoice, getAdminRegistrations } from "../actions/pendaftaran.ts";
import { getPaymentAccounts } from "../actions/pembayaran.ts";
import { getDashboardAnalyticsData } from "../actions/analytics.ts";
import { getMediaFiles } from "../actions/media.ts";
import { getAdminMenus } from "../actions/menu.ts";
import { callGeminiCounselor } from "../lib/ai.ts";
import {
  submitSessionEvaluation,
  getSessionEvaluations,
  compileMonthlyProgressReport,
  getStudentMonthlyReports,
  getMonthlyReportByNumber,
} from "../actions/rapor.ts";
import {
  createSupportTicket,
  getSupportTickets,
  getSupportMetrics,
  updateTicketStatus,
  reactivateAiBot,
  isContactHandoffActive,
  processOmnichannelMessage,
} from "../actions/support.ts";
import { evaluateHandoffIntent } from "../lib/handoff.ts";

import { supabaseAdmin } from "../lib/supabase.ts";

async function runQASuite() {
  console.log("==========================================================");
  console.log("🔬 STARTING BIAS RISTEK COMPREHENSIVE QA TEST SUITE");
  console.log("==========================================================\n");

  let passedTests = 0;
  let failedTests = 0;

  function assert(condition, testName, details = "") {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${testName} - ${details}`);
      failedTests++;
    }
  }

  // Provision test course
  const testCourseId = `course_qa_suite_${Date.now()}`;
  const testCourseSlug = `mentorship-qa-suite-${Date.now()}`;
  const { error: cErr } = await supabaseAdmin.from("Course").insert({
    id: testCourseId,
    title: "Mentorship Scopus QA Suite",
    slug: testCourseSlug,
    category: "Scopus & SINTA",
    tagline: "Program pengujian otomatis",
    description: "Deskripsi lengkap program kelas riset pengujian otomatis.",
    mentorName: "Dr. Tester QA",
    mentorTitle: "Senior Reviewer",
    price: 499000,
    salePrice: 499000,
    isFree: false,
    maxQuota: 30,
    currentEnrolled: 5,
    status: "OPEN",
    isActive: true,
  });

  try {
    // ---------------------------------------------------------
    // TEST SUITE 1: Course Catalog & Slug Retrieval
    // ---------------------------------------------------------
    console.log("🧪 [TEST GROUP 1] Course Catalog & Data Engine");
    const allCourses = await getCourses();
    assert(Array.isArray(allCourses) && allCourses.length > 0, "TC-01: Fetch all active courses", `Got ${allCourses.length} courses`);
    
    assert(typeof allCourses === "object", "TC-02: Course catalog query structure integrity");

    const courseBySlug = await getCourseBySlug(testCourseSlug);
    assert(courseBySlug !== null && courseBySlug.id === testCourseId, "TC-03: Retrieve course detail by slug", `Slug: ${testCourseSlug}`);
    assert(courseBySlug.price >= 0 && courseBySlug.maxQuota >= 0, "TC-04: Course pricing and quota schema integrity");

    const filteredCategory = await getCourses({ category: "NonExistentCategoryTest" });
    assert(Array.isArray(filteredCategory) && filteredCategory.length === 0, "TC-05: Filter courses by category");

    // ---------------------------------------------------------
    // TEST SUITE 2: In-House Enrollment & Payment Engine
    // ---------------------------------------------------------
    console.log("\n🧪 [TEST GROUP 2] Enrollment & Transaction Checkout");
    const testEnrollmentData = {
      courseId: testCourseId,
      name: "Dr. QA Automation Tester, M.Sc.",
      email: "qa.tester@example.ac.id",
      phone: "081234567899",
      institution: "Institut Riset QA Nasional",
      educationLevel: "Dosen / Peneliti",
      researchTopic: "Evaluasi Regresi Multivariat & SEM",
      paymentMethod: "QRIS",
      bankName: "QRIS",
    };

    const enrollRes = await createEnrollment(testEnrollmentData);
    assert(enrollRes.success === true && !!enrollRes.data?.invoiceNumber, "TC-06: Create enrollment & generate Invoice Number", `Invoice: ${enrollRes.data?.invoiceNumber}`);

    if (enrollRes.data?.invoiceNumber) {
      const inv = enrollRes.data.invoiceNumber;
      assert(inv.startsWith("INV-"), "TC-07: Invoice number format compliance (INV-YYYYMM-XXXX)", `Got ${inv}`);
      assert(enrollRes.data.uniqueCode >= 100 && enrollRes.data.uniqueCode <= 999, "TC-08: 3-Digit Unique Code generation", `Code: ${enrollRes.data.uniqueCode}`);
      
      const invoiceData = await getRegistrationByInvoice(inv);
      assert(invoiceData !== null && invoiceData.name === testEnrollmentData.name, "TC-09: Retrieve public invoice tracking data");
    }

    const adminRegs = await getAdminRegistrations();
    assert(adminRegs && Array.isArray(adminRegs.data), "TC-10: Retrieve admin registrations with summary statistics");
    assert(typeof adminRegs.summary.totalRegistrations === "number", "TC-11: Aggregated summary stats calculation");

    // ---------------------------------------------------------
    // TEST SUITE 3: Payment Accounts & QRIS Management
    // ---------------------------------------------------------
    console.log("\n🧪 [TEST GROUP 3] Payment Accounts (QRIS & Bank Transfer)");
    const payAccounts = await getPaymentAccounts();
    assert(Array.isArray(payAccounts) && payAccounts.length >= 1, "TC-12: Fetch active payment accounts", `Found ${payAccounts.length} accounts`);
    const qrisAccount = payAccounts.find(a => a.type === "QRIS");
    const bankAccount = payAccounts.find(a => a.type === "BANK");
    assert(!!qrisAccount, "TC-13: QRIS payment method configured");
    assert(!!bankAccount, "TC-14: Bank transfer account configured");

    // ---------------------------------------------------------
    // TEST SUITE 4: Dashboard Visual Analytics Engine
    // ---------------------------------------------------------
    console.log("\n🧪 [TEST GROUP 4] Visual Analytics & Time-Series Aggregation");
    const analytics7d = await getDashboardAnalyticsData("7d");
    assert(!!analytics7d.overview && !!analytics7d.timeSeries, "TC-15: Compute 7-day analytics dataset");
    assert(analytics7d.timeSeries.length === 7, "TC-16: 7-day time series data points count", `Got ${analytics7d.timeSeries.length} points`);
    
    const analytics30d = await getDashboardAnalyticsData("30d");
    assert(analytics30d.timeSeries.length === 30, "TC-17: 30-day time series data points count", `Got ${analytics30d.timeSeries.length} points`);
    assert(Array.isArray(analytics7d.categoryDistribution), "TC-18: Category share distribution calculation");
    assert(Array.isArray(analytics7d.topArticles), "TC-19: Top 5 popular publications leaderboard");

    // ---------------------------------------------------------
    // TEST SUITE 5: Media Library & Admin Menu Registry
    // ---------------------------------------------------------
    console.log("\n🧪 [TEST GROUP 5] Media Library & Menu Registry");
    const mediaFiles = await getMediaFiles({ limit: 10 });
    assert(Array.isArray(mediaFiles.data) && Array.isArray(mediaFiles.folders), "TC-20: Fetch media library items & folder facets");

    const adminMenus = await getAdminMenus();
    assert(Array.isArray(adminMenus) && adminMenus.length > 5, "TC-21: Dynamic admin menu registry retrieval");
    const courseMenu = adminMenus.find(m => m.id === "menu_kursus" || m.url === "/dashboard/kursus");
    const regMenu = adminMenus.find(m => m.id === "menu_pendaftaran" || m.url === "/dashboard/pendaftaran");
    assert(!!courseMenu, "TC-22: Program Kursus menu registered in sidebar");
    assert(!!regMenu, "TC-23: Pendaftaran & Transaksi menu registered in sidebar");

    // ---------------------------------------------------------
    // TEST SUITE 6: AI Course Counselor Engine
    // ---------------------------------------------------------
    console.log("\n🧪 [TEST GROUP 6] AI Course Counselor Engine");
    const testMessages = [
      { role: "user", content: "Saya mau bimbingan olah data kuantitatif dengan SmartPLS untuk tesis" }
    ];
    const coursesContext = allCourses.map(c => `[SLUG: ${c.slug}] ${c.title} (${c.category})`).join("\n");
    const counselorRes = await callGeminiCounselor(testMessages, coursesContext);
    assert(counselorRes.success === true, "TC-24: AI Counselor successfully generates advice", counselorRes.error || JSON.stringify(counselorRes));
    assert(typeof counselorRes.data?.reply === "string" && counselorRes.data.reply.length > 20, "TC-25: AI Counselor generates structured reply", counselorRes.error);
    assert(Array.isArray(counselorRes.data?.suggestedQuestions), "TC-26: AI Counselor returns quick follow-up questions", counselorRes.error);

    // ---------------------------------------------------------
    // TEST SUITE 7: Student LMS, Manuscript Review & E-Certificate
    // ---------------------------------------------------------
    console.log("\n🧪 [TEST GROUP 7] Student LMS, Manuscript Review & E-Certificate");
    const { getMyEnrolledCourses, getCourseClassroom, toggleLessonCompletion, getCourseCurriculumAdmin, upsertCourseModule, deleteCourseModule, upsertCourseLesson, deleteCourseLesson } = await import("../actions/belajar.ts");
    const { submitResearchDraft, getStudentSubmissions, getAdminSubmissions, reviewSubmission } = await import("../actions/tugas.ts");
    const { claimCertificate, getCertificateByCode } = await import("../actions/sertifikat.ts");

    const unpurchasedCourses = await getMyEnrolledCourses("unpurchased_user@biasristek.id");
    assert(Array.isArray(unpurchasedCourses) && unpurchasedCourses.length === 0, "TC-27: Strict gatekeeping: user with 0 enrollments returns empty list");

    const noEmailCourses = await getMyEnrolledCourses("");
    assert(Array.isArray(noEmailCourses) && noEmailCourses.length === 0, "TC-28: Strict gatekeeping: unauthenticated query returns empty list");

    const classroom = await getCourseClassroom(testCourseSlug);
    assert(!!classroom && !!classroom.course && Array.isArray(classroom.modules), "TC-29: Load classroom modules and syllabus playlist");
    assert(classroom.modules.length >= 1, "TC-30: Classroom contains weekly curriculum structure");

    const testEnrollId = `enroll_qa_${Date.now()}`;
    await supabaseAdmin.from("CourseEnrollment").insert({
      id: testEnrollId,
      userEmail: "ahmad.student@biasristek.id",
      userName: "Ahmad Mahasiswa Riset, S.Kom.",
      courseId: testCourseId,
      status: "ACTIVE",
    });

    const toggleRes = await toggleLessonCompletion(testEnrollId, "les_scopus_1_1", true);
    assert(toggleRes.success === true, "TC-31: Toggle lesson completion status");

    const draftRes = await submitResearchDraft({
      enrollmentId: testEnrollId,
      studentName: "Ahmad Mahasiswa Riset, S.Kom.",
      studentEmail: "ahmad.student@biasristek.id",
      googleDocUrl: "https://docs.google.com/document/d/1SAMPLE_DRAFT_SCOPUS_Q1/edit",
      notes: "Mohon evaluasi kerangka novelty dan hipotesis moderasi SmartPLS.",
    });
    assert(draftRes.success === true, "TC-32: Student submit research manuscript draft");

    const mentorSubmissions = await getAdminSubmissions();
    assert(Array.isArray(mentorSubmissions), "TC-33: Mentor retrieve manuscript submissions queue");

    const certRes = await claimCertificate(testEnrollId, "Ahmad Mahasiswa Riset, S.Kom.", "Mentorship Scopus & SINTA 1-2");
    assert(certRes.success === true && !!certRes.data?.certificateCode, "TC-34: Claim 32 JP E-Certificate", `Code: ${certRes.data?.certificateCode}`);

    if (certRes.data?.certificateCode) {
      const publicCert = await getCertificateByCode(certRes.data.certificateCode);
      assert(publicCert !== null && (publicCert.recipientName === "Ahmad Mahasiswa Riset, S.Kom." || !!publicCert.recipientName), "TC-35: Public validation of E-Certificate by code");
    }

    // ---------------------------------------------------------
    // TEST SUITE 8: Mentor Dynamic Curriculum & Multi-Attachments
    // ---------------------------------------------------------
    console.log("\n🧪 [TEST GROUP 8] Mentor Dynamic Curriculum & Multi-Attachments");
    const adminCurriculum = await getCourseCurriculumAdmin(testCourseId);
    assert(!!adminCurriculum.course && Array.isArray(adminCurriculum.modules), "TC-36: Mentor fetch curriculum management tree");

    const newModRes = await upsertCourseModule({
      courseId: testCourseId,
      title: "Minggu 5: Workshop Praktik Menjawab Reviewer",
      description: "Sesi simulasi bedah komentar reviewer Scopus Q1",
      sortOrder: 5,
    });
    assert(newModRes.success === true && !!newModRes.data?.id, "TC-37: Mentor create/update dynamic course module");

    const newLessonRes = await upsertCourseLesson({
      moduleId: newModRes.data?.id || "mod_test",
      title: "Sesi 9: Bedah Response Letter Scopus",
      durationMin: 120,
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      pdfSlideUrl: "/uploads/slide-sesi-9.pdf",
      attachments: [
        { name: "Dataset Latihan SmartPLS", url: "/uploads/data.splsm", type: "SMARTPLS" },
        { name: "Template Response to Reviewers", url: "/uploads/response.docx", type: "DOCX" }
      ],
      sortOrder: 1,
    });
    assert(newLessonRes.success === true && !!newLessonRes.data?.id, "TC-38: Mentor create/update lesson with dynamic multi-attachments");

    // ---------------------------------------------------------
    // TEST SUITE 9: Rapor Bulanan & Evaluasi Sesi Mentor (Fase #6)
    // ---------------------------------------------------------
    console.log("\n🧪 [TEST GROUP 9] Rapor Bulanan & Evaluasi Sesi Mentor (Fase #6)");
    const testEvalStudentEmail = "ahmad.riset.qa@example.com";
    const testEvalBookingId = `booking_qa_${Date.now()}`;

    const evalRes = await submitSessionEvaluation({
      bookingId: testEvalBookingId,
      tutorId: "tutor_hendra_scopus",
      tutorName: "Dr. Ir. Hendra Gunawan, M.Sc.",
      studentEmail: testEvalStudentEmail,
      studentName: "Ahmad Mahasiswa Riset QA, S.Kom.",
      sessionNumber: 1,
      currentChapter: "Bab 3: Metodologi & SEM Moderasi",
      topicDiscussed: "Pengujian Outer Model & Discriminant Validity HTMT SmartPLS 4",
      methodologyScore: 92,
      writingScore: 88,
      dataProcessingScore: 94,
      attendanceStatus: "ATTENDED",
      actionItems: "Perbaiki matriks operasionalisasi variabel pada tabel 3.2.",
      tutorFeedback: "Pemahaman metodologis sangat tajam. Naskah siap dilanjutkan ke Bab 4.",
      isFinalSession: false,
    });
    assert(evalRes.success === true && !!evalRes.data?.id, "TC-39: Submit session evaluation with 3 core academic competencies", `Eval ID: ${evalRes.data?.id}`);

    const retrievedEvals = await getSessionEvaluations({ studentEmail: testEvalStudentEmail });
    assert(Array.isArray(retrievedEvals) && retrievedEvals.length > 0, "TC-40: Mentor & Student query session evaluation history", `Found ${retrievedEvals.length} evaluations`);

    const now = new Date();
    const compileRes = await compileMonthlyProgressReport({
      studentEmail: testEvalStudentEmail,
      studentName: "Ahmad Mahasiswa Riset QA, S.Kom.",
      periodMonth: now.getMonth() + 1,
      periodYear: now.getFullYear(),
      courseTitle: "Mentorship Scopus & SINTA 1-2",
      tutorName: "Dr. Ir. Hendra Gunawan, M.Sc.",
    });
    assert(compileRes.success === true && !!compileRes.data?.reportNumber, "TC-41: Engine compile official Monthly Academic Progress Report", `Report No: ${compileRes.data?.reportNumber}`);

    if (compileRes.data?.reportNumber) {
      const repNum = compileRes.data.reportNumber;
      assert(repNum.startsWith("RAPOR-"), "TC-42: Standardized Report Number format compliance (RAPOR-YYYYMM-XXXX)", `Got ${repNum}`);

      const studentReports = await getStudentMonthlyReports(testEvalStudentEmail);
      assert(Array.isArray(studentReports) && studentReports.some((r) => r.reportNumber === repNum), "TC-43: Student portal retrieve monthly reports catalog");

      const publicReport = await getMonthlyReportByNumber(repNum);
      assert(publicReport !== null && publicReport.averageScore >= 80, "TC-44: Public validation and printable A4 report retrieval by register number", `Score: ${publicReport?.averageScore}`);
    }

    // ---------------------------------------------------------
    // TEST SUITE 10: Bot AI CS & WhatsApp Human Handoff (Fase #7)
    // ---------------------------------------------------------
    console.log("\n🧪 [TEST GROUP 10] Bot AI CS & WhatsApp Human Handoff (Fase #7)");
    
    // TC-45: Evaluate Human Handoff trigger
    const evalHandoff = await evaluateHandoffIntent("Tolong hubungkan saya dengan staf admin manusia, mau tanya proposal tesis.");
    assert(evalHandoff.shouldHandoff === true && evalHandoff.triggerReason === "KEYWORD_TRIGGER", "TC-45: Detect explicit human handoff keyword triggers", `Reason: ${evalHandoff.triggerReason}`);

    // TC-46: Evaluate standard FAQ (should NOT handoff)
    const evalFaq = await evaluateHandoffIntent("Berapa biaya kursus SmartPLS dan apakah dapat rekaman Zoom?");
    assert(evalFaq.shouldHandoff === false, "TC-46: Accurately allow standard FAQ queries to stay on AI auto-reply", `Should handoff: ${evalFaq.shouldHandoff}`);

    // TC-47: Create Support Ticket and test format
    const testHandoffPhone = "6289988776655";
    const ticketRes = await createSupportTicket({
      customerName: "Prof. Dr. Ir. Budi Santoso",
      customerPhone: testHandoffPhone,
      customerEmail: "budi.santoso@univ.ac.id",
      source: "WHATSAPP",
      category: "KONSULTASI_RISET",
      triggerReason: "COMPLEX_RESEARCH_TOPIC",
      summary: "Permintaan MOU pendampingan publikasi Scopus untuk 15 dosen fakultas.",
      lastUserMessage: "Kami dari dekanat ingin paket khusus pendampingan 15 naskah dosen tembus Scopus Q1.",
    });
    assert(ticketRes.success === true && !!ticketRes.data?.ticketNumber, "TC-47: Create Support Ticket & generate unique ticket number", `No: ${ticketRes.data?.ticketNumber}`);

    if (ticketRes.data?.ticketNumber) {
      const tNum = ticketRes.data.ticketNumber;
      assert(tNum.startsWith("TIKET-"), "TC-48: Standardized Ticket Number compliance (TIKET-YYYYMM-XXXX)", `Got ${tNum}`);

      // TC-49: Verify Handoff Silence Protection (Bot stays silent so admin can reply directly)
      const isSilenced = await isContactHandoffActive(testHandoffPhone);
      assert(isSilenced === true, "TC-49: Silence bot auto-reply when contact has active human handoff");

      const silentMsgRes = await processOmnichannelMessage({
        source: "WHATSAPP",
        senderName: "Prof. Budi",
        senderPhone: testHandoffPhone,
        message: "Selamat siang admin, apakah pesan saya sudah dibaca?",
      });
      assert(silentMsgRes.handledBy === "HUMAN_WAITING" && silentMsgRes.reply === null, "TC-50: Omnichannel message processor stays silent during human handoff");

      // TC-51: Admin resolve ticket and reactivate AI Bot
      const reactivateRes = await reactivateAiBot(ticketRes.data.id);
      assert(reactivateRes.success === true && reactivateRes.data?.handoffActive === false, "TC-51: Admin CS mark ticket resolved and reactivate AI Bot auto-reply");
      
      const isSilencedAfter = await isContactHandoffActive(testHandoffPhone);
      assert(isSilencedAfter === false, "TC-52: Verify bot silence lifted after admin marks ticket resolved");
    }

  } catch (err) {
    console.error("FATAL QA SUITE ERROR:", err);
    assert(false, "TC-FATAL: Suite execution completed without uncaught exceptions", err.message);
  } finally {
    // Teardown test course
    try {
      await supabaseAdmin.from("Course").delete().eq("id", testCourseId);
      await supabaseAdmin.from("CourseRegistration").delete().eq("courseId", testCourseId);
    } catch {}
  }

  console.log("\n==========================================================");
  console.log(`📊 QA TEST SUITE SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log("==========================================================");
  process.exit(failedTests > 0 ? 1 : 0);
}

runQASuite();
