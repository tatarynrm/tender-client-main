"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  User,
} from "lucide-react";
import Link from "next/link";
import { IUserProfile } from "@/shared/types/user.types";
import Logo from "@/shared/components/Logo/Logo";
import { useProfileLogoutMutation } from "@/features/dashboard/profile/main/hooks";

const MainHeader = ({ profile }: { profile?: IUserProfile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useProfileLogoutMutation();
  // Блокуємо скрол при відкритому меню
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  const navLinks = [
    { name: "Можливості", href: "#features" },
    { name: "Як це працює", href: "#workflow" },
    { name: "Про нас", href: "#about" },
  ];

  return (
    <header className="sticky top-0 z-[100] backdrop-blur-md border-b border-white/5 bg-slate-950/50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* LOGO */}
        <Logo width={80} height={80} />

        {/* DESKTOP NAV */}
        <nav className="hidden lg:flex gap-8 text-sm font-medium text-slate-400">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="hover:text-white transition-colors"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* BURGER BUTTON (Visible on tablet/mobile) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden z-[110] p-2 text-white bg-white/5 rounded-xl border border-white/10"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* DESKTOP PROFILE (Hidden on tablet/mobile) */}
        <div className="hidden lg:block text-white"></div>
      </div>

      {/* MOBILE/TABLET MENU OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[9999] bg-slate-950 opacity-100 backdrop-blur-none flex flex-col p-6 lg:hidden w-screen h-screen"
          >
            {/* КНОПКА ЗАКРИТТЯ ВСЕРЕДИНІ МЕНЮ */}
            <div className="absolute top-4 right-4 z-[10000]">
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-white bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
              >
                <X size={28} />
              </button>
            </div>

            {/* ЛОГОТИП У МЕНЮ (опціонально, щоб не було пусто зверху) */}
            <div className="absolute top-4 left-4">
              <Logo width={60} height={60} />
            </div>

            {/* Декор */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[40%] bg-teal-500/15 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative mt-24 flex flex-col h-full z-10">
              {/* Profile Section */}
              {profile ? (
                <div className="mb-8 p-4 rounded-2xl bg-white/5 border border-white/10 shadow-xl">
                  <p className="text-slate-400 text-[10px] uppercase tracking-widest mb-1">
                    Ваш аккаунт
                  </p>
                  <p className="text-lg font-bold text-white mb-3">
                    {profile.company_name}
                  </p>
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between p-3 bg-teal-500/10 rounded-xl text-teal-400 text-sm active:scale-95 transition-transform"
                    >
                      <span className="flex items-center gap-2">
                        <LayoutDashboard size={16} /> Кабінет
                      </span>
                      <ChevronRight size={14} />
                    </Link>
                    <button
                      onClick={() => logout()}
                      className="flex items-center gap-2 p-3 text-rose-400 text-sm opacity-80 active:scale-95 transition-transform"
                    >
                      <LogOut size={16} /> Вийти
                    </button>
                  </div>
                </div>
              ) : (
                /* ЗМЕНШЕНІ КНОПКИ ТУТ */
                <div className="flex flex-row gap-3 mb-10">
                  <Link
                    href="/auth/register"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-teal-500 to-indigo-500 rounded-xl text-center text-sm font-semibold text-white shadow-lg active:scale-95 transition-transform"
                  >
                    Реєстрація
                  </Link>
                  <Link
                    href="/auth/login"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-center text-sm font-semibold text-white active:scale-95 transition-transform"
                  >
                    Увійти
                  </Link>
                </div>
              )}

              {/* Navigation Links */}
              <p className="text-slate-500 text-xs uppercase tracking-widest mb-4 ml-2">
                Навігація
              </p>
              <nav className="flex flex-col gap-2">
                {navLinks.map((link, idx) => (
                  <motion.a
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 * idx }}
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-3xl font-bold text-slate-200 hover:text-teal-400 active:text-teal-400 transition-colors py-2 flex items-center justify-between group"
                  >
                    {link.name}
                    <ChevronRight className="text-teal-400" />
                  </motion.a>
                ))}
              </nav>

              <div className="mt-auto pb-10 text-center">
                <p className="text-slate-600 text-sm">
                  © 2026 Тендерна Платформа
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default MainHeader;
