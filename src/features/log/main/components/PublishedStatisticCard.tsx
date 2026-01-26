import React from "react";
import { CalendarDays, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/shared/utils";
import { PeriodStats } from "../../types/crm.types";

interface Props {
  title: string;
  data: PeriodStats;
  className?: string;
}

export const PublishedStatisticCard = ({ title, data, className }: Props) => {
  // Функція безпечного розрахунку різниці
  const getDiff = (current: number = 0, prev: number = 0) => {
    const diff = current - prev;
    if (diff > 0) return { text: `+${diff}`, color: "text-emerald-500", icon: <TrendingUp size={10} /> };
    if (diff < 0) return { text: `${diff}`, color: "text-rose-500", icon: <TrendingDown size={10} /> };
    return { text: "0", color: "text-slate-400", icon: <Minus size={10} /> };
  };

  // Використовуємо опціональне звернення або значення за замовчуванням
  const stats = [
    { label: "Сьогодні", current: data?.day_current || 0, prev: data?.day_prev || 0 },
    { label: "Тиждень", current: data?.week_current || 0, prev: data?.week_prev || 0 },
    { label: "Місяць", current: data?.month_current || 0, prev: data?.month_prev || 0 },
  ];

  return (
    <div className={cn("bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 shadow-sm w-full", className)}>
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-indigo-600 rounded text-white">
            <CalendarDays size={12} />
          </div>
          <h3 className="text-[10px] font-bold uppercase tracking-tight text-slate-500">{title}</h3>
        </div>
        <p className="text-sm font-black text-indigo-600">{data?.month_current || 0}</p>
      </div>

      <div className="flex flex-col gap-0.5 w-full">
        {stats.map((item) => {
          const diff = getDiff(item.current, item.prev);
          return (
            <div key={item.label} className="group px-2 py-1 flex items-center justify-between rounded-md  transition-colors">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-bold text-slate-400 leading-tight">{item.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{item.current}</span>
             
                </div>
              </div>
              <div className="text-right">
                <p className="text-[8px] uppercase font-medium text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">Минулий</p>
                <p className="text-[11px] font-bold text-slate-500/80">{item.prev}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};