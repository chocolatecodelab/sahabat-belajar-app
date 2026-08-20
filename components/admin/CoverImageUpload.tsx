"use client";

import { useState, useCallback } from "react";
import { Upload, X, ImageIcon } from "lucide-react";

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
      } catch (error) {
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
      <div className="relative group rounded-xl overflow-hidden border" style={{ borderColor: "var(--color-outline-variant)" }}>
        <img
          src={value}
          alt="Cover image"
          className="w-full h-52 object-cover"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <label
            className="px-4 py-2 rounded-lg text-white text-sm font-medium cursor-pointer transition-colors"
            style={{ background: "var(--color-primary)" }}
          >
            Ganti
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
            className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 px-3 py-2 text-label-md truncate"
          style={{
            background: "rgba(0,0,0,0.5)",
            color: "white",
          }}
        >
          {value.split("/").pop()}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl transition-all cursor-pointer ${
        dragActive ? "border-[var(--color-primary)] bg-[var(--color-primary-fixed)]" : ""
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
      <label className="flex flex-col items-center justify-center py-12 px-6 cursor-pointer">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInput}
          disabled={uploading}
        />
        {uploading ? (
          <>
            <div
              className="w-10 h-10 border-3 border-t-transparent rounded-full animate-spin mb-3"
              style={{ borderColor: "var(--color-primary)" }}
            />
            <p
              className="text-body-sm"
              style={{ color: "var(--color-on-surface-variant)" }}
            >
              Mengupload...
            </p>
          </>
        ) : (
          <>
            <div
              className="p-3 rounded-xl mb-3"
              style={{
                background: "var(--color-surface-container)",
                color: "var(--color-outline)",
              }}
            >
              <ImageIcon size={28} />
            </div>
            <p
              className="text-body-md font-medium mb-1"
              style={{ color: "var(--color-on-surface)" }}
            >
              {dragActive
                ? "Lepas gambar di sini"
                : "Klik atau drag gambar ke sini"}
            </p>
            <p
              className="text-body-sm"
              style={{ color: "var(--color-outline)" }}
            >
              Rekomendasi: 1200×630px (JPG, PNG, WebP, maks 5MB)
            </p>
          </>
        )}
      </label>
    </div>
  );
}
