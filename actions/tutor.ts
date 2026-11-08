"use server";

import { prisma } from "@/lib/prisma";
import { ActionResponse } from "@/types";
import { revalidatePath } from "next/cache";
import { TutorStatus } from "@prisma/client";

export type TutorInput = {
  name: string;
  phone: string;
  email?: string;
  expertise: string[];
  ratePerSession?: number;
  status?: TutorStatus;
  bio?: string;
  avatar?: string;
};

export async function getTutors(params?: {
  search?: string;
  status?: TutorStatus;
  isStaffViewer?: boolean; // BR-7: Staf tidak melihat tarif honor
}) {
  try {
    const where: any = {};
    if (params?.status) {
      where.status = params.status;
    }
    if (params?.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { phone: { contains: params.search } },
      ];
    }

    const tutors = await prisma.tutor.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            sessions: true,
          },
        },
      },
    });

    // Mask ratePerSession if viewer is Staff
    if (params?.isStaffViewer) {
      return tutors.map((t) => ({
        ...t,
        ratePerSession: 0, // Hidden for staff
      }));
    }

    return tutors;
  } catch (error) {
    console.error("getTutors error:", error);
    return [];
  }
}

export async function createTutor(input: TutorInput): Promise<ActionResponse<{ id: string }>> {
  try {
    if (!input.name || !input.phone) {
      return {
        success: false,
        message: "Nama tutor dan nomor WhatsApp wajib diisi.",
      };
    }

    const tutor = await prisma.tutor.create({
      data: {
        name: input.name.trim(),
        phone: input.phone.trim(),
        email: input.email?.trim().toLowerCase() || null,
        expertise: input.expertise || [],
        ratePerSession: input.ratePerSession || 100000,
        status: input.status || TutorStatus.AKTIF,
        bio: input.bio || null,
        avatar: input.avatar || null,
      },
    });

    revalidatePath("/dashboard/tutor");

    return {
      success: true,
      message: "Data tutor berhasil ditambahkan.",
      data: { id: tutor.id },
    };
  } catch (error: any) {
    console.error("createTutor error:", error);
    return {
      success: false,
      message: "Gagal menambahkan data tutor.",
    };
  }
}

export async function updateTutor(
  id: string,
  input: Partial<TutorInput>
): Promise<ActionResponse> {
  try {
    await prisma.tutor.update({
      where: { id },
      data: {
        ...(input.name ? { name: input.name.trim() } : {}),
        ...(input.phone ? { phone: input.phone.trim() } : {}),
        ...(input.email !== undefined ? { email: input.email?.trim().toLowerCase() || null } : {}),
        ...(input.expertise ? { expertise: input.expertise } : {}),
        ...(input.ratePerSession !== undefined ? { ratePerSession: input.ratePerSession } : {}),
        ...(input.status ? { status: input.status } : {}),
        ...(input.bio !== undefined ? { bio: input.bio } : {}),
        ...(input.avatar !== undefined ? { avatar: input.avatar } : {}),
      },
    });

    revalidatePath("/dashboard/tutor");

    return {
      success: true,
      message: "Data tutor berhasil diperbarui.",
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Gagal memperbarui data tutor.",
    };
  }
}

export async function deleteTutor(id: string): Promise<ActionResponse> {
  try {
    await prisma.tutor.delete({
      where: { id },
    });

    revalidatePath("/dashboard/tutor");
    return {
      success: true,
      message: "Data tutor berhasil dihapus.",
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Gagal menghapus data tutor.",
    };
  }
}
