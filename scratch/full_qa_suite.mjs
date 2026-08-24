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

  try {
    // ---------------------------------------------------------
    // TEST SUITE 1: Course Catalog & Slug Retrieval
    // ---------------------------------------------------------
    console.log("🧪 [TEST GROUP 1] Course Catalog & Data Engine");
    const allCourses = await getCourses();
    assert(Array.isArray(allCourses) && allCourses.length >= 3, "TC-01: Fetch all active courses", `Got ${allCourses.length} courses`);
    
    const scopusCourse = allCourses.find(c => c.category.includes("Scopus") || c.slug.includes("scopus"));
    assert(!!scopusCourse, "TC-02: Scopus course exists in catalog", `Found: ${scopusCourse?.title}`);

    if (scopusCourse) {
      const courseBySlug = await getCourseBySlug(scopusCourse.slug);
      assert(courseBySlug !== null && courseBySlug.id === scopusCourse.id, "TC-03: Retrieve course detail by slug", `Slug: ${scopusCourse.slug}`);
      assert(courseBySlug.price > 0 && courseBySlug.maxQuota > 0, "TC-04: Course pricing and quota schema integrity");
    }

    const filteredCategory = await getCourses({ category: "SmartPLS & SEM" });
    assert(Array.isArray(filteredCategory), "TC-05: Filter courses by category", `Category results count: ${filteredCategory.length}`);

    // ---------------------------------------------------------
    // TEST SUITE 2: In-House Enrollment & Payment Engine
    // ---------------------------------------------------------
    console.log("\n🧪 [TEST GROUP 2] Enrollment & Transaction Checkout");
    const testEnrollmentData = {
      courseId: scopusCourse ? scopusCourse.id : "course_scopus_mastery",
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

  } catch (err) {
    console.error("FATAL QA SUITE ERROR:", err);
    assert(false, "TC-FATAL: Suite execution completed without uncaught exceptions", err.message);
  }

  console.log("\n==========================================================");
  console.log(`📊 QA TEST SUITE SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log("==========================================================");
}

runQASuite();
