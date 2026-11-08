"use server";

import { prisma } from "@/lib/prisma";
import { ActionResponse } from "@/types";
import { revalidatePath } from "next/cache";
import { SessionStatus, AttendanceStatus } from "@prisma/client";

export type CreateSessionInput = {
  tutorId: string;
  programId: string;
  classType: "PRIVAT" | "SEMI_PRIVAT";
  mode: "ONLINE" | "HOME_VISIT";
  startAt: string | Date; // ISO string or Date
  endAt: string | Date;
  studentIds: string[]; // 1 for PRIVAT, 2-5 for SEMI_PRIVAT
  meetingLink?: string;
  address?: string;
  recurrenceWeeks?: number; // C3: Sesi berulang mingguan
};

export async function createSession(
  input: CreateSessionInput
): Promise<ActionResponse<{ sessionIds: string[] }>> {
  try {
    const startDate = new Date(input.startAt);
    const endDate = new Date(input.endAt);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate >= endDate) {
      return {
        success: false,
        message: "Waktu mulai dan selesai sesi tidak valid.",
      };
    }

    // BR-3: Batasan semi-privat maksimal 5 peserta
    if (input.studentIds.length === 0) {
      return { success: false, message: "Pilih minimal 1 siswa untuk sesi bimbingan." };
    }
    if (input.classType === "PRIVAT" && input.studentIds.length > 1) {
      return { success: false, message: "Kelas privat hanya untuk 1 siswa." };
    }
    if (input.studentIds.length > 5) {
      return {
        success: false,
        message: "Kelas semi-privat maksimal 5 peserta. Peserta ke-6 ditolak (BR-3).",
      };
    }

    const weeks = input.recurrenceWeeks && input.recurrenceWeeks > 1 ? input.recurrenceWeeks : 1;
    const recurrenceId = weeks > 1 ? `rec_${Date.now()}` : null;
    const createdSessionIds: string[] = [];

    for (let w = 0; w < weeks; w++) {
      const currentStart = new Date(startDate.getTime() + w * 7 * 24 * 60 * 60 * 1000);
      const currentEnd = new Date(endDate.getTime() + w * 7 * 24 * 60 * 60 * 1000);

      // BR-2: Deteksi Bentrok Jadwal Tutor
      const tutorConflict = await prisma.session.findFirst({
        where: {
          tutorId: input.tutorId,
          status: { not: SessionStatus.DIBATALKAN },
          AND: [
            { startAt: { lt: currentEnd } },
            { endAt: { gt: currentStart } },
          ],
        },
        include: { tutor: true },
      });

      if (tutorConflict) {
        return {
          success: false,
          message: `Bentrok jadwal! Tutor ${tutorConflict.tutor.name} sudah memiliki sesi lain pada rentang waktu tersebut (BR-2).`,
        };
      }

      // BR-2: Deteksi Bentrok Jadwal Siswa
      for (const studentId of input.studentIds) {
        const studentConflict = await prisma.sessionParticipant.findFirst({
          where: {
            studentId,
            session: {
              status: { not: SessionStatus.DIBATALKAN },
              AND: [
                { startAt: { lt: currentEnd } },
                { endAt: { gt: currentStart } },
              ],
            },
          },
          include: { student: true },
        });

        if (studentConflict) {
          return {
            success: false,
            message: `Bentrok jadwal! Siswa ${studentConflict.student.name} sudah memiliki sesi lain pada jam tersebut (BR-2).`,
          };
        }
      }

      // Cari paket aktif untuk masing-masing siswa
      const participantData = await Promise.all(
        input.studentIds.map(async (studentId) => {
          const activePackage = await prisma.studentPackage.findFirst({
            where: {
              studentId,
              status: { in: ["AKTIF", "HAMPIR_HABIS"] },
            },
            orderBy: { createdAt: "desc" },
          });

          return {
            studentId,
            studentPackageId: activePackage?.id || null,
            attendance: AttendanceStatus.HADIR,
            quotaDeducted: false,
          };
        })
      );

      const session = await prisma.session.create({
        data: {
          tutorId: input.tutorId,
          programId: input.programId,
          classType: input.classType,
          mode: input.mode,
          startAt: currentStart,
          endAt: currentEnd,
          meetingLink: input.meetingLink || null,
          address: input.address || null,
          status: SessionStatus.TERJADWAL,
          recurrenceId,
          participants: {
            create: participantData,
          },
        },
      });

      createdSessionIds.push(session.id);
    }

    revalidatePath("/dashboard/jadwal");
    revalidatePath("/dashboard");

    return {
      success: true,
      message:
        weeks > 1
          ? `Berhasil membuat ${weeks} sesi berulang mingguan tanpa bentrok.`
          : "Sesi bimbingan berhasil dijadwalkan.",
      data: { sessionIds: createdSessionIds },
    };
  } catch (error: any) {
    console.error("createSession error:", error);
    return {
      success: false,
      message: "Gagal membuat sesi jadwal.",
    };
  }
}

