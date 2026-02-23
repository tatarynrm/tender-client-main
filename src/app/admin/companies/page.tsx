"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  SearchX,
  Search,
  X,
} from "lucide-react";

import LinkButton from "@/shared/components/Buttons/LinkButton";
import { Button, Input } from "@/shared/components/ui";
import { CompanyCard } from "@/features/admin/companies/components/CompanyCard";
import { useAdminCompanies } from "@/features/admin/hooks/useAdminCompanies";

// 1. Схема фільтрів
const companyFilterSchema = z.object({
  search: z.string(),
  page: z.number(),
  limit: z.number(),
});

type CompanyFilterValues = z.infer<typeof companyFilterSchema>;

export default function CompaniesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 2. Ініціалізація стейту фільтрів з URL або дефолтних значень
  const [filters, setFilters] = useState<CompanyFilterValues>({
    search: searchParams.get("search") || "",
    page: Number(searchParams.get("page") || 1),
    limit: Number(searchParams.get("limit") || 10),
  });

  const { register, watch, setValue, reset } = useForm<CompanyFilterValues>({
    resolver: zodResolver(companyFilterSchema) as any,
    defaultValues: filters,
  });

  const searchValue = watch("search");

  // 3. Отримання даних через кастомний хук
  const { companies, pagination, isLoading } = useAdminCompanies({
    search: filters.search,
    page: filters.page,
    per_page: filters.limit,
  });

  // 4. Ефект для Debounce пошуку (оновлює фільтри через 500мс після вводу)
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search: searchValue || "",
        page: 1, // Скидаємо на першу сторінку при пошуку
      }));

      // Синхронізація з URL
      const params = new URLSearchParams(window.location.search);
      if (searchValue) params.set("search", searchValue);
      else params.delete("search");
      params.set("page", "1");
      router.push(`?${params.toString()}`, { scroll: false });
    }, 500);

    return () => clearTimeout(handler);
  }, [searchValue, router]);

  // 5. Обробники пагінації
  const handlePageChange = useCallback(
    (newPage: number) => {
      setFilters((prev) => ({ ...prev, page: newPage }));
      const params = new URLSearchParams(window.location.search);
      params.set("page", String(newPage));
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router],
  );

  const clearFilters = () => {
    const defaults = { search: "", page: 1, limit: 50 };
    reset(defaults);
    setFilters(defaults);
    router.push(window.location.pathname, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-background text-foreground space-y-6 w-full px-4 py-6 mx-auto transition-colors duration-300">
      {/* 🔹 Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Реєстр компаній</h2>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {pagination?.rows_all || 0} контрагентів
            </span>
            <span className="text-xs text-muted-foreground uppercase tracking-widest">
              Сторінка {filters.page} з {pagination?.page_count || 1}
            </span>
          </div>
        </div>
        <LinkButton
          href="/admin/companies/save"
          icon={<Building2 className="w-4 h-4" />}
          title="Додати компанію"
        />
      </div>

      {/* 🔹 Filters Section (По аналогії з UsersPage) */}
      <div className="flex flex-wrap gap-4 items-center bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative w-full max-w-[400px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            {...register("search")}
            placeholder="Назва компанії або ЄДРПОУ..."
            className="pl-9 pr-9"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => setValue("search", "")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-destructive"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          disabled={!searchValue}
        >
          Скинути пошук
        </Button>
      </div>

      {/* 🔹 List Section */}
      <div className="space-y-2">
        <div className="hidden md:grid grid-cols-[1.5fr_1fr_1.5fr_1fr] items-center gap-4 px-12 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
          <span className="pl-2">Контрагент / Рейтинг</span>
          <span>ЄДРПОУ / Код</span>
          <span>Юридична адреса</span>
          <span className="text-right pr-12">Сервіси</span>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-20 w-full animate-pulse bg-muted rounded-xl"
              />
            ))}
          </div>
        ) : companies.length > 0 ? (
          <div className="flex flex-col gap-1.5 transition-all">
            {companies.map((company: any) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-card/30 rounded-2xl border-2 border-dashed border-border">
            <SearchX className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-medium text-foreground">
              Нічого не знайдено
            </h3>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={clearFilters}
            >
              Показати всіх
            </Button>
          </div>
        )}
      </div>

      {/* 🔹 Pagination Section */}
      {pagination && pagination.page_count > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-card border border-border rounded-xl px-6 py-3 shadow-sm">
          <p className="text-xs text-muted-foreground">
            Показано рядки з{" "}
            <span className="font-medium">
              {(filters.page - 1) * filters.limit + 1}
            </span>{" "}
            до{" "}
            <span className="font-medium">
              {Math.min(filters.page * filters.limit, pagination.rows_all)}
            </span>
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              disabled={filters.page === 1}
              onClick={() => handlePageChange(filters.page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1 mx-2">
              <span className="text-sm font-semibold">{filters.page}</span>
              <span className="text-sm text-muted-foreground">/</span>
              <span className="text-sm text-muted-foreground">
                {pagination.page_count}
              </span>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              disabled={filters.page === pagination.page_count}
              onClick={() => handlePageChange(filters.page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
