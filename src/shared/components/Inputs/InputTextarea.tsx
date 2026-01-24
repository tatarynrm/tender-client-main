"use client";

import React from "react";
import { useController, Control, FieldValues, Path } from "react-hook-form";
import { inputVariants } from "./styles/styles";
import { cn } from "@/shared/utils";
import { AlignLeft, LucideIcon } from "lucide-react";

interface TextareaCustomProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  disabled?: boolean;
  className?: string;
  icon?: LucideIcon | null;
  placeholder?: string;
  rows?: number;
}

export const InputTextarea = <T extends FieldValues>({
  name,
  control,
  label,
  disabled,
  className,
  icon: Icon = AlignLeft,
  placeholder = " ",
  rows = 3,
}: TextareaCustomProps<T>) => {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  const hasError = !!error;

  return (
    <div className={cn("flex flex-col w-full", className)}>
      <div className="relative mt-1.5 group">
        <div className="relative flex items-start">
          
          {/* ІКОНКА: зміщена трохи вниз від верху (top-3), щоб бути в лінію з першим рядком */}
          {Icon && (
            <div className="absolute left-3.5 top-3 text-zinc-400 group-focus-within:text-teal-600 transition-colors z-30 pointer-events-none">
              <Icon size={18} strokeWidth={2.5} />
            </div>
          )}

          {/* TEXTAREA */}
          <textarea
            {...field}
            id={name}
            disabled={disabled}
            autoComplete="off"
            spellCheck="false"
            placeholder={placeholder}
            rows={rows}
            className={cn(
              inputVariants.base,
              "peer rounded-md bg-white dark:bg-slate-900 relative z-20 w-full pt-2.5 pb-2.5 pr-4",
              // resize-y дозволяє тягнути лише вниз
              "min-h-[80px] resize-y", 
              Icon ? "!pl-11" : "pl-3.5",
              hasError ? inputVariants.error : inputVariants.default,
              disabled && inputVariants.disabled,
            )}
          />

          {/* ЛЕЙБЛ */}
          {label && (
            <label
              htmlFor={name}
              className={cn(
                "absolute transition-all duration-200 ease-in-out pointer-events-none z-40",
                "px-1 mx-1 bg-white dark:bg-slate-900 uppercase tracking-widest",

                // Початкова позиція (відцентрована по вертикалі відносно першого рядка)
                Icon ? "left-9" : "left-3",
                "top-5 -translate-y-1/2 text-zinc-400 text-[13px]",

                // Стан фокусу або заповненості: вилітає чітко над рамку
                "peer-focus:-top-2 peer-focus:left-2 peer-focus:text-[10px] peer-focus:font-bold peer-focus:translate-y-0",
                "peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:translate-y-0",

                hasError
                  ? "text-red-500"
                  : "text-zinc-400 peer-focus:text-teal-600 dark:peer-focus:text-teal-500",
              )}
            >
              {label}
            </label>
          )}
        </div>
      </div>

      {hasError && (
        <p className="mt-1 ml-1 text-[10px] uppercase text-red-500 tracking-tight font-bold">
          {error.message}
        </p>
      )}
    </div>
  );
};