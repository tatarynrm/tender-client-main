import React from "react";
import { cn } from "@/shared/utils";

interface UserActivityBadgeProps {
  action: string;
}

export function UserActivityBadge({ action }: UserActivityBadgeProps) {
  // Determine color and label based on action prefix or specific value
  let colorClass = "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700";
  
  if (action.startsWith("auth.")) {
    colorClass = "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-900";
  } else if (action.startsWith("error.") || action.startsWith("delete.")) {
    colorClass = "bg-rose-500/10 text-rose-600 border-rose-200 dark:border-rose-900";
  } else if (action.startsWith("update.") || action.startsWith("edit.")) {
    colorClass = "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900";
  } else if (action.startsWith("create.")) {
    colorClass = "bg-indigo-500/10 text-indigo-600 border-indigo-200 dark:border-indigo-900";
  }

  return (
    <span
      className={cn(
        "px-2 py-0.5 rounded-md border text-[11px] font-bold uppercase tracking-wider",
        colorClass
      )}
    >
      {action}
    </span>
  );
}
