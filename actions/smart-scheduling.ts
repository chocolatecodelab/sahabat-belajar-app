"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/types";
import { SessionStatus } from "@prisma/client";
import {
  TimeSlotKey,
  TIME_SLOTS,
  TutorAvailabilityGrid,
  TutorRecommendation,
  RecurrenceSimulationItem,
  getSlotKeyFromTime,
} from "@/types/scheduling";

// Re-export types for server consumers
export type {
  TimeSlotKey,
  TimeSlotConfig,
  TutorAvailabilityGrid,
  TutorRecommendation,
  RecurrenceSimulationItem,
} from "@/types/scheduling";

// ==========================================
// DEFAULT REALISTIC AVAILABILITY PRESETS
// ==========================================
const DEFAULT_AVAILABILITY: TutorAvailabilityGrid = {
  // Hendra Wijaya: Sore & Malam di hari kerja, Pagi & Siang di Sabtu
  tut_demo_01: {
    1: { pagi: false, siang: true, sore: true, malam: false },
    2: { pagi: false, siang: false, sore: true, malam: true },
    3: { pagi: false, siang: true, sore: true, malam: false },
    4: { pagi: false, siang: false, sore: true, malam: true },
    5: { pagi: false, siang: false, sore: false, malam: false },
    6: { pagi: true, siang: true, sore: false, malam: false },
    0: { pagi: false, siang: false, sore: false, malam: false },
  },
  // Sarah Amalia: Pagi & Siang di Senin, Rabu, Jumat, dan Minggu
  tut_demo_02: {
    1: { pagi: true, siang: true, sore: false, malam: true },
    2: { pagi: false, siang: false, sore: false, malam: false },
    3: { pagi: true, siang: true, sore: false, malam: true },
    4: { pagi: false, siang: false, sore: false, malam: false },
    5: { pagi: true, siang: true, sore: true, malam: false },
    6: { pagi: false, siang: false, sore: false, malam: false },
    0: { pagi: true, siang: true, sore: false, malam: false },
  },
  // Dr. Rahmat Hidayat: Pagi & Siang di Selasa, Kamis, Sabtu
  tut_demo_03: {
    1: { pagi: false, siang: false, sore: false, malam: false },
    2: { pagi: true, siang: true, sore: false, malam: false },
    3: { pagi: false, siang: false, sore: false, malam: false },
    4: { pagi: true, siang: true, sore: false, malam: false },
    5: { pagi: true, siang: true, sore: false, malam: false },
    6: { pagi: false, siang: true, sore: true, malam: true },
    0: { pagi: false, siang: false, sore: false, malam: false },
  },
};

// In-memory runtime state for availability modifications during demo
let currentAvailabilityState: TutorAvailabilityGrid = JSON.parse(
  JSON.stringify(DEFAULT_AVAILABILITY)
);

// ==========================================
// 1. GET AVAILABILITY MATRIX
// ==========================================
export async function getTutorAvailabilityMatrix(): Promise<TutorAvailabilityGrid> {
  return currentAvailabilityState;
}

// ==========================================
// 2. TOGGLE TUTOR AVAILABILITY SLOT
// ==========================================
export async function toggleTutorAvailabilitySlot(
  tutorId: string,
  dayOfWeek: number,
  slotKey: TimeSlotKey,
  isAvailable: boolean
): Promise<ActionResponse<TutorAvailabilityGrid>> {
  try {
    if (!currentAvailabilityState[tutorId]) {
      currentAvailabilityState[tutorId] = {
        0: { pagi: false, siang: false, sore: false, malam: false },
        1: { pagi: false, siang: false, sore: false, malam: false },
        2: { pagi: false, siang: false, sore: false, malam: false },
        3: { pagi: false, siang: false, sore: false, malam: false },
        4: { pagi: false, siang: false, sore: false, malam: false },
        5: { pagi: false, siang: false, sore: false, malam: false },
        6: { pagi: false, siang: false, sore: false, malam: false },
      };
    }

    if (!currentAvailabilityState[tutorId][dayOfWeek]) {
      currentAvailabilityState[tutorId][dayOfWeek] = {
        pagi: false,
        siang: false,
        sore: false,
        malam: false,
      };
    }

    currentAvailabilityState[tutorId][dayOfWeek][slotKey] = isAvailable;

    revalidatePath("/dashboard/jadwal");

    return {
      success: true,
      message: "Slot ketersediaan tutor berhasil diperbarui.",
      data: currentAvailabilityState,
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Gagal memperbarui ketersediaan tutor.",
    };
  }
}

