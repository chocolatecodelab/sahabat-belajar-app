import { notFound } from "next/navigation";
import { getCourseCurriculumAdmin } from "@/actions/belajar";
import CurriculumBuilderClient from "@/components/admin/CurriculumBuilderClient";

export const dynamic = "force-dynamic";

interface CourseCurriculumPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: CourseCurriculumPageProps) {
  const { id } = await params;
  return {
    title: `Manajemen Materi & Silabus Kursus | Dashboard Mentor BIAS RISTEK`,
    description: "Kelola modul kurikulum mingguan, rekaman Zoom, slide PDF, dan dataset latihan.",
  };
}

export default async function CourseCurriculumPage({ params }: CourseCurriculumPageProps) {
  const { id } = await params;

  const curriculumData = await getCourseCurriculumAdmin(id);
  if (!curriculumData || !curriculumData.course) {
    notFound();
  }

  return (
    <CurriculumBuilderClient
      course={curriculumData.course}
      initialModules={curriculumData.modules}
    />
  );
}
