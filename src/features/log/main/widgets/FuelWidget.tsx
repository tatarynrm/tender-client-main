"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import {
  ChevronDown,
  Fuel,
  Droplet,
  Zap,
  Flame,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/shared/utils";

// Типізація для пального
interface FuelData {
  type: string;
  price: string;
}

// --- Хелпер для іконок пального ---
const FuelIcon = ({
  type,
  className,
}: {
  type: string;
  className?: string;
}) => {
  const t = type.toLowerCase();
  if (t.includes("95") || t.includes("100") || t.includes("98"))
    return <Fuel size={14} className={cn("text-red-500", className)} />;
  if (t.includes("92"))
    return <Fuel size={14} className={cn("text-orange-500", className)} />;
  if (t.includes("дп") || t.includes("дизель"))
    return (
      <Droplet
        size={14}
        className={cn("text-slate-600 dark:text-slate-400", className)}
      />
    );
  if (t.includes("газ") || t.includes("автогаз"))
    return <Flame size={14} className={cn("text-blue-500", className)} />;

  // Дефолтна іконка
  return <Zap size={14} className={cn("text-amber-500", className)} />;
};

export const FuelWidget = () => {
  const [fuelData, setFuelData] = useState<FuelData[]>([]);
  const [selectedFuel, setSelectedFuel] = useState<FuelData>({
    type: "Завантаження...",
    price: "--",
  });

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchFuelPrices = async () => {
    setLoading(true);
    setError(false);
    try {
      // Використовуємо AllOrigins як надійніший CORS-проксі
      const targetUrl = encodeURIComponent(
        "https://index.minfin.com.ua/ua/markets/fuel/",
      );
      const proxyUrl = `https://api.allorigins.win/get?url=${targetUrl}`;

      const response = await axios.get(proxyUrl);
      const htmlString = response.data.contents; // AllOrigins повертає HTML у полі contents

      // Якщо повернуло порожньо або помилку від проксі
      if (!htmlString) throw new Error("Порожня відповідь від проксі");

      // 2. Використовуємо нативний парсер браузера
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, "text/html");

      const parsedData: FuelData[] = [];

      // 3. Знаходимо рядки таблиці за її класом 'line' (згідно з вашим HTML)
      // Беремо тільки рядки всередині tbody
      const rows = doc.querySelectorAll("table.line tbody tr");

      rows.forEach((row) => {
        // Пропускаємо рядки із заголовками (th)
        if (row.querySelector("th")) return;

        const cols = row.querySelectorAll("td");
        if (cols.length >= 3) {
          // Назва палива лежить у першій колонці (там є тег <a>)
          const typeNode = cols[0].querySelector("a");
          const type = typeNode
            ? typeNode.textContent?.trim() || ""
            : cols[0].textContent?.trim() || "";

          // Ціна лежить у третій колонці (там є тег <big>)
          const priceNode = cols[2].querySelector("big");
          const price = priceNode
            ? priceNode.textContent?.trim() || ""
            : cols[2].textContent?.trim() || "";

          if (type && price) {
            parsedData.push({ type, price });
          }
        }
      });

      if (parsedData.length > 0) {
        setFuelData(parsedData);
        // Шукаємо А-95 як дефолтний
        const defaultFuel =
          parsedData.find((f) => f.type.includes("А-95")) || parsedData[0];
        setSelectedFuel(defaultFuel);
      } else {
        throw new Error("Не вдалося знайти ціни на сторінці");
      }
    } catch (e) {
      console.error("Помилка отримання цін:", e);
      setError(true);
      setSelectedFuel({ type: "Помилка", price: "--" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFuelPrices();

    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return fuelData.filter((f) => f.type.toLowerCase().includes(q));
  }, [search, fuelData]);

  return (
    <div className="relative w-full min-w-[140px]" ref={menuRef}>
      <button
        onClick={() => !loading && setIsOpen(!isOpen)}
        disabled={loading}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-sm hover:border-blue-400 transition-all",
          loading && "opacity-70 cursor-wait",
          error && "border-red-200 hover:border-red-400",
        )}
      >
        {error ? (
          <AlertCircle size={14} className="text-red-500" />
        ) : (
          <FuelIcon
            type={selectedFuel.type}
            className={loading ? "animate-pulse" : ""}
          />
        )}

        <div className="flex items-center gap-2 overflow-hidden flex-1">
          <span className="text-xs font-black shrink-0 whitespace-nowrap">
            {selectedFuel.price} {selectedFuel.price !== "--" && "₴"}
          </span>
          <span className="text-[10px] text-slate-400 font-bold uppercase truncate">
            {selectedFuel.type}
          </span>
          <ChevronDown
            size={10}
            className={cn(
              "text-slate-400 shrink-0 transition-transform ml-auto",
              isOpen && "rotate-180",
            )}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="p-3 border-b border-slate-100 dark:border-white/5">
            <input
              placeholder="Пошук пального..."
              autoFocus
              className="w-full bg-slate-50 dark:bg-slate-800 text-[11px] p-2 rounded-lg outline-none border border-transparent focus:border-blue-400/50 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="max-h-64 overflow-y-auto p-1 custom-scrollbar">
            <div className="px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2 bg-slate-50/50 dark:bg-white/5 mb-1">
              ⛽ Середні ціни (грн/л)
            </div>

            {filtered.map((fuel) => (
              <button
                key={fuel.type}
                onClick={() => {
                  setSelectedFuel(fuel);
                  setIsOpen(false);
                  setSearch("");
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 text-[11px] font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors",
                  selectedFuel.type === fuel.type
                    ? "bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    : "text-slate-700 dark:text-slate-300",
                )}
              >
                <div className="flex items-center gap-2">
                  <FuelIcon type={fuel.type} />
                  <span>{fuel.type}</span>
                </div>
                <span className="font-bold">{fuel.price}</span>
              </button>
            ))}

            {filtered.length === 0 && (
              <div className="p-4 text-center text-[10px] text-slate-400 italic">
                Пальне не знайдено
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
