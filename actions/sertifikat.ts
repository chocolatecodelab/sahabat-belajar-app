"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { auth } from "@/lib/auth";
import type { ActionResponse } from "@/types";
import { notifyCertificateIssued } from "@/lib/notifications";

function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Non-HTTP context fallback
  }
}

export type CertificateDetail = {
  id: string;
  certificateCode: string;
  recipientName: string;
  courseTitle: string;
  totalHours: string;
  issuedAt: string;
  credentialUrl?: string | null;
};

// Fallback demo certificate
const DEMO_CERTIFICATE: CertificateDetail = {
  id: "cert_demo_1",
  certificateCode: "BIAS-2026-SCP-0189",
  recipientName: "Nazaruddin, M.Kom., Ph.D.",
  courseTitle: "Mentorship Intensif Publikasi Jurnal Scopus & SINTA 1-2",
  totalHours: "32 JP",
  issuedAt: new Date().toISOString(),
  credentialUrl: null,
};

/**
 * 1. Claim & Generate E-Certificate 32 JP Digital
 */
export async function claimCertificate(enrollmentId: string): Promise<ActionResponse<{ certificateCode: string }>> {
  try {
    if (!enrollmentId) {
      return { success: false, message: "ID pendaftaran tidak valid" };
    }

    // 1. Strict Session Verification (QA-FUNC-05)
    let session: any = null;
    try {
      session = await auth();
    } catch {
      // Handles unauthenticated or outside request scope execution
      session = null;
    }

    if (!session?.user?.email) {
      return {
        success: false,
        message: "Silakan masuk ke akun Anda terlebih dahulu untuk mengklaim E-Sertifikat.",
      };
    }

    const sessionEmail = session.user.email.trim().toLowerCase();
    const sessionRole = (session.user as any)?.role || "Student";
    const isAdmin = ["Super Admin", "Admin"].includes(sessionRole);

    // 2. Check if certificate already exists
    const { data: existing } = await supabaseAdmin
      .from("Certificate")
      .select("certificateCode")
      .eq("enrollmentId", enrollmentId)
      .maybeSingle();

    if (existing) {
      return {
        success: true,
        message: "E-Sertifikat Anda sudah terbit",
        data: { certificateCode: existing.certificateCode },
      };
    }

    // 3. Fetch enrollment info & progress
    const { data: enrollment, error: enrollErr } = await supabaseAdmin
      .from("CourseEnrollment")
      .select(`
        id,
        userName,
        userEmail,
        progressPercentage,
        status,
        course:Course(title)
      `)
      .eq("id", enrollmentId)
      .maybeSingle();

    if (enrollErr || !enrollment) {
      return { success: false, message: "Data pendaftaran kelas tidak ditemukan" };
    }

    // 4. Verify Ownership: Student must own this enrollment (unless Admin)
    const enrollmentEmail = (enrollment.userEmail || "").trim().toLowerCase();
    if (!isAdmin && enrollmentEmail !== sessionEmail) {
      return {
        success: false,
        message: "Akses ditolak: Anda tidak memiliki otorisasi untuk mengklaim sertifikat pendaftaran ini.",
      };
    }

    // 5. Strict 100% Completion Gatekeeping
    const currentProgress = Number(enrollment.progressPercentage || 0);
    if (currentProgress < 100) {
      return {
        success: false,
        message: `E-Sertifikat 32 JP hanya dapat diklaim setelah menyelesaikan 100% materi pembelajaran (Progres Anda saat ini: ${currentProgress}%).`,
      };
    }

    const recipientName = enrollment?.userName || "Peserta Riset BIAS RISTEK";
    const rawCourse: any = (enrollment as any)?.course;
    const courseTitle = rawCourse ? (Array.isArray(rawCourse) ? rawCourse[0]?.title : rawCourse?.title) : "Mentorship Publikasi Riset";

    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const certificateCode = `BIAS-${year}-SCP-${randomSuffix}`;
    const id = `cert_${Date.now()}_${randomSuffix}`;

    const { error: insertErr } = await supabaseAdmin.from("Certificate").insert({
      id,
      certificateCode,
      enrollmentId,
      recipientName,
      courseTitle,
      totalHours: "32 JP",
      issuedAt: new Date().toISOString(),
    });

    if (insertErr) {
      console.error("claimCertificate insert error:", insertErr);
      return { success: false, message: `Gagal menerbitkan E-Sertifikat: ${insertErr.message}` };
    }

    // Update enrollment status to COMPLETED
    await supabaseAdmin
      .from("CourseEnrollment")
      .update({
        status: "COMPLETED",
        progressPercentage: 100,
        completedAt: new Date().toISOString(),
      })
      .eq("id", enrollmentId);

    safeRevalidatePath("/belajar");
    safeRevalidatePath(`/sertifikat/${certificateCode}`);

    // Async Dispatch E-Certificate Issued Notification
    (async () => {
      try {
        const studentEmail = (enrollment as any)?.userEmail;
        notifyCertificateIssued({
          studentName: recipientName,
          studentEmail: studentEmail || "peserta@biasristek.id",
          courseTitle,
          certificateCode,
          totalHours: "32 JP",
        }).catch((e) => console.error("notifyCertificateIssued error:", e));
      } catch (notifErr) {
        console.error("notifyCertificateIssued error:", notifErr);
      }
    })();

    return {
      success: true,
      message: "Selamat! E-Sertifikat 32 JP resmi Anda berhasil diterbitkan",
      data: { certificateCode },
    };
  } catch (err: any) {
    console.error("claimCertificate error:", err);
    return {
      success: false,
      message: err?.message || "Terjadi kesalahan sistem saat menerbitkan E-Sertifikat",
    };
  }
}

/**
 * 2. Get Certificate by Unique Code for Public Verification
 */
export async function getCertificateByCode(certificateCode: string): Promise<CertificateDetail | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("Certificate")
      .select("*")
      .eq("certificateCode", certificateCode)
      .maybeSingle();

    if (error || !data) {
      if (certificateCode.toUpperCase() === DEMO_CERTIFICATE.certificateCode) {
        return DEMO_CERTIFICATE;
      }
      return null;
    }

    return data as CertificateDetail;
  } catch {
    return null;
  }
}
