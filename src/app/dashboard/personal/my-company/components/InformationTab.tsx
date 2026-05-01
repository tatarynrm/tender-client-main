"use client";

import React, { useState } from "react";
import {
  Truck,
  Map,
  Globe2,
  CheckCircle2,
  Navigation,
  Activity,
} from "lucide-react";
import { Button } from "@/shared/components/ui";
import { cn } from "@/shared/utils";

const FLEET_DATA = [
  { type: "Тент", count: 5 },
  { type: "Рефрижератор", count: 8 },
  { type: "Зерновоз", count: 3 },
  { type: "Контейнеровоз", count: 2 },
];

const DIRECTIONS = [
  {
    region: "Західна Європа",
    countries: [
      "Франція",
      "Бельгія",
      "Нідерланди",
      "Люксембург",
      "Німеччина",
      "Австрія",
      "Ліхтенштейн",
      "Швейцарія",
    ],
    checked: ["Франція", "Бельгія", "Нідерланди", "Німеччина"],
  },
  {
    region: "Північна Європа",
    countries: [
      "Фінляндія",
      "Швеція",
      "Норвегія",
      "Данія",
      "Велика Британія",
      "Ірландія",
      "Ісландія",
      "Естонія",
    ],
    checked: ["Данія", "Велика Британія"],
  },
  {
    region: "Південна Європа",
    countries: [
      "Італія",
      "Греція",
      "Іспанія",
      "Португалія",
      "Сербія",
      "Андорра",
      "Сан-Марино",
      "Хорватія",
    ],
    checked: ["Італія", "Іспанія", "Сербія", "Хорватія"],
  },
  {
    region: "Східна Європа",
    countries: [
      "Україна",
      "Молдова",
      "Румунія",
      "Болгарія",
      "Угорщина",
      "Чехія",
      "Словаччина",
      "Польща",
    ],
    checked: ["Україна", "Польща", "Чехія", "Словаччина"],
  },
  {
    region: "СНД",
    countries: [
      "Білорусь",
      "Вірменія",
      "Грузія",
      "Казахстан",
      "Киргизстан",
      "Узбекистан",
      "Азербайджан",
    ],
    checked: [],
  },
];

export function InformationTab() {
  const [geoMode, setGeoMode] = useState<"intl" | "local">("intl");

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* FLEET SECTION */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Truck className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-800 dark:text-zinc-200">
              Автомобільний парк
            </h2>
          </div>

          <div className="overflow-x-auto rounded-[1.5rem] sm:rounded-[2rem] border border-zinc-200/60 dark:border-white/10 bg-white dark:bg-zinc-950/40 shadow-sm custom-scrollbar">
            <table className="w-full border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/30">
                  <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Тип транспорту
                  </th>
                  <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-widest text-zinc-400 w-40">
                    Кількість
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                {FLEET_DATA.map((item, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-zinc-50/50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                          <Activity className="w-4 h-4 text-zinc-400" />
                        </div>
                        <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                          {item.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 sm:px-8 py-4 sm:py-5 text-center">
                      <span className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black text-sm border border-indigo-100/50 dark:border-indigo-500/20">
                        {item.count}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* GEOGRAPHY SECTION */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Globe2 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-800 dark:text-zinc-200">
              Географія перевезень
            </h2>
          </div>

          <div className="p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-zinc-200/60 dark:border-white/10 bg-white dark:bg-zinc-950/40 shadow-sm space-y-6">
            <div className="flex p-1.5 rounded-2xl bg-zinc-100 dark:bg-white/5 border border-zinc-200/50 dark:border-white/10">
              <button
                onClick={() => setGeoMode("intl")}
                className={cn(
                  "flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300",
                  geoMode === "intl"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 translate-y-[-1px]"
                    : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300",
                )}
              >
                Міжнародні
              </button>
              <button
                onClick={() => setGeoMode("local")}
                className={cn(
                  "flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300",
                  geoMode === "local"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 translate-y-[-1px]"
                    : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300",
                )}
              >
                Локальні
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DIRECTIONS GRID */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Map className="w-5 h-5 text-indigo-600" />
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-800 dark:text-zinc-200">
            Компанія здійснює перевезення по напрямкам
          </h2>
        </div>

        <div className="p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-zinc-200/60 dark:border-white/10 bg-white dark:bg-zinc-950/40 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8">
            {DIRECTIONS.map((dir, idx) => (
              <div key={idx} className="space-y-5">
                <div className="flex items-center justify-between group">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-indigo-600 dark:text-indigo-400 transition-transform">
                    {dir.region}
                  </h3>
                </div>

                <div className="space-y-3">
                  {dir.countries.map((country, cIdx) => {
                    const isChecked = dir.checked.includes(country);
                    return (
                      <div
                        key={cIdx}
                        className="flex items-center gap-2.5 group/item cursor-pointer"
                      >
                        <div
                          className={cn(
                            "w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-300",
                            isChecked
                              ? "bg-indigo-600 border-indigo-600 shadow-sm shadow-indigo-500/20"
                              : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10 group-hover/item:border-indigo-400",
                          )}
                        >
                          {isChecked && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          )}
                        </div>
                        <span
                          className={cn(
                            "text-[12px] font-medium transition-colors",
                            isChecked
                              ? "text-zinc-900 dark:text-zinc-100 font-bold"
                              : "text-zinc-500 dark:text-zinc-500 group-hover/item:text-zinc-700 dark:group-hover/item:text-zinc-300",
                          )}
                        >
                          {country}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
