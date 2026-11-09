export type TimeSlotKey = "pagi" | "siang" | "sore" | "malam";

export interface TimeSlotConfig {
  key: TimeSlotKey;
  label: string;
  startHour: string; // "08:00"
  endHour: string;   // "11:30"
}

export const TIME_SLOTS: TimeSlotConfig[] = [
  { key: "pagi", label: "Pagi", startHour: "08:00", endHour: "11:30" },
  { key: "siang", label: "Siang", startHour: "13:00", endHour: "15:30" },
  { key: "sore", label: "Sore", startHour: "15:30", endHour: "18:00" },
  { key: "malam", label: "Malam", startHour: "18:30", endHour: "21:00" },
];

export const DAYS_OF_WEEK = [
  { index: 1, name: "Senin" },
  { index: 2, name: "Selasa" },
  { index: 3, name: "Rabu" },
  { index: 4, name: "Kamis" },
  { index: 5, name: "Jumat" },
  { index: 6, name: "Sabtu" },
  { index: 0, name: "Minggu" },
];

export type TutorAvailabilityGrid = Record<
  string, // tutorId
  Record<
    number, // dayOfWeek (0-6)
    Record<TimeSlotKey, boolean>
  >
>;

export type TutorRecommendation = {
  tutorId: string;
  name: string;
  phone: string;
  expertise: string[];
  ratePerSession: number;
  matchScore: number; // 0 - 100
  matchGrade: "SANGAT_COCOK" | "FLEKSIBEL" | "KURANG_COCOK" | "BENTROK";
  statusText: string;
  isAvailableSlot: boolean;
  isExpertiseMatched: boolean;
  hasConflict: boolean;
  conflictDetails?: string;
  reasons: string[];
};

export type RecurrenceSimulationItem = {
  weekIndex: number;
  dateStr: string; // YYYY-MM-DD
  dayName: string;
  timeRange: string;
  hasConflict: boolean;
  conflictDetails?: string;
};

export function getSlotKeyFromTime(timeStr: string): TimeSlotKey {
  const [hour] = timeStr.split(":").map(Number);
  if (hour < 12) return "pagi";
  if (hour >= 12 && hour < 15) return "siang";
  if (hour >= 15 && hour < 18) return "sore";
  return "malam";
}
