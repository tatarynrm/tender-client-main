// @/app/dashboard/components/main-page-components/StatsCard.tsx
"use client";

import { useFontSize } from "@/shared/providers/FontSizeProvider";
import React, { ReactNode } from "react";

interface Props {
  label: string;
  value?: number;
  icon: ReactNode;
  trend?: string;
  description?: string;
  subValue?: string;
  targetProgress?: number;
}

export const StatsCard = ({
  label,
  value,
  icon,
  trend,
  description,
  subValue,
  targetProgress,
}: Props) => {
  const { config } = useFontSize();

  // Клонуємо іконку, щоб динамічно змінити її розмір
  const resizedIcon = React.isValidElement(icon)
    ? React.cloneElement(icon as React.ReactElement<any>, {
        size: config.icon,
        strokeWidth: 2.5,
      })
    : icon;

  return (
    <div
      className="relative overflow-hidden group 
      bg-white/80 dark:bg-slate-900/50 
      backdrop-blur-md 
      border border-slate-200 dark:border-white/10 
      p-6 rounded-[2rem] transition-all hover:shadow-2xl hover:shadow-blue-500/5 hover:scale-[1.01]"
    >
      {/* Декоративний акцент */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl text-slate-700 dark:text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
          {resizedIcon}
        </div>

        {trend && (
          <div className="flex flex-col items-end">
            <span
              className={`font-bold text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-1 rounded-lg ${config.label}`}
            >
              +{trend}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">
              vs Month
            </span>
          </div>
        )}
      </div>

      <div className="space-y-1 relative z-10">
        {/* Використовуємо config.label для назви картки */}
        <p
          className={`${config.label} text-slate-500 dark:text-slate-400 font-medium`}
        >
          {label}
        </p>

        <div className="flex items-baseline gap-2">
          {/* Використовуємо config.title для основного числа (воно буде масштабуватися) */}
          <h3
            className={`${config.title} font-black tracking-tight text-slate-900 dark:text-white leading-none`}
          >
            {value?.toLocaleString() ?? 0}
          </h3>

          {subValue && (
            <span
              className={`${config.main} font-semibold text-blue-500 dark:text-blue-400 opacity-80`}
            >
              / {subValue}
            </span>
          )}
        </div>

        {description && (
          <p
            className={`${config.label} text-slate-400 dark:text-slate-500 font-medium`}
          >
            {description}
          </p>
        )}
      </div>

      {targetProgress !== undefined && (
        <div className="mt-5 space-y-2">
          <div className="flex justify-between text-[10px] uppercase tracking-wider font-bold text-slate-400">
            <span>Target Progress</span>
            <span>{targetProgress}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(59,130,246,0.5)]"
              style={{ width: `${targetProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
