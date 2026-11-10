"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Menu, Shield, Users } from "lucide-react";

const TABS = [
  {
    href: "/dashboard/pengaturan",
    label: "Pengaturan Umum",
    icon: <Settings size={16} />,
  },
  {
    href: "/dashboard/pengguna/menu",
    label: "Kelola Menu Sidebar",
    icon: <Menu size={16} />,
  },
  {
    href: "/dashboard/pengguna/role",
    label: "Role & Hak Akses (RBAC)",
    icon: <Shield size={16} />,
  },
  {
    href: "/dashboard/pengguna",
    label: "Akun Pengguna & Staf",
    icon: <Users size={16} />,
  },
];

export default function PengaturanTabs() {
  const pathname = usePathname();

  return (
    <div className="lg:hidden flex items-center gap-1.5 p-1 bg-[#EAF1FA] border border-[#D5DDEB] rounded-2xl overflow-x-auto scrollbar-none mb-6">
      {TABS.map((tab) => {
        const isActive = pathname === tab.href;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              isActive
                ? "bg-[#09408C] text-white shadow-xs"
                : "text-[#5B6882] hover:text-[#09408C] hover:bg-white/70"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
