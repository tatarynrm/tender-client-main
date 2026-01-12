"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";
import { cn } from "@/shared/utils";

interface CustomSelectProps {
  label: string;
  value: any;
  onChange: (v: string) => void;
  options?: { ids?: string | number; id?: string | number; value: string }[];
  placeholder?: string;
  showSearch?: boolean;
  isMulti?: boolean;
}

export const CustomSelect = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Всі",
  showSearch = false,
  isMulti = false,
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const getOptId = (opt: any) => String(opt.ids ?? opt.id ?? "");

  const selectedIds = useMemo(() => {
    if (!value) return [];
    return String(value).split(",").filter(Boolean);
  }, [value]);

  // Чи вибрані всі доступні опції
  const isAllSelected = useMemo(() => {
    return options.length > 0 && selectedIds.length === options.length;
  }, [options, selectedIds]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && showSearch) {
      const timeout = setTimeout(() => searchInputRef.current?.focus(), 10);
      return () => clearTimeout(timeout);
    }
    if (!isOpen) setSearchQuery("");
  }, [isOpen, showSearch]);

  const triggerText = useMemo(() => {
    if (selectedIds.length === 0) return placeholder;
    if (isAllSelected && isMulti) return "Всі обрані";
    if (!isMulti) {
      return (
        options.find((opt) => getOptId(opt) === selectedIds[0])?.value ||
        placeholder
      );
    }
    return `Обрано: ${selectedIds.length}`;
  }, [selectedIds, options, placeholder, isMulti, isAllSelected]);

  const handleSelect = (id: string) => {
    const stringId = String(id);
    if (!isMulti) {
      onChange(stringId);
      setIsOpen(false);
      return;
    }

    let newSelected: string[];
    if (selectedIds.includes(stringId)) {
      newSelected = selectedIds.filter((i) => i !== stringId);
    } else {
      newSelected = [...selectedIds, stringId];
    }
    onChange(newSelected.join(","));
  };

  const handleToggleAll = () => {
    if (isAllSelected) {
      onChange(""); // Зняти всі
    } else {
      const allIds = options.map((opt) => getOptId(opt)).join(",");
      onChange(allIds); // Обрати всі
    }
  };

  const filteredOptions = useMemo(() => {
    if (!showSearch || !searchQuery) return options;
    return options.filter((opt) =>
      opt.value.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery, showSearch]);

  return (
    <div className="space-y-1 flex-1 relative" ref={containerRef}>
      <label className="text-[10px] font-bold text-muted-foreground/80 dark:text-zinc-500 uppercase tracking-wider ml-1 select-none">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full h-9 px-3 flex items-center justify-between transition-all duration-200",
          " border rounded-lg text-sm shadow-sm",
          isOpen
            ? "border-orange-500 ring-2 ring-orange-500/10"
            : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700",
          "text-left"
        )}
      >
        <span
          className={cn(
            "truncate",
            selectedIds.length === 0
              ? "text-muted-foreground"
              : "text-zinc-900 dark:text-zinc-100 font-medium"
          )}
        >
          {triggerText}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-zinc-400 transition-transform duration-300",
            isOpen && "rotate-180 text-orange-500"
          )}
          strokeWidth={2.5}
        />
      </button>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-1.5 p-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 origin-top">
          {showSearch && (
            <div className="relative mb-1 px-1 pt-1">
              <div className="relative flex items-center">
                <Search className="absolute left-2.5 h-3 w-3 text-zinc-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Пошук..."
                  className="w-full h-8 pl-8 pr-8 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-md text-xs outline-none focus:border-orange-500/50 transition-all text-zinc-900 dark:text-zinc-100"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchQuery("");
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-1.5 p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md"
                  >
                    <X className="h-3 w-3 text-zinc-500" />
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="max-h-[220px] overflow-y-auto overflow-x-hidden custom-scrollbar">
            {/* Панель керування: з'являється якщо немає пошукового запиту */}
            {!searchQuery && (
              <div className="flex items-center justify-between px-1 mb-1 border-b border-zinc-100 dark:border-zinc-800 pb-1">
                <button
                  type="button"
                  onClick={() => {
                    onChange("");
                    if (!isMulti) setIsOpen(false);
                  }}
                  className="px-2 py-1.5 text-[10px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors uppercase"
                >
                  Очистити
                </button>

                {isMulti && (
                  <button
                    type="button"
                    onClick={handleToggleAll}
                    className={cn(
                      "px-2 py-1.5 text-[10px] font-bold rounded-md transition-colors uppercase",
                      isAllSelected
                        ? "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        : "text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-500/10"
                    )}
                  >
                    {isAllSelected ? "Зняти всі" : "Обрати всі"}
                  </button>
                )}
              </div>
            )}

            <div className="space-y-0.5">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => {
                  const currentId = getOptId(opt);
                  const isSelected = selectedIds.includes(currentId);
                  return (
                    <div
                      key={currentId}
                      onClick={() => handleSelect(currentId)}
                      className={cn(
                        "group flex items-center justify-between px-2.5 py-2 rounded-md cursor-pointer transition-all duration-150",
                        isSelected
                          ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                          : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                      )}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {isMulti && (
                          <div
                            className={cn(
                              "w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors",
                              isSelected
                                ? "bg-orange-500 border-orange-500"
                                : "border-zinc-300 dark:border-zinc-600"
                            )}
                          >
                            {isSelected && (
                              <Check
                                className="h-2.5 w-2.5 text-white"
                                strokeWidth={4}
                              />
                            )}
                          </div>
                        )}
                        <span className="text-xs font-medium truncate">
                          {opt.value}
                        </span>
                      </div>
                      {!isMulti && isSelected && (
                        <Check
                          className="h-3 w-3 text-orange-500"
                          strokeWidth={3}
                        />
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-6 text-center text-[11px] text-zinc-400">
                  Нічого не знайдено
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
