"use client";

import React, { useState, useEffect, useRef } from "react";
import { useController, Control, FieldValues, Path } from "react-hook-form";
import { cn } from "@/shared/utils";
import {
  Building2,
  LucideIcon,
  Search,
  Loader2,
  X,
  ChevronDown,
} from "lucide-react";
import { inputVariants } from "./styles/styles";
import api from "@/shared/api/instance.api";

interface Props<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  icon?: LucideIcon;
  className?: string;
  required?: boolean;
  initialLabel?: string;
  // ДОДАНО: колбек для передачі назви компанії наверх
  onEntityChange?: (
    entity: { id: number | string; name: string } | null,
  ) => void;
}

export const InputAsyncSelectCompany = <T extends FieldValues>({
  name,
  control,
  label,
  icon: Icon = Building2,
  className,
  required,
  initialLabel,
  onEntityChange, // Деструктуризація
}: Props<T>) => {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [localDisplayValue, setLocalDisplayValue] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setOptions([]);
      return;
    }

    const delay = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/company/name/${searchTerm}`);
        const mappedOptions = data.map((c: any) => ({
          value: c.id,
          label: c.company_name,
        }));
        setOptions(mappedOptions);
      } catch (err) {
        console.error("Fetch companies error:", err);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [searchTerm]);

  // ОНОВЛЕНО: Викликаємо onEntityChange при виборі
  const handleSelect = (option: any) => {
    field.onChange(option.value);
    setLocalDisplayValue(option.label);

    // Передаємо дані батьківському компоненту для localStorage
    if (onEntityChange) {
      onEntityChange({ id: option.value, name: option.label });
    }

    setSearchTerm("");
    setOpen(false);
  };

  // ОНОВЛЕНО: Очищаємо і назву в батьківському компоненті
  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    field.onChange(null);
    setLocalDisplayValue("");
    setSearchTerm("");
    if (onEntityChange) {
      onEntityChange(null);
    }
  };

  useEffect(() => {
    if (!field.value) {
      setLocalDisplayValue("");
      setSearchTerm("");
    }
  }, [field.value]);

  // ОНОВЛЕНО: Синхронізація з пропсом initialLabel
  useEffect(() => {
    // Якщо прийшов новий initialLabel (наприклад, при зміні ID в URL
    // або завантаженні нових defaultValues), оновлюємо локальний текст
    if (initialLabel !== undefined) {
      setLocalDisplayValue(initialLabel);
    }
  }, [initialLabel]); // Слідкуємо саме за зміною вхідного тексту

  return (
    <div
      className={cn("flex flex-col w-full relative", className)}
      ref={containerRef}
    >
      <div className="relative mt-1.5 group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-teal-600 z-30 pointer-events-none">
          {loading ? (
            <Loader2 size={18} className="animate-spin text-teal-600" />
          ) : (
            <Icon size={18} strokeWidth={2.2} />
          )}
        </div>

        <div
          onClick={() => setOpen(!open)}
          className={cn(
            inputVariants.base,
            "min-h-[46px] pl-12 pr-10 flex items-center cursor-pointer transition-all duration-200",
            "bg-white dark:bg-slate-900 shadow-sm",
            "rounded-2xl border-zinc-200 dark:border-white/10",
            open
              ? "border-teal-600 ring-[0.5px] ring-teal-600 shadow-teal-500/10 shadow-lg"
              : "hover:border-zinc-300 dark:hover:border-white/20",
            error ? "border-red-500 ring-red-500" : "",
          )}
        >
          <span
            className={cn(
              "text-[13px] font-medium truncate transition-colors",
              localDisplayValue
                ? "text-zinc-900 dark:text-zinc-100"
                : "text-transparent",
            )}
          >
            {localDisplayValue || "Placeholder"}
          </span>

          <div className="absolute right-3 flex items-center gap-1">
            {field.value && (
              <button
                onClick={clearSelection}
                className="p-1 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full text-zinc-400 hover:text-red-500 transition-colors"
              >
                <X size={14} />
              </button>
            )}
            <ChevronDown
              size={16}
              className={cn(
                "text-zinc-400 transition-transform duration-200",
                open && "rotate-180 text-teal-600",
              )}
            />
          </div>
        </div>

        <label
          className={cn(
            "absolute transition-all duration-200 pointer-events-none z-40 px-1.5 mx-1 bg-white dark:bg-slate-900 uppercase tracking-widest",
            "left-10 top-1/2 -translate-y-1/2 text-zinc-400 text-[12px] font-medium",
            (field.value || open) &&
              "-top-2.5 left-3 text-[10px] font-bold translate-y-0 text-teal-600 dark:text-teal-500",
            error && "text-red-500",
          )}
        >
          {label}
          {required && (
            <span
              className={cn("ml-1", error ? "text-red-500" : "text-teal-600")}
            >
              *
            </span>
          )}
        </label>
      </div>

      {open && (
        <div
          className={cn(
            "absolute top-[calc(100%+8px)] left-0 w-full bg-white dark:bg-zinc-950",
            "border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-[100]",
            "overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200",
          )}
        >
          <div className="p-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3 bg-zinc-50/50 dark:bg-white/5">
            <Search size={16} className="text-teal-600" strokeWidth={2.5} />
            <input
              autoFocus
              className="w-full bg-transparent border-none outline-none text-[13px] font-medium placeholder:text-zinc-400"
              placeholder="Введіть назву компанії..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="max-h-[280px] overflow-y-auto custom-scrollbar">
            {options.length > 0 ? (
              <div className="py-1">
                {options.map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => handleSelect(opt)}
                    className={cn(
                      "px-4 py-3 text-[13px] font-medium cursor-pointer transition-all",
                      "hover:bg-teal-50 dark:hover:bg-teal-500/10 hover:text-teal-600 dark:hover:text-teal-400",
                      "border-b border-zinc-50 dark:border-zinc-900/50 last:border-none",
                      field.value === opt.value &&
                        "bg-teal-50/50 dark:bg-teal-500/5 text-teal-600",
                    )}
                  >
                    {opt.label}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center flex flex-col items-center gap-2">
                <Search
                  size={24}
                  className="text-zinc-200 dark:text-zinc-800"
                />
                <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-zinc-400">
                  {searchTerm.length < 2
                    ? "Мінімум 2 символи"
                    : loading
                      ? "Пошук результатів..."
                      : "Компанію не знайдено"}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1.5 ml-3 text-[10px] uppercase tracking-wider text-red-500 font-bold">
          {error.message}
        </p>
      )}
    </div>
  );
};
