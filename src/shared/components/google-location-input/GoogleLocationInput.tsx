"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import debounce from "lodash.debounce";
import api from "@/shared/api/instance.api";
import { cn } from "@/shared/utils";
import { MapPin, Loader2, Navigation, X } from "lucide-react";
import { inputVariants } from "../Inputs/styles/styles";

interface GoogleLocationInputProps {
  value?: string;
  onChange: (location: any) => void;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean; // Додано
  className?: string;
}

export const GoogleLocationInput = ({
  value,
  onChange,
  label = "Локація",
  placeholder = " ",
  defaultValue,
  disabled,
  required = false, // Дефолтне значення
  className,
}: GoogleLocationInputProps) => {
  const [query, setQuery] = useState(value || defaultValue || "");
  const [results, setResults] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(value || null);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);


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

  // Закриття списку при кліку поза компонентом
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (value !== undefined) {
      setQuery(value);
      setSelected(value);
    }
  }, [value]);

  const handleClear = () => {
    setQuery("");
    setSelected(null);
    setResults([]);
    onChange(null);
  };

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <div className="relative mt-1.5 group">
        <div className="relative flex items-center">
          
          {/* ЛІВА ІКОНКА (MapPin або Loader) */}
          <div className={cn(
            "absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors z-30 pointer-events-none",
            "text-zinc-400 group-focus-within:text-teal-600"
          )}>
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
              "peer rounded-2xl !pl-11 pr-10 bg-white dark:bg-slate-900 relative z-20 h-[46px] transition-all duration-200",
              "border-zinc-200 dark:border-white/10 hover:border-zinc-300 focus:border-teal-600 focus:ring-[0.5px] focus:ring-teal-600",
              disabled && inputVariants.disabled
            )}
          />

          {/* КНОПКА ОЧИСТКИ */}
          {query && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-1 text-zinc-400 hover:text-red-500 transition-colors"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          )}

          {/* ЛЕЙБЛ ЗІ ЗІРОЧКОЮ */}
          {label && (
            <label
              className={cn(
                "absolute transition-all duration-200 ease-in-out pointer-events-none z-40",
                "px-1.5 mx-1 bg-white dark:bg-slate-900 uppercase tracking-widest text-[12px] font-medium",
                
                // Стан спокою
                "left-10 top-1/2 -translate-y-1/2 text-zinc-400",

                // Стан Floating
                "peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-[10px] peer-focus:font-bold peer-focus:translate-y-0",
                "peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:translate-y-0",
                
                "peer-focus:text-teal-600 dark:peer-focus:text-teal-500"
              )}
            >
              {label}
              {required && (
                <span className="ml-1 text-teal-600 font-bold">*</span>
              )}
            </label>
          )}
        </div>
      </div>

      {/* ВИПАДАЮЧИЙ СПИСОК РЕЗУЛЬТАТІВ */}
      {results.length > 0 && !selected && (
        <ul className="absolute z-[100] w-full mt-2 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
            {results.map((r) => {
              const mainText = r.structured_formatting?.main_text || "";
              const secondaryText = r.structured_formatting?.secondary_text || "";

              return (
                <li
                  key={r.place_id}
                  className="group flex items-start gap-3 px-4 py-2.5 cursor-pointer rounded-xl transition-all mb-0.5 hover:bg-teal-50 dark:hover:bg-teal-500/10"
                  onClick={async () => {
                    try {
                      setIsLoading(true);
                      const { data: location } = await api.post("/location/resolve", {
                        placeId: r.place_id,
                      });
                      console.log(location,'LOCATION----- 180');
                      
                      const displayValue = location.city || mainText;
                      onChange(location);
                      setQuery(displayValue);
                      setSelected(displayValue);
                      setResults([]);
                    } catch (err) {
                      console.error(err);
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                >
                  <div className="mt-1">
                    <Navigation size={14} className="text-zinc-400 group-hover:text-teal-500 transition-colors" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-[13px] text-zinc-700 dark:text-zinc-200 group-hover:text-teal-600 transition-colors">
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
          </div>
        </ul>
      )}
    </div>
  );
};