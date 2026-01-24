"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  ChevronDown,
  Navigation,
  Sun,
  Cloud,
  CloudSun,
  CloudRain,
  CloudLightning,
  CloudFog,
  Globe, // Додано для іконок груп
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
        city: cityName || "Локація",
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

  // Хелпер для рендеру списку міст
  const renderCityList = (cities: typeof CITIES_DB.ukraine, label: string) => {
    if (cities.length === 0) return null;
    return (
      <div className="mb-2">
        <div className="px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2 bg-slate-50/50 dark:bg-white/5 mb-1">
          {label === "Україна" ? "🇺🇦 " : "🇪🇺 "} {label}
        </div>
        {cities.map((city) => (
          <button
            key={city.name}
            onClick={() => {
              fetchWeather(city.lat, city.lon, city.name);
              setIsOpen(false);
              setSearch("");
            }}
            className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
          >
            <span>{city.name}</span>
          </button>
        ))}
      </div>
    );
  };

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
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="text-xs font-black">{weather.temp}</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase truncate max-w-[100px]">
            {weather.city}
          </span>
          <ChevronDown
            size={10}
            className={cn(
              "text-slate-400 shrink-0 transition-transform",
              isOpen && "rotate-180",
            )}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="p-3 border-b border-slate-100 dark:border-white/5">
            <input
              placeholder="Пошук міста..."
              autoFocus
              className="w-full bg-slate-50 dark:bg-slate-800 text-[11px] p-2 rounded-lg outline-none border border-transparent focus:border-blue-400/50 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="max-h-64 overflow-y-auto p-1 custom-scrollbar">
            {/* Спеціальна кнопка для локації */}
            <button
              onClick={() => {
                navigator.geolocation.getCurrentPosition((pos) =>
                  fetchWeather(pos.coords.latitude, pos.coords.longitude),
                );
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-[10px] text-blue-500 font-black hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors border-b border-slate-50 dark:border-white/5 mb-1"
            >
              <Navigation size={12} fill="currentColor" /> Моя локація
            </button>

            {/* Групи міст */}
            {renderCityList(filtered.ukraine, "Україна")}
            {renderCityList(filtered.europe, "Європа")}

            {/* Заглушка, якщо нічого не знайдено */}
            {filtered.ukraine.length === 0 && filtered.europe.length === 0 && (
              <div className="p-4 text-center text-[10px] text-slate-400 italic">
                Місто не знайдено
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
