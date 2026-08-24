import { notFound } from "next/navigation";
import { getCourseById } from "@/actions/kursus";
import CourseForm from "@/components/admin/CourseForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edit Program Kursus | BIAS RISTEK Admin",
};

interface EditCoursePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const { id } = await params;
  const course = await getCourseById(id);

  if (!course) {
    notFound();
  }

  return <CourseForm initialData={course} isEditing={true} />;
}
