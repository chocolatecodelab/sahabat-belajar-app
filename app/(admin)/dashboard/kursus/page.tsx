import { getCourses } from "@/actions/kursus";
import CourseListClient from "@/components/admin/CourseListClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Manajemen Program Kursus | BIAS RISTEK Admin",
  description: "Kelola daftar program kelas riset, kurikulum silabus, dan kuota pendaftaran",
};

export default async function AdminCoursesPage() {
  const courses = await getCourses();

  return <CourseListClient initialCourses={courses} />;
}
