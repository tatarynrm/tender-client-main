"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { LogOut, User, Settings, LayoutDashboard, X } from "lucide-react";

import { useProfileLogoutMutation } from "@/features/dashboard/profile/main/hooks";
import { useAuth } from "@/shared/providers/AuthCheckProvider";
import { LogoutButton } from "../Buttons/LogoutButton";

export function UserAvatarMenu() {
  const { profile } = useAuth();
  const { logout } = useProfileLogoutMutation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Закриття меню при кліку зовні
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        detailsRef.current &&
        !detailsRef.current.contains(event.target as Node)
      ) {
        detailsRef.current.removeAttribute("open");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Керування нативним діалогом
  useEffect(() => {
    if (isDialogOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isDialogOpen]);

  if (!profile) return null;

  const handleLogoutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    detailsRef.current?.removeAttribute("open");
    setIsDialogOpen(true);
  };

  const handleConfirmLogout = () => {
    logout();
    setIsDialogOpen(false);
  };

  // Формуємо ініціали з імені
  const avatarFallback = profile.person.name
    ? profile.person.name.charAt(0).toUpperCase()
    : "U";

  return (
    <>
      <details ref={detailsRef} className="relative list-none group">
        <summary className="list-none cursor-pointer outline-none">
          <div className="h-9 w-9 rounded-md border border-zinc-200 dark:border-white/10 overflow-hidden transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center bg-white dark:bg-slate-900">
  
              <span className="text-zinc-600 dark:text-zinc-300 font-bold text-sm tracking-tighter">
                {avatarFallback}
              </span>
        
          </div>
        </summary>

        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-zinc-200 dark:border-white/10 rounded-md shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-4 py-3 bg-zinc-50/50 dark:bg-white/5 border-b border-zinc-100 dark:border-white/5">
            <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-slate-900 dark:text-white truncate">
              {profile.person.name} {profile.person.surname}
            </p>
            <p className="text-[11px] text-zinc-500 truncate mt-0.5">
              {profile.email}
            </p>
          </div>

          {/* Links */}
          <nav className="p-1.5 flex flex-col gap-0.5">
            {/* <MenuLink href="/profile" icon={User} label="Мій профіль" />
            <MenuLink href="/dashboard" icon={LayoutDashboard} label="Панель керування" />
             */}
            {/* Показуємо налаштування лише адмінам, як приклад використання useAuth */}
            {/* {(profile.is_admin || profile.is_manager) && (
                <MenuLink href="/settings" icon={Settings} label="Налаштування" />
            )} */}

            <div className="my-1.5 h-[1px] bg-zinc-100 dark:bg-white/5" />
            <LogoutButton />
          </nav>
        </div>
      </details>

      {/* --- CONFIRMATION DIALOG --- */}
      <dialog
        ref={dialogRef}
        onClose={() => setIsDialogOpen(false)}
        className="fixed inset-0 z-[100] bg-transparent p-0 m-auto backdrop:bg-slate-950/40 backdrop:backdrop-blur-sm open:animate-in open:fade-in open:zoom-in-95 duration-200"
      >
        <div className="w-[calc(100vw-2rem)] max-w-sm bg-white dark:bg-slate-900 border border-zinc-200 dark:border-white/10 rounded-md shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-white/5">
            <h3 className="text-[12px] uppercase tracking-[0.2em] font-bold text-slate-900 dark:text-white">
              Підтвердження
            </h3>
            <button
              onClick={() => setIsDialogOpen(false)}
              className="text-zinc-400 hover:text-teal-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-6">
            <p className="text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed uppercase tracking-wide">
              Бажаєте вийти з облікового запису?
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 px-5 py-4 bg-zinc-50/50 dark:bg-white/5 border-t border-zinc-100 dark:border-white/5">
            <button
              onClick={() => setIsDialogOpen(false)}
              className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Ні
            </button>
            <button
              onClick={handleConfirmLogout}
              className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-md text-[10px] uppercase tracking-[0.2em] font-bold transition-all active:scale-95"
            >
              Так, вийти
            </button>
          </div>
        </div>
      </dialog>

      <style jsx>{`
        details > summary::-webkit-details-marker {
          display: none;
        }
        dialog::backdrop {
          animation: backdrop-fade 0.2s ease-out;
        }
        @keyframes backdrop-fade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}

function MenuLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: any;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-teal-50 dark:hover:bg-teal-500/10 hover:text-teal-600 dark:hover:text-teal-500 transition-all group"
    >
      <Icon
        size={16}
        strokeWidth={2.2}
        className="text-zinc-400 group-hover:text-teal-600 transition-colors"
      />
      <span className="text-[11px] uppercase tracking-[0.15em] font-bold">
        {label}
      </span>
    </Link>
  );
}
