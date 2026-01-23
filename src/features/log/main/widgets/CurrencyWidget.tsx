"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  DollarSign,
  Euro,
  ChevronDown,
  Calendar as CalendarIcon,
  List,
  Search,
} from "lucide-react";
import { DayPicker } from "react-day-picker";
import { uk } from "date-fns/locale";
import { format } from "date-fns";
import { cn } from "@/shared/utils";
import "react-day-picker/dist/style.css";

interface Rate {
  cc: string;
  txt: string;
  rate: number;
}

export const CurrencyWidget = () => {
  const [allRates, setAllRates] = useState<Rate[]>([]);
  const [rates, setRates] = useState({ usd: "..", eur: "..", gbp: ".." });
  const [date, setDate] = useState<Date>(new Date());
  const [isRateLoading, setIsRateLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showFullList, setShowFullList] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchRates = async () => {
      setIsRateLoading(true);
      try {
        const dateParam = format(date, "yyyyMMdd");
        const res = await fetch(
          `https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json&date=${dateParam}`,
        );
        const data: Rate[] = await res.json();

        // Сортуємо: USD, EUR, GBP завжди перші, решта за алфавітом
        const priority = ["USD", "EUR", "GBP"];
        const sorted = [...data].sort((a, b) => {
          const indexA = priority.indexOf(a.cc);
          const indexB = priority.indexOf(b.cc);
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          return a.txt.localeCompare(b.txt, "uk");
        });

        setAllRates(sorted);

        const find = (cc: string) =>
          data.find((i) => i.cc === cc)?.rate.toFixed(2) || "..";

        setRates({ usd: find("USD"), eur: find("EUR"), gbp: find("GBP") });
      } catch (e) {
        console.error(e);
      } finally {
        setIsRateLoading(false);
      }
    };
    fetchRates();
  }, [date]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setShowFullList(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Головна кнопка-віджет */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-sm divide-x divide-slate-100 dark:divide-white/5 overflow-hidden transition-all hover:border-blue-400 active:scale-[0.98]",
          isRateLoading && "opacity-70",
        )}
      >
        <div className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
          <DollarSign size={13} className="text-emerald-500" />
          <span className="text-xs font-black tabular-nums">{rates.usd}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
          <Euro size={13} className="text-blue-500" />
          <span className="text-xs font-black tabular-nums">{rates.eur}</span>
        </div>
        <div className="px-2 py-1.5 flex items-center bg-slate-50/50 dark:bg-white/[0.02]">
          <ChevronDown
            size={10}
            className={cn(
              "text-slate-400 transition-transform duration-300",
              isOpen && "rotate-180",
            )}
          />
        </div>
      </button>
      {/* Попап */}
      {isOpen && (
        <div
          className={cn(
            // Основне позиціонування: фіксуємо правий край, обмежуємо максимальну ширину екраном
            "absolute top-full mt-2 z-50 left-0 ",
            "animate-in fade-in zoom-in-95 slide-in-from-top-2",
            "bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[24px] shadow-2xl",
            "flex flex-col overflow-hidden", // Мобілка спочатку (стовпчиком)

            // Обмеження ширини для мобілок (важливо!)
            "w-[92vw] max-w-[calc(100vw-1.5rem)]",

            // Планшети та десктопи (md = 768px)
            "md:flex-row md:w-auto",
            showFullList ? "md:max-w-[500px]" : "md:max-w-none",
          )}
        >
          {/* Ліва частина: Календар */}
          <div
            className={cn(
              "p-4 shrink-0 w-full md:w-auto flex flex-col items-center",
              showFullList &&
                "border-b md:border-b-0 md:border-r border-slate-100 dark:border-white/5",
            )}
          >
            <div className="flex items-center justify-between mb-4 w-full px-1">
              <div className="flex items-center gap-2">
                <CalendarIcon size={14} className="text-blue-500" />
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                  Архів курсів
                </span>
              </div>
            </div>

            <div className="bg-slate-50/50 dark:bg-white/[0.02] rounded-2xl p-1 border border-slate-100 dark:border-white/5 w-fit">
              <DayPicker
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                locale={uk}
                disabled={{ after: new Date() }}
                className="m-0 scale-90 sm:scale-100" // Трішки зменшуємо на зовсім малих екранах
                styles={{
                  caption: {
                    color: "#64748b",
                    fontSize: "12px",
                    fontWeight: "800",
                    textTransform: "uppercase",
                  },
                  head_cell: {
                    color: "#94a3b8",
                    fontWeight: "600",
                    fontSize: "10px",
                  },
                  day: { fontSize: "11px", borderRadius: "8px" },
                  nav_button: { color: "#3b82f6" },
                }}
                classNames={{
                  day_selected: "bg-blue-500 text-white hover:bg-blue-600",
                  day_today: "text-blue-600 font-black ring-1 ring-blue-500/30",
                }}
              />
            </div>

            <button
              onClick={() => setShowFullList(!showFullList)}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-blue-500/20 active:scale-95"
            >
              <List size={14} />
              {showFullList ? "Приховати список" : "Усі курси валют"}
            </button>
          </div>

          {/* Права частина: Повний список валют */}
          {showFullList && (
            <div className="w-full md:w-64 flex flex-col bg-slate-50/30 dark:bg-black/10 h-full">
              <div className="p-4 border-b border-slate-100 dark:border-white/5 bg-white/50 dark:bg-white/[0.02]">
                <span className="text-[10px] font-black uppercase text-blue-500 tracking-tighter">
                  НБУ: {format(date, "dd.MM.yyyy")}
                </span>
              </div>

              {/* Додаємо фіксовану висоту для скролу на мобілці */}
              <div className="flex-1 overflow-y-auto min-h-[200px] max-h-[250px] md:max-h-[380px] p-2 custom-scrollbar">
                {allRates.map((item) => (
                  <div
                    key={item.cc}
                    className={cn(
                      "flex items-center justify-between p-2 rounded-lg mb-1 transition-colors",
                      ["USD", "EUR", "GBP"].includes(item.cc)
                        ? "bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20"
                        : "hover:bg-white dark:hover:bg-white/5",
                    )}
                  >
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-700 dark:text-slate-200">
                        {item.cc}
                      </span>
                      <span className="text-[8px] text-slate-400 font-bold truncate max-w-[140px] md:max-w-[100px]">
                        {item.txt}
                      </span>
                    </div>
                    <span className="text-[11px] font-black tabular-nums text-blue-600 dark:text-blue-400">
                      {item.rate.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
