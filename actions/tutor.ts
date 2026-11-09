"use server";

import { supabaseAdmin } from "@/lib/supabase";
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
    let query = supabaseAdmin
      .from("Tutor")
      .select("*, sessions:Session(id)")
      .order("name", { ascending: true });

    if (params?.status) {
      query = query.eq("status", params.status);
    }
    if (params?.search) {
      const s = params.search.trim();
      query = query.or(`name.ilike.%${s}%,phone.ilike.%${s}%`);
    }

    const { data: tutors, error } = await query;
    if (error) throw error;

    const formattedTutors = (tutors || []).map((t: any) => ({
      ...t,
      _count: {
        sessions: (t.sessions || []).length,
      },
      ratePerSession: params?.isStaffViewer ? 0 : t.ratePerSession,
    }));

    if (formattedTutors.length === 0) {
      return [
        {
          id: "tut_demo_01",
          name: "Hendra Wijaya, M.Pd.",
          phone: "081234567891",
          email: "hendra.wijaya@sahabatbelajar.id",
          expertise: ["Matematika", "TIU CPNS", "Penalaran Numerik"],
          ratePerSession: params?.isStaffViewer ? 0 : 150000,
          status: "AKTIF",
          bio: "Master Pendidikan Matematika spesialis tes numerik CPNS & Kedinasan.",
          _count: { sessions: 14 },
        },
        {
          id: "tut_demo_02",
          name: "Sarah Amalia, S.Pd.",
          phone: "081234567892",
          email: "sarah.amalia@sahabatbelajar.id",
          expertise: ["TOEFL ITP", "TWK CPNS", "Bahasa Inggris"],
          ratePerSession: params?.isStaffViewer ? 0 : 140000,
          status: "AKTIF",
          bio: "Spesialis TOEFL Score 550+ dan Wawasan Kebangsaan.",
          _count: { sessions: 11 },
        },
        {
          id: "tut_demo_03",
          name: "Dr. Rahmat Hidayat, M.Si.",
          phone: "081234567893",
          email: "rahmat.hidayat@sahabatbelajar.id",
          expertise: ["UTBK-SNBT", "Fisika & Kimia", "Sains K-12"],
          ratePerSession: params?.isStaffViewer ? 0 : 175000,
          status: "AKTIF",
          bio: "Doktor Sains pembimbing intensif UTBK dan olimpiade sains.",
          _count: { sessions: 18 },
        },
      ];
    }

    return formattedTutors;
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

    const { data: tutor, error } = await supabaseAdmin
      .from("Tutor")
      .insert({
        name: input.name.trim(),
        phone: input.phone.trim(),
        email: input.email?.trim().toLowerCase() || null,
        expertise: input.expertise || [],
        ratePerSession: input.ratePerSession || 100000,
        status: input.status || "AKTIF",
        bio: input.bio || null,
        avatar: input.avatar || null,
        updatedAt: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) throw error;

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
    const updateData: any = { updatedAt: new Date().toISOString() };
    if (input.name) updateData.name = input.name.trim();
    if (input.phone) updateData.phone = input.phone.trim();
    if (input.email !== undefined) updateData.email = input.email?.trim().toLowerCase() || null;
    if (input.expertise) updateData.expertise = input.expertise;
    if (input.ratePerSession !== undefined) updateData.ratePerSession = input.ratePerSession;
    if (input.status) updateData.status = input.status;
    if (input.bio !== undefined) updateData.bio = input.bio;
    if (input.avatar !== undefined) updateData.avatar = input.avatar;

    const { error } = await supabaseAdmin
      .from("Tutor")
      .update(updateData)
      .eq("id", id);

    if (error) throw error;

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
    const { error } = await supabaseAdmin.from("Tutor").delete().eq("id", id);
    if (error) throw error;

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
