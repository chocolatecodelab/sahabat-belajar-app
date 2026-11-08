import { getSessions } from "@/actions/penjadwalan";
import { getTutors } from "@/actions/tutor";
import { getStudents } from "@/actions/siswa";
import { getPrograms } from "@/actions/program";
import ScheduleManagerClient from "@/components/admin/ScheduleManagerClient";

export const dynamic = "force-dynamic";

export default async function JadwalPage() {
  const [sessions, tutors, studentsRes, programs] = await Promise.all([
    getSessions(),
    getTutors(),
    getStudents({ perPage: 100 }),
    getPrograms(),
  ]);

  return (
    <ScheduleManagerClient
      initialSessions={sessions}
      tutors={tutors}
      students={studentsRes.data}
      programs={programs}
    />
  );
}
