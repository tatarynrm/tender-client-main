"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ClipboardList,
  FileBarChart,
  FileText,
  Truck,
  type LucideIcon,
} from "lucide-react";

interface Props {
  onPick: (text: string) => void;
}

/**
 * Підказки ведуть на реальні джерела даних.
 *
 * Рейси, авто й водії звідси прибрані свідомо: вони живуть в Oracle, а це
 * джерело для помічника вимкнене (LOCAL_AI_ORACLE_ENABLED). Підказка, яка
 * гарантовано впирається у «таких даних немає», — гірша за її відсутність.
 */
const SUGGESTIONS: { icon: LucideIcon; title: string; query: string }[] = [
  {
    icon: FileBarChart,
    title: "Тендери за відділами",
    query: "Звіт по тендерах за відділами за минулий місяць",
  },
  {
    icon: ClipboardList,
    title: "Заявки клієнтів",
    query: "Заявки клієнтів за минулий тиждень",
  },
  {
    icon: Truck,
    title: "Активність перевізників",
    query: "Топ перевізників за кількістю ставок за останні 30 днів",
  },
  {
    icon: FileText,
    title: "Пошук документів",
    query: "Знайди документи, у назві яких є «договір»",
  },
];

export function AiWelcome({ onPick }: Props) {
  return (
    /*
      Верхній відступ тримає місце під мех-спостерігача: він живе окремим шаром
      у LocalAiChat (щоб не перемонтовувати WebGL на кожну розмову), тому
      в потоці його немає. Висоти узгоджені: робот h-44 / sm:h-56 + top-4.
    */
    <div className="flex flex-col items-center gap-8 pt-52 pb-10 text-center sm:pt-64 sm:pb-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="max-w-md"
      >
        <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl dark:text-slate-100">
          Чим допомогти?
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Запитайте про тендери, ставки, заявки чи документи звичайною мовою.
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
            className="group rounded-xl border border-slate-200 bg-white p-3.5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-white/10 dark:bg-slate-800/50 dark:hover:border-blue-500/40"
          >
            <span className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:group-hover:bg-blue-500/20">
                <s.icon className="h-4 w-4" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1 text-sm font-medium text-slate-800 dark:text-slate-200">
                  {s.title}
                  <ArrowUpRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-60" />
                </span>
                <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
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
