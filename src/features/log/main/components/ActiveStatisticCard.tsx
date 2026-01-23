import React from "react";
import { MoveUpRight, MoveDownLeft, Map, Truck, BarChart3 } from "lucide-react";
import { cn } from "@/shared/utils";
import { ActiveStats } from "../../types/crm.types";

interface Props {
  data: ActiveStats;
  className?: string;
}

export const ActiveStatsGrid = ({ data, className }: Props) => {
  const items = [
    { label: "Експорт", value: data.export, icon: <MoveUpRight size={12} />, color: "bg-emerald-500/10", iconColor: "text-emerald-500" },
    { label: "Імпорт", value: data.import, icon: <MoveDownLeft size={12} />, color: "bg-blue-500/10", iconColor: "text-blue-500" },
    { label: "Регіон", value: data.region, icon: <Map size={12} />, color: "bg-amber-500/10", iconColor: "text-amber-500" },
    { label: "Транзит", value: data.transit, icon: <Truck size={12} />, color: "bg-purple-500/10", iconColor: "text-purple-500" },
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
          <div className="p-1 bg-blue-600 rounded text-white">
            <BarChart3 size={12} />
          </div>
          <h3 className="text-[10px] font-bold uppercase tracking-tight text-slate-500 leading-none">
            Активні
          </h3>
        </div>
        <p className="text-sm font-black text-blue-600 dark:text-blue-400">{data.all}</p>
      </div>

      {/* Список з мінімальними відступами */}
      <div className="flex flex-col gap-0.5 w-full">
        {items.map((item) => (
          <div
            key={item.label}
            className="group px-2 py-1 flex items-center justify-between rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className={cn("p-1 rounded", item.color, item.iconColor)}>
                {item.icon}
              </div>
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                {item.label}
              </span>
            </div>

            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};