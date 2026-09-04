"use client";

import React, { useState, useRef, useEffect } from "react";
import { useController, Control, FieldValues, Path } from "react-hook-form";
import { cn } from "@/shared/utils";
import { ChevronDown, Check, LucideIcon, Truck, X } from "lucide-react";
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
  icon?: LucideIcon;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  clearable?: boolean;
}

export const InputSelect = <T extends FieldValues>({
  name,
  control,
  label,
  options,
  icon: Icon = Truck,
  required = false,
  className,
  disabled = false,
  clearable = false,
}: Props<T>) => {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const hasValue =
    field.value !== undefined && field.value !== null && field.value !== "";

  // Знаходимо обрану опцію для відображення тексту
  const selectedOption = hasValue
    ? options.find((opt) => String(opt.value) === String(field.value))
    : undefined;

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

  const handleSelect = (val: string | number) => {
    if (clearable && String(field.value) === String(val)) {
      field.onChange(null);
    } else {
      field.onChange(val);
    }
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    field.onChange(null);
  };

  return (
    <div
      className={cn(
        "flex flex-col w-full relative",
        className,
        disabled && "opacity-60 pointer-events-none",
      )}
      ref={containerRef}
    >
      <div className="relative mt-1.5 group">
        {/* ІКОНКА */}
        <div
          className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 transition-colors z-30 pointer-events-none",
            open || hasValue
              ? "text-indigo-600"
              : "text-slate-400 group-focus-within:text-indigo-600",
          )}
        >
          <Icon size={18} strokeWidth={2.2} />
        </div>

        {/* ОСНОВНЕ ПОЛЕ */}
        <div
          onClick={() => !disabled && setOpen(!open)}
          className={cn(
            inputVariants.base,
            "h-11 pl-12 pr-10 flex items-center cursor-pointer transition-all duration-200",
            "bg-white dark:bg-slate-900 rounded-xl border-slate-200 dark:border-white/10 shadow-sm",
            open
              ? "border-indigo-600 ring-[0.5px] ring-indigo-600 shadow-lg shadow-indigo-500/5"
              : "hover:border-slate-200",
            error ? "border-red-500 ring-red-500" : "",
          )}
        >
          <span
            className={cn(
              "text-[14px] font-medium truncate",
              selectedOption
                ? "text-slate-900 dark:text-white"
                : "text-transparent",
            )}
          >
            {selectedOption?.label || "Placeholder"}
          </span>

          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 z-30">
            {clearable && hasValue && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Очистити"
              >
                <X size={14} />
              </button>
            )}
            <ChevronDown
              size={16}
              className={cn(
                "text-slate-400 transition-transform duration-200",
                open && "rotate-180 text-indigo-600",
              )}
            />
          </div>
        </div>

        {/* FLOATING LABEL */}
        <label
          className={cn(
            "absolute transition-all duration-200 pointer-events-none z-40 px-1.5 mx-1 bg-white dark:bg-slate-900 uppercase tracking-widest",
            "left-10 top-1/2 -translate-y-1/2 text-slate-400 text-[12px] font-medium",
            (hasValue || open) &&
              "-top-2.5 left-3 translate-y-0 text-[10px] font-bold text-indigo-600 dark:text-indigo-500",
            error && "text-red-500",
          )}
        >
          {label}
          {required && (
            <span
              className={cn("ml-1", error ? "text-red-500" : "text-indigo-600")}
            >
              *
            </span>
          )}
        </label>
      </div>

      {/* DROPDOWN LIST */}
      {open && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-[250px] overflow-y-auto p-1.5 custom-scrollbar">
            {clearable && hasValue && (
              <div
                onClick={() => {
                  field.onChange(null);
                  setOpen(false);
                }}
                className="flex items-center justify-between px-4 py-2 text-[12px] font-medium cursor-pointer rounded-xl text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 transition-all mb-1 border-b border-dashed border-slate-200 dark:border-zinc-800"
              >
                <span>Не вибрано (очистити)</span>
                <X size={13} />
              </div>
            )}
            {options.length > 0 ? (
              options.map((opt) => {
                const isSelected =
                  hasValue && String(field.value) === String(opt.value);
                return (
                  <div
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className={cn(
                      "flex items-center justify-between px-4 py-2.5 text-[13px] font-medium cursor-pointer rounded-xl transition-all mb-0.5",
                      isSelected
                        ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 font-semibold"
                        : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400",
                    )}
                  >
                    {opt.label}
                    {isSelected && (
                      <Check
                        size={14}
                        strokeWidth={3}
                        className="text-indigo-600"
                      />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-slate-400 text-[12px]">
                Список порожній
              </div>
            )}
          </div>
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <p className="mt-1.5 ml-3 text-[10px] uppercase text-red-500 font-bold tracking-wider animate-in fade-in slide-in-from-left-1">
          {error.message}
        </p>
      )}
    </div>
  );
};