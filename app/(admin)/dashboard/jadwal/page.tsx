import { getSessions } from "@/actions/penjadwalan";
import { getTutors } from "@/actions/tutor";
import { getStudents } from "@/actions/siswa";
import { getPrograms } from "@/actions/program";
import { getTutorAvailabilityMatrix } from "@/actions/smart-scheduling";
import ScheduleManagerClient from "@/components/admin/ScheduleManagerClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Jadwal & Ketersediaan Tutor | Sahabat Belajar",
  description: "Manajemen jadwal bimbingan belajar, asisten rekomendasi cerdas tutor, dan matriks ketersediaan mingguan.",
};

export default async function JadwalPage() {
  const [sessions, tutors, studentsRes, programs, availability] = await Promise.all([
    getSessions(),
    getTutors(),
    getStudents({ perPage: 100 }),
    getPrograms(),
    getTutorAvailabilityMatrix(),
  ]);

  return (
    <ScheduleManagerClient
      initialSessions={sessions}
      tutors={tutors}
      students={studentsRes.data}
      programs={programs}
      initialAvailability={availability}
    />
  );
}
