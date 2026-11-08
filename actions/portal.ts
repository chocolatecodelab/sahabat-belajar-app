"use server";

import { supabaseAdmin } from "@/lib/supabase";
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

    // Find student by userId or take first student as demo/admin preview
    let student: any = null;
    const { data: userStudents } = await supabaseAdmin
      .from("Student")
      .select(`
        *,
        packages:StudentPackage(
          *,
          package:Package(
            *,
            program:Program(*)
          )
        )
      `)
      .eq("userId", userId)
      .limit(1);

    if (userStudents && userStudents.length > 0) {
      student = userStudents[0];
    } else {
      const { data: firstStudents } = await supabaseAdmin
        .from("Student")
        .select(`
          *,
          packages:StudentPackage(
            *,
            package:Package(
              *,
              program:Program(*)
            )
          )
        `)
        .limit(1);

      if (firstStudents && firstStudents.length > 0) {
        student = firstStudents[0];
      }
    }

    if (!student) {
      return {
        success: false,
        message: "Data profil siswa belum terdaftar di sistem. Hubungi admin Sahabat Belajar.",
      };
    }

    // Fetch upcoming sessions for this student
    const now = new Date();
    const { data: rawParticipants } = await supabaseAdmin
      .from("SessionParticipant")
      .select(`
        *,
        session:Session(
          *,
          program:Program(*),
          tutor:Tutor(*),
          journal:SessionJournal(*)
        )
      `)
      .eq("studentId", student.id);

    const participants = rawParticipants || [];

    const upcomingSessions = participants
      .filter((p: any) => p.session?.status === "TERJADWAL" && new Date(p.session?.startAt) >= now)
      .map((p: any) => ({
        id: p.session.id,
        programName: p.session.program?.name || "Bimbel",
        tutorName: p.session.tutor?.name || "Tutor",
        classType: p.session.classType,
        mode: p.session.mode,
        startAt: new Date(p.session.startAt).toISOString(),
        endAt: new Date(p.session.endAt).toISOString(),
        meetingLink: p.session.meetingLink,
        address: p.session.address,
      }));

    const pastSessions = participants
      .filter((p: any) => p.session?.status === "TERLAKSANA" || new Date(p.session?.startAt) < now)
      .sort((a: any, b: any) => new Date(b.session?.startAt).getTime() - new Date(a.session?.startAt).getTime())
      .map((p: any) => ({
        id: p.session?.id || p.id,
        programName: p.session?.program?.name || "Bimbel",
        tutorName: p.session?.tutor?.name || "Tutor",
        startAt: new Date(p.session?.startAt).toISOString(),
        endAt: new Date(p.session?.endAt).toISOString(),
        status: p.session?.status || "TERLAKSANA",
        attendance: p.attendance,
        topic: p.session?.journal?.topic || null,
        notes: p.session?.journal?.notes || null,
        homework: p.session?.journal?.homework || null,
      }));

    const rawPackages = student.packages || [];
    const packages = rawPackages.map((sp: any) => {
      const remaining = Math.max(0, (sp.quotaTotal || 0) - (sp.quotaUsed || 0));
      return {
        id: sp.id,
        packageName: sp.package?.name || "Paket Bimbel",
        programName: sp.package?.program?.name || "Sahabat Belajar",
        quotaTotal: sp.quotaTotal || 0,
        quotaUsed: sp.quotaUsed || 0,
        quotaRemaining: remaining,
        startDate: new Date(sp.startDate).toISOString(),
        endDate: sp.endDate ? new Date(sp.endDate).toISOString() : null,
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
