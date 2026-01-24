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
              inputVariants.base, // Базові стилі спочатку
              "peer rounded-md pr-12 bg-white dark:bg-slate-900 relative z-20",
              // Додаємо !pl-11, щоб Tailwind перебив внутрішні стилі base
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
                "px-1 mx-1 bg-white dark:bg-slate-900",
                
                // Якщо є іконка, лейбл зміщуємо на 10 (left-10), щоб він почався там де і цифри
                Icon ? "left-9" : "left-3", 
                "top-1/2 -translate-y-1/2 text-zinc-400 text-[13px]",

                // Стан фокусу: завжди повертаємо вліво (left-2)
                "peer-focus:-top-2 peer-focus:left-2 peer-focus:text-[10px] peer-focus:font-bold peer-focus:translate-y-0",
                "peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:translate-y-0",
                
                hasError ? "text-red-500" : "text-zinc-400 peer-focus:text-teal-600 dark:peer-focus:text-teal-500",
                "uppercase tracking-widest",
              )}
            >
              {label}
            </label>
          )}

          {/* ВАЛЮТА */}
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-black text-[11px] pointer-events-none uppercase z-40">
            {currency}
          </div>
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