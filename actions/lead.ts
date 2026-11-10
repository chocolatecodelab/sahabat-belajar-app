"use server";

import { supabaseAdmin } from "@/lib/supabase";
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

    let cleanPhone = input.phone.trim().replace(/[^0-9+]/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "62" + cleanPhone.slice(1);
    } else if (cleanPhone.startsWith("+")) {
      cleanPhone = cleanPhone.slice(1);
    }

    const leadId = `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const { data: lead, error } = await supabaseAdmin
      .from("Lead")
      .insert({
        id: leadId,
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
        updatedAt: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) throw error;

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
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    let query = supabaseAdmin
      .from("Lead")
      .select("*, students:Student(id, name)", { count: "exact" })
      .order("createdAt", { ascending: false })
      .range(from, to);

    if (params?.status && params.status !== ("ALL" as any)) {
      query = query.eq("status", params.status);
    }

    if (params?.search) {
      const s = params.search.trim();
      query = query.or(`name.ilike.%${s}%,phone.ilike.%${s}%,email.ilike.%${s}%`);
    }

    const { data: leads, count, error } = await query;
    if (error) throw error;

    const total = count || 0;

    return {
      data: leads || [],
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
    const updateData: any = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const { error } = await supabaseAdmin
      .from("Lead")
      .update(updateData)
      .eq("id", id);

    if (error) throw error;

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
    const { error } = await supabaseAdmin.from("Lead").delete().eq("id", id);
    if (error) throw error;

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
