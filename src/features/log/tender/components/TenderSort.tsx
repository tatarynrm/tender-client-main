"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { ArrowUpDown, Clock, Calendar } from "lucide-react";

interface TenderSortProps {
  sortBy: string;
  sortOrder: string;
  onChange: (sortBy: string, sortOrder: string) => void;
}

export const TenderSort = ({ sortBy, sortOrder, onChange }: TenderSortProps) => {
  const currentValue = `${sortBy}-${sortOrder}`;

  const handleValueChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split("-");
    onChange(newSortBy, newSortOrder);
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={currentValue} onValueChange={handleValueChange}>
        <SelectTrigger className="h-9 w-[220px] rounded-xl bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-white/10 text-[11px] font-bold uppercase tracking-wider transition-all hover:bg-zinc-100 dark:hover:bg-white/5 focus:ring-1 focus:ring-indigo-500/20">
          <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <SelectValue placeholder="Сортування" />
          </div>
        </SelectTrigger>
        <SelectContent className="rounded-2xl border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950 shadow-xl overflow-hidden">
          <div className="px-2 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 bg-zinc-50/50 dark:bg-white/5 mb-1">
            Час публікації
          </div>
          <SelectItem 
            value="time_start-DESC" 
            className="rounded-xl mx-1 my-0.5 focus:bg-indigo-50 dark:focus:bg-indigo-500/10 focus:text-indigo-600 dark:focus:text-indigo-400 text-[10px] font-bold uppercase tracking-wider"
          >
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 opacity-50" />
              <span>Спочатку нові</span>
            </div>
          </SelectItem>
          <SelectItem 
            value="time_start-ASC" 
            className="rounded-xl mx-1 my-0.5 focus:bg-indigo-50 dark:focus:bg-indigo-500/10 focus:text-indigo-600 dark:focus:text-indigo-400 text-[10px] font-bold uppercase tracking-wider"
          >
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 opacity-50" />
              <span>Спочатку старі</span>
            </div>
          </SelectItem>

          <div className="px-2 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 bg-zinc-50/50 dark:bg-white/5 my-1">
            Час закінчення
          </div>
          <SelectItem 
            value="time_end-ASC" 
            className="rounded-xl mx-1 my-0.5 focus:bg-indigo-50 dark:focus:bg-indigo-500/10 focus:text-indigo-600 dark:focus:text-indigo-400 text-[10px] font-bold uppercase tracking-wider"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3 opacity-50" />
              <span>Закінчуються швидше</span>
            </div>
          </SelectItem>
          <SelectItem 
            value="time_end-DESC" 
            className="rounded-xl mx-1 my-0.5 focus:bg-indigo-50 dark:focus:bg-indigo-500/10 focus:text-indigo-600 dark:focus:text-indigo-400 text-[10px] font-bold uppercase tracking-wider"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3 opacity-50" />
              <span>Закінчуються пізніше</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
