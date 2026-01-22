"use client";

import { useState, useEffect, useCallback } from "react";
import debounce from "lodash.debounce";
import { Input } from "../ui";
import api from "@/shared/api/instance.api";
import { cn } from "@/shared/utils";
import { MapPin, Loader2, Navigation } from "lucide-react";
import { useFontSize } from "@/shared/providers/FontSizeProvider";
interface GoogleLocationInputProps {
  value?: string;
  onChange: (location: any) => void;
  placeholder?: string;
  defaultValue?: string;
}
export const GoogleLocationInput = ({
  value,
  onChange,
  placeholder,
  defaultValue,
}: GoogleLocationInputProps) => {
  const [query, setQuery] = useState(value || defaultValue || "");
  const [results, setResults] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(value || null);
  const [isLoading, setIsLoading] = useState(false);

  const { config } = useFontSize();
  console.log(value, "VALUE");
  console.log(placeholder, "placeholder");
  console.log(defaultValue, "defaultValue");

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

  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <Input
          value={query}
          placeholder={placeholder}
          className={cn(
            "pr-10 focus-visible:ring-teal-500 transition-all duration-200",
            config.main,
          )}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(null);
          }}
        />
        <div className="absolute right-3 text-muted-foreground/50">
          {isLoading ? (
            <Loader2
              className="animate-spin text-teal-500"
              size={config.icon - 4}
            />
          ) : (
            <MapPin size={config.icon - 4} />
          )}
        </div>
      </div>

      {results.length > 0 && !selected && (
        <ul className="absolute z-50 w-full mt-2 overflow-hidden rounded-xl border border-zinc-200 bg-white/95 p-1 shadow-2xl backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95">
          {results.map((r) => {
            // Google зазвичай кладе назву об'єкта (місто або вулицю) в main_text
            // А уточнення (область або місто для вулиці) в secondary_text
            const mainText = r.structured_formatting?.main_text || "";
            const secondaryText = r.structured_formatting?.secondary_text || "";

            return (
              <li
                key={r.place_id}
                className="group flex items-start gap-3 px-3 py-2.5 cursor-pointer rounded-lg transition-all hover:bg-teal-50 dark:hover:bg-teal-500/10"
                onClick={async () => {
                  try {
                    const { data: location } = await api.post(
                      "/location/resolve",
                      {
                        placeId: r.place_id,
                      },
                    );

                    // Визначаємо, що показати в інпуті: пріоритет місту
                    const displayValue = location.city || mainText;

                    onChange(location); // Передаємо повний об'єкт
                    setQuery(displayValue); // В інпут ставимо тільки місто
                    setSelected(displayValue);
                    setResults([]);
                  } catch (err) {
                    console.error(err);
                  }
                }}
              >
                <div className="mt-1">
                  <Navigation
                    size={config.icon - 6}
                    className="text-zinc-400 group-hover:text-teal-500"
                  />
                </div>

                <div className="flex flex-col">
                  {/* НАЗВА (МІСТО) ВЕЛИКИМ */}
                  <span
                    className={cn(
                      "font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-teal-600",
                      config.main,
                    )}
                  >
                    {mainText}
                  </span>

                  {/* УТОЧНЕННЯ (АДРЕСА) ДРІБНИМ */}
                  {secondaryText && (
                    <span
                      className={cn(
                        "text-zinc-400 dark:text-zinc-500 line-clamp-1 italic",
                        config.label, // Використовуємо менший шрифт з конфігу
                      )}
                    >
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
