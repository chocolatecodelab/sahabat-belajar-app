import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getMyEnrolledCourses } from "@/actions/belajar";
import MyCoursesClient from "@/components/student/MyCoursesClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Kelas Saya | Ruang Belajar BIAS RISTEK",
  description: "Daftar program kursus, materi rekaman sesi, dan sertifikat yang Anda ikuti.",
};

export default async function MyCoursesPage() {
  const session = await auth();

  // Strict Gatekeeping: Require active login session
  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/belajar");
  }

  const enrolledCourses = await getMyEnrolledCourses(session.user.email);

  return (
    <MyCoursesClient
      initialCourses={enrolledCourses}
      user={{
        name: session.user.name || "Peserta Riset",
        email: session.user.email,
      }}
    />
  );
}
