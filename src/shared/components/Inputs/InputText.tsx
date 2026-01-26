"use client";

import React, { useState } from "react";
import { useController, Control, FieldValues, Path } from "react-hook-form";
import { cn } from "@/shared/utils";
import { Eye, EyeOff, LucideIcon } from "lucide-react";

interface InputTextProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  type?: "text" | "email" | "password" | "number" | "url";
  disabled?: boolean;
  className?: string;
  icon?: LucideIcon | null;
  rightLabel?: React.ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  autoComplete?: string;
}

export const InputText = <T extends FieldValues>({
  name,
  control,
  label,
  type = "text",
  disabled,
  className,
  icon: Icon,
  rightLabel,
  onChange: externalOnChange,
  required,
  autoComplete = "off",
}: InputTextProps<T>) => {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  const [showPassword, setShowPassword] = useState(false);
  const hasError = !!error;
  const isPassword = type === "password";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    field.onChange(e);
    if (externalOnChange) externalOnChange(e);
  };

  // Базові класи для лейбла, коли він піднятий (focus, заповнений або autofill)
  const labelFloatingClasses = [
    "-top-2",
    "left-2",
    "text-[10px]",
    "translate-y-0",
    "font-bold",
  ];

  return (
    <div className={cn("flex flex-col w-full", className)}>
      {rightLabel && <div className="flex justify-end mb-1">{rightLabel}</div>}

      <div className="relative mt-1.5 group">
        <div className="relative flex items-center">
          {/* Іконка зліва */}
          {Icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-teal-600 transition-colors z-30 pointer-events-none">
              <Icon size={18} strokeWidth={2.5} />
            </div>
          )}

          <input
            {...field}
            id={name}
            type={isPassword ? (showPassword ? "text" : "password") : type}
            disabled={disabled}
            placeholder=" " // Важливо для роботи селектора :placeholder-shown
            autoComplete={autoComplete}
            onChange={handleInputChange}
            value={field.value ?? ""}
            className={cn(
              "peer w-full h-11 rounded-md bg-white dark:bg-slate-900 relative z-20 border transition-all outline-none",
              "text-[14px] text-slate-900 dark:text-white",
              // Падінги залежно від наявності іконки та типу пароль
              Icon ? "pl-11" : "pl-3.5",
              isPassword ? "pr-11" : "pr-3.5",
              // Кольори бордера
              hasError
                ? "border-red-500"
                : "border-zinc-200 dark:border-white/10 focus:border-teal-600",
              // Стилізація Autofill (щоб не було "жовтого" фону від Chrome)
              "autofill:shadow-[inset_0_0_0_1000px_#fff] dark:autofill:shadow-[inset_0_0_0_1000px_#0f172a]",
              disabled && "opacity-50 cursor-not-allowed",
            )}
          />

          {label && (
            <label
              htmlFor={name}
              className={cn(
                "absolute transition-all duration-200 ease-in-out pointer-events-none z-40 px-1 mx-1 bg-white dark:bg-slate-900",
                "uppercase tracking-widest text-[13px] text-zinc-400",
                "top-1/2 -translate-y-1/2",
                Icon ? "left-10" : "left-3",

                // 1. Стан Фокусу
                "peer-focus:-top-2 peer-focus:left-2 peer-focus:text-[10px] peer-focus:font-bold peer-focus:translate-y-0 peer-focus:text-teal-600",

                // 2. Стан, коли поле вже заповнене користувачем
                "peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:translate-y-0",

                // 3. Стан АВТОЗАПОВНЕННЯ (Autofill)
                "peer-autofill:-top-2 peer-autofill:left-2 peer-autofill:text-[10px] peer-autofill:translate-y-0",

                // Стан помилки
                hasError && "text-red-500 peer-focus:text-red-500",
              )}
            >
              {label}
              {required && (
                <span className="ml-1 text-red-500 font-bold">*</span>
              )}
            </label>
          )}

          {/* Кнопка показати/приховати пароль */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-teal-600 transition-colors z-30 focus:outline-none"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
      </div>

      {/* Повідомлення про помилку */}
      {hasError && (
        <p className="mt-1 ml-1 text-[10px] uppercase text-red-500 tracking-tight font-bold animate-in fade-in slide-in-from-top-1">
          {error.message}
        </p>
      )}
    </div>
  );
};
