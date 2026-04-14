"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

import { ITender } from "@/features/log/types/tender.type";
import { ErrorState } from "@/shared/components/Loaders/ErrorState";
import { useTenderListClient } from "@/features/dashboard/hooks/useTenderListClient";
import { useTenderClientFormData } from "@/features/dashboard/hooks/useTenderClientFormData";
import { useFilters } from "@/shared/hooks/useFilters";

import { EmptyTenders } from "@/features/dashboard/tender/components/EmptyTenders";
import { Pagination } from "@/shared/components/Pagination/Pagination";
import { ItemsPerPage } from "@/shared/components/Pagination/ItemsPerPage";

import { useModalStore } from "@/shared/stores/useModalStore";
import TenderFullInfoModal from "@/features/dashboard/tender/components/TenderFullInfoModal";
import { ActiveFilters } from "@/features/log/tender/components/ActiveFilters";
import { TenderFiltersSheet } from "./components/TenderFilters";
import TenderLoader from "@/shared/components/Loaders/TenderLoader";
import { TenderCardClients } from "./components/TenderCardClients";

interface Props {
  status?: string;
  participate_company?: boolean;
  winner_company?: boolean;
}

export default function ClientsTenderPage({
  status,
  participate_company,
  winner_company,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const { openModal } = useModalStore();
  const { tenderFilters } = useTenderClientFormData();

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
      participate: searchParams.get("participate") || "",
      participate_company:
        searchParams.get("participate_company") || participate_company || "",
      limit: Number(searchParams.get("limit") || 10),
      winner_company:
        searchParams.get("winner_company") || winner_company || "",
    }),
    [searchParams, participate_company, winner_company],
  );

  const queryFilters = useMemo(
    () => ({
      ...currentParams,
      status,
    }),
    [currentParams, status],
  );

  const { filters, setFilters, reset } = useFilters(currentParams);
  const { tenders, pagination, isLoading, error } =
    useTenderListClient(queryFilters);

  const updateUrl = useCallback(
    (newParams: Record<string, any>) => {
      const params = new URLSearchParams();
      Object.entries(newParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          const stringValue = Array.isArray(value)
            ? value.join(",")
            : String(value);
          params.set(key, stringValue);
        }
      });
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname],
  );

  const handleReset = useCallback(() => {
    reset();
    router.push(pathname, { scroll: false });
  }, [reset, router, pathname]);

  const handleRemoveFilter = useCallback(
    (key: string, valueToRemove: string) => {
      let newValue: string | undefined;
      if (valueToRemove === "all") {
        newValue = undefined;
      } else {
        const currentValue = String(
          currentParams[key as keyof typeof currentParams] || "",
        );
        newValue =
          currentValue
            .split(",")
            .filter((v) => v !== valueToRemove)
            .join(",") || undefined;
      }

      const newFilters = { ...filters, [key]: newValue };
      setFilters(newFilters);
      updateUrl({ ...newFilters, page: 1 });
    },
    [currentParams, filters, setFilters, updateUrl],
  );

  const handleApplyFilters = useCallback(() => {
    updateUrl({ ...filters, page: 1 });
  }, [filters, updateUrl]);

  const handleLimitChange = useCallback(
    (newLimit: number) => {
      updateUrl({ ...currentParams, limit: newLimit, page: 1 });
    },
    [currentParams, updateUrl],
  );

  const handlePageChange = useCallback(
    (p: number) => {
      updateUrl({ ...currentParams, page: p });
    },
    [currentParams, updateUrl],
  );

  const handleOpenDetails = useCallback(
    (tender: ITender) => {
      openModal(<TenderFullInfoModal tenderId={tender.id} />, {
        size: "full",
        className: "p-0 overflow-hidden",
        showCloseButton: false,
      });
    },
    [openModal],
  );

  if (error) return <ErrorState />;
  if (isLoading) return <TenderLoader />;

  return (
    <div className="p-0 space-y-4 pb-40">

      {/* ── Sticky header ─────────────────────────────────────────────────── */}
      <div className="sticky top-[-20px] z-20 pt-4 pb-3 -mx-4 px-4 border-b border-zinc-200/60 dark:border-white/10 backdrop-blur-md transition-all">
        <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4">
            {/* ── Left: Filter sheet ──────────────────────────────────────── */}
            <TenderFiltersSheet
              filters={filters}
              setFilters={setFilters}
              apply={handleApplyFilters}
              reset={handleReset}
              dropdowns={tenderFilters}
            />

            {/* ── Right: List controls ───────────────────────────── */}
            <div className="flex items-center gap-1.5 bg-background/60 p-1 rounded-xl border border-zinc-200 dark:border-white/10 shadow-sm">
              <ItemsPerPage
                options={[10, 20, 50, 100]}
                defaultValue={currentParams.limit}
                onChange={handleLimitChange}
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
        <div className="space-y-1 pb-20 relative xl:overflow-x-auto scrollbar-thin">
          <div className="w-full xl:min-w-[1240px]">
            {/* HEADER ROW extracted from TenderCardClients */}
            <div className="sticky top-[-20px] z-20 hidden xl:grid grid-cols-[60px_1fr_1fr_1fr_minmax(60px,0.6fr)_minmax(80px,0.8fr)_minmax(60px,0.6fr)_minmax(110px,1fr)_320px] mb-2 font-bold text-zinc-500 dark:text-zinc-400 divide-x divide-zinc-200/80 dark:divide-zinc-800 bg-zinc-50/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800/60 rounded-xl shadow-sm text-[10.5px]">
              <div className="flex items-center justify-center p-2 text-[14px] font-black tracking-tighter text-zinc-400 dark:text-zinc-500">
                №
              </div>
              <div className="flex items-center justify-center p-2">
                Завантаження
              </div>
              <div className="flex items-center justify-center p-2">
                Митне оформлення
              </div>
              <div className="flex items-center justify-center p-2">
                Розвантаження
              </div>
              <div className="flex items-center justify-center p-2">Вантаж</div>
              <div className="flex items-center justify-center p-2 text-center leading-tight">
                Тип
                <br />
                транспорту
              </div>
              <div className="flex items-center justify-center p-2">Вага</div>
              <div className="flex items-center justify-center p-2 text-center leading-tight">
                Додаткова
                <br />
                інформація
              </div>
              <div className="flex flex-col">
                <div className="flex items-center justify-center py-1.5 border-b border-zinc-200/80 dark:border-zinc-800">
                  Інформація по тендеру
                </div>
                <div className="grid grid-cols-[1fr_1fr_1fr] divide-x divide-zinc-200/80 dark:divide-zinc-800 flex-1">
                  <div className="flex items-center justify-center text-[10px]">
                    Ціна
                  </div>
                  <div className="flex items-center justify-center text-[10px]">
                    Час тендера
                  </div>
                  <div className="flex items-center justify-center text-[10px]">
                    Ставка
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1">
              {tenders.map((item) => (
                <TenderCardClients
                  key={item.id}
                  cargo={item}
                  onOpenDetails={() => handleOpenDetails(item)}
                />
              ))}
            </div>

            {pagination && pagination.page_count > 1 && (
              <Pagination
                page={currentParams.page}
                pageCount={pagination.page_count}
                onChange={handlePageChange}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
