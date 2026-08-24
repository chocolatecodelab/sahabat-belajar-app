"use client";

import { useState, useEffect, useTransition } from "react";
import {
  X,
  Search,
  Upload,
  Image as ImageIcon,
  Check,
  RefreshCw,
  FolderOpen,
  FileText,
} from "lucide-react";
import Image from "next/image";
import { getMediaFiles, uploadMediaFile, type MediaItem } from "@/actions/media";

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  defaultFolder?: string;
  title?: string;
}

export default function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  defaultFolder,
  title = "Pilih Media dari Galeri",
}: MediaPickerModalProps) {
  const [activeTab, setActiveTab] = useState<"library" | "upload">("library");
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>(defaultFolder || "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [, startTransition] = useTransition();

  const loadMedia = async () => {
    setLoading(true);
    try {
      const res = await getMediaFiles({
        folder: selectedFolder,
        search: searchQuery,
        limit: 40,
      });
      setMediaList(res.data);
      setFolders(res.folders);
    } catch (err) {
      console.error("Failed to load media:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMedia();
    }
  }, [isOpen, selectedFolder, searchQuery]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", defaultFolder || "general");

    const result = await uploadMediaFile(formData);
    if (result.success && result.data) {
      startTransition(() => {
        onSelect(result.data!.url);
        onClose();
      });
    } else {
      setUploadError(result.message || "Gagal mengunggah file");
      setUploading(false);
    }
  };

  const handleConfirmSelect = () => {
    if (!selectedMedia) return;
    onSelect(selectedMedia.url);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in font-[var(--font-body)]">
      <div
        className="elevation-2 rounded-2xl bg-white w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden border shadow-2xl"
        style={{
          borderColor: "var(--color-outline-variant)",
          borderTop: "4px solid var(--color-primary)",
        }}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b flex items-center justify-between" style={{ borderColor: "var(--color-outline-variant)" }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
                color: "var(--color-primary)",
              }}
            >
              <ImageIcon size={20} />
            </div>
            <div>
              <h3 className="font-bold text-headline-sm font-[var(--font-heading)]" style={{ color: "var(--color-on-surface)" }}>
                {title}
              </h3>
              <p className="text-2xs text-gray-500">Pilih gambar yang sudah ada atau unggah yang baru</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher & Search Bar */}
        <div className="px-5 py-3 border-b flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50" style={{ borderColor: "var(--color-outline-variant)" }}>
          {/* Tabs */}
          <div
            className="p-1 rounded-xl flex items-center gap-1 w-full sm:w-auto"
            style={{
              background: "var(--color-surface-container-low)",
              border: "1px solid var(--color-outline-variant)",
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab("library")}
              className={`px-3 py-1.5 rounded-lg text-2xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "library"
                  ? "bg-[var(--color-primary)] text-white shadow-xs"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              <FolderOpen size={13} />
              Galeri Tersimpan
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className={`px-3 py-1.5 rounded-lg text-2xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "upload"
                  ? "bg-[var(--color-primary)] text-white shadow-xs"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              <Upload size={13} />
              Unggah Baru
            </button>
          </div>

          {/* Search & Folder Filter (When in Library tab) */}
          {activeTab === "library" && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border text-2xs font-semibold focus-ring bg-white"
                style={{ borderColor: "var(--color-outline-variant)" }}
              >
                <option value="all">Semua Folder</option>
                {folders.map((f) => (
                  <option key={f} value={f}>
                    📁 {f}
                  </option>
                ))}
              </select>

              <div className="relative flex-1 sm:w-48">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari file..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border text-2xs focus-ring bg-white"
                  style={{ borderColor: "var(--color-outline-variant)" }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 min-h-[300px]">
          {activeTab === "library" ? (
            loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-2">
                <RefreshCw size={24} className="animate-spin text-blue-900" />
                <span className="text-2xs font-medium">Memuat galeri media...</span>
              </div>
            ) : mediaList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
                <ImageIcon size={40} className="text-gray-300" />
                <div className="text-center">
                  <p className="text-body-sm font-semibold text-gray-600">Belum ada media ditemukan</p>
                  <p className="text-2xs text-gray-400 mt-0.5">Unggah gambar baru melalui tab &quot;Unggah Baru&quot;</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3.5">
                {mediaList.map((item) => {
                  const isSelected = selectedMedia?.id === item.id;
                  const isImage = item.mimeType.startsWith("image/");

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedMedia(item)}
                      onDoubleClick={() => {
                        onSelect(item.url);
                        onClose();
                      }}
                      className={`group relative rounded-xl border overflow-hidden cursor-pointer transition-all aspect-square flex flex-col justify-between bg-slate-50 ${
                        isSelected
                          ? "ring-2 ring-[var(--color-primary)] border-transparent shadow-md"
                          : "hover:border-blue-400 hover:shadow-xs"
                      }`}
                      style={{ borderColor: isSelected ? "var(--color-primary)" : "var(--color-outline-variant)" }}
                    >
                      {/* Image Preview / Icon */}
                      <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-100">
                        {isImage ? (
                          <Image
                            src={item.url}
                            alt={item.originalName}
                            fill
                            sizes="160px"
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-gray-500">
                            <FileText size={32} />
                            <span className="text-3xs uppercase font-bold">{item.mimeType.split("/")[1]}</span>
                          </div>
                        )}
                      </div>

                      {/* Selected Badge */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shadow-md">
                          <Check size={14} />
                        </div>
                      )}

                      {/* File Name Label */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 text-white">
                        <p className="text-3xs font-medium truncate">{item.originalName}</p>
                        <span className="text-3xs text-white/70 block">
                          {(item.size / 1024).toFixed(0)} KB
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* Upload Tab */
            <div className="flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed rounded-2xl p-8 bg-slate-50/50 hover:bg-slate-50 transition-colors" style={{ borderColor: "var(--color-outline-variant)" }}>
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-xs"
                style={{
                  background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
                  color: "var(--color-primary)",
                }}
              >
                <Upload size={28} />
              </div>
              <h4 className="text-body-md font-bold text-gray-800">
                Pilih atau Tarik File Gambar ke Sini
              </h4>
              <p className="text-2xs text-gray-500 mt-1 max-w-sm text-center">
                Mendukung format JPG, PNG, WEBP, GIF, SVG, hingga maksimal 5MB
              </p>

              {uploadError && (
                <div className="mt-3 p-2.5 rounded-lg bg-red-50 text-red-700 text-2xs font-semibold">
                  {uploadError}
                </div>
              )}

              <label className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-label-lg font-bold text-white shadow-xs cursor-pointer hover:opacity-90 transition-opacity" style={{ background: "var(--color-primary)" }}>
                {uploading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Mengunggah...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Pilih File dari Komputer
                  </>
                )}
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {activeTab === "library" && (
          <div className="p-4 border-t flex items-center justify-between bg-gray-50" style={{ borderColor: "var(--color-outline-variant)" }}>
            <div className="text-2xs text-gray-500 truncate max-w-xs">
              {selectedMedia ? (
                <span>
                  Terpilih: <strong>{selectedMedia.originalName}</strong> ({(selectedMedia.size / 1024).toFixed(0)} KB)
                </span>
              ) : (
                <span>Klik salah satu gambar untuk memilih</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border text-body-sm font-semibold hover:bg-gray-100 transition-colors"
                style={{ borderColor: "var(--color-outline-variant)" }}
              >
                Batal
              </button>
              <button
                type="button"
                disabled={!selectedMedia}
                onClick={handleConfirmSelect}
                className="px-5 py-2 rounded-lg text-body-sm font-bold text-white shadow-xs disabled:opacity-50 transition-opacity flex items-center gap-1.5"
                style={{ background: "var(--color-primary)" }}
              >
                <Check size={16} />
                Gunakan Gambar Ini
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
