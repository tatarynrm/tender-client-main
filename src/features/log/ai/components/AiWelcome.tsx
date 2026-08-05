"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ClipboardList,
  FileBarChart,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { AiOrb } from "./AiOrb";

interface Props {
  onPick: (text: string) => void;
}

/** Підказки ведуть на реальні tools бекенда — не декоративні приклади. */
const SUGGESTIONS: { icon: LucideIcon; title: string; query: string }[] = [
  {
    icon: Truck,
    title: "Затримані рейси",
    query: "Покажи затримані рейси за сьогодні",
  },
  {
    icon: ClipboardList,
    title: "Заявки клієнтів",
    query: "Заявки клієнтів за минулий тиждень",
  },
  {
    icon: FileBarChart,
    title: "Тендери за відділами",
    query: "Звіт по тендерах за відділами за минулий місяць",
  },
  {
    icon: Truck,
    title: "Історія авто",
    query: "Останній рейс авто BC1234AA",
  },
];

export function AiWelcome({ onPick }: Props) {
  return (
    <div className="flex flex-col items-center gap-8 py-10 text-center sm:py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <AiOrb size={72} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="max-w-md"
      >
        <h2 className="bg-gradient-to-r from-violet-300 via-fuchsia-200 to-pink-300 bg-clip-text text-xl font-semibold text-transparent sm:text-2xl">
          Чим допомогти?
        </h2>
        <p className="mt-2 text-sm text-zinc-500">
          Запитайте про рейси, заявки, тендери чи документи звичайною мовою.
          Помічник читає дані лише на перегляд — змінити нічого не може.
        </p>
      </motion.div>

      <div className="grid w-full max-w-2xl gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map((s, i) => (
          <motion.button
            key={s.query}
            type="button"
            onClick={() => onPick(s.query)}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18 + i * 0.06 }}
            className="group relative overflow-hidden rounded-2xl border border-violet-900/50 bg-white/[0.03] p-3.5 text-left backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-500/50 hover:shadow-[0_10px_30px_-18px_rgba(139,92,246,0.8)]"
          >
            {/* Підсвітка на ховері */}
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-500/[0.1] to-fuchsia-500/[0.04] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <span className="relative flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-violet-800/50 bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 text-violet-400 transition-colors group-hover:border-violet-500/60 group-hover:text-violet-300">
                <s.icon className="h-4 w-4" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1 text-sm font-medium text-zinc-200">
                  {s.title}
                  <ArrowUpRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-60" />
                </span>
                <span className="mt-0.5 block text-xs text-zinc-500">
                  {s.query}
                </span>
              </span>
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
