"use client";

import React, { useState, useRef, useEffect } from "react";
import { useController, Control, FieldValues, Path } from "react-hook-form";
import { cn } from "@/shared/utils";
import { ChevronDown, Check, LucideIcon, Truck } from "lucide-react";
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
}: Props<T>) => {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Знаходимо обрану опцію для відображення тексту
  const selectedOption = options.find((opt) => opt.value === field.value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val: string | number) => {
    field.onChange(val);
    setOpen(false);
  };

  return (
    <div 
      className={cn("flex flex-col w-full relative", className, disabled && "opacity-60 pointer-events-none")} 
      ref={containerRef}
    >
      <div className="relative mt-1.5 group">
        {/* ІКОНКА */}
        <div
          className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 transition-colors z-30 pointer-events-none",
            open || field.value
              ? "text-teal-600"
              : "text-zinc-400 group-focus-within:text-teal-600",
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
            "bg-white dark:bg-slate-900 rounded-xl border-zinc-200 dark:border-white/10 shadow-sm",
            open
              ? "border-teal-600 ring-[0.5px] ring-teal-600 shadow-lg shadow-teal-500/5"
              : "hover:border-zinc-300",
            error ? "border-red-500 ring-red-500" : "",
          )}
        >
          <span className={cn(
            "text-[14px] font-medium truncate",
            selectedOption ? "text-slate-900 dark:text-white" : "text-transparent"
          )}>
            {selectedOption?.label || "Placeholder"}
          </span>

          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <ChevronDown
              size={16}
              className={cn(
                "text-zinc-400 transition-transform duration-200",
                open && "rotate-180 text-teal-600",
              )}
            />
          </div>
        </div>

        {/* FLOATING LABEL */}
        <label
          className={cn(
            "absolute transition-all duration-200 pointer-events-none z-40 px-1.5 mx-1 bg-white dark:bg-slate-900 uppercase tracking-widest",
            "left-10 top-1/2 -translate-y-1/2 text-zinc-400 text-[12px] font-medium",
            (field.value || open) &&
              "-top-2.5 left-3 translate-y-0 text-[10px] font-bold text-teal-600 dark:text-teal-500",
            error && "text-red-500",
          )}
        >
          {label}
          {required && (
            <span className={cn("ml-1", error ? "text-red-500" : "text-teal-600")}>*</span>
          )}
        </label>
      </div>

      {/* DROPDOWN LIST */}
      {open && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-[250px] overflow-y-auto p-1.5 custom-scrollbar">
            {options.length > 0 ? (
              options.map((opt) => {
                const isSelected = field.value === opt.value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className={cn(
                      "flex items-center justify-between px-4 py-2.5 text-[13px] font-medium cursor-pointer rounded-lg transition-all mb-0.5",
                      isSelected
                        ? "bg-teal-50 dark:bg-teal-500/10 text-teal-600"
                        : "hover:bg-zinc-50 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-400",
                    )}
                  >
                    {opt.label}
                    {isSelected && (
                      <Check size={14} strokeWidth={3} className="text-teal-600" />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-zinc-400 text-[12px]">Список порожній</div>
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