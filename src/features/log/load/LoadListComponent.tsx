"use client";

import React, { useMemo, useCallback } from "react"; // Додано useCallback
import { useSearchParams } from "next/navigation";
import { ChevronUp, Settings2 } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import Loader from "@/shared/components/Loaders/MainLoader";
import { ErrorState } from "@/shared/components/Loaders/ErrorState";
import GridColumnSelector from "@/shared/components/GridColumnSelector/GridColumnSelector";
import { ItemsPerPage } from "@/shared/components/Pagination/ItemsPerPage";
import { Pagination } from "@/shared/components/Pagination/Pagination";

import { useGridColumns } from "@/shared/hooks/useGridColumns";
import { useFilters } from "@/shared/hooks/useFilters";
import { useVisibilityControl } from "@/shared/hooks/useVisibilityControl";

import { CargoCard } from "@/features/log/active/ui/CargoCard";
import { useLoads } from "@/features/log/hooks/useLoads";
import { useGetLoadFilters } from "../hooks/useGetLoadFilters";
import { LoadFiltersSheet } from "./components/LoadFiltersSheet";
import { LoadActiveFilters } from "./components/LoadActiveFilters";
import { LoadApiItem } from "../types/load.type";

import { useUrlFilters } from "@/shared/hooks/useUrlFilter";
import { EmptyLoads } from "./components/EmptyLoads";
import UpdatesList from "@/shared/noris-components/UpdateList";

interface Props {
  active?: boolean;
  archive?: boolean;
}

export default function LoadListComponent({ active, archive }: Props) {
  const searchParams = useSearchParams();
  const { updateUrl, removeFilter, resetFilters } = useUrlFilters();

  // 1. УСІ ХУКИ МАЮТЬ БУТИ ТУТ (ДО БУДЬ-ЯКИХ IF/RETURN)
  const { isVisible, toggle } = useVisibilityControl("load_list");
  const [gridCols, setGridCols, gridClass, columnOptions] = useGridColumns(
    "loadListColumns",
    3,
  );

  // Мемоїзація параметрів, щоб уникнути зайвих ререндерів useLoads
  const currentParams = useMemo(
    () => ({
      country_from: searchParams.get("country_from") || "",
      country_to: searchParams.get("country_to") || "",
      region_from: searchParams.get("region_from") || "",
      region_to: searchParams.get("region_to") || "",
      city_from: searchParams.get("city_from") || "",
      city_to: searchParams.get("city_to") || "",
      trailer_type: searchParams.get("trailer_type") || "",
      company: searchParams.get("company") || "",
      manager: searchParams.get("manager") || "",
      transit: searchParams.get("transit") || "",
      page: Number(searchParams.get("page") || 1),
      is_price_request: searchParams.get("is_price_request") || "",
      is_collective: searchParams.get("is_collective") || "",
      participate: searchParams.get("participate") || "",
      my: searchParams.get("my") || "",
      limit: Number(searchParams.get("limit") || 10),
    }),
    [searchParams],
  );

  const queryFilters = useMemo(
    () => ({
      ...currentParams,
      active,
      archive,
    }),
    [currentParams, active, archive],
  );

  const { filters, setFilters, reset } = useFilters(currentParams);

  // Викликаємо запити даних ТУТ
  const { loads, pagination, isLoading, error } = useLoads(queryFilters);
  const { loadFilters } = useGetLoadFilters();

  // 2. ОБРОБКА ПОДІЙ (Callback для стабільності пропсів)
  const handleRemoveFilter = useCallback(
    (key: string, valueToRemove: string) => {
      removeFilter(key, valueToRemove, currentParams);
    },
    [removeFilter, currentParams],
  );

  const handleReset = useCallback(() => {
    reset();
    resetFilters();
  }, [reset, resetFilters]);

  // 3. ТІЛЬКИ ПІСЛЯ ВСІХ ХУКІВ РОБИМО УМОВНИЙ RETURN
  if (isLoading) return <Loader />;
  if (error) return <ErrorState />;

  return (
    <div className="space-y-4 pb-40">
     
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggle}
          className="gap-2 text-zinc-500 hover:text-orange-600 transition-all font-bold uppercase text-[10px] tracking-widest"
        >
          {isVisible ? <ChevronUp size={16} /> : <Settings2 size={16} />}
          {isVisible ? "Приховати інструменти" : "Налаштування та фільтри"}
        </Button>
      </div>

      {isVisible && (
        <div className="flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex justify-between items-center p-2 rounded-lg">
            <LoadFiltersSheet
              filters={filters}
              setFilters={setFilters}
              apply={() => updateUrl({ ...filters, page: 1 })}
              reset={handleReset}
              dropdowns={loadFilters}
            />
            <GridColumnSelector
              gridCols={gridCols}
              setGridCols={setGridCols}
              columnOptions={columnOptions}
            />
            <ItemsPerPage
              options={[10, 20, 50, 100]}
              defaultValue={currentParams.limit}
              onChange={(newLimit) =>
                updateUrl({ ...currentParams, limit: newLimit, page: 1 })
              }
            />
          </div>
        </div>
      )}

      <LoadActiveFilters
        currentParams={currentParams}
        onRemove={handleRemoveFilter}
        onClear={handleReset}
        dropdowns={loadFilters}
      />

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
                page={currentParams.page}
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
