import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import type { Metadata } from "next";

interface DynamicPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata(props: DynamicPageProps): Promise<Metadata> {
  const { slug } = await props.params;
  try {
    const { data: page } = await supabaseAdmin
      .from("Page")
      .select("title, excerpt, metaTitle, metaDescription, featuredImage")
      .eq("slug", slug)
      .maybeSingle();

    if (!page) return { title: "Halaman Tidak Ditemukan" };

    return {
      title: `${page.metaTitle || page.title} — BIAS RISTEK`,
      description: page.metaDescription || page.excerpt || undefined,
      openGraph: {
        title: page.title,
        description: page.excerpt || undefined,
        images: page.featuredImage ? [page.featuredImage] : undefined,
      },
    };
  } catch {
    return { title: "Halaman — BIAS RISTEK" };
  }
}

export default async function DynamicPublicPage(props: DynamicPageProps) {
  const { slug } = await props.params;

  let page: any = null;
  try {
    const { data: rawPage } = await supabaseAdmin
      .from("Page")
      .select(`
        id,
        title,
        slug,
        content,
        excerpt,
        featuredImage,
        status,
        author:User(name)
      `)
      .eq("slug", slug)
      .maybeSingle();

    if (rawPage) {
      page = {
        ...rawPage,
        author: Array.isArray(rawPage.author) ? rawPage.author[0] : rawPage.author,
      };
    }
  } catch (error) {
    console.error("Database connection error in DynamicPublicPage:", error);
  }

  if (!page || page.status !== "PUBLISHED") {
    notFound();
  }

  return (
    <div className="py-14 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Title */}
        <div className="mb-10 text-center max-w-3xl mx-auto space-y-3 border-b border-gray-100 pb-8">
          <h1 className="text-display-md sm:text-display-lg font-extrabold text-gray-950 leading-tight">
            {page.title}
          </h1>
          {page.excerpt && (
            <p className="text-body-lg text-gray-600 max-w-2xl mx-auto">
              {page.excerpt}
            </p>
          )}
        </div>

        {/* Featured Image if exists */}
        {page.featuredImage && (
          <div className="mb-10 rounded-2xl overflow-hidden shadow-sm aspect-[16/9] bg-gray-100">
            <img
              src={page.featuredImage}
              alt={page.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Page HTML content rendered from TinyMCE */}
        <div
          className="prose-content max-w-none"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </div>
  );
}
