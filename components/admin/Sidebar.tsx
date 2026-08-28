"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Newspaper,
  FolderOpen,
  Navigation,
  Palette,
  Users,
  Shield,
  Menu as MenuIcon,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Image,
  Heart,
  Rss,
  Share2,
  Link as LinkIcon,
  X,
  BookOpen,
  Award,
  GraduationCap,
  Compass,
  Video,
  FileEdit,
  Send,
  Sparkles,
  Clock,
  HelpCircle,
  MessageSquare,
  Trophy,
  CreditCard,
  FileCheck,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useAdminSidebar } from "./AdminLayoutClient";
import type { AdminMenuItem } from "@/actions/menu";

const ICON_MAP: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard size={20} />,
  FileText: <FileText size={20} />,
  Newspaper: <Newspaper size={20} />,
  FolderOpen: <FolderOpen size={20} />,
  Navigation: <Navigation size={20} />,
  Palette: <Palette size={20} />,
  Image: <Image size={18} />,
  Heart: <Heart size={18} />,
  Rss: <Rss size={18} />,
  Share2: <Share2 size={18} />,
  Users: <Users size={20} />,
  Shield: <Shield size={20} />,
  Menu: <MenuIcon size={20} />,
  Settings: <Settings size={20} />,
  Link: <LinkIcon size={18} />,
  BookOpen: <BookOpen size={18} />,
  Award: <Award size={18} />,
  GraduationCap: <GraduationCap size={18} />,
  Compass: <Compass size={18} />,
  Video: <Video size={18} />,
  FileEdit: <FileEdit size={18} />,
  Send: <Send size={18} />,
  Sparkles: <Sparkles size={18} />,
  Clock: <Clock size={18} />,
  HelpCircle: <HelpCircle size={18} />,
  MessageSquare: <MessageSquare size={18} />,
  Trophy: <Trophy size={18} />,
  CreditCard: <CreditCard size={18} />,
  FileCheck: <FileCheck size={18} />,
};

interface SidebarProps {
  dynamicMenus?: AdminMenuItem[];
  userRole?: string;
  userPermissions?: string[];
}

export default function Sidebar({
  dynamicMenus = [],
  userRole,
  userPermissions = [],
}: SidebarProps) {
  const pathname = usePathname();
  const { mobileOpen, setMobileOpen, collapsed, setCollapsed } = useAdminSidebar();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["Tampilan"]);

  const toggleExpand = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label)
        ? prev.filter((l) => l !== label)
        : [...prev, label]
    );
  };

  const isActiveRoute = (url: string) => {
    if (!url || url === "#") return false;
    if (url === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(url);
  };

  const canAccess = (permission?: string | null) => {
    if (!permission) return true;
    if (userRole === "Super Admin") return true;
    return userPermissions.includes(permission);
  };

  // Filter only active menus & permitted menus
  const visibleMenus = dynamicMenus
    .filter((m) => m.isActive !== false && canAccess(m.permission))
    .map((m) => ({
      ...m,
      children: (m.children || []).filter(
        (child) => child.isActive !== false && canAccess(child.permission || m.permission)
      ),
    }));

  const getIcon = (iconName: string | null) => {
    if (!iconName) return <LinkIcon size={18} />;
    return ICON_MAP[iconName] || <LinkIcon size={18} />;
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-screen flex flex-col transition-all duration-300 z-50 shadow-xl ${
        /* Desktop */
        collapsed ? "lg:w-[72px]" : "lg:w-[260px]"
        } ${
        /* Mobile */
        mobileOpen ? "translate-x-0 w-[260px]" : "-translate-x-full lg:translate-x-0"
        }`}
      style={{
        background: "var(--color-primary)",
        color: "var(--color-on-primary)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-white/10">
        {(!collapsed || mobileOpen) ? (
          <Link
            href="/dashboard"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2.5"
          >
            <div className="bg-white px-2.5 py-1 rounded-xl shadow-xs flex items-center justify-center">
              <img
                src="/uploads/images/bias_ristek-logo.png"
                alt="BIAS RISTEK"
                className="h-10 w-auto object-contain"
              />
            </div>
          </Link>
        ) : (
          <Link
            href="/dashboard"
            className="flex items-center justify-center w-full"
          >
            <div className="bg-white p-1 rounded-lg shadow-xs flex items-center justify-center">
              <img
                src="/uploads/images/bias_ristek-logo.png"
                alt="BIAS RISTEK"
                className="h-6 w-6 object-cover object-left"
              />
            </div>
          </Link>
        )}

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
          title={collapsed ? "Perluas Sidebar" : "Kecilkan Sidebar"}
        >
          <ChevronLeft
            size={18}
            className={`transition-transform ${collapsed ? "rotate-180" : ""}`}
          />
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2.5 space-y-1">
        {visibleMenus.map((item) => {
          const hasChildren = item.children && item.children.length > 0;

          if (hasChildren) {
            const isExpanded = expandedMenus.includes(item.label);
            const hasActiveChild = item.children!.some(
              (child) => child.url && isActiveRoute(child.url)
            );

            return (
              <div key={item.id || item.label}>
                <button
                  onClick={() => (!collapsed || mobileOpen) && toggleExpand(item.label)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${hasActiveChild
                    ? "bg-white/15 text-white shadow-xs"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  title={collapsed && !mobileOpen ? item.label : undefined}
                >
                  <span className={hasActiveChild ? "text-[var(--color-secondary-container)]" : ""}>
                    {getIcon(item.icon)}
                  </span>
                  {(!collapsed || mobileOpen) && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {isExpanded ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </>
                  )}
                </button>

                {(!collapsed || mobileOpen) && isExpanded && (
                  <div className="ml-4 mt-1 space-y-1 border-l-2 border-white/10 pl-3">
                    {item.children!.map((child) => (
                      <Link
                        key={child.id || child.label}
                        href={child.url || "#"}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${child.url && isActiveRoute(child.url)
                          ? "bg-white/20 text-white font-semibold"
                          : "text-white/60 hover:bg-white/10 hover:text-white"
                          }`}
                      >
                        {getIcon(child.icon)}
                        <span>{child.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.id || item.label}
              href={item.url || "#"}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${item.url && isActiveRoute(item.url)
                ? "bg-white/15 text-white shadow-xs font-semibold"
                : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              title={collapsed && !mobileOpen ? item.label : undefined}
            >
              <span className={item.url && isActiveRoute(item.url) ? "text-[var(--color-secondary-container)]" : ""}>
                {getIcon(item.icon)}
              </span>
              {(!collapsed || mobileOpen) && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="border-t border-white/10 p-3">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:bg-red-500/20 hover:text-red-200 transition-colors text-sm font-medium"
          title={collapsed && !mobileOpen ? "Logout" : undefined}
        >
          <LogOut size={20} />
          {(!collapsed || mobileOpen) && <span>Keluar</span>}
        </button>
      </div>
    </aside>
  );
}
