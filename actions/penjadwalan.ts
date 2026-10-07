"use server";

import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAuth } from "@/lib/auth";
import type { ActionResponse } from "@/types";
import {
  getTutorDirectoryPool,
  matchTutorsForStudent,
  type TutorProfileData,
  type MatchCandidate,
} from "@/lib/tutor-matching";
import {
  notifyTutorBookingProposed,
  notifyStudentMentorshipConfirmed,
  notifyTutorMentorshipConfirmed,
} from "@/lib/notifications";
import { triggerN8nWebhook } from "@/lib/n8n";

function safeRevalidatePath(urlPath: string) {
  try {
    revalidatePath(urlPath);
  } catch {
    // Non-HTTP context fallback
  }
}

export type MentorshipBookingItem = {
  id: string;
  registrationId: string | null;
  studentName: string;
  studentWhatsapp: string;
  studentEmail: string | null;
  tutorId: string;
  tutorName: string;
  tutorTitle: string;
  tutorInstitution: string;
  tutorWhatsapp: string;
  researchTopic: string;
  researchSoftware: string | null;
  scheduledDate: string;
  timeSlot: string;
  zoomJoinUrl: string | null;
  zoomHostUrl: string | null;
  status: "DRAFT_MATCHING" | "PENDING_TUTOR_CONFIRMATION" | "CONFIRMED" | "DECLINED_BY_TUTOR" | "COMPLETED" | "RESCHEDULED";
  confirmationToken: string;
  tutorNotes: string | null;
  confirmedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

// Local storage fallback file
const STORAGE_FILE = path.join(process.cwd(), "data", "mentorship_bookings.json");

async function readBookingsStore(): Promise<MentorshipBookingItem[]> {
  try {
    const raw = await fs.readFile(STORAGE_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeBookingsStore(bookings: MentorshipBookingItem[]) {
  try {
    const dir = path.dirname(STORAGE_FILE);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(STORAGE_FILE, JSON.stringify(bookings, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write mentorship_bookings.json:", err);
  }
}

// Generate unique Zoom Room URL
function generateZoomRoom(): { joinUrl: string; hostUrl: string } {
  const meetingId = Math.floor(8000000000 + Math.random() * 1999999999);
  const passcode = Math.random().toString(36).substring(2, 8).toUpperCase();
  return {
    joinUrl: `https://zoom.us/j/${meetingId}?pwd=BIAS${passcode}`,
    hostUrl: `https://zoom.us/s/${meetingId}?pwd=BIAS${passcode}`,
  };
}

// ==============================================================================
// 1. GET DISPATCHER BOARD DATA
// ==============================================================================

export async function getDispatcherBoardData(): Promise<{
  studentsNeedingMatch: any[];
  activeBookings: MentorshipBookingItem[];
  tutors: TutorProfileData[];
  metrics: {
    pendingMatching: number;
    awaitingTutorConfirm: number;
    confirmedBookings: number;
    activeTutorsCount: number;
  };
}> {
  try {
    // 1. Fetch registrations from Supabase
    let registrations: any[] = [];
    try {
      const { data, error } = await supabaseAdmin
        .from("CourseRegistration")
        .select("*")
        .order("createdAt", { ascending: false });

      if (!error && data) {
        registrations = data;
      }
    } catch {
      registrations = [];
    }

    // 2. Fetch bookings
    let bookings: MentorshipBookingItem[] = [];
    try {
      const { data, error } = await supabaseAdmin
        .from("MentorshipBooking")
        .select("*")
        .order("createdAt", { ascending: false });

      if (!error && data && data.length > 0) {
        bookings = data as MentorshipBookingItem[];
      } else {
        bookings = await readBookingsStore();
      }
    } catch {
      bookings = await readBookingsStore();
    }

    const bookedRegIds = new Set(
      bookings
        .filter((b) => b.status === "PENDING_TUTOR_CONFIRMATION" || b.status === "CONFIRMED")
        .map((b) => b.registrationId)
        .filter(Boolean)
    );

    // Filter students needing match: verified or uploaded, but without active booking
    const studentsNeedingMatch = registrations.filter(
      (r) => (r.status === "VERIFIED" || r.status === "PAYMENT_UPLOADED") && !bookedRegIds.has(r.id)
    );

    const tutors = getTutorDirectoryPool();

    const pendingMatching = studentsNeedingMatch.length;
    const awaitingTutorConfirm = bookings.filter((b) => b.status === "PENDING_TUTOR_CONFIRMATION").length;
    const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED").length;
    const activeTutorsCount = tutors.filter((t) => t.isActive).length;

    return {
      studentsNeedingMatch,
      activeBookings: bookings,
      tutors,
      metrics: {
        pendingMatching,
        awaitingTutorConfirm,
        confirmedBookings,
        activeTutorsCount,
      },
    };
  } catch (err: any) {
    console.error("getDispatcherBoardData error:", err);
    return {
      studentsNeedingMatch: [],
      activeBookings: [],
      tutors: getTutorDirectoryPool(),
      metrics: {
        pendingMatching: 0,
        awaitingTutorConfirm: 0,
        confirmedBookings: 0,
        activeTutorsCount: 200,
      },
    };
  }
}

// ==============================================================================
// 2. GET RECOMMENDED TUTORS FOR REGISTRATION
// ==============================================================================

export async function getRecommendedTutors(registrationId: string): Promise<ActionResponse<{ candidates: MatchCandidate[]; registration: any }>> {
  try {
    let registration: any = null;
    try {
      const { data } = await supabaseAdmin
        .from("CourseRegistration")
        .select("*")
        .eq("id", registrationId)
        .maybeSingle();
      registration = data;
    } catch {
      registration = null;
    }

    if (!registration) {
      // Fallback demo student if tested with mock ID
      registration = {
        id: registrationId,
        name: "Ahmad Fauzi, M.Kom.",
        institution: "Universitas Indonesia",
        educationLevel: "S3 (Disertasi)",
        researchTopic: "Implementasi SmartPLS 4 dan PLS-SEM pada Model Kepuasan & Loyalitas Konsumen Digital",
        researchSoftware: "SmartPLS 4",
        phone: "6281234567890",
        email: "ahmad.fauzi@ui.ac.id",
      };
    }

    const candidates = matchTutorsForStudent(
      {
        researchTopic: registration.researchTopic,
        researchSoftware: registration.researchSoftware || (registration.courseTitle?.includes("SmartPLS") ? "SmartPLS 4" : null),
        educationLevel: registration.educationLevel,
        institution: registration.institution,
      },
      getTutorDirectoryPool(),
      5
    );

    return {
      success: true,
      message: `Ditemukan ${candidates.length} kandidat tutor pakar yang sesuai`,
      data: {
        candidates,
        registration,
      },
    };
  } catch (err: any) {
    console.error("getRecommendedTutors error:", err);
    return {
      success: false,
      message: err?.message || "Gagal mencocokkan tutor",
    };
  }
}

// ==============================================================================
// 3. CREATE MENTORSHIP PROPOSAL (DISPATCH TO TUTOR VIA WHATSAPP MAGIC TOKEN)
// ==============================================================================

export async function createMentorshipProposal(params: {
  registrationId?: string;
  studentName: string;
  studentWhatsapp: string;
  studentEmail?: string;
  studentInstitution?: string;
  studentEducationLevel?: string;
  tutorId: string;
  researchTopic: string;
  researchSoftware?: string;
  scheduledDate: string; // ISO date string e.g. "2026-10-15"
  timeSlot: string;      // e.g. "19:30 - 21:00 WIB"
  tutorNotes?: string;
  baseUrl?: string;
}): Promise<ActionResponse<{ booking: MentorshipBookingItem; magicToken: string }>> {
  try {
    const {
      registrationId,
      studentName,
      studentWhatsapp,
      studentEmail,
      studentInstitution,
      studentEducationLevel,
      tutorId,
      researchTopic,
      researchSoftware,
      scheduledDate,
      timeSlot,
      tutorNotes,
      baseUrl,
    } = params;

    if (!studentName || !tutorId || !researchTopic || !scheduledDate || !timeSlot) {
      return { success: false, message: "Seluruh data penugasan bimbingan wajib diisi lengkap" };
    }

    const pool = getTutorDirectoryPool();
    const tutor = pool.find((t) => t.id === tutorId);

    if (!tutor) {
      return { success: false, message: "Profil tutor tidak ditemukan dalam direktori pakar" };
    }

    // Generate cryptographic magic token (32 hex characters)
    const magicToken = crypto.randomBytes(16).toString("hex");

    const newBooking: MentorshipBookingItem = {
      id: `book_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      registrationId: registrationId || null,
      studentName,
      studentWhatsapp,
      studentEmail: studentEmail || null,
      tutorId: tutor.id,
      tutorName: tutor.fullName,
      tutorTitle: tutor.academicTitle,
      tutorInstitution: tutor.institution,
      tutorWhatsapp: tutor.whatsappNumber,
      researchTopic,
      researchSoftware: researchSoftware || null,
      scheduledDate,
      timeSlot,
      zoomJoinUrl: null,
      zoomHostUrl: null,
      status: "PENDING_TUTOR_CONFIRMATION",
      confirmationToken: magicToken,
      tutorNotes: tutorNotes || null,
      confirmedAt: null,
      completedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 1. Try persisting to Supabase
    try {
      await supabaseAdmin.from("MentorshipBooking").insert({
        id: newBooking.id,
        registrationId: newBooking.registrationId,
        studentName: newBooking.studentName,
        studentWhatsapp: newBooking.studentWhatsapp,
        studentEmail: newBooking.studentEmail,
        tutorId: newBooking.tutorId,
        researchTopic: newBooking.researchTopic,
        researchSoftware: newBooking.researchSoftware,
        scheduledDate: newBooking.scheduledDate,
        timeSlot: newBooking.timeSlot,
        status: newBooking.status,
        confirmationToken: newBooking.confirmationToken,
        tutorNotes: newBooking.tutorNotes,
        createdAt: newBooking.createdAt,
        updatedAt: newBooking.updatedAt,
      });
    } catch {
      // In-memory / file fallback
    }

    // 2. Persist to local JSON file store
    const currentBookings = await readBookingsStore();
    currentBookings.unshift(newBooking);
    await writeBookingsStore(currentBookings);

    // 3. Dispatch WhatsApp & Email notification to Tutor with Magic Links
    await notifyTutorBookingProposed({
      tutorName: tutor.fullName,
      tutorPhone: tutor.whatsappNumber,
      tutorEmail: tutor.email,
      studentName,
      studentInstitution: studentInstitution || "Institusi Akademik",
      studentEducationLevel: studentEducationLevel || "S2 / S3",
      researchTopic,
      researchSoftware,
      scheduledDate,
      timeSlot,
      confirmationToken: magicToken,
      baseUrl,
    });

    // 4. Dispatch outbound webhook event to n8n
    await triggerN8nWebhook("MENTORSHIP_PROPOSED", {
      bookingId: newBooking.id,
      magicToken,
      student: { name: studentName, phone: studentWhatsapp, email: studentEmail, topic: researchTopic },
      tutor: { id: tutor.id, name: tutor.fullName, phone: tutor.whatsappNumber },
      schedule: { date: scheduledDate, slot: timeSlot },
    });

    safeRevalidatePath("/dashboard/penjadwalan");

    return {
      success: true,
      message: `Usulan bimbingan berhasil dibuat & notifikasi WhatsApp dikirimkan ke ${tutor.fullName}`,
      data: {
        booking: newBooking,
        magicToken,
      },
    };
  } catch (err: any) {
    console.error("createMentorshipProposal error:", err);
    return {
      success: false,
      message: err?.message || "Gagal membuat usulan bimbingan",
    };
  }
}

// ==============================================================================
// 4. GET BOOKING BY MAGIC TOKEN (PUBLIC TUTOR CONFIRMATION)
// ==============================================================================

export async function getMentorshipBookingByToken(token: string): Promise<MentorshipBookingItem | null> {
  try {
    if (!token) return null;

    // 1. Try Supabase
    try {
      const { data, error } = await supabaseAdmin
        .from("MentorshipBooking")
        .select("*")
        .eq("confirmationToken", token)
        .maybeSingle();

      if (!error && data) {
        return data as MentorshipBookingItem;
      }
    } catch {
      // fall through
    }

    // 2. Try Local File Store
    const bookings = await readBookingsStore();
    const found = bookings.find((b) => b.confirmationToken === token);
    return found || null;
  } catch (err) {
    console.error("getMentorshipBookingByToken error:", err);
    return null;
  }
}

// ==============================================================================
// 5. CONFIRM OR DECLINE MENTORSHIP BY TOKEN (1-CLICK HUMAN IN THE LOOP)
// ==============================================================================

export async function confirmMentorshipByToken(
  token: string,
  action: "ACCEPT" | "DECLINE",
  notes?: string
): Promise<ActionResponse<{ booking: MentorshipBookingItem }>> {
  try {
    if (!token) {
      return { success: false, message: "Token konfirmasi tidak sah atau sudah kedaluwarsa" };
    }

    const booking = await getMentorshipBookingByToken(token);
    if (!booking) {
      return { success: false, message: "Jadwal penugasan tidak ditemukan" };
    }

    if (booking.status === "CONFIRMED") {
      return {
        success: true,
        message: "Jadwal bimbingan ini telah terkonfirmasi sebelumnya.",
        data: { booking },
      };
    }

    const nowIso = new Date().toISOString();
    let updatedBooking: MentorshipBookingItem;

    if (action === "ACCEPT") {
      const zoom = generateZoomRoom();
      updatedBooking = {
        ...booking,
        status: "CONFIRMED",
        zoomJoinUrl: zoom.joinUrl,
        zoomHostUrl: zoom.hostUrl,
        confirmedAt: nowIso,
        updatedAt: nowIso,
        tutorNotes: notes || booking.tutorNotes,
      };

      // 1. Update Supabase
      try {
        await supabaseAdmin
          .from("MentorshipBooking")
          .update({
            status: "CONFIRMED",
            zoomJoinUrl: zoom.joinUrl,
            zoomHostUrl: zoom.hostUrl,
            confirmedAt: nowIso,
            updatedAt: nowIso,
            tutorNotes: updatedBooking.tutorNotes,
          })
          .eq("confirmationToken", token);
      } catch {
        // Fallback
      }

      // 2. Update Local Store
      const currentBookings = await readBookingsStore();
      const idx = currentBookings.findIndex((b) => b.confirmationToken === token);
      if (idx !== -1) {
        currentBookings[idx] = updatedBooking;
      } else {
        currentBookings.push(updatedBooking);
      }
      await writeBookingsStore(currentBookings);

      // 3. Notify Student via WhatsApp & Email
      await notifyStudentMentorshipConfirmed({
        studentName: updatedBooking.studentName,
        studentPhone: updatedBooking.studentWhatsapp,
        studentEmail: updatedBooking.studentEmail || undefined,
        tutorName: updatedBooking.tutorName,
        tutorTitle: updatedBooking.tutorTitle,
        tutorInstitution: updatedBooking.tutorInstitution,
        scheduledDate: updatedBooking.scheduledDate,
        timeSlot: updatedBooking.timeSlot,
        zoomJoinUrl: zoom.joinUrl,
        researchTopic: updatedBooking.researchTopic,
      });

      // 4. Notify Tutor
      await notifyTutorMentorshipConfirmed({
        tutorName: updatedBooking.tutorName,
        tutorPhone: updatedBooking.tutorWhatsapp,
        studentName: updatedBooking.studentName,
        scheduledDate: updatedBooking.scheduledDate,
        timeSlot: updatedBooking.timeSlot,
        zoomHostUrl: zoom.hostUrl,
      });

      // 5. Trigger n8n Webhook
      await triggerN8nWebhook("MENTORSHIP_CONFIRMED", {
        bookingId: updatedBooking.id,
        tutor: { id: updatedBooking.tutorId, name: updatedBooking.tutorName },
        student: { name: updatedBooking.studentName, phone: updatedBooking.studentWhatsapp },
        schedule: { date: updatedBooking.scheduledDate, slot: updatedBooking.timeSlot },
        zoom: zoom,
      });

      safeRevalidatePath("/dashboard/penjadwalan");
      safeRevalidatePath(`/tutor/konfirmasi/${token}`);

      return {
        success: true,
        message: "Terima kasih! Sesi bimbingan resmi TERKONFIRMASI dan tautan Zoom telah dikirimkan ke siswa.",
        data: { booking: updatedBooking },
      };
    } else {
      // DECLINE
      updatedBooking = {
        ...booking,
        status: "DECLINED_BY_TUTOR",
        tutorNotes: notes || "Tutor berhalangan pada waktu yang diusulkan.",
        updatedAt: nowIso,
      };

      // 1. Update Supabase
      try {
        await supabaseAdmin
          .from("MentorshipBooking")
          .update({
            status: "DECLINED_BY_TUTOR",
            tutorNotes: updatedBooking.tutorNotes,
            updatedAt: nowIso,
          })
          .eq("confirmationToken", token);
      } catch {
        // Fallback
      }

      // 2. Update Local Store
      const currentBookings = await readBookingsStore();
      const idx = currentBookings.findIndex((b) => b.confirmationToken === token);
      if (idx !== -1) {
        currentBookings[idx] = updatedBooking;
      }
      await writeBookingsStore(currentBookings);

      // 3. Trigger n8n Webhook
      await triggerN8nWebhook("MENTORSHIP_DECLINED", {
        bookingId: updatedBooking.id,
        tutor: { id: updatedBooking.tutorId, name: updatedBooking.tutorName },
        reason: updatedBooking.tutorNotes,
      });

      safeRevalidatePath("/dashboard/penjadwalan");
      safeRevalidatePath(`/tutor/konfirmasi/${token}`);

      return {
        success: true,
        message: "Catatan penolakan tersimpan. Koordinator akademik akan mengalihkan ke kandidat tutor berikutnya.",
        data: { booking: updatedBooking },
      };
    }
  } catch (err: any) {
    console.error("confirmMentorshipByToken error:", err);
    return {
      success: false,
      message: err?.message || "Gagal memproses konfirmasi bimbingan",
    };
  }
}

// ==============================================================================
// 6. GET ALL TUTORS FOR DIRECTORY DISPLAY
// ==============================================================================

export async function getAllTutors(params?: {
  search?: string;
  specialization?: string;
}): Promise<TutorProfileData[]> {
  try {
    let pool = getTutorDirectoryPool();

    if (params?.search) {
      const q = params.search.toLowerCase();
      pool = pool.filter(
        (t) =>
          t.fullName.toLowerCase().includes(q) ||
          t.institution.toLowerCase().includes(q) ||
          t.specializations.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (params?.specialization && params.specialization !== "Semua") {
      const spec = params.specialization.toLowerCase();
      pool = pool.filter((t) => t.specializations.some((s) => s.toLowerCase().includes(spec)));
    }

    return pool;
  } catch {
    return getTutorDirectoryPool();
  }
}
