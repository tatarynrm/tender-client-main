"use client";

import React, { useEffect, useState } from "react";
import { Check, MonitorCog, Volume2, Volume1, VolumeX } from "lucide-react";

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
  const [volume, setVolume] = useState(0.5);
  const [prevVolume, setPrevVolume] = useState(0.5); // для збереження значення перед Mute

  useEffect(() => {
    const savedVolume = localStorage.getItem("app-volume");
    if (savedVolume !== null) {
      const vol = Number(savedVolume);
      setVolume(vol);
      if (vol > 0) setPrevVolume(vol);
    }
  }, []);

  const updateVolumeState = (newVol: number) => {
    setVolume(newVol);
    localStorage.setItem("app-volume", String(newVol));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    updateVolumeState(newVol);
    if (newVol > 0) setPrevVolume(newVol); // оновлюємо пам'ять, якщо користувач соває повзунок
  };

  // Функція для перемикання Mute/Unmute
  const toggleMute = () => {
    if (volume > 0) {
      setPrevVolume(volume); // запам'ятовуємо поточну гучність
      updateVolumeState(0); // вимикаємо
    } else {
      updateVolumeState(prevVolume > 0 ? prevVolume : 0.5); // повертаємо попередню або 50%
    }
  };

  const sizes = [
    { id: "xs", label: "Малий", desc: "7px / 9px" },
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

      <DropdownMenuContent align="end" className="w-64 p-2 rounded-xl">
        <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-bold uppercase text-zinc-400 tracking-wider flex justify-between items-center">
          Гучність сповіщень
          <span className="text-zinc-500 tabular-nums">
            {Math.round(volume * 100)}%
          </span>
        </DropdownMenuLabel>

        <div className="px-2 py-2 flex items-center gap-3">
          {/* Кнопка Mute/Unmute */}
          <button
            onClick={toggleMute}
            className="hover:opacity-70 transition-opacity"
          >
            {volume === 0 ? (
              <VolumeX size={16} className="text-rose-500" />
            ) : volume < 0.5 ? (
              <Volume1 size={16} className="text-teal-500" />
            ) : (
              <Volume2 size={16} className="text-teal-500" />
            )}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
          />
        </div>

        <DropdownMenuSeparator className="mx-1" />

        <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-bold uppercase text-zinc-400 tracking-wider mt-1">
          Розмір інтерфейсу
        </DropdownMenuLabel>

        <div className="space-y-1">
          {sizes.map((s) => (
            <DropdownMenuItem
              key={s.id}
              onClick={() => updateSize(s.id)}
              className={cn(
                "flex items-center justify-between px-2 py-2 rounded-md cursor-pointer transition-colors",
                size === s.id
                  ? "bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400"
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800",
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
            <p className="text-[10px] text-zinc-500 italic leading-tight text-center">
              Параметри зберігаються автоматично
            </p>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
