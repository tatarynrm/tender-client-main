"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  FilePlus2,
  Gavel,
  UserPlus,
  Truck,
  Container,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/shared/utils";

export default function DynamicHeaderMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  // Закриття при кліку поза межами
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Закриття при переході на іншу сторінку
  useEffect(() => setIsOpen(false), [pathname]);

  const menus = [
    {
      match: "/log",
      items: [
        { href: "/log/load/add", label: "Нова заявка", icon: FilePlus2 },
        // { href: "/log/tender/add", label: "Новий тендер", icon: Gavel },
      ],
    },
    {
      match: "/dashboard",
      items: [
        { href: "/dashboard/users", label: "Новий користувач", icon: UserPlus },
        { href: "/dashboard/vehicles/add", label: "Додати тягач", icon: Truck },
        {
          href: "/dashboard/trailers/add",
          label: "Додати причіп",
          icon: Container,
        },
      ],
    },
  ];

  const currentMenu = menus.find((m) => pathname.startsWith(m.match));

  // Якщо для цього шляху немає меню — нічого не рендеримо
  if (!currentMenu) return null;

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-10 w-10 flex items-center justify-center rounded-xl border transition-all duration-300 shadow-sm group",
          isOpen
            ? "border-teal-500 bg-teal-50 dark:bg-teal-500/10 shadow-md shadow-teal-500/10"
            : "border-zinc-200 dark:border-white/10 bg-white dark:bg-slate-900 hover:border-teal-500",
        )}
      >
        <Plus
          className={cn(
            "w-5 h-5 transition-transform duration-300 ease-out",
            isOpen
              ? "rotate-45 text-teal-600"
              : "text-zinc-500 group-hover:text-teal-600",
          )}
        />
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-64 p-2 rounded-[24px] border border-zinc-100 dark:border-white/5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-2xl z-[100] origin-top-right"
          >
            {/* Header Label */}
            <div className="px-3 py-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                Швидкі дії
              </span>
            </div>

            {/* Menu List */}
            <div className="space-y-1">
              {currentMenu.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between w-full px-3 py-2.5 rounded-2xl transition-all duration-200 group",
                      isActive
                        ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20"
                        : "text-slate-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex items-center justify-center h-8 w-8 rounded-xl transition-colors",
                          isActive
                            ? "bg-white/20"
                            : "bg-zinc-50 dark:bg-white/5 group-hover:bg-teal-50 dark:group-hover:bg-teal-500/10 text-zinc-400 group-hover:text-teal-600",
                        )}
                      >
                        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                      </div>
                      <span className="text-[13px] font-semibold tracking-wide">
                        {item.label}
                      </span>
                    </div>

                    {!isActive && (
                      <ChevronRight
                        size={14}
                        className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200 text-teal-600"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
