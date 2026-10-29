"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";

import { tenderManagerService } from "@/features/log/services/tender.manager.service";
import { ITender } from "@/features/log/types/tender.type";
import { IApiResponse } from "@/shared/api/api.type";
import { TenderCardManagers } from "./components/TenderCardManager";
import { Pagination } from "@/shared/components/Pagination/Pagination";
import { ItemsPerPage } from "@/shared/components/Pagination/ItemsPerPage";
import { FilterHint } from "@/shared/components/Inputs/FilterHint";
import { Button } from "@/shared/components/ui/button";
import Loader from "@/shared/components/Loaders/MainLoader";

// Ключі пошуку — з префіксом s_. Статус НЕ передаємо (шукаємо по всіх).
// Виклик той самий, що й на інших вкладках: /tender/list → процедура
// tender_list_ict (filter: [{ type:'query', key, value }]). Поки реально
// працює s_days; решту ключів процедура підхопить згодом.
const SEARCH_KEYS = [
  "s_day", // скільки днів від сьогодні назад шукати
  "s_tender_number", // номер тендеру
  "s_client", // замовник (кілька — через кому)
  "s_manager", // менеджер (кілька — через кому)
  "s_from", // звідки
  "s_to", // куди
] as const;

type SearchKey = (typeof SEARCH_KEYS)[number];
type SearchForm = Record<SearchKey, string>;

// Днів від сьогодні за замовчуванням — 30. Вводиться руками.
const DEFAULT_DAYS = "30";

const makeDefaultForm = (): SearchForm => ({
  s_day: DEFAULT_DAYS,
  s_tender_number: "",
  s_client: "",
  s_manager: "",
  s_from: "",
  s_to: "",
});

const inputCls =
  "h-8 rounded-md border border-zinc-200 dark:border-white/10 bg-white dark:bg-slate-900 px-2 text-[12px] text-zinc-900 dark:text-zinc-100 outline-none placeholder:text-zinc-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";
