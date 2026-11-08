"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { ActionResponse } from "@/types";

export type StudentPortalData = {
  student: {
    id: string;
    name: string;
    level: string;
    school: string | null;
    parentName: string | null;
    parentPhone: string | null;
    status: string;
  };
  packages: Array<{
    id: string;
    packageName: string;
    programName: string;
    quotaTotal: number;
    quotaUsed: number;
    quotaRemaining: number;
    startDate: string;
    endDate: string | null;
    status: string;
  }>;
  upcomingSessions: Array<{
    id: string;
    programName: string;
    tutorName: string;
    classType: string;
    mode: string;
    startAt: string;
    endAt: string;
    meetingLink: string | null;
    address: string | null;
  }>;
  pastSessions: Array<{
    id: string;
    programName: string;
    tutorName: string;
    startAt: string;
    endAt: string;
    status: string;
    attendance: string;
    topic: string | null;
    notes: string | null;
    homework: string | null;
  }>;
};

export async function getStudentPortalData(): Promise<ActionResponse<StudentPortalData>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, message: "Silakan login terlebih dahulu" };
    }

    const userId = session.user.id;
    const userEmail = session.user.email?.toLowerCase().trim();

    // Find student by userId or email or take first student if in demo/admin preview
    let student = await prisma.student.findFirst({
      where: {
        OR: [
          { userId: userId },
          { user: { email: userEmail } },
        ],
      },
      include: {
        packages: {
          include: {
            package: {
              include: {
                program: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    // Fallback: If logged in as admin/staff previewing portal or demo student
    if (!student) {
      student = await prisma.student.findFirst({
        include: {
          packages: {
            include: {
              package: {
                include: {
                  program: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });
    }

    if (!student) {
      return {
        success: false,
        message: "Data profil siswa belum terdaftar di sistem. Hubungi admin Sahabat Belajar.",
      };
    }

    // Fetch upcoming sessions for this student
    const now = new Date();
    const participants = await prisma.sessionParticipant.findMany({
      where: { studentId: student.id },
      include: {
        session: {
          include: {
            program: true,
            tutor: true,
            journal: true,
          },
        },
      },
      orderBy: {
        session: { startAt: "asc" },
      },
    });

    const upcomingSessions = participants
      .filter((p) => p.session.status === "TERJADWAL" && new Date(p.session.startAt) >= now)
      .map((p) => ({
        id: p.session.id,
        programName: p.session.program.name,
        tutorName: p.session.tutor.name,
        classType: p.session.classType,
        mode: p.session.mode,
        startAt: p.session.startAt.toISOString(),
        endAt: p.session.endAt.toISOString(),
        meetingLink: p.session.meetingLink,
        address: p.session.address,
      }));

    const pastSessions = participants
      .filter((p) => p.session.status === "TERLAKSANA" || new Date(p.session.startAt) < now)
      .sort((a, b) => new Date(b.session.startAt).getTime() - new Date(a.session.startAt).getTime())
      .map((p) => ({
        id: p.session.id,
        programName: p.session.program.name,
        tutorName: p.session.tutor.name,
        startAt: p.session.startAt.toISOString(),
        endAt: p.session.endAt.toISOString(),
        status: p.session.status,
        attendance: p.attendance,
        topic: p.session.journal?.topic || null,
        notes: p.session.journal?.notes || null,
        homework: p.session.journal?.homework || null,
      }));

    const packages = student.packages.map((sp) => {
      const remaining = Math.max(0, sp.quotaTotal - sp.quotaUsed);
      return {
        id: sp.id,
        packageName: sp.package.name,
        programName: sp.package.program?.name || "Bimbel Sahabat Belajar",
        quotaTotal: sp.quotaTotal,
        quotaUsed: sp.quotaUsed,
        quotaRemaining: remaining,
        startDate: sp.startDate.toISOString(),
        endDate: sp.endDate ? sp.endDate.toISOString() : null,
        status: sp.status,
      };
    });

    return {
      success: true,
      data: {
        student: {
          id: student.id,
          name: student.name,
          level: student.level,
          school: student.school,
          parentName: student.parentName,
          parentPhone: student.parentPhone,
          status: student.status,
        },
        packages,
        upcomingSessions,
        pastSessions,
      },
    };
  } catch (error) {
    console.error("getStudentPortalData error:", error);
    return { success: false, message: "Gagal mengambil data portal siswa" };
  }
}
