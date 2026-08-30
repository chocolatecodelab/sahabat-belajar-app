"use client";

import { createContext, useContext, useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import type { AdminMenuItem } from "@/actions/menu";

interface SidebarContextType {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  mobileOpen: false,
  setMobileOpen: () => {},
  collapsed: false,
  setCollapsed: () => {},
});

export const useAdminSidebar = () => useContext(SidebarContext);

export default function AdminLayoutClient({
  children,
  menus,
  sessionUser,
}: {
  children: React.ReactNode;
  menus: AdminMenuItem[];
  sessionUser?: any;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <SidebarContext.Provider
      value={{ mobileOpen, setMobileOpen, collapsed, setCollapsed }}
    >
      <div
        className="min-h-screen flex"
        style={{ background: "var(--color-surface)" }}
        suppressHydrationWarning
      >
        {/* Backdrop for mobile */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Sidebar Component */}
        <Sidebar dynamicMenus={menus} userRole={sessionUser?.role} userPermissions={sessionUser?.permissions} />

        {/* Main Content Area */}
        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
            collapsed ? "lg:ml-[72px]" : "lg:ml-[260px]"
          } ml-0`}
        >
          <AdminHeader />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
