"use client";

import { useRef, useState, useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { Image as ImageIcon, FolderOpen } from "lucide-react";
import MediaPickerModal from "@/components/admin/MediaPickerModal";

interface TinyEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
  id?: string;
  defaultFolder?: string;
}

export default function TinyEditor({
  value,
  onChange,
  placeholder = "Mulai menulis konten...",
  height = 500,
  id = "bias-tinymce-editor",
  defaultFolder = "content",
}: TinyEditorProps) {
  const editorRef = useRef<any>(null);
  const pickerCallbackRef = useRef<((url: string, meta?: Record<string, any>) => void) | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpenMediaPicker = (callback?: (url: string, meta?: Record<string, any>) => void) => {
    if (callback) {
      pickerCallbackRef.current = callback;
    } else {
      pickerCallbackRef.current = null;
    }
    setIsMediaPickerOpen(true);
  };

  const handleMediaSelect = (url: string) => {
    if (pickerCallbackRef.current) {
      // TinyMCE native image dialog file_picker_callback resolution
      pickerCallbackRef.current(url, {
        alt: "",
        title: "",
      });
      pickerCallbackRef.current = null;
    } else if (editorRef.current) {
      // Insert img tag directly at current cursor position
      editorRef.current.insertContent(
        `<p><img src="${url}" alt="" style="max-width: 100%; height: auto; border-radius: 8px;" /></p>`
      );
    }
    setIsMediaPickerOpen(false);
  };

  const handleMediaClose = () => {
    pickerCallbackRef.current = null;
    setIsMediaPickerOpen(false);
  };

  if (!mounted) {
    return (
      <div
        className="w-full rounded-xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400 text-sm animate-pulse"
        style={{ height }}
      >
        <span>Memuat editor...</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2" suppressHydrationWarning>
      {/* Quick Action Toolbar Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span>Editor Konten Visual</span>
        </div>
        <button
          type="button"
          onClick={() => handleOpenMediaPicker()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#EAF1FA] text-[#09408C] hover:bg-[#D5DDEB]/60 border border-[#9AC1E2] transition-all shadow-xs cursor-pointer"
        >
          <FolderOpen size={14} className="text-[#09408C]" />
          <span>Pilih dari Pustaka Media</span>
        </button>
      </div>

      <Editor
        id={id}
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        onInit={(_evt, editor) => {
          editorRef.current = editor;
        }}
        value={value}
        onEditorChange={(content) => onChange(content)}
        init={{
          height,
          menubar: "file edit view insert format tools table",
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "wordcount",
            "codesample",
          ],
          toolbar:
            "undo redo | blocks | " +
            "bold italic forecolor backcolor | alignleft aligncenter " +
            "alignright alignjustify | bullist numlist outdent indent | " +
            "pustakamedia image media link | table codesample | " +
            "removeformat | code fullscreen",
          placeholder,
          content_style: `
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700&display=swap');
            body { 
              font-family: 'Inter', sans-serif; 
              font-size: 16px; 
              line-height: 1.8;
              color: #0d1c2e;
              padding: 12px 16px;
            }
            h1, h2, h3, h4, h5, h6 {
              font-family: 'Plus Jakarta Sans', sans-serif;
              font-weight: 600;
              color: #09408C;
            }
            img {
              max-width: 100%;
              height: auto;
              border-radius: 8px;
            }
            blockquote {
              border-left: 4px solid #fdbc13;
              padding-left: 1em;
              color: #444650;
              font-style: italic;
            }
            a { color: #0b2c6b; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #c4c6d2; padding: 8px 12px; }
            th { background: #e6eeff; font-weight: 600; }
            pre { background: #233144; color: #eaf1ff; padding: 1em; border-radius: 8px; }
          `,
          setup: (editor) => {
            // Custom toolbar button "Pustaka Media"
            editor.ui.registry.addButton("pustakamedia", {
              text: "Pustaka Media",
              icon: "gallery",
              tooltip: "Sisipkan gambar dari Pustaka Media",
              onAction: () => {
                handleOpenMediaPicker();
              },
            });

            // Custom menu item in Insert menu
            editor.ui.registry.addMenuItem("pustakamedia", {
              text: "Pustaka Media",
              icon: "gallery",
              onAction: () => {
                handleOpenMediaPicker();
              },
            });
          },
          // Custom file picker callback so native TinyMCE Image dialog uses MediaPickerModal
          file_picker_callback: (callback, _value, meta) => {
            if (meta.filetype === "image") {
              handleOpenMediaPicker(callback);
            }
          },
          // Image upload fallback handler (integrated with /api/upload)
          images_upload_handler: async (blobInfo: any) => {
            const formData = new FormData();
            formData.append("file", blobInfo.blob(), blobInfo.filename());
            formData.append("folder", defaultFolder);

            const res = await fetch("/api/upload", {
              method: "POST",
              body: formData,
            });

            if (!res.ok) {
              throw new Error("Upload gagal");
            }

            const data = await res.json();
            return data.url;
          },
          automatic_uploads: true,
          file_picker_types: "image",
          image_advtab: true,
          image_caption: true,
          link_default_target: "_blank",
          branding: false,
          promotion: false,
          paste_data_images: true,
        }}
      />

      {/* Media Picker Modal Dialog */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={handleMediaClose}
        onSelect={handleMediaSelect}
        defaultFolder={defaultFolder}
        title="Pilih Gambar dari Pustaka Media"
      />
    </div>
  );
}
