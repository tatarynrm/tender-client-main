"use client";

import React, { useEffect, useState, useRef } from "react";
import { Check, MonitorCog, Volume2, Volume1, VolumeX } from "lucide-react";
import { cn } from "@/shared/utils";
import { useFontSize } from "@/shared/providers/FontSizeProvider";

export function GlobalSettings() {
  const { size, updateSize } = useFontSize();
  const [isOpen, setIsOpen] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [prevVolume, setPrevVolume] = useState(0.5);
  const menuRef = useRef<HTMLDivElement>(null);

  // Закриття по кліку зовні
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Завантаження гучності
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

  const toggleMute = () => {
    if (volume > 0) {
      setPrevVolume(volume);
      updateVolumeState(0);
    } else {
      updateVolumeState(prevVolume > 0 ? prevVolume : 0.5);
    }
  };

  const sizes = [
    { id: "xs", label: "Малий", desc: "7px / 9px" },
    { id: "sm", label: "Стандарт", desc: "8px / 10px" },
    { id: "base", label: "Середній", desc: "9px / 12px" },
    { id: "lg", label: "Великий", desc: "10px / 14px" },
  ] as const;

  return (
    <div className="relative" ref={menuRef}>
      {/* TRIGGER */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-9 w-9 flex items-center justify-center rounded-lg border transition-all duration-200",
          "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900",
          isOpen && "border-teal-500 ring-2 ring-teal-500/10",
        )}
      >
        <MonitorCog
          size={18}
          className={cn(
            "transition-colors",
            isOpen ? "text-teal-600" : "text-zinc-600 dark:text-zinc-400",
          )}
        />
      </button>

      {/* DROPDOWN CONTENT */}
      {isOpen && (
        <div
          className={cn(
            "absolute right-0 mt-2 w-64 z-[100] p-2",
            "bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800",
            "rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200",
          )}
        >
          {/* VOLUME SECTION */}
          <div className="px-2 py-1.5 flex justify-between items-center text-[10px] font-bold uppercase text-zinc-400 tracking-widest">
            Гучність
            <span className="text-zinc-500 tabular-nums">
              {Math.round(volume * 100)}%
            </span>
          </div>

          <div className="px-2 py-2 flex items-center gap-3">
            <button
              onClick={toggleMute}
              className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
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
              onChange={(e) => {
                const newVol = parseFloat(e.target.value);
                updateVolumeState(newVol);
                if (newVol > 0) setPrevVolume(newVol);
              }}
              className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
          </div>

          <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800 my-2 mx-1" />

          {/* FONT SIZE SECTION */}
          <div className="px-2 py-1.5 text-[10px] font-bold uppercase text-zinc-400 tracking-widest">
            Розмір інтерфейсу
          </div>

          <div className="space-y-0.5 mt-1">
            {sizes.map((s) => {
              const isActive = size === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    updateSize(s.id);
                    setIsOpen(false); // закриваємо після вибору (за бажанням)
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400"
                      : "hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400",
                  )}
                >
                  <div className="flex flex-col items-start">
                    <span className="text-[13px] font-bold">{s.label}</span>
                    <span className="text-[10px] opacity-60 font-medium">
                      {s.desc}
                    </span>
                  </div>
                  {isActive && (
                    <Check
                      size={14}
                      strokeWidth={3}
                      className="text-teal-600"
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-2 p-2">
            <div className="py-2 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/50 text-center">
              <p className="text-[10px] text-zinc-400 italic font-medium">
                Параметри зберігаються автоматично
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
