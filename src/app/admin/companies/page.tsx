"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import api from "@/shared/api/instance.api";
import LinkButton from "@/shared/components/Buttons/LinkButton";
import { Building2, ChevronLeft, ChevronRight, SearchX } from "lucide-react";
import { Button } from "@/shared/components/ui";
import { CompanyCard } from "@/features/admin/companies/components/CompanyCard";
import { CompanyFilters } from "@/features/admin/companies/components/CompanyFilters";

/* --------------------------------------------------
  TYPES
-------------------------------------------------- */
export interface Company {
  id: number;
  company_name: string;
  company_name_full: string;
  company_form: string;
  edrpou: string;
  address: string;
  country_idnt: string;
  ids_country: string;
  black_list: boolean;
  is_blocked: boolean;
  is_carrier: boolean;
  is_client: boolean;
  is_expedition: boolean;
  lei?: string | null;
  rating?: number | null;
}

interface PaginationInfo {
  page: number;
  per_page: number;
  rows_all: number;
  page_count: number;
}

/* --------------------------------------------------
  PAGE
-------------------------------------------------- */
export default function CompaniesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const currentParams = useMemo(
    () => ({
      page: Number(searchParams.get("page") || 1),
      limit: Number(searchParams.get("limit") || 50),
      search: searchParams.get("search") || "",
    }),
    [searchParams]
  );

  const [localFilters, setLocalFilters] = useState({
    search: currentParams.search,
  });

  useEffect(() => {
    setLocalFilters({ search: currentParams.search });
  }, [currentParams.search]);

  const updateUrl = (paramsObject: Record<string, any>) => {
    const params = new URLSearchParams();
    Object.entries(paramsObject).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.set(key, String(value));
      }
    });
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleReset = () => {
    router.push(window.location.pathname, { scroll: false });
  };

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get("/company/all", {
        params: {
          page: currentParams.page,
          per_page: currentParams.limit,
          search: currentParams.search,
        },
      });

      setCompanies(data.content);
      setPagination(data.props.pagination);
    } catch (error) {
      console.error("Помилка завантаження компаній:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [currentParams]);

  return (
    <div className="min-h-screen bg-background text-foreground space-y-6 w-full px-4 py-6  mx-auto transition-colors duration-300">
      {/* 🔹 Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Реєстр компаній</h2>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {pagination?.rows_all || 0} контрагентів
            </span>
            <span className="text-xs text-muted-foreground uppercase tracking-widest">
              Сторінка {currentParams.page} з {pagination?.page_count || 1}
            </span>
          </div>
        </div>

        <LinkButton
          href="/admin/companies/create"
          icon={<Building2 className="w-4 h-4" />}
          title="Додати компанію"
          className="shadow-sm"
        />
      </div>

      {/* 🔹 Filters Section */}
      <div className="bg-card/50 backdrop-blur-sm p-3 rounded-xl border border-border shadow-sm">
        <CompanyFilters
          filters={localFilters}
          onChange={setLocalFilters}
          onApply={() =>
            updateUrl({
              ...currentParams,
              ...localFilters,
              page: 1,
            })
          }
          onReset={handleReset}
        />
      </div>

      {/* 🔹 List Section */}
      <div className="space-y-2">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-[1.5fr_1fr_1.5fr_1fr] items-center gap-4 px-12 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
          <span className="pl-2">Контрагент / Рейтинг</span>
          <span>ЄДРПОУ / Код</span>
          <span>Юридична адреса</span>
          <span className="text-right pr-12">Сервіси</span>
        </div>

        {isLoading ? (
          // Простий скелетон при завантаженні
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-16 w-full animate-pulse bg-muted rounded-xl"
              />
            ))}
          </div>
        ) : companies.length > 0 ? (
          <div className="flex flex-col gap-1.5 transition-all">
            {companies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-card/30 rounded-2xl border-2 border-dashed border-border">
            <SearchX className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-medium text-foreground">
              Нічого не знайдено
            </h3>
            <p className="text-sm text-muted-foreground max-w-[250px] text-center mt-1">
              Спробуйте змінити параметри пошуку або скинути фільтри
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={handleReset}
            >
              Скинути пошук
            </Button>
          </div>
        )}
      </div>

      {/* 🔹 Pagination Section */}
      {pagination && pagination.page_count > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-card border border-border rounded-xl px-6 py-3 shadow-sm transition-colors">
          <p className="text-xs text-muted-foreground order-2 sm:order-1">
            Показано рядки з{" "}
            <span className="font-medium text-foreground">
              {(currentParams.page - 1) * currentParams.limit + 1}
            </span>{" "}
            до{" "}
            <span className="font-medium text-foreground">
              {Math.min(
                currentParams.page * currentParams.limit,
                pagination.rows_all
              )}
            </span>
          </p>

          <div className="flex items-center gap-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              disabled={currentParams.page === 1}
              onClick={() =>
                updateUrl({ ...currentParams, page: currentParams.page - 1 })
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1 mx-2">
              <span className="text-sm font-semibold text-foreground">
                {currentParams.page}
              </span>
              <span className="text-sm text-muted-foreground">/</span>
              <span className="text-sm text-muted-foreground">
                {pagination.page_count}
              </span>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              disabled={currentParams.page === pagination.page_count}
              onClick={() =>
                updateUrl({ ...currentParams, page: currentParams.page + 1 })
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
