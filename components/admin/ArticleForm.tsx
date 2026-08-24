"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, AlertCircle } from "lucide-react";
import TinyEditor from "@/components/admin/TinyEditor";
import CoverImageUpload from "@/components/admin/CoverImageUpload";
import AiArticleAssistant from "@/components/admin/AiArticleAssistant";
import slugify from "slugify";
import { createArticle, updateArticle } from "@/actions/berita";

interface ArticleFormProps {
  initialData?: {
    id?: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    featuredImage: string | null;
    status: string;
    categoryId: string | null;
    publishedAt: string | Date | null;
    metaTitle: string | null;
    metaDescription: string | null;
    tags?: { id: string; name: string }[];
  };
  categories: { id: string; name: string; color: string | null }[];
  action?: (formData: FormData) => Promise<{ success: boolean; message?: string; errors?: Record<string, string[]> }>;
}

export default function ArticleForm({ initialData, categories, action }: ArticleFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [featuredImage, setFeaturedImage] = useState<string | null>(initialData?.featuredImage || null);
  const [status, setStatus] = useState(initialData?.status || "DRAFT");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!initialData?.id) {
      setSlug(slugify(newTitle, { lower: true, strict: true }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData();
    formData.set("title", title);
    formData.set("slug", slug);
    formData.set("content", content);
    formData.set("excerpt", excerpt);
    formData.set("featuredImage", featuredImage || "");
    formData.set("status", status);
    formData.set("categoryId", categoryId);
    formData.set("metaTitle", metaTitle);
    formData.set("metaDescription", metaDescription);

    try {
      const result = action
        ? await action(formData)
        : initialData?.id
        ? await updateArticle(initialData.id, formData)
        : await createArticle(formData);

      if (result.success) {
        router.push("/dashboard/berita");
        router.refresh();
      } else {
        setError(result.message || "Terjadi kesalahan");
      }
    } catch {
      setError("Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-body-md transition-colors hover:opacity-70"
          style={{ color: "var(--color-on-surface-variant)" }}
        >
          <ArrowLeft size={20} />
          Kembali
        </button>
        <div className="flex items-center gap-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2.5 rounded-lg border text-body-sm focus-ring"
            style={{ borderColor: "var(--color-outline-variant)", background: "var(--color-surface-container-lowest)" }}
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-label-lg transition-colors disabled:opacity-60"
            style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={18} />
            )}
            Simpan
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg mb-4 text-body-sm" style={{ background: "var(--color-error-container)", color: "var(--color-on-error-container)" }}>
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title */}
          <div className="elevation-1 rounded-2xl p-5">
            <label className="text-label-lg block mb-2" style={{ color: "var(--color-on-surface-variant)" }}>Judul Berita</label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Judul berita"
              required
              className="w-full px-4 py-3 rounded-lg border text-body-md focus-ring"
              style={{ borderColor: "var(--color-outline-variant)", background: "var(--color-surface-container-lowest)" }}
            />
            <div className="flex items-center gap-2 mt-2">
              <span className="text-label-md" style={{ color: "var(--color-outline)" }}>Slug:</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="flex-1 px-2 py-1 rounded border text-body-sm focus-ring"
                style={{ borderColor: "var(--color-outline-variant)", background: "var(--color-surface-container-lowest)" }}
              />
            </div>
          </div>

          {/* Cover Image */}
          <div className="elevation-1 rounded-2xl p-5">
            <label className="text-label-lg block mb-3" style={{ color: "var(--color-on-surface-variant)" }}>
              Cover Image / Gambar Sampul
            </label>
            <CoverImageUpload value={featuredImage} onChange={setFeaturedImage} folder="covers" />
          </div>

          {/* Content Editor */}
          <div className="elevation-1 rounded-2xl p-5">
            <label className="text-label-lg block mb-2" style={{ color: "var(--color-on-surface-variant)" }}>Konten Berita</label>
            <TinyEditor value={content} onChange={setContent} height={600} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* AI Research Copilot Assistant */}
          <AiArticleAssistant
            title={title}
            content={content}
            onApplySeo={({ excerpt: newExcerpt, metaTitle: newMetaTitle, metaDescription: newMetaDescription }) => {
              if (newExcerpt) setExcerpt(newExcerpt);
              if (newMetaTitle) setMetaTitle(newMetaTitle);
              if (newMetaDescription) setMetaDescription(newMetaDescription);
            }}
            onApplyTitle={(newTitle) => {
              handleTitleChange(newTitle);
            }}
            onInsertContent={(html, replace) => {
              if (replace) {
                setContent(html);
              } else {
                setContent((prev) => (prev ? prev + "\n" + html : html));
              }
            }}
          />

          {/* Category */}
          <div className="elevation-1 rounded-2xl p-5">
            <label className="text-label-lg block mb-2" style={{ color: "var(--color-on-surface-variant)" }}>Kategori</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border text-body-sm focus-ring"
              style={{ borderColor: "var(--color-outline-variant)", background: "var(--color-surface-container-lowest)" }}
            >
              <option value="">Pilih kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Excerpt */}
          <div className="elevation-1 rounded-2xl p-5">
            <label className="text-label-lg block mb-2" style={{ color: "var(--color-on-surface-variant)" }}>Ringkasan</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Ringkasan singkat berita (untuk preview card)"
              rows={4}
              className="w-full px-4 py-3 rounded-lg border text-body-sm focus-ring resize-none"
              style={{ borderColor: "var(--color-outline-variant)", background: "var(--color-surface-container-lowest)" }}
            />
          </div>

          {/* SEO */}
          <div className="elevation-1 rounded-2xl p-5">
            <label className="text-label-lg block mb-3" style={{ color: "var(--color-on-surface-variant)" }}>SEO</label>
            <div className="space-y-3">
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Meta Title"
                className="w-full px-4 py-2.5 rounded-lg border text-body-sm focus-ring"
                style={{ borderColor: "var(--color-outline-variant)", background: "var(--color-surface-container-lowest)" }}
              />
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Meta Description"
                rows={2}
                className="w-full px-4 py-2.5 rounded-lg border text-body-sm focus-ring resize-none"
                style={{ borderColor: "var(--color-outline-variant)", background: "var(--color-surface-container-lowest)" }}
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
