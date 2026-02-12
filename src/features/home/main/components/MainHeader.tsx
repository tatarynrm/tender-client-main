"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import { IUserProfile } from "@/shared/types/user.types";
import Logo from "@/shared/components/Logo/Logo";
import { LogoutButton } from "@/shared/components/Buttons/LogoutButton";


const MainHeader = ({ profile }: { profile?: IUserProfile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  return (
    <header className="sticky top-0 z-[100] backdrop-blur-md border-b border-white/5 bg-slate-950/50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Logo width={80} height={80} />

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden z-[110] p-2 text-white bg-white/5 rounded-xl border border-white/10"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        <div className="hidden lg:block text-white"></div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col p-6 lg:hidden w-screen h-screen"
          >
            <div className="absolute top-4 right-4 z-[10000]">
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-white bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
              >
                <X size={28} />
              </button>
            </div>

            <div className="absolute top-4 left-4">
              <Logo width={60} height={60} />
            </div>

            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[40%] bg-teal-500/15 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative mt-24 flex flex-col h-full z-10">
              {profile ? (
                <div className="mb-8 p-4 rounded-2xl bg-white/5 border border-white/10 shadow-xl">
                  <p className="text-slate-400 text-[10px] uppercase tracking-widest mb-1">
                    Ваш аккаунт
                  </p>
                  <p className="text-lg font-bold text-white mb-3">
                    {profile.company.company_name || `${profile.person.surname} ${profile.person.name}`}
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

                    {/* ВИКОРИСТОВУЄМО ОНОВЛЕНУ КНОПКУ ВИХОДУ */}
                    <LogoutButton onBeforeOpen={() => setIsOpen(false)} />
                  </div>
                </div>
              ) : (
                <div className="flex flex-row gap-3 mb-10">
                  {isDisabled ? (
                    <button
                      disabled
                      className="flex-1 py-3 px-4 bg-zinc-800 text-zinc-500 rounded-xl text-center text-[11px] uppercase tracking-widest font-bold cursor-not-allowed opacity-60"
                    >
                      Реєстрація
                    </button>
                  ) : (
                    <Link
                      href="/auth/register"
                      onClick={() => setIsOpen(false)}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-teal-500 to-indigo-500 rounded-xl text-center text-[11px] uppercase tracking-widest font-bold text-white shadow-lg active:scale-95 transition-transform"
                    >
                      Реєстрація
                    </Link>
                  )}
                  <Link
                    href="/auth/login"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-center text-[11px] uppercase tracking-widest font-bold text-white active:scale-95 transition-transform hover:bg-white/10"
                  >
                    Увійти
                  </Link>
                </div>
              )}

              <div className="mt-auto pb-10 text-center">
                <p className="text-slate-600 text-[10px] uppercase tracking-[0.2em]">
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