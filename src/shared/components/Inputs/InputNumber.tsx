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
  className?: string;
  icon?: LucideIcon | null; // Можна передати null, щоб прибрати іконку
  placeholder?: string;
  onChange?: (value: number | null) => void;
}

export const InputNumber = <T extends FieldValues>({
  name,
  control,
  label,
  disabled,
  className,
  icon: Icon = Truck, // Вантажівка за замовчуванням
  placeholder = " ",
  onChange: externalOnChange,
}: InputNumberProps<T>) => {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  const hasError = !!error;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Дозволяємо лише цифри
    const rawValue = e.target.value.replace(/\D/g, "");
    const numericValue = rawValue === "" ? null : parseInt(rawValue, 10);

    field.onChange(numericValue);
    if (externalOnChange) externalOnChange(numericValue);
  };

  return (
    <div className={cn("flex flex-col w-full", className)}>
      <div className="relative mt-1.5 group">
        <div className="relative flex items-center">
          {/* ІКОНКА: z-30 для видимості поверх інпуту */}
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
            autoCorrect="off"
            spellCheck="false"
            data-lpignore="true"
            placeholder={placeholder}
            onChange={handleInputChange}
            // Порожній рядок для null/0, щоб спрацювала логіка плаваючого лейбла
            value={field.value === 0 || !field.value ? "" : field.value}
            className={cn(
              inputVariants.base,
              "peer rounded-md bg-white dark:bg-slate-900 relative z-20",
              // !pl-11 гарантує, що текст не залізе під іконку
              Icon ? "!pl-11" : "pl-3.5",
              "pr-4",
              hasError ? inputVariants.error : inputVariants.default,
              disabled && inputVariants.disabled,
            )}
          />

          {/* ЛЕЙБЛ: z-40 для перекриття */}
          {label && (
            <label
              htmlFor={name}
              className={cn(
                "absolute transition-all duration-200 ease-in-out pointer-events-none z-40",
                "px-1 mx-1 bg-white dark:bg-slate-900 uppercase tracking-widest",

                // Початкова позиція (коли порожньо)
                Icon ? "left-9" : "left-3",
                "top-1/2 -translate-y-1/2 text-zinc-400 text-[13px]",

                // Стан фокусу або заповненості
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
