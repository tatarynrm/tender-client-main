"use client";

import { useState, useEffect, useCallback } from "react";
import debounce from "lodash.debounce";
import { Input } from "../ui";
import api from "@/shared/api/instance.api";
import { cn } from "@/shared/utils"; // припускаю, що у вас є утиліта cn
import { MapPin, Loader2 } from "lucide-react"; // додамо іконки для кращого вигляду

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
    [selected]
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
          className="pr-10 focus-visible:ring-teal-500 transition-all duration-200"
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(null);
          }}
        />
        <div className="absolute right-3 text-muted-foreground/50">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-teal-500" />
          ) : (
            <MapPin className="h-4 w-4" />
          )}
        </div>
      </div>

      {results.length > 0 && !selected && (
        <ul className="absolute z-50 w-full mt-2 overflow-hidden rounded-xl border border-zinc-200 bg-white/80 p-1 shadow-xl backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90">
          {results.map((r) => (
            <li
              key={r.place_id}
              className={cn(
                "group flex flex-col px-3 py-2.5 cursor-pointer rounded-lg transition-colors",
                "hover:bg-teal-50 dark:hover:bg-teal-500/10",
                "text-sm text-zinc-700 dark:text-zinc-300"
              )}
              onClick={async () => {
                try {
                  const { data: location } = await api.post("/location/resolve", {
                    placeId: r.place_id,
                  });

                  const displayValue = location.city || location.street || r.description;
                  onChange(location);
                  setQuery(displayValue);
                  setSelected(displayValue);
                  setResults([]);
                } catch (err) {
                  console.error(err);
                }
              }}
            >
              <span className="font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-teal-600 dark:group-hover:text-teal-400">
                {r.structured_formatting?.main_text || r.description}
              </span>
              {r.structured_formatting?.secondary_text && (
                <span className="text-xs text-zinc-500 dark:text-zinc-500 line-clamp-1">
                  {r.structured_formatting.secondary_text}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};