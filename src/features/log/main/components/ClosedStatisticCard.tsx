import React from "react";
import { CheckCircle2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/shared/utils";
import { PeriodStats } from "../../types/crm.types";

interface Props {
  title: string;
  data: PeriodStats;
  className?: string;
  icon?: React.ReactNode;
  iconBgColor?: string;
}

export const ClosedStatisticCard = ({
  title,
  data,
  className,
  icon = <CheckCircle2 size={12} />,
  iconBgColor = "bg-emerald-600",
}: Props) => {
  const getDiff = (current: number, prev: number) => {
    const diff = current - prev;
    if (diff > 0)
      return {
        text: `+${diff}`,
        color: "text-emerald-500",
        icon: <TrendingUp size={10} />,
      };
    if (diff < 0)
      return {
        text: `${diff}`,
        color: "text-rose-500",
        icon: <TrendingDown size={10} />,
      };
    return { text: "0", color: "text-slate-400", icon: <Minus size={10} /> };
  };

  const stats = [
    { label: "Сьогодні", current: data.day_current, prev: data.day_prev },
    { label: "Тиждень", current: data.week_current, prev: data.week_prev },
    { label: "Місяць", current: data.month_current, prev: data.month_prev },
  ];

  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-white/10 shadow-sm w-full ",
        className,
      )}
    >
      {/* Ультра-компактний заголовок */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className={cn("p-1 rounded text-white", iconBgColor)}>
            {icon}
          </div>
          <h3 className="text-[10px] font-bold uppercase tracking-tight text-slate-500 leading-none">
            {title}
          </h3>
        </div>
        <p
          className={cn(
            "text-sm font-black",
            iconBgColor.replace("bg-", "text-"),
          )}
        >
          {data.month_current}
        </p>
      </div>

      {/* Список періодів */}
      <div className="flex flex-col gap-0.5 w-full">
        {stats.map((item) => {
          const diff = getDiff(item.current, item.prev);
          return (
            <div
              key={item.label}
              className="group px-2 py-1 flex items-center justify-between rounded-md   transition-colors"
            >
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-bold text-slate-400 leading-tight">
                  {item.label}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    {item.current}
                  </span>
       
                </div>
              </div>

              {/* Попередній період: з'являється при ховері */}
              <div className="text-right">
                <p className="text-[8px] uppercase font-medium text-slate-400 leading-none opacity-0 group-hover:opacity-100 transition-opacity">
                  Минулий
                </p>
                <p className="text-[11px] font-bold text-slate-500/80 leading-tight">
                  {item.prev}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
