"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { ActionResponse } from "@/types";
import { revalidatePath } from "next/cache";
import { PaymentStatus, StudentPackageStatus } from "@prisma/client";
import { requireStaffOrAdmin } from "@/lib/auth";
import { notifyPackagePaymentVerified } from "@/lib/notifications";
import { logActivity } from "@/lib/audit";
import fs from "fs/promises";
import path from "path";

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

export async function updatePaymentStatus(
  paymentId: string,
  status: PaymentStatus,
  notes?: string
): Promise<ActionResponse> {
  try {
    const session = await requireStaffOrAdmin();
    if (!paymentId) {
      return { success: false, message: "ID pembayaran tidak valid." };
    }

    const { data: existingPayment, error: fetchErr } = await supabaseAdmin
      .from("Payment")
      .select(`
        *,
        studentPackage:StudentPackage(
          id,
          quotaTotal,
          student:Student(name, parentPhone),
          package:Package(name)
        )
      `)
      .eq("id", paymentId)
      .maybeSingle();

    if (fetchErr || !existingPayment) {
      return { success: false, message: "Data pembayaran tidak ditemukan." };
    }

    let finalNotes = notes !== undefined ? notes : existingPayment.notes || null;
    if (status === "LUNAS" && typeof finalNotes === "string") {
      finalNotes = finalNotes.includes("[MENUNGGU VERIFIKASI]")
        ? finalNotes.replace("[MENUNGGU VERIFIKASI]", "[TERVERIFIKASI ADMIN]").trim()
        : finalNotes;
    }

    const now = new Date().toISOString();
    const { error: updateErr } = await supabaseAdmin
      .from("Payment")
      .update({
        status,
        notes: finalNotes,
        updatedAt: now,
      })
      .eq("id", paymentId);

    if (updateErr) throw updateErr;

    const spDetail: any = Array.isArray(existingPayment.studentPackage)
      ? existingPayment.studentPackage[0]
      : existingPayment.studentPackage;
    const studentObj: any = Array.isArray(spDetail?.student)
      ? spDetail.student[0]
      : spDetail?.student;
    const packageObj: any = Array.isArray(spDetail?.package)
      ? spDetail.package[0]
      : spDetail?.package;

    if (status === "LUNAS") {
      try {
        await notifyPackagePaymentVerified({
          paymentId,
          studentName: studentObj?.name || "Siswa Sahabat Belajar",
          parentPhone: studentObj?.parentPhone || null,
          packageName: packageObj?.name || "Paket Bimbingan Belajar",
          amount: existingPayment.amount || 0,
          method: existingPayment.method || "TRANSFER_BANK",
          status: "LUNAS",
          quotaTotal: spDetail?.quotaTotal,
        });
      } catch (notifErr) {
        console.error("updatePaymentStatus notification error:", notifErr);
      }
    }

    await logActivity({
      actorName: session?.user?.name || "Staf/Admin",
      actorRole: (session?.user as any)?.role || "Admin",
      action: "STATUS_CHANGE",
      entity: "Pembayaran",
      targetId: paymentId,
      targetName: `${studentObj?.name || "Siswa"} — ${packageObj?.name || "Paket"}`,
      details: `Mengubah status pembayaran Rp ${(existingPayment.amount || 0).toLocaleString("id-ID")} dari ${existingPayment.status} menjadi ${status}.`,
    });

    revalidatePath("/dashboard/pembayaran");
    revalidatePath("/dashboard/paket");
    revalidatePath("/dashboard");
    revalidatePath("/portal");

    return {
      success: true,
      message:
        status === "LUNAS"
          ? "Pembayaran berhasil diverifikasi LUNAS dan notifikasi telah dikirim."
          : `Status pembayaran diperbarui menjadi ${status}.`,
    };
  } catch (error: any) {
    console.error("updatePaymentStatus error:", error);
    return {
      success: false,
      message: error?.message || "Gagal memperbarui status pembayaran.",
    };
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
          package:Package(id, name, price, program:Program(id, name))
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
// PAYMENT ACCOUNT SETTINGS HELPERS (PERSISTENT DATA STORE)
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

const ACCOUNTS_FILE = path.join(process.cwd(), "data", "payment_accounts.json");

const DEFAULT_ACCOUNTS: PaymentAccountItem[] = [
  {
    id: "acc_bca",
    type: "BANK",
    bankName: "Bank Central Asia (BCA)",
    accountNumber: "123-456-7890",
    accountHolder: "Sahabat Belajar",
    qrisImage: null,
    instructions: "Transfer tepat sesuai nominal tagihan hingga 3 digit terakhir untuk verifikasi otomatis.",
    isActive: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "acc_mandiri",
    type: "BANK",
    bankName: "Bank Mandiri",
    accountNumber: "137-00-1234567-8",
    accountHolder: "Sahabat Belajar",
    qrisImage: null,
    instructions: "Transfer ke rekening operasional resmi a.n. Sahabat Belajar.",
    isActive: true,
    sortOrder: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: "acc_bsi",
    type: "BANK",
    bankName: "Bank Syariah Indonesia (BSI)",
    accountNumber: "712-3456-789",
    accountHolder: "Sahabat Belajar",
    qrisImage: null,
    instructions: "Transfer melalui ATM, BSI Mobile, atau transfer antarbank berstandar syariah.",
    isActive: true,
    sortOrder: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: "acc_qris",
    type: "QRIS",
    bankName: "QRIS Sahabat Belajar",
    accountNumber: null,
    accountHolder: "Sahabat Belajar",
    qrisImage: "/images/qris-placeholder.png",
    instructions: "Scan barcode QRIS resmi dengan GoPay, OVO, Dana, ShopeePay, BCA Mobile, Livin, atau m-Banking apa pun.",
    isActive: true,
    sortOrder: 4,
    createdAt: new Date().toISOString(),
  },
];

async function readAccountsFromFile(): Promise<PaymentAccountItem[]> {
  try {
    const raw = await fs.readFile(ACCOUNTS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {}
  return DEFAULT_ACCOUNTS;
}

async function writeAccountsToFile(accounts: PaymentAccountItem[]): Promise<void> {
  try {
    await fs.mkdir(path.dirname(ACCOUNTS_FILE), { recursive: true });
    await fs.writeFile(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write payment_accounts.json:", err);
  }
}

export async function getPaymentAccounts(activeOnly?: boolean): Promise<PaymentAccountItem[]> {
  try {
    // 1. Try reading from Supabase if table exists
    const { data, error } = await supabaseAdmin
      .from("PaymentAccount")
      .select("*")
      .order("sortOrder", { ascending: true });

    let list: PaymentAccountItem[] = [];
    if (!error && Array.isArray(data) && data.length > 0) {
      list = data;
    } else {
      list = await readAccountsFromFile();
    }

    if (activeOnly) {
      list = list.filter((item) => item.isActive !== false);
    }

    return list.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  } catch (error) {
    console.warn("getPaymentAccounts falling back to local file:", error);
    const list = await readAccountsFromFile();
    if (activeOnly) {
      return list.filter((item) => item.isActive !== false);
    }
    return list;
  }
}

export async function upsertPaymentAccount(data: FormData | any): Promise<ActionResponse> {
  try {
    await requireStaffOrAdmin();

    let payload: Partial<PaymentAccountItem> = {};
    if (data instanceof FormData) {
      const id = data.get("id") as string;
      const type = (data.get("type") as string) || "BANK";
      const bankName = (data.get("bankName") as string) || "";
      const accountNumber = data.get("accountNumber") as string;
      const accountHolder = data.get("accountHolder") as string;
      const qrisImage = data.get("qrisImage") as string;
      const instructions = data.get("instructions") as string;
      const isActiveStr = data.get("isActive") as string;
      const sortOrderStr = data.get("sortOrder") as string;

      payload = {
        id: id || undefined,
        type,
        bankName,
        accountNumber: accountNumber || null,
        accountHolder: accountHolder || null,
        qrisImage: qrisImage || null,
        instructions: instructions || null,
        isActive: isActiveStr !== "false",
        sortOrder: sortOrderStr ? parseInt(sortOrderStr, 10) : undefined,
      };
    } else {
      payload = { ...data };
    }

    if (!payload.bankName?.trim()) {
      return { success: false, message: "Nama metode atau bank wajib diisi." };
    }

    const currentAccounts = await readAccountsFromFile();
    const now = new Date().toISOString();

    let updatedAccounts: PaymentAccountItem[];
    if (payload.id) {
      const idx = currentAccounts.findIndex((a) => a.id === payload.id);
      if (idx !== -1) {
        currentAccounts[idx] = {
          ...currentAccounts[idx],
          ...payload,
          updatedAt: now,
        } as PaymentAccountItem;
        updatedAccounts = [...currentAccounts];
      } else {
        const newItem: PaymentAccountItem = {
          id: payload.id,
          type: payload.type || "BANK",
          bankName: payload.bankName,
          accountNumber: payload.accountNumber || null,
          accountHolder: payload.accountHolder || null,
          qrisImage: payload.qrisImage || null,
          instructions: payload.instructions || null,
          isActive: payload.isActive ?? true,
          sortOrder: payload.sortOrder || currentAccounts.length + 1,
          createdAt: now,
          updatedAt: now,
        };
        updatedAccounts = [...currentAccounts, newItem];
      }
    } else {
      const newId = `acc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newItem: PaymentAccountItem = {
        id: newId,
        type: payload.type || "BANK",
        bankName: payload.bankName,
        accountNumber: payload.accountNumber || null,
        accountHolder: payload.accountHolder || null,
        qrisImage: payload.qrisImage || null,
        instructions: payload.instructions || null,
        isActive: payload.isActive ?? true,
        sortOrder: payload.sortOrder || currentAccounts.length + 1,
        createdAt: now,
        updatedAt: now,
      };
      updatedAccounts = [...currentAccounts, newItem];
    }

    await writeAccountsToFile(updatedAccounts);

    // Sync to Supabase if table exists
    try {
      const targetItem = updatedAccounts.find((a) => a.id === payload.id) || updatedAccounts[updatedAccounts.length - 1];
      if (targetItem) {
        await supabaseAdmin.from("PaymentAccount").upsert(targetItem, { onConflict: "id" });
      }
    } catch {}

    revalidatePath("/dashboard/pengaturan/pembayaran");
    revalidatePath("/portal");

    return { success: true, message: "Rekening pembayaran berhasil disimpan." };
  } catch (error: any) {
    console.error("upsertPaymentAccount error:", error);
    return { success: false, message: error.message || "Gagal menyimpan rekening pembayaran." };
  }
}

export async function deletePaymentAccount(id: string): Promise<ActionResponse> {
  try {
    await requireStaffOrAdmin();

    const currentAccounts = await readAccountsFromFile();
    const updatedAccounts = currentAccounts.filter((a) => a.id !== id);
    await writeAccountsToFile(updatedAccounts);

    // Sync deletion to Supabase if table exists
    try {
      await supabaseAdmin.from("PaymentAccount").delete().eq("id", id);
    } catch {}

    revalidatePath("/dashboard/pengaturan/pembayaran");
    revalidatePath("/portal");

    return { success: true, message: "Rekening pembayaran berhasil dihapus." };
  } catch (error: any) {
    console.error("deletePaymentAccount error:", error);
    return { success: false, message: error.message || "Gagal menghapus rekening pembayaran." };
  }
}
