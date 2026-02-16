"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronUp, Settings2, LayoutGrid, List } from "lucide-react"; 

import { ITender } from "@/features/log/types/tender.type";
import { ErrorState } from "@/shared/components/Loaders/ErrorState";
import { useTenderListClient } from "@/features/dashboard/hooks/useTenderListClient";
import { useTenderClientFormData } from "@/features/dashboard/hooks/useTenderClientFormData";
import { useFilters } from "@/shared/hooks/useFilters";

import { EmptyTenders } from "@/features/dashboard/tender/components/EmptyTenders";
import { Pagination } from "@/shared/components/Pagination/Pagination";
import { ItemsPerPage } from "@/shared/components/Pagination/ItemsPerPage";
import { Button } from "@/shared/components/ui/button";

import TenderFullInfoModal from "@/features/log/tender/components/TenderFullInfoModal";
import { ActiveFilters } from "@/features/log/tender/components/ActiveFilters";
import { TenderFiltersSheet } from "./components/TenderFilters";
import TenderLoader from "@/shared/components/Loaders/TenderLoader";
interface Props {
  status?: string;
}

// Імпорт всіх варіантів карток
import { TenderCardOne } from "./components/cards-examples/CardOne";
import { TenderCardTwo } from "./components/cards-examples/CardTwo";
import { TenderCardThree } from "./components/cards-examples/CardThree";
import { TenderCardFour } from "./components/cards-examples/CardFour";
import { TenderCardFive } from "./components/cards-examples/CardFive";
import { cn } from "@/shared/utils";
import { TenderCardSix } from "./components/cards-examples/CardSix";

// Тип для доступних варіантів дизайну
type CardVariant = "v1" | "v2" | "v3" | "v4" | "v5" | 'v6'

export default function ClientsTenderPage({status}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tenderFilters } = useTenderClientFormData();
  const [selectedTender, setSelectedTender] = useState<ITender | null>(null);
  
  // 1. Стан для вибору варіанту картки (за замовчуванням v3)
  const [cardVariant, setCardVariant] = useState<CardVariant>("v3");

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
      participate_company: searchParams.get("participate_company") || "",
      limit: Number(searchParams.get("limit") || 10),
    }),
    [searchParams],
  );
  const queryFilters = useMemo(
    () => ({
      ...currentParams,
      status,
    }),
    [currentParams, status],
  );
  const { filters, setFilters, reset } = useFilters(currentParams);
  const { tenders, pagination, isLoading, error } = useTenderListClient(queryFilters);

  // 2. Функція рендеру вибраної картки
  const renderTenderCard = (item: ITender) => {
    const props = {
      key: item.id,
      cargo: item,
      onOpenDetails: () => setSelectedTender(item),
    };

    switch (cardVariant) {
      case "v1": return <TenderCardOne {...props} />;
      case "v2": return <TenderCardTwo {...props} />;
      case "v3": return <TenderCardThree {...props} />;
      case "v4": return <TenderCardFour {...props} />;
      case "v5": return <TenderCardFive {...props} />;
      case "v6": return <TenderCardSix {...props} />;
      default: return <TenderCardThree {...props} />;
    }
  };

  const updateUrl = (newParams: Record<string, any>) => {
    const params = new URLSearchParams();
    Object.entries(newParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        const stringValue = Array.isArray(value) ? value.join(",") : String(value);
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
      const currentValue = String(currentParams[key as keyof typeof currentParams] || "");
      newValue = currentValue.split(",").filter((v) => v !== valueToRemove).join(",") || undefined;
    }
    const newFilters = { ...filters, [key]: newValue };
    setFilters(newFilters);
    updateUrl({ ...newFilters, page: 1 });
  };

  if (error) return <ErrorState />;
  if (isLoading) return <TenderLoader />;

  return (
    <div className="p-0 mx-auto space-y-2">
      <TenderFullInfoModal
        tenderId={selectedTender?.id}
        onClose={() => setSelectedTender(null)}
      />

      <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex justify-between items-center bg-white dark:bg-white/5 p-2 rounded-lg border border-zinc-200 dark:border-white/10">
          <div className="flex items-center gap-2">
            <TenderFiltersSheet
              filters={filters}
              setFilters={setFilters}
              apply={() => updateUrl({ ...filters, page: 1 })}
              reset={handleReset}
              dropdowns={tenderFilters}
            />
            
            {/* ПЕРЕМИКАЧ ВИГЛЯДУ КАРТОК */}
            <div className="flex items-center border-l pl-2 gap-1 ml-2">
              {(["v1", "v2", "v3", "v4", "v5",'v6'] as CardVariant[]).map((v) => (
                <Button
                  key={v}
                  variant={cardVariant === v ? "default" : "outline"}
                  size="sm"
                  className="h-8 w-8 p-0 text-[10px] font-bold"
                  onClick={() => setCardVariant(v)}
                >
                  {v.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          <ItemsPerPage
            options={[10, 20, 50, 100]}
            defaultValue={currentParams.limit}
            onChange={(newLimit) => {
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
        <div className="space-y-1 pb-20">
          <div className={cn(
            "grid gap-2",
            // Можна додати зміну сітки залежно від варіанту, якщо потрібно
            cardVariant === "v1" ? "grid-cols-1 lg:grid-cols-1" : "grid-cols-1"
          )}>
            {tenders.map((item) => renderTenderCard(item))}
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