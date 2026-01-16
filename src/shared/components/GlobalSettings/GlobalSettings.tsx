"use client";

import React from "react";
import { Type, Check, MonitorCog } from "lucide-react";

import { cn } from "@/shared/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Button } from "@/shared/components/ui/button";
import { useFontSize } from "@/shared/providers/FontSizeProvider";

export function GlobalSettings() {
  const { size, updateSize } = useFontSize();

  const sizes = [
    { id: "xs", label: "Надмалий", desc: "7px / 9px" },
    { id: "sm", label: "Стандарт", desc: "8px / 10px" },
    { id: "base", label: "Середній", desc: "9px / 12px" },
    { id: "lg", label: "Великий", desc: "10px / 14px" },
  ] as const;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
        >
          <MonitorCog size={18} className="text-zinc-600 dark:text-zinc-400" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl">
        <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-bold uppercase text-zinc-400 tracking-wider">
          Розмір інтерфейсу
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="mx-1" />

        <div className="space-y-1 mt-1">
          {sizes.map((s) => (
            <DropdownMenuItem
              key={s.id}
              onClick={() => updateSize(s.id)}
              className={cn(
                "flex items-center justify-between px-2 py-2 rounded-md cursor-pointer transition-colors",
                size === s.id
                  ? "bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400"
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
              )}
            >
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{s.label}</span>
                <span className="text-[10px] opacity-60">{s.desc}</span>
              </div>

              {size === s.id && <Check size={14} className="stroke-[3px]" />}
            </DropdownMenuItem>
          ))}
        </div>

        <DropdownMenuSeparator className="mt-2" />

        <div className="px-2 py-2">
          <div className="p-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
            <p className="text-[10px] text-zinc-500 italic leading-tight">
              * Змінює розмір тексту в усіх картках та списках CRM.
            </p>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
