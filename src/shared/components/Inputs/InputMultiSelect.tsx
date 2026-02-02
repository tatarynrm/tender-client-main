"use client";

import React, { useState, useRef, useEffect } from "react";
import { useController, Control, FieldValues, Path } from "react-hook-form";
import { cn } from "@/shared/utils";
import { Truck, X, ChevronDown, Check } from "lucide-react";
import { inputVariants } from "./styles/styles";

interface Option {
  value: string | number;
  label: string;
}

interface Props<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  options: Option[];
  valueKey?: string; // Ключ об'єкта, наприклад "ids_trailer_type"
  required?: boolean;
  className?: string;
}

export const InputMultiSelect = <T extends FieldValues>({
  name,
  control,
  label,
  options,
  valueKey = "ids_trailer_type",
  required = false,
  className,
}: Props<T>) => {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Отримуємо масив значень (ID) з масиву об'єктів у формі
  const selectedValues = (field.value || []).map((v: any) => v[valueKey]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (val: string | number) => {
    const currentValues: Record<string, any>[] = [...(field.value || [])];
    const index = currentValues.findIndex((v) => v[valueKey] === val);

    if (index > -1) {
      currentValues.splice(index, 1);
    } else {
      currentValues.push({ [valueKey]: val });
    }

    field.onChange(currentValues);

    // ДОДАЙТЕ ЦЕЙ РЯДОК:
    setTimeout(() => setOpen(false), 150);
  };

  const removeOption = (e: React.MouseEvent, val: string | number) => {
    e.stopPropagation();
    const currentValues: Record<string, any>[] = [...(field.value || [])];
    const filtered = currentValues.filter((v) => v[valueKey] !== val);
    field.onChange(filtered);
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    field.onChange([]);
  };

  return (
    <div
      className={cn("flex flex-col w-full relative", className)}
      ref={containerRef}
    >
      <div className="relative mt-1.5 group">
        {/* ІКОНКА ТРАНСПОРТУ */}
        <div
          className={cn(
            "absolute left-4 top-[14px] transition-colors z-30 pointer-events-none",
            open
              ? "text-teal-600"
              : "text-zinc-400 group-focus-within:text-teal-600",
          )}
        >
          <Truck size={18} strokeWidth={2.2} />
        </div>

        {/* ГОЛОВНИЙ КОНТЕЙНЕР ІНПУТУ */}
        <div
          onClick={() => setOpen(!open)}
          className={cn(
            inputVariants.base,
            "min-h-[46px] pl-12 pr-12 py-2 flex flex-wrap gap-1.5 cursor-pointer transition-all duration-200",
            "bg-white dark:bg-slate-900 rounded-2xl border-zinc-200 dark:border-white/10 shadow-sm",
            open
              ? "border-teal-600 ring-[0.5px] ring-teal-600 shadow-lg shadow-teal-500/5"
              : "hover:border-zinc-300",
            error ? "border-red-500 ring-red-500" : "",
          )}
        >
          {/* ОБРАНІ ЕЛЕМЕНТИ (BADGES) */}
          {selectedValues.length > 0 ? (
            selectedValues.map((val: any) => {
              const option = options.find((o) => o.value === val);
              return (
                <div
                  key={val}
                  className="flex items-center gap-1 bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 px-2.5 py-1 rounded-xl text-[12px] font-bold border border-teal-100 dark:border-teal-500/20 transition-all hover:bg-teal-100"
                >
                  {option?.label || "Unknown"}
                  <button
                    type="button"
                    onClick={(e) => removeOption(e, val)}
                    className="ml-1 text-teal-600/50 hover:text-red-500 transition-colors"
                  >
                    <X size={12} strokeWidth={3} />
                  </button>
                </div>
              );
            })
          ) : (
            <span className="text-transparent">Placeholder</span>
          )}

          {/* ПРАВА ЧАСТИНА: ОЧИСТИТИ ТА СТРІЛКА */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {selectedValues.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors"
                title="Очистити все"
              >
                <X size={16} />
              </button>
            )}
            <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-800 mx-0.5" />
            <ChevronDown
              size={16}
              className={cn(
                "transition-transform duration-200",
                open && "rotate-180 text-teal-600",
              )}
            />
          </div>
        </div>

        {/* ЛЕЙБЛ */}
        <label
          className={cn(
            "absolute transition-all duration-200 pointer-events-none z-40 px-1.5 mx-1 bg-white dark:bg-slate-900 uppercase tracking-widest",
            "left-10 top-[14px] text-zinc-400 text-[12px] font-medium",
            (selectedValues.length > 0 || open) &&
              "-top-2.5 left-3 text-[10px] font-bold text-teal-600 dark:text-teal-500",
            error && "text-red-500",
          )}
        >
          {label}
          {required && (
            <span
              className={cn("ml-1", error ? "text-red-500" : "text-teal-600")}
            >
              *
            </span>
          )}
        </label>
      </div>

      {/* ВИПАДАЮЧИЙ СПИСОК */}
      {open && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-[250px] overflow-y-auto p-1.5 custom-scrollbar">
            {options.length > 0 ? (
              options.map((opt) => {
                const isSelected = selectedValues.includes(opt.value);
                return (
                  <div
                    key={opt.value}
                    onClick={() => toggleOption(opt.value)}
                    className={cn(
                      "flex items-center justify-between px-4 py-2.5 text-[13px] font-medium cursor-pointer rounded-xl transition-all mb-0.5",
                      isSelected
                        ? "bg-teal-50 dark:bg-teal-500/10 text-teal-600"
                        : "hover:bg-zinc-50 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-400",
                    )}
                  >
                    {opt.label}
                    {isSelected && (
                      <Check
                        size={14}
                        strokeWidth={3}
                        className="text-teal-600"
                      />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-zinc-400 text-[12px]">
                Список порожній
              </div>
            )}
          </div>
        </div>
      )}

      {/* ПОВІДОМЛЕННЯ ПРО ПОМИЛКУ */}
      {error && (
        <p className="mt-1.5 ml-3 text-[10px] uppercase text-red-500 font-bold tracking-wider animate-in fade-in slide-in-from-left-1">
          {error.message}
        </p>
      )}
    </div>
  );
};
