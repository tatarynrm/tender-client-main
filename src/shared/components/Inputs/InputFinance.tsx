"use client";

import React from "react";
import { useController, Control, FieldValues, Path } from "react-hook-form";
import { inputVariants } from "./styles/styles";
import { cn } from "@/shared/utils";
import { CircleDollarSign, LucideIcon } from "lucide-react";

interface InputFinanceProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  required?: boolean; // Додано пропс
  disabled?: boolean;
  className?: string;
  currency?: string;
  icon?: LucideIcon | null;
  onChange?: (value: number | null) => void;
}

export const InputFinance = <T extends FieldValues>({
  name,
  control,
  label,
  required = false, // Значення за замовчуванням
  disabled,
  className,
  currency = "₴",
  icon: Icon = CircleDollarSign,
  onChange: externalOnChange,
}: InputFinanceProps<T>) => {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  const hasError = !!error;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Видаляємо все, крім цифр
    const rawValue = e.target.value.replace(/\D/g, "");
    const numericValue = rawValue === "" ? null : parseInt(rawValue, 10);
    field.onChange(numericValue);
    if (externalOnChange) externalOnChange(numericValue);
  };

  const formatDisplayValue = (val: any) => {
    if (!val && val !== 0) return "";
    if (val === 0) return "";
    return new Intl.NumberFormat("uk-UA").format(val);
  };

  return (
    <div className={cn("flex flex-col w-full", className)}>
      <div className="relative mt-1.5 group">
        <div className="relative flex items-center">
          {/* ІКОНКА */}
          {Icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-teal-600 transition-colors z-30 pointer-events-none">
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
            placeholder=" "
            onChange={handleInputChange}
            value={formatDisplayValue(field.value)}
            className={cn(
              inputVariants.base,
              "peer rounded-md pr-12 bg-white dark:bg-slate-900 relative z-20",
              Icon ? "!pl-11" : "pl-3.5",
              hasError ? inputVariants.error : inputVariants.default,
              disabled && inputVariants.disabled,
            )}
          />

          {/* ЛЕЙБЛ ЗІ СТАТУСОМ REQUIRED */}
          {/* ЛЕЙБЛ ЗІ СТАТУСОМ REQUIRED */}
          {label && (
            <label
              htmlFor={name}
              className={cn(
                "absolute transition-all duration-200 ease-in-out pointer-events-none z-40",
                "px-1 mx-1 bg-white dark:bg-slate-900 uppercase tracking-widest",

                // Базова позиція (всередині інпуту)
                Icon ? "left-9" : "left-3",
                "top-1/2 -translate-y-1/2 text-zinc-400 text-[12px] font-medium",

                // Виїжджає вгору (якщо фокус АБО якщо не порожньо)
                "peer-focus:-top-2 peer-focus:left-2 peer-focus:text-[10px] peer-focus:font-bold peer-focus:translate-y-0",
                "peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:translate-y-0",

                // Колірна логіка
                hasError
                  ? "text-red-500"
                  : cn(
                      "text-zinc-400",
                      "peer-focus:text-teal-600 dark:peer-focus:text-teal-500",
                      // Цей клас змушує лейбл бути кольоровим, коли поле заповнене
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
          {/* ВАЛЮТА */}
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-black text-[11px] pointer-events-none uppercase z-40">
            {currency}
          </div>
        </div>
      </div>

      {hasError && (
        <p className="mt-1.5 ml-1 text-[10px] uppercase text-red-500 tracking-wider font-bold animate-in fade-in slide-in-from-top-1">
          {error.message}
        </p>
      )}
    </div>
  );
};
