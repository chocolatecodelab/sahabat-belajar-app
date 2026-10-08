"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import type { ActionResponse } from "@/types";
import { notifyHumanHandoffEscalated } from "@/lib/notifications";
import { evaluateHandoffIntent, type HandoffEvaluationResult } from "@/lib/handoff";
import { getCourses, type CourseItem } from "@/actions/kursus";
import { callGeminiCounselor } from "@/lib/ai";

function safeRevalidatePath(pathStr: string) {
  try {
    revalidatePath(pathStr);
  } catch {
    // Non-HTTP context fallback
  }
}

const DATA_DIR = path.join(process.cwd(), "data");
const TICKETS_FILE = path.join(DATA_DIR, "support_tickets.json");

export type SupportTicketItem = {
  id: string;
  ticketNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  source: "WHATSAPP" | "WEB_CHAT";
  category: "KONSULTASI_RISET" | "PENDAFTARAN" | "PEMBAYARAN" | "KOMPLAIN" | "LAINNYA";
  triggerReason: string;
  summary: string;
  lastUserMessage: string;
  conversationLog?: string | null;
  status: "WAITING_ADMIN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  aiHandled: boolean;
  handoffActive: boolean;
  assignedAdminName?: string | null;
  adminNotes?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateTicketInput = {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  source?: "WHATSAPP" | "WEB_CHAT";
  category?: "KONSULTASI_RISET" | "PENDAFTARAN" | "PEMBAYARAN" | "KOMPLAIN" | "LAINNYA";
  triggerReason?: string;
  summary?: string;
  lastUserMessage: string;
  conversationLog?: string;
};

// Default seed ticket for testing
const DEFAULT_TICKETS: SupportTicketItem[] = [
  {
    id: "ticket_seed_01",
    ticketNumber: "TIKET-202610-1082",
    customerName: "dr. Kartika Dewi, Sp.A.",
    customerPhone: "6281298765432",
    customerEmail: "kartika.dewi@fkunair.ac.id",
    source: "WHATSAPP",
    category: "KONSULTASI_RISET",
    triggerReason: "COMPLEX_RESEARCH_TOPIC",
    summary: "Konsultasi penyusunan proposal uji klinis spesifik dan bimbingan Scopus Q1 Kedokteran Tropis.",
    lastUserMessage: "Saya butuh tutor senior bidang uji klinis kedokteran untuk review proposal lolos etik dan target jurnal Q1 Lancet/BMJ.",
    status: "WAITING_ADMIN",
    aiHandled: true,
    handoffActive: true,
    assignedAdminName: null,
    adminNotes: "Telah dihubungi, sedang mencocokkan dengan Prof. Dr. Hendra.",
    resolvedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

async function ensureTicketsFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(TICKETS_FILE);
    } catch {
      await fs.writeFile(TICKETS_FILE, JSON.stringify(DEFAULT_TICKETS, null, 2), "utf-8");
    }
  } catch (err) {
    console.error("ensureTicketsFile error:", err);
  }
}

