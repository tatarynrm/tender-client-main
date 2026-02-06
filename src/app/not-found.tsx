"use client";

import Link from "next/link";
import { usePathname } from "next/navigation"; // Додаємо цей хук
import { useFontSize } from "@/shared/providers/FontSizeProvider";
import { MoveLeft, FileQuestion } from "lucide-react";
import { cn } from "@/shared/utils";

export default function NotFound() {
  const { config } = useFontSize();
  const pathname = usePathname();

  // Логіка визначення шляху повернення
  const getReturnLink = () => {
    if (pathname?.includes("/log")) return "/log";
    if (pathname?.includes("/admin")) return "/admin";
    return "/dashboard"; // за замовчуванням для dashboard та інших
  };

  const returnLink = getReturnLink();

  // 0739617714
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-[#020617] px-6 transition-colors duration-300">
      {/* Декоративні фонові елементи */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div
        className={cn(
          "relative z-10 w-full max-w-lg",
          "bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl",
          "border border-slate-200 dark:border-white/10",
          "p-12 rounded-[2.5rem] shadow-sm text-center",
        )}
      >
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-400">
            <FileQuestion size={48} strokeWidth={1.5} />
          </div>
        </div>

        <h1 className="font-black tracking-tighter text-slate-900 dark:text-white mb-2 text-7xl md:text-8xl">
          404
        </h1>

        <h2 className={cn("font-bold text-slate-800 dark:text-slate-200 mb-4", config.title)}>
          Сторінку не знайдено
        </h2>

        <p className={cn("text-slate-500 dark:text-slate-400 mb-8 mx-auto max-w-[280px]", config.label)}>
          Вибачте, але запитана сторінка не існує або була переміщена в архів.
        </p>

        <Link
          href={returnLink}
          className={cn(
            "inline-flex items-center gap-2 px-8 py-4",
            "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600",
            "text-white font-bold rounded-2xl transition-all duration-300",
            "hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/20",
            config.main,
          )}
        >
          <MoveLeft size={18} />
          Повернутися {returnLink === "/log" ? "до логістики" : returnLink === "/admin" ? "до адмін-панелі" : "на головну"}
        </Link>
      </div>

      <div className="absolute bottom-8 uppercase tracking-[0.2em] font-bold text-slate-400 dark:text-slate-600 text-[10px]">
        © {new Date().getFullYear()} ІСТендер • СИСТЕМА ЛОГІСТИКИ
      </div>
    </main>
  );
}