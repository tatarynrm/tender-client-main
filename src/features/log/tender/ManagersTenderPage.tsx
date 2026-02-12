"use client";

import React, { useMemo, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronUp, Settings2 } from "lucide-react";

import { useFilters } from "@/shared/hooks/useFilters";
import { useVisibilityControl } from "@/shared/hooks/useVisibilityControl";
import { useUrlFilters } from "@/shared/hooks/useUrlFilter";
import { useModal } from "@/shared/providers/GlobalModalProvider";

import { ITender } from "../types/tender.type";
import { useTenderListManagers } from "../hooks/useTenderManagersList";
import { useTenderManagersFormData } from "../hooks/useTenderManagersFormData";

import { ErrorState } from "@/shared/components/Loaders/ErrorState";
import { Button } from "@/shared/components/ui/button";
import Loader from "@/shared/components/Loaders/MainLoader";
import { AppButton } from "@/shared/components/Buttons/AppButton";

import TenderFullInfoModal from "./components/TenderFullInfoModal";
import { TenderFiltersSheet } from "./components/TenderFilters";
import { ItemsPerPage } from "@/shared/components/Pagination/ItemsPerPage";
import { ActiveFilters } from "./components/ActiveFilters";
import { EmptyTenders } from "./components/EmptyTenders";
import { Pagination } from "@/shared/components/Pagination/Pagination";
import { TenderCardManagers } from "./components/TenderCardManager";

interface Props {
  status?: string;
}

const LIMIT_STORAGE_KEY = "tender_list_limit";
const PERSIST_KEY = "tender_managers_filters_cache";

export default function ManagersTenderPage({ status }: Props) {
  const searchParams = useSearchParams();
  const { updateUrl, removeFilter, resetFilters } = useUrlFilters();
  const { tenderFilters } = useTenderManagersFormData();
  const { openModal } = useModal();
  const [selectedTender, setSelectedTender] = useState<ITender | null>(null);

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

  const { tenders, pagination, isLoading, error } =
    useTenderListManagers(queryFilters);

  // 3. Управління станом форми
  const { filters, setFilters, reset } = useFilters(currentParams);

  // 4. Ефект для синхронізації фільтрів у SessionStorage (Кешування)
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

  // 5. Обробники
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

  if (error) return <ErrorState />;
  if (isLoading) return <Loader />;

  return (
    <div className="p-0 mx-auto space-y-1 pb-40">
      <TenderFullInfoModal
        tenderId={selectedTender?.id}
        onClose={() => setSelectedTender(null)}
      />

      <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex justify-between items-center p-2">
          <TenderFiltersSheet
            filters={filters}
            setFilters={setFilters}
            apply={() => updateUrl({ ...filters, page: 1 })}
            reset={handleReset}
            dropdowns={tenderFilters}
          />
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
          <div className="grid gap-4">
            {tenders.map((item) => (
              <TenderCardManagers
                key={item.id}
                cargo={item}
                onOpenDetails={() => setSelectedTender(item)}
              />
            ))}
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
