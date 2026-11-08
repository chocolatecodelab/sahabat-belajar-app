"use server";

import { prisma } from "@/lib/prisma";
import { ActionResponse } from "@/types";
import { revalidatePath } from "next/cache";
import { SessionStatus, PayoutStatus } from "@prisma/client";

export async function calculateTutorPayout(input: {
  tutorId: string;
  periodStart: Date | string;
  periodEnd: Date | string;
  notes?: string;
}): Promise<ActionResponse<{ payoutId: string; totalSessions: number; totalAmount: number }>> {
  try {
    const start = new Date(input.periodStart);
    const end = new Date(input.periodEnd);

    const tutor = await prisma.tutor.findUnique({
      where: { id: input.tutorId },
    });

    if (!tutor) {
      return { success: false, message: "Data tutor tidak ditemukan." };
    }

    // BR-6: Honor tutor dihitung dari sesi TERLAKSANA dalam periode
    const completedSessions = await prisma.session.findMany({
      where: {
        tutorId: input.tutorId,
        status: SessionStatus.TERLAKSANA,
        startAt: { gte: start, lte: end },
      },
    });

    const totalSessions = completedSessions.length;
    const totalAmount = totalSessions * tutor.ratePerSession;

    const payout = await prisma.tutorPayout.create({
      data: {
        tutorId: input.tutorId,
        periodStart: start,
        periodEnd: end,
        totalSessions,
        totalAmount,
        status: PayoutStatus.DRAFT,
        notes: input.notes || null,
      },
    });

    revalidatePath("/dashboard/honor");

    return {
      success: true,
      message: `Rekap honor berhasil dihitung: ${totalSessions} sesi terlaksana = Rp ${totalAmount.toLocaleString("id-ID")}.`,
      data: {
        payoutId: payout.id,
        totalSessions,
        totalAmount,
      },
    };
  } catch (error: any) {
    console.error("calculateTutorPayout error:", error);
    return { success: false, message: "Gagal menghitung rekap honor tutor." };
  }
}

export async function getTutorPayouts(params?: {
  tutorId?: string;
  status?: PayoutStatus;
}) {
  try {
    const where: any = {};
    if (params?.tutorId) where.tutorId = params.tutorId;
    if (params?.status) where.status = params.status;

    return await prisma.tutorPayout.findMany({
      where,
      orderBy: { periodStart: "desc" },
      include: {
        tutor: { select: { id: true, name: true, phone: true, ratePerSession: true } },
      },
    });
  } catch (error) {
    console.error("getTutorPayouts error:", error);
    return [];
  }
}

export async function updatePayoutStatus(
  id: string,
  status: PayoutStatus
): Promise<ActionResponse> {
  try {
    await prisma.tutorPayout.update({
      where: { id },
      data: {
        status,
        ...(status === PayoutStatus.DIBAYAR ? { paidAt: new Date() } : {}),
      },
    });

    revalidatePath("/dashboard/honor");
    return {
      success: true,
      message: `Status rekap honor diperbarui menjadi ${status}.`,
    };
  } catch (error: any) {
    return { success: false, message: "Gagal memperbarui status honor." };
  }
}
