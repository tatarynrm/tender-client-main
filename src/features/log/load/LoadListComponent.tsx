"use client";

import React, { useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import Loader from "@/shared/components/Loaders/MainLoader";
import { ErrorState } from "@/shared/components/Loaders/ErrorState";
import GridColumnSelector from "@/shared/components/GridColumnSelector/GridColumnSelector";
import { ItemsPerPage } from "@/shared/components/Pagination/ItemsPerPage";
import { Pagination } from "@/shared/components/Pagination/Pagination";

import { useGridColumns } from "@/shared/hooks/useGridColumns";
import { useFilters } from "@/shared/hooks/useFilters";

import { CargoCard } from "@/features/log/active/ui/CargoCard";
import { useLoads, TenderListFilters } from "@/features/log/hooks/useLoads";
import { useGetLoadFilters } from "../hooks/useGetLoadFilters";
import { LoadFiltersSheet } from "./components/LoadFiltersSheet";
import { LoadActiveFilters } from "./components/LoadActiveFilters";
import { LoadApiItem } from "../types/load.type";

import { useUrlFilters } from "@/shared/hooks/useUrlFilter";
import { EmptyLoads } from "./components/EmptyLoads";
import { QuickFilterBtn } from "./QuickFilterBtn";

// ─── Key for persisting filters in session storage ────────────────────────────
const PERSIST_KEY = "active_load_filters_cache";
const LIMIT_STORAGE_KEY = "load_list_limit";

interface Props {
  active?: boolean;
  archive?: boolean;
}

export default function LoadListComponent({ active, archive }: Props) {
  const searchParams = useSearchParams();
  const { updateUrl, removeFilter, resetFilters } = useUrlFilters();

  const [gridCols, setGridCols, gridClass, columnOptions] = useGridColumns(
    "loadListColumns",
    3,
  );

  // ── 1. Parse URL params ───────────────────────────────────────────────────
  const currentParams = useMemo(() => {
    const getInitialLimit = () => {
      const urlLimit = searchParams.get("limit");
      if (urlLimit) return Number(urlLimit);
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(LIMIT_STORAGE_KEY);
        if (stored) return Number(stored);
      }
      return 10;
    };

    const params: TenderListFilters = {
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
      "company",
      "manager",
      "transit",
      "is_price_request",
      "is_collective",
      "participate",
      "my",
      "department",
    ];

    filterKeys.forEach((key) => {
      const val = searchParams.get(key);
      if (val) params[key] = val;
    });

    return params;
  }, [searchParams]);

  // ── 2. Build query object ─────────────────────────────────────────────────
  const queryFilters = useMemo(
    (): TenderListFilters => ({
      ...currentParams,
      active,
      archive,
    }),
    [currentParams, active, archive],
  );

  // ── 3. Data hooks ─────────────────────────────────────────────────────────
  const { loads, pagination, add_data, isLoading, error } =
    useLoads(queryFilters);
  const { loadFilters } = useGetLoadFilters();

  // ── 4. Filter form state ──────────────────────────────────────────────────
  const { filters, setFilters, reset } = useFilters(currentParams);

  // ── 5. Event handlers ─────────────────────────────────────────────────────
  const handleRemoveFilter = useCallback(
    (key: string, valueToRemove: string) => {
      removeFilter(key, valueToRemove, currentParams);
    },
    [removeFilter, currentParams],
  );

  const handleReset = useCallback(() => {
    reset();
    resetFilters();
    sessionStorage.removeItem(PERSIST_KEY);
    updateUrl({ page: 1 });
  }, [reset, resetFilters, updateUrl]);

  // ── 6. Persist filters in session storage ─────────────────────────────────
  useEffect(() => {
    if (searchParams.toString()) {
      sessionStorage.setItem(PERSIST_KEY, searchParams.toString());
    } else {
      const saved = sessionStorage.getItem(PERSIST_KEY);
      if (saved) {
        const params = Object.fromEntries(new URLSearchParams(saved));
        updateUrl(params);
      }
    }
  }, [searchParams, updateUrl]);

  // ── 7. Transit quick filter ───────────────────────────────────────────────
  const transitValue = currentParams.transit;

  const toggleTransit = useCallback(
    (value: string) => {
      if (transitValue === value) {
        const { transit, ...rest } = currentParams;
        updateUrl({ ...rest, page: 1 });
      } else {
        updateUrl({ ...currentParams, transit: value, page: 1 });
      }
    },
    [transitValue, currentParams, updateUrl],
  );

  // ── Transit filter buttons config ─────────────────────────────────────────
  const transitButtons = useMemo(
    () => [
      {
        id: "E",
        label: "Екс",
        count: add_data?.car_count_all.exp,
        count_filter: add_data?.car_count_filter.exp,
      },
      {
        id: "I",
        label: "Імп",
        count: add_data?.car_count_all.imp,
        count_filter: add_data?.car_count_filter.imp,
      },
      {
        id: "R",
        label: "Рег",
        count: add_data?.car_count_all.reg,
        count_filter: add_data?.car_count_filter.reg,
      },
      {
        id: "T",
        label: "Транзит",
        count: add_data?.car_count_all.tr,
        count_filter: add_data?.car_count_filter.tr,
      },
      {
        id: "M",
        label: "Міжн",
        count: add_data?.car_count_all.mn,
        count_filter: add_data?.car_count_filter.mn,
      },
    ],
    [add_data],
  );

  // ── 8. Loading / error states ─────────────────────────────────────────────
  if (isLoading) return <Loader />;
  if (error) return <ErrorState />;

  return (
    <div className="space-y-4 pb-40">
      {/* ── Sticky header ─────────────────────────────────────────────────── */}
      <div className="sticky top-[-20px] z-10 pt-4 pb-3 -mx-4 px-4 border-b border-border/60 backdrop-blur-md  transition-all">
        <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* ── Left: Filter sheet ──────────────────────────────────────── */}
            <LoadFiltersSheet
              filters={filters}
              setFilters={setFilters}
              apply={() => updateUrl({ ...filters, page: 1 })}
              reset={handleReset}
              dropdowns={loadFilters}
              add_data={add_data}
            />

            {/* ── Center: Segmented quick filters ─────────────────────────── */}
            <div className="flex flex-wrap items-center p-1 bg-muted/40 rounded-2xl border border-border/40 shadow-sm gap-0.5">
              <QuickFilterBtn
                label="Усі"
                count={add_data?.car_count_all.all}
                countFilter={add_data?.car_count_filter.all}
                isActive={!currentParams.transit}
                onClick={() => {
                  const { transit, ...rest } = currentParams;
                  updateUrl({ ...rest, page: 1 });
                }}
              />

              <div className="w-px h-4 bg-border/50 mx-0.5" />

              {transitButtons.map((btn) => (
                <QuickFilterBtn
                  key={btn.id}
                  label={btn.label}
                  count={btn.count}
                  countFilter={btn.count_filter}
                  isActive={currentParams.transit === btn.id}
                  onClick={() => toggleTransit(btn.id)}
                />
              ))}
            </div>

            {/* ── Right: Grid & limit selectors ───────────────────────────── */}
            <div className="flex items-center gap-1.5 bg-background/60 p-1 rounded-xl border border-border/50 shadow-sm">
              <GridColumnSelector
                gridCols={gridCols}
                setGridCols={setGridCols}
                columnOptions={columnOptions}
              />
              <div className="w-px h-4 bg-border/70" />
              <ItemsPerPage
                options={[10, 20, 50, 100, 200]}
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

      {/* ── Active filter badges ──────────────────────────────────────────── */}
      <LoadActiveFilters
        currentParams={currentParams}
        onRemove={handleRemoveFilter}
        onClear={handleReset}
        dropdowns={loadFilters}
      />

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="space-y-6">
        {loads.length > 0 ? (
          <>
            <div className={`grid ${gridClass} gap-6 mb-10`}>
              {loads.map((item: LoadApiItem) => (
                <CargoCard key={item.id} load={item} filters={loadFilters} />
              ))}
            </div>

            {pagination && pagination.page_count > 1 && (
              <Pagination
                page={currentParams.page || 1}
                pageCount={pagination.page_count}
                onChange={(p) => updateUrl({ ...currentParams, page: p })}
              />
            )}
          </>
        ) : (
          <EmptyLoads onReset={() => updateUrl({ page: 1 })} />
        )}
      </div>
    </div>
  );
}
