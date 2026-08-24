"use client";

import { useState, useCallback } from "react";
import { Upload, X, ImageIcon, FolderOpen } from "lucide-react";
import MediaPickerModal from "@/components/admin/MediaPickerModal";

interface CoverImageUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
}

export default function CoverImageUpload({
  value,
  onChange,
  folder = "covers",
}: CoverImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleUpload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        alert("File harus berupa gambar");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran file maksimal 5MB");
        return;
      }

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Upload gagal");

        const data = await res.json();
        onChange(data.url);
      } catch {
        alert("Gagal mengupload gambar");
      } finally {
        setUploading(false);
      }
    },
    [folder, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) handleUpload(file);
    },
    [handleUpload]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  if (value) {
    return (
      <div className="space-y-2">
        <div className="relative group rounded-xl overflow-hidden border bg-slate-100" style={{ borderColor: "var(--color-outline-variant)" }}>
          <img
            src={value}
            alt="Cover image"
            className="w-full h-52 object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="px-3.5 py-2 rounded-lg text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              style={{ background: "var(--color-primary)" }}
            >
              <FolderOpen size={14} /> Pilih dari Galeri
            </button>
            <label
              className="px-3.5 py-2 rounded-lg text-white text-xs font-bold cursor-pointer transition-all bg-white/20 hover:bg-white/30 border border-white/30 flex items-center gap-1.5"
            >
              <Upload size={14} /> Unggah Baru
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileInput}
              />
            </label>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
              title="Hapus gambar"
            >
              <X size={16} />
            </button>
          </div>
          <div
            className="absolute bottom-0 left-0 right-0 px-3 py-1.5 text-2xs truncate"
            style={{
              background: "rgba(0,0,0,0.6)",
              color: "white",
            }}
          >
            {value.split("/").pop()}
          </div>
        </div>

        <MediaPickerModal
          isOpen={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onSelect={(url) => onChange(url)}
          defaultFolder={folder}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div
        className={`relative border-2 border-dashed rounded-xl transition-all ${
          dragActive ? "border-[var(--color-primary)] bg-[var(--color-surface-container-low)]" : "bg-slate-50/50 hover:bg-slate-50"
        }`}
        style={{
          borderColor: dragActive
            ? "var(--color-primary)"
            : "var(--color-outline-variant)",
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center py-8 px-6 text-center">
          {uploading ? (
            <>
              <div
                className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin mb-3"
                style={{ borderColor: "var(--color-primary)" }}
              />
              <p
                className="text-body-sm font-semibold"
                style={{ color: "var(--color-on-surface-variant)" }}
              >
                Mengupload gambar...
              </p>
            </>
          ) : (
            <>
              <div
                className="p-3 rounded-xl mb-2.5"
                style={{
                  background: "var(--color-surface-container)",
                  color: "var(--color-primary)",
                }}
              >
                <ImageIcon size={26} />
              </div>
              <p
                className="text-body-sm font-bold mb-1"
                style={{ color: "var(--color-on-surface)" }}
              >
                {dragActive
                  ? "Lepas gambar di sini"
                  : "Tarik gambar ke sini atau pilih metode di bawah"}
              </p>
              <p
                className="text-2xs mb-4"
                style={{ color: "var(--color-outline)" }}
              >
                Format JPG, PNG, WebP (Maksimal 5MB)
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="px-3.5 py-2 rounded-lg text-label-md font-bold text-white shadow-xs flex items-center gap-1.5 transition-all hover:opacity-90"
                  style={{ background: "var(--color-primary)" }}
                >
                  <FolderOpen size={14} />
                  Pilih dari Pustaka Media
                </button>

                <label className="px-3.5 py-2 rounded-lg border text-label-md font-bold text-gray-700 bg-white hover:bg-slate-50 cursor-pointer shadow-2xs flex items-center gap-1.5 transition-all" style={{ borderColor: "var(--color-outline-variant)" }}>
                  <Upload size={14} />
                  Unggah File Baru
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileInput}
                    disabled={uploading}
                  />
                </label>
              </div>
            </>
          )}
        </div>
      </div>

      <MediaPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => onChange(url)}
        defaultFolder={folder}
      />
    </div>
  );
}
