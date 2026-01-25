"use client";

import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useController, Control, FieldValues, Path } from "react-hook-form";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  eachDayOfInterval,
  setHours,
  setMinutes,
  getHours,
  getMinutes,
} from "date-fns";
import { uk } from "date-fns/locale";
import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { inputVariants } from "./styles/styles";

interface Props<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  required?: boolean;
  className?: string;
}

export const InputDateWithTime = <T extends FieldValues>({
  name,
  control,
  label,
  required = false,
  className,
}: Props<T>) => {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  const [isOpen, setIsOpen] = useState(false);
  const [openUp, setOpenUp] = useState(false); // Стан для напрямку відкриття
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedDate = field.value ? new Date(field.value) : null;
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());

  // Логіка розрахунку місця на екрані
  useLayoutEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = 400; // Орієнтовна висота нашого календаря

      // Якщо місця знизу менше ніж висота календаря, відкриваємо вгору
      setOpenUp(spaceBelow < dropdownHeight && rect.top > dropdownHeight);
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleTimeChange = (type: "hours" | "minutes", value: number) => {
    const baseDate = selectedDate || new Date();
    const newDate =
      type === "hours"
        ? setHours(baseDate, value)
        : setMinutes(baseDate, value);
    field.onChange(newDate.toISOString());
  };

  const renderDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return days.map((day) => {
      const isSelected = selectedDate && isSameDay(day, selectedDate);
      const isCurrentMonth = isSameMonth(day, monthStart);
      const isToday = isSameDay(day, new Date());

      return (
        <div
          key={day.toString()}
          onClick={() => {
            const hours = selectedDate
              ? getHours(selectedDate)
              : getHours(new Date());
            const mins = selectedDate
              ? getMinutes(selectedDate)
              : getMinutes(new Date());
            const combinedDate = setMinutes(setHours(day, hours), mins);
            field.onChange(combinedDate.toISOString());
          }}
          className={cn(
            "h-8 w-8 flex items-center justify-center text-[12px] rounded-lg cursor-pointer transition-all",
            !isCurrentMonth && "text-zinc-300 dark:text-zinc-700",
            isCurrentMonth &&
              "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5",
            isToday && !isSelected && "text-teal-600 font-bold",
            isSelected &&
              "bg-teal-600 text-white hover:bg-teal-700 shadow-md shadow-teal-500/20",
          )}
        >
          {format(day, "d")}
        </div>
      );
    });
  };

  return (
    <div
      className={cn("flex flex-col w-full relative", className)}
      ref={containerRef}
    >
      <div className="relative mt-1.5 group">
        <div
          className={cn(
            "absolute left-4 top-[14px] transition-colors z-30 pointer-events-none",
            isOpen
              ? "text-teal-600"
              : "text-zinc-400 group-focus-within:text-teal-600",
          )}
        >
          <CalendarClock size={18} strokeWidth={2.2} />
        </div>

        <div
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            inputVariants.base,
            "min-h-[46px] pl-12 pr-10 py-3 cursor-pointer rounded-2xl flex items-center transition-all duration-200",
            isOpen
              ? "border-teal-600 ring-[0.5px] ring-teal-600 shadow-lg shadow-teal-500/5"
              : "border-zinc-200 dark:border-white/10 hover:border-zinc-300",
            error ? "border-red-500" : "",
          )}
        >
          <span
            className={cn(
              "text-[13px] font-medium",
              !field.value && "text-transparent",
            )}
          >
            {field.value
              ? format(new Date(field.value), "dd.MM.yyyy HH:mm")
              : "Обрати дату"}
          </span>

          {field.value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                field.onChange(null);
              }}
              className="absolute right-3 p-1 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full text-zinc-400 hover:text-red-500 transition-colors"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          )}
        </div>

        <label
          className={cn(
            "absolute transition-all duration-200 pointer-events-none z-40 px-1.5 mx-1 bg-white dark:bg-slate-900 uppercase tracking-widest",
            "left-10 top-[14px] text-zinc-400 text-[12px] font-medium",
            (field.value || isOpen) &&
              "-top-2.5 left-3 text-[10px] font-bold text-teal-600",
            error && "text-red-500",
          )}
        >
          {label} {required && "*"}
        </label>
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className={cn(
            "absolute left-0 z-[100] w-fit min-w-[340px] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in duration-200",
            openUp
              ? "bottom-[calc(100%+8px)] origin-bottom slide-in-from-bottom-2"
              : "top-[calc(100%+8px)] origin-top slide-in-from-top-2",
          )}
        >
          <div className="flex   divide-y sm:divide-y-0 sm:divide-x divide-zinc-100 dark:divide-zinc-800">
            {/* КАЛЕНДАР */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-4 px-1">
                <button
                  type="button"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-1.5 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-colors text-zinc-500"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-[11px] font-bold uppercase tracking-tighter text-zinc-700 dark:text-zinc-200">
                  {format(currentMonth, "LLLL yyyy", { locale: uk })}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-1.5 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-colors text-zinc-500"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="grid grid-cols-7 mb-2">
                {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"].map((d) => (
                  <div
                    key={d}
                    className="text-center text-[9px] font-bold text-zinc-400 uppercase"
                  >
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">{renderDays()}</div>
            </div>

            {/* ВИБІР ЧАСУ (ДВІ КОЛОНКИ ПОРУЧ) */}
            <div className="bg-zinc-50/50 dark:bg-white/5 flex flex-col w-[140px]">
              <div className="flex items-center justify-center h-10 border-b border-zinc-100 dark:border-zinc-800">
                <Clock size={14} className="text-teal-600" />
              </div>

              <div className="flex h-[240px] overflow-hidden">
                {/* Години */}
                <div className="flex-1 flex flex-col overflow-y-auto scrollbar-hide border-r border-zinc-100 dark:border-zinc-800">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleTimeChange("hours", i)}
                      className={cn(
                        "text-[12px] py-2 transition-all",
                        selectedDate && getHours(selectedDate) === i
                          ? "bg-teal-600 text-white font-bold"
                          : "text-zinc-500 hover:bg-teal-50 dark:hover:bg-teal-500/10",
                      )}
                    >
                      {i.toString().padStart(2, "0")}
                    </button>
                  ))}
                </div>

                {/* Хвилини */}
                <div className="flex-1 flex flex-col overflow-y-auto scrollbar-hide">
                  {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleTimeChange("minutes", m)}
                      className={cn(
                        "text-[12px] py-2 transition-all",
                        selectedDate && getMinutes(selectedDate) === m
                          ? "bg-teal-600 text-white font-bold"
                          : "text-zinc-500 hover:bg-teal-50 dark:hover:bg-teal-500/10",
                      )}
                    >
                      {m.toString().padStart(2, "0")}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-2 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full py-2.5 bg-teal-600 text-white rounded-xl text-[10px] uppercase font-bold tracking-widest hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20"
            >
              Підтвердити
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1.5 ml-3 text-[10px] uppercase text-red-500 font-bold tracking-wider animate-in fade-in">
          {error.message}
        </p>
      )}
    </div>
  );
};
