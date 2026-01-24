"use client";

import React from "react";
import { useController, Control, FieldValues, Path } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"; // Шлях до вашого shadcn select

import { cn } from "@/shared/utils";
import { Coins, LucideIcon } from "lucide-react";
import { inputVariants } from "../Inputs/styles/styles";

interface SelectFinanceProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  disabled?: boolean;
  className?: string;
  options: { label: string; value: string }[];
  icon?: LucideIcon | null;
  placeholder?: string;
}

export const SelectFinance = <T extends FieldValues>({
  name,
  control,
  label,
  disabled,
  className,
  options,
  icon: Icon = Coins,
  placeholder = " ",
}: SelectFinanceProps<T>) => {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  const hasValue = field.value !== undefined && field.value !== null && field.value !== "";
  const hasError = !!error;

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

          <Select
            disabled={disabled}
            value={field.value}
            onValueChange={field.onChange}
          >
            <SelectTrigger
              className={cn(
                inputVariants.base,
                "h-10 rounded-md bg-white dark:bg-slate-900 relative z-20 transition-all",
                Icon ? "!pl-11" : "pl-3.5",
                hasError ? inputVariants.error : inputVariants.default,
                disabled && inputVariants.disabled
              )}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            
            <SelectContent className="z-[100]">
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* ЛЕЙБЛ (Емуляція плаваючого лейбла) */}
          {label && (
            <label
              className={cn(
                "absolute transition-all duration-200 ease-in-out pointer-events-none z-40",
                "px-1 mx-1 bg-white dark:bg-slate-900 uppercase tracking-widest",
                
                // Якщо є значення або фокус — злітає вгору
                (hasValue) 
                  ? "-top-2 left-2 text-[10px] font-bold text-teal-600" 
                  : "top-1/2 -translate-y-1/2 text-[13px] text-zinc-400",
                
                // Зміщення вліво в стані спокою, якщо є іконка
                !hasValue && (Icon ? "left-9" : "left-3"),
                
                hasError && "text-red-500"
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