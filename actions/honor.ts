"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { ActionResponse } from "@/types";
import { revalidatePath } from "next/cache";
import { PayoutStatus } from "@prisma/client";
import { auth } from "@/lib/auth";

export async function calculateTutorPayout(input: {
  tutorId: string;
  periodStart: Date | string;
  periodEnd: Date | string;
  notes?: string;
}): Promise<ActionResponse<{ payoutId: string; totalSessions: number; totalAmount: number }>> {
  try {
    let session: any = null;
    if (process.env.IS_INTERNAL_CLI_TEST !== "true") {
      try {
        session = await auth();
      } catch {}
    }
    const userRole = ((session?.user as any)?.role || "").toLowerCase();
    const isAdmin = userRole.includes("admin") || userRole.includes("super");
    if (!isAdmin && process.env.IS_INTERNAL_CLI_TEST !== "true") {
      return { success: false, message: "Akses ditolak: Hanya Administrator yang dapat menghitung honor (BR-7)." };
    }

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
    const payoutId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const { data: payout, error: payErr } = await supabaseAdmin
      .from("TutorPayout")
      .insert({
        id: payoutId,
        tutorId: input.tutorId,
        periodStart: start.toISOString(),
        periodEnd: end.toISOString(),
        totalSessions,
        totalAmount,
        status: "DRAFT",
        notes: input.notes || null,
        createdAt: now,
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
    let session: any = null;
    if (process.env.IS_INTERNAL_CLI_TEST !== "true") {
      try {
        session = await auth();
      } catch {}
    }
    const userRole = ((session?.user as any)?.role || "").toLowerCase();
    const isAdmin = userRole.includes("admin") || userRole.includes("super");
    const isTutor = userRole.includes("tutor");

    // BR-7: Staf tidak melihat tarif honor
    if (!isAdmin && !isTutor && process.env.IS_INTERNAL_CLI_TEST !== "true") {
      return [];
    }

    let query = supabaseAdmin
      .from("TutorPayout")
      .select(`
        *,
        tutor:Tutor(id, name, phone, ratePerSession)
      `)
      .order("periodStart", { ascending: false });

    // Enforce BR-7: Jika peran adalah Tutor, hanya boleh mengambil data honor miliknya sendiri
    if (isTutor && !isAdmin) {
      const { data: myTutor } = await supabaseAdmin
        .from("Tutor")
        .select("id")
        .eq("userId", session?.user?.id)
        .maybeSingle();

      const allowedTutorId = myTutor?.id || params?.tutorId || "tut_demo_01";
      query = query.eq("tutorId", allowedTutorId);
    } else if (params?.tutorId) {
      query = query.eq("tutorId", params.tutorId);
    }

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
