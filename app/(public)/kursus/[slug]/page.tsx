import { notFound } from "next/navigation";
import { getCourseBySlug } from "@/actions/kursus";
import CourseDetailClient from "@/components/public/CourseDetailClient";

export const dynamic = "force-dynamic";

interface CourseDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CourseDetailPageProps) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) {
    return { title: "Program Tidak Ditemukan | BIAS RISTEK" };
  }

  return {
    title: `${course.title} | BIAS RISTEK`,
    description: course.tagline || course.description.slice(0, 160),
  };
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) {
    notFound();
  }

  return <CourseDetailClient course={course} />;
}
