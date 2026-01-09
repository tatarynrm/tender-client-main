"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ITender } from "@/features/log/types/tender.type";
import Loader from "@/shared/components/Loaders/MainLoader";
import { ErrorState } from "@/shared/components/Loaders/ErrorState";
import { TenderCardClients } from "@/features/dashboard/tender/components/TenderCardClient";
import { useTenderListClient } from "@/features/dashboard/hooks/useTenderListClient";
import TenderFullInfoModal from "@/features/log/tenders/components/TenderFullInfoModal";
import { useTenderClientFormData } from "@/features/dashboard/hooks/useTenderClientFormData";
import { useFilters } from "@/shared/hooks/useFilters";
import { TenderFiltersSheet } from "@/features/log/tenders/components/TenderFilters";

import { EmptyTenders } from "@/features/dashboard/tender/components/EmptyTenders";
import { Pagination } from "@/shared/components/Pagination/Pagination";
import { ItemsPerPage } from "@/shared/components/Pagination/ItemsPerPage";
import { ActiveFilters } from "@/features/log/tenders/components/ActiveFilters";
import { Skeleton } from "@/shared/components/ui";
import { TenderListSkeleton } from "@/features/log/tenders/skeletons/TenderCardClientSkeleton";

export default function ClientsTenderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tenderFilters } = useTenderClientFormData();
  const [selectedTender, setSelectedTender] = useState<ITender | null>(null);
  // 1. Параметри з URL
  const currentParams = useMemo(
    () => ({
      country_from: searchParams.get("country_from") || "",
      country_to: searchParams.get("country_to") || "",
      region_from: searchParams.get("region_from") || "",
      region_to: searchParams.get("region_to") || "",
      city_from: searchParams.get("city_from") || "",
      city_to: searchParams.get("city_to") || "",
      trailer_type: searchParams.get("trailer_type") || "",
      load_type: searchParams.get("load_type") || "",
      tender_type: searchParams.get("tender_type") || "",
      page: Number(searchParams.get("page") || 1),
      limit: Number(searchParams.get("limit") || 10), // <--- додали limit
    }),
    [searchParams]
  );

  const { filters, setFilters, reset } = useFilters(currentParams);
  const { tenders, pagination, isLoading, error } =
    useTenderListClient(currentParams);

  const updateUrl = (newParams: Record<string, any>) => {
    const params = new URLSearchParams();

    Object.entries(newParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        // Якщо value - масив, робимо "UA,PL", якщо рядок - лишаємо як є
        const stringValue = Array.isArray(value)
          ? value.join(",")
          : String(value);

        params.set(key, stringValue);
      }
    });

    router.push(`?${params.toString()}`, { scroll: false });
  };
  const handleReset = () => {
    reset();
    router.push(window.location.pathname, { scroll: false });
  };
  const handleRemoveFilter = (key: string, valueToRemove: string) => {
    const currentValue = String(
      currentParams[key as keyof typeof currentParams] || ""
    );

    // Розбиваємо рядок, фільтруємо значення, збираємо назад
    const newValue = currentValue
      .split(",")
      .filter((v) => v !== valueToRemove)
      .join(",");

    const newFilters = {
      ...filters,
      [key]: newValue || undefined, // Якщо значень не лишилось, ставимо undefined
    };

    setFilters(newFilters);
    updateUrl({ ...newFilters, page: 1 });
  };

  if (error) return <ErrorState />;
  if (isLoading) {
    return (
      <div className="p-4 mx-auto">
        {/* Можна додати скелетон фільтрів, якщо треба */}
        <div className="flex justify-between mb-6">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
        <TenderListSkeleton count={6} />
      </div>
    );
  }
  return (
    <div className="p-4  mx-auto">
      <TenderFullInfoModal
        tenderId={selectedTender?.id}
        onClose={() => setSelectedTender(null)}
      />

      <div className="flex flex-col mb-6">
        <div className="flex justify-between items-center">
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
              updateUrl({ ...currentParams, limit: newLimit, page: 1 });
            }}
          />
        </div>
        <ActiveFilters
          currentParams={currentParams}
          onRemove={handleRemoveFilter}
          onClear={handleReset}
          dropdowns={tenderFilters}
        />
      </div>

      {!tenders?.length ? (
        <EmptyTenders onReset={handleReset} />
      ) : (
        <div className="space-y-6">
          {pagination && pagination.page_count > 1 && (
            <Pagination
              page={currentParams.page}
              pageCount={pagination.page_count}
              onChange={(p) => updateUrl({ ...currentParams, page: p })}
            />
          )}

          <div className="grid gap-4">
            {tenders.map((item) => (
              <TenderCardClients
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
