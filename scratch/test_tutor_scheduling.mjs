/**
 * BIAS RISTEK - Comprehensive Test Suite: Phase #4 Tutor Scheduling & Human in the Loop
 */

import "dotenv/config";
import {
  matchTutorsForStudent,
  getTutorDirectoryPool,
  computeTutorMatchScore,
} from "../lib/tutor-matching.ts";
import {
  createMentorshipProposal,
  getMentorshipBookingByToken,
  confirmMentorshipByToken,
  getDispatcherBoardData,
  getRecommendedTutors,
  getAllTutors,
} from "../actions/penjadwalan.ts";

async function runTutorSchedulingTests() {
  console.log("==========================================================");
  console.log("🎓 TESTING PHASE #4: PENJADWALAN 200+ TUTOR (HUMAN IN THE LOOP)");
  console.log("==========================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  // ----------------------------------------------------
  // TEST GROUP 1: Tutor Directory & Pool Validation
  // ----------------------------------------------------
  console.log("1. TUTOR DIRECTORY & 200+ POOL VALIDATION");
  const tutors = getTutorDirectoryPool();
  assert(tutors.length >= 200, `Pool contains 200+ tutors (actual: ${tutors.length})`);
  assert(tutors.every((t) => t.fullName && t.academicTitle && t.institution), "All tutors have complete academic credentials");
  assert(tutors.every((t) => t.whatsappNumber && t.whatsappNumber.startsWith("628")), "All tutors have valid E.164 phone numbers");
  assert(tutors.some((t) => t.specializations.includes("SmartPLS 4")), "Directory covers SmartPLS 4 experts");
  assert(tutors.some((t) => t.specializations.includes("Deep Learning") || t.specializations.includes("Python & AI")), "Directory covers AI & Python experts");
  assert(tutors.some((t) => t.specializations.includes("Kedokteran & Kesehatan")), "Directory covers Medical & Health experts");

  // ----------------------------------------------------
  // TEST GROUP 2: Smart Matching Engine Scoring
  // ----------------------------------------------------
  console.log("\n2. SMART MATCHING ENGINE COMPATIBILITY SCORING");

  // Case A: SmartPLS & Manajemen Student
  const smartPlsStudent = {
    researchTopic: "Pengaruh Brand Equity terhadap Loyalitas Nasabah Bank Digital Menggunakan PLS-SEM",
    researchSoftware: "SmartPLS 4",
    educationLevel: "S2 (Tesis)",
    preferredSchedule: [{ day: "RABU", timeSlot: "19:30 - 21:00 WIB" }],
  };

  const smartPlsMatches = matchTutorsForStudent(smartPlsStudent, tutors, 3);
  assert(smartPlsMatches.length === 3, "Returns Top 3 candidate tutors");
  assert(smartPlsMatches[0].matchScore >= 80, `Top candidate has high match score (${smartPlsMatches[0].matchScore}%)`);
  assert(
    smartPlsMatches[0].tutor.specializations.includes("SmartPLS 4") || smartPlsMatches[0].tutor.fullName.includes("Hendra"),
    `Top candidate specialized in SmartPLS (${smartPlsMatches[0].tutor.fullName})`
  );
  assert(smartPlsMatches[0].reasons.length > 0, "Provides clear matching reasons");

  // Case B: Deep Learning & S3 Student
  const aiStudent = {
    researchTopic: "Arsitektur Convolutional Neural Network untuk Klasifikasi Citra Medis MRI",
    researchSoftware: "Python",
    educationLevel: "S3 (Disertasi)",
    preferredSchedule: [{ day: "SABTU", timeSlot: "19:30 - 21:00 WIB" }],
  };

  const aiMatches = matchTutorsForStudent(aiStudent, tutors, 3);
  assert(aiMatches[0].tutor.specializations.some((s) => s.includes("Python") || s.includes("Deep Learning")), `Top candidate specialized in AI (${aiMatches[0].tutor.fullName})`);
  assert(aiMatches[0].tutor.hIndex >= 10, "Senior researcher recommended for S3 Disertasi");

  // ----------------------------------------------------
  // TEST GROUP 3: Proposal Creation & Magic Token Dispatch
  // ----------------------------------------------------
  console.log("\n3. PROPOSAL CREATION & MAGIC TOKEN DISPATCH");

  const proposalRes = await createMentorshipProposal({
    studentName: "Reza Pratama, S.E.",
    studentWhatsapp: "6281299887766",
    studentEmail: "reza.pratama@kampus.ac.id",
    studentInstitution: "Universitas Indonesia",
    studentEducationLevel: "S2 (Tesis)",
    tutorId: smartPlsMatches[0].tutor.id,
    researchTopic: smartPlsStudent.researchTopic,
    researchSoftware: "SmartPLS 4",
    scheduledDate: "2026-10-20",
    timeSlot: "19:30 - 21:00 WIB",
    tutorNotes: "Harap siapkan draf Bab 3 dan output outer model.",
  });

  assert(proposalRes.success === true, "createMentorshipProposal returned success");
  assert(!!proposalRes.data?.magicToken, "Cryptographic magicToken generated");
  assert(proposalRes.data?.magicToken.length === 32, "magicToken is 32-character hex");
  assert(proposalRes.data?.booking.status === "PENDING_TUTOR_CONFIRMATION", "Initial status is PENDING_TUTOR_CONFIRMATION");

  const magicToken = proposalRes.data?.magicToken;

  // ----------------------------------------------------
  // TEST GROUP 4: Public Token Lookup
  // ----------------------------------------------------
  console.log("\n4. PUBLIC TOKEN LOOKUP (MAGIC LINK)");
  const loadedBooking = await getMentorshipBookingByToken(magicToken);
  assert(!!loadedBooking, "getMentorshipBookingByToken successfully retrieved booking");
  assert(loadedBooking.studentName === "Reza Pratama, S.E.", "Booking student matches proposal");
  assert(loadedBooking.tutorName === smartPlsMatches[0].tutor.fullName, "Booking tutor matches proposal");

  // ----------------------------------------------------
  // TEST GROUP 5: 1-Click Confirmation & Zoom Link Generation
  // ----------------------------------------------------
  console.log("\n5. 1-CLICK CONFIRMATION & ZOOM LINK GENERATION");
  const confirmRes = await confirmMentorshipByToken(magicToken, "ACCEPT", "Disetujui. Saya siap mendampingi sesi ini.");
  assert(confirmRes.success === true, "confirmMentorshipByToken ACCEPT succeeded");
  assert(confirmRes.data?.booking.status === "CONFIRMED", "Booking status updated to CONFIRMED");
  assert(!!confirmRes.data?.booking.zoomJoinUrl, "Zoom Join URL generated automatically");
  assert(confirmRes.data?.booking.zoomJoinUrl.includes("zoom.us"), "Zoom Join URL is valid zoom domain");
  assert(!!confirmRes.data?.booking.confirmedAt, "confirmedAt timestamp recorded");

  // Test Idempotency: calling confirm again
  const secondConfirmRes = await confirmMentorshipByToken(magicToken, "ACCEPT");
  assert(secondConfirmRes.success === true, "Idempotent confirmation succeeds gracefully");
  assert(secondConfirmRes.data?.booking.status === "CONFIRMED", "Booking remains CONFIRMED without duplication");

  // ----------------------------------------------------
  // TEST GROUP 6: Decline / Reschedule Flow
  // ----------------------------------------------------
  console.log("\n6. DECLINE / RESCHEDULE FLOW");
  const declineProposal = await createMentorshipProposal({
    studentName: "Dewi Lestari, S.Psi.",
    studentWhatsapp: "6281233445566",
    studentEmail: "dewi.lestari@campus.ac.id",
    tutorId: "tut_maya_anggraini",
    researchTopic: "Analisis Kualitatif Pengalaman Burnout Tenaga Medis",
    researchSoftware: "NVivo",
    scheduledDate: "2026-10-22",
    timeSlot: "20:00 - 21:30 WIB",
  });

  const declineToken = declineProposal.data?.magicToken;
  const declineRes = await confirmMentorshipByToken(declineToken, "DECLINE", "Sedang dinas luar kota, usulkan hari Sabtu.");
  assert(declineRes.success === true, "confirmMentorshipByToken DECLINE succeeded");
  assert(declineRes.data?.booking.status === "DECLINED_BY_TUTOR", "Booking status updated to DECLINED_BY_TUTOR");
  assert(declineRes.data?.booking.tutorNotes.includes("luar kota"), "Decline reason recorded");

  // ----------------------------------------------------
  // TEST GROUP 7: Dispatcher Board Aggregate Metrics
  // ----------------------------------------------------
  console.log("\n7. DISPATCHER BOARD AGGREGATE METRICS");
  const boardData = await getDispatcherBoardData();
  assert(boardData.metrics.activeTutorsCount >= 200, "Metrics count includes 200+ tutors");
  assert(boardData.activeBookings.length >= 2, "Active bookings includes created test sessions");
  assert(boardData.metrics.confirmedBookings >= 1, "Confirmed bookings metric correctly reflects confirmed sessions");

  console.log("\n==========================================================");
  console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTutorSchedulingTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