async function readLocalTickets(): Promise<SupportTicketItem[]> {
  await ensureTicketsFile();
  try {
    const raw = await fs.readFile(TICKETS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return DEFAULT_TICKETS;
  }
}

async function writeLocalTickets(items: SupportTicketItem[]) {
  await ensureTicketsFile();
  await fs.writeFile(TICKETS_FILE, JSON.stringify(items, null, 2), "utf-8");
}

/**
 * 1. Check if Contact currently has active Human Handoff (Silence Bot)
 */
export async function isContactHandoffActive(phoneOrEmail: string): Promise<boolean> {
  const clean = phoneOrEmail.replace(/\D/g, "");
  
  // Try Supabase first
  try {
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabaseAdmin
      .from("SupportTicket")
      .select("id, handoffActive")
      .eq("handoffActive", true)
      .gte("createdAt", twelveHoursAgo)
      .or(`customerPhone.eq.${clean},customerEmail.eq.${phoneOrEmail.toLowerCase()}`)
      .limit(1);

    if (!error && data && data.length > 0) {
      return true;
    }
  } catch {}

  // Local fallback
  const locals = await readLocalTickets();
  const twelveHoursAgoMs = Date.now() - 12 * 60 * 60 * 1000;
  return locals.some((t) => {
    if (!t.handoffActive) return false;
    const isMatchingContact =
      t.customerPhone.replace(/\D/g, "") === clean ||
      (t.customerEmail && t.customerEmail.toLowerCase() === phoneOrEmail.toLowerCase());
    const isRecent = new Date(t.createdAt).getTime() >= twelveHoursAgoMs;
    return isMatchingContact && isRecent;
  });
}

/**
 * 2. Create Support Ticket & Activate Human Handoff
 */
export async function createSupportTicket(
  input: CreateTicketInput
): Promise<ActionResponse<SupportTicketItem>> {
  try {
    if (!input.customerName.trim() || !input.lastUserMessage.trim()) {
      return { success: false, message: "Nama pelanggan dan pesan kendala wajib diisi" };
    }

    // Standardize phone E.164
    let cleanPhone = input.customerPhone.replace(/\D/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "62" + cleanPhone.slice(1);
    } else if (!cleanPhone.startsWith("62") && cleanPhone.length > 0) {
      cleanPhone = "62" + cleanPhone;
    }
    if (!cleanPhone) cleanPhone = "628000000000";

    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `TIKET-${yearMonth}-${randomSuffix}`;
    const ticketId = `ticket_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newTicket: SupportTicketItem = {
      id: ticketId,
      ticketNumber,
      customerName: input.customerName.trim(),
      customerPhone: cleanPhone,
      customerEmail: input.customerEmail?.trim().toLowerCase() || null,
      source: input.source || "WHATSAPP",
      category: input.category || "KONSULTASI_RISET",
      triggerReason: input.triggerReason || "KEYWORD_TRIGGER",
      summary: input.summary?.trim() || input.lastUserMessage.slice(0, 140),
      lastUserMessage: input.lastUserMessage.trim(),
      conversationLog: input.conversationLog || null,
      status: "WAITING_ADMIN",
      aiHandled: true,
      handoffActive: true,
      assignedAdminName: null,
      adminNotes: null,
      resolvedAt: null,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    // 1. Try Supabase
    try {
      await supabaseAdmin.from("SupportTicket").insert(newTicket);
    } catch (dbErr) {
      console.warn("Supabase insert SupportTicket fallback to JSON:", dbErr);
    }

    // 2. Persist to local JSON
    const locals = await readLocalTickets();
    locals.unshift(newTicket);
    await writeLocalTickets(locals);

    // 3. Dispatch automated alert via WhatsApp & Email to Admin and Student
    (async () => {
      try {
        await notifyHumanHandoffEscalated({
          ticketNumber: newTicket.ticketNumber,
          customerName: newTicket.customerName,
          customerPhone: newTicket.customerPhone,
          customerEmail: newTicket.customerEmail || undefined,
          source: newTicket.source,
          category: newTicket.category,
          triggerReason: newTicket.triggerReason,
          summary: newTicket.summary,
          lastUserMessage: newTicket.lastUserMessage,
        });
      } catch (notifErr) {
        console.error("notifyHumanHandoffEscalated error:", notifErr);
      }
    })();

    safeRevalidatePath("/dashboard/support");

    return {
      success: true,
      message: `Tiket eskalasi ${ticketNumber} berhasil dibuat. Bot dijeda untuk kontak ini.`,
      data: newTicket,
    };
  } catch (err: any) {
    console.error("createSupportTicket error:", err);
    return {
      success: false,
      message: err.message || "Gagal membuat tiket bantuan",
    };
  }
}

/**
 * 3. Get Support Tickets with Filter & Search (For Admin CS Dashboard)
 */
export async function getSupportTickets(params?: {
  status?: string;
  source?: string;
  search?: string;
}): Promise<SupportTicketItem[]> {
  try {
    let query = supabaseAdmin.from("SupportTicket").select("*").order("createdAt", { ascending: false });
    if (params?.status && params.status !== "ALL") {
      query = query.eq("status", params.status);
    }
    if (params?.source && params.source !== "ALL") {
      query = query.eq("source", params.source);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      let filtered = data as SupportTicketItem[];
      if (params?.search) {
        const s = params.search.toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.customerName.toLowerCase().includes(s) ||
            t.ticketNumber.toLowerCase().includes(s) ||
            t.customerPhone.includes(s) ||
            t.summary.toLowerCase().includes(s)
        );
      }
      return filtered;
    }
  } catch {}

  // Local fallback
  const locals = await readLocalTickets();
  return locals.filter((t) => {
    if (params?.status && params.status !== "ALL" && t.status !== params.status) return false;
    if (params?.source && params.source !== "ALL" && t.source !== params.source) return false;
    if (params?.search) {
      const s = params.search.toLowerCase();
      return (
        t.customerName.toLowerCase().includes(s) ||
        t.ticketNumber.toLowerCase().includes(s) ||
        t.customerPhone.includes(s) ||
        t.summary.toLowerCase().includes(s)
      );
    }
    return true;
  });
}

/**
 * 4. Get Ticket Metrics (KPIs)
 */
export async function getSupportMetrics() {
  const all = await getSupportTickets();
  return {
    waitingAdmin: all.filter((t) => t.status === "WAITING_ADMIN").length,
    inProgress: all.filter((t) => t.status === "IN_PROGRESS").length,
    resolved: all.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED").length,
    activeHandoffs: all.filter((t) => t.handoffActive).length,
    totalTickets: all.length,
  };
}

/**
 * 5. Update Ticket Status & Assign Admin
 */
export async function updateTicketStatus(params: {
  ticketId: string;
  status: "WAITING_ADMIN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  adminNotes?: string;
  adminName?: string;
  deactivateHandoff?: boolean;
}): Promise<ActionResponse<SupportTicketItem>> {
  try {
    const isResolvedOrClosed = params.status === "RESOLVED" || params.status === "CLOSED";
    const handoffActive = params.deactivateHandoff !== undefined ? !params.deactivateHandoff : !isResolvedOrClosed;
    const resolvedAt = isResolvedOrClosed ? new Date().toISOString() : null;
    const updatedAt = new Date().toISOString();

    // 1. Try Supabase
    try {
      await supabaseAdmin
        .from("SupportTicket")
        .update({
          status: params.status,
          adminNotes: params.adminNotes,
          assignedAdminName: params.adminName,
          handoffActive,
          resolvedAt,
          updatedAt,
        })
        .eq("id", params.ticketId);
    } catch {}

    // 2. Local Fallback
    const locals = await readLocalTickets();
    const idx = locals.findIndex((t) => t.id === params.ticketId);
    if (idx !== -1) {
      locals[idx] = {
        ...locals[idx],
        status: params.status,
        adminNotes: params.adminNotes ?? locals[idx].adminNotes,
        assignedAdminName: params.adminName ?? locals[idx].assignedAdminName,
        handoffActive,
        resolvedAt: resolvedAt ?? locals[idx].resolvedAt,
        updatedAt,
      };
      await writeLocalTickets(locals);
      safeRevalidatePath("/dashboard/support");
      return {
        success: true,
        message: `Status tiket ${locals[idx].ticketNumber} diperbarui menjadi ${params.status}`,
        data: locals[idx],
      };
    }

    return { success: false, message: "Tiket tidak ditemukan" };
  } catch (err: any) {
    return { success: false, message: err.message || "Gagal memperbarui tiket" };
  }
}

/**
 * 6. Reactivate AI Auto-Reply (Resume Bot)
 */
export async function reactivateAiBot(ticketId: string): Promise<ActionResponse<SupportTicketItem>> {
  return updateTicketStatus({
    ticketId,
    status: "RESOLVED",
    adminNotes: "Percakapan selesai ditangani staf. Bot AI diaktifkan kembali.",
    deactivateHandoff: true,
  });
}

/**
 * 7. Unified Omnichannel Processor (WhatsApp & Web Chat Engine)
 */
export async function processOmnichannelMessage(params: {
  source: "WHATSAPP" | "WEB_CHAT";
  senderName: string;
  senderPhone: string;
  senderEmail?: string;
  message: string;
  history?: { role: "user" | "assistant"; content: string }[];
}): Promise<{
  handledBy: "AI" | "ESCALATED_TO_HUMAN" | "HUMAN_WAITING";
  reply: string | null;
  ticketNumber?: string;
  recommendedCourses?: CourseItem[];
  suggestedQuestions?: string[];
  evaluation?: HandoffEvaluationResult;
}> {
  const { senderPhone, senderEmail, senderName, message, source, history = [] } = params;

  // STEP 1: Check if contact currently has active handoff
  const isHandoffSilenced = await isContactHandoffActive(senderPhone || senderEmail || "");
  if (isHandoffSilenced) {
    // Bot remains silent so admin can reply directly on WhatsApp
    return {
      handledBy: "HUMAN_WAITING",
      reply: null,
    };
  }

  // STEP 2: Evaluate intent for Human Handoff triggers
  const evalResult = await evaluateHandoffIntent(message, history);

  if (evalResult.shouldHandoff) {
    // Escalation triggered! Create Ticket & Notify Admin
    const ticketRes = await createSupportTicket({
      customerName: senderName || "Pengguna BIAS RISTEK",
      customerPhone: senderPhone,
      customerEmail: senderEmail,
      source,
      category: evalResult.category,
      triggerReason: evalResult.triggerReason,
      summary: evalResult.summary,
      lastUserMessage: message,
      conversationLog: JSON.stringify([...history, { role: "user", content: message }]),
    });

    const ticketNumber = ticketRes.data?.ticketNumber || `TIKET-${Date.now()}`;
    const escalationReply = `Terima kasih, **${senderName || "Bapak/Ibu"}**.\n\nPertanyaan Anda telah kami teruskan langsung ke **Konsultan Akademik Senior BIAS RISTEK** (No. Tiket: \`${ticketNumber}\`).\n\nUntuk memastikan konsultasi naskah dan solusi riset Anda ditangani secara akurat, bot asisten otomatis telah dijeda pada obrolan ini. Staf konsultan kami akan segera merespons Anda secara langsung.`;

    return {
      handledBy: "ESCALATED_TO_HUMAN",
      reply: escalationReply,
      ticketNumber,
      evaluation: evalResult,
      suggestedQuestions: [
        "Hubungi Langsung via WhatsApp Admin",
        "Lihat Silabus Program Kursus",
        "Informasi Jadwal Mentorship"
      ],
    };
  }

  // STEP 3: Standard FAQ flow with AI Counselor
  try {
    const activeCourses = await getCourses({ activeOnly: true });
    const coursesContext = activeCourses
      .map((c, idx) => {
        const basePrice = c.salePrice !== null && c.salePrice !== undefined ? c.salePrice : c.price;
        return `[PROGRAM #${idx + 1}]
- SLUG: ${c.slug}
- Judul: ${c.title}
- Kategori: ${c.category}
- Biaya: ${c.isFree ? "GRATIS" : `Rp ${basePrice.toLocaleString("id-ID")}`}
- Mentor: ${c.mentorName}
- Deskripsi: ${c.description.slice(0, 140)}`;
      })
      .join("\n\n");

    const chatHistory = [...history, { role: "user" as const, content: message }];
    const aiRes = await callGeminiCounselor(chatHistory, coursesContext);

    if (aiRes.success && aiRes.data) {
      const recSlugs = aiRes.data.recommendedCourseSlugs || [];
      const recCourses = activeCourses.filter((c) =>
        recSlugs.some((s: string) => s.toLowerCase() === c.slug.toLowerCase())
      );

      return {
        handledBy: "AI",
        reply: aiRes.data.reply,
        recommendedCourses: recCourses,
        suggestedQuestions: aiRes.data.suggestedQuestions || [],
        evaluation: evalResult,
      };
    }
  } catch (err) {
    console.error("AI Counselor execution error:", err);
  }

  // Fallback
  return {
    handledBy: "AI",
    reply: "Halo! Saya **Dr. Ristek AI**. Untuk bimbingan riset, olah data SmartPLS/SPSS, dan publikasi Scopus, silakan jelaskan kebutuhan Anda atau pilih pertanyaan cepat di bawah ini.",
    suggestedQuestions: [
      "Berapa biaya bimbingan riset?",
      "Apakah ada e-Sertifikat 32 JP?",
      "Bagaimana jadwal konsultasi privat?",
      "Bicara dengan Admin Staf"
    ],
    evaluation: evalResult,
  };
}