export async function getSessions(params?: {
  startDate?: Date | string;
  endDate?: Date | string;
  tutorId?: string;
  studentId?: string;
  status?: SessionStatus;
}) {
  try {
    const where: any = {};

    if (params?.status) {
      where.status = params.status;
    }
    if (params?.tutorId) {
      where.tutorId = params.tutorId;
    }
    if (params?.startDate || params?.endDate) {
      where.startAt = {};
      if (params.startDate) where.startAt.gte = new Date(params.startDate);
      if (params.endDate) where.startAt.lte = new Date(params.endDate);
    }
    if (params?.studentId) {
      where.participants = {
        some: { studentId: params.studentId },
      };
    }

    return await prisma.session.findMany({
      where,
      orderBy: { startAt: "asc" },
      include: {
        tutor: { select: { id: true, name: true, phone: true } },
        program: { select: { id: true, name: true, category: true } },
        participants: {
          include: {
            student: { select: { id: true, name: true, parentPhone: true } },
            studentPackage: true,
          },
        },
        journal: true,
      },
    });
  } catch (error) {
    console.error("getSessions error:", error);
    return [];
  }
}

// BR-1: Eksekusi pengurangan kuota saat sesi Terlaksana
export async function updateSessionStatus(
  sessionId: string,
  newStatus: SessionStatus,
  cancelReason?: string
): Promise<ActionResponse> {
  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        participants: {
          include: { studentPackage: true },
        },
      },
    });

    if (!session) {
      return { success: false, message: "Sesi tidak ditemukan." };
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update status sesi
      await tx.session.update({
        where: { id: sessionId },
        data: {
          status: newStatus,
          cancelReason: cancelReason || null,
        },
      });

      // 2. BR-1: Jika status diubah menjadi TERLAKSANA, potong kuota peserta hadir
      if (newStatus === SessionStatus.TERLAKSANA) {
        for (const p of session.participants) {
          if (!p.quotaDeducted && p.studentPackageId && p.attendance === AttendanceStatus.HADIR) {
            const currentPkg = await tx.studentPackage.findUnique({
              where: { id: p.studentPackageId },
            });

            if (currentPkg) {
              const newQuotaUsed = currentPkg.quotaUsed + 1;
              let newPkgStatus = currentPkg.status;

              if (newQuotaUsed >= currentPkg.quotaTotal) {
                newPkgStatus = "HABIS";
              } else if (currentPkg.quotaTotal - newQuotaUsed <= 2) {
                newPkgStatus = "HAMPIR_HABIS";
              }

              await tx.studentPackage.update({
                where: { id: p.studentPackageId },
                data: {
                  quotaUsed: newQuotaUsed,
                  status: newPkgStatus,
                },
              });

              await tx.sessionParticipant.update({
                where: { id: p.id },
                data: { quotaDeducted: true },
              });
            }
          }
        }
      }
    });

    revalidatePath("/dashboard/jadwal");
    revalidatePath("/dashboard/paket");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Status sesi berhasil diubah menjadi ${newStatus}.`,
    };
  } catch (error: any) {
    console.error("updateSessionStatus error:", error);
    return {
      success: false,
      message: "Gagal memperbarui status sesi.",
    };
  }
}

export async function saveSessionJournal(
  sessionId: string,
  data: {
    topic: string;
    notes?: string;
    homework?: string;
    attendances?: Array<{ participantId: string; attendance: AttendanceStatus }>;
  }
): Promise<ActionResponse> {
  try {
    await prisma.$transaction(async (tx) => {
      // Upsert journal
      await tx.sessionJournal.upsert({
        where: { sessionId },
        create: {
          sessionId,
          topic: data.topic.trim(),
          notes: data.notes?.trim() || null,
          homework: data.homework?.trim() || null,
        },
        update: {
          topic: data.topic.trim(),
          notes: data.notes?.trim() || null,
          homework: data.homework?.trim() || null,
        },
      });

      // Update attendances if provided
      if (data.attendances && data.attendances.length > 0) {
        for (const att of data.attendances) {
          await tx.sessionParticipant.update({
            where: { id: att.participantId },
            data: { attendance: att.attendance },
          });
        }
      }
    });

    revalidatePath("/dashboard/jadwal");

    return {
      success: true,
      message: "Jurnal pertemuan dan absensi berhasil disimpan.",
    };
  } catch (error: any) {
    console.error("saveSessionJournal error:", error);
    return {
      success: false,
      message: "Gagal menyimpan jurnal sesi.",
    };
  }
}
