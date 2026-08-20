import { ExternalLink } from "lucide-react";
import { InstagramIcon } from "@/components/ui/SocialIcons";

type SocialItem = {
  id: string;
  platform: string;
  username: string;
  url: string;
  embedCode: string | null;
};

export default function SosialMediaSection({ socialMedia }: { socialMedia: SocialItem[] }) {
  if (socialMedia.length === 0) return null;

  const instagramAccount = socialMedia.find((s) => s.platform.toLowerCase() === "instagram");

  return (
    <section className="py-20 bg-[var(--color-surface)] border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-1 rounded-full" style={{ background: "var(--color-secondary-container)" }} />
            <span
              className="text-label-lg font-bold uppercase tracking-wider"
              style={{ color: "var(--color-primary)" }}
            >
              Media Sosial
            </span>
            <div className="w-8 h-1 rounded-full" style={{ background: "var(--color-secondary-container)" }} />
          </div>
          <h2
            className="text-display-md font-extrabold"
            style={{ color: "var(--color-on-surface)" }}
          >
            Ikuti Aktivitas Kami
          </h2>
          <p className="text-body-md text-gray-600 mt-2">
            Dokumentasi kegiatan riset, kunjungan industri, pelatihan, dan publikasi harian.
          </p>
        </div>

        {/* Instagram / Social Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {socialMedia.map((soc) => (
            <div
              key={soc.id}
              className="elevation-1 rounded-2xl p-6 bg-white border border-gray-100 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-600 to-purple-600 flex items-center justify-center text-white shadow-xs">
                      <InstagramIcon size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-body-md text-gray-900">
                        @{soc.username}
                      </h3>
                      <span className="text-xs text-gray-500 capitalize">{soc.platform} Resmi</span>
                    </div>
                  </div>
                  <a
                    href={soc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg text-gray-400 hover:text-blue-900 hover:bg-gray-50 transition-colors"
                  >
                    <ExternalLink size={18} />
                  </a>
                </div>

                {soc.embedCode ? (
                  <div
                    className="overflow-hidden rounded-xl my-3"
                    dangerouslySetInnerHTML={{ __html: soc.embedCode }}
                  />
                ) : (
                  <div className="py-8 text-center bg-gray-50 rounded-xl my-3 border border-dashed border-gray-200">
                    <InstagramIcon size={32} className="mx-auto text-gray-400 mb-2 opacity-50" />
                    <p className="text-sm text-gray-600 font-medium">Kunjungi postingan terbaru</p>
                    <p className="text-xs text-gray-400 mt-0.5">di akun Instagram resmi kami</p>
                  </div>
                )}
              </div>

              <div className="pt-4 mt-2">
                <a
                  href={soc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-sm text-center block text-white shadow-xs hover:opacity-90 transition-opacity"
                  style={{
                    background: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
                  }}
                >
                  Buka Profil @{soc.username}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
