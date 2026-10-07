import { Metadata } from "next";
import { getDispatcherBoardData } from "@/actions/penjadwalan";
import DispatcherBoardClient from "./DispatcherBoardClient";

export const metadata: Metadata = {
  title: "Papan Penjadwalan 200+ Tutor | BIAS RISTEK",
  description: "Dispatcher Board bimbingan privat riset dengan protokol Human in the Loop.",
};

export default async function PenjadwalanDashboardPage() {
  const initialData = await getDispatcherBoardData();

  return <DispatcherBoardClient initialData={initialData} />;
}
