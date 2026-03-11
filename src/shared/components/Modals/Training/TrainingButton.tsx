"use client";

import React from "react";
import { PlayCircle } from "lucide-react";
import { Button } from "@/shared/components/ui";
import { useModal } from "@/shared/hooks/useGlobalModal";
import { TrainingContent } from "./TrainingContent";
import { cn } from "@/shared/utils";

interface TrainingButtonProps {
  className?: string;
}

export const TrainingButton = ({ className }: TrainingButtonProps) => {
  const { open } = useModal();

  const handleOpenModal = () => {
    open(<TrainingContent />, {
      size: "xl",
      className: "p-0 rounded-[2.5rem] border-0 overflow-hidden shadow-2xl bg-white dark:bg-slate-900",
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        handleOpenModal();
      }}
      className={cn(
        "group relative z-10 flex items-center gap-2 px-3 py-2 md:px-4 md:py-5 rounded-xl transition-all duration-300 border-indigo-200/50 bg-indigo-50/30 hover:bg-indigo-100/80 dark:bg-indigo-900/10 dark:border-indigo-900/20",
        className
      )}
      title="Навчання та інструкції"
    >
      <div className="relative pointer-events-none">
        <PlayCircle className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform duration-300" />
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500 border-2 border-white dark:border-slate-900"></span>
        </span>
      </div>
      <span className="hidden md:inline text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wide pointer-events-none">Навчання</span>
    </Button>
  );
};
