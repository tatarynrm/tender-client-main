"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Button,
  buttonVariants,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui";
import { IUserProfile } from "@/shared/types/user.types";
import { ChevronDown, User, LayoutDashboard, LogOut } from "lucide-react"; // Іконки для краси
import { useProfileLogoutMutation } from "@/features/dashboard/profile/main/hooks";

const HeroSection = ({ profile }: { profile?: IUserProfile }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Керуємо станом меню
  const { logout } = useProfileLogoutMutation();

  const handleConfirmLogout = () => {
    logout();
    setIsDialogOpen(false);
  };
  return (
    <section className="relative z-10 flex flex-col items-center mt-12 text-center px-4">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-teal-400 via-cyan-300 to-indigo-400 text-transparent bg-clip-text drop-shadow-[0_0_25px_rgba(56,189,248,0.6)]"
      >
        Cучасна тендерна платформа
      </motion.h1>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="flex gap-4 flex-wrap justify-center mt-10 relative"
      >
        {!profile ? (
          /* ВАРІАНТ 1: Користувач НЕ авторизований */
          <>
            <Link
              href="/auth/register"
              className={`${buttonVariants()} px-8 py-4 text-lg rounded-full shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:shadow-teal-400/70 transition-all bg-gradient-to-r from-teal-500 to-indigo-500 text-white`}
            >
              🚛 Зареєструватися
            </Link>
            <Link
              href="/auth/login"
              className={`${buttonVariants({
                variant: "outline",
              })} px-8 py-4 text-lg rounded-full border border-teal-400 text-white bg-transparent  transition-all`}
            >
              📑 Увійти
            </Link>
          </>
        ) : (
          /* ВАРІАНТ 2: Користувач АВТОРИЗОВАНИЙ (Дропдаун) */
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`${buttonVariants()} px-8 py-4 text-lg rounded-full flex items-center gap-2 bg-gradient-to-r from-teal-500 to-indigo-500 text-white shadow-lg`}
            >
              <User size={20} />
              {profile.company.company_name || "Мій кабінет"}
              <ChevronDown
                size={18}
                className={`transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <>
                  {/* Прозорий шар для закриття при кліку поза меню */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsDropdownOpen(false)}
                  />

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full mt-3 right-0 w-64 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-20 backdrop-blur-xl"
                  >
                    <div className="p-4 border-b border-white/5 bg-white/5">
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                        Авторизовано як
                      </p>
                      <p className="text-white font-medium truncate">
                        {profile.company.company_name || `${profile.person.surname} ${profile.person.name}`}
                      </p>
                    </div>

                    <div className="p-2">
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                      >
                        <LayoutDashboard size={18} className="text-teal-400" />
                        Панель керування
                      </Link>

                      <button
                        onClick={() => setIsDialogOpen(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                      >
                        <LogOut size={18} />
                        Вийти з аккаунту
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
      {/* Модальне підтвердження */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Вихід із системи</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Ви впевнені, що хочете вийти із системи?
            </p>
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Ні
            </Button>
            <Button variant="destructive" onClick={handleConfirmLogout}>
              Так
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default HeroSection;
