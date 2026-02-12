
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  User,
  Settings,
  ChevronRight,
  ChevronDown,
  BarChart,
  Users,
  LayoutList,
  Building2,
  UserRoundPen,
  FileStack,
  Shield,
  ShieldPlus,
  FileArchive,
  Car,
  HousePlug,
  PersonStandingIcon,
} from "lucide-react";
import { LogoutButton } from "@/shared/components/Buttons/LogoutButton";
import { IUserProfile } from "@/shared/types/user.types";
import { FaCar } from "react-icons/fa";

type MenuItem = {
  name: string;
  href?: string;
  icon?: React.ComponentType<any>;
  children?: MenuItem[];
  status?: "inactive";
  info?: string;
};

const links: MenuItem[] = [
  { name: "Головна", href: "/dashboard", icon: Home },
  {
    name: "Кабінет перевізника",
    icon: Car,
    children: [
      { name: "Головна", href: "/dashboard/cabinet/main", icon: HousePlug },
      {
        name: "Мої первезення",
        href: "/dashboard/cabinet/transportations",
        icon: Shield,
      },
      {
        name: "Графік оплат",
        href: "/dashboard/cabinet/pay",
        icon: ShieldPlus,
      },
      {
        name: "Відправлені АВР",
        href: "/dashboard/cabinet/sended-documents",
        icon: FileArchive,
      },
      {
        name: "Мій автопарк",
        href: "/dashboard/cabinet/car-park",
        icon: FaCar,
      },
      {
        name: "Персонал",
        href: "/dashboard/cabinet/employees",
        icon: PersonStandingIcon,
      },
    ],
  },
  {
    name: "Тендери",
    icon: LayoutList,
    href: "/dashboard/tender",
  },
  {
    name: "Персональні дані",
    icon: User,
    children: [
      {
        name: "Компанія",
        href: "/dashboard/personal/my-company",
        icon: Building2,
      },
      {
        name: "Мій профіль",
        href: "/dashboard/personal/profile",
        icon: UserRoundPen,
      },
      {
        name: "Документи",
        href: "/dashboard/personal/documents",
        icon: FileStack,
      },
    ],
  },
  { name: "Користувачі", href: "/dashboard/users", icon: Users },
];

const defaultFooterLinks: MenuItem[] = [
  { name: "Налаштування", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar({
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
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const renderLink = (link: MenuItem, isChild = false) => {
    const { name, href, icon: Icon, children, status, info } = link;
    const activeParent = children?.some((child) => isActive(child.href));
    const active = isActive(href) || activeParent;
    const isInactive = status === "inactive";

    if (!children) {
      if (isInactive) {
        return (
          <div
            key={name}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 dark:text-slate-500 opacity-50 cursor-not-allowed relative border border-transparent"
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
          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-300 border ${
            active
              ? "bg-blue-50/50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20 shadow-sm"
              : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 border-transparent"
          } ${isChild ? "ml-4" : ""}`}
        >
          {Icon && (
            <Icon
              className={`w-5 h-5 transition-colors ${
                active ? "text-blue-500" : "text-slate-400 dark:text-slate-500"
              }`}
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
          className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-sm transition-all duration-300 border ${
            active
              ? "bg-slate-50/80 dark:bg-white/5 text-blue-600 dark:text-blue-400 border-slate-100 dark:border-white/10"
              : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 border-transparent"
          }`}
        >
          <div className="flex items-center gap-3">
            {Icon && (
              <Icon
                className={`w-5 h-5 transition-colors ${
                  active
                    ? "text-blue-500"
                    : "text-slate-400 dark:text-slate-500"
                }`}
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
          className={`ml-6 mt-1 flex flex-col gap-1 overflow-hidden transition-all duration-300 ease-in-out ${
            openMenus[name]
              ? "max-h-60 opacity-100"
              : "max-h-0 opacity-0 pointer-events-none"
          }`}
        >
          {children.map((child) => renderLink(child, true))}
        </div>
      </div>
    );
  };

  const footerLinks = [...defaultFooterLinks];
  if (profile?.role.is_admin && profile.role.is_ict ) {
    footerLinks.push(
      { name: "Адмін панель", href: "/admin", icon: BarChart },
      { name: "CRM система", href: "/log", icon: FileStack }
    );
  }

  return (
    <aside className="relative flex flex-col w-64 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200 dark:border-white/10 h-[100dvh] transition-colors duration-300 shrink-0">
      {/* Меню зі скролом */}
      <div className="flex-1 min-h-[40vh] overflow-y-auto p-4 space-y-2 custom-scrollbar relative z-10">
        {links.map((link) => renderLink(link))}
      </div>

      {/* Footer завжди внизу */}
      <div className="border-t border-slate-200 dark:border-white/10 p-4 space-y-2 flex-shrink-0 bg-slate-50/30 dark:bg-black/10 backdrop-blur-md">
        {footerLinks.map((link) => renderLink(link))}
        <div className="flex justify-end mt-2 pt-2 border-t border-slate-100 dark:border-white/5">
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}
