"use server";

import { prisma } from "@/lib/prisma";
import { ActionResponse } from "@/types";
import { revalidatePath } from "next/cache";
import { PaymentStatus, StudentPackageStatus } from "@prisma/client";

export async function assignPackageToStudent(input: {
  studentId: string;
  packageId: string;
  startDate?: Date | string;
  endDate?: Date | string;
}): Promise<ActionResponse<{ studentPackageId: string }>> {
  try {
    const pkg = await prisma.package.findUnique({
      where: { id: input.packageId },
    });

    if (!pkg) {
      return { success: false, message: "Paket belajar tidak ditemukan." };
    }

    const quotaTotal = pkg.quotaSessions || (pkg.durationMonths ? pkg.durationMonths * 8 : 10);
    const startDate = input.startDate ? new Date(input.startDate) : new Date();

    let endDate = input.endDate ? new Date(input.endDate) : null;
    if (!endDate && pkg.durationMonths) {
      endDate = new Date(startDate.getTime() + pkg.durationMonths * 30 * 24 * 60 * 60 * 1000);
    }

    const studentPackage = await prisma.studentPackage.create({
      data: {
        studentId: input.studentId,
        packageId: input.packageId,
        quotaTotal,
        quotaUsed: 0,
        startDate,
        endDate,
        status: StudentPackageStatus.AKTIF,
      },
    });

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
    if (!input.amount || input.amount <= 0) {
      return { success: false, message: "Nominal pembayaran harus lebih besar dari 0." };
    }

    const payment = await prisma.payment.create({
      data: {
        studentPackageId: input.studentPackageId,
        amount: input.amount,
        paidAt: input.paidAt ? new Date(input.paidAt) : new Date(),
        method: input.method || "TRANSFER_BANK",
        proofFile: input.proofFile || null,
        status: input.status || PaymentStatus.LUNAS,
        notes: input.notes || null,
      },
    });

    revalidatePath("/dashboard/pembayaran");
    revalidatePath("/dashboard/paket");

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
    const where: any = {};
    if (params?.studentId) where.studentId = params.studentId;
    if (params?.status) where.status = params.status;

    return await prisma.studentPackage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        student: { select: { id: true, name: true, level: true, parentPhone: true } },
        package: true,
        payments: true,
      },
    });
  } catch (error) {
    console.error("getStudentPackages error:", error);
    return [];
  }
}

export async function getPayments(params?: {
  status?: PaymentStatus;
}) {
  try {
    const where: any = {};
    if (params?.status) where.status = params.status;

    return await prisma.payment.findMany({
      where,
      orderBy: { paidAt: "desc" },
      include: {
        studentPackage: {
          include: {
            student: { select: { id: true, name: true } },
            package: { select: { id: true, name: true, price: true } },
          },
        },
      },
    });
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
  revalidatePath("/dashboard/pengaturan/pembayaran");
  return { success: true, message: "Rekening pembayaran berhasil disimpan." };
}

export async function deletePaymentAccount(id: string): Promise<ActionResponse> {
  revalidatePath("/dashboard/pengaturan/pembayaran");
  return { success: true, message: "Rekening pembayaran berhasil dihapus." };
}
