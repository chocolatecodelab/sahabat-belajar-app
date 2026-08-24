import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  generateArticleSEO,
  suggestTitles,
  polishAcademicTone,
  generateArticleOutline,
} from "@/lib/ai";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Silakan login terlebih dahulu" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { action, title, content, text, topic, keywords } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: "Parameter 'action' diperlukan" },
        { status: 400 }
      );
    }

    switch (action) {
      case "seo": {
        if (!title && !content) {
          return NextResponse.json(
            { success: false, error: "Judul atau konten artikel harus diisi terlebih dahulu" },
            { status: 400 }
          );
        }
        const result = await generateArticleSEO(title || "", content || "");
        return NextResponse.json(result);
      }

      case "titles": {
        if (!title && !content) {
          return NextResponse.json(
            { success: false, error: "Tuliskan judul sementara atau konten artikel terlebih dahulu" },
            { status: 400 }
          );
        }
        const result = await suggestTitles(content || "", title || "");
        return NextResponse.json(result);
      }

      case "polish": {
        if (!text || text.trim().length === 0) {
          return NextResponse.json(
            { success: false, error: "Teks untuk dipoles tidak boleh kosong" },
            { status: 400 }
          );
        }
        const result = await polishAcademicTone(text);
        return NextResponse.json(result);
      }

      case "outline": {
        if (!topic || topic.trim().length === 0) {
          return NextResponse.json(
            { success: false, error: "Topik outline artikel tidak boleh kosong" },
            { status: 400 }
          );
        }
        const result = await generateArticleOutline(topic, keywords);
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json(
          { success: false, error: `Action '${action}' tidak dikenali` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("AI Assistant API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Terjadi kesalahan internal saat memproses AI",
      },
      { status: 500 }
    );
  }
}
