import Link from "next/link";
import { Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import { InstagramIcon, FacebookIcon, TwitterIcon, YoutubeIcon } from "@/components/ui/SocialIcons";

type NavItem = {
  id: string;
  label: string;
  type: string;
  url: string | null;
  page?: { title: string; slug: string } | null;
  category?: { name: string; slug: string } | null;
  openInNewTab: boolean;
};

type SocialItem = {
  id: string;
  platform: string;
  username: string;
  url: string;
};

interface FooterProps {
  siteSettings: {
    siteName: string;
    siteDescription: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    address: string | null;
  };
  footerNavigations: NavItem[];
  socialMedia: SocialItem[];
}

export default function Footer({
  siteSettings,
  footerNavigations,
  socialMedia,
}: FooterProps) {
  const getHref = (item: NavItem) => {
    if (item.type === "PAGE" && item.page) return `/${item.page.slug}`;
    if (item.type === "CATEGORY" && item.category) return `/kategori/${item.category.slug}`;
    return item.url || "#";
  };

  const renderSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return <InstagramIcon size={18} />;
      case "facebook":
        return <FacebookIcon size={18} />;
      case "twitter":
        return <TwitterIcon size={18} />;
      case "youtube":
        return <YoutubeIcon size={18} />;
      default:
        return <ExternalLink size={18} />;
    }
  };

  return (
    <footer
      className="text-white pt-16 pb-12 border-t"
      style={{
        background: "var(--color-primary)",
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-white px-3.5 py-1.5 rounded-xl shadow-xs inline-flex items-center">
                <img
                  src="/uploads/images/bias_ristek-logo.png"
                  alt="BIAS RISTEK"
                  className="h-9 w-auto object-contain"
                />
              </div>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              {siteSettings.siteDescription ||
                "Pusat keunggulan riset, pengembangan teknologi, dan pengujian laboratorium terstandarisasi internasional."}
            </p>
            {/* Social Icons */}
            {socialMedia.length > 0 && (
              <div className="flex items-center gap-2 pt-2">
                {socialMedia.map((soc) => (
                  <a
                    key={soc.id}
                    href={soc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
                    aria-label={soc.platform}
                  >
                    {renderSocialIcon(soc.platform)}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-label-lg font-semibold uppercase tracking-wider mb-4 text-white/90">
              Tautan Cepat
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/berita" className="hover:text-white transition-colors">
                  Berita & Informasi
                </Link>
              </li>
              {footerNavigations.map((nav) => (
                <li key={nav.id}>
                  <Link
                    href={getHref(nav)}
                    target={nav.openInNewTab ? "_blank" : undefined}
                    rel={nav.openInNewTab ? "noopener noreferrer" : undefined}
                    className="hover:text-white transition-colors"
                  >
                    {nav.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Alamat Kontak */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-label-lg font-semibold uppercase tracking-wider mb-4 text-white/90">
              Kontak & Lokasi
            </h4>
            <div className="space-y-3 text-sm text-gray-300">
              {siteSettings.address && (
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-[var(--color-secondary-container)] flex-shrink-0 mt-0.5" />
                  <span>{siteSettings.address}</span>
                </div>
              )}
              {siteSettings.contactEmail && (
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-[var(--color-secondary-container)] flex-shrink-0" />
                  <a href={`mailto:${siteSettings.contactEmail}`} className="hover:text-white">
                    {siteSettings.contactEmail}
                  </a>
                </div>
              )}
              {siteSettings.contactPhone && (
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-[var(--color-secondary-container)] flex-shrink-0" />
                  <a href={`tel:${siteSettings.contactPhone}`} className="hover:text-white">
                    {siteSettings.contactPhone}
                  </a>
                </div>
              )}
              <div className="pt-2 text-xs text-gray-400">
                Jam Operasional: Senin – Jumat (08.00 – 16.00 WITA)
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} {siteSettings.siteName}. Hak Cipta Dilindungi Undang-Undang.</p>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-white">Login Admin</Link>
            <span>ISO 17025:2017 & ISO 45001:2018 Standard</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
