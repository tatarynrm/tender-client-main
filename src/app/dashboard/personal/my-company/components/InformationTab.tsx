"use client";

import React, { useState } from "react";
import {
  Truck,
  Map,
  CheckCircle2,
  Activity,
  Loader2,
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
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <span className="text-sm font-black uppercase tracking-widest text-zinc-400">
          Завантаження даних...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* FLEET SECTION */}
        <div className="lg:col-span-12 space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Truck className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-800 dark:text-zinc-200">
              Автомобільний парк
            </h2>
          </div>

          <div className="overflow-x-auto rounded-[1.5rem] sm:rounded-[2rem] border border-zinc-200/60 dark:border-white/10 bg-white dark:bg-zinc-950/40 shadow-sm custom-scrollbar">
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/30">
                  <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Тип транспорту
                  </th>
                  <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-widest text-zinc-400 w-32">
                    Об'єм (м³)
                  </th>
                  <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-widest text-zinc-400 w-32">
                    Вант-сть (т)
                  </th>
                  <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-widest text-zinc-400 w-32">
                    Кількість
                  </th>
                  <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Коментар
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                {!transport || transport.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-10 text-center">
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                        Дані про автопарк відсутні
                      </span>
                    </td>
                  </tr>
                ) : (
                  transport.map((item, idx) => (
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
                      <td className="px-8 py-5 text-center">
                        <span className="text-sm font-black text-zinc-700 dark:text-zinc-300">
                          {item.objem || "-"}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className="text-sm font-black text-zinc-700 dark:text-zinc-300">
                          {item.vant || "-"}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black text-sm border border-indigo-100/50 dark:border-indigo-500/20">
                          {item.kil}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          {item.comment || "-"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* DIRECTIONS GRID */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Map className="w-5 h-5 text-indigo-600" />
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-800 dark:text-zinc-200">
            Географія перевезень
          </h2>
        </div>

        <div className="p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border border-zinc-200/60 dark:border-white/10 bg-white dark:bg-zinc-950/40 shadow-sm">
          {!directions || directions.length === 0 ? (
            <div className="py-10 text-center">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                Дані про напрямки відсутні
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-8">
              {directions.map((dir, idx) => (
                <div key={idx} className="space-y-5">
                  <div className="flex items-center justify-between group">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-indigo-600 dark:text-indigo-400 transition-transform">
                      {dir.direction_name}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {dir.countries.length === 0 ? (
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest opacity-50">
                        Немає країн
                      </span>
                    ) : (
                      dir.countries.map((country, cIdx) => {
                        const isChecked = country.checked === 1;
                        return (
                          <div
                            key={cIdx}
                            className="flex items-center gap-2.5 group/item"
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
                              {country.country_name}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
