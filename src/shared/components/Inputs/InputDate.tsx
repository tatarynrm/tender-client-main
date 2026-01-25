"use client";

import React, { useState, useRef, useEffect } from "react";
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
} from "date-fns";
import { uk } from "date-fns/locale";
import { CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/shared/utils";
import { inputVariants } from "./styles/styles";

interface Props<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  fromDate?: Date;
  required?: boolean;
  className?: string;
}

export const InputDate = <T extends FieldValues>({
  name,
  control,
  label,
  fromDate,
  required = false,
  className,
}: Props<T>) => {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(
    field.value ? new Date(field.value) : new Date(),
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedDate = field.value ? new Date(field.value) : null;

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
      const isDisabled =
        fromDate && day < startOfMonth(fromDate) && !isSameDay(day, fromDate);

      return (
        <div
          key={day.toString()}
          onClick={() => {
            if (!isDisabled) {
              field.onChange(format(day, "yyyy-MM-dd"));
              setIsOpen(false);
            }
          }}
          className={cn(
            "h-8 w-8 flex items-center justify-center text-[12px] rounded-lg cursor-pointer transition-all relative",
            !isCurrentMonth && "text-zinc-300 dark:text-zinc-700",
            isCurrentMonth &&
              "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5",
            isToday && !isSelected && "text-teal-600 font-bold",
            isSelected &&
              "bg-teal-600 text-white hover:bg-teal-700 shadow-md shadow-teal-500/20",
            isDisabled && "opacity-20 cursor-not-allowed hover:bg-transparent",
          )}
        >
          {format(day, "d")}
          {isToday && !isSelected && (
            <div className="absolute bottom-1 w-1 h-1 bg-teal-600 rounded-full" />
          )}
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
        {/* ІКОНКА */}
        <div
          className={cn(
            "absolute left-4 top-[14px] transition-colors z-30 pointer-events-none",
            isOpen
              ? "text-teal-600"
              : "text-zinc-400 group-focus-within:text-teal-600",
          )}
        >
          <CalendarIcon size={18} strokeWidth={2.2} />
        </div>

        {/* ОСНОВНИЙ ІНПУТ */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            inputVariants.base,
            "min-h-[46px] pl-12 pr-10 py-3 cursor-pointer rounded-2xl flex items-center transition-all duration-200",
            isOpen
              ? "border-teal-600 ring-[0.5px] ring-teal-600 shadow-lg shadow-teal-500/5"
              : "border-zinc-200 dark:border-white/10 hover:border-zinc-300",
            error ? "border-red-500 focus:border-red-600" : "",
          )}
        >
          <span
            className={cn(
              "text-[13px] font-medium",
              !field.value && "text-transparent",
            )}
          >
            {field.value
              ? format(new Date(field.value), "dd.MM.yyyy")
              : "Placeholder"}
          </span>

          {/* КНОПКА ОЧИСТИТИ */}
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

        {/* FLOATING LABEL */}
        <label
          className={cn(
            "absolute transition-all duration-200 pointer-events-none z-40 px-1.5 mx-1 bg-white dark:bg-slate-900 uppercase tracking-widest",
            "left-10 top-[14px] text-zinc-400 text-[12px] font-medium",
            (field.value || isOpen) &&
              "-top-2.5 left-3 text-[10px] font-bold text-teal-600",
            error && "text-red-500",
          )}
        >
          {label}{" "}
          {required && (
            <span
              className={cn(
                "ml-1 transition-colors",
                error ? "text-red-500" : "text-teal-600",
              )}
            >
              *
            </span>
          )}
        </label>
      </div>

      {/* КАЛЕНДАР */}
      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 z-[100] w-[280px] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-4 px-1">
            <button
              type="button"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-1.5 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-colors text-zinc-500"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-[13px] font-bold uppercase tracking-tight text-zinc-700 dark:text-zinc-200">
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
                className="text-center text-[10px] font-bold text-zinc-400 uppercase"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">{renderDays()}</div>
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
