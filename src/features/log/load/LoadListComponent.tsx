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
import { useVisibilityControl } from "@/shared/hooks/useVisibilityControl";

import { CargoCard } from "@/features/log/active/ui/CargoCard";
import { useLoads, TenderListFilters } from "@/features/log/hooks/useLoads";
import { useGetLoadFilters } from "../hooks/useGetLoadFilters";
import { LoadFiltersSheet } from "./components/LoadFiltersSheet";
import { LoadActiveFilters } from "./components/LoadActiveFilters";
import { LoadApiItem } from "../types/load.type";

import { useUrlFilters } from "@/shared/hooks/useUrlFilter";
import { EmptyLoads } from "./components/EmptyLoads";
import { AppButton } from "@/shared/components/Buttons/AppButton";

interface Props {
  active?: boolean;
  archive?: boolean;
}

export default function LoadListComponent({ active, archive }: Props) {
  const searchParams = useSearchParams();
  const { updateUrl, removeFilter, resetFilters } = useUrlFilters();
  const LIMIT_STORAGE_KEY = "load_list_limit";

  const [gridCols, setGridCols, gridClass, columnOptions] = useGridColumns(
    "loadListColumns",
    3,
  );

  // 1. Отримуємо параметри з URL (тільки ті, що реально існують)
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

    const params: TenderListFilters = {
      page: Number(searchParams.get("page") || 1),
      limit: getInitialLimit(),
    };

    // Збираємо фільтри, уникаючи порожніх рядків
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

  // 2. Формуємо фінальний об'єкт для запиту
  const queryFilters = useMemo((): TenderListFilters => {
    return {
      ...currentParams,
      active,
      archive,
    };
  }, [currentParams, active, archive]);

  // 3. Хуки даних (useLoads тепер має внутрішній enabled: !!active || !!archive)
  const { loads, pagination, add_data, isLoading, error } =
    useLoads(queryFilters);
  const { loadFilters } = useGetLoadFilters();

  // 4. Управління станом форми фільтрів (для Modal/Sheet)
  const { filters, setFilters, reset } = useFilters(currentParams);

  // 5. Обробники подій
  const handleRemoveFilter = useCallback(
    (key: string, valueToRemove: string) => {
      removeFilter(key, valueToRemove, currentParams);
    },
    [removeFilter, currentParams],
  );

  const handleReset = useCallback(() => {
    reset();
    resetFilters();
    sessionStorage.removeItem(PERSIST_KEY); // Видаляємо пам'ять про фільтри
    updateUrl({ page: 1 }); // Очищуємо URL повністю
  }, [reset, resetFilters]);

  // Константа для ключа (можна винести в конфіг)
  const PERSIST_KEY = "active_load_filters_cache";

  // Додайте цей ефект всередині компонента
  useEffect(() => {
    // 1. Коли параметри в URL змінюються, зберігаємо їх у сесію (крім дефолтних)
    if (searchParams.toString()) {
      sessionStorage.setItem(PERSIST_KEY, searchParams.toString());
    }
    // 2. Якщо ми зайшли на сторінку з порожнім URL, але в сесії щось є — відновлюємо
    else {
      const saved = sessionStorage.getItem(PERSIST_KEY);
      if (saved) {
        // Використовуємо ваш updateUrl, щоб закинути старі фільтри в URL
        const params = Object.fromEntries(new URLSearchParams(saved));
        updateUrl(params);
      }
    }
  }, [searchParams, updateUrl]);

  // 6. Рендер станів завантаження/помилки
  if (isLoading) return <Loader />;
  if (error) return <ErrorState />;

  return (
    <div className="space-y-4 pb-40">
      {/* Стікі-хедер з фільтрами та налаштуваннями */}
      <div className="sticky top-[-20px] z-30 pt-2 pb-2 backdrop-blur-sm -mx-2 px-2 transition-all">
        <div className="flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex justify-between items-center p-0 rounded-lg">
            <LoadFiltersSheet
              filters={filters}
              setFilters={setFilters}
              apply={() => updateUrl({ ...filters, page: 1 })}
              reset={handleReset}
              dropdowns={loadFilters}
              add_data={add_data}
            />
            {/* <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-md">

  <AppButton className="px-2 py-1 text-xs h-7">Усі: {add_data?.count_all}</AppButton>
  <AppButton className="px-2 py-1 text-xs h-7">Екс: {add_data?.count_exp}</AppButton>
  <AppButton className="px-2 py-1 text-xs h-7">Імп: {add_data?.count_imp}</AppButton>
  <AppButton className="px-2 py-1 text-xs h-7">Регіональні: {add_data?.count_reg}</AppButton>
  <AppButton className="px-2 py-1 text-xs h-7">Транзит: {add_data?.count_tr}</AppButton>
</div> */}
            <div className="flex gap-2 items-center">
              <GridColumnSelector
                gridCols={gridCols}
                setGridCols={setGridCols}
                columnOptions={columnOptions}
              />
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

      {/* Список активних фільтрів (бейджи) */}
      <LoadActiveFilters
        currentParams={currentParams}
        onRemove={handleRemoveFilter}
        onClear={handleReset}
        dropdowns={loadFilters}
      />

      {/* Основний контент */}
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
