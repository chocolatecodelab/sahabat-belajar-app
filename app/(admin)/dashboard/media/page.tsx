import { getMediaFiles } from "@/actions/media";
import MediaLibraryClient from "@/components/admin/MediaLibraryClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pustaka Media | Sahabat Belajar Admin",
  description: "Pusat pengelolaan berkas media dan galeri gambar",
};

export default async function MediaLibraryPage() {
  const initialMedia = await getMediaFiles({ limit: 100 });

  return <MediaLibraryClient initialData={initialMedia} />;
}
