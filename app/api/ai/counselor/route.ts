import { NextRequest, NextResponse } from "next/server";
import { getCourses, type CourseItem } from "@/actions/kursus";
import { callGeminiCounselor } from "@/lib/ai";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages || [];

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, message: "Daftar pesan percakapan diperlukan" },
        { status: 400 }
      );
    }

    // 1. Fetch all active courses directly from database
    const activeCourses = await getCourses({ activeOnly: true });

    // 2. Format courses context for Gemini
    const coursesContext = activeCourses
      .map((c, idx) => {
        const basePrice = c.salePrice !== null && c.salePrice !== undefined ? c.salePrice : c.price;
        const discountText = c.salePrice ? `(Diskon Promo dari Rp ${c.price.toLocaleString("id-ID")})` : "";
        let curriculumItems = "";
        try {
          if (c.curriculum) {
            const arr = JSON.parse(c.curriculum);
            if (Array.isArray(arr)) {
              curriculumItems = arr.slice(0, 4).join("; ");
            }
          }
        } catch {
          curriculumItems = "";
        }

        return `[PROGRAM #${idx + 1}]
- SLUG: ${c.slug}
- Judul: ${c.title}
- Kategori: ${c.category}
- Biaya Investasi: ${c.isFree ? "GRATIS" : `Rp ${basePrice.toLocaleString("id-ID")} ${discountText}`}
- Jadwal Batch: ${c.batchNumber || "Batch Baru"} (Mulai ${c.startDate || "Fleksibel"}, Durasi ${c.duration || "4 Minggu"})
- Mentor: ${c.mentorName} (${c.mentorTitle})
- Tagline: ${c.tagline || ""}
- Silabus Materi: ${curriculumItems || c.description.slice(0, 160)}`;
      })
      .join("\n\n");

    // 3. Call Gemini AI with system instruction & context
    const aiResult = await callGeminiCounselor(messages, coursesContext);

    if (!aiResult.success || !aiResult.data) {
      return NextResponse.json(
        { success: false, message: aiResult.error || "Gagal memproses konsultasi AI" },
        { status: 500 }
      );
    }

    // 4. Enrich recommended courses with full UI objects
    const recommendedSlugs = aiResult.data.recommendedCourseSlugs || [];
    const recommendedCourses: CourseItem[] = [];

    recommendedSlugs.forEach((slug: string) => {
      const match = activeCourses.find(
        (c) => c.slug.toLowerCase() === slug.toLowerCase() || slug.toLowerCase().includes(c.slug.toLowerCase())
      );
      if (match && !recommendedCourses.some((item) => item.id === match.id)) {
        recommendedCourses.push(match);
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        reply: aiResult.data.reply,
        recommendedCourses,
        suggestedQuestions: aiResult.data.suggestedQuestions || [],
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
