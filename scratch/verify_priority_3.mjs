import "dotenv/config";
process.env.IS_INTERNAL_CLI_TEST = "true";
import { supabaseAdmin as supabase } from "../lib/supabase.ts";

async function runPriority3Verification() {
  console.log("================================================================================");
  console.log("🚀 BIAS RISTEK - VERIFIKASI PRIORITAS 3 (UX, RESPONSIVE, AKSESIBILITAS)");
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
  // TEST 1: QA-RESP-01 - Sticky Bottom Bar di Layar Mobile
  // -------------------------------------------------------------------------
  console.log("📌 [TEST 1] Verifikasi Mobile Sticky Bottom Bar (QA-RESP-01)...");
  const fs = await import("fs");
  const path = await import("path");
  const courseDetailFile = fs.readFileSync(path.join(process.cwd(), "components/public/CourseDetailClient.tsx"), "utf8");

  assert(
    courseDetailFile.includes("lg:hidden fixed bottom-0 left-0 right-0") &&
    courseDetailFile.includes("pb-20 lg:pb-0"),
    "TC-01: Mobile Sticky Bottom Bar terpasang dengan fixed viewport positioning dan padding kompensasi"
  );

  // -------------------------------------------------------------------------
  // TEST 2: QA-UX-01 - Proteksi Kelas Ditutup / Penuh
  // -------------------------------------------------------------------------
  console.log("\n📌 [TEST 2] Verifikasi Tombol & Alur Kelas Penuh/Ditutup (QA-UX-01)...");
  const checkoutModalFile = fs.readFileSync(path.join(process.cwd(), "components/public/CourseCheckoutModal.tsx"), "utf8");

  assert(
    courseDetailFile.includes("const isClosed = course.status === \"CLOSED\" || course.status === \"FULL\" || !course.isActive || isFull;") &&
    courseDetailFile.includes("disabled={isClosed}"),
    "TC-02: Tombol CTA di CourseDetailClient dinonaktifkan (disabled) saat kelas ditutup atau penuh"
  );

  assert(
    checkoutModalFile.includes("if (isClosed)") &&
    checkoutModalFile.includes("disabled={loading || isClosed}"),
    "TC-03: Modal Checkout memblokir pengiriman formulir saat status kelas ditutup/penuh"
  );

  // -------------------------------------------------------------------------
  // TEST 3: QA-A11Y-01 - Kontras Nomor Seri Sertifikat WCAG AA
  // -------------------------------------------------------------------------
  console.log("\n📌 [TEST 3] Verifikasi Kontras Warna Nomor Seri Sertifikat (QA-A11Y-01)...");
  const certClientFile = fs.readFileSync(path.join(process.cwd(), "components/public/CertificateVerificationClient.tsx"), "utf8");

  assert(
    !certClientFile.includes("text-[#fdbc13]\">\n                NOMOR SERI:") &&
    certClientFile.includes("text-[#001847]") &&
    certClientFile.includes("NOMOR SERI: {cert.certificateCode}"),
    "TC-04: Nomor seri sertifikat menggunakan teks kontras tinggi Deep Research Blue (> 14:1 WCAG AAA)"
  );

  // -------------------------------------------------------------------------
  // TEST 4: QA-FUNC-06 - Sinkronisasi Kuota & Pencabutan Enrollment saat Batal
  // -------------------------------------------------------------------------
  console.log("\n📌 [TEST 4] Verifikasi Dekremen Kuota & Pencabutan LMS Enrollment (QA-FUNC-06)...");
  const { createEnrollment, updateRegistrationStatus } = await import("../actions/pendaftaran.ts");

  // Use existing course in DB
  const testCourseId = "course_1791345281337_4pbg";
  const { data: initialCourse } = await supabase
    .from("Course")
    .select("currentEnrolled")
    .eq("id", testCourseId)
    .single();
  const initialEnrolled = initialCourse?.currentEnrolled || 0;

  const studentEmail = `qa3_student_${Date.now()}@biasristek.id`;
  const regRes = await createEnrollment({
    courseId: testCourseId,
    name: "Peserta Pengujian Kuota",
    email: studentEmail,
    phone: "081234567899",
    institution: "Universitas Riset",
    educationLevel: "S2 Magister",
    paymentMethod: "BANK_TRANSFER",
    bankName: "BCA",
  });

  assert(regRes.success && !!regRes.data?.id, "TC-05: Pendaftaran pengujian berhasil dibuat", regRes.message);
  const regId = regRes.data?.id;

  if (regId) {
    // 1. Verifikasi pendaftaran -> kuota harus naik ke initialEnrolled + 1, enrollment harus ACTIVE
    const verifyRes = await updateRegistrationStatus(regId, "VERIFIED");
    assert(verifyRes.success, "TC-06: Status pendaftaran berhasil diubah menjadi VERIFIED");

    const { data: courseAfterVerify } = await supabase
      .from("Course")
      .select("currentEnrolled")
      .eq("id", testCourseId)
      .single();
    assert(courseAfterVerify?.currentEnrolled === initialEnrolled + 1, `TC-07: Kuota kelas bertambah +1 menjadi ${initialEnrolled + 1}`);

    const { data: enrollAfterVerify } = await supabase
      .from("CourseEnrollment")
      .select("status")
      .eq("courseId", testCourseId)
      .eq("userEmail", studentEmail)
      .maybeSingle();
    assert(enrollAfterVerify?.status === "ACTIVE", "TC-08: LMS CourseEnrollment berstatus ACTIVE");

    // 2. Batalkan pendaftaran -> kuota harus turun kembali ke initialEnrolled, enrollment harus CANCELLED
    const cancelRes = await updateRegistrationStatus(regId, "CANCELLED", "Peserta membatalkan pendaftaran");
    assert(cancelRes.success, "TC-09: Status pendaftaran berhasil diubah menjadi CANCELLED");

    const { data: courseAfterCancel } = await supabase
      .from("Course")
      .select("currentEnrolled")
      .eq("id", testCourseId)
      .single();
    assert(courseAfterCancel?.currentEnrolled === initialEnrolled, `TC-10: Kuota kelas berhasil didekremen kembali ke ${initialEnrolled}`);

    const { data: enrollAfterCancel } = await supabase
      .from("CourseEnrollment")
      .select("status")
      .eq("courseId", testCourseId)
      .eq("userEmail", studentEmail)
      .maybeSingle();
    assert(enrollAfterCancel?.status === "CANCELLED", "TC-11: Hak akses LMS CourseEnrollment dicabut (status: CANCELLED)");

    // Cleanup
    await supabase.from("CourseEnrollment").delete().eq("courseId", testCourseId).eq("userEmail", studentEmail);
    await supabase.from("CourseRegistration").delete().eq("id", regId);
  }

  console.log("\n================================================================================");
  console.log(`📊 RINGKASAN HASIL: ${passedTests}/${totalTests} Uji Berhasil (${failedTests} Gagal)`);
  console.log("================================================================================\n");

  process.exit(failedTests > 0 ? 1 : 0);
}

runPriority3Verification().catch((err) => {
  console.error("FATAL ERROR in Priority 3 test runner:", err);
  process.exit(1);
});
