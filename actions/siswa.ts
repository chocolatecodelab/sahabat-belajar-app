"use server";

import { prisma } from "@/lib/prisma";
import { ActionResponse } from "@/types";
import { revalidatePath } from "next/cache";
import { StudentStatus } from "@prisma/client";

export type StudentInput = {
  name: string;
  level: string;
  school?: string;
  parentName?: string;
  parentPhone?: string;
  leadId?: string;
  status?: StudentStatus;
  notes?: string;
};

export async function getStudents(params?: {
  search?: string;
  level?: string;
  status?: StudentStatus;
  page?: number;
  perPage?: number;
}) {
  try {
    const page = params?.page || 1;
    const perPage = params?.perPage || 15;
    const skip = (page - 1) * perPage;

    const where: any = {};
    if (params?.status) {
      where.status = params.status;
    }
    if (params?.level) {
      where.level = params.level;
    }
    if (params?.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { school: { contains: params.search, mode: "insensitive" } },
        { parentName: { contains: params.search, mode: "insensitive" } },
        { parentPhone: { contains: params.search } },
      ];
    }

    const [total, students] = await Promise.all([
      prisma.student.count({ where }),
      prisma.student.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: perPage,
        include: {
          packages: {
            include: { package: true },
            orderBy: { createdAt: "desc" },
          },
          lead: { select: { id: true, phone: true, email: true } },
        },
      }),
    ]);

    return {
      data: students,
      meta: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  } catch (error) {
    console.error("getStudents error:", error);
    return { data: [], meta: { page: 1, perPage: 15, total: 0, totalPages: 0 } };
  }
}

export async function createStudent(input: StudentInput): Promise<ActionResponse<{ id: string }>> {
  try {
    if (!input.name || !input.level) {
      return {
        success: false,
        message: "Nama siswa dan jenjang pendidikan wajib diisi.",
      };
    }

    const student = await prisma.student.create({
      data: {
        name: input.name.trim(),
        level: input.level,
        school: input.school?.trim() || null,
        parentName: input.parentName?.trim() || null,
        parentPhone: input.parentPhone?.trim() || null,
        leadId: input.leadId || null,
        status: input.status || StudentStatus.AKTIF,
        parentConsentAt: input.parentPhone ? new Date() : null,
        notes: input.notes || null,
      },
    });

    if (input.leadId) {
      await prisma.lead.update({
        where: { id: input.leadId },
        data: { status: "DAFTAR" },
      });
    }

    revalidatePath("/dashboard/siswa");
    revalidatePath("/dashboard/lead");

    return {
      success: true,
      message: "Data siswa berhasil didaftarkan.",
      data: { id: student.id },
    };
  } catch (error: any) {
    console.error("createStudent error:", error);
    return {
      success: false,
      message: "Gagal membuat data siswa.",
    };
  }
}

export async function updateStudent(
  id: string,
  input: Partial<StudentInput>
): Promise<ActionResponse> {
  try {
    await prisma.student.update({
      where: { id },
      data: {
        ...(input.name ? { name: input.name.trim() } : {}),
        ...(input.level ? { level: input.level } : {}),
        ...(input.school !== undefined ? { school: input.school?.trim() || null } : {}),
        ...(input.parentName !== undefined ? { parentName: input.parentName?.trim() || null } : {}),
        ...(input.parentPhone !== undefined ? { parentPhone: input.parentPhone?.trim() || null } : {}),
        ...(input.status ? { status: input.status } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
      },
    });

    revalidatePath("/dashboard/siswa");

    return {
      success: true,
      message: "Data siswa berhasil diperbarui.",
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Gagal memperbarui data siswa.",
    };
  }
}

export async function deleteStudent(id: string): Promise<ActionResponse> {
  try {
    await prisma.student.delete({
      where: { id },
    });

    revalidatePath("/dashboard/siswa");
    return {
      success: true,
      message: "Data siswa berhasil dihapus.",
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Gagal menghapus data siswa.",
    };
  }
}

export async function importStudentsFromCsv(
  rows: Array<{
    name: string;
    level: string;
    school?: string;
    parentName?: string;
    parentPhone?: string;
  }>
): Promise<ActionResponse<{ importedCount: number }>> {
  try {
    let importedCount = 0;
    for (const row of rows) {
      if (!row.name || !row.level) continue;

      await prisma.student.create({
        data: {
          name: row.name.trim(),
          level: row.level.trim(),
          school: row.school?.trim() || null,
          parentName: row.parentName?.trim() || null,
          parentPhone: row.parentPhone?.trim() || null,
          parentConsentAt: row.parentPhone ? new Date() : null,
          status: StudentStatus.AKTIF,
        },
      });
      importedCount++;
    }

    revalidatePath("/dashboard/siswa");

    return {
      success: true,
      message: `Berhasil mengimpor ${importedCount} data siswa baru dari CSV.`,
      data: { importedCount },
    };
  } catch (error: any) {
    console.error("importStudentsFromCsv error:", error);
    return {
      success: false,
      message: "Gagal memproses file impor CSV.",
    };
  }
}
