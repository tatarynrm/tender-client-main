"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/shared/utils";
import { TaskStatus } from "../types/task.type";
import { TASK_STATUSES } from "../constants/task.constants";

export interface TaskFiltersValue {
  search: string;
  status: TaskStatus | "ALL";
  assignee: string;
  section: string;
}

interface Props {
  value: TaskFiltersValue;
  onChange: (value: TaskFiltersValue) => void;
  assignees: string[];
  sections: string[];
  counts: Record<string, number>;
}

const selectClass =
  "rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-[11px] font-bold outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-slate-900";

export function TaskFilters({ value, onChange, assignees, sections, counts }: Props) {
  const set = <K extends keyof TaskFiltersValue>(key: K, next: TaskFiltersValue[K]) =>
    onChange({ ...value, [key]: next });

  const isDirty =
    value.search || value.status !== "ALL" || value.assignee !== "ALL" || value.section !== "ALL";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="group relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-500" />
          <input
            type="text"
            value={value.search}
            onChange={(e) => set("search", e.target.value)}
            placeholder="Пошук за завданням, виконавцем або коментарем…"
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm shadow-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-slate-900"
          />
        </div>

        <select
          value={value.assignee}
          onChange={(e) => set("assignee", e.target.value)}
          className={selectClass}
        >
          <option value="ALL">Усі виконавці</option>
          {assignees.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        <select
          value={value.section}
          onChange={(e) => set("section", e.target.value)}
          className={selectClass}
        >
          <option value="ALL">Усі розділи</option>
          {sections.map((section) => (
            <option key={section} value={section}>
              {section}
            </option>
          ))}
        </select>

        {isDirty && (
          <button
            type="button"
            onClick={() =>
              onChange({ search: "", status: "ALL", assignee: "ALL", section: "ALL" })
            }
            className="flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5"
          >
            <X size={13} />
            Скинути
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {[{ id: "ALL" as const, label: "Всі" }, ...TASK_STATUSES].map((item) => {
          const active = value.status === item.id;
          const Icon = "icon" in item ? item.icon : null;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => set("status", item.id as TaskStatus | "ALL")}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-4 py-2 text-[10px] font-black uppercase tracking-wider transition-all",
                active
                  ? "border-indigo-500 bg-white text-indigo-600 shadow-md ring-2 ring-indigo-500/10 dark:bg-slate-800"
                  : "border-transparent bg-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5",
              )}
            >
              {Icon && <Icon size={13} className={active ? "text-indigo-500" : "text-slate-400"} />}
              {item.label}
              <span
                className={cn(
                  "rounded-md px-1.5 py-0.5 text-[9px] tabular-nums",
                  active
                    ? "bg-indigo-500/10 text-indigo-600"
                    : "bg-slate-100 text-slate-400 dark:bg-white/5",
                )}
              >
                {counts[item.id] ?? 0}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
