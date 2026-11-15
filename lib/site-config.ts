import { supabaseAdmin } from "@/lib/supabase";

export interface SiteConfig {
  siteName: string;
  tagline: string;
  tagar: string;
  officialPhone: string;
  formattedPhone: string;
  officialEmail: string;
  address: string;
  defaultWaText: string;
  siteDescription: string;
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  siteName: "Sahabat Belajar",
  tagline: "Comprehensive Academic Solution",
  tagar: "#BersamaSahabat",
  officialPhone: process.env.NEXT_PUBLIC_OFFICIAL_WA || "6281144556677",
  formattedPhone: "+62 811-4455-6677",
  officialEmail: "halo@sahabatbelajar.id",
  address: "Layanan Home Visit & Online Terpadu Seluruh Indonesia",
  defaultWaText: "Halo Sahabat Belajar, saya tertarik untuk konsultasi program bimbingan belajar.",
  siteDescription: "Bimbingan belajar privat & semi-privat (2-5 siswa) K-12, UTBK-SNBT, CPNS & Kedinasan, TOEFL/IELTS, serta persiapan beasiswa pascasarjana.",
};

/**
 * Format string nomor telepon (misal: 6281144556677 atau 081144556677) menjadi +62 811-4455-6677
 */
export function formatPhoneDisplay(rawPhone?: string | null): string {
  if (!rawPhone) return DEFAULT_SITE_CONFIG.formattedPhone;
  const digits = rawPhone.replace(/\D/g, "");
  if (!digits) return DEFAULT_SITE_CONFIG.formattedPhone;

  let local = digits;
  if (local.startsWith("62")) {
    local = "0" + local.slice(2);
  }

  // Format 08xx-xxxx-xxxx
  if (local.startsWith("08") && local.length >= 10) {
    const part1 = local.slice(0, 4);
    const part2 = local.slice(4, 8);
    const part3 = local.slice(8);
    return `+62 ${part1.slice(1)}-${part2}-${part3}`;
  }

  return rawPhone;
}

/**
 * Buat URL WhatsApp resmi dengan pesan default atau custom
 */
export function getWhatsAppUrl(phone?: string | null, customText?: string): string {
  const target = (phone || DEFAULT_SITE_CONFIG.officialPhone).replace(/\D/g, "");
  let cleanNumber = target;
  if (cleanNumber.startsWith("08")) {
    cleanNumber = "62" + cleanNumber.slice(1);
  }
  const text = encodeURIComponent(customText || DEFAULT_SITE_CONFIG.defaultWaText);
  return `https://wa.me/${cleanNumber}?text=${text}`;
}

/**
 * Ambil konfigurasi situs resmi secara dinamis dari database (SiteSettings),
 * dengan fallback aman ke DEFAULT_SITE_CONFIG jika database kosong.
 */
export async function getOfficialSiteConfig(): Promise<SiteConfig> {
  try {
    const { data: settings } = await supabaseAdmin
      .from("SiteSettings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (settings) {
      const phone = settings.contactPhone || DEFAULT_SITE_CONFIG.officialPhone;
      return {
        siteName: settings.siteName || DEFAULT_SITE_CONFIG.siteName,
        tagline: DEFAULT_SITE_CONFIG.tagline,
        tagar: DEFAULT_SITE_CONFIG.tagar,
        officialPhone: phone.replace(/\D/g, "") || DEFAULT_SITE_CONFIG.officialPhone,
        formattedPhone: formatPhoneDisplay(phone),
        officialEmail: settings.contactEmail || DEFAULT_SITE_CONFIG.officialEmail,
        address: settings.address || DEFAULT_SITE_CONFIG.address,
        defaultWaText: DEFAULT_SITE_CONFIG.defaultWaText,
        siteDescription: settings.siteDescription || DEFAULT_SITE_CONFIG.siteDescription,
      };
    }
  } catch (error) {
    console.warn("Failed to fetch official SiteSettings from DB, using defaults:", error);
  }

  return DEFAULT_SITE_CONFIG;
}
