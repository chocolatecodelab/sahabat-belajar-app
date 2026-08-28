import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowLeft, BookOpen } from "lucide-react";
import { auth } from "@/lib/auth";
import { getCourseClassroom } from "@/actions/belajar";
import { getStudentSubmissions } from "@/actions/tugas";
import ClassroomClient from "@/components/student/ClassroomClient";

export const dynamic = "force-dynamic";

interface ClassroomPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ClassroomPageProps) {
  const { slug } = await params;
  return {
    title: `Ruang Kelas - ${slug} | BIAS RISTEK`,
    description: "Akses materi rekaman sesi, modul PDF, dataset latihan, dan review draf naskah.",
  };
}

export default async function ClassroomPage({ params }: ClassroomPageProps) {
  const { slug } = await params;
  const session = await auth();

  // Strict Gatekeeping: Require Login
  if (!session?.user?.email) {
    redirect(`/login?callbackUrl=/belajar/${slug}`);
  }

  const classroomData = await getCourseClassroom(slug, session.user.email);
  if (!classroomData || !classroomData.course) {
    notFound();
  }

  // Strict Gatekeeping: Require Active Enrollment in this course
  if (!classroomData.isEnrolled || !classroomData.enrollment) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div
          className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto text-white shadow-md"
          style={{ background: "var(--color-primary)" }}
        >
          <Lock size={32} />
        </div>
        <div className="space-y-2">
          <span className="text-3xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            Akses Kelas Terkunci
          </span>
          <h1 className="text-2xl font-extrabold font-[var(--font-heading)] text-slate-900">
            Anda Belum Terdaftar di Kelas Ini
          </h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Akun <strong>{session.user.email}</strong> belum memiliki hak akses untuk materi{" "}
            <strong>{classroomData.course.title}</strong>. Silakan mendaftar melalui katalog program kursus.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href={`/kursus/${slug}`}
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold text-white shadow-md flex items-center justify-center gap-2"
            style={{ background: "var(--color-primary)" }}
          >
            <BookOpen size={16} />
            <span>Daftar Kelas Ini Sekarang</span>
          </Link>
          <Link
            href="/belajar"
            className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Kelas Saya</span>
          </Link>
        </div>
      </div>
    );
  }

  const initialSubmissions = await getStudentSubmissions(classroomData.enrollment.id);

  return (
    <ClassroomClient
      course={classroomData.course}
      modules={classroomData.modules}
      enrollment={classroomData.enrollment}
      initialSubmissions={initialSubmissions}
    />
  );
}
