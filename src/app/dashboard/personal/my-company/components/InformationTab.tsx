"use client";

import React, { useState } from "react";
import {
  Truck,
  Globe2,
  Move,
  PieChart,
  CheckCircle2,
  Loader2,
  Globe,
} from "lucide-react";
import { cn } from "@/shared/utils";

export interface TransportItem {
  type: string;
  objem: number;
  vant: number;
  kil: number;
  comment: string | null;
}

export interface Country {
  kod: number;
  country_name: string;
  checked: number;
}

export interface Direction {
  kod: number;
  direction_name: string;
  countries: Country[];
}

interface InformationTabProps {
  transport?: TransportItem[];
  directions?: Direction[];
  isLoading?: boolean;
}

export function InformationTab({ transport, directions, isLoading }: InformationTabProps) {
  const [activeGeo, setActiveGeo] = useState<"international" | "local">("international");

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-[#4863D4] animate-spin" />
        <span className="text-sm font-bold uppercase tracking-wide text-slate-500">
          Завантаження даних...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500 pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* FLEET SECTION */}
        <div className="lg:col-span-3 bg-white dark:bg-zinc-950 border border-[#D0DDF0] dark:border-zinc-800 rounded-2xl p-5 flex flex-col shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Truck className="w-5 h-5 text-slate-800 dark:text-zinc-200" />
            <h2 className="text-[13px] font-bold text-slate-800 dark:text-zinc-100 uppercase tracking-wide">
              Автомобільний парк
            </h2>
          </div>
          <div className="border border-[#D0DDF0] dark:border-zinc-800 rounded-[10px] overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#F8FAFF] dark:bg-zinc-900/50">
                <tr>
                  <th className="py-3 px-4 text-left text-[14px] font-semibold text-slate-800 dark:text-zinc-200 border-r border-[#D0DDF0] dark:border-zinc-800">
                    Тип транспорту
                  </th>
                  <th className="py-3 px-4 text-center text-[14px] font-semibold text-slate-800 dark:text-zinc-200">
                    Кількість
                  </th>
                </tr>
              </thead>
              <tbody>
                {!transport || transport.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="py-6 text-center text-slate-500 dark:text-zinc-400 text-sm">
                      Дані відсутні
                    </td>
                  </tr>
                ) : (
                  transport.map((t, idx) => (
                    <tr key={idx} className="border-t border-[#D0DDF0] dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors">
                      <td className="py-3 px-4 text-[14px] font-medium text-[#4863D4] dark:text-blue-400 border-r border-[#D0DDF0] dark:border-zinc-800">
                        {t.type}
                      </td>
                      <td className="py-3 px-4 text-center text-[14px] font-medium text-[#4863D4] dark:text-blue-400">
                        {t.kil}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* GEOGRAPHY SECTION */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-950 border border-[#D0DDF0] dark:border-zinc-800 rounded-2xl p-5 flex flex-col shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Globe2 className="w-5 h-5 text-slate-800 dark:text-zinc-200" />
            <h2 className="text-[13px] font-bold text-slate-800 dark:text-zinc-100 uppercase tracking-wide">
              Географія перевезень
            </h2>
          </div>
          <div className="flex bg-white dark:bg-zinc-900 border border-[#D0DDF0] dark:border-zinc-700 rounded-[10px] overflow-hidden">
            <button
              onClick={() => setActiveGeo("international")}
              className={cn(
                "flex-1 py-3.5 text-[13px] font-bold uppercase tracking-wide transition-colors",
                activeGeo === "international"
                  ? "bg-[#4863D4] text-white"
                  : "bg-transparent text-[#4863D4] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-zinc-800"
              )}
            >
              Міжнародні
            </button>
            <button
              onClick={() => setActiveGeo("local")}
              className={cn(
                "flex-1 py-3.5 text-[13px] font-bold uppercase tracking-wide transition-colors",
                activeGeo === "local"
                  ? "bg-[#4863D4] text-white"
                  : "bg-transparent text-[#4863D4] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-zinc-800"
              )}
            >
              Локальні
            </button>
          </div>
        </div>
      </div>

      {/* DIRECTIONS SECTION */}
      <div className="bg-white dark:bg-zinc-950 border border-[#D0DDF0] dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Move className="w-5 h-5 text-slate-800 dark:text-zinc-200" />
          <h2 className="text-[13px] font-bold text-slate-800 dark:text-zinc-100 uppercase tracking-wide">
            Компанія здійснює перевезення по напрямках
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {!directions || directions.length === 0 ? (
            <div className="col-span-full py-10 text-center text-slate-500 dark:text-zinc-400 text-sm">
              Дані про напрямки відсутні
            </div>
          ) : (
            directions
              .filter((dir) => !dir.direction_name.toLowerCase().includes("азія"))
              .sort((a, b) => {
                const orderMap: Record<string, number> = {
                  "Західна Європа": 1,
                  "Північна Європа": 2,
                  "Південна Європа": 3,
                  "Східна Європа": 4,
                  "СНД": 5,
                };
                const orderA = orderMap[a.direction_name] || 99;
                const orderB = orderMap[b.direction_name] || 99;
                return orderA - orderB;
              })
              .map((dir, i) => (
              <div
                key={i}
                className="border border-[#D0DDF0] dark:border-zinc-800 rounded-xl p-4 flex flex-col bg-white dark:bg-zinc-900/50"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="w-5 h-5 text-slate-900 dark:text-zinc-100" />
                  <h3 className="text-[14px] font-bold text-slate-900 dark:text-zinc-100">
                    {dir.direction_name}
                  </h3>
                </div>
                <div className="flex flex-col gap-3">
                  {dir.countries.map((c, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      {c.checked ? (
                        <CheckCircle2 className="w-[18px] h-[18px] text-[#4863D4] fill-[#4863D4] stroke-white shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-[18px] h-[18px] text-slate-300 dark:text-zinc-600 stroke-[1.5] shrink-0" />
                      )}
                      <span
                        className={cn(
                          "text-[14px] truncate",
                          c.checked
                            ? "text-[#4863D4] dark:text-blue-400 font-medium"
                            : "text-slate-500 dark:text-zinc-400"
                        )}
                      >
                        {c.country_name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
