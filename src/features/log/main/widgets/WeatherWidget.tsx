"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  MapPin,
  Search,
  ChevronDown,
  Navigation,
  Sun,
  Cloud,
  CloudSun,
  CloudRain,
  CloudLightning,
  CloudSnow,
  CloudFog,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { CITIES_DB } from "../constants/cities";

// --- Внутрішні хелпери для погоди ---
const WeatherIcon = ({
  code,
  className,
}: {
  code: number;
  className?: string;
}) => {
  if (code === 0)
    return (
      <Sun
        size={14}
        className={cn(
          "text-amber-500 animate-[spin_8s_linear_infinite]",
          className,
        )}
      />
    );
  if (code >= 1 && code <= 3)
    return <CloudSun size={14} className={cn("text-amber-400", className)} />;
  if (code >= 45 && code <= 48)
    return <CloudFog size={14} className={cn("text-slate-400", className)} />;
  if (code >= 51 && code <= 67)
    return <CloudRain size={14} className={cn("text-blue-500", className)} />;
  if (code >= 95)
    return (
      <CloudLightning size={14} className={cn("text-purple-500", className)} />
    );
  return <Cloud size={14} className={cn("text-slate-400", className)} />;
};

export const WeatherWidget = () => {
  const [weather, setWeather] = useState({
    temp: "--",
    city: "Львів",
    code: 0,
  });
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchWeather = async (lat: number, lon: number, cityName?: string) => {
    setLoading(true);
    try {
      if (!cityName) {
        const geo = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=uk`,
        );
        const geoData = await geo.json();
        cityName = geoData.city || geoData.locality || "Локація";
      }
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`,
      );
      const data = await res.json();
      setWeather({
        temp: `${Math.round(data.current_weather.temperature)}°C`,
        city: cityName || "Локація", // Гарантуємо, що тут завжди буде string
        code: data.current_weather.weathercode,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
      () => fetchWeather(49.83, 24.02, "Львів"),
    );
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return {
      ukraine: CITIES_DB.ukraine.filter((c) =>
        c.name.toLowerCase().includes(q),
      ),
      europe: CITIES_DB.europe.filter((c) => c.name.toLowerCase().includes(q)),
    };
  }, [search]);

  return (
    <div className="relative w-full" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-sm hover:border-blue-400 transition-all",
          loading && "opacity-70",
        )}
      >
        <WeatherIcon code={weather.code} />
        <div className="flex items-center gap-2">
          <span className="text-xs font-black">{weather.temp}</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase truncate max-w-[120px]">
            {weather.city}
          </span>
          <ChevronDown
            size={10}
            className={cn(
              "text-slate-400 transition-transform",
              isOpen && "rotate-180",
            )}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
          <div className="p-3 border-b border-slate-100 dark:border-white/5">
            <input
              placeholder="Пошук міста..."
              className="w-full bg-slate-50 dark:bg-slate-800 text-[11px] p-2 rounded-lg outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
            <button
              onClick={() => {
                navigator.geolocation.getCurrentPosition((pos) =>
                  fetchWeather(pos.coords.latitude, pos.coords.longitude),
                );
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-[10px] text-blue-500 font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
            >
              <Navigation size={12} /> Автоматично
            </button>
            {filtered.ukraine.map((city) => (
              <button
                key={city.name}
                onClick={() => {
                  fetchWeather(city.lat, city.lon, city.name);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-[11px] hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
              >
                <span>{city.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
