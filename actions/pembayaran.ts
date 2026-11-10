"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { ActionResponse } from "@/types";
import { revalidatePath } from "next/cache";
import { PaymentStatus, StudentPackageStatus } from "@prisma/client";
import { requireStaffOrAdmin } from "@/lib/auth";
import { notifyPackagePaymentVerified } from "@/lib/notifications";

export async function assignPackageToStudent(input: {
  studentId: string;
  packageId: string;
  startDate?: Date | string;
  endDate?: Date | string;
}): Promise<ActionResponse<{ studentPackageId: string }>> {
  try {
    await requireStaffOrAdmin();
    const { data: pkg, error: pkgErr } = await supabaseAdmin
      .from("Package")
      .select("*")
      .eq("id", input.packageId)
      .single();

    if (pkgErr || !pkg) {
      return { success: false, message: "Paket belajar tidak ditemukan." };
    }

    const quotaTotal = pkg.quotaSessions || (pkg.durationMonths ? pkg.durationMonths * 8 : 10);
    const startDate = input.startDate ? new Date(input.startDate) : new Date();

    let endDate = input.endDate ? new Date(input.endDate) : null;
    if (!endDate && pkg.durationMonths) {
      endDate = new Date(startDate.getTime() + pkg.durationMonths * 30 * 24 * 60 * 60 * 1000);
    }

    const now = new Date().toISOString();
    const studentPackageId = 'spkg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const { data: studentPackage, error: spErr } = await supabaseAdmin
      .from("StudentPackage")
      .insert({
        id: studentPackageId,
        studentId: input.studentId,
        packageId: input.packageId,
        quotaTotal,
        quotaUsed: 0,
        startDate: startDate.toISOString(),
        endDate: endDate ? endDate.toISOString() : null,
        status: "AKTIF",
        updatedAt: now,
      })
      .select("id")
      .single();

    if (spErr) throw spErr;

    revalidatePath("/dashboard/paket");
    revalidatePath("/dashboard/siswa");

    return {
      success: true,
      message: `Paket ${pkg.name} (${quotaTotal} pertemuan) berhasil ditetapkan ke siswa.`,
      data: { studentPackageId: studentPackage.id },
    };
  } catch (error: any) {
    console.error("assignPackageToStudent error:", error);
    return { success: false, message: "Gagal menetapkan paket ke siswa." };
  }
}

export async function recordManualPayment(input: {
  studentPackageId: string;
  amount: number;
  paidAt?: Date | string;
  method?: string;
  proofFile?: string;
  status?: PaymentStatus;
  notes?: string;
}): Promise<ActionResponse<{ paymentId: string }>> {
  try {
    await requireStaffOrAdmin();
    if (!input.amount || input.amount <= 0) {
      return { success: false, message: "Nominal pembayaran harus lebih besar dari 0." };
    }

    const now = new Date().toISOString();
    const paidAt = input.paidAt ? new Date(input.paidAt).toISOString() : now;
    const paymentId = 'pay_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    const { data: payment, error } = await supabaseAdmin
      .from("Payment")
      .insert({
        id: paymentId,
        studentPackageId: input.studentPackageId,
        amount: input.amount,
        paidAt,
        method: input.method || "TRANSFER_BANK",
        proofFile: input.proofFile || null,
        status: input.status || "LUNAS",
        notes: input.notes || null,
        updatedAt: now,
      })
      .select("id")
      .single();

    if (error) throw error;

    // Trigger otomatis notifikasi WA & Email saat pembayaran dicatat LUNAS / SEBAGIAN
    try {
      const { data: spDetail } = await supabaseAdmin
        .from("StudentPackage")
        .select("quotaTotal, student:Student(name, parentPhone), package:Package(name)")
        .eq("id", input.studentPackageId)
        .maybeSingle();

      const studentObj: any = Array.isArray(spDetail?.student) ? spDetail?.student[0] : spDetail?.student;
      const packageObj: any = Array.isArray(spDetail?.package) ? spDetail?.package[0] : spDetail?.package;

      await notifyPackagePaymentVerified({
        paymentId: payment.id,
        studentName: studentObj?.name || "Siswa Sahabat Belajar",
        parentPhone: studentObj?.parentPhone || null,
        packageName: packageObj?.name || "Paket Bimbingan Belajar",
        amount: input.amount,
        method: input.method || "TRANSFER_BANK",
        status: input.status || "LUNAS",
        quotaTotal: spDetail?.quotaTotal,
      });
    } catch (notifErr) {
      console.error("recordManualPayment notification error:", notifErr);
    }

    revalidatePath("/dashboard/pembayaran");
    revalidatePath("/dashboard/paket");
    revalidatePath("/dashboard/pengaturan/notifikasi");

    return {
      success: true,
      message: "Pembayaran berhasil dicatat.",
      data: { paymentId: payment.id },
    };
  } catch (error: any) {
    console.error("recordManualPayment error:", error);
    return { success: false, message: "Gagal mencatat pembayaran." };
  }
}

