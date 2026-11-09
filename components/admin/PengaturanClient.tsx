"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, Save, CheckCircle2, AlertCircle } from "lucide-react";
import { updateSiteSettings } from "@/actions/tampilan";
import PengaturanTabs from "@/components/admin/PengaturanTabs";

interface PengaturanClientProps {
  settings: {
    id: string;
    siteName: string;
    siteDescription: string | null;
    logo: string | null;
    favicon: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    address: string | null;
    newsPerPage: number;
    heroEnabled: boolean;
    serviceEnabled: boolean;
    newsEnabled: boolean;
    socialEnabled: boolean;
  };
}

export default function PengaturanClient({ settings }: PengaturanClientProps) {
  const router = useRouter();
  const [siteName, setSiteName] = useState(settings.siteName || "");
  const [siteDescription, setSiteDescription] = useState(settings.siteDescription || "");
  const [contactEmail, setContactEmail] = useState(settings.contactEmail || "");
  const [contactPhone, setContactPhone] = useState(settings.contactPhone || "");
  const [address, setAddress] = useState(settings.address || "");
  const [heroEnabled, setHeroEnabled] = useState(settings.heroEnabled !== false);
  const [serviceEnabled, setServiceEnabled] = useState(settings.serviceEnabled !== false);
  const [socialEnabled, setSocialEnabled] = useState(settings.socialEnabled !== false);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    const formData = new FormData();
    formData.set("siteName", siteName);
    formData.set("siteDescription", siteDescription);
    formData.set("contactEmail", contactEmail);
    formData.set("contactPhone", contactPhone);
    formData.set("address", address);
    formData.set("heroEnabled", String(heroEnabled));
    formData.set("serviceEnabled", String(serviceEnabled));
    formData.set("socialEnabled", String(socialEnabled));

    const result = await updateSiteSettings(formData);
    if (result.success) {
      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 4000);
    } else {
      setError(result.message || "Gagal menyimpan pengaturan");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Shared Navigation Hub Tabs */}
      <PengaturanTabs />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display flex items-center gap-3 text-[#09408C]">
            <Settings size={28} /> Pengaturan Umum Website
          </h1>
          <p className="text-sm mt-1 text-[#5B6882]">
            Kelola nama situs, identitas instansi, dan kontak resmi Sahabat Belajar
          </p>
        </div>
      </div>

      <div className="bg-white elevation-1 rounded-2xl p-6 max-w-3xl border border-gray-100">
        {success && (
          <div className="flex items-center gap-2 p-4 rounded-xl mb-6 bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-medium">
            <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
            Pengaturan umum berhasil disimpan dan langsung diterapkan!
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
            <label className="text-label-lg block mb-1.5" style={{ color: "var(--color-on-surface-variant)" }}>
              Nama Website / Instansi
            </label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg border text-body-sm focus-ring bg-gray-50 focus:bg-white transition-all"
              style={{ borderColor: "var(--color-outline-variant)" }}
            />
          </div>

          <div>
            <label className="text-label-lg block mb-1.5" style={{ color: "var(--color-on-surface-variant)" }}>
              Deskripsi Singkat / Tagline
            </label>
            <textarea
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 rounded-lg border text-body-sm focus-ring resize-none bg-gray-50 focus:bg-white transition-all"
              style={{ borderColor: "var(--color-outline-variant)" }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-label-lg block mb-1.5" style={{ color: "var(--color-on-surface-variant)" }}>
                Email Kontak
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="labterpadu@ulm.ac.id"
                className="w-full px-4 py-2.5 rounded-lg border text-body-sm focus-ring bg-gray-50 focus:bg-white transition-all"
                style={{ borderColor: "var(--color-outline-variant)" }}
              />
            </div>
            <div>
              <label className="text-label-lg block mb-1.5" style={{ color: "var(--color-on-surface-variant)" }}>
                Nomor Telepon / WhatsApp
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+62-877-7765-9482"
                className="w-full px-4 py-2.5 rounded-lg border text-body-sm focus-ring bg-gray-50 focus:bg-white transition-all"
                style={{ borderColor: "var(--color-outline-variant)" }}
              />
            </div>
          </div>

          <div>
            <label className="text-label-lg block mb-1.5" style={{ color: "var(--color-on-surface-variant)" }}>
              Alamat Lengkap Kantor / Lab
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              placeholder="Jl. Jend. A. Yani Km. 36, Banjarbaru, Kalimantan Selatan"
              className="w-full px-4 py-2.5 rounded-lg border text-body-sm focus-ring resize-none bg-gray-50 focus:bg-white transition-all"
              style={{ borderColor: "var(--color-outline-variant)" }}
            />
          </div>

          <div className="pt-4 border-t space-y-3" style={{ borderColor: "var(--color-outline-variant)" }}>
            <h3 className="text-sm font-bold text-gray-800">Visibilitas Fitur Landing Page</h3>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={heroEnabled}
                  onChange={(e) => setHeroEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-900 focus:ring-blue-800"
                />
                Tampilkan Hero Banner Carousel
              </label>
              <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={serviceEnabled}
                  onChange={(e) => setServiceEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-900 focus:ring-blue-800"
                />
                Tampilkan Section Layanan Riset
              </label>
              <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={socialEnabled}
                  onChange={(e) => setSocialEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-900 focus:ring-blue-800"
                />
                Tampilkan Section Sosial Media
              </label>
            </div>
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
