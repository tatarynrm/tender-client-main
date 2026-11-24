"use client";

import { useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { PackageSearch } from "lucide-react";

import Loader from "@/shared/components/Loaders/MainLoader";
import { ErrorState } from "@/shared/components/Loaders/ErrorState";
import { ItemsPerPage } from "@/shared/components/Pagination/ItemsPerPage";
import { Pagination } from "@/shared/components/Pagination/Pagination";
import { useUrlFilters } from "@/shared/hooks/useUrlFilter";
import { QuickFilterBtn } from "@/features/log/load/QuickFilterBtn";

import { useCarrierLoads } from "./hooks/useCarrierLoads";
import { CarrierLoadCard } from "./components/CarrierLoadCard";
import {
  CarrierLoadSearch as CarrierLoadSearchPanel,
  EMPTY_CARRIER_LOAD_SEARCH,
} from "./components/CarrierLoadSearch";
import {
  CARRIER_LOAD_SEARCH_KEYS,
  CarrierLoadListParams,
  CarrierLoadSearch as CarrierLoadSearchValues,
} from "./types/carrier-load.type";

const TRANSIT_TABS = [
  { id: "M", label: "Міжнародні" },
  { id: "E", label: "Експорт" },
  { id: "I", label: "Імпорт" },
  { id: "T", label: "Транзитні" },
  { id: "R", label: "Локальні" },
];

export default function CarrierLoadsPage() {
  const searchParams = useSearchParams();
  const { updateUrl } = useUrlFilters();

  // Застосовані значення швидкого пошуку — живуть в URL, як і решта фільтрів.
  const search = useMemo<CarrierLoadSearchValues>(() => {
    const values = { ...EMPTY_CARRIER_LOAD_SEARCH };
    CARRIER_LOAD_SEARCH_KEYS.forEach((k) => {
      values[k] = searchParams.get(k) || "";
    });
    return values;
  }, [searchParams]);

  const params = useMemo<CarrierLoadListParams>(
    () => ({
      page: Number(searchParams.get("page") || 1),
      limit: Number(searchParams.get("limit") || 10),
      transit: searchParams.get("transit") || undefined,
      ...search,
    }),
    [searchParams, search],
  );

  const { data, isLoading, isFetching, error } = useCarrierLoads(params);

  const loads = data?.content ?? [];
  const pagination = data?.props?.pagination;
  const hasSearch = CARRIER_LOAD_SEARCH_KEYS.some((k) => search[k] !== "");

  const setTransit = useCallback(
    (transit?: string) => updateUrl({ ...params, transit, page: 1 }),
    [params, updateUrl],
  );

  const applySearch = useCallback(
    (values: CarrierLoadSearchValues) =>
      updateUrl({ ...params, ...values, page: 1 }),
    [params, updateUrl],
  );

  const resetSearch = useCallback(
    () => updateUrl({ ...params, ...EMPTY_CARRIER_LOAD_SEARCH, page: 1 }),
    [params, updateUrl],
  );

  if (isLoading) return <Loader />;
  if (error) return <ErrorState />;

  return (
    <div className="space-y-4 pb-20">
      {/* ── Заголовок і фільтри ─────────────────────────────────────────── */}
      <div className="sticky top-[-20px] z-10 -mx-4 border-b border-border/60 px-4 pt-4 pb-3 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col">
            <h1 className="text-lg font-black text-zinc-800 dark:text-white">
              Екран заявок
            </h1>
            <span className="text-xs text-muted-foreground">
              Активні заявки ICT на перевезення
              {pagination?.rows_all !== undefined &&
                ` · знайдено ${pagination.rows_all}`}
              {isFetching && " · оновлення…"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-0.5 rounded-2xl border border-border/40 bg-muted/40 p-1 shadow-sm">
            <QuickFilterBtn
              label="Усі"
              isActive={!params.transit}
              onClick={() => setTransit(undefined)}
            />
            <div className="mx-0.5 h-4 w-px bg-border/50" />
            {TRANSIT_TABS.map((tab) => (
              <QuickFilterBtn
                key={tab.id}
                label={tab.label}
                isActive={params.transit === tab.id}
                onClick={() =>
                  setTransit(params.transit === tab.id ? undefined : tab.id)
                }
              />
            ))}
          </div>

          <div className="flex items-center rounded-xl border border-border/50 bg-background/60 p-1 shadow-sm">
            <ItemsPerPage
              options={[10, 20, 50, 100]}
              defaultValue={params.limit}
              onChange={(limit) => updateUrl({ ...params, limit, page: 1 })}
            />
          </div>
        </div>
      </div>

      {/* ── Швидкий пошук ───────────────────────────────────────────────── */}
      <CarrierLoadSearchPanel
        value={search}
        onSearch={applySearch}
        onReset={resetSearch}
        loading={isFetching}
      />

      {/* ── Список ──────────────────────────────────────────────────────── */}
      {loads.length > 0 ? (
        <>
          <div className="flex flex-col gap-4">
            {loads.map((load) => (
              <CarrierLoadCard key={load.id} load={load} />
            ))}
          </div>

          {pagination && pagination.page_count > 1 && (
            <Pagination
              page={params.page || 1}
              pageCount={pagination.page_count}
              onChange={(page) => updateUrl({ ...params, page })}
            />
          )}
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-zinc-300 bg-white/50 py-16 text-center dark:border-zinc-700 dark:bg-slate-800/50">
          <PackageSearch className="h-10 w-10 text-zinc-400" />
          <span className="font-medium text-zinc-500 dark:text-zinc-400">
            Актуальних заявок не знайдено
          </span>
          {(params.transit || hasSearch) && (
            <button
              type="button"
              onClick={() =>
                updateUrl({
                  page: 1,
                  limit: params.limit,
                })
              }
              className="text-sm font-semibold text-blue-600 hover:underline"
            >
              Показати всі заявки
            </button>
          )}
        </div>
      )}
    </div>
  );
}
