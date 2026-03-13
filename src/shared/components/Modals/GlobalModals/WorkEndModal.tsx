"use client";

import React from "react";
import { Home, X, Moon, Star } from "lucide-react";
import { AppButton } from "../../Buttons/AppButton";

export const WorkEndModal = ({ close }: { close: () => void }) => {
  return (
    <div className="relative   bg-white dark:bg-slate-900  shadow-2xl p-8 text-center border border-zinc-100 dark:border-white/5">


      {/* Іконка з нічним ефектом */}
      <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500">
        <Home size={32} strokeWidth={1.5} className="animate-pulse" />
      </div>

      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
        Робочий день завершено! 🏠
      </h3>

      <p className="text-slate-500 dark:text-zinc-400 text-[14px] mb-6 leading-relaxed">
        Вже 18:00. Ви чудово попрацювали сьогодні. Час вимкнути сповіщення,
        закрити ноутбук та приділити час собі та близьким.
      </p>

      {/* Побажання вечора */}
      <div className="relative mb-8 p-5 bg-indigo-50/50 dark:bg-indigo-500/5 rounded-2xl border border-indigo-100 dark:border-indigo-500/20">
        <div className="flex items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium text-[13px]">
          <Moon size={16} />
          <span>Гарного Вам Вечора!</span>
          <Star size={14} className="animate-spin-slow" />
        </div>
      </div>

      <div className="space-y-3">
        <AppButton
          onClick={close}
          className="w-full h-12 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/20 text-white font-bold"
        >
          Завершити роботу
        </AppButton>

        <button
          onClick={close}
          className="text-[11px] font-bold uppercase tracking-[0.1em] text-zinc-400 hover:text-indigo-600 transition-colors"
        >
          Я ще трохи попрацюю
        </button>
      </div>

      {/* Нічний декор */}
      <div className="absolute -bottom-4 -right-4 -z-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="absolute -top-4 -left-4 -z-10 h-32 w-32 rounded-full bg-purple-500/10 blur-3xl" />
    </div>
  );
};
