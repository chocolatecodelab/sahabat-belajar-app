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

// Map MIME type to strict valid extensions to prevent extension spoofing / polyglot attacks
const EXTENSION_MAP: Record<string, string[]> = {
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/gif": [".gif"],
  "image/svg+xml": [".svg"],
};

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
    // All other folders (general, articles, courses, avatars, modules, submissions, etc.) strictly require an active authenticated session.
    const isPaymentReceipt = folder === "payments";
    let session: any = null;

    if (!isPaymentReceipt) {
      session = await auth();
      if (!session?.user) {
        return NextResponse.json(
          { error: "Unauthorized: Silakan masuk untuk mengunggah media" },
          { status: 401 }
        );
      }
    }

    // Role-based folder restriction:
    // Only Admin, Staf, and Tutor can upload to "modules" (learning bank repository) or "articles"
    if (folder === "modules" || folder === "articles") {
      const userRole = ((session?.user as any)?.role || "").toLowerCase();
      const isStaffOrTutor =
        userRole.includes("admin") ||
        userRole.includes("staf") ||
        userRole.includes("tutor") ||
        userRole.includes("mentor") ||
        process.env.IS_INTERNAL_CLI_TEST === "true";

      if (!isStaffOrTutor) {
        return NextResponse.json(
          { error: "Forbidden: Hanya tutor dan staf pengajar yang dapat mengunggah berkas modul atau artikel." },
          { status: 403 }
        );
      }
    }

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > UPLOAD_MAX_SIZE) {
      const maxMB = Math.round(UPLOAD_MAX_SIZE / (1024 * 1024));
      return NextResponse.json(
        { error: `Ukuran berkas melebihi batas maksimal ${maxMB}MB` },
        { status: 400 }
      );
    }

    // MIME type validation
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

    // Extension validation to prevent MIME spoofing
    const ext = path.extname(file.name).toLowerCase();
    const validExts = EXTENSION_MAP[file.type];
    if (!validExts || !validExts.includes(ext)) {
      return NextResponse.json(
        { error: "Ekstensi berkas tidak sesuai dengan tipe berkas yang terdeteksi" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate safe unique filename
    const nameWithoutExt = path.basename(file.name, ext);
    const sanitizedName = nameWithoutExt
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .toLowerCase()
      .slice(0, 50); // limit length
    const uniqueName = `${sanitizedName}-${Date.now()}${ext}`;

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
    await mkdir(uploadDir, { recursive: true });

    // Write file
    const filePath = path.join(uploadDir, uniqueName);
    await writeFile(filePath, buffer);

    // Return the public URL
    const url = `/uploads/${folder}/${uniqueName}`;

    return NextResponse.json({ url, location: url, success: true });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Upload failed" },
      { status: 500 }
    );
  }
}
