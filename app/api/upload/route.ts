import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";
import { UPLOAD_MAX_SIZE, UPLOAD_ALLOWED_TYPES } from "@/lib/constants";

// Whitelist of valid upload folders to prevent directory traversal
const ALLOWED_FOLDERS = [
  "general",
  "articles",
  "courses",
  "avatars",
  "payments",
  "modules",
  "submissions",
];

// Strict image MIME types allowed for public payment proof receipts
const PAYMENT_PROOF_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    let folder = (formData.get("folder") as string) || "general";

    // Sanitize folder name
    folder = folder.replace(/[^a-zA-Z0-9-_]/g, "").toLowerCase();
    if (!ALLOWED_FOLDERS.includes(folder)) {
      folder = "general";
    }

    // Authentication Check:
    // Public guest registrants are permitted to upload ONLY to the "payments" folder for checkout transfer receipts.
    // All other folders (general, articles, courses, avatars, etc.) strictly require an active authenticated session.
    const isPaymentReceipt = folder === "payments";
    if (!isPaymentReceipt) {
      const session = await auth();
      if (!session?.user) {
        return NextResponse.json(
          { error: "Unauthorized: Silakan masuk untuk mengunggah media" },
          { status: 401 }
        );
      }
    }

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > UPLOAD_MAX_SIZE) {
      return NextResponse.json(
        { error: "Ukuran berkas melebihi batas maksimal 5MB" },
        { status: 400 }
      );
    }

    // Type validation
    const allowedTypes = isPaymentReceipt
      ? PAYMENT_PROOF_ALLOWED_TYPES
      : UPLOAD_ALLOWED_TYPES;

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: isPaymentReceipt
            ? "Format bukti pembayaran harus berupa gambar (JPG, PNG, atau WebP)"
            : "Tipe berkas tidak diizinkan",
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate safe unique filename
    const ext = path.extname(file.name).toLowerCase();
    const nameWithoutExt = path.basename(file.name, ext);
    const sanitizedName = nameWithoutExt
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .toLowerCase();
    const uniqueName = `${sanitizedName}-${Date.now()}${ext}`;

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
    await mkdir(uploadDir, { recursive: true });

    // Write file
    const filePath = path.join(uploadDir, uniqueName);
    await writeFile(filePath, buffer);

    // Return the public URL
    const url = `/uploads/${folder}/${uniqueName}`;

    // TinyMCE and public clients expect { url, location: "..." } format
    return NextResponse.json({ url, location: url, success: true });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Upload failed" },
      { status: 500 }
    );
  }
}
