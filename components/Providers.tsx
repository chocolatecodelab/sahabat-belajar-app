"use client";

import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/components/ui/Toast";
import TopProgressBar from "@/components/ui/TopProgressBar";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <TopProgressBar />
        {children}
      </ToastProvider>
    </SessionProvider>
  );
}
