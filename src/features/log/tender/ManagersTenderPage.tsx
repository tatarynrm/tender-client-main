"use client";

import React, { useMemo, useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronUp, Settings2 } from "lucide-react";

import { useFilters } from "@/shared/hooks/useFilters";
import { useVisibilityControl } from "@/shared/hooks/useVisibilityControl";
import { useUrlFilters } from "@/shared/hooks/useUrlFilter";
import { ITender } from "../types/tender.type";
import { useTenderListManagers } from "../hooks/useTenderManagersList";
import { useTenderManagersFormData } from "../hooks/useTenderManagersFormData";

import { ErrorState } from "@/shared/components/Loaders/ErrorState";
import { Button } from "@/shared/components/ui/button";
import Loader from "@/shared/components/Loaders/MainLoader";
import { AppButton } from "@/shared/components/Buttons/AppButton";

import { TenderFiltersSheet } from "./components/TenderFilters";
import { ItemsPerPage } from "@/shared/components/Pagination/ItemsPerPage";
import { ActiveFilters } from "./components/ActiveFilters";
import { EmptyTenders } from "./components/EmptyTenders";
import { Pagination } from "@/shared/components/Pagination/Pagination";
import { TenderCardManagers } from "./components/TenderCardManager";
import { QuickFilterBtn } from "../../log/load/QuickFilterBtn";

interface Props {
  status?: string;
}

const LIMIT_STORAGE_KEY = "tender_list_limit";
const PERSIST_BASE_KEY = "tender_managers_filters_cache_";