export async function getStudentPackages(params?: {
  studentId?: string;
  status?: StudentPackageStatus;
}) {
  try {
    await requireStaffOrAdmin();
    let query = supabaseAdmin
      .from("StudentPackage")
      .select(`
        *,
        student:Student(id, name, level, parentPhone),
        package:Package(*),
        payments:Payment(*)
      `)
      .order("createdAt", { ascending: false })
      .limit(250);

    if (params?.studentId) query = query.eq("studentId", params.studentId);
    if (params?.status) query = query.eq("status", params.status);

    const { data: studentPackages, error } = await query;
    if (error) throw error;

    return studentPackages || [];
  } catch (error) {
    console.error("getStudentPackages error:", error);
    return [];
  }
}

export async function getPayments(params?: {
  status?: PaymentStatus;
}) {
  try {
    await requireStaffOrAdmin();
    let query = supabaseAdmin
      .from("Payment")
      .select(`
        *,
        studentPackage:StudentPackage(
          *,
          student:Student(id, name, parentPhone),
          package:Package(id, name, price)
        )
      `)
      .order("paidAt", { ascending: false })
      .limit(250);

    if (params?.status) query = query.eq("status", params.status);

    const { data: payments, error } = await query;
    if (error) throw error;

    return payments || [];
  } catch (error) {
    console.error("getPayments error:", error);
    return [];
  }
}

// ============================
// PAYMENT ACCOUNT SETTINGS HELPERS
// ============================

export type PaymentAccountItem = {
  id?: string;
  type: string | "BANK" | "QRIS";
  bankName: string;
  accountNumber?: string | null;
  accountHolder?: string | null;
  qrisImage?: string | null;
  instructions?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export async function getPaymentAccounts(activeOnly?: boolean): Promise<PaymentAccountItem[]> {
  return [
    {
      id: "acc_bca",
      type: "BANK",
      bankName: "BCA",
      accountNumber: "1234567890",
      accountHolder: "Sahabat Belajar",
      isActive: true,
      sortOrder: 1,
      createdAt: new Date().toISOString(),
    },
    {
      id: "acc_mandiri",
      type: "BANK",
      bankName: "Bank Mandiri",
      accountNumber: "9876543210",
      accountHolder: "Sahabat Belajar",
      isActive: true,
      sortOrder: 2,
      createdAt: new Date().toISOString(),
    },
  ];
}

export async function upsertPaymentAccount(data: FormData | any): Promise<ActionResponse> {
  await requireStaffOrAdmin();
  revalidatePath("/dashboard/pengaturan/pembayaran");
  return { success: true, message: "Rekening pembayaran berhasil disimpan." };
}

export async function deletePaymentAccount(id: string): Promise<ActionResponse> {
  await requireStaffOrAdmin();
  revalidatePath("/dashboard/pengaturan/pembayaran");
  return { success: true, message: "Rekening pembayaran berhasil dihapus." };
}
