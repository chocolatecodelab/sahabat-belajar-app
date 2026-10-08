import { NextRequest, NextResponse } from "next/server";
import { processOmnichannelMessage } from "@/actions/support";
import { sendWhatsApp } from "@/lib/notifications";

export const dynamic = "force-dynamic";

/**
 * GET Webhook Verification (Twilio / Meta / Baileys webhook challenge)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const challenge = searchParams.get("hub.challenge");
  if (challenge) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({
    status: "active",
    service: "BIAS RISTEK WhatsApp Omnichannel Bot Engine",
    mode: "AI + Human in the Loop Handoff",
    timestamp: new Date().toISOString(),
  });
}

/**
 * POST Inbound WhatsApp Webhook (Fonnte / Wablas / Twilio / n8n / Baileys format)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Support standard webhook formats (Fonnte: sender/message, Wablas: phone/message, Custom: senderPhone/message)
    const rawSender =
      body.senderPhone ||
      body.sender ||
      body.phone ||
      body.from ||
      body.wa_id ||
      body.data?.from ||
      "";

    const senderName =
      body.senderName ||
      body.name ||
      body.pushName ||
      body.data?.pushName ||
      "Calon Peserta Riset";

    const message =
      body.message ||
      body.body ||
      body.text ||
      body.data?.message ||
      body.data?.body ||
      "";

    if (!rawSender || !message) {
      return NextResponse.json(
        { success: false, message: "Nomor pengirim dan pesan wajib diisi" },
        { status: 400 }
      );
    }

    // Normalize phone E.164
    let cleanPhone = String(rawSender).replace(/\D/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "62" + cleanPhone.slice(1);
    } else if (!cleanPhone.startsWith("62") && cleanPhone.length > 0) {
      cleanPhone = "62" + cleanPhone;
    }

    // Process via Omnichannel Engine
    const result = await processOmnichannelMessage({
      source: "WHATSAPP",
      senderName,
      senderPhone: cleanPhone,
      message: String(message),
    });

    // 1. If currently in HUMAN_WAITING state: Bot stays silent
    if (result.handledBy === "HUMAN_WAITING") {
      return NextResponse.json({
        success: true,
        action: "SILENT_FOR_HUMAN_HANDOFF",
        message: "Bot dinonaktifkan sementara karena kontak dalam sesi penanganan konsultan manusia.",
        ticketNumber: result.ticketNumber,
      });
    }

    // 2. If escalated just now: Confirmation message was already sent by notification module
    if (result.handledBy === "ESCALATED_TO_HUMAN") {
      return NextResponse.json({
        success: true,
        action: "ESCALATED_TO_HUMAN",
        ticketNumber: result.ticketNumber,
        reply: result.reply,
      });
    }

    // 3. Regular AI FAQ reply
    if (result.handledBy === "AI" && result.reply) {
      await sendWhatsApp(cleanPhone, result.reply, "AI_FAQ_AUTOREPLY", senderName);
      return NextResponse.json({
        success: true,
        action: "AI_REPLIED",
        reply: result.reply,
        recommendedCourses: result.recommendedCourses?.length || 0,
      });
    }

    return NextResponse.json({ success: true, action: "IGNORED" });
  } catch (err: any) {
    console.error("WhatsApp Webhook Error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Webhook processing error" },
      { status: 500 }
    );
  }
}
