import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * Real-time Payment Status Polling Endpoint
 * GET /api/pembayaran/status?inv=INV-202610-XXXX
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const invoiceNumber = searchParams.get("inv");

  if (!invoiceNumber) {
    return NextResponse.json({ error: "Parameter 'inv' diperlukan" }, { status: 400 });
  }

  try {
    const { data: registration, error } = await supabaseAdmin
      .from("CourseRegistration")
      .select("id, invoiceNumber, status, verifiedAt, totalAmount, paymentMethod, course:Course(title, slug)")
      .eq("invoiceNumber", invoiceNumber)
      .maybeSingle();

    if (error || !registration) {
      return NextResponse.json({ error: "Invoice tidak ditemukan" }, { status: 404 });
    }

    const courseData = Array.isArray(registration.course) ? registration.course[0] : registration.course;

    return NextResponse.json({
      success: true,
      invoiceNumber: registration.invoiceNumber,
      status: registration.status,
      isVerified: registration.status === "VERIFIED",
      verifiedAt: registration.verifiedAt,
      totalAmount: registration.totalAmount,
      paymentMethod: registration.paymentMethod,
      courseTitle: courseData?.title,
      courseSlug: courseData?.slug,
      classroomUrl: courseData?.slug ? `/belajar/${courseData.slug}` : "/belajar",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Gagal memeriksa status pembayaran", message: err?.message },
      { status: 500 }
    );
  }
}
