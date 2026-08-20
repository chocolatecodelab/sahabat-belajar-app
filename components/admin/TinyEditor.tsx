"use client";

import { useRef, useState, useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";

interface TinyEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
  id?: string;
}

export default function TinyEditor({
  value,
  onChange,
  placeholder = "Mulai menulis konten...",
  height = 500,
  id = "bias-tinymce-editor",
}: TinyEditorProps) {
  const editorRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
          "image media link | table codesample | " +
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
            color: #001847;
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
        // Image upload handler (integrated with /api/upload)
        images_upload_handler: async (blobInfo: any) => {
          const formData = new FormData();
          formData.append("file", blobInfo.blob(), blobInfo.filename());
          formData.append("folder", "content");

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
  );
}
