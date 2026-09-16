"use client";

import React from "react";

import { Dropdowns, LoadApiItem } from "../../types/load.type";
import { CargoRow } from "./CargoRow";
import { CARGO_COLUMNS } from "./cargoColumns";

interface CargoListProps {
  loads: LoadApiItem[];
  filters?: Dropdowns;
}

/**
 * Вигляд «список полосок» для заявок — той самий формат, що в тендерах:
 * липкий рядок заголовків колонок і по одній полосці на заявку.
 * Від 1000px — полоски, нижче — картка в стовпчик (планшет/телефон).
 */
export function CargoList({ loads, filters }: CargoListProps) {
  return (
    <div className="w-full">
      {/* Заголовки колонок */}
      <div className="sticky top-[52px] z-[9] hidden min-[1000px]:flex w-full min-h-[36px] mb-2 font-black text-zinc-700 dark:text-zinc-200 divide-x divide-zinc-200/80 dark:divide-zinc-800 bg-zinc-50/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800/60 rounded-xl shadow-[0_4px_12px_-4px_rgba(0,0,0,0.1)] text-[10px] uppercase tracking-wider">
        {CARGO_COLUMNS.map((col) => (
          <div
            key={col.label}
            className={`${col.className} flex items-center justify-center py-2 px-1 text-center`}
          >
            {col.label}
          </div>
        ))}
      </div>

      <div className="grid gap-2.5 w-full">
        {loads.map((item) => (
          <CargoRow key={item.id} load={item} filters={filters} />
        ))}
      </div>
    </div>
  );
}