// ==========================================
// 3. SMART TUTOR MATCHING ENGINE (PRD Modul C2)
// ==========================================
export async function calculateSmartTutorRecommendations(params: {
  programName?: string;
  programCategory?: string;
  studentId?: string;
  dateStr: string;   // "YYYY-MM-DD"
  startTime: string; // "16:00"
  endTime: string;   // "17:30"
  mode?: "ONLINE" | "HOME_VISIT";
}): Promise<TutorRecommendation[]> {
  try {
    const { programName = "", programCategory = "", studentId, dateStr, startTime, endTime, mode = "ONLINE" } = params;

    const startDateTime = new Date(`${dateStr}T${startTime}:00`);
    const endDateTime = new Date(`${dateStr}T${endTime}:00`);
    const dayOfWeek = startDateTime.getDay();
    const slotKey = getSlotKeyFromTime(startTime);

    // Fetch active tutors from database
    const { data: dbTutors } = await supabaseAdmin
      .from("Tutor")
      .select("id, name, phone, expertise, ratePerSession, status")
      .eq("status", "AKTIF");

    // Realistic fallback tutors if DB is empty
    const tutorsList = (dbTutors && dbTutors.length > 0)
      ? dbTutors
      : [
          {
            id: "tut_demo_01",
            name: "Hendra Wijaya, M.Pd.",
            phone: "081234567891",
            expertise: ["TIU CPNS", "Matematika", "Penalaran Numerik", "CPNS & BUMN"],
            ratePerSession: 150000,
            status: "AKTIF",
          },
          {
            id: "tut_demo_02",
            name: "Sarah Amalia, S.Pd.",
            phone: "081234567892",
            expertise: ["TOEFL ITP", "TWK CPNS", "Bahasa Inggris", "IELTS"],
            ratePerSession: 140000,
            status: "AKTIF",
          },
          {
            id: "tut_demo_03",
            name: "Dr. Rahmat Hidayat, M.Si.",
            phone: "081234567893",
            expertise: ["UTBK-SNBT", "Fisika & Kimia", "Sains K-12", "Penalaran Matematika"],
            ratePerSession: 175000,
            status: "AKTIF",
          },
        ];

    // Fetch existing sessions around this date range to check BR-2 conflicts
    const { data: activeSessions } = await supabaseAdmin
      .from("Session")
      .select(`
        id, tutorId, startAt, endAt, status, mode,
        participants:SessionParticipant(studentId, student:Student(name))
      `)
      .neq("status", SessionStatus.DIBATALKAN)
      .lt("startAt", endDateTime.toISOString())
      .gt("endAt", startDateTime.toISOString());

    const recommendations: TutorRecommendation[] = [];

    for (const t of tutorsList) {
      let score = 0;
      const reasons: string[] = [];
      let hasConflict = false;
      let conflictDetails: string | undefined = undefined;

      // 1. Check BR-2 Conflict for this tutor
      const tutorSessionConflict = (activeSessions || []).find((s: any) => s.tutorId === t.id);
      if (tutorSessionConflict) {
        hasConflict = true;
        conflictDetails = `Tutor memiliki sesi lain jam ${new Date(tutorSessionConflict.startAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} - ${new Date(tutorSessionConflict.endAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB (Bentrok BR-2).`;
      }

      // Also check if selected student has a conflict at this time
      if (studentId && !hasConflict) {
        const studentSessionConflict = (activeSessions || []).find((s: any) =>
          (s.participants || []).some((p: any) => p.studentId === studentId)
        );
        if (studentSessionConflict) {
          hasConflict = true;
          conflictDetails = `Siswa sudah memiliki jadwal bimbingan lain pada jam ini (Bentrok BR-2).`;
        }
      }

      // 2. Check Expertise Match
      const tutorExpLower = (t.expertise || []).map((e: string) => e.toLowerCase());
      const progLower = (programName + " " + programCategory).toLowerCase();

      const matchedExp = tutorExpLower.find((exp: string) =>
        progLower.includes(exp) || exp.includes(progLower) ||
        (progLower.includes("cpns") && (exp.includes("tiu") || exp.includes("twk") || exp.includes("tkp") || exp.includes("cpns"))) ||
        (progLower.includes("toefl") && (exp.includes("toefl") || exp.includes("inggris") || exp.includes("ielts"))) ||
        (progLower.includes("utbk") && (exp.includes("utbk") || exp.includes("snbt") || exp.includes("matematika") || exp.includes("fisika"))) ||
        (progLower.includes("k12") && (exp.includes("matematika") || exp.includes("sains") || exp.includes("k-12")))
      );

      const isExpertiseMatched = Boolean(matchedExp);
      if (isExpertiseMatched) {
        score += 50;
        reasons.push(`Keahlian spesifik sesuai mata pelajaran: "${matchedExp || t.expertise[0]}"`);
      } else {
        reasons.push(`Keahlian umum (${t.expertise.join(", ")})`);
      }

      // 3. Check Weekly Availability Slot
      const tutorAvail = currentAvailabilityState[t.id]?.[dayOfWeek];
      const isAvailableSlot = Boolean(tutorAvail?.[slotKey]);

      if (isAvailableSlot) {
        score += 35;
        reasons.push(`Waktu bimbingan sesuai dengan slot luang rutin tutor (${TIME_SLOTS.find(s => s.key === slotKey)?.label})`);
      } else {
        reasons.push(`Di luar jam rutin tutor, namun jadwal kosong`);
      }

      // 4. Clean conflict bonus
      if (!hasConflict) {
        score += 15;
        reasons.push(`Jadwal bebas bentrok & siap dialokasikan (Aman BR-2)`);
      } else {
        score = Math.min(score, 15); // Heavily penalize conflict
      }

      // Determine match grade
      let matchGrade: "SANGAT_COCOK" | "FLEKSIBEL" | "KURANG_COCOK" | "BENTROK" = "FLEKSIBEL";
      let statusText = "Jadwal Fleksibel";

      if (hasConflict) {
        matchGrade = "BENTROK";
        statusText = "Jadwal Bentrok (BR-2)";
      } else if (score >= 85) {
        matchGrade = "SANGAT_COCOK";
        statusText = "Sangat Direkomendasikan (100% Match)";
      } else if (score >= 50) {
        matchGrade = "FLEKSIBEL";
        statusText = "Kompeten & Jadwal Kosong";
      } else {
        matchGrade = "KURANG_COCOK";
        statusText = "Di Luar Fokus Utama";
      }

      recommendations.push({
        tutorId: t.id,
        name: t.name,
        phone: t.phone,
        expertise: t.expertise || [],
        ratePerSession: t.ratePerSession,
        matchScore: score,
        matchGrade,
        statusText,
        isAvailableSlot,
        isExpertiseMatched,
        hasConflict,
        conflictDetails,
        reasons,
      });
    }

    // Sort: Non-conflicting first, then highest score
    recommendations.sort((a, b) => {
      if (a.hasConflict !== b.hasConflict) return a.hasConflict ? 1 : -1;
      return b.matchScore - a.matchScore;
    });

    return recommendations;
  } catch (error) {
    console.error("calculateSmartTutorRecommendations error:", error);
    return [];
  }
}

