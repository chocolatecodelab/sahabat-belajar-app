"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { auth, requirePermission } from "@/lib/auth";
import type { ActionResponse } from "@/types";
import { writeFile, unlink, readdir, stat, mkdir } from "fs/promises";
import path from "path";
import { UPLOAD_MAX_SIZE, UPLOAD_ALLOWED_TYPES } from "@/lib/constants";

export type MediaItem = {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  folder: string;
  uploadedById?: string | null;
  uploadedBy?: { name: string } | null;
  createdAt: string;
  updatedAt: string;
};

/**
 * Scan public/uploads directory and index any existing files into MediaFile table
 */
export async function syncExistingUploads(): Promise<void> {
  try {
    const baseUploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(baseUploadsDir, { recursive: true });

    const folders = await readdir(baseUploadsDir, { withFileTypes: true });

    for (const folderDirent of folders) {
      if (!folderDirent.isDirectory()) continue;
      const folderName = folderDirent.name;
      const folderPath = path.join(baseUploadsDir, folderName);
      const files = await readdir(folderPath, { withFileTypes: true });

      for (const fileDirent of files) {
        if (!fileDirent.isFile()) continue;
        const filename = fileDirent.name;
        const filePath = path.join(folderPath, filename);
        const fileStat = await stat(filePath);

        const url = `/uploads/${folderName}/${filename}`;
        const ext = path.extname(filename).toLowerCase();
        
        // Skip non-media configuration/manifest files
        if (ext === ".webmanifest" || ext === ".map" || ext === ".json") continue;

        let mimeType = "image/jpeg";
        if (ext === ".png") mimeType = "image/png";
        else if (ext === ".webp") mimeType = "image/webp";
        else if (ext === ".gif") mimeType = "image/gif";
        else if (ext === ".svg") mimeType = "image/svg+xml";
        else if (ext === ".pdf") mimeType = "application/pdf";
        else if (ext === ".ico") mimeType = "image/x-icon";

        // Check if already indexed
        const { data: existing } = await supabaseAdmin
          .from("MediaFile")
          .select("id")
          .eq("url", url)
          .maybeSingle();

        if (!existing) {
          await supabaseAdmin.from("MediaFile").insert({
            id: `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            filename: filename,
            originalName: filename,
            url: url,
            mimeType: mimeType,
            size: fileStat.size,
            folder: folderName,
            createdAt: fileStat.birthtime.toISOString(),
            updatedAt: fileStat.mtime.toISOString(),
          });
        }
      }
    }
  } catch (err) {
    console.error("Auto sync existing uploads error:", err);
  }
}

/**
 * Get media files with filtering, search, and pagination
 */
export async function getMediaFiles(params?: {
  folder?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: MediaItem[]; total: number; folders: string[] }> {
  try {
    // Run sync on load if needed
    await syncExistingUploads();

    const folder = params?.folder && params.folder !== "all" ? params.folder : undefined;
    const search = params?.search?.trim();
    const page = params?.page || 1;
    const limit = params?.limit || 24;
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from("MediaFile")
      .select("*, uploadedBy:User(name)", { count: "exact" });

    if (folder) {
      query = query.eq("folder", folder);
    }

    if (search) {
      query = query.or(`originalName.ilike.%${search}%,filename.ilike.%${search}%`);
    }

    const { data, count, error } = await query
      .order("createdAt", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching media files:", error);
      return { data: [], total: 0, folders: [] };
    }

    // Get unique folders list
    const { data: folderData } = await supabaseAdmin
      .from("MediaFile")
      .select("folder");
    
    const uniqueFolders = Array.from(
      new Set((folderData || []).map((f: any) => f.folder).filter(Boolean))
    );

    return {
      data: (data || []).map((item: any) => ({
        ...item,
        uploadedBy: Array.isArray(item.uploadedBy) ? item.uploadedBy[0] : item.uploadedBy,
      })),
      total: count || 0,
      folders: uniqueFolders.length > 0 ? uniqueFolders : ["covers", "pages", "general", "avatars"],
    };
  } catch (error) {
    console.error("getMediaFiles error:", error);
    return { data: [], total: 0, folders: [] };
  }
}

/**
 * Upload a media file directly through Server Action
 */
export async function uploadMediaFile(formData: FormData): Promise<ActionResponse<MediaItem>> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "general";

    if (!file) {
      return { success: false, message: "Pilih file yang ingin diunggah" };
    }

    if (file.size > UPLOAD_MAX_SIZE) {
      return { success: false, message: "Ukuran file melebihi batas maksimal 5MB" };
    }

    if (!UPLOAD_ALLOWED_TYPES.includes(file.type)) {
      return { success: false, message: `Format file ${file.type} tidak didukung` };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Clean & unique filename
    const ext = path.extname(file.name);
    const nameWithoutExt = path.basename(file.name, ext);
    const sanitizedName = nameWithoutExt
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .toLowerCase();
    const uniqueName = `${sanitizedName}-${Date.now()}${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, uniqueName);
    await writeFile(filePath, buffer);

    const url = `/uploads/${folder}/${uniqueName}`;
    const id = `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const { data: mediaRecord, error } = await supabaseAdmin
      .from("MediaFile")
      .insert({
        id,
        filename: uniqueName,
        originalName: file.name,
        url,
        mimeType: file.type,
        size: file.size,
        folder,
        uploadedById: session.user.id || null,
      })
      .select("*, uploadedBy:User(name)")
      .single();

    if (error) {
      console.error("Database insert error for MediaFile:", error);
    }

    revalidatePath("/dashboard/media");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "File berhasil diunggah ke pustaka media",
      data: mediaRecord || {
        id,
        filename: uniqueName,
        originalName: file.name,
        url,
        mimeType: file.type,
        size: file.size,
        folder,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
  } catch (error: any) {
    console.error("uploadMediaFile error:", error);
    return { success: false, message: error?.message || "Gagal mengunggah file" };
  }
}

/**
 * Delete a media file from disk and database
 */
export async function deleteMediaFile(id: string): Promise<ActionResponse> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, message: "Unauthorized: Silakan login terlebih dahulu" };
  }

  try {
    const { data: media, error } = await supabaseAdmin
      .from("MediaFile")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !media) {
      return { success: false, message: "File media tidak ditemukan" };
    }

    // Delete physical file from disk
    try {
      const filePath = path.join(process.cwd(), "public", media.url);
      await unlink(filePath);
    } catch (fsErr) {
      console.warn("Could not delete physical file:", fsErr);
    }

    // Delete record from database
    await supabaseAdmin.from("MediaFile").delete().eq("id", id);

    revalidatePath("/dashboard/media");
    return { success: true, message: "File media berhasil dihapus" };
  } catch (error: any) {
    console.error("deleteMediaFile error:", error);
    return { success: false, message: "Gagal menghapus file media" };
  }
}
