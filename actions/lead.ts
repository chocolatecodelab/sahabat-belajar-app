"use server";

import { prisma } from "@/lib/prisma";
import { ActionResponse } from "@/types";
import { revalidatePath } from "next/cache";
import { LeadStatus } from "@prisma/client";

export type PublicLeadInput = {
  name: string;
  phone: string;
  email?: string;
  programInterest?: string;
  level?: string;
  classModel?: string;
  learningMode?: string;
  notes?: string;
};

export async function createPublicLead(
  input: PublicLeadInput
): Promise<ActionResponse<{ id: string }>> {
  try {
    if (!input.name || !input.phone) {
      return {
        success: false,
        message: "Nama lengkap dan nomor WhatsApp wajib diisi.",
      };
    }

    // Format phone: ensure clean numbers
    let cleanPhone = input.phone.trim().replace(/[^0-9+]/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "62" + cleanPhone.slice(1);
    } else if (cleanPhone.startsWith("+")) {
      cleanPhone = cleanPhone.slice(1);
    }

    const lead = await prisma.lead.create({
      data: {
        name: input.name.trim(),
        phone: cleanPhone,
        email: input.email ? input.email.trim().toLowerCase() : null,
        programInterest: input.programInterest || null,
        level: input.level || null,
        classModel: input.classModel || "PRIVAT",
        learningMode: input.learningMode || "ONLINE",
        source: "WEBSITE",
        status: LeadStatus.BARU,
        notes: input.notes || null,
      },
    });

    revalidatePath("/dashboard/lead");

    return {
      success: true,
      message: "Terima kasih! Pendaftaran Anda telah kami terima. Tim Sahabat Belajar akan segera menghubungi Anda.",
      data: { id: lead.id },
    };
  } catch (error: any) {
    console.error("createPublicLead error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat mengirim pendaftaran. Silakan coba lagi.",
    };
  }
}

export async function getLeads(params?: {
  status?: LeadStatus;
  search?: string;
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
    if (params?.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { phone: { contains: params.search } },
        { email: { contains: params.search, mode: "insensitive" } },
      ];
    }

    const [total, leads] = await Promise.all([
      prisma.lead.count({ where }),
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: perPage,
        include: {
          students: { select: { id: true, name: true } },
        },
      }),
    ]);

    return {
      data: leads,
      meta: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    };
  } catch (error) {
    console.error("getLeads error:", error);
    return { data: [], meta: { page: 1, perPage: 15, total: 0, totalPages: 0 } };
  }
}

export async function updateLeadStatus(
  id: string,
  status: LeadStatus,
  notes?: string
): Promise<ActionResponse> {
  try {
    await prisma.lead.update({
      where: { id },
      data: {
        status,
        ...(notes ? { notes } : {}),
      },
    });

    revalidatePath("/dashboard/lead");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Status prospek berhasil diperbarui menjadi ${status}.`,
    };
  } catch (error: any) {
    console.error("updateLeadStatus error:", error);
    return {
      success: false,
      message: "Gagal memperbarui status prospek.",
    };
  }
}

export async function deleteLead(id: string): Promise<ActionResponse> {
  try {
    await prisma.lead.delete({
      where: { id },
    });

    revalidatePath("/dashboard/lead");
    return {
      success: true,
      message: "Data prospek berhasil dihapus.",
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Gagal menghapus data prospek.",
    };
  }
}
