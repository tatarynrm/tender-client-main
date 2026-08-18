"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  format,
  parseISO,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  eachDayOfInterval,
  getYear,
  setYear,
} from "date-fns";
import { uk } from "date-fns/locale";
import { CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, X } from "lucide-react";
import { cn } from "@/shared/utils";

interface DateFieldProps {
  /** Значення у форматі "yyyy-MM-dd" або порожній рядок. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Мінімальна доступна дата (напр. для поля «до» — не раніше «від»). */
  minDate?: Date | null;
  className?: string;
}

/**
 * Компактний кастомний datepicker на value/onChange (без react-hook-form) у
 * стилі фільтрів. Той самий календар, що й InputDate, але керується пропсами —
 * зручно для локального стану форми пошуку. Значення — рядок "yyyy-MM-dd".
 */
export const DateField = ({
  value,
  onChange,
  placeholder = "дд.мм.рррр",
  minDate,
  className,
}: DateFieldProps) => {
  const selectedDate = value ? parseISO(value) : null;
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(
    selectedDate ?? new Date()
  );
  // Опційний вибір року: перемикає календар у режим сітки років.
  const [pickingYear, setPickingYear] = useState(false);
  const [yearBase, setYearBase] = useState(() => {
    const y = getYear(selectedDate ?? new Date());
    return y - (y % 12);
  });
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Закривши календар — повертаємось до перегляду днів.
  useEffect(() => {
    if (!isOpen) setPickingYear(false);
  }, [isOpen]);

  const openYearPicker = () => {
    const y = getYear(currentMonth);
    setYearBase(y - (y % 12));
    setPickingYear(true);
  };

  const renderYears = () => {
    const years = Array.from({ length: 12 }, (_, i) => yearBase + i);
    const selYear = selectedDate ? getYear(selectedDate) : null;
    const curYear = getYear(currentMonth);
    return years.map((yr) => {
      const isSel = selYear === yr;
      const isCur = curYear === yr;
      return (
        <div
          key={yr}
          onClick={() => {
            setCurrentMonth(setYear(currentMonth, yr));
            setPickingYear(false);
          }}
          className={cn(
            "h-9 flex items-center justify-center text-[13px] rounded-lg cursor-pointer transition-all",
            isSel
              ? "bg-[#3B52B4] text-white shadow-md"
              : isCur
                ? "text-[#3B52B4] font-bold hover:bg-blue-50"
                : "text-slate-600 hover:bg-blue-50"
          )}
        >
          {yr}
        </div>
      );
    });
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
      const isDisabled =
        minDate && day < startOfMonth(minDate) && !isSameDay(day, minDate);

      return (
        <div
          key={day.toString()}
          onClick={() => {
            if (!isDisabled) {
              onChange(format(day, "yyyy-MM-dd"));
              setIsOpen(false);
            }
          }}
          className={cn(
            "h-8 w-8 flex items-center justify-center text-[12px] rounded-lg cursor-pointer transition-all relative",
            !isCurrentMonth && "text-zinc-300",
            isCurrentMonth && "text-slate-600 hover:bg-blue-50",
            isToday && !isSelected && "text-[#3B52B4] font-bold",
            isSelected &&
              "bg-[#3B52B4] text-white hover:bg-[#2f429a] shadow-md",
            isDisabled && "opacity-20 cursor-not-allowed hover:bg-transparent"
          )}
        >
          {format(day, "d")}
          {isToday && !isSelected && (
            <div className="absolute bottom-1 w-1 h-1 bg-[#3B52B4] rounded-full" />
          )}
        </div>
      );
    });
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Тригер — у стилі інших фільтр-інпутів */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={cn(
          "h-8 w-full rounded-md border bg-white px-2 text-[12px] flex items-center gap-1.5 outline-none transition-colors",
          isOpen
            ? "border-[#3B52B4] ring-2 ring-[#3B52B4]/20"
            : "border-blue-100 hover:border-[#3B52B4]/40"
        )}
      >
        <CalendarIcon size={14} className="text-[#3B52B4] shrink-0" />
        <span
          className={cn(
            "flex-1 text-left truncate",
            value ? "text-[#0a2540]" : "text-gray-400"
          )}
        >
          {selectedDate ? format(selectedDate, "dd.MM.yyyy") : placeholder}
        </span>
        {value && (
          <span
            role="button"
            tabIndex={-1}
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="p-0.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <X size={14} strokeWidth={2.5} />
          </span>
        )}
      </button>

      {/* Календар */}
      {isOpen && (
        <div className="absolute top-[calc(100%+6px)] left-0 z-[100] w-[280px] bg-white border border-slate-200 rounded-2xl shadow-2xl p-4">
          <div className="flex items-center justify-between mb-4 px-1">
            <button
              type="button"
              onClick={() =>
                pickingYear
                  ? setYearBase((b) => b - 12)
                  : setCurrentMonth(subMonths(currentMonth, 1))
              }
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
            >
              <ChevronLeft size={18} />
            </button>
            {/* Клік по заголовку — відкрити/закрити вибір року */}
            <button
              type="button"
              onClick={() => (pickingYear ? setPickingYear(false) : openYearPicker())}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-[13px] font-bold uppercase tracking-tight text-zinc-700 hover:bg-blue-50 hover:text-[#3B52B4] transition-colors"
              title="Обрати рік"
            >
              {pickingYear
                ? `${yearBase} – ${yearBase + 11}`
                : format(currentMonth, "LLLL yyyy", { locale: uk })}
              <ChevronDown
                size={14}
                className={cn(
                  "text-[#8BA6EB] transition-transform",
                  pickingYear ? "rotate-180" : "animate-bounce"
                )}
              />
            </button>
            <button
              type="button"
              onClick={() =>
                pickingYear
                  ? setYearBase((b) => b + 12)
                  : setCurrentMonth(addMonths(currentMonth, 1))
              }
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {pickingYear ? (
            <div className="grid grid-cols-3 gap-2">{renderYears()}</div>
          ) : (
            <>
              <div className="grid grid-cols-7 mb-2">
                {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"].map((d) => (
                  <div
                    key={d}
                    className="text-center text-[10px] font-bold text-slate-400 uppercase"
                  >
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">{renderDays()}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
