import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMentorshipBookingByToken } from "@/actions/penjadwalan";
import TutorConfirmationClient from "./TutorConfirmationClient";

export const metadata: Metadata = {
  title: "Konfirmasi Penugasan Bimbingan Riset | BIAS RISTEK",
  description: "Portal konfirmasi jadwal bimbingan privat 1-on-1 bagi Tim Tutor Pakar BIAS RISTEK.",
};

export default async function TutorConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ action?: string }>;
}) {
  const { token } = await params;
  const { action } = await searchParams;

  const booking = await getMentorshipBookingByToken(token);

  if (!booking) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] py-10 px-4 sm:px-6 lg:px-8">
      <TutorConfirmationClient booking={booking} initialAction={action} />
    </div>
  );
}
