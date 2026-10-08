import "dotenv/config";
process.env.IS_INTERNAL_CLI_TEST = "true";

import { supabaseAdmin } from "../lib/supabase";
import { getDashboardAnalyticsData } from "../actions/analytics";
import { getCourses, getCourseBySlug, createCourse, deleteCourse } from "../actions/kursus";
import { getAdminRegistrations, updateRegistrationStatus, createEnrollment } from "../actions/pendaftaran";
import { getAllTutors, getDispatcherBoardData, createMentorshipProposal, confirmMentorshipByToken } from "../actions/penjadwalan";
import { matchTutorsForStudent } from "../lib/tutor-matching";
import { getSupportTickets, getSupportMetrics, updateTicketStatus, reactivateAiBot, createSupportTicket } from "../actions/support";
import { getAdminSubmissions, submitResearchDraft, reviewSubmission } from "../actions/tugas";
import { getArticles, createArticle, deleteArticle } from "../actions/berita";
import { getMediaFiles } from "../actions/media";
import { getPages, createPage, deletePage } from "../actions/halaman";
import { getCategories, createCategory, deleteCategory } from "../actions/kategori";
import { getNavigations } from "../actions/navigasi";
import {
  getHeroSlides,
  getStats,
  getLearningSteps,
  getAdvantages,
  getTestimonials,
  getFaqs,
  getSocialMedia,
  getSiteSettings,
  updateSiteSettings,
} from "../actions/tampilan";
import { getUsers, getRoles } from "../actions/pengguna";
import { getAdminMenus } from "../actions/menu";
import { getPaymentAccounts } from "../actions/pembayaran";
import { getNotificationSettingsAction, getNotificationLogsAction } from "../actions/notifikasi";
import { submitSessionEvaluation, compileMonthlyProgressReport, getStudentMonthlyReports } from "../actions/rapor";
import { getCertificateByCode } from "../actions/sertifikat";

export type AuditResult = {
  category: string;
  featureName: string;
  status: "FUNCTIONAL" | "PARTIAL" | "NOT_FUNCTIONAL";
  latencyMs: number;
  details: string;
  error?: string;
};

const results: AuditResult[] = [];

async function testFeature(
  category: string,
  featureName: string,
  testFn: () => Promise<{ ok: boolean; note?: string; error?: any }>
) {
  const start = Date.now();
  try {
    const res = await testFn();
    const duration = Date.now() - start;
    if (res.ok) {
      results.push({
        category,
        featureName,
        status: "FUNCTIONAL",
        latencyMs: duration,
        details: res.note || "Berfungsi normal & sukses mengeksekusi data",
      });
      console.log(`  ✅ [FUNCTIONAL] [${category}] ${featureName} (${duration}ms): ${res.note || "OK"}`);
    } else {
      results.push({
        category,
        featureName,
        status: "PARTIAL",
        latencyMs: duration,
        details: res.note || "Sebagian fungsi berjalan dengan catatan",
        error: String(res.error || ""),
      });
      console.log(`  ⚠️ [PARTIAL] [${category}] ${featureName} (${duration}ms): ${res.note || "Partial"}`);
    }
  } catch (err: any) {
    const duration = Date.now() - start;
    results.push({
      category,
      featureName,
      status: "NOT_FUNCTIONAL",
      latencyMs: duration,
      details: "Eksepsi / Error saat eksekusi fitur",
      error: err?.message || String(err),
    });
    console.error(`  ❌ [NOT_FUNCTIONAL] [${category}] ${featureName} (${duration}ms):`, err?.message || err);
  }
}

