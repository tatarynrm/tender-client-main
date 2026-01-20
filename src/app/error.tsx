"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw, Home, ChevronLeft } from "lucide-react";
import { cn } from "@/shared/utils";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Логування помилки
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-slate-50 dark:bg-[#09090b] p-6">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        
        {/* Іконка з градієнтом */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-red-500/20 dark:bg-red-500/10 blur-3xl rounded-full" />
          <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-2xl shadow-red-500/20">
            <AlertCircle className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Текстовий блок */}
        <div className="space-y-3">
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
            Ой! Щось пішло не так
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
            Сталася непередбачувана помилка. Ми вже знаємо про це і працюємо над виправленням.
          </p>
          {error.digest && (
            <code className="inline-block px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-[10px] font-mono text-zinc-400 border border-zinc-200 dark:border-zinc-800">
              ID: {error.digest}
            </code>
          )}
        </div>

        {/* Кнопки дій */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="group flex items-center justify-center gap-2 w-full py-4 px-6 rounded-2xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/25 hover:bg-blue-700 active:scale-[0.98] transition-all"
          >
            <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            Спробувати знову
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={() => window.history.back()}
              className="flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-bold border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 active:scale-[0.98] transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
              Назад
            </button>
            
            <a
              href="/"
              className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 active:scale-[0.98] transition-all"
            >
              <Home className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Футер */}
        <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-[0.2em] opacity-50">
          Система логістики v2.0
        </p>
      </div>
    </div>
  );
}