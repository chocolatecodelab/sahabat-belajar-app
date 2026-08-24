import CourseForm from "@/components/admin/CourseForm";

export const metadata = {
  title: "Tambah Program Kursus Baru | BIAS RISTEK Admin",
};

export default function CreateCoursePage() {
  return <CourseForm isEditing={false} />;
}
