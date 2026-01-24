"use client";

import React from "react";
import { useController, Control, FieldValues, Path } from "react-hook-form";
import { Switch } from "@/shared/components/ui/switch";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/shared/utils";
import { LucideIcon } from "lucide-react";

interface FormSwitchProps<T extends FieldValues> {
  name?: Path<T>;
  control?: Control<T>;
  label?: string; // Опціональний, як ми вирішили раніше
  id?: string;
  icon?: LucideIcon; // Додаємо іконку
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
  labelClassName?: string;
}

export const InputSwitch = <T extends FieldValues>({
  name,
  control,
  label,
  id,
  icon: Icon,
  checked: externalChecked,
  onCheckedChange: externalOnCheckedChange,
  className,
  labelClassName,
}: FormSwitchProps<T>) => {
  const controller = name && control ? useController({ name, control }) : null;

  const isChecked = externalChecked !== undefined ? externalChecked : controller?.field.value;

  const handleChange = (val: boolean) => {
    controller?.field.onChange?.(val);
    externalOnCheckedChange?.(val);
  };

  const inputId = id || name || (label ? label.replace(/\s+/g, "-").toLowerCase() : `switch-${Math.random().toString(36).substr(2, 9)}`);

  return (
    <div className={cn("flex items-center gap-3 px-1", className)}>
      <Switch
        id={inputId}
        checked={isChecked ?? false}
        onCheckedChange={handleChange}
        className={cn(
          "data-[state=checked]:bg-teal-600 dark:data-[state=checked]:bg-teal-500",
          "transition-colors"
        )}
      />
      
      {(label || Icon) && (
        <Label
          htmlFor={inputId}
          className={cn(
            "flex items-center gap-2 cursor-pointer select-none",
            "uppercase tracking-widest text-[11px] font-bold transition-colors",
            // Колір залежить від стану
            isChecked 
              ? "text-teal-600 dark:text-teal-500" 
              : "text-zinc-500 dark:text-zinc-400",
            labelClassName
          )}
        >
          {/* Відображення іконки */}
          {Icon && (
            <Icon 
              size={14} 
              strokeWidth={2.5} 
              className={cn(
                "transition-colors",
                isChecked ? "text-teal-600" : "text-zinc-400"
              )} 
            />
          )}
          {label}
        </Label>
      )}
    </div>
  );
};