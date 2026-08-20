"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Rss, Save, CheckCircle2, AlertCircle } from "lucide-react";
import { updateSiteSettings } from "@/actions/tampilan";

interface TampilanBeritaClientProps {
  settings: {
    newsPerPage: number;
    newsEnabled: boolean;
  };
}

export default function TampilanBeritaClient({ settings }: TampilanBeritaClientProps) {
  const router = useRouter();
  const [newsPerPage, setNewsPerPage] = useState(settings.newsPerPage || 6);
  const [newsEnabled, setNewsEnabled] = useState(settings.newsEnabled !== false);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    const formData = new FormData();
    formData.set("newsPerPage", String(newsPerPage));
    formData.set("newsEnabled", String(newsEnabled));

    const result = await updateSiteSettings(formData);
    if (result.success) {
      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 4000);
    } else {
      setError(result.message || "Gagal menyimpan pengaturan berita");
    }
    setSaving(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-headline-lg flex items-center gap-3" style={{ color: "var(--color-on-surface)" }}>
            <Rss size={28} /> Pengaturan Tampilan Berita
          </h1>
          <p className="text-body-md mt-1" style={{ color: "var(--color-on-surface-variant)" }}>
            Atur konfigurasi section berita di halaman utama
          </p>
        </div>
      </div>

      <div className="bg-white elevation-1 rounded-2xl p-6 max-w-2xl border border-gray-100">
        {success && (
          <div className="flex items-center gap-2 p-4 rounded-xl mb-6 bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-medium">
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
            Pengaturan tampilan berita berhasil disimpan dan langsung diperbarui!
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-4 rounded-xl mb-6 bg-red-50 text-red-800 border border-red-200 text-sm font-medium">
            <AlertCircle size={20} className="text-red-600 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-label-lg block mb-2" style={{ color: "var(--color-on-surface-variant)" }}>
              Jumlah Berita di Landing Page
            </label>
            <input
              type="number"
              value={newsPerPage}
              onChange={(e) => setNewsPerPage(Number(e.target.value))}
              min={3}
              max={18}
              step={3}
              required
              className="w-full px-4 py-2.5 rounded-lg border text-body-sm focus-ring bg-gray-50 focus:bg-white transition-all"
              style={{ borderColor: "var(--color-outline-variant)" }}
            />
            <p className="text-xs text-gray-500 mt-1.5">Kelipatan 3 (contoh: 3, 6, 9, 12)</p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="newsEn"
              checked={newsEnabled}
              onChange={(e) => setNewsEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-blue-900 focus:ring-blue-800"
            />
            <label htmlFor="newsEn" className="text-body-md font-medium cursor-pointer" style={{ color: "var(--color-on-surface)" }}>
              Tampilkan Section Berita di Landing Page
            </label>
          </div>

          <div className="pt-4 border-t flex justify-end" style={{ borderColor: "var(--color-outline-variant)" }}>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-label-lg text-white transition-all shadow-sm hover:shadow-md disabled:opacity-60"
              style={{ background: "var(--color-primary)" }}
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {saving ? "Menyimpan..." : "Simpan Pengaturan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
