"use client";

import React, { useState } from "react";
import { useController, Control, FieldValues, Path } from "react-hook-form";
// Переконайтеся, що шлях до стилів вірний
import { inputVariants } from "./styles/styles"; 
import { cn } from "@/shared/utils";
import { Eye, EyeOff, LucideIcon } from "lucide-react";

interface InputTextProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  type?: "text" | "email" | "password" | "number" | "url";
  disabled?: boolean;
  className?: string;
  // Змінюємо на LucideIcon для передачі компонента
  icon?: LucideIcon | null; 
  rightLabel?: React.ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const InputText = <T extends FieldValues>({
  name,
  control,
  label,
  type = "text",
  disabled,
  className,
  icon: Icon, // Використовуємо з великої літери як компонент
  rightLabel,
  onChange: externalOnChange,
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

  return (
    <div className={cn("flex flex-col w-full", className)}>
      {rightLabel && <div className="flex justify-end mb-1">{rightLabel}</div>}
      
      <div className="relative mt-1.5 group">
        <div className="relative flex items-center">
          
          {/* ЛІВА ІКОНКА */}
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
            placeholder=" " // Важливо для peer-[:not(:placeholder-shown)]
            autoComplete={isPassword ? "new-password" : "off"}
            onChange={handleInputChange}
            value={field.value ?? ""}
            className={cn(
              "peer w-full h-11 rounded-md bg-white dark:bg-slate-900 relative z-20 border transition-all outline-none",
              // Динамічні відступи залежно від наявності іконок
              Icon ? "pl-11" : "pl-3.5",
              isPassword ? "pr-11" : "pr-3.5",
              // Стилі з вашого variants або fallback
              hasError ? "border-red-500" : "border-zinc-200 dark:border-white/10 focus:border-teal-600",
              disabled && "opacity-50 cursor-not-allowed",
              "text-[14px] text-slate-900 dark:text-white"
            )}
          />

          {/* ЛЕЙБЛ З АНІМАЦІЄЮ */}
          {label && (
            <label
              htmlFor={name}
              className={cn(
                "absolute transition-all duration-200 ease-in-out pointer-events-none z-40 px-1 mx-1 bg-white dark:bg-slate-900",
                "uppercase tracking-widest text-[13px]",
                
                // Початкова позиція (всередині інпуту)
                Icon ? "left-10" : "left-3",
                "top-1/2 -translate-y-1/2 text-zinc-400",

                // Стан при фокусі або заповненні (вилітає вгору)
                "peer-focus:-top-2 peer-focus:left-2 peer-focus:text-[10px] peer-focus:font-bold peer-focus:translate-y-0 peer-focus:text-teal-600",
                "peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:translate-y-0",
                
                hasError && "text-red-500 peer-focus:text-red-500"
              )}
            >
              {label}
            </label>
          )}

          {/* КНОПКА ПАРОЛЯ */}
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

      {/* ПОВІДОМЛЕННЯ ПРО ПОМИЛКУ */}
      {hasError && (
        <p className="mt-1 ml-1 text-[10px] uppercase text-red-500 tracking-tight font-bold animate-in fade-in slide-in-from-top-1">
          {error.message}
        </p>
      )}
    </div>
  );
};