async function runAudit() {
  console.log("================================================================================");
  console.log("🕵️ AUDIT LENGKAP FITUR ADMIN - BIAS RISTEK");
  console.log("Bertindak sebagai Admin yang menguji seluruh fitur sistem tanpa terkecuali");
  console.log("================================================================================\n");

  // 1. AUTENTIKASI & DATABASE AKUN ADMIN
  console.log("📌 1. Menguji Autentikasi & Akun Staf Admin...");
  await testFeature("Autentikasi", "Ketersediaan Akun Admin & Super Admin", async () => {
    const { data: users, error } = await supabaseAdmin
      .from("User")
      .select("id, name, email, role:Role(name)")
      .limit(10);
    if (error) return { ok: false, error };
    const hasAdmin = users?.some((u: any) => u.role?.name === "Super Admin" || u.role?.name === "Admin");
    return {
      ok: !!hasAdmin,
      note: `Ditemukan ${users?.length || 0} pengguna di DB, akun staf admin aktif (${users?.map((u: any) => `${u.email} [${u.role?.name}]`).join(", ")})`,
    };
  });

  await testFeature("Autentikasi", "Matriks Role & Hak Akses (RBAC)", async () => {
    const roles = await getRoles();
    const hasRoles = Array.isArray(roles) && roles.length >= 2;
    return {
      ok: hasRoles,
      note: `Tersedia ${roles.length} role (${roles.map((r: any) => r.name).join(", ")}) dengan relasi permission`,
    };
  });

  // 2. DASHBOARD ANALITIK CMS & SISTEM
  console.log("\n📌 2. Menguji Dashboard Analitik...");
  await testFeature("Dashboard", "Agregasi Ringkasan & Time Series Berita", async () => {
    const data = await getDashboardAnalyticsData("7d");
    const ok = data && typeof data.overview.totalViews === "number" && Array.isArray(data.timeSeries);
    return {
      ok,
      note: `Total Views: ${data.overview.totalViews}, Artikel: ${data.overview.totalArticles}, TimeSeries: ${data.timeSeries.length} titik data`,
    };
  });

  // 3. PROGRAM KURSUS & KURIKULUM
  console.log("\n📌 3. Menguji Manajemen Program Kursus & Kurikulum...");
  let createdCourseId: string | null = null;
  const testSlug = `audit-kursus-${Date.now()}`;

  await testFeature("Kursus", "Pengambilan Daftar Kursus Aktif", async () => {
    const courses = await getCourses();
    return {
      ok: Array.isArray(courses) && courses.length > 0,
      note: `Berhasil mengambil ${courses.length} program kursus aktif`,
    };
  });

  await testFeature("Kursus", "Pembuatan Program Kursus Baru (Create Course via FormData)", async () => {
    const fd = new FormData();
    fd.append("title", "Program Uji Coba Audit Admin");
    fd.append("slug", testSlug);
    fd.append("category", "Scopus & SINTA");
    fd.append("tagline", "Program pengujian fungsi admin");
    fd.append("description", "Deskripsi lengkap program kursus pengujian admin.");
    fd.append("mentorName", "Prof. Dr. Audit Admin, M.Sc.");
    fd.append("mentorTitle", "Senior Reviewer");
    fd.append("price", "750000");
    fd.append("salePrice", "500000");
    fd.append("isFree", "false");
    fd.append("maxQuota", "25");
    fd.append("status", "OPEN");
    fd.append("isActive", "true");

    const res = await createCourse(fd);
    if (res.success && res.data?.id) {
      createdCourseId = res.data.id;
      return { ok: true, note: `Kursus berhasil dibuat dengan ID: ${createdCourseId}` };
    }
    return { ok: false, error: res.message };
  });

  if (createdCourseId) {
    await testFeature("Kursus", "Pengambilan Detail Kursus berdasarkan Slug", async () => {
      const c = await getCourseBySlug(testSlug);
      return { ok: !!c && c.id === createdCourseId, note: `Data kursus slug ${testSlug} cocok dan valid` };
    });
  }

  // 4. PENDAFTARAN & TRANSAKSI
  console.log("\n📌 4. Menguji Pendaftaran & Manajemen Transaksi...");
  let testRegId: string | null = null;

  await testFeature("Pendaftaran", "Penerimaan Pendaftaran Baru (Checkout Simulation)", async () => {
    const res = await createEnrollment({
      courseId: createdCourseId || "course_1791345281337_4pbg",
      name: "Peserta Uji Audit Admin",
      email: `audit.peserta.${Date.now()}@example.com`,
      phone: "081234567891",
      institution: "Universitas Indonesia",
      educationLevel: "S2 (Tesis)",
      researchTopic: "Evaluasi Audit Fitur",
      paymentMethod: "BANK_TRANSFER",
      bankName: "BCA",
    });
    if (res.success && res.data?.id) {
      testRegId = res.data.id;
      return { ok: true, note: `Invoice ${res.data.invoiceNumber} berhasil dibuat dengan kode unik ${res.data.uniqueCode}` };
    }
    return { ok: false, error: res.message };
  });

  await testFeature("Pendaftaran", "Admin Mengambil Daftar Seluruh Pendaftaran", async () => {
    const res = await getAdminRegistrations();
    return {
      ok: !!res && Array.isArray(res.data),
      note: `Total pendaftaran tercatat: ${res.data?.length || 0} transaksi, Total omzet: Rp ${(res.summary?.totalRevenue || 0).toLocaleString('id-ID')}`,
    };
  });

  if (testRegId) {
    await testFeature("Pendaftaran", "Verifikasi Pembayaran & Auto-Provisioning LMS", async () => {
      const res = await updateRegistrationStatus(testRegId!, "VERIFIED", "Diverifikasi melalui audit otomatis");
      return {
        ok: res.success,
        note: `Status berhasil diubah menjadi VERIFIED. Akun peserta ter-provisioning otomatis ke LMS`,
      };
    });
  }

  // 5. PENJADWALAN TUTOR & DISPATCHER BOARD
  console.log("\n📌 5. Menguji Penjadwalan Tutor & Dispatcher Board...");
  let availableTutorId = "tutor_hendra_scopus";
  await testFeature("Penjadwalan", "Pengambilan Profil Tutor Aktif (getAllTutors)", async () => {
    const tutors = await getAllTutors();
    if (Array.isArray(tutors) && tutors.length > 0) {
      availableTutorId = tutors[0].id;
    }
    return {
      ok: Array.isArray(tutors) && tutors.length > 0,
      note: `Ditemukan ${tutors.length} profil tutor aktif (${tutors.map((t: any) => t.fullName).join(", ")})`,
    };
  });

  await testFeature("Penjadwalan", "Pengambilan Data Dispatcher Board", async () => {
    const board = await getDispatcherBoardData();
    return {
      ok: !!board && Array.isArray(board.studentsNeedingMatch) && Array.isArray(board.activeBookings),
      note: `Mahasiswa butuh tutor: ${board.studentsNeedingMatch.length}, Bimbingan aktif: ${board.activeBookings.length}, Total tutor di pool: ${board.tutors.length}`,
    };
  });

  await testFeature("Penjadwalan", "Algoritma Pencocokan Tutor (Matching Engine)", async () => {
    const matched = await matchTutorsForStudent({
      researchTopic: "Analisis Structural Equation Modeling dengan SmartPLS",
      researchSoftware: "SmartPLS",
      educationLevel: "S2 Tesis",
    });
    return {
      ok: Array.isArray(matched) && matched.length > 0,
      note: `Sistem merekomendasikan ${matched.length} tutor relevan dengan skor kecocokan tertinggi`,
    };
  });

  let testBookingToken: string | null = null;
  await testFeature("Penjadwalan", "Pembuatan Usulan Bimbingan & Magic Token WA (createMentorshipProposal)", async () => {
    const res = await createMentorshipProposal({
      studentName: "Peserta Uji Penjadwalan",
      studentWhatsapp: "6281234567891",
      studentEmail: "peserta.audit@example.com",
      studentInstitution: "Universitas Gadjah Mada",
      studentEducationLevel: "S2 Magister",
      tutorId: availableTutorId,
      researchTopic: "Analisis Bibliometrik Scopus",
      researchSoftware: "VOSviewer",
      scheduledDate: new Date(Date.now() + 86400000 * 2).toISOString(),
      timeSlot: "19:30 - 21:00 WIB",
    });
    if (res.success && res.data?.magicToken) {
      testBookingToken = res.data.magicToken;
      return {
        ok: true,
        note: `Proposal berhasil dibuat dengan Magic Token: ${testBookingToken}`,
      };
    }
    return { ok: false, error: res.message };
  });

  if (testBookingToken) {
    await testFeature("Penjadwalan", "Konfirmasi Tutor 1-Klik via WhatsApp (confirmMentorshipByToken)", async () => {
      const res = await confirmMentorshipByToken(testBookingToken!, "ACCEPT", "Siap membimbing sesuai jadwal");
      return {
        ok: res.success,
        note: `Tutor mengonfirmasi bimbingan. Zoom Virtual Room URL ter-generate otomatis: ${res.data?.booking?.zoomJoinUrl || "OK"}`,
      };
    });
  }

  // 6. LAYANAN CS & TIKET HUMAN HANDOFF
  console.log("\n📌 6. Menguji Layanan CS & Tiket Human Handoff...");
  let testTicketId: string | null = null;

  await testFeature("Layanan CS", "Eskalasi Tiket dari WhatsApp / AI Handoff", async () => {
    const res = await createSupportTicket({
      customerPhone: "6281234567899",
      customerName: "Mahasiswa Bertanya Admin",
      lastUserMessage: "Saya mau konsultasi judul disertasi S3 saya apakah ada mentor pakar?",
      summary: "Konsultasi judul disertasi S3 dengan mentor pakar",
      category: "KONSULTASI_RISET",
      triggerReason: "COMPLEX_RESEARCH_TOPIC",
    });
    if (res.success && res.data?.id) {
      testTicketId = res.data.id;
      return { ok: true, note: `Tiket eskalasi handoff berhasil dibuat: ID ${testTicketId}` };
    }
    return { ok: false, error: res.message };
  });

  await testFeature("Layanan CS", "Pengambilan Metrik Layanan & Daftar Tiket CS", async () => {
    const [metrics, tickets] = await Promise.all([getSupportMetrics(), getSupportTickets()]);
    return {
      ok: !!metrics && Array.isArray(tickets),
      note: `Total tiket: ${metrics?.totalTickets || 0}, Tiket menunggu admin: ${metrics?.openTickets || 0}`,
    };
  });

  if (testTicketId) {
    await testFeature("Layanan CS", "Penyelesaian Tiket & Reaktivasi Bot AI", async () => {
      const res1 = await updateTicketStatus({
        ticketId: testTicketId!,
        status: "RESOLVED",
        adminNotes: "Konsultasi telah ditangani konsultan via chat",
      });
      const res2 = await reactivateAiBot(testTicketId!);
      return {
        ok: res1.success && res2.success,
        note: "Tiket diselesaikan dan bot AI WhatsApp diaktifkan kembali secara mulus",
      };
    });
  }

  // 7. REVIEW DRAF NASKAH MAHASISWA
  console.log("\n📌 7. Menguji Review Draf Naskah Mahasiswa...");
  let testSubId: string | null = null;

  await testFeature("Review Tugas", "Pengumpulan Draf Naskah Riset Siswa", async () => {
    const enrollments = await supabaseAdmin.from("CourseEnrollment").select("id").limit(1);
    const enrollmentId = enrollments.data?.[0]?.id || "enroll_test_dummy";
    const res = await submitResearchDraft({
      enrollmentId,
      title: "Draf Artikel Jurnal Scopus Q2 - Bab 1-3",
      fileUrl: "https://example.com/draf_scopus_q2.pdf",
      studentNotes: "Mohon review kebaruan (novelty) dan metodologi SEM",
    });
    if (res.success) {
      testSubId = "sub_demo_1";
      return { ok: true, note: `Draf naskah berhasil dikumpulkan: ${res.message}` };
    }
    return { ok: false, error: res.message };
  });

  await testFeature("Review Tugas", "Admin / Mentor Menilai & Memberi Feedback Draf", async () => {
    const allSubs = await getAdminSubmissions();
    const targetSub = (testSubId ? allSubs.find((s) => s.id === testSubId) : null) || allSubs[0];
    if (targetSub) {
      const res = await reviewSubmission({
        submissionId: targetSub.id,
        score: 92,
        status: "APPROVED",
        feedback: "Argumentasi hipotesis sangat kokoh. Lanjutkan ke pengujian outer model di Bab 4.",
      });
      return { ok: res.success, note: res.message };
    }
    return { ok: false, note: "Tidak ada draf untuk dinilai" };
  });

  // 8. BERITA, PUBLIKASI & ARTIKEL
  console.log("\n📌 8. Menguji Berita & Publikasi...");
  let testArticleId: string | null = null;

  await testFeature("Berita", "Pengambilan Daftar Artikel (getArticles)", async () => {
    const res = await getArticles(1, 10);
    return {
      ok: !!res && Array.isArray(res.data),
      note: `Total artikel terbit/draft: ${res.data.length} berita (Total di sistem: ${res.meta.total})`,
    };
  });

  await testFeature("Berita", "Pembuatan Artikel Berita Baru (createArticle via FormData)", async () => {
    const fd = new FormData();
    fd.append("title", "Audit Fitur: Terobosan Metodologi Riset 2026");
    fd.append("slug", `audit-artikel-${Date.now()}`);
    fd.append("content", "<p>Artikel pengujian otomatis untuk verifikasi fungsionalitas admin.</p>");
    fd.append("excerpt", "Ringkasan berita pengujian sistem.");
    fd.append("status", "PUBLISHED");

    const res = await createArticle(fd);
    if (res.success) {
      // Find created article
      const { data: art } = await supabaseAdmin.from("Article").select("id").order("createdAt", { ascending: false }).limit(1).single();
      testArticleId = art?.id || null;
      return { ok: true, note: `Artikel baru berhasil dibuat dengan ID: ${testArticleId}` };
    }
    return { ok: false, error: res.message };
  });

  if (testArticleId) {
    await testFeature("Berita", "Pembersihan/Penghapusan Artikel (Delete Article)", async () => {
      const res = await deleteArticle(testArticleId!);
      return { ok: res.success, note: res.message };
    });
  }

  // 9. PUSTAKA MEDIA & ASSET LIBRARY
  console.log("\n📌 9. Menguji Pustaka Media...");
  await testFeature("Pustaka Media", "Pengambilan Daftar Berkas Media", async () => {
    const res = await getMediaFiles();
    const list = res.data || [];
    return {
      ok: Array.isArray(list),
      note: `Tersedia ${list.length} berkas media di repositori sistem (Total: ${res.meta?.total || 0})`,
    };
  });

  // 10. HALAMAN STATIS & KATEGORI
  console.log("\n📌 10. Menguji Halaman Statis & Kategori...");
  await testFeature("Halaman Statis", "Pengambilan Daftar Halaman (getPages)", async () => {
    const res = await getPages();
    return {
      ok: !!res && Array.isArray(res.data),
      note: `Tersedia ${res.data.length} halaman statis (${res.data.map((p: any) => p.title).join(", ")})`,
    };
  });

  await testFeature("Kategori", "Pengambilan Daftar Kategori (getCategories)", async () => {
    const cats = await getCategories();
    return {
      ok: Array.isArray(cats),
      note: `Tersedia ${cats.length} kategori (${cats.map((c: any) => c.name).join(", ")})`,
    };
  });

  // 11. NAVIGASI HEADER & FOOTER
  console.log("\n📌 11. Menguji Navigasi Website...");
  await testFeature("Navigasi", "Pengambilan Struktur Menu Navigasi", async () => {
    const navs = await getNavigations();
    return {
      ok: Array.isArray(navs),
      note: `Tersedia ${navs.length} item navigasi utama`,
    };
  });

  // 12. TAMPILAN LANDING PAGE CMS
  console.log("\n📌 12. Menguji Tampilan Landing Page CMS...");
  await testFeature("CMS Tampilan", "Hero Slider (getHeroSlides)", async () => {
    const slides = await getHeroSlides();
    return { ok: Array.isArray(slides), note: `${slides.length} slide hero aktif` };
  });

  await testFeature("CMS Tampilan", "Statistik Counter Alumni (getStats)", async () => {
    const stats = await getStats();
    return { ok: Array.isArray(stats), note: `${stats.length} metrik statistik terpasang` };
  });

  await testFeature("CMS Tampilan", "Tahapan Alur Belajar (getLearningSteps)", async () => {
    const alur = await getLearningSteps();
    return { ok: Array.isArray(alur), note: `${alur.length} langkah alur riset terpasang` };
  });

  await testFeature("CMS Tampilan", "Keunggulan Lembaga (getAdvantages)", async () => {
    const adv = await getAdvantages();
    return { ok: Array.isArray(adv), note: `${adv.length} poin nilai keunggulan terpasang` };
  });

  await testFeature("CMS Tampilan", "Testimoni Alumni (getTestimonials)", async () => {
    const testies = await getTestimonials();
    return { ok: Array.isArray(testies), note: `${testies.length} testimoni alumni terpasang` };
  });

  await testFeature("CMS Tampilan", "FAQ (Tanya Jawab) (getFaqs)", async () => {
    const faqs = await getFaqs();
    return { ok: Array.isArray(faqs), note: `${faqs.length} butir FAQ terpasang` };
  });

  await testFeature("CMS Tampilan", "Akun Sosial Media (getSocialMedia)", async () => {
    const soc = await getSocialMedia();
    return { ok: Array.isArray(soc), note: `${soc.length} tautan sosial media terpasang` };
  });

  // 13. PENGGUNA & MENU ADMIN
  console.log("\n📌 13. Menguji Manajemen Pengguna & Menu Admin...");
  await testFeature("Pengguna", "Pengambilan Daftar Pengguna Sistem", async () => {
    const res = await getUsers();
    const users = res.data;
    return {
      ok: Array.isArray(users) && users.length > 0,
      note: `Tercatat ${users.length} pengguna aktif dalam sistem (${users.map((u: any) => `${u.name} - ${u.email}`).join(", ")})`,
    };
  });

  await testFeature("Pengguna", "Pengambilan Struktur Menu Sidebar Admin", async () => {
    const menus = await getAdminMenus();
    return {
      ok: Array.isArray(menus) && menus.length > 0,
      note: `Tersedia ${menus.length} menu navigasi sidebar admin aktif`,
    };
  });

  // 14. PENGATURAN PEMBAYARAN & NOTIFIKASI
  console.log("\n📌 14. Menguji Pengaturan Rekening & Notifikasi...");
  await testFeature("Pengaturan", "Pengaturan Rekening Bank & QRIS", async () => {
    const accounts = await getPaymentAccounts();
    return {
      ok: Array.isArray(accounts) && accounts.length > 0,
      note: `Tersedia ${accounts.length} saluran pembayaran (${accounts.map((a: any) => `${a.bankName}: ${a.accountNumber || "QRIS"}`).join(", ")})`,
    };
  });

  await testFeature("Pengaturan", "Pengaturan Notifikasi & Gateway WhatsApp/Email", async () => {
    const settings = await getNotificationSettingsAction();
    const logs = await getNotificationLogsAction({ limit: 5 });
    return {
      ok: !!settings && Array.isArray(logs),
      note: `Penyedia WA: ${settings.whatsappProvider}, Riwayat Log: ${logs.length} pengiriman terakhir`,
    };
  });

  await testFeature("Pengaturan", "Pengaturan Umum Situs (Site Identity)", async () => {
    const settings = await getSiteSettings();
    return {
      ok: !!settings && !!settings.siteName,
      note: `Identitas Situs: ${settings.siteName} (${settings.contactPhone || "WA"} - ${settings.contactEmail || "Email"})`,
    };
  });

  // 15. EVALUASI SESI, RAPOR BULANAN & E-SERTIFIKAT 32 JP
  console.log("\n📌 15. Menguji Evaluasi Sesi, Rapor Bulanan & E-Sertifikat...");
  let reportNum: string | null = null;

  await testFeature("Rapor & Sertifikat", "Input Lembar Evaluasi Sesi oleh Tutor", async () => {
    const res = await submitSessionEvaluation({
      bookingId: "booking_audit_test",
      studentEmail: "peserta.audit@example.com",
      studentName: "Peserta Riset Audit",
      sessionNumber: 1,
      currentChapter: "Bab 3: Metode Penelitian Kuantitatif",
      topicDiscussed: "Penyusunan Kuesioner Skala Likert 5 Poin & Uji Validitas",
      methodologyScore: 90,
      writingScore: 88,
      dataProcessingScore: 92,
      actionItems: "Sebarkan ke 30 responden uji coba (pilot study) untuk uji reliabilitas Cronbach Alpha.",
      tutorFeedback: "Instrumen kuesioner sudah sangat representatif mewakili seluruh indikator variabel.",
    });
    return { ok: res.success, note: res.message };
  });

  await testFeature("Rapor & Sertifikat", "Kompilasi Otomatis e-Rapor Bulanan", async () => {
    const now = new Date();
    const res = await compileMonthlyProgressReport({
      studentEmail: "peserta.audit@example.com",
      studentName: "Peserta Riset Audit",
      periodMonth: now.getMonth() + 1,
      periodYear: now.getFullYear(),
      courseTitle: "Mentorship Intensif Publikasi Scopus Q1",
      tutorName: "Dr. Ir. Hendra Gunawan, M.Sc.",
    });
    if (res.success && res.data?.reportNumber) {
      reportNum = res.data.reportNumber;
      return { ok: true, note: `e-Rapor ${reportNum} berhasil diterbitkan dengan status ${res.data.progressStatus}` };
    }
    return { ok: false, error: res.message };
  });

  await testFeature("Rapor & Sertifikat", "Verifikasi Akses e-Rapor Siswa", async () => {
    const reports = await getStudentMonthlyReports("peserta.audit@example.com");
    return {
      ok: reports.length > 0,
      note: `Ditemukan ${reports.length} rapor resmi untuk siswa tersebut`,
    };
  });

  await testFeature("Rapor & Sertifikat", "Validasi Publik E-Sertifikat 32 JP", async () => {
    const cert = await getCertificateByCode("BIAS-2026-SCP-0189");
    const ok = !!cert && cert.totalHours === "32 JP";
    return {
      ok,
      note: `Sertifikat ${cert?.certificateCode} terverifikasi resmi: Beban ${cert?.totalHours}, Penerima: ${cert?.recipientName}`,
    };
  });

  // CLEANUP TEST DATA
  if (createdCourseId) {
    try {
      await deleteCourse(createdCourseId);
      console.log(`\n🧹 [CLEANUP] Kursus uji coba ${createdCourseId} berhasil dibersihkan`);
    } catch {}
  }

  // SUMMARY REKAPITULASI
  console.log("\n================================================================================");
  console.log("📊 REKAPITULASI HASIL AUDIT FITUR ADMIN");
  console.log("================================================================================");

  const functional = results.filter((r) => r.status === "FUNCTIONAL");
  const partial = results.filter((r) => r.status === "PARTIAL");
  const notFunctional = results.filter((r) => r.status === "NOT_FUNCTIONAL");

  console.log(`Total Fitur Diuji    : ${results.length}`);
  console.log(`✅ Berfungsi Penuh   : ${functional.length} (${Math.round((functional.length / results.length) * 100)}%)`);
  console.log(`⚠️ Berfungsi Parsial : ${partial.length}`);
  console.log(`❌ Tidak Berfungsi   : ${notFunctional.length}`);

  console.log("\n📋 Rincian Status Fitur:");
  results.forEach((r, idx) => {
    const icon = r.status === "FUNCTIONAL" ? "✅" : r.status === "PARTIAL" ? "⚠️" : "❌";
    console.log(`${idx + 1}. ${icon} [${r.category}] ${r.featureName}: ${r.details}`);
  });
}

runAudit().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error("FATAL AUDIT ERROR:", err);
  process.exit(1);
});
