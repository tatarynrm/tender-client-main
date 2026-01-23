"use client";

import { useFontSize } from "@/shared/providers/FontSizeProvider";

export const CustomTooltip = ({ active, payload, label }: any) => {
  const { config } = useFontSize();


  if (active && payload && payload.length) {
    return (
      <div
        className="
        bg-white/90 dark:bg-slate-900/90 
        backdrop-blur-xl 
        border border-slate-200 dark:border-white/10 
        p-4 rounded-2xl shadow-2xl 
        ring-1 ring-black/5 dark:ring-white/5 
        animate-in zoom-in-95 duration-200"
      >
        {/* Заголовок (наприклад, Місяць) */}
        <p
          className={`${config.label} font-bold text-slate-500 dark:text-slate-400 mb-2 border-b border-slate-100 dark:border-white/5 pb-1`}
        >
          {label}
        </p>

        {/* Список даних */}
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-3">
              {/* Кольоровий індикатор (крапка) */}
              <div
                className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]"
                style={{ backgroundColor: entry.color, color: entry.color }}
              />
              <div className="flex flex-col">
                <span
                  className={`${config.label} text-slate-400 dark:text-slate-500 uppercase text-[10px] font-black`}
                >
                  {entry.name}
                </span>
                <span
                  className={`${config.main} font-bold text-slate-900 dark:text-white`}
                >
                  {entry.value.toLocaleString()}
                  <span className="ml-1 text-[10px] font-medium text-emerald-500">
                    +4%
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};
