import { NextRequest, NextResponse } from "next/server";
import { processOmnichannelMessage } from "@/actions/support";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages || [];
    const senderName = body.senderName || "Pengunjung Website";
    const senderPhone = body.senderPhone || "628000000000";
    const senderEmail = body.senderEmail || undefined;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, message: "Daftar pesan percakapan diperlukan" },
        { status: 400 }
      );
    }

    const lastMessage = messages[messages.length - 1];
    const userText = lastMessage?.role === "user" ? lastMessage.content : "";
    const history = messages.slice(0, -1);

    const result = await processOmnichannelMessage({
      source: "WEB_CHAT",
      senderName,
      senderPhone,
      senderEmail,
      message: userText,
      history,
    });

    return NextResponse.json({
      success: true,
      data: {
        reply: result.reply,
        handledBy: result.handledBy,
        ticketNumber: result.ticketNumber,
        recommendedCourses: result.recommendedCourses || [],
        suggestedQuestions: result.suggestedQuestions || [],
      },
    });
  } catch (error: any) {
    console.error("AI Counselor API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Terjadi kesalahan internal pada asisten AI",
      },
      { status: 500 }
    );
  }
}

