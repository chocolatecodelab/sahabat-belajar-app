"use server";

import { prisma } from "@/lib/prisma";
import { SessionStatus, StudentStatus, LeadStatus } from "@prisma/client";

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
      activeStudentsCount,
      todaySessions,
      lowQuotaPackages,
      newLeads,
      unpaidPayments,
    ] = await Promise.all([
      // 1. Siswa aktif
      prisma.student.count({
        where: { status: StudentStatus.AKTIF },
      }),

      // 2. Sesi hari ini
      prisma.session.findMany({
        where: {
          startAt: { gte: todayStart, lte: todayEnd },
          status: { not: SessionStatus.DIBATALKAN },
        },
        orderBy: { startAt: "asc" },
        include: {
          tutor: { select: { name: true } },
          program: { select: { name: true } },
          participants: {
            include: {
              student: { select: { name: true } },
            },
          },
        },
      }),

      // 3. Kuota hampir habis (sisa 1-2 sesi atau status HAMPIR_HABIS)
      prisma.studentPackage.findMany({
        where: {
          status: "HAMPIR_HABIS",
        },
        include: {
          student: { select: { name: true } },
          package: { select: { name: true } },
        },
        take: 5,
      }),

      // 4. Lead baru
      prisma.lead.findMany({
        where: { status: LeadStatus.BARU },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),

      // 5. Pembayaran belum lunas
      prisma.payment.findMany({
        where: { status: "BELUM" },
        include: {
          studentPackage: {
            include: {
              student: { select: { name: true } },
              package: { select: { name: true } },
            },
          },
        },
        take: 5,
      }),
    ]);

    return {
      activeStudentsCount,
      todaySessionsCount: todaySessions.length,
      lowQuotaCount: lowQuotaPackages.length,
      newLeadsCount: newLeads.length,
      todaySessions: todaySessions.map((s) => ({
        id: s.id,
        startAt: s.startAt,
        endAt: s.endAt,
        classType: s.classType,
        mode: s.mode,
        status: s.status,
        tutorName: s.tutor.name,
        programName: s.program.name,
        studentNames: s.participants.map((p) => p.student.name),
        meetingLink: s.meetingLink,
      })),
      actionItems: {
        lowQuotaStudents: lowQuotaPackages.map((p) => ({
          id: p.id,
          studentName: p.student.name,
          quotaRemaining: Math.max(0, p.quotaTotal - p.quotaUsed),
          packageName: p.package.name,
        })),
        unpaidPayments: unpaidPayments.map((pay) => ({
          id: pay.id,
          studentName: pay.studentPackage.student.name,
          amount: pay.amount,
          packageName: pay.studentPackage.package.name,
        })),
        newLeads: newLeads.map((l) => ({
          id: l.id,
          name: l.name,
          phone: l.phone,
          programInterest: l.programInterest,
          createdAt: l.createdAt,
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
