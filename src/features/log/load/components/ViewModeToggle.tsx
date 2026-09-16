"use client";

import { LayoutGrid, Rows3 } from "lucide-react";

import { cn } from "@/shared/utils";

export type LoadViewMode = "grid" | "list";

interface ViewModeToggleProps {
  value: LoadViewMode;
  onChange: (mode: LoadViewMode) => void;
}

const OPTIONS: {
  id: LoadViewMode;
  title: string;
  icon: typeof LayoutGrid;
}[] = [
  { id: "grid", title: "Плитки", icon: LayoutGrid },
  { id: "list", title: "Список (як тендери)", icon: Rows3 },
];

/** Перемикач вигляду списку заявок: плитки або полоски. */
export const ViewModeToggle = ({ value, onChange }: ViewModeToggleProps) => (
  <div className="flex gap-2">
    {OPTIONS.map((opt) => (
      <button
        key={opt.id}
        type="button"
        onClick={() => onChange(opt.id)}
        title={opt.title}
        aria-pressed={value === opt.id}
        className={cn(
          "p-1 rounded-md border transition-all cursor-pointer",
          value === opt.id
            ? "bg-blue-500 text-white border-blue-600"
            : "border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-slate-700",
        )}
      >
        <opt.icon size={18} />
      </button>
    ))}
  </div>
);
