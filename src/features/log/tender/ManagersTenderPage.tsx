"use client";

import { useFilters } from "@/shared/hooks/useFilters";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ITender } from "../types/tender.type";

import { ErrorState } from "@/shared/components/Loaders/ErrorState";

import TenderFullInfoModal from "./components/TenderFullInfoModal";
import { TenderFiltersSheet } from "./components/TenderFilters";

import { ItemsPerPage } from "@/shared/components/Pagination/ItemsPerPage";
import { ActiveFilters } from "./components/ActiveFilters";
import { EmptyTenders } from "./components/EmptyTenders";
import { Pagination } from "@/shared/components/Pagination/Pagination";
import { TenderCardManagers } from "./components/TenderCardManager";
import Loader from "@/shared/components/Loaders/MainLoader";
import { useTenderListManagers } from "../hooks/useTenderManagersList";
import { useTenderManagersFormData } from "../hooks/useTenderManagersFormData";

export default function ManagersTenderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tenderFilters } = useTenderManagersFormData();
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
      manager: searchParams.get("manager") || "",
      company: searchParams.get("company") || "",
      page: Number(searchParams.get("page") || 1),
      status: searchParams.get("status") || "",
      limit: Number(searchParams.get("limit") || 10), // <--- додали limit
    }),
    [searchParams]
  );

  const { filters, setFilters, reset } = useFilters(currentParams);
  const { tenders, pagination, isLoading, error } =
    useTenderListManagers(currentParams);

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
    let newValue: string | undefined;

    if (valueToRemove === "all") {
      // Якщо видаляємо всю групу — просто ставимо undefined
      newValue = undefined;
    } else {
      // Стандартна логіка видалення одного елемента
      const currentValue = String(
        currentParams[key as keyof typeof currentParams] || ""
      );
      newValue =
        currentValue
          .split(",")
          .filter((v) => v !== valueToRemove)
          .join(",") || undefined;
    }

    const newFilters = {
      ...filters,
      [key]: newValue,
    };

    setFilters(newFilters);
    updateUrl({ ...newFilters, page: 1 });
  };

  if (error) return <ErrorState />;
  if (isLoading) return <Loader />;
  return (
    <div className="p-1  mx-auto">
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