const labelCls =
  "flex items-center gap-1 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL — джерело правди для запиту (лінк можна копіювати/ділитися).
  const urlFilters = useMemo(() => {
    const f: Partial<SearchForm> = {};
    SEARCH_KEYS.forEach((k) => {
      const v = searchParams.get(k);
      if (v) f[k] = v;
    });
    return f;
  }, [searchParams]);

  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);

  // Активні фільтри: те, що в URL, або дефолт (s_days) — щоб сторінка одразу
  // показувала результат, як інші вкладки.
  const activeFilters = useMemo<Record<string, string>>(
    () =>
      Object.keys(urlFilters).length
        ? (urlFilters as Record<string, string>)
        : { s_day: DEFAULT_DAYS },
    [urlFilters],
  );

  // Локальний стан форми: дефолти + те, що вже є в URL.
  const [form, setForm] = useState<SearchForm>({
    ...makeDefaultForm(),
    ...urlFilters,
  });
  useEffect(() => {
    setForm({ ...makeDefaultForm(), ...urlFilters });
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Статус НЕ додаємо. Тільки фільтри + пагінація.
  const params = useMemo(() => {
    const p = new URLSearchParams();
    Object.entries(activeFilters).forEach(([k, v]) => v && p.set(k, v));
    p.set("page", String(page));
    p.set("limit", String(limit));
    return p;
  }, [activeFilters, page, limit]);

  const { data, isFetching } = useQuery<IApiResponse<ITender[]>>({
    queryKey: ["tenders", params.toString()],
    queryFn: () => tenderManagerService.getTenders(params),
    staleTime: 1000 * 60,
  });

  const tenders = data?.content ?? [];
  const pagination = data?.props?.pagination;

  const setField = (key: SearchKey, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const runSearch = () => {
    const p = new URLSearchParams();
    SEARCH_KEYS.forEach((k) => {
      const v = (form[k] ?? "").trim();
      if (v) p.set(k, v);
    });
    p.set("page", "1");
    if (searchParams.get("limit")) p.set("limit", String(limit));
    router.push(`?${p.toString()}`, { scroll: false });
  };

  const resetSearch = () => {
    setForm(makeDefaultForm());
    router.push("?", { scroll: false });
  };

  const changePage = (np: number) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set("page", String(np));
    router.push(`?${p.toString()}`, { scroll: false });
  };

  const changeLimit = (newLimit: number) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set("limit", String(newLimit));
    p.set("page", "1");
    router.push(`?${p.toString()}`, { scroll: false });
  };

  return (
    <div className="w-full space-y-4 pb-40">
      {/* Форма пошуку */}
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm p-3"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !isFetching) runSearch();
        }}
      >
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
          {/* Днів від сьогодні */}
          <div className="flex flex-col gap-0.5">
            <label className={labelCls}>
              Днів від сьогодні
              <FilterHint
                title="Днів від сьогодні"
                examples={["20", "100", "365"]}
                note="Скільки днів назад шукати. Тільки цифри."
              />
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={form.s_day}
              placeholder="напр. 100"
              onChange={(e) =>
                setField("s_day", e.target.value.replace(/\D/g, ""))
              }
              className={inputCls}
            />
          </div>

          {/* Номер тендеру */}
          <div className="flex flex-col gap-0.5">
            <label className={labelCls}>
              Номер тендеру
              <FilterHint
                title="Номер тендеру"
                examples={["1024", "A-233"]}
                note="Текстове значення."
              />
            </label>
            <input
              type="text"
              value={form.s_tender_number}
              placeholder="напр. 1024"
              onChange={(e) => setField("s_tender_number", e.target.value)}
              className={inputCls}
            />
          </div>

          {/* Замовник */}
          <div className="flex flex-col gap-0.5">
            <label className={labelCls}>
              Замовник
              <FilterHint
                title="Замовник"
                examples={["ТОВ Ромашка", "Ромашка, Соняшник"]}
                note="Декілька — через кому."
              />
            </label>
            <input
              type="text"
              value={form.s_client}
              placeholder="назва; кілька — через кому"
              onChange={(e) => setField("s_client", e.target.value)}
              className={inputCls}
            />
          </div>

          {/* Менеджер */}
          <div className="flex flex-col gap-0.5">
            <label className={labelCls}>
              Менеджер
              <FilterHint
                title="Менеджер"
                examples={["Іван", "Іван, Петро"]}
                note="Декілька — через кому."
              />
            </label>
            <input
              type="text"
              value={form.s_manager}
              placeholder="ПІБ; кілька — через кому"
              onChange={(e) => setField("s_manager", e.target.value)}
              className={inputCls}
            />
          </div>

          {/* Звідки */}
          <div className="flex flex-col gap-0.5">
            <label className={labelCls}>
              Звідки
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
              onChange={(e) => setField("s_from", e.target.value)}
              className={inputCls}
            />
          </div>

          {/* Куди */}
          <div className="flex flex-col gap-0.5">
            <label className={labelCls}>
              Куди
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
              onChange={(e) => setField("s_to", e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-3">
          <Button
            size="sm"
            onClick={runSearch}
            disabled={isFetching}
            loading={isFetching}
            className="h-8 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[12px]"
          >
            <Search className="w-3.5 h-3.5 mr-1" />
            Шукати
          </Button>

          <button
            type="button"
            onClick={resetSearch}
            className="inline-flex items-center gap-1 text-[13px] font-medium text-zinc-500 hover:text-indigo-600"
          >
            <X className="w-3.5 h-3.5" />
            Скинути
          </button>

          <div className="ml-auto flex items-center gap-1.5 bg-background/60 p-1 rounded-xl border border-border/50 shadow-sm">
            <ItemsPerPage
              options={[10, 20, 50, 100]}
              defaultValue={limit}
              onChange={changeLimit}
            />
          </div>
        </div>
      </div>

      {/* Результати */}
      {isFetching ? (
        <Loader />
      ) : tenders.length === 0 ? (
        <div className="flex justify-center py-10 text-zinc-500 dark:text-zinc-400 font-medium text-center">
          За вашим запитом нічого не знайдено
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 w-full pt-2">
            {tenders.map((item) => (
              <TenderCardManagers
                key={item.id}
                cargo={item}
                onOpenDetails={() => router.push(`/log/tender/${item.id}`)}
                showStatus
              />
            ))}
          </div>

          {pagination && pagination.page_count > 1 && (
            <Pagination
              page={page}
              pageCount={pagination.page_count}
              onChange={changePage}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default function ManagersTenderSearchPage() {
  return (
    <Suspense fallback={<Loader />}>
      <SearchContent />
    </Suspense>
  );
}
