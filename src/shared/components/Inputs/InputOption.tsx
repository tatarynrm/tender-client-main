"use client";

import React, { useState, useRef, useEffect } from "react";
import { useController, Control, FieldValues, Path } from "react-hook-form";
import { cn } from "@/shared/utils";
import { ChevronDown, Check, LucideIcon, ListFilter } from "lucide-react";
import { inputVariants } from "./styles/styles";

interface Option {
  value: string | number;
  label: string;
}

interface InputOptionProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  options: Option[];
  icon?: LucideIcon | null;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

export const InputOption = <T extends FieldValues>({
  name,
  control,
  label,
  options,
  icon: Icon = ListFilter,
  required = false,
  className,
  disabled = false,
}: InputOptionProps<T>) => {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Find selected option
  const selectedOption = options.find((opt) => opt.value === field.value);

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
    field.onChange(val);
    setOpen(false);
  };

  const hasValue = field.value !== undefined && field.value !== null && field.value !== "";

  return (
    <div
      className={cn(
        "flex flex-col w-full relative",
        className,
        disabled && "opacity-60 pointer-events-none"
      )}
      ref={containerRef}
    >
      <div className="relative mt-1.5 group">
        <div
          onClick={() => !disabled && setOpen(!open)}
          className={cn(
            "relative flex items-center h-11 w-full bg-white dark:bg-slate-900 rounded-xl border transition-all cursor-pointer",
            open
              ? "border-indigo-600 ring-1 ring-indigo-600/20"
              : "border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20",
            error ? "border-red-500 ring-red-500/20" : "",
            disabled && "bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed"
          )}
        >
          {/* ICON */}
          {Icon && (
            <div
              className={cn(
                "absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors z-30 pointer-events-none",
                open || hasValue
                  ? "text-indigo-600"
                  : "text-slate-400 group-focus-within:text-indigo-600"
              )}
            >
              <Icon size={18} strokeWidth={2.2} />
            </div>
          )}

          {/* VALUE */}
          <div
            className={cn(
              "flex-1 text-[14px] font-medium truncate z-20",
              Icon ? "pl-11" : "pl-3.5",
              hasValue ? "text-slate-900 dark:text-white" : "text-transparent"
            )}
          >
            {selectedOption?.label || " "}
          </div>

          {/* CHEVRON */}
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 z-30">
            <ChevronDown
              size={16}
              className={cn(
                "text-slate-400 transition-transform duration-200",
                open && "rotate-180 text-indigo-600"
              )}
            />
          </div>

          {/* FLOATING LABEL */}
          {label && (
            <label
              className={cn(
                "absolute transition-all duration-200 pointer-events-none z-40 px-1.5 mx-1 bg-white dark:bg-slate-900 uppercase tracking-widest",
                "left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[12px] font-medium",
                Icon && !hasValue && !open && "left-10",
                (hasValue || open) &&
                  "-top-2.5 left-2.5 translate-y-0 text-[10px] font-bold text-indigo-600 dark:text-indigo-500",
                error && "text-red-500"
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
          )}
        </div>

        {/* DROPDOWN */}
        {open && (
          <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="max-h-[300px] overflow-y-auto p-2 custom-scrollbar">
              {options.map((opt) => {
                const isSelected = field.value === opt.value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 text-[13px] font-medium cursor-pointer rounded-xl transition-all mb-1",
                      isSelected
                        ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600"
                        : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"
                    )}
                  >
                    <span>{opt.label}</span>
                    {isSelected && (
                      <Check size={16} strokeWidth={3} className="text-indigo-600" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ERROR */}
      {error && (
        <p className="mt-1.5 ml-2 text-[10px] uppercase text-red-500 font-bold tracking-wider animate-in fade-in slide-in-from-top-1">
          {error.message}
        </p>
      )}
    </div>
  );
};
