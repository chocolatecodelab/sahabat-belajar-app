import { Metadata } from "next";
import { getSupportTickets, getSupportMetrics } from "@/actions/support";
import SupportTicketsClient from "@/components/admin/SupportTicketsClient";

export const metadata: Metadata = {
  title: "Layanan CS & Tiket Human Handoff | Admin BIAS RISTEK",
  description: "Dasbor eskalasi tiket bantuan dan handoff WhatsApp konsultan akademik riset.",
};

export const dynamic = "force-dynamic";

export default async function SupportDashboardPage() {
  const [initialTickets, initialMetrics] = await Promise.all([
    getSupportTickets(),
    getSupportMetrics(),
  ]);

  return <SupportTicketsClient initialTickets={initialTickets} initialMetrics={initialMetrics} />;
}
