"use client";

import { useState } from "react";
import {
  Sparkles,
  Search,
  Wand2,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Copy,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Check,
  AlertCircle,
  Tag,
  FileText,
} from "lucide-react";

interface AiArticleAssistantProps {
  title: string;
  content: string;
  onApplySeo: (data: { excerpt: string; metaTitle: string; metaDescription: string }) => void;
  onApplyTitle: (newTitle: string) => void;
  onInsertContent: (html: string, replace?: boolean) => void;
}

export default function AiArticleAssistant({
  title,
  content,
  onApplySeo,
  onApplyTitle,
  onInsertContent,
}: AiArticleAssistantProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"seo" | "titles" | "write">("seo");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [appliedNotice, setAppliedNotice] = useState("");

  // SEO State
  const [seoResult, setSeoResult] = useState<{
    excerpt: string;
    metaTitle: string;
    metaDescription: string;
    keywords?: string[];
  } | null>(null);

  // Title Suggestions State
  const [titleSuggestions, setTitleSuggestions] = useState<
    Array<{ style: string; title: string }>
  >([]);

  // Write/Outline State
  const [writeMode, setWriteMode] = useState<"outline" | "polish">("outline");
  const [topicInput, setTopicInput] = useState("");
  const [outlineResult, setOutlineResult] = useState<{
    titleSuggestion?: string;
    outlineHtml: string;
    summary?: string;
  } | null>(null);

  // Polish State
  const [polishInput, setPolishInput] = useState("");
  const [polishResult, setPolishResult] = useState<{
    polishedText: string;
    notes?: string;
  } | null>(null);

  const showNotification = (msg: string) => {
    setAppliedNotice(msg);
    setTimeout(() => setAppliedNotice(""), 3500);
  };

  // 1. Handle Generate SEO
  const handleGenerateSEO = async () => {
    if (!title && !content) {
      setError("Isi judul atau sebagian konten artikel terlebih dahulu.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/article-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "seo",
          title,
          content,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSeoResult(data.data);
      } else {
        setError(data.error || "Gagal menghasilkan SEO");
      }
    } catch {
      setError("Terjadi kesalahan jaringan saat menghubungi AI");
    } finally {
      setLoading(false);
    }
  };

  const handleApplySEO = () => {
    if (!seoResult) return;
    onApplySeo({
      excerpt: seoResult.excerpt || "",
      metaTitle: seoResult.metaTitle || "",
      metaDescription: seoResult.metaDescription || "",
    });
    showNotification("Excerpt, Meta Title, dan Meta Description berhasil diterapkan!");
  };

  // 2. Handle Suggest Titles
  const handleSuggestTitles = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/article-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "titles",
          title: title || "",
          content: content || "",
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setTitleSuggestions(data.data);
      } else {
        setError(data.error || "Gagal menghasilkan saran judul");
      }
    } catch {
      setError("Terjadi kesalahan jaringan saat menghubungi AI");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTitleClick = (suggested: string) => {
    onApplyTitle(suggested);
    showNotification(`Judul artikel diperbarui menjadi: "${suggested.slice(0, 35)}..."`);
  };

  // 3. Handle Generate Outline
  const handleGenerateOutline = async () => {
    if (!topicInput && !title) {
      setError("Tuliskan topik atau judul artikel yang ingin dibuat outline-nya.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/article-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "outline",
          topic: topicInput || title,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setOutlineResult(data.data);
      } else {
        setError(data.error || "Gagal membuat outline artikel");
      }
    } catch {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  // 4. Handle Polish Tone
  const handlePolishTone = async () => {
    if (!polishInput.trim()) {
      setError("Masukkan teks yang ingin dipoles.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/article-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "polish",
          text: polishInput,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setPolishResult(data.data);
      } else {
        setError(data.error || "Gagal memoles gaya bahasa");
      }
    } catch {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="elevation-1 rounded-2xl p-5 bg-white transition-all duration-300"
      style={{
        borderTop: "4px solid var(--color-secondary-container)",
        borderLeft: "1px solid var(--color-outline-variant)",
        borderRight: "1px solid var(--color-outline-variant)",
        borderBottom: "1px solid var(--color-outline-variant)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: "var(--color-outline-variant)" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shadow-xs"
            style={{
              background: "color-mix(in srgb, var(--color-secondary-container) 20%, transparent)",
              color: "var(--color-on-secondary-container)",
            }}
          >
            <Sparkles size={20} className="text-amber-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3
                className="text-headline-sm font-bold tracking-tight font-[var(--font-heading)]"
                style={{ color: "var(--color-on-surface)" }}
              >
                AI Research Copilot
              </h3>
              <span
                className="text-label-md px-2.5 py-0.5 rounded-full font-bold uppercase"
                style={{
                  background: "var(--color-secondary-container)",
                  color: "var(--color-on-secondary-container)",
                }}
              >
                Gemini 3.6
              </span>
            </div>
            <p className="text-body-sm mt-0.5" style={{ color: "var(--color-on-surface-variant)" }}>
              Asisten cerdas SEO & penulisan ilmiah
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-lg transition-colors hover:bg-gray-100"
          style={{ color: "var(--color-on-surface-variant)" }}
        >
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 space-y-4">
          {/* Notification Toast */}
          {appliedNotice && (
            <div
              className="p-3 rounded-lg text-body-sm font-semibold flex items-center gap-2.5 animate-fade-in"
              style={{
                background: "color-mix(in srgb, #10b981 12%, transparent)",
                color: "#065f46",
                border: "1px solid color-mix(in srgb, #10b981 30%, transparent)",
              }}
            >
              <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
              <span>{appliedNotice}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div
              className="p-3 rounded-lg text-body-sm font-medium flex items-start gap-2.5 leading-relaxed animate-fade-in"
              style={{
                background: "var(--color-error-container)",
                color: "var(--color-on-error-container)",
                border: "1px solid var(--color-error)",
              }}
            >
              <AlertCircle size={18} className="shrink-0 mt-0.5" style={{ color: "var(--color-error)" }} />
              <span>{error}</span>
            </div>
          )}

          {/* Tab Navigation */}
          <div
            className="grid grid-cols-3 gap-1 p-1 rounded-xl text-body-sm font-semibold"
            style={{
              background: "var(--color-surface-container-low)",
              border: "1px solid var(--color-outline-variant)",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setActiveTab("seo");
                setError("");
              }}
              className={`py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 text-xs font-bold ${
                activeTab === "seo"
                  ? "shadow-xs text-white"
                  : "hover:bg-white/60"
              }`}
              style={{
                background: activeTab === "seo" ? "var(--color-primary)" : "transparent",
                color: activeTab === "seo" ? "var(--color-on-primary)" : "var(--color-on-surface-variant)",
              }}
            >
              <Search size={14} /> Auto SEO
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("titles");
                setError("");
              }}
              className={`py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 text-xs font-bold ${
                activeTab === "titles"
                  ? "shadow-xs text-white"
                  : "hover:bg-white/60"
              }`}
              style={{
                background: activeTab === "titles" ? "var(--color-primary)" : "transparent",
                color: activeTab === "titles" ? "var(--color-on-primary)" : "var(--color-on-surface-variant)",
              }}
            >
              <Lightbulb size={14} /> Ide Judul
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("write");
                setError("");
              }}
              className={`py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 text-xs font-bold ${
                activeTab === "write"
                  ? "shadow-xs text-white"
                  : "hover:bg-white/60"
              }`}
              style={{
                background: activeTab === "write" ? "var(--color-primary)" : "transparent",
                color: activeTab === "write" ? "var(--color-on-primary)" : "var(--color-on-surface-variant)",
              }}
            >
              <Wand2 size={14} /> Tulis & Poles
            </button>
          </div>

          {/* TAB 1: AUTO SEO */}
          {activeTab === "seo" && (
            <div className="space-y-3.5">
              <p className="text-body-sm leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>
                Analisis otomatis judul & isi artikel untuk menghasilkan <strong>Ringkasan</strong>, <strong>Meta Title</strong>, dan <strong>Meta Description</strong> berstandar Google SEO.
              </p>

              <button
                type="button"
                onClick={handleGenerateSEO}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg font-bold text-label-lg shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                style={{
                  background: "var(--color-secondary-container)",
                  color: "var(--color-on-secondary-container)",
                }}
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" /> Menganalisis Konten...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> Generate SEO Otomatis
                  </>
                )}
              </button>

              {seoResult && (
                <div
                  className="mt-3 p-4 rounded-xl space-y-3 text-body-sm animate-fade-in"
                  style={{
                    background: "var(--color-surface-container-low)",
                    border: "1px solid var(--color-outline-variant)",
                  }}
                >
                  <div>
                    <span className="text-label-md font-bold uppercase block mb-1" style={{ color: "var(--color-primary)" }}>
                      Ringkasan (Excerpt)
                    </span>
                    <p
                      className="p-2.5 rounded-lg text-body-sm leading-relaxed"
                      style={{
                        background: "var(--color-surface-container-lowest)",
                        color: "var(--color-on-surface)",
                        border: "1px solid var(--color-outline-variant)",
                      }}
                    >
                      {seoResult.excerpt}
                    </p>
                  </div>

                  <div>
                    <span className="text-label-md font-bold uppercase block mb-1" style={{ color: "var(--color-primary)" }}>
                      Meta Title (SEO)
                    </span>
                    <p
                      className="p-2.5 rounded-lg text-body-sm font-semibold"
                      style={{
                        background: "var(--color-surface-container-lowest)",
                        color: "var(--color-on-surface)",
                        border: "1px solid var(--color-outline-variant)",
                      }}
                    >
                      {seoResult.metaTitle}
                    </p>
                  </div>

                  <div>
                    <span className="text-label-md font-bold uppercase block mb-1" style={{ color: "var(--color-primary)" }}>
                      Meta Description (SEO)
                    </span>
                    <p
                      className="p-2.5 rounded-lg text-body-sm leading-relaxed"
                      style={{
                        background: "var(--color-surface-container-lowest)",
                        color: "var(--color-on-surface)",
                        border: "1px solid var(--color-outline-variant)",
                      }}
                    >
                      {seoResult.metaDescription}
                    </p>
                  </div>

                  {seoResult.keywords && seoResult.keywords.length > 0 && (
                    <div>
                      <span className="text-label-md font-bold uppercase block mb-1.5" style={{ color: "var(--color-primary)" }}>
                        Saran Tag & Kata Kunci
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {seoResult.keywords.map((kw, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                            style={{
                              background: "var(--color-surface-container)",
                              color: "var(--color-primary)",
                              border: "1px solid var(--color-outline-variant)",
                            }}
                          >
                            <Tag size={10} /> {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleApplySEO}
                    className="w-full mt-2 py-2.5 px-4 rounded-lg font-bold text-label-lg transition-all flex items-center justify-center gap-2 text-white shadow-xs"
                    style={{
                      background: "var(--color-primary)",
                    }}
                  >
                    <Check size={16} /> Terapkan ke Form (1-Click)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SARAN JUDUL */}
          {activeTab === "titles" && (
            <div className="space-y-3.5">
              <p className="text-body-sm leading-relaxed" style={{ color: "var(--color-on-surface-variant)" }}>
                Hasilkan 5 opsi judul dengan gaya berbeda (Akademik, Praktis, SEO Hook) yang memikat pembaca riset.
              </p>

              <button
                type="button"
                onClick={handleSuggestTitles}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg font-bold text-label-lg shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                style={{
                  background: "var(--color-secondary-container)",
                  color: "var(--color-on-secondary-container)",
                }}
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" /> Meracik Judul Terbaik...
                  </>
                ) : (
                  <>
                    <Lightbulb size={16} /> Dapatkan 5 Ide Judul
                  </>
                )}
              </button>

              {titleSuggestions.length > 0 && (
                <div className="space-y-2.5 mt-3 animate-fade-in">
                  {titleSuggestions.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl transition-all flex flex-col gap-2 bg-white"
                      style={{
                        background: "var(--color-surface-container-low)",
                        border: "1px solid var(--color-outline-variant)",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="text-label-md px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider"
                          style={{
                            background: "var(--color-surface-container)",
                            color: "var(--color-primary)",
                            border: "1px solid var(--color-outline-variant)",
                          }}
                        >
                          {item.style}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleApplyTitleClick(item.title)}
                          className="text-label-md font-bold flex items-center gap-1 transition-opacity hover:opacity-80"
                          style={{ color: "var(--color-primary-container)" }}
                        >
                          Gunakan <ArrowRight size={13} />
                        </button>
                      </div>
                      <p className="text-body-sm font-bold leading-snug" style={{ color: "var(--color-on-surface)" }}>
                        {item.title}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TULIS & RAPIKAN */}
          {activeTab === "write" && (
            <div className="space-y-3.5">
              <div className="flex gap-4 border-b pb-2" style={{ borderColor: "var(--color-outline-variant)" }}>
                <button
                  type="button"
                  onClick={() => setWriteMode("outline")}
                  className={`text-body-sm font-bold pb-1.5 transition-all border-b-2 ${
                    writeMode === "outline"
                      ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                      : "border-transparent text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <FileText size={15} /> Buat Outline Artikel
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setWriteMode("polish")}
                  className={`text-body-sm font-bold pb-1.5 transition-all border-b-2 ${
                    writeMode === "polish"
                      ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                      : "border-transparent text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Sparkles size={15} /> Poles Bahasa Akademik
                  </span>
                </button>
              </div>

              {writeMode === "outline" ? (
                <div className="space-y-3">
                  <label className="text-label-md font-bold uppercase block" style={{ color: "var(--color-on-surface-variant)" }}>
                    Topik / Gagasan Riset
                  </label>
                  <input
                    type="text"
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    placeholder={title || "Contoh: Tips memilih jurnal Scopus yang tepat..."}
                    className="w-full px-3.5 py-2.5 rounded-lg border text-body-sm focus-ring"
                    style={{
                      borderColor: "var(--color-outline-variant)",
                      background: "var(--color-surface-container-lowest)",
                      color: "var(--color-on-surface)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleGenerateOutline}
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-lg font-bold text-label-lg text-white shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{
                      background: "var(--color-primary)",
                    }}
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={15} className="animate-spin" /> Menyusun Struktur Outline...
                      </>
                    ) : (
                      <>
                        <BookOpen size={15} /> Buat Kerangka HTML
                      </>
                    )}
                  </button>

                  {outlineResult && (
                    <div
                      className="p-3.5 rounded-xl space-y-2.5 animate-fade-in text-body-sm"
                      style={{
                        background: "var(--color-surface-container-low)",
                        border: "1px solid var(--color-outline-variant)",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-label-md font-bold uppercase" style={{ color: "var(--color-primary)" }}>
                          Kerangka Siap Pakai
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            onInsertContent(outlineResult.outlineHtml, false);
                            showNotification("Outline berhasil dimasukkan ke editor TinyMCE!");
                          }}
                          className="px-3 py-1.5 rounded-lg text-label-md font-bold text-white flex items-center gap-1.5 shadow-xs"
                          style={{ background: "var(--color-primary)" }}
                        >
                          <Copy size={13} /> Masukkan ke TinyMCE
                        </button>
                      </div>
                      <div
                        className="p-3 rounded-lg text-xs max-h-48 overflow-y-auto leading-relaxed font-mono"
                        style={{
                          background: "var(--color-surface-container-lowest)",
                          color: "var(--color-on-surface)",
                          border: "1px solid var(--color-outline-variant)",
                        }}
                        dangerouslySetInnerHTML={{ __html: outlineResult.outlineHtml }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="text-label-md font-bold uppercase block" style={{ color: "var(--color-on-surface-variant)" }}>
                    Draft Kalimat / Paragraf
                  </label>
                  <textarea
                    value={polishInput}
                    onChange={(e) => setPolishInput(e.target.value)}
                    rows={3}
                    placeholder="Tempel kalimat yang ingin disempurnakan menjadi bahasa akademik baku..."
                    className="w-full px-3.5 py-2.5 rounded-lg border text-body-sm focus-ring resize-none"
                    style={{
                      borderColor: "var(--color-outline-variant)",
                      background: "var(--color-surface-container-lowest)",
                      color: "var(--color-on-surface)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={handlePolishTone}
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-lg font-bold text-label-lg text-white shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{
                      background: "var(--color-primary)",
                    }}
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={15} className="animate-spin" /> Memoles Gaya Bahasa...
                      </>
                    ) : (
                      <>
                        <Sparkles size={15} /> Poles Bahasa Akademik
                      </>
                    )}
                  </button>

                  {polishResult && (
                    <div
                      className="p-3.5 rounded-xl space-y-2.5 animate-fade-in text-body-sm"
                      style={{
                        background: "var(--color-surface-container-low)",
                        border: "1px solid var(--color-outline-variant)",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-label-md font-bold uppercase" style={{ color: "var(--color-primary)" }}>
                          Hasil Poles (EYD & Akademik)
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            onInsertContent(`<p>${polishResult.polishedText}</p>`, false);
                            showNotification("Paragraf hasil polesan dimasukkan ke TinyMCE!");
                          }}
                          className="px-3 py-1.5 rounded-lg text-label-md font-bold text-white flex items-center gap-1.5 shadow-xs"
                          style={{ background: "var(--color-primary)" }}
                        >
                          <Copy size={13} /> Masukkan ke TinyMCE
                        </button>
                      </div>
                      <p
                        className="p-3 rounded-lg text-body-sm leading-relaxed"
                        style={{
                          background: "var(--color-surface-container-lowest)",
                          color: "var(--color-on-surface)",
                          border: "1px solid var(--color-outline-variant)",
                        }}
                      >
                        {polishResult.polishedText}
                      </p>
                      {polishResult.notes && (
                        <p className="text-label-md italic" style={{ color: "var(--color-on-surface-variant)" }}>
                          Catatan: {polishResult.notes}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
