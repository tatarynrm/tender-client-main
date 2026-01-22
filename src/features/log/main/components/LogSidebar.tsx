"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Settings,
  ChevronRight,
  ChevronDown,
  BarChart,
  LayoutList,
  ScreenShare,
  Globe,
  FileStack,
  ShieldCheck,
  Archive,
  FileCode2Icon,
} from "lucide-react";

import { LogoutButton } from "@/shared/components/Buttons/LogoutButton";
import { IUserProfile } from "@/shared/types/user.types";
import { cn } from "@/shared/utils";

type MenuItem = {
  name: string;
  href?: string;
  icon?: React.ComponentType<any>;
  children?: MenuItem[];
  status?: "inactive";
  info?: string;
};
<ShieldCheck />;
const links: MenuItem[] = [
  { name: "Головна", href: "/log", icon: Home },
  {
    name: "Екран заявок",
    icon: ScreenShare,
    children: [
      { name: "Активні", icon: ShieldCheck, href: "/log/load/active" },
      { name: "Архів", icon: Archive, href: "/log/load/archive" },
    ],
  },
  {
    name: "Тендери",
    icon: LayoutList,
    href: "/log/tender",
  },
  {
    name: "Карта",
    icon: Globe,
    href: "/log/map",
  },
  {
    name: "Документи",
    icon: FileCode2Icon,
    href: "/log/documents",
  },
];

const defaultFooterLinks: MenuItem[] = [
  { name: "Налаштування", href: "/dashboard/settings", icon: Settings },
];

export default function LogSidebar({
  onSelect,
  profile,
}: {
  onSelect?: () => void;
  profile: IUserProfile;
}) {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const pathname = usePathname();

  useEffect(() => {
    const saved = localStorage.getItem("userSidebarOpenMenus");
    if (saved) setOpenMenus(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("userSidebarOpenMenus", JSON.stringify(openMenus));
  }, [openMenus]);

  const toggleMenu = (name: string) =>
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));

  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === "/log") return pathname === "/log";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const renderLink = (link: MenuItem, isChild = false) => {
    const { name, href, icon: Icon, children, status, info } = link;
    const activeParent = children?.some((child) => isActive(child.href));
    const active = isActive(href) || activeParent;
    const isInactive = status === "inactive";

    const commonClasses = cn(
      "flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-300 border mb-0.5",
      isChild && "ml-4",
    );

    if (!children) {
      if (isInactive) {
        return (
          <div
            key={name}
            className={cn(
              commonClasses,
              "text-slate-400 dark:text-slate-500 opacity-50 cursor-not-allowed border-transparent",
            )}
            title={info}
          >
            {Icon && <Icon className="w-5 h-5" />}
            <span className="font-medium">{name}</span>
          </div>
        );
      }

      return (
        <Link
          key={name}
          href={href!}
          onClick={onSelect}
          className={cn(
            commonClasses,
            active
              ? "bg-blue-50/50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20 shadow-sm"
              : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 border-transparent",
          )}
        >
          {Icon && (
            <Icon
              className={cn(
                "w-5 h-5 transition-colors",
                active ? "text-blue-500" : "text-slate-400 dark:text-slate-500",
              )}
            />
          )}
          <span className={active ? "font-semibold" : "font-medium"}>
            {name}
          </span>
        </Link>
      );
    }

    return (
      <div key={name}>
        <button
          onClick={() => toggleMenu(name)}
          className={cn(
            commonClasses,
            "w-full justify-between",
            active
              ? "bg-slate-50/80 dark:bg-white/5 text-blue-600 dark:text-blue-400 border-slate-100 dark:border-white/10"
              : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 border-transparent",
          )}
        >
          <div className="flex items-center gap-3">
            {Icon && (
              <Icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  active
                    ? "text-blue-500"
                    : "text-slate-400 dark:text-slate-500",
                )}
              />
            )}
            <span className="font-semibold">{name}</span>
          </div>
          {openMenus[name] ? (
            <ChevronDown className="w-4 h-4 opacity-50" />
          ) : (
            <ChevronRight className="w-4 h-4 opacity-50" />
          )}
        </button>

        <div
          className={cn(
            "ml-6 mt-1 flex flex-col gap-0.5 overflow-hidden transition-all duration-300 ease-in-out ",
            openMenus[name]
              ? "max-h-60 opacity-100"
              : "max-h-0 opacity-0 pointer-events-none",
          )}
        >
          {children.map((child) => renderLink(child, true))}
        </div>
      </div>
    );
  };

  const footerLinks = [...defaultFooterLinks];
  if (profile?.is_admin) {
    footerLinks.push(
      { name: "Адмін панель", href: "/admin", icon: BarChart },
      { name: "Основна платформа", href: "/dashboard", icon: FileStack },
    );
  }

  return (
    <aside className="relative flex flex-col w-64 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200 dark:border-white/10 h-[100dvh] transition-colors duration-300 shrink-0 z-9999">
      <div className="flex-1 min-h-[40vh] overflow-y-auto p-4 space-y-2 custom-scrollbar relative z-10">
        {links.map((link) => renderLink(link))}
      </div>

      <div className="border-t border-slate-200 dark:border-white/10 p-4 space-y-2 flex-shrink-0 bg-slate-50/30 dark:bg-black/10 backdrop-blur-md">
        {footerLinks.map((link) => renderLink(link))}
        <div className="flex justify-end mt-2 pt-2 border-t border-slate-100 dark:border-white/5">
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}