export default function ManagersTenderPage({ status }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updateUrl, removeFilter, resetFilters } = useUrlFilters();
  const { tenderFilters } = useTenderManagersFormData();

  const { isVisible, toggle } = useVisibilityControl("tender_list");

  // 1. Отримуємо параметри з URL (логіка як у LoadListComponent)
  const currentParams = useMemo(() => {
    const getInitialLimit = () => {
      const urlLimit = searchParams.get("limit");
      if (urlLimit) return Number(urlLimit);
      if (typeof window !== "undefined") {
        const storedLimit = localStorage.getItem(LIMIT_STORAGE_KEY);
        if (storedLimit) return Number(storedLimit);
      }
      return 10;
    };

    const params: any = {
      page: Number(searchParams.get("page") || 1),
      limit: getInitialLimit(),
    };

    const filterKeys = [
      "country_from",
      "country_to",
      "region_from",
      "region_to",
      "city_from",
      "city_to",
      "trailer_type",
      "load_type",
      "tender_type",
      "manager",
      "company",
      "status",
      "export",
      "import",
      "regional",
      "transit",
      "international",
      "my",
      "participate",
    ];

    filterKeys.forEach((key) => {
      const val = searchParams.get(key);
      if (val) params[key] = val;
    });

    return params;
  }, [searchParams]);

  // 2. Формуємо фільтри для запиту
  const queryFilters = useMemo(
    () => ({
      ...currentParams,
      status,
    }),
    [currentParams, status],
  );

  const { tenders, pagination, add_data, isLoading, error } =
    useTenderListManagers(queryFilters);

  // 3. Управління станом форми
  const { filters, setFilters, reset } = useFilters(currentParams);

  // 4. Ефект для синхронізації фільтрів у SessionStorage (Кешування)
  useEffect(() => {
    const persistKey = PERSIST_BASE_KEY + (status || "all");
    if (searchParams.toString()) {
      sessionStorage.setItem(persistKey, searchParams.toString());
    } else {
      const saved = sessionStorage.getItem(persistKey);
      if (saved) {
        const params = Object.fromEntries(new URLSearchParams(saved));
        // Видаляємо статус із кешу, щоб він не перезаписував статус вкладки
        delete params.status;
        delete params.ids_status;
        updateUrl(params);
      }
    }
  }, [searchParams, updateUrl, status]);

  // 5. Обробники
  const handleRemoveFilter = useCallback(
    (key: string, valueToRemove: string) => {
      removeFilter(key, valueToRemove, currentParams);
    },
    [removeFilter, currentParams],
  );

  const toggleParam = useCallback(
    (key: string, value: string) => {
      const newFilters = { ...queryFilters };
      if (String((newFilters as any)[key]) === String(value)) {
        delete (newFilters as any)[key];
      } else {
        (newFilters as any)[key] = value;
      }
      updateUrl(newFilters);
    },
    [queryFilters, updateUrl],
  );

  const toggleDirection = useCallback(
    (key: string) => {
      const newFilters = { ...queryFilters };
      const isAlreadyActive = (newFilters as any)[key] === "true";

      ["export", "import", "regional", "transit", "international"].forEach(
        (k) => {
          delete (newFilters as any)[k];
        },
      );

      if (!isAlreadyActive) {
        (newFilters as any)[key] = "true";
      }

      updateUrl(newFilters);
    },
    [queryFilters, updateUrl],
  );

  const directionButtons = useMemo(
    () => [
      { id: "export", label: "Екс", countKey: "exp" },
      { id: "import", label: "Імп", countKey: "imp" },
      { id: "regional", label: "Локал", countKey: "reg" },
      { id: "transit", label: "Транзит", countKey: "tr" },
      { id: "international", label: "Міжн", countKey: "mn" },
    ],
    [],
  );

  const handleReset = useCallback(() => {
    const persistKey = PERSIST_BASE_KEY + (status || "all");
    reset();
    resetFilters();
    sessionStorage.removeItem(persistKey);
    updateUrl({ page: 1 });
  }, [reset, resetFilters, updateUrl, status]);

  if (error) return <ErrorState />;
  if (isLoading) return <Loader />;

  return (
    <div className="p-0 space-y-4 pb-40">

      {/* ── Filter Controls (Not Sticky) ─────────────────────────────────────────────────── */}
      <div className="pt-4 pb-3 -mx-4 px-4 border-b border-border/60 transition-all">
        <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4">
            {/* ── Left: Filter sheet ──────────────────────────────────────── */}
            <div className="flex items-center gap-4">
              <TenderFiltersSheet
                filters={filters}
                setFilters={setFilters}
                apply={() => updateUrl({ ...filters, page: 1 })}
                reset={handleReset}
                dropdowns={tenderFilters}
              />

              {/* ── Left: Manager Participation Block ────────────────────── */}
              <div className="flex items-center p-1 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 shadow-sm gap-0.5">
                <QuickFilterBtn
                  label="Мої"
                  isActive={currentParams.my === "true"}
                  onClick={() => toggleParam("my", "true")}
                />

                <QuickFilterBtn
                  label="Беру участь"
                  isActive={currentParams.participate === "true"}
                  onClick={() => toggleParam("participate", "true")}
                />

                {(currentParams.my === "true" ||
                  currentParams.participate === "true") && (
                  <>
                    <div className="w-px h-4 bg-indigo-200 dark:bg-indigo-800 mx-0.5" />
                    <button
                      onClick={() => {
                        const newParams = { ...currentParams };
                        delete newParams.my;
                        delete newParams.participate;
                        updateUrl({ ...newParams, page: 1 });
                      }}
                      className="h-8 px-2 rounded-xl text-[10px] font-bold text-indigo-400 hover:text-indigo-600 transition-colors uppercase"
                    >
                      Усі
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* ── Center: Direction quick filters ─────────────────────────── */}
              <div className="flex flex-wrap items-center p-1 bg-zinc-100/50 dark:bg-white/5 rounded-2xl border border-zinc-200 dark:border-white/10 shadow-sm gap-0.5">
                <QuickFilterBtn
                  label="Усі"
                  count={add_data?.car_count_all?.all}
                  countFilter={add_data?.car_count_filter?.all}
                  isActive={
                    !currentParams.export &&
                    !currentParams.import &&
                    !currentParams.regional &&
                    !currentParams.transit &&
                    !currentParams.international
                  }
                  onClick={() => {
                    const newParams = { ...currentParams };
                    [
                      "export",
                      "import",
                      "regional",
                      "transit",
                      "international",
                    ].forEach((k) => delete newParams[k]);
                    updateUrl({ ...newParams, page: 1 });
                  }}
                />

                <div className="w-px h-4 bg-zinc-300 dark:bg-white/20 mx-0.5" />

                {directionButtons.map((btn) => {
                  const countAll = add_data?.car_count_all as
                    | Record<string, number>
                    | undefined;
                  const countFilter = add_data?.car_count_filter as
                    | Record<string, number>
                    | undefined;

                  return (
                    <QuickFilterBtn
                      key={btn.id}
                      label={btn.label}
                      count={countAll?.[btn.countKey]}
                      countFilter={countFilter?.[btn.countKey]}
                      isActive={currentParams[btn.id] === "true"}
                      onClick={() => toggleDirection(btn.id)}
                    />
                  );
                })}
              </div>
            </div>

            {/* ── Right: List controls ───────────────────────────── */}
            <div className="flex items-center gap-1.5 bg-background/60 p-1 rounded-xl border border-border/50 shadow-sm">
              <ItemsPerPage
                options={[10, 20, 50, 100]}
                defaultValue={currentParams.limit}
                onChange={(newLimit) => {
                  localStorage.setItem(LIMIT_STORAGE_KEY, String(newLimit));
                  updateUrl({ ...currentParams, limit: newLimit, page: 1 });
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <ActiveFilters
        currentParams={currentParams}
        onRemove={handleRemoveFilter}
        onClear={handleReset}
        dropdowns={tenderFilters}
      />

      {!tenders?.length ? (
        <EmptyTenders onReset={handleReset} />
      ) : (
        <div className="space-y-6">
          <div className="pb-6 scrollbar-thin">
            <div className="w-full xl:min-w-[1240px]">
              {/* STICKY HEADER ROW */}
              <div className="sticky top-[-16px] z-20 hidden xl:flex w-full min-h-[38px] mb-2 font-bold text-zinc-500 dark:text-zinc-400 divide-x divide-zinc-200/80 dark:divide-zinc-800 bg-zinc-50/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800/60 rounded-xl shadow-[0_4px_12px_-4px_rgba(0,0,0,0.1)] text-[10px] uppercase tracking-wider">
                <div className="w-[60px] flex-shrink-0 flex items-center justify-center py-2">
                  №
                </div>
                <div className="flex-1 min-w-[130px] flex items-center justify-center py-2 px-1 text-center overflow-hidden">
                  <span className="truncate">Завантаження</span>
                </div>
                <div className="flex-1 min-w-[130px] flex items-center justify-center py-2 px-1 text-center overflow-hidden">
                  <span className="truncate">Розвантаження</span>
                </div>
                <div className="flex-1 min-w-[130px] flex items-center justify-center py-2 px-1 text-center overflow-hidden leading-tight">
                  <span className="line-clamp-2">
                    Митне
                    <br />
                    оформлення
                  </span>
                </div>
                <div className="w-[150px] flex-shrink-0 flex items-center justify-center py-2 text-center">
                  Вантаж
                </div>
                <div className="w-[90px] flex-shrink-0 flex items-center justify-center py-2 text-center">
                  Тип
                  <br />
                  транспорту
                </div>
                <div className="w-[50px] flex-shrink-0 flex items-center justify-center py-2 text-center">
                  Вага/
                  <br />
                  Об'єм
                </div>
                <div className="flex-1 min-w-[120px] max-w-[140px] flex items-center justify-center py-2 text-center">
                  Додаткові умови
                </div>
                <div className="w-[130px] flex-shrink-0 flex items-center justify-center py-2 text-center">
                  Ціни
                </div>
                <div className="w-[110px] flex-shrink-0 flex items-center justify-center py-2 text-center">
                  Час / Викуп
                </div>
                <div className="w-[155px] flex-shrink-0 flex items-center justify-center py-2 text-center">
                  Дії / Ставки
                </div>
                <div className="w-[36px] flex-shrink-0 flex items-center justify-center py-2"></div>
              </div>

              <div className="grid gap-4 w-full pt-4 xl:pt-0">
                {tenders.map((item) => (
                  <TenderCardManagers
                    key={item.id}
                    cargo={item}
                    onOpenDetails={() => router.push(`/log/tender/${item.id}`)}
                  />
                ))}
              </div>
            </div>
          </div>

          {pagination && pagination.page_count > 1 && (
            <Pagination
              page={currentParams.page}
              pageCount={pagination.page_count}
              onChange={(p) => updateUrl({ ...currentParams, page: p })}
            />
          )}
        </div>
      )}
    </div>
  );
}