// ==========================================
// 4. SIMULATE RECURRING SESSIONS (PRD Modul C3)
// ==========================================
export async function simulateRecurringSessions(params: {
  tutorId: string;
  studentIds: string[];
  startDateStr: string; // "YYYY-MM-DD"
  startTime: string;    // "16:00"
  endTime: string;      // "17:30"
  weeksCount: number;   // 1 s/d 12
}): Promise<RecurrenceSimulationItem[]> {
  try {
    const { tutorId, studentIds, startDateStr, startTime, endTime, weeksCount } = params;
    const baseStart = new Date(`${startDateStr}T${startTime}:00`);
    const baseEnd = new Date(`${startDateStr}T${endTime}:00`);

    const results: RecurrenceSimulationItem[] = [];

    // Fetch all existing sessions for this tutor and students within the range
    const maxEnd = new Date(baseEnd.getTime() + (weeksCount - 1) * 7 * 24 * 60 * 60 * 1000);
    const { data: existingSessions } = await supabaseAdmin
      .from("Session")
      .select(`
        id, tutorId, startAt, endAt, status,
        participants:SessionParticipant(studentId)
      `)
      .neq("status", SessionStatus.DIBATALKAN)
      .gte("startAt", baseStart.toISOString())
      .lte("endAt", maxEnd.toISOString());

    for (let w = 0; w < weeksCount; w++) {
      const curStart = new Date(baseStart.getTime() + w * 7 * 24 * 60 * 60 * 1000);
      const curEnd = new Date(baseEnd.getTime() + w * 7 * 24 * 60 * 60 * 1000);

      const dateStr = curStart.toISOString().split("T")[0];
      const dayName = curStart.toLocaleDateString("id-ID", { weekday: "long" });
      const timeRange = `${startTime} - ${endTime} WIB`;

      let hasConflict = false;
      let conflictDetails: string | undefined = undefined;

      // Check tutor conflict on this specific date
      const tutorConflict = (existingSessions || []).find((s: any) => {
        if (s.tutorId !== tutorId) return false;
        const sStart = new Date(s.startAt).getTime();
        const sEnd = new Date(s.endAt).getTime();
        return sStart < curEnd.getTime() && sEnd > curStart.getTime();
      });

      if (tutorConflict) {
        hasConflict = true;
        conflictDetails = `Tutor memiliki sesi lain pada jam ${new Date(tutorConflict.startAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB.`;
      }

      // Check student conflict
      if (!hasConflict && studentIds.length > 0) {
        const studentConflict = (existingSessions || []).find((s: any) => {
          const hasStudent = (s.participants || []).some((p: any) => studentIds.includes(p.studentId));
          if (!hasStudent) return false;
          const sStart = new Date(s.startAt).getTime();
          const sEnd = new Date(s.endAt).getTime();
          return sStart < curEnd.getTime() && sEnd > curStart.getTime();
        });

        if (studentConflict) {
          hasConflict = true;
          conflictDetails = `Siswa memiliki sesi bimbingan lain pada jam ini.`;
        }
      }

      results.push({
        weekIndex: w + 1,
        dateStr,
        dayName,
        timeRange,
        hasConflict,
        conflictDetails,
      });
    }

    return results;
  } catch (error) {
    console.error("simulateRecurringSessions error:", error);
    return [];
  }
}
