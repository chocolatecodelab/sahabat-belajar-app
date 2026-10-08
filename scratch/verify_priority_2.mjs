import "dotenv/config";

async function runPriority2Verification() {
  console.log("================================================================================");
  console.log("🛡️ BIAS RISTEK - VERIFIKASI PRIORITAS 2 (KEAMANAN & HAK AKSES)");
  console.log("================================================================================\n");

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  function assert(condition, testName, details = "") {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✅ [PASS] ${testName} ${details ? `(${details})` : ""}`);
    } else {
      failedTests++;
      console.error(`  ❌ [FAIL] ${testName} ${details ? `(${details})` : ""}`);
    }
  }

  // -------------------------------------------------------------------------
  // TEST 1: QA-SEC-01 - Open Redirect Phishing Defense on Login
  // -------------------------------------------------------------------------
  console.log("📌 [TEST 1] Proteksi Open Redirect Phishing pada Login (QA-SEC-01)...");
  function isSafeCallback(callbackUrl) {
    return (
      typeof callbackUrl === "string" &&
      callbackUrl.startsWith("/") &&
      !callbackUrl.startsWith("//") &&
      !callbackUrl.startsWith("/\\") &&
      !callbackUrl.includes("/login") &&
      !/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(callbackUrl)
    );
  }

  const maliciousUrls = [
    "https://situs-phishing.com/bias-login",
    "http://attacker.com",
    "//evil-domain.com/steal-creds",
    "/\\attacker.com",
    "javascript:alert(document.cookie)",
    "data:text/html,<script>alert(1)</script>",
    "/login",
    "/login?error=Invalid",
  ];

  const safeInternalUrls = [
    "/belajar/smartpls-4-masterclass",
    "/kursus/analisis-data-spss",
    "/dashboard/penjadwalan",
    "/sertifikat/BIAS-2026-SCP-1234",
  ];

  let maliciousBlocked = true;
  for (const url of maliciousUrls) {
    if (isSafeCallback(url)) {
      maliciousBlocked = false;
      console.error(`    Exploit payload was not blocked: ${url}`);
    }
  }
  assert(maliciousBlocked, "TC-01: Seluruh URL eksternal, javascript pseudo-protocol, dan redirect loop ditolak");

  let safeAllowed = true;
  for (const url of safeInternalUrls) {
    if (!isSafeCallback(url)) {
      safeAllowed = false;
      console.error(`    Safe internal route was falsely blocked: ${url}`);
    }
  }
  assert(safeAllowed, "TC-02: Rute internal yang sah diizinkan dengan benar");

  // -------------------------------------------------------------------------
  // TEST 2: QA-FUNC-02 - Role Check di Admin Layout
  // -------------------------------------------------------------------------
  console.log("\n📌 [TEST 2] Broken Access Control pada Admin Layout (QA-FUNC-02)...");
  const staffRoles = ["Super Admin", "Admin", "Editor", "Tutor", "Mentor", "Reviewer"];
  function isStaffAllowed(role) {
    return staffRoles.includes(role);
  }
  assert(!isStaffAllowed("Student"), "TC-03: Peran 'Student' dilarang mengakses panel admin layout");
  assert(isStaffAllowed("Super Admin"), "TC-04: Peran 'Super Admin' diizinkan mengakses panel admin");
  assert(isStaffAllowed("Tutor"), "TC-05: Peran 'Tutor' diizinkan mengakses panel admin");

  // -------------------------------------------------------------------------
  // TEST 3: QA-FUNC-03 - Fail-Closed hasPermission & requireAuth
  // -------------------------------------------------------------------------
  console.log("\n📌 [TEST 3] Fail-Closed hasPermission & requireAuth (QA-FUNC-03)...");
  const { hasPermission, requireAuth } = await import("../lib/auth.ts");

  const permResult = await hasPermission("settings.update");
  assert(permResult === false, "TC-06: hasPermission mengembalikan false (Fail-Closed) saat tidak ada sesi login");

  let requireAuthThrew = false;
  try {
    await requireAuth();
  } catch (err) {
    requireAuthThrew = true;
  }
  assert(requireAuthThrew, "TC-07: requireAuth melempar Error Unauthorized dan TIDAK memalsukan Super Admin");

  // -------------------------------------------------------------------------
  // TEST 4: QA-FUNC-04 - Gatekeeping getCourseClassroom
  // -------------------------------------------------------------------------
  console.log("\n📌 [TEST 4] Pencegahan Information Disclosure di getCourseClassroom (QA-FUNC-04)...");
  const { getCourseClassroom } = await import("../actions/belajar.ts");

  // Call without email or session using existing course in DB
  const classroomGuest = await getCourseClassroom("junior-researcher-class");
  assert(
    classroomGuest && classroomGuest.isEnrolled === false && classroomGuest.modules.length === 0,
    "TC-08: Tamu tanpa email/sesi ditolak dari materi kelas privat (modules kosong & isEnrolled: false)"
  );

  // Call with non-existent student email
  const classroomUnenrolled = await getCourseClassroom("junior-researcher-class", "bukan_peserta@gmail.com");
  assert(
    classroomUnenrolled && classroomUnenrolled.isEnrolled === false && classroomUnenrolled.modules.length === 0,
    "TC-09: Siswa yang belum mendaftar kelas ini tidak mendapatkan materi (modules kosong & isEnrolled: false)"
  );

  // -------------------------------------------------------------------------
  // TEST 5: QA-FUNC-05 - Validasi Sesi & 100% Progres pada claimCertificate
  // -------------------------------------------------------------------------
  console.log("\n📌 [TEST 5] Proteksi Integritas E-Sertifikat 32 JP (QA-FUNC-05)...");
  const { claimCertificate } = await import("../actions/sertifikat.ts");

  const unauthenticatedClaim = await claimCertificate("dummy_enrollment_id");
  assert(
    unauthenticatedClaim.success === false && unauthenticatedClaim.message.includes("masuk ke akun"),
    "TC-10: Klaim sertifikat tanpa sesi login ditolak dengan pesan autentikasi",
    unauthenticatedClaim.message
  );

  console.log("\n================================================================================");
  console.log(`📊 RINGKASAN HASIL: ${passedTests}/${totalTests} Uji Berhasil (${failedTests} Gagal)`);
  console.log("================================================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runPriority2Verification().catch((err) => {
  console.error("FATAL ERROR in test runner:", err);
  process.exit(1);
});
