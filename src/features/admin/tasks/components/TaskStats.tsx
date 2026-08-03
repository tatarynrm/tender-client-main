"use client";

import { ListChecks } from "lucide-react";
import { cn } from "@/shared/utils";
import { ITask } from "../types/task.type";
import { TASK_STATUSES } from "../constants/task.constants";

interface Props {
  tasks: ITask[];
}

export function TaskStats({ tasks }: Props) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
      {/* Прогрес */}
      <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white/60 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/40 sm:col-span-2">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="rounded-2xl border border-indigo-100 bg-indigo-500/10 p-2.5 dark:border-indigo-400/20">
            <ListChecks className="text-indigo-600 dark:text-indigo-400" size={20} />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Прогрес
            </div>
            <div className="text-2xl font-black tabular-nums tracking-tight text-slate-900 dark:text-white">
              {done}
              <span className="text-base text-slate-300 dark:text-slate-600"> / {total}</span>
            </div>
          </div>
          <span className="ml-auto text-2xl font-black tabular-nums text-indigo-600 dark:text-indigo-400">
            {percent}%
          </span>
        </div>

        <div className="relative z-10 mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-700"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Розбивка за статусами */}
      {TASK_STATUSES.map((status) => {
        const count = tasks.filter((t) => t.status === status.id).length;
        const Icon = status.icon;

        return (
          <div
            key={status.id}
            className="rounded-[1.75rem] border border-slate-200 bg-white/60 p-5 backdrop-blur-xl transition-all hover:border-indigo-500/20 hover:shadow-md dark:border-white/10 dark:bg-slate-900/40"
          >
            <Icon size={18} className={cn("mb-3", status.accent)} />
            <div className="text-2xl font-black tabular-nums tracking-tight text-slate-900 dark:text-white">
              {count}
            </div>
            <div className="mt-0.5 text-[9px] font-black uppercase tracking-widest text-slate-400">
              {status.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
