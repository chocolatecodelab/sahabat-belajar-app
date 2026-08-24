"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAuth } from "@/lib/auth";
import type { ActionResponse } from "@/types";

export type PaymentAccountItem = {
  id: string;
  type: "BANK" | "QRIS";
  bankName: string;
  accountNumber: string | null;
  accountHolder: string | null;
  qrisImage: string | null;
  instructions: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

const DEFAULT_ACCOUNTS = [
  {
    id: "pay_qris",
    type: "QRIS",
    bankName: "QRIS Resmi BIAS RISTEK (Semua E-Wallet & M-Banking)",
    accountNumber: null,
    accountHolder: "BIAS RISTEK OFFICIAL",
    qrisImage: "/uploads/general/qris-bias-ristek.webp",
    instructions: "Buka aplikasi GoPay, OVO, Dana, ShopeePay, BCA Mobile, Livin Mandiri, atau Mobile Banking lainnya lalu scan kode QR di bawah.",
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "pay_bca",
    type: "BANK",
    bankName: "Bank Central Asia (BCA)",
    accountNumber: "8392019283",
    accountHolder: "BIAS RISTEK INDONESIA",
    qrisImage: null,
    instructions: "Transfer tepat hingga 3 digit kode unik verifikasi untuk mempercepat verifikasi otomatis.",
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "pay_mandiri",
    type: "BANK",
    bankName: "Bank Mandiri",
    accountNumber: "1320084920194",
    accountHolder: "BIAS RISTEK INDONESIA",
    qrisImage: null,
    instructions: "Transfer tepat hingga 3 digit kode unik verifikasi untuk mempercepat verifikasi otomatis.",
    isActive: true,
    sortOrder: 3,
  },
  {
    id: "pay_bsi",
    type: "BANK",
    bankName: "Bank Syariah Indonesia (BSI)",
    accountNumber: "7182930491",
    accountHolder: "BIAS RISTEK INDONESIA",
    qrisImage: null,
    instructions: "Transfer tepat hingga 3 digit kode unik verifikasi untuk mempercepat verifikasi otomatis.",
    isActive: true,
    sortOrder: 4,
  },
];

/**
 * Auto-seed default payment accounts if empty
 */
async function autoSeedPaymentAccounts(): Promise<void> {
  try {
    const { count } = await supabaseAdmin.from("PaymentAccount").select("*", { count: "exact", head: true });
    if (!count || count === 0) {
      await supabaseAdmin.from("PaymentAccount").upsert(DEFAULT_ACCOUNTS);
    }
  } catch (err) {
    console.error("Auto seed payment accounts error:", err);
  }
}

/**
 * Get active payment accounts for checkout and admin
 */
export async function getPaymentAccounts(activeOnly = true): Promise<PaymentAccountItem[]> {
  try {
    await autoSeedPaymentAccounts();

    let query = supabaseAdmin
      .from("PaymentAccount")
      .select("*")
      .order("sortOrder", { ascending: true });

    if (activeOnly) {
      query = query.eq("isActive", true);
    }

    const { data, error } = await query;
    if (error) {
      console.error("getPaymentAccounts error:", error);
      if (error.code === "PGRST205") {
        return DEFAULT_ACCOUNTS as PaymentAccountItem[];
      }
      return [];
    }

    if (!data || data.length === 0) {
      return DEFAULT_ACCOUNTS as PaymentAccountItem[];
    }

    return (data || []) as PaymentAccountItem[];
  } catch (err) {
    console.error("getPaymentAccounts error:", err);
    return DEFAULT_ACCOUNTS as PaymentAccountItem[];
  }
}

/**
 * Save or update payment account from admin
 */
export async function upsertPaymentAccount(formData: FormData): Promise<ActionResponse> {
  await requireAuth();

  try {
    const id = (formData.get("id") as string) || `pay_${Date.now()}`;
    const type = (formData.get("type") as string) || "BANK";
    const bankName = formData.get("bankName") as string;
    const accountNumber = formData.get("accountNumber") as string;
    const accountHolder = formData.get("accountHolder") as string;
    const qrisImage = formData.get("qrisImage") as string;
    const instructions = formData.get("instructions") as string;
    const isActive = formData.get("isActive") !== "false";
    const sortOrder = parseInt(formData.get("sortOrder") as string) || 0;

    if (!bankName) {
      return { success: false, message: "Nama Bank / Metode Pembayaran harus diisi" };
    }

    const { error } = await supabaseAdmin.from("PaymentAccount").upsert({
      id,
      type,
      bankName,
      accountNumber: accountNumber || null,
      accountHolder: accountHolder || null,
      qrisImage: qrisImage || null,
      instructions: instructions || null,
      isActive,
      sortOrder,
      updatedAt: new Date().toISOString(),
    });

    if (error) throw error;

    revalidatePath("/dashboard/pengaturan/pembayaran");
    return { success: true, message: "Akun pembayaran berhasil disimpan" };
  } catch (err: any) {
    console.error("upsertPaymentAccount error:", err);
    return { success: false, message: err?.message || "Gagal menyimpan akun pembayaran" };
  }
}

/**
 * Delete payment account
 */
export async function deletePaymentAccount(id: string): Promise<ActionResponse> {
  await requireAuth();

  try {
    const { error } = await supabaseAdmin.from("PaymentAccount").delete().eq("id", id);
    if (error) throw error;

    revalidatePath("/dashboard/pengaturan/pembayaran");
    return { success: true, message: "Akun pembayaran berhasil dihapus" };
  } catch (err: any) {
    console.error("deletePaymentAccount error:", err);
    return { success: false, message: err?.message || "Gagal menghapus akun pembayaran" };
  }
}
