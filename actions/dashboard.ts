"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { SessionStatus } from "@prisma/client";

export type SahabatBelajarDashboardData = {
  activeStudentsCount: number;
  todaySessionsCount: number;
  lowQuotaCount: number;
  newLeadsCount: number;
  todaySessions: Array<{
    id: string;
    startAt: Date;
    endAt: Date;
    classType: string;
    mode: string;
    status: SessionStatus;
    tutorName: string;
    programName: string;
    studentNames: string[];
    meetingLink: string | null;
  }>;
  actionItems: {
    lowQuotaStudents: Array<{
      id: string;
      studentName: string;
      quotaRemaining: number;
      packageName: string;
    }>;
    unpaidPayments: Array<{
      id: string;
      studentName: string;
      amount: number;
      packageName: string;
    }>;
    newLeads: Array<{
      id: string;
      name: string;
      phone: string;
      programInterest: string | null;
      createdAt: Date;
    }>;
  };
};

export async function getSahabatBelajarDashboardData(): Promise<SahabatBelajarDashboardData> {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      activeStudentsRes,
      todaySessionsRes,
      lowQuotaPackagesRes,
      newLeadsRes,
      unpaidPaymentsRes,
    ] = await Promise.all([
      // 1. Siswa aktif
      supabaseAdmin
        .from("Student")
        .select("id", { count: "exact", head: true })
        .eq("status", "AKTIF"),

      // 2. Sesi hari ini
      supabaseAdmin
        .from("Session")
        .select(`
          id,
          startAt,
          endAt,
          classType,
          mode,
          status,
          meetingLink,
          tutor:Tutor(name),
          program:Program(name),
          participants:SessionParticipant(
            student:Student(name)
          )
        `)
        .gte("startAt", todayStart.toISOString())
        .lte("startAt", todayEnd.toISOString())
        .neq("status", "DIBATALKAN")
        .order("startAt", { ascending: true }),

      // 3. Kuota hampir habis
      supabaseAdmin
        .from("StudentPackage")
        .select(`
          id,
          quotaTotal,
          quotaUsed,
          status,
          student:Student(name),
          package:Package(name)
        `)
        .eq("status", "HAMPIR_HABIS")
        .limit(5),

      // 4. Lead baru
      supabaseAdmin
        .from("Lead")
        .select("id, name, phone, programInterest, createdAt")
        .eq("status", "BARU")
        .order("createdAt", { ascending: false })
        .limit(5),

      // 5. Pembayaran belum lunas
      supabaseAdmin
        .from("Payment")
        .select(`
          id,
          amount,
          status,
          studentPackage:StudentPackage(
            student:Student(name),
            package:Package(name)
          )
        `)
        .neq("status", "LUNAS")
        .limit(5),
    ]);

    const activeStudentsCount = activeStudentsRes.count || 0;
    const rawSessions = todaySessionsRes.data || [];
    const lowQuotaPackages = lowQuotaPackagesRes.data || [];
    const newLeads = newLeadsRes.data || [];
    const unpaidPayments = unpaidPaymentsRes.data || [];

    const todaySessions = rawSessions.map((s: any) => ({
      id: s.id,
      startAt: new Date(s.startAt),
      endAt: new Date(s.endAt),
      classType: s.classType,
      mode: s.mode,
      status: s.status as SessionStatus,
      tutorName: s.tutor?.name || "Tutor",
      programName: s.program?.name || "Program",
      studentNames: (s.participants || []).map((p: any) => p.student?.name || "Siswa"),
      meetingLink: s.meetingLink,
    }));

    return {
      activeStudentsCount,
      todaySessionsCount: todaySessions.length,
      lowQuotaCount: lowQuotaPackages.length,
      newLeadsCount: newLeads.length,
      todaySessions,
      actionItems: {
        lowQuotaStudents: lowQuotaPackages.map((p: any) => ({
          id: p.id,
          studentName: p.student?.name || "Siswa",
          quotaRemaining: Math.max(0, (p.quotaTotal || 0) - (p.quotaUsed || 0)),
          packageName: p.package?.name || "Paket",
        })),
        unpaidPayments: unpaidPayments.map((pay: any) => ({
          id: pay.id,
          studentName: pay.studentPackage?.student?.name || "Siswa",
          amount: pay.amount || 0,
          packageName: pay.studentPackage?.package?.name || "Paket",
        })),
        newLeads: newLeads.map((l: any) => ({
          id: l.id,
          name: l.name,
          phone: l.phone,
          programInterest: l.programInterest,
          createdAt: new Date(l.createdAt),
        })),
      },
    };
  } catch (error) {
    console.error("getSahabatBelajarDashboardData error:", error);
    return {
      activeStudentsCount: 0,
      todaySessionsCount: 0,
      lowQuotaCount: 0,
      newLeadsCount: 0,
      todaySessions: [],
      actionItems: {
        lowQuotaStudents: [],
        unpaidPayments: [],
        newLeads: [],
      },
    };
  }
}
