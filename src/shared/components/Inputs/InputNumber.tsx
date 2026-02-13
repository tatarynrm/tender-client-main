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
  minus?: boolean;
}

export const InputNumber = <T extends FieldValues>({
  name,
  control,
  label,
  disabled,
  required = false,
  className,
  icon: Icon = Truck,
  placeholder = " ",
  onChange: externalOnChange,
  minus = false,
}: InputNumberProps<T>) => {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  const hasError = !!error;

  // 🔹 string для відображення
  const [displayValue, setDisplayValue] = React.useState<string>("");

  // 🔹 синхронізація з RHF (edit / reset / defaultValues)
  React.useEffect(() => {
    if (field.value === null || field.value === undefined) {
      setDisplayValue("");
    } else {
      setDisplayValue(String(field.value));
    }
  }, [field.value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawValue = e.target.value;

    if (minus) {
      rawValue = rawValue.replace(/[^\d-]/g, "").replace(/(?!^)-/g, "");
    } else {
      rawValue = rawValue.replace(/\D/g, "");
    }

    // ✅ показуємо рівно те, що вводять
    setDisplayValue(rawValue);

    // ✅ у форму кладемо number | null
    const numericValue =
      rawValue === "" || rawValue === "-" ? null : Number(rawValue);

    field.onChange(numericValue);
    externalOnChange?.(numericValue);
  };

  return (
    <div className={cn("flex flex-col w-full", className)}>
      <div className="relative mt-1.5 group">
        <div className="relative flex items-center">
          {/* ICON */}
          {Icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-teal-600 z-30 pointer-events-none">
              <Icon size={18} strokeWidth={2.5} />
            </div>
          )}

          {/* INPUT */}
          <input
            id={name}
            type="text"
            inputMode="numeric"
            disabled={disabled}
            autoComplete="off"
            spellCheck="false"
            placeholder={placeholder}
            value={displayValue}
            onChange={handleInputChange}
            onBlur={field.onBlur}
            ref={field.ref}
            className={cn(
              inputVariants.base,
              "peer rounded-2xl bg-white dark:bg-slate-900 relative z-20 transition-all duration-200",
              "min-h-[46px] pr-4",
              Icon ? "!pl-12" : "pl-4",
              hasError
                ? "border-red-500 ring-[0.5px] ring-red-500"
                : "border-zinc-200 hover:border-zinc-300 focus:border-teal-600 focus:ring-[0.5px] focus:ring-teal-600",
              disabled && inputVariants.disabled,
            )}
          />

          {/* LABEL */}
          {label && (
            <label
              htmlFor={name}
              className={cn(
                "absolute transition-all duration-200 pointer-events-none z-40",
                "px-1.5 mx-1 bg-white dark:bg-slate-900 uppercase tracking-widest text-[12px] font-medium",
                Icon ? "left-10" : "left-3",
                "top-1/2 -translate-y-1/2 text-zinc-400",
                "peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-[10px] peer-focus:font-bold peer-focus:translate-y-0",
                "peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:translate-y-0",
                hasError
                  ? "text-red-500"
                  : "peer-focus:text-teal-600 peer-[:not(:placeholder-shown)]:text-teal-600",
              )}
            >
              {label}
              {required && <span className="ml-1 text-teal-600">*</span>}
            </label>
          )}
        </div>
      </div>

      {hasError && (
        <p className="mt-1.5 ml-2 text-[10px] uppercase text-red-500 font-bold">
          {error.message}
        </p>
      )}
    </div>
  );
};
