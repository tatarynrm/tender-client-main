"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronUp, Settings2 } from "lucide-react"; // Імпортуємо іконки

import { useFilters } from "@/shared/hooks/useFilters";
import { useVisibilityControl } from "@/shared/hooks/useVisibilityControl"; // Імпортуємо наш хук
import { ITender } from "../types/tender.type";

import { ErrorState } from "@/shared/components/Loaders/ErrorState";
import { Button } from "@/shared/components/ui/button";
import Loader from "@/shared/components/Loaders/MainLoader";

import TenderFullInfoModal from "./components/TenderFullInfoModal";
import { TenderFiltersSheet } from "./components/TenderFilters";
import { ItemsPerPage } from "@/shared/components/Pagination/ItemsPerPage";
import { ActiveFilters } from "./components/ActiveFilters";
import { EmptyTenders } from "./components/EmptyTenders";
import { Pagination } from "@/shared/components/Pagination/Pagination";
import { TenderCardManagers } from "./components/TenderCardManager";

import { useTenderListManagers } from "../hooks/useTenderManagersList";
import { useTenderManagersFormData } from "../hooks/useTenderManagersFormData";
import { AppButton } from "@/shared/components/Buttons/AppButton";
import { useModal } from "@/shared/providers/GlobalModalProvider";

export default function ManagersTenderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tenderFilters } = useTenderManagersFormData();
  const [selectedTender, setSelectedTender] = useState<ITender | null>(null);
const { openModal } = useModal();
  // 1. Керування видимістю інструментів (унікальний ключ "tender_list")
  const { isVisible, toggle } = useVisibilityControl("tender_list");

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
      limit: Number(searchParams.get("limit") || 10),
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
      newValue = undefined;
    } else {
      const currentValue = String(
        currentParams[key as keyof typeof currentParams] || ""
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
  };

  if (error) return <ErrorState />;
  if (isLoading) return <Loader />;

  return (
    <div className="p-0 mx-auto space-y-1 pb-40">
      <TenderFullInfoModal
        tenderId={selectedTender?.id}
        onClose={() => setSelectedTender(null)}
      />
<AppButton onClick={() => openModal('rest')}>Modal open</AppButton>
      <Button
        variant="ghost"
        size="sm"
        onClick={toggle}
        className="gap-2 text-zinc-500 hover:text-orange-600 transition-all font-bold uppercase text-[10px] tracking-widest"
      >
        {isVisible ? <ChevronUp size={16} /> : <Settings2 size={16} />}
        {isVisible ? "Приховати інструменти" : "Налаштування та фільтри"}
      </Button>

      {/* БЛОК ІНСТРУМЕНТІВ (ПРИХОВУЄТЬСЯ) */}
      {isVisible && (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex justify-between items-center  p-2  ">
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
        </div>
      )}

      {/* Активні фільтри виносимо за межі приховування, щоб користувач бачив, що застосовано */}
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
