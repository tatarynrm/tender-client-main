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
  isWithinInterval,
  isBefore,
  eachDayOfInterval,
} from "date-fns";
import { uk } from "date-fns/locale";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowRight,
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

export const InputDateRange = <T extends FieldValues>({
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
  const [openUp, setOpenUp] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Тимчасовий стан для вибору діапазону всередині календаря
  const [tempRange, setTempRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({
    from: field.value?.from ? new Date(field.value.from) : null,
    to: field.value?.to ? new Date(field.value.to) : null,
  });

  const [currentMonth, setCurrentMonth] = useState(
    tempRange.from || new Date(),
  );

  // Синхронізація tempRange при відкритті (якщо значення змінилося ззовні)
  useEffect(() => {
    if (isOpen) {
      setTempRange({
        from: field.value?.from ? new Date(field.value.from) : null,
        to: field.value?.to ? new Date(field.value.to) : null,
      });
    }
  }, [isOpen, field.value]);

  useLayoutEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = 400;
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

  const handleDayClick = (day: Date) => {
    if (!tempRange.from || (tempRange.from && tempRange.to)) {
      setTempRange({ from: day, to: null });
    } else {
      if (isBefore(day, tempRange.from)) {
        setTempRange({ from: day, to: null });
      } else {
        setTempRange({ from: tempRange.from, to: day });
      }
    }
  };

  const handleConfirm = () => {
    field.onChange({
      from: tempRange.from?.toISOString() || null,
      to: tempRange.to?.toISOString() || null,
    });
    setIsOpen(false);
  };

  const renderDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return days.map((day) => {
      const isSelectedFrom = tempRange.from && isSameDay(day, tempRange.from);
      const isSelectedTo = tempRange.to && isSameDay(day, tempRange.to);
      const isInRange =
        tempRange.from &&
        tempRange.to &&
        isWithinInterval(day, { start: tempRange.from, end: tempRange.to });
      const isCurrentMonth = isSameMonth(day, monthStart);

      return (
        <div
          key={day.toString()}
          onClick={() => handleDayClick(day)}
          className={cn(
            "h-10 sm:h-9 w-full flex items-center justify-center text-[12px] cursor-pointer transition-all relative z-10",
            !isCurrentMonth && "text-zinc-300 dark:text-zinc-700",
            isCurrentMonth &&
              "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5",
            isInRange &&
              !isSelectedFrom &&
              !isSelectedTo &&
              "bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 rounded-none",
            isSelectedFrom &&
              "bg-teal-600 text-white rounded-l-lg shadow-md z-20",
            isSelectedTo &&
              "bg-teal-600 text-white rounded-r-lg shadow-md z-20",
            isSelectedFrom && isSelectedTo && "rounded-lg",
            !tempRange.to && isSelectedFrom && "rounded-lg",
          )}
        >
          {format(day, "d")}
        </div>
      );
    });
  };

  // Форматування дат для відображення в інпуті
  const displayFrom = field.value?.from ? new Date(field.value.from) : null;
  const displayTo = field.value?.to ? new Date(field.value.to) : null;

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
          <CalendarIcon size={18} strokeWidth={2.2} />
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
          <div
            className={cn(
              "flex items-center gap-2 text-[13px] font-medium",
              !displayFrom && "text-transparent",
            )}
          >
            {displayFrom ? format(displayFrom, "dd.MM.yy") : "---"}
            <ArrowRight size={14} className="text-zinc-400" />
            {displayTo ? format(displayTo, "dd.MM.yy") : "---"}
          </div>

          {(displayFrom || displayTo) && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                field.onChange({ from: null, to: null });
                setTempRange({ from: null, to: null });
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
            (displayFrom || isOpen) &&
              "-top-2.5 left-3 text-[10px] font-bold text-teal-600",
            error && "text-red-500",
          )}
        >
          {label} {required && "*"}
        </label>
      </div>

      {isOpen && (
        <div
          className={cn(
            "fixed inset-x-4 mx-auto z-[100] w-[calc(100%-32px)] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in duration-200",
            "sm:absolute sm:inset-x-auto sm:left-0 sm:w-[320px]",
            openUp
              ? "bottom-[calc(100%+8px)] origin-bottom slide-in-from-bottom-2"
              : "top-[calc(100%+8px)] origin-top slide-in-from-top-2",
            "top-[20%] sm:top-[calc(100%+8px)]",
          )}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4 px-1">
              <button
                type="button"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl"
              >
                <ChevronLeft size={20} className="text-zinc-500" />
              </button>
              <span className="text-[13px] font-bold uppercase tracking-tight text-zinc-700 dark:text-zinc-200">
                {format(currentMonth, "LLLL yyyy", { locale: uk })}
              </span>
              <button
                type="button"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl"
              >
                <ChevronRight size={20} className="text-zinc-500" />
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
            <div className="grid grid-cols-7 gap-y-1">{renderDays()}</div>
          </div>

          <div className="p-2 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full py-2.5 bg-teal-600 text-white rounded-xl text-[10px] uppercase font-bold tracking-widest hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20"
            >
              Підтвердити
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
