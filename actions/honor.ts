"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { ActionResponse } from "@/types";
import { revalidatePath } from "next/cache";
import { PayoutStatus } from "@prisma/client";

export async function calculateTutorPayout(input: {
  tutorId: string;
  periodStart: Date | string;
  periodEnd: Date | string;
  notes?: string;
}): Promise<ActionResponse<{ payoutId: string; totalSessions: number; totalAmount: number }>> {
  try {
    const start = new Date(input.periodStart);
    const end = new Date(input.periodEnd);

    const { data: tutor, error: tutorErr } = await supabaseAdmin
      .from("Tutor")
      .select("id, name, ratePerSession")
      .eq("id", input.tutorId)
      .single();

    if (tutorErr || !tutor) {
      return { success: false, message: "Data tutor tidak ditemukan." };
    }

    // BR-6: Honor tutor dihitung dari sesi TERLAKSANA dalam periode
    const { data: completedSessions, error: sessErr } = await supabaseAdmin
      .from("Session")
      .select("id")
      .eq("tutorId", input.tutorId)
      .eq("status", "TERLAKSANA")
      .gte("startAt", start.toISOString())
      .lte("startAt", end.toISOString());

    if (sessErr) throw sessErr;

    const totalSessions = (completedSessions || []).length;
    const totalAmount = totalSessions * (tutor.ratePerSession || 100000);

    const now = new Date().toISOString();
    const { data: payout, error: payErr } = await supabaseAdmin
      .from("TutorPayout")
      .insert({
        tutorId: input.tutorId,
        periodStart: start.toISOString(),
        periodEnd: end.toISOString(),
        totalSessions,
        totalAmount,
        status: "DRAFT",
        notes: input.notes || null,
        updatedAt: now,
      })
      .select("id")
      .single();

    if (payErr) throw payErr;

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
    let query = supabaseAdmin
      .from("TutorPayout")
      .select(`
        *,
        tutor:Tutor(id, name, phone, ratePerSession)
      `)
      .order("periodStart", { ascending: false });

    if (params?.tutorId) query = query.eq("tutorId", params.tutorId);
    if (params?.status) query = query.eq("status", params.status);

    const { data: payouts, error } = await query;
    if (error) throw error;

    return payouts || [];
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
    const now = new Date().toISOString();
    const updateData: any = {
      status,
      updatedAt: now,
    };
    if (status === ("DIBAYAR" as any)) {
      updateData.paidAt = now;
    }

    const { error } = await supabaseAdmin
      .from("TutorPayout")
      .update(updateData)
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/dashboard/honor");

    return {
      success: true,
      message: `Status rekap honor berhasil diubah menjadi ${status}.`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Gagal memperbarui status rekap honor.",
    };
  }
}
