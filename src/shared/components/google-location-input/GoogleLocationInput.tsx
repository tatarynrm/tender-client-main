"use client";

import { useState, useEffect, useCallback } from "react";
import debounce from "lodash.debounce";
import api from "@/shared/api/instance.api";
import { cn } from "@/shared/utils";
import { MapPin, Loader2, Navigation } from "lucide-react";
import { inputVariants } from "../Inputs/styles/styles";


interface GoogleLocationInputProps {
  value?: string;
  onChange: (location: any) => void;
  label?: string; // Додаємо label
  placeholder?: string;
  defaultValue?: string;
  disabled?: boolean;
  className?: string;
}

export const GoogleLocationInput = ({
  value,
  onChange,
  label = "Локація",
  placeholder = " ",
  defaultValue,
  disabled,
  className,
}: GoogleLocationInputProps) => {
  const [query, setQuery] = useState(value || defaultValue || "");
  const [results, setResults] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(value || null);
  const [isLoading, setIsLoading] = useState(false);

  const searchPlaces = useCallback(
    debounce(async (q: string) => {
      if (q.length < 3 || selected) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      try {
        const { data } = await api.get(`/location/autocomplete`, {
          params: { input: q },
        });
        setResults(data.predictions || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }, 400),
    [selected],
  );

  useEffect(() => {
    searchPlaces(query);
    return () => searchPlaces.cancel();
  }, [query, searchPlaces]);

  // Синхронізація з зовнішнім value
  useEffect(() => {
    if (value !== undefined) {
      setQuery(value);
      setSelected(value);
    }
  }, [value]);

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative mt-1.5 group">
        <div className="relative flex items-center">
          
          {/* ЛІВА ІКОНКА (MapPin) */}
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-teal-600 transition-colors z-30 pointer-events-none">
            {isLoading ? (
              <Loader2 size={18} strokeWidth={2.5} className="animate-spin text-teal-500" />
            ) : (
              <MapPin size={18} strokeWidth={2.5} />
            )}
          </div>

          <input
            type="text"
            value={query}
            disabled={disabled}
            placeholder={placeholder}
            autoComplete="off"
            spellCheck="false"
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(null);
            }}
            className={cn(
              inputVariants.base,
              "peer rounded-md !pl-11 pr-10 bg-white dark:bg-slate-900 relative z-20",
              inputVariants.default,
              disabled && inputVariants.disabled
            )}
          />

          {/* ЛЕЙБЛ */}
          {label && (
            <label
              className={cn(
                "absolute transition-all duration-200 ease-in-out pointer-events-none z-40",
                "px-1 mx-1 bg-white dark:bg-slate-900 uppercase tracking-widest",
                
                // Стан спокою (якщо іконка є - left-9)
                "left-9 top-1/2 -translate-y-1/2 text-zinc-400 text-[13px]",

                // Стан Floating (фокус або є текст)
                "peer-focus:-top-2 peer-focus:left-2 peer-focus:text-[10px] peer-focus:font-bold peer-focus:translate-y-0",
                "peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:translate-y-0",
                
                "peer-focus:text-teal-600 dark:peer-focus:text-teal-500"
              )}
            >
              {label}
            </label>
          )}
        </div>
      </div>

      {/* ВИПАДАЮЧИЙ СПИСОК РЕЗУЛЬТАТІВ */}
      {results.length > 0 && !selected && (
        <ul className="absolute z-[100] w-full mt-2 overflow-hidden rounded-xl border border-zinc-200 bg-white/95 p-1 shadow-2xl backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95">
          {results.map((r) => {
            const mainText = r.structured_formatting?.main_text || "";
            const secondaryText = r.structured_formatting?.secondary_text || "";

            return (
              <li
                key={r.place_id}
                className="group flex items-start gap-3 px-3 py-2.5 cursor-pointer rounded-lg transition-all hover:bg-teal-50 dark:hover:bg-teal-500/10"
                onClick={async () => {
                  try {
                    const { data: location } = await api.post("/location/resolve", {
                      placeId: r.place_id,
                    });
                    const displayValue = location.city || mainText;
                    onChange(location);
                    setQuery(displayValue);
                    setSelected(displayValue);
                    setResults([]);
                  } catch (err) {
                    console.error(err);
                  }
                }}
              >
                <div className="mt-1">
                  <Navigation size={14} className="text-zinc-400 group-hover:text-teal-500" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-[13px] text-zinc-900 dark:text-zinc-100 group-hover:text-teal-600">
                    {mainText}
                  </span>
                  {secondaryText && (
                    <span className="text-[11px] text-zinc-400 dark:text-zinc-500 line-clamp-1 italic">
                      {secondaryText}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};