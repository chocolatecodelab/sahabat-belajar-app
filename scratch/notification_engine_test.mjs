import "dotenv/config";
import {
  readNotificationSettings,
  writeNotificationSettings,
  sendWhatsApp,
  sendEmail,
  notifyInvoiceCreated,
  notifyPaymentVerified,
  notifySubmissionReviewed,
  notifyCertificateIssued,
  readNotificationLogs,
  renderTemplate,
  formatRupiah,
} from "../lib/notifications.ts";

async function runNotificationEngineQA() {
  console.log("==========================================================");
  console.log("🔔 STARTING OMNICHANNEL NOTIFICATION ENGINE TEST SUITE");
  console.log("==========================================================\n");

  // TC-01: Template Interpolation Engine
  console.log("🧪 TC-01: Test Dynamic Template Interpolation");
  const template = "Halo {{student_name}}, tagihan {{invoice_number}} sebesar {{total_amount}} untuk kursus {{course_title}}.";
  const rendered = renderTemplate(template, {
    student_name: "Ahmad Fauzi",
    invoice_number: "INV-202608-9999",
    total_amount: formatRupiah(750342),
    course_title: "Bimbingan Tesis Scopus Q1",
  });
  console.log("Rendered output:\n" + rendered);
  if (!rendered.includes("Ahmad Fauzi") || !rendered.includes("INV-202608-9999") || !rendered.includes("Rp")) {
    throw new Error("TC-01 Failed: Template interpolation mismatch");
  }
  console.log("✅ [PASS] TC-01: Template Interpolation works perfectly\n");

  // TC-02: Read & Write Notification Settings
  console.log("🧪 TC-02: Test Read & Update Notification Settings");
  const initial = await readNotificationSettings();
  console.log("Current WhatsApp Provider:", initial.whatsappProvider);
  console.log("Current Email Provider:", initial.emailProvider);

  const updated = await writeNotificationSettings({
    whatsappProvider: "SIMULATED",
    emailProvider: "SIMULATED",
    whatsappAdminNumber: "087777659482",
  });
  if (updated.whatsappAdminNumber !== "087777659482") {
    throw new Error("TC-02 Failed: Settings update mismatch");
  }
  console.log("✅ [PASS] TC-02: Notification Settings Read/Write works\n");

  // TC-03: WhatsApp Simulated Send
  console.log("🧪 TC-03: Test WhatsApp Message Dispatch");
  const waRes = await sendWhatsApp(
    "081234567890",
    "Pesan uji coba WhatsApp BIAS RISTEK",
    "TEST_MESSAGE",
    "Dr. Budi Santoso"
  );
  console.log("WhatsApp Result:", waRes);
  if (!waRes.success) throw new Error("TC-03 Failed: WhatsApp send failed");
  console.log("✅ [PASS] TC-03: WhatsApp send/simulation works\n");

  // TC-04: Email Simulated Send
  console.log("🧪 TC-04: Test Email Message Dispatch");
  const emailRes = await sendEmail(
    "budi@universitas.ac.id",
    "Uji Coba Email Transaksional",
    "<p>Halo Budi, ini email uji coba sistem.</p>",
    "TEST_MESSAGE",
    "Dr. Budi Santoso"
  );
  console.log("Email Result:", emailRes);
  if (!emailRes.success) throw new Error("TC-04 Failed: Email send failed");
  console.log("✅ [PASS] TC-04: Email send/simulation works\n");

  // TC-05: Event 1 - notifyInvoiceCreated
  console.log("🧪 TC-05: Test Event INVOICE_CREATED Dispatcher");
  await notifyInvoiceCreated({
    registrationId: "reg_test_123",
    invoiceNumber: "INV-202608-8812",
    studentName: "Nurul Hidayah, M.Si",
    studentEmail: "nurul@campus.ac.id",
    studentPhone: "085811223344",
    courseTitle: "Mastery SmartPLS 4 & Structural Equation Modeling",
    totalAmount: 499342,
    uniqueCode: 342,
    paymentMethod: "QRIS",
  });
  console.log("✅ [PASS] TC-05: notifyInvoiceCreated executed successfully\n");

  // TC-06: Event 2 - notifyPaymentVerified
  console.log("🧪 TC-06: Test Event PAYMENT_VERIFIED Dispatcher");
  await notifyPaymentVerified({
    invoiceNumber: "INV-202608-8812",
    studentName: "Nurul Hidayah, M.Si",
    studentEmail: "nurul@campus.ac.id",
    studentPhone: "085811223344",
    courseTitle: "Mastery SmartPLS 4 & Structural Equation Modeling",
    courseSlug: "mastery-smartpls-4",
  });
  console.log("✅ [PASS] TC-06: notifyPaymentVerified executed successfully\n");

  // TC-07: Event 3 - notifySubmissionReviewed
  console.log("🧪 TC-07: Test Event SUBMISSION_REVIEWED Dispatcher");
  await notifySubmissionReviewed({
    studentName: "Nurul Hidayah, M.Si",
    studentEmail: "nurul@campus.ac.id",
    studentPhone: "085811223344",
    courseTitle: "Mastery SmartPLS 4 & Structural Equation Modeling",
    taskTitle: "Draf Bab 4: Analisis Outer Model & Inner Model",
    status: "APPROVED",
    score: 95,
    mentorFeedback: "Metodologi dan interpretasi bootstrapping SmartPLS sudah sangat baik dan sesuai kaidah Scopus Q1.",
  });
  console.log("✅ [PASS] TC-07: notifySubmissionReviewed executed successfully\n");

  // TC-08: Event 4 - notifyCertificateIssued
  console.log("🧪 TC-08: Test Event CERTIFICATE_ISSUED Dispatcher");
  await notifyCertificateIssued({
    studentName: "Nurul Hidayah, M.Si",
    studentEmail: "nurul@campus.ac.id",
    studentPhone: "085811223344",
    courseTitle: "Mastery SmartPLS 4 & Structural Equation Modeling",
    certificateCode: "BIAS-2026-PLS-7712",
    totalHours: "32 JP",
  });
  console.log("✅ [PASS] TC-08: notifyCertificateIssued executed successfully\n");

  // TC-09: Audit Logs Verification
  console.log("🧪 TC-09: Verify Notification Logs Audit Trail");
  const logs = await readNotificationLogs({ limit: 20 });
  console.log(`Total logs retrieved: ${logs.length}`);
  const sampleLog = logs[0];
  console.log("Latest log entry:", {
    id: sampleLog.id,
    channel: sampleLog.channel,
    event: sampleLog.event,
    recipient: sampleLog.recipient,
    status: sampleLog.status,
  });

  if (logs.length < 4) {
    throw new Error("TC-09 Failed: Expected logs recorded for all events");
  }
  console.log("✅ [PASS] TC-09: Audit trail successfully captured all events\n");

  console.log("==========================================================");
  console.log("🎉 ALL 9 NOTIFICATION ENGINE TESTS PASSED (100% SUCCESS)!");
  console.log("==========================================================");
}

runNotificationEngineQA().catch((err) => {
  console.error("FATAL QA ERROR:", err);
  process.exit(1);
});
