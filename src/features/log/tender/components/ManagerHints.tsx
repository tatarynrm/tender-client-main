"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, BellRing, Users, Zap, ShieldCheck } from "lucide-react";
import { cn } from "@/shared/utils";

interface Hint {
  id: number;
  icon: any;
  text: string;
  color: string;
}

const hints: Hint[] = [
  {
    id: 1,
    icon: Zap,
    text: "Тендер зараз активний. Слідкуйте за динамікою ставок у реальному часі.",
    color:
      "text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400",
  },
  {
    id: 2,
    icon: Users,
    text: "Якщо активність низька — надішліть персональні запрошення перевізникам.",
    color:
      "text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400",
  },
  {
    id: 3,
    icon: BellRing,
    text: "Ви можете надіслати загальне сповіщення всім учасникам через меню дій.",
    color:
      "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  {
    id: 4,
    icon: ShieldCheck,
    text: "Перевіряйте документи нових учасників перед завершенням торгів.",
    color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400",
  },
];

import { useProfile } from "@/shared/hooks";

export const ManagerHints = ({ ids_status }: { ids_status: string }) => {
  const { profile } = useProfile();

  // Показуємо лише для менеджерів та лише в активному статусі

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[2rem] border border-indigo-100 dark:border-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-500/5 p-4 mb-4"
    >
      {/* Декоративний фон */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex items-center gap-3 mb-3 border-b border-indigo-100 dark:border-indigo-500/10 pb-2">
        <Zap className="text-amber-500 w-4 h-4 fill-amber-500/20" />
        <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-900 dark:text-indigo-300">
          Поради для менеджера (Тендер Активний)
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {hints.map((hint, idx) => (
          <div key={hint.id} className="flex items-start gap-3 group">
            <div
              className={cn(
                "shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                hint.color.split(" ")[1], // Використовуємо фоновий колір з hint.color
              )}
            >
              <hint.icon
                size={14}
                className={hint.color.split(" ")[0]}
                strokeWidth={3}
              />
            </div>
            <p className="text-[10px] font-bold leading-tight text-zinc-600 dark:text-zinc-400 uppercase tracking-tight">
              {hint.text}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
