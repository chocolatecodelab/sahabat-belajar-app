"use server";

import { prisma } from "@/lib/prisma";
import { ActionResponse } from "@/types";
import { revalidatePath } from "next/cache";
import { PackageType } from "@prisma/client";

export async function getPrograms() {
  try {
    return await prisma.program.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        packages: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  } catch (error) {
    console.error("getPrograms error:", error);
    return [];
  }
}

export async function createProgram(data: {
  name: string;
  category: string;
  description?: string;
  sortOrder?: number;
}): Promise<ActionResponse<{ id: string }>> {
  try {
    const program = await prisma.program.create({
      data: {
        name: data.name.trim(),
        category: data.category,
        description: data.description || null,
        sortOrder: data.sortOrder || 0,
      },
    });

    revalidatePath("/dashboard/paket");
    return {
      success: true,
      message: "Program berhasil dibuat.",
      data: { id: program.id },
    };
  } catch (error: any) {
    return { success: false, message: "Gagal membuat program." };
  }
}

export async function createPackage(data: {
  programId?: string;
  name: string;
  type: PackageType;
  durationMonths?: number;
  quotaSessions?: number;
  sessionMinutes?: number;
  price?: number;
}): Promise<ActionResponse<{ id: string }>> {
  try {
    const pkg = await prisma.package.create({
      data: {
        programId: data.programId || null,
        name: data.name.trim(),
        type: data.type,
        durationMonths: data.durationMonths || null,
        quotaSessions: data.quotaSessions || null,
        sessionMinutes: data.sessionMinutes || 90, // BR-5 default 90 menit
        price: data.price || 0,
      },
    });

    revalidatePath("/dashboard/paket");
    return {
      success: true,
      message: "Paket belajar berhasil ditambahkan.",
      data: { id: pkg.id },
    };
  } catch (error: any) {
    return { success: false, message: "Gagal membuat paket belajar." };
  }
}
