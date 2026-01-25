"use client";

import React from "react";
import { useController, Control, FieldValues, Path } from "react-hook-form";
import { inputVariants } from "./styles/styles";
import { cn } from "@/shared/utils";
import { Truck, LucideIcon } from "lucide-react";

interface InputNumberProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  icon?: LucideIcon | null;
  placeholder?: string;
  onChange?: (value: number | null) => void;
}

export const InputNumber = <T extends FieldValues>({
  name,
  control,
  label,
  disabled,
  required = false,
  className,
  icon: Icon = Truck,
  placeholder = " ", // Важливо для роботи peer-[:not(:placeholder-shown)]
  onChange: externalOnChange,
}: InputNumberProps<T>) => {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  const hasError = !!error;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    const numericValue = rawValue === "" ? null : parseInt(rawValue, 10);

    field.onChange(numericValue);
    if (externalOnChange) externalOnChange(numericValue);
  };

  return (
    <div className={cn("flex flex-col w-full", className)}>
      <div className="relative mt-1.5 group">
        <div className="relative flex items-center">
          {/* ІКОНКА */}
          {Icon && (
            <div
              className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 transition-colors z-30 pointer-events-none",
                "text-zinc-400 group-focus-within:text-teal-600",
              )}
            >
              <Icon size={18} strokeWidth={2.5} />
            </div>
          )}

          {/* ІНПУТ */}
          <input
            {...field}
            id={name}
            type="text"
            inputMode="numeric"
            disabled={disabled}
            autoComplete="off"
            spellCheck="false"
            placeholder={placeholder}
            onChange={handleInputChange}
            value={field.value === 0 || field.value ? field.value : ""}
            className={cn(
              inputVariants.base,
              "peer rounded-2xl bg-white dark:bg-slate-900 relative z-20 transition-all duration-200",
              "min-h-[46px] pr-4",
              Icon ? "!pl-12" : "pl-4",
              hasError
                ? "border-red-500 ring-[0.5px] ring-red-500 shadow-sm shadow-red-500/5"
                : "border-zinc-200 dark:border-white/10 hover:border-zinc-300 focus:border-teal-600 focus:ring-[0.5px] focus:ring-teal-600 focus:shadow-lg focus:shadow-teal-500/5",
              disabled && inputVariants.disabled,
            )}
          />

          {/* ЛЕЙБЛ ЗІ СТАТУСОМ REQUIRED ТА КОЛЬОРОМ */}
          {label && (
            <label
              htmlFor={name}
              className={cn(
                "absolute transition-all duration-200 ease-in-out pointer-events-none z-40",
                "px-1.5 mx-1 bg-white dark:bg-slate-900 uppercase tracking-widest text-[12px] font-medium",

                // Початкова позиція
                Icon ? "left-10" : "left-3",
                "top-1/2 -translate-y-1/2 text-zinc-400",

                // Плаваючий ефект
                "peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-[10px] peer-focus:font-bold peer-focus:translate-y-0",
                "peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:translate-y-0",

                // Колірна логіка (як у Finance)
                hasError
                  ? "text-red-500"
                  : cn(
                      "text-zinc-400",
                      "peer-focus:text-teal-600 dark:peer-focus:text-teal-500",
                      "peer-[:not(:placeholder-shown)]:text-teal-600 dark:peer-[:not(:placeholder-shown)]:text-teal-500",
                    ),
              )}
            >
              {label}
              {required && (
                <span
                  className={cn(
                    "ml-1",
                    hasError ? "text-red-500" : "text-teal-600",
                  )}
                >
                  *
                </span>
              )}
            </label>
          )}
        </div>
      </div>

      {/* ПОВІДОМЛЕННЯ ПРО ПОМИЛКУ */}
      {hasError && (
        <p className="mt-1.5 ml-2 text-[10px] uppercase text-red-500 font-bold tracking-wider animate-in fade-in slide-in-from-top-1">
          {error.message}
        </p>
      )}
    </div>
  );
};
