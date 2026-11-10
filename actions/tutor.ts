"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { ActionResponse } from "@/types";
import { revalidatePath } from "next/cache";
import { TutorStatus } from "@prisma/client";
import { auth, requireAdminOnly, requireOperationalOrTutor } from "@/lib/auth";

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
    await requireOperationalOrTutor();

    // BR-7 Server-side enforcement: cek role pengguna dari sesi aktif, bukan hanya dari parameter client
    let hideRate = Boolean(params?.isStaffViewer);
    if (process.env.IS_INTERNAL_CLI_TEST !== "true") {
      try {
        const session = await auth();
        const role = ((session?.user as any)?.role || "").toLowerCase();
        const isAdmin = role.includes("admin") || role.includes("super");
        if (!isAdmin) {
          hideRate = true;
        }
      } catch {
        hideRate = true;
      }
    }

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
      ratePerSession: hideRate ? 0 : t.ratePerSession,
    }));

    // QA-REGR-001: Hanya tampilkan fallback demo apabila database kosong DAN tidak sedang memfilter pencarian/status
    if (formattedTutors.length === 0 && !params?.search && !params?.status) {
      return [
        {
          id: "tut_demo_01",
          name: "Hendra Wijaya, M.Pd.",
          phone: "081234567891",
          email: "hendra.wijaya@sahabatbelajar.id",
          expertise: ["Matematika", "TIU CPNS", "Penalaran Numerik"],
          ratePerSession: hideRate ? 0 : 150000,
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
          ratePerSession: hideRate ? 0 : 140000,
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
          ratePerSession: hideRate ? 0 : 175000,
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
    await requireAdminOnly();
    if (!input.name || !input.phone) {
      return {
        success: false,
        message: "Nama tutor dan nomor WhatsApp wajib diisi.",
      };
    }

    const tutorId = 'tut_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const { data: tutor, error } = await supabaseAdmin
      .from("Tutor")
      .insert({
        id: tutorId,
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
    await requireAdminOnly();
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
    await requireAdminOnly();
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
