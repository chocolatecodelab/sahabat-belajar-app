"use client";

import { useState, useTransition } from "react";
import {
  Upload,
  Search,
  Grid,
  List as ListIcon,
  Copy,
  Trash2,
  Check,
  RefreshCw,
  FolderOpen,
  Image as ImageIcon,
  FileText,
  Eye,
  X,
  ExternalLink,
  HardDrive,
  Filter,
  Folder,
} from "lucide-react";
import Image from "next/image";
import { uploadMediaFile, deleteMediaFile, getMediaFiles, type MediaItem } from "@/actions/media";

interface MediaLibraryClientProps {
  initialData: {
    data: MediaItem[];
    total: number;
    folders: string[];
  };
}

export default function MediaLibraryClient({ initialData }: MediaLibraryClientProps) {
  const [mediaList, setMediaList] = useState<MediaItem[]>(initialData.data);
  const [folders, setFolders] = useState<string[]>(initialData.folders);
  const [totalCount, setTotalCount] = useState<number>(initialData.total);

  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Calculate total storage used
  const totalBytes = mediaList.reduce((acc, m) => acc + (m.size || 0), 0);
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(1);

  const refreshData = async (folder = selectedFolder, search = searchQuery) => {
    startTransition(async () => {
      const res = await getMediaFiles({
        folder: folder === "all" ? undefined : folder,
        search,
        limit: 100,
      });
      setMediaList(res.data);
      setFolders(res.folders);
      setTotalCount(res.total);
    });
  };

  const handleFolderChange = (folder: string) => {
    setSelectedFolder(folder);
    refreshData(folder, searchQuery);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    refreshData(selectedFolder, val);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError("");

    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);
        formData.append("folder", selectedFolder === "all" ? "general" : selectedFolder);
        await uploadMediaFile(formData);
      }
      await refreshData();
    } catch (err: any) {
      setUploadError(err?.message || "Gagal mengunggah file");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(window.location.origin + url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await deleteMediaFile(id);
      if (res.success) {
        if (selectedMedia?.id === id) setSelectedMedia(null);
        setDeleteId(null);
        await refreshData();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 font-[var(--font-body)] animate-fade-in">
      {/* Header & Stats Banner */}
      <div
        className="elevation-1 rounded-2xl p-6 bg-white border flex flex-col md:flex-row md:items-center justify-between gap-6"
        style={{
          borderColor: "var(--color-outline-variant)",
          borderTop: "4px solid var(--color-primary)",
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xs"
            style={{
              background: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
              color: "var(--color-primary)",
            }}
          >
            <FolderOpen size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-display-md font-extrabold font-[var(--font-heading)]" style={{ color: "var(--color-on-surface)" }}>
                Pustaka Media Terpusat
              </h1>
              <span
                className="text-label-md font-bold px-2.5 py-0.5 rounded-full uppercase"
                style={{
                  background: "var(--color-secondary-container)",
                  color: "var(--color-on-secondary-container)",
                }}
              >
                {totalCount} File
              </span>
            </div>
            <p className="text-body-sm text-gray-500 mt-1">
              Pusat penyimpanan & pengelolaan aset gambar berita, cover modul, dan dokumen riset
            </p>
          </div>
        </div>

        {/* Quick Stats Badges & Upload CTA */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border flex items-center gap-2 text-2xs" style={{ borderColor: "var(--color-outline-variant)" }}>
            <HardDrive size={15} className="text-blue-900" />
            <div>
              <span className="text-gray-400 block font-medium">Penyimpanan Terpakai</span>
              <strong className="text-gray-800 font-bold">{totalMB} MB</strong>
            </div>
          </div>

          <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-label-lg font-bold text-white shadow-xs cursor-pointer hover:opacity-90 transition-all" style={{ background: "var(--color-primary)" }}>
            {uploading ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Mengunggah...
              </>
            ) : (
              <>
                <Upload size={16} />
                Unggah File Media
              </>
            )}
            <input
              type="file"
              multiple
              accept="image/*,application/pdf"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {uploadError && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-body-sm font-semibold flex items-center justify-between">
          <span>{uploadError}</span>
          <button type="button" onClick={() => setUploadError("")} className="p-1 hover:text-red-900">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main Layout: Filters + Gallery + Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left 3 Cols: Media Gallery */}
        <div className="lg:col-span-3 space-y-4">
          {/* Controls Bar: Folder Tabs + Search + View Switcher */}
          <div
            className="elevation-1 rounded-2xl p-4 bg-white border flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{ borderColor: "var(--color-outline-variant)" }}
          >
            {/* Folder Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <span className="text-2xs font-bold text-gray-400 mr-1 flex items-center gap-1">
                <Filter size={12} /> Folder:
              </span>
              <button
                type="button"
                onClick={() => handleFolderChange("all")}
                className={`px-3 py-1.5 rounded-lg text-2xs font-bold transition-all shrink-0 ${
                  selectedFolder === "all"
                    ? "bg-[var(--color-primary)] text-white shadow-xs"
                    : "bg-slate-50 text-gray-600 hover:bg-slate-100"
                }`}
              >
                Semua
              </button>
              {folders.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => handleFolderChange(f)}
                  className={`px-3 py-1.5 rounded-lg text-2xs font-bold transition-all shrink-0 uppercase inline-flex items-center gap-1.5 ${
                    selectedFolder === f
                      ? "bg-[var(--color-primary)] text-white shadow-xs"
                      : "bg-slate-50 text-gray-600 hover:bg-slate-100"
                  }`}
                >
                  <Folder size={12} /> {f}
                </button>
              ))}
            </div>

            {/* Search & View Mode */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-56">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Cari nama file..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg border text-2xs focus-ring bg-white"
                  style={{ borderColor: "var(--color-outline-variant)" }}
                />
              </div>

              {/* View Toggle */}
              <div className="flex items-center border rounded-lg overflow-hidden bg-slate-50" style={{ borderColor: "var(--color-outline-variant)" }}>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 transition-colors ${
                    viewMode === "grid" ? "bg-white text-blue-950 shadow-xs font-bold" : "text-gray-400 hover:text-gray-700"
                  }`}
                  title="Tampilan Grid"
                >
                  <Grid size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 transition-colors ${
                    viewMode === "list" ? "bg-white text-blue-950 shadow-xs font-bold" : "text-gray-400 hover:text-gray-700"
                  }`}
                  title="Tampilan Tabel"
                >
                  <ListIcon size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Media Grid / List */}
          <div
            className="elevation-1 rounded-2xl p-5 bg-white border min-h-[400px]"
            style={{ borderColor: "var(--color-outline-variant)" }}
          >
            {isPending ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-2">
                <RefreshCw size={24} className="animate-spin text-blue-900" />
                <span className="text-2xs font-medium">Memuat berkas media...</span>
              </div>
            ) : mediaList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
                <ImageIcon size={44} className="text-gray-300" />
                <div className="text-center">
                  <p className="text-body-md font-bold text-gray-700">Belum ada file media ditemukan</p>
                  <p className="text-2xs text-gray-400 mt-1">Unggah gambar baru menggunakan tombol di atas</p>
                </div>
              </div>
            ) : viewMode === "grid" ? (
              /* GRID VIEW */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {mediaList.map((item) => {
                  const isSelected = selectedMedia?.id === item.id;
                  const isImage = item.mimeType.startsWith("image/");
                  const isCopied = copiedId === item.id;

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedMedia(item)}
                      className={`group relative rounded-xl border overflow-hidden cursor-pointer transition-all aspect-square flex flex-col justify-between bg-slate-50 ${
                        isSelected
                          ? "ring-2 ring-[var(--color-primary)] border-transparent shadow-md"
                          : "hover:border-blue-400 hover:shadow-xs"
                      }`}
                      style={{ borderColor: isSelected ? "var(--color-primary)" : "var(--color-outline-variant)" }}
                    >
                      {/* Image / File Preview */}
                      <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-100">
                        {isImage ? (
                          <Image
                            src={item.url}
                            alt={item.originalName}
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-gray-500">
                            <FileText size={36} />
                            <span className="text-3xs uppercase font-bold">{item.mimeType.split("/")[1]}</span>
                          </div>
                        )}
                      </div>

                      {/* Folder Tag Badge */}
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-3xs font-bold uppercase bg-black/60 text-white backdrop-blur-xs">
                        {item.folder}
                      </span>

                      {/* Quick Copy Button on Hover */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyUrl(item.url, item.id);
                        }}
                        className={`absolute top-2 right-2 p-1.5 rounded-lg shadow-sm transition-all ${
                          isCopied
                            ? "bg-emerald-600 text-white"
                            : "bg-white/90 text-gray-700 hover:bg-white opacity-0 group-hover:opacity-100"
                        }`}
                        title="Salin URL Gambar"
                      >
                        {isCopied ? <Check size={13} /> : <Copy size={13} />}
                      </button>

                      {/* File Details Overlay */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-2.5 text-white">
                        <p className="text-2xs font-semibold truncate leading-tight">{item.originalName}</p>
                        <div className="flex items-center justify-between text-3xs text-white/70 mt-1">
                          <span>{(item.size / 1024).toFixed(0)} KB</span>
                          <span>{new Date(item.createdAt).toLocaleDateString("id-ID", { month: "short", day: "numeric" })}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* LIST VIEW */
              <div className="overflow-x-auto">
                <table className="w-full text-left text-body-sm">
                  <thead>
                    <tr className="border-b text-label-md" style={{ borderColor: "var(--color-outline-variant)", color: "var(--color-on-surface-variant)" }}>
                      <th className="py-2.5 px-3">Preview</th>
                      <th className="py-2.5 px-3">Nama File</th>
                      <th className="py-2.5 px-3">Folder</th>
                      <th className="py-2.5 px-3">Ukuran</th>
                      <th className="py-2.5 px-3">Tanggal</th>
                      <th className="py-2.5 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mediaList.map((item) => {
                      const isImage = item.mimeType.startsWith("image/");
                      const isCopied = copiedId === item.id;

                      return (
                        <tr
                          key={item.id}
                          onClick={() => setSelectedMedia(item)}
                          className="border-b hover:bg-slate-50 cursor-pointer transition-colors"
                          style={{ borderColor: "var(--color-outline-variant)" }}
                        >
                          <td className="py-2.5 px-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden relative bg-slate-100 flex items-center justify-center">
                              {isImage ? (
                                <Image src={item.url} alt={item.originalName} fill sizes="40px" className="object-cover" />
                              ) : (
                                <FileText size={18} className="text-gray-400" />
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <p className="font-bold text-gray-900 truncate max-w-xs">{item.originalName}</p>
                            <span className="text-3xs text-gray-400 truncate block max-w-xs">{item.url}</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded-full text-3xs font-bold uppercase bg-slate-100 text-gray-700">
                              {item.folder}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-2xs text-gray-500 font-medium">
                            {(item.size / 1024).toFixed(0)} KB
                          </td>
                          <td className="py-2.5 px-3 text-2xs text-gray-500">
                            {new Date(item.createdAt).toLocaleDateString("id-ID")}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => handleCopyUrl(item.url, item.id)}
                                className="p-1.5 rounded-lg border hover:bg-slate-100 text-gray-600 transition-colors"
                                title="Salin URL"
                              >
                                {isCopied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteId(item.id)}
                                className="p-1.5 rounded-lg border hover:bg-red-50 text-red-600 transition-colors"
                                title="Hapus File"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Selected Media Details Drawer */}
        <div
          className="elevation-1 rounded-2xl p-5 bg-white border space-y-4 sticky top-6"
          style={{ borderColor: "var(--color-outline-variant)" }}
        >
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: "var(--color-outline-variant)" }}>
            <h3 className="font-bold text-headline-sm font-[var(--font-heading)]" style={{ color: "var(--color-on-surface)" }}>
              Detail Aset Media
            </h3>
            {selectedMedia && (
              <button
                type="button"
                onClick={() => setSelectedMedia(null)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {selectedMedia ? (
            <div className="space-y-4 text-body-sm animate-fade-in">
              {/* Image Preview Box */}
              <div className="w-full aspect-video rounded-xl overflow-hidden relative bg-slate-100 border flex items-center justify-center" style={{ borderColor: "var(--color-outline-variant)" }}>
                {selectedMedia.mimeType.startsWith("image/") ? (
                  <Image
                    src={selectedMedia.url}
                    alt={selectedMedia.originalName}
                    fill
                    sizes="300px"
                    className="object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <FileText size={48} />
                    <span className="text-2xs font-bold uppercase">{selectedMedia.mimeType}</span>
                  </div>
                )}
              </div>

              {/* Metadata Fields */}
              <div className="space-y-2.5 text-2xs">
                <div>
                  <span className="text-gray-400 font-medium block">Nama Berkas:</span>
                  <p className="font-bold text-gray-900 break-all">{selectedMedia.originalName}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-400 font-medium block">Ukuran File:</span>
                    <p className="font-bold text-gray-900">{(selectedMedia.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium block">Folder:</span>
                    <p className="font-bold text-blue-900 uppercase flex items-center gap-1">
                      <Folder size={14} className="text-blue-700" /> {selectedMedia.folder}
                    </p>
                  </div>
                </div>

                <div>
                  <span className="text-gray-400 font-medium block">Tipe MIME:</span>
                  <p className="font-semibold text-gray-700">{selectedMedia.mimeType}</p>
                </div>

                <div>
                  <span className="text-gray-400 font-medium block">Tanggal Diunggah:</span>
                  <p className="font-semibold text-gray-700">
                    {new Date(selectedMedia.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t space-y-2" style={{ borderColor: "var(--color-outline-variant)" }}>
                <button
                  type="button"
                  onClick={() => handleCopyUrl(selectedMedia.url, selectedMedia.id)}
                  className="w-full py-2.5 px-3 rounded-lg text-label-lg font-bold transition-all flex items-center justify-center gap-2 text-white shadow-xs"
                  style={{ background: "var(--color-primary)" }}
                >
                  {copiedId === selectedMedia.id ? (
                    <>
                      <Check size={16} /> URL Tersalin!
                    </>
                  ) : (
                    <>
                      <Copy size={16} /> Salin URL Media
                    </>
                  )}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={selectedMedia.url}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 px-3 rounded-lg border text-2xs font-bold text-gray-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors"
                    style={{ borderColor: "var(--color-outline-variant)" }}
                  >
                    <ExternalLink size={13} /> Buka Asli
                  </a>
                  <button
                    type="button"
                    onClick={() => setDeleteId(selectedMedia.id)}
                    className="py-2 px-3 rounded-lg border border-red-200 text-2xs font-bold text-red-600 hover:bg-red-50 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Trash2 size={13} /> Hapus
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2 text-center">
              <Eye size={32} className="text-gray-300" />
              <p className="text-2xs font-medium">Klik salah satu berkas pada galeri untuk melihat detail lengkap</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="elevation-2 rounded-2xl bg-white p-6 max-w-sm w-full space-y-4 border" style={{ borderColor: "var(--color-outline-variant)" }}>
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div className="text-center">
              <h4 className="text-headline-sm font-bold text-gray-900">Hapus Berkas Media?</h4>
              <p className="text-2xs text-gray-500 mt-1">
                File akan dihapus secara permanen dari server dan tidak dapat dikembalikan.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                disabled={isDeleting}
                className="flex-1 py-2 rounded-lg border text-body-sm font-semibold hover:bg-gray-100"
                style={{ borderColor: "var(--color-outline-variant)" }}
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-body-sm font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                {isDeleting ? <RefreshCw size={14} className="animate-spin" /> : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
