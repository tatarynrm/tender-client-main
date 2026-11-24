"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { FilterHint } from "@/shared/components/Inputs/FilterHint";
import {
  CARRIER_LOAD_SEARCH_KEYS,
  CarrierLoadSearch as SearchValues,
} from "../types/carrier-load.type";

export const EMPTY_CARRIER_LOAD_SEARCH: SearchValues = {
  s_crm_load_number: "",
  s_day: "",
  s_manager: "",
  s_from: "",
  s_to: "",
};

interface Props {
  /** Поточні (застосовані) значення з URL */
  value: SearchValues;
  onSearch: (values: SearchValues) => void;
  onReset: () => void;
  loading?: boolean;
}

const inputCls =
  "h-8 rounded-md border border-blue-100 bg-white px-2 text-[12px] text-[#0a2540] outline-none placeholder:text-gray-400 focus:border-[#3B52B4] focus:ring-2 focus:ring-[#3B52B4]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100";

const labelCls =
  "flex items-center gap-1 text-[10px] font-semibold text-[#415A88] dark:text-slate-300";

/**
 * Швидкий пошук на екрані заявок — у тому ж форматі, що й вкладка «Пошук»
 * у «Перевезеннях». Значення застосовуються лише після «Шукати» (або Enter).
 */
export function CarrierLoadSearch({ value, onSearch, onReset, loading }: Props) {
  const [form, setForm] = useState<SearchValues>(value);

  // Синхронізація з URL (назад/вперед у браузері, «Скинути»).
  useEffect(() => setForm(value), [value]);

  const set = (key: keyof SearchValues, v: string) =>
    setForm((f) => ({ ...f, [key]: v }));

  const hasAnyFilter = CARRIER_LOAD_SEARCH_KEYS.some(
    (k) => form[k].trim() !== "",
  );
  const hasApplied = CARRIER_LOAD_SEARCH_KEYS.some(
    (k) => value[k].trim() !== "",
  );

  const submit = () => {
    if (!hasAnyFilter || loading) return;
    const trimmed = { ...form };
    CARRIER_LOAD_SEARCH_KEYS.forEach((k) => (trimmed[k] = trimmed[k].trim()));
    onSearch(trimmed);
  };

  return (
    <div
      className="rounded-xl border border-blue-100 bg-white p-2.5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
      onKeyDown={(e) => {
        if (e.key === "Enter") submit();
      }}
    >
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-5">
        {/* Номер заявки */}
        <div className="flex flex-col gap-0.5">
          <label className={labelCls}>
            Номер заявки
            <FilterHint
              title="Номер заявки"
              examples={["3611", "1591"]}
              note="Тільки цифри."
            />
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={form.s_crm_load_number}
            placeholder="напр. 3611"
            onChange={(e) =>
              set("s_crm_load_number", e.target.value.replace(/\D/g, ""))
            }
            className={inputCls}
          />
        </div>

        {/* Кількість днів */}
        <div className="flex flex-col gap-0.5">
          <label className={labelCls}>
            Період, днів
            <FilterHint
              title="Період пошуку"
              examples={["1", "3", "7", "30"]}
              note="Кількість днів від сьогодні."
            />
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={form.s_day}
            placeholder="напр. 7"
            onChange={(e) => set("s_day", e.target.value.replace(/\D/g, ""))}
            className={inputCls}
          />
        </div>

        {/* Менеджер */}
        <div className="flex flex-col gap-0.5">
          <label className={labelCls}>
            Менеджер ICT
            <FilterHint
              title="Прізвище менеджера"
              examples={["Малиновська", "Малин"]}
              note="Прізвище — можна частково."
            />
          </label>
          <input
            type="text"
            value={form.s_manager}
            placeholder="прізвище менеджера"
            onChange={(e) => set("s_manager", e.target.value)}
            className={inputCls}
          />
        </div>

        {/* Напрямки */}
        <div className="flex flex-col gap-0.5">
          <label className={labelCls}>
            Напрямок — звідки
            <FilterHint
              title="Як вводити напрямок"
              examples={["UA", "DE", "Львів", "Львівська", "львівсь"]}
              note="Країна, місто чи область — можна частково."
            />
          </label>
          <input
            type="text"
            value={form.s_from}
            placeholder="місто або країна"
            onChange={(e) => set("s_from", e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="flex flex-col gap-0.5">
          <label className={labelCls}>
            Напрямок — куди
            <FilterHint
              title="Як вводити напрямок"
              examples={["UA", "DE", "Львів", "Львівська", "львівсь"]}
              note="Країна, місто чи область — можна частково."
            />
          </label>
          <input
            type="text"
            value={form.s_to}
            placeholder="місто або країна"
            onChange={(e) => set("s_to", e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          onClick={submit}
          disabled={!hasAnyFilter || loading}
          loading={loading}
          className="h-8 bg-[#3B52B4] px-3 text-[12px] text-white hover:bg-[#2f429a]"
        >
          <Search className="mr-1 h-3.5 w-3.5" />
          Шукати
        </Button>
        {(hasAnyFilter || hasApplied) && (
          <button
            type="button"
            onClick={() => {
              setForm({ ...EMPTY_CARRIER_LOAD_SEARCH });
              onReset();
            }}
            className="inline-flex items-center gap-1 text-[13px] font-medium text-[#415A88] hover:text-[#3B52B4]"
          >
            <X className="h-3.5 w-3.5" />
            Скинути
          </button>
        )}
        {!hasAnyFilter && (
          <span className="text-[11px] text-gray-400">
            Заповніть хоча б одне поле для пошуку.
          </span>
        )}
      </div>
    </div>
  );
}
