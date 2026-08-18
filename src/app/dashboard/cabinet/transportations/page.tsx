"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useProfile } from "@/shared/hooks/useProfile";
import { carrierStatisticService, IActiveTransport } from "@/features/dashboard/main/services/carrier-statistic.service";
import Loader from "@/shared/components/Loaders/MainLoader";
import { TransportationCard } from "@/shared/components/Transportation/TransportationCard";
import { Pagination } from "@/shared/components/Pagination/Pagination";
import { ItemsPerPage } from "@/shared/components/Pagination/ItemsPerPage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { DateField } from "@/shared/components/Inputs/DateField";
import { FilterHint } from "@/shared/components/Inputs/FilterHint";
import { Search, X } from "lucide-react";
import { parseISO } from "date-fns";

const EMPTY_SEARCH_FILTERS = {
  order_number: "",
  date_from: "",
  date_to: "",
  place_from: "",
  place_to: "",
  vehicle_number: "",
};

const PROBLEM_STATUS_CODES = ["DOC_ACT", "DOC_NO_SET"];

function normalizeUnloadedStatus(code?: string, name?: string) {
  if (!code || !name) return null;
  if (PROBLEM_STATUS_CODES.includes(code)) return "Проблемні";
  return name
    .replace(/\d{2}\.\d{2}\.\d{4}/g, "")
    .replace(/\s*(з|від|по)\s*$/iu, "")
    .trim();
}

interface TransportationStats {
  zay_count_all: number;
  zay_count_month: number;
  zay_count_closed: number;
  zay_count_plan: number;
  zay_count_active: number;
  zay_count_doc_wait: number;
  zay_count_problem: number;
  zay_count_opl_wait?: number;
  zay_count_unloaded?: number;
}


import { Suspense } from "react";

export default function CabinetPage() {
  return (
    <Suspense fallback={<Loader />}>
      <CabinetPageContent />
    </Suspense>
  );
}

function CabinetPageContent() {
  const { profile, isProfileLoading } = useProfile();
  const [stats, setStats] = useState<TransportationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [transports, setTransports] = useState<IActiveTransport[]>([]);
  const [loadingTransports, setLoadingTransports] = useState(false);
  const [defaultLimit, setDefaultLimit] = useState(10);
  const [unloadedStatusFilter, setUnloadedStatusFilter] = useState("all");

  // Вкладка «Пошук»: власний стан. За замовчуванням нічого не вантажимо —
  // тільки після заповнення фільтра й натискання «Шукати».
  const [searchFilters, setSearchFilters] = useState({ ...EMPTY_SEARCH_FILTERS });
  const [searchResults, setSearchResults] = useState<IActiveTransport[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchPage, setSearchPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const savedLimit = localStorage.getItem("transportations_limit");
    if (savedLimit) setDefaultLimit(Number(savedLimit));
  }, []);

  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get("tab") || "in_progress";
  const page = Number(searchParams.get("page") || 1);
  const currentLimit = Number(searchParams.get("limit") || defaultLimit);

  const updateUrl = useCallback((newParams: Record<string, any>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      params.set(key, String(value));
    });
    router.push(`?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  const setActiveTab = (tabId: string) => {
    updateUrl({ tab: tabId, page: 1 });
  };

  const handlePageChange = (p: number) => {
    updateUrl({ page: p });
  };

  const handleLimitChange = (newLimit: number) => {
    localStorage.setItem("transportations_limit", String(newLimit));
    setDefaultLimit(newLimit);
    updateUrl({ limit: newLimit, page: 1 });
  };

  const isSearch = activeTab === "search";

  // Чи є хоча б один заповнений фільтр — без цього пошук не запускаємо.
  const hasAnyFilter = Object.values(searchFilters).some((v) => v.trim() !== "");

  const runSearch = async (pageArg = 1) => {
    if (!profile?.company?.migrate_id) return;
    // Збираємо лише непорожні поля, щоб не слати зайвих фільтрів у процедуру.
    // order_number надсилаємо числом (обов'язково), решту — рядком.
    const filter: Record<string, string | number> = {};
    Object.entries(searchFilters).forEach(([key, value]) => {
      const v = value.trim();
      if (!v) return;
      filter[key] = key === "order_number" ? Number(v) : v;
    });
    if (Object.keys(filter).length === 0) return;

    setSearchLoading(true);
    setHasSearched(true);
    setSearchPage(pageArg);
    try {
      const { content, total } =
        await carrierStatisticService.getCarrierTransportationFilter(
          profile.company.migrate_id,
          filter,
          pageArg,
          currentLimit
        );
      setSearchResults(content);
      setSearchTotal(total);
    } catch (error) {
      console.error("Failed to search transports", error);
      setSearchResults([]);
      setSearchTotal(0);
    } finally {
      setSearchLoading(false);
    }
  };

  const resetSearch = () => {
    setSearchFilters({ ...EMPTY_SEARCH_FILTERS });
    setSearchResults([]);
    setSearchTotal(0);
    setSearchPage(1);
    setHasSearched(false);
  };

  useEffect(() => {
    const fetchStats = async () => {
      if (profile?.company?.migrate_id) {
        try {
          const res = await carrierStatisticService.getCarrierTransportations(
            profile.company.migrate_id
          );
          if (res) {
            setStats(res);
          }
        } catch (error) {
          console.error("Failed to fetch transportations stats", error);
        } finally {
          setLoading(false);
        }
      } else if (!isProfileLoading) {
        setLoading(false);
      }
    };
    fetchStats();
  }, [profile, isProfileLoading]);

  useEffect(() => {
    const fetchTransports = async () => {
      if (!profile?.company?.migrate_id) return;
      setLoadingTransports(true);

      const tabToStatusMap: Record<string, string> = {
        plan: "PLAN",
        in_progress: "ACTIVE",
        doc_wait: "DOC_WAIT",
        problem: "PROBLEM",
        pay_wait: "OPL_WAIT",
        closed: "CLOSED",
     
        unloaded: "UNLOADED",
      };

      const status = tabToStatusMap[activeTab];
      if (!status) {
        setTransports([]);
        setLoadingTransports(false);
        return;
      }

      try {
        const res = await carrierStatisticService.getCarrierTransportationList(
          profile.company.migrate_id,
          status,
          page,
          currentLimit
        );
        setTransports(res || []);
      } catch (error) {
        console.error("Failed to fetch transports", error);
      } finally {
        setLoadingTransports(false);
      }
    };

    fetchTransports();
  }, [profile, activeTab, page, currentLimit]);

  useEffect(() => {
    setUnloadedStatusFilter("all");
  }, [activeTab]);

  if (isProfileLoading || loading) return <Loader />;

  const unloadedStatusOptions = Array.from(
    new Set(
      transports
        .map((t) => normalizeUnloadedStatus(t.code_status, t.status_name))
        .filter((s): s is string => Boolean(s))
    )
  );

  const visibleTransports =
    activeTab === "unloaded" && unloadedStatusFilter !== "all"
      ? transports.filter(
          (t) => normalizeUnloadedStatus(t.code_status, t.status_name) === unloadedStatusFilter
        )
      : transports;

  // На вкладці «Пошук» показуємо результати пошуку, інакше — список статусу.
  const listLoading = isSearch ? searchLoading : loadingTransports;
  const listItems = isSearch ? searchResults : visibleTransports;

  const tabs: { id: string; label: string; count?: number }[] = [
    { id: "plan", label: "Заплановані", count: stats?.zay_count_plan || 0 },
    { id: "in_progress", label: "В роботі", count: stats?.zay_count_active || 0 },
    { id: "unloaded", label: "Розвантажені", count: stats?.zay_count_unloaded || 0 },
    // { id: "doc_wait", label: "Очікуються документи", count: stats?.zay_count_doc_wait || 0 },
    // { id: "problem", label: "Потребують додаткового опрацювання", count: stats?.zay_count_problem || 0 },
    // { id: "pay_wait", label: "Очікують оплати", count: stats?.zay_count_opl_wait || 0 },
    { id: "closed", label: "Завершені", count: stats?.zay_count_closed || 0 },
    { id: "search", label: "Пошук" },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Top Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
       
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm flex flex-col items-center justify-center p-6 py-8">
          <div className="text-5xl font-bold text-[#3B52B4] mb-2">{stats?.zay_count_all || 0}</div>
          <div className="text-sm font-semibold text-[#3B52B4] border-t border-blue-100 w-full text-center pt-2">Всього рейсів за весь час</div>
        </div>

     
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm flex flex-col items-center justify-center p-6 py-8">
          <div className="text-5xl font-bold text-[#3B52B4] mb-2">{stats?.zay_count_month || 0}</div>
          <div className="text-sm font-semibold text-[#3B52B4] border-t border-blue-100 w-full text-center pt-2">Цього місяця</div>
        </div>

   
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 py-8">
     
        </div>
      </div> */}

      {/* Tabs and Controls */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap justify-between items-start sm:items-center lg:items-end gap-3 sm:gap-4">
        <div className="flex flex-col gap-2 min-w-0">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors flex items-center gap-1 ${activeTab === tab.id
                  ? "bg-[#3B52B4] text-white border-[#3B52B4]"
                  : "bg-white text-[#3B52B4] border-blue-200 hover:bg-blue-50"
                  }`}
              >
                {tab.id === "search" && <Search className="w-3.5 h-3.5" />}
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`text-xs ml-1 font-bold ${activeTab === tab.id ? "text-blue-200" : "text-blue-300"}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
          {activeTab === "unloaded" && unloadedStatusOptions.length > 0 && (
            <Select value={unloadedStatusFilter} onValueChange={setUnloadedStatusFilter}>
              <SelectTrigger className="h-9 bg-white border-blue-100 text-[#415A88]">
                <SelectValue placeholder="Усі статуси" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Усі статуси</SelectItem>
                {unloadedStatusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <div className="flex items-center bg-white rounded-xl text-[#415A88] border border-blue-100 shadow-sm p-1 px-2 shrink-0">
            <span className="text-xs font-semibold text-gray-500 mr-2 ml-1">Відображати:</span>
            <ItemsPerPage
              options={[10, 20, 50, 100]}
              defaultValue={currentLimit}
              onChange={handleLimitChange}
            />
          </div>
        </div>
      </div>

      {/* Форма пошуку (лише на вкладці «Пошук») */}
      {isSearch && (
        <div
          className="bg-white rounded-xl border border-blue-100 shadow-sm p-2.5"
          onKeyDown={(e) => {
            if (e.key === "Enter" && hasAnyFilter && !searchLoading) runSearch(1);
          }}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
            {/* Номер заявки */}
            <div className="flex flex-col gap-0.5">
              <label className="flex items-center gap-1 text-[10px] font-semibold text-[#415A88]">
                Номер заявки
                <FilterHint
                  title="Номер заявки"
                  examples={["4434", "2387"]}
                  note="Тільки цифри."
                />
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={searchFilters.order_number}
                placeholder="напр. 482"
                onChange={(e) =>
                  setSearchFilters((f) => ({
                    ...f,
                    order_number: e.target.value.replace(/\D/g, ""),
                  }))
                }
                className="h-8 rounded-md border border-blue-100 bg-white px-2 text-[12px] text-[#0a2540] outline-none placeholder:text-gray-400 focus:border-[#3B52B4] focus:ring-2 focus:ring-[#3B52B4]/20"
              />
            </div>
            {/* Період */}
            <div className="flex flex-col gap-0.5">
              <label className="text-[10px] font-semibold text-[#415A88]">Період — від</label>
              <DateField
                value={searchFilters.date_from}
                onChange={(v) => setSearchFilters((f) => ({ ...f, date_from: v }))}
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-[10px] font-semibold text-[#415A88]">Період — до</label>
              <DateField
                value={searchFilters.date_to}
                onChange={(v) => setSearchFilters((f) => ({ ...f, date_to: v }))}
                minDate={searchFilters.date_from ? parseISO(searchFilters.date_from) : null}
              />
            </div>
            {/* Номер авто */}
            <div className="flex flex-col gap-0.5">
              <label className="flex items-center gap-1 text-[10px] font-semibold text-[#415A88]">
                Номер авто
                <FilterHint
                  title="Як вводити номер авто"
                  examples={["ВС", "ВС0204", "ВС0204ВК"]}
                  note="Можна частково або повністю."
                />
              </label>
              <input
                type="text"
                value={searchFilters.vehicle_number}
                placeholder="напр. AA1234BB"
                onChange={(e) => setSearchFilters((f) => ({ ...f, vehicle_number: e.target.value }))}
                className="h-8 rounded-md border border-blue-100 bg-white px-2 text-[12px] text-[#0a2540] outline-none placeholder:text-gray-400 focus:border-[#3B52B4] focus:ring-2 focus:ring-[#3B52B4]/20"
              />
            </div>
            {/* Напрямки */}
            <div className="flex flex-col gap-0.5">
              <label className="flex items-center gap-1 text-[10px] font-semibold text-[#415A88]">
                Напрямок — звідки
                <FilterHint
                  title="Як вводити напрямок"
                  examples={["UA", "DE", "Львів", "Львівська", "львівсь"]}
                  note="Країна, місто чи область — можна частково."
                />
              </label>
              <input
                type="text"
                value={searchFilters.place_from}
                placeholder="місто або країна"
                onChange={(e) => setSearchFilters((f) => ({ ...f, place_from: e.target.value }))}
                className="h-8 rounded-md border border-blue-100 bg-white px-2 text-[12px] text-[#0a2540] outline-none placeholder:text-gray-400 focus:border-[#3B52B4] focus:ring-2 focus:ring-[#3B52B4]/20"
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="flex items-center gap-1 text-[10px] font-semibold text-[#415A88]">
                Напрямок — куди
                <FilterHint
                  title="Як вводити напрямок"
                  examples={["UA", "DE", "Львів", "Львівська", "львівсь"]}
                  note="Країна, місто чи область — можна частково."
                />
              </label>
              <input
                type="text"
                value={searchFilters.place_to}
                placeholder="місто або країна"
                onChange={(e) => setSearchFilters((f) => ({ ...f, place_to: e.target.value }))}
                className="h-8 rounded-md border border-blue-100 bg-white px-2 text-[12px] text-[#0a2540] outline-none placeholder:text-gray-400 focus:border-[#3B52B4] focus:ring-2 focus:ring-[#3B52B4]/20"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-2.5">
            <Button
              size="sm"
              onClick={() => runSearch(1)}
              disabled={!hasAnyFilter || searchLoading}
              loading={searchLoading}
              className="h-8 px-3 bg-[#3B52B4] hover:bg-[#2f429a] text-white text-[12px]"
            >
              <Search className="w-3.5 h-3.5 mr-1" />
              Шукати
            </Button>
            {(hasAnyFilter || hasSearched) && (
              <button
                type="button"
                onClick={resetSearch}
                className="inline-flex items-center gap-1 text-[13px] font-medium text-[#415A88] hover:text-[#3B52B4]"
              >
                <X className="w-3.5 h-3.5" />
                Скинути
              </button>
            )}
            {!hasAnyFilter && (
              <span className="text-[11px] text-gray-400">
                Заповніть хоча б одне поле для пошуку.
              </span>
            )}
          </div>
        </div>
      )}

      {/* Transports List */}
      <div className="flex flex-col gap-3 sm:gap-4 mt-4">
        {listLoading ? (
          <>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-blue-100 shadow-sm flex flex-col overflow-hidden animate-pulse">
                {/* Top row */}
                <div className="flex flex-col md:flex-row justify-between p-4 px-5">
                  <div className="flex flex-col gap-3 md:w-[40%]">
                    <div className="h-5 bg-gray-200 rounded-md w-3/4"></div>
                    <div className="h-3 bg-blue-100 rounded w-1/4"></div>

                    <div className="flex items-center gap-4 mt-1">
                      <div className="h-4 bg-gray-100 rounded w-16"></div>
                      <div className="h-4 bg-gray-100 rounded w-20"></div>
                      <div className="h-4 bg-gray-100 rounded w-24"></div>
                    </div>
                  </div>

                  <div className="flex flex-row md:w-[60%] justify-between items-center mt-4 md:mt-0">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-2 bg-gray-100 rounded w-16"></div>
                      <div className="h-6 bg-orange-50 rounded-full w-24"></div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-2 bg-gray-100 rounded w-16"></div>
                      <div className="h-6 bg-teal-50 rounded-full w-24"></div>
                    </div>
                    <div className="flex flex-col items-end gap-2 pr-2">
                      <div className="h-2 bg-gray-100 rounded w-10"></div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </div>

                {/* Bottom row */}
                <div className="border-t border-blue-50 px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="h-4 bg-gray-100 rounded w-24"></div>
                    <div className="h-4 bg-gray-100 rounded w-32"></div>
                    <div className="h-4 bg-gray-100 rounded w-24"></div>
                  </div>
                  <div className="h-8 bg-gray-100 rounded-full w-32 hidden sm:block"></div>
                </div>
              </div>
            ))}
          </>
        ) : listItems.length === 0 ? (
          <div className="flex justify-center py-8 text-gray-500 font-medium text-center">
            {isSearch
              ? hasSearched
                ? "За вашим запитом нічого не знайдено"
                : "Введіть параметри пошуку та натисніть «Шукати»"
              : transports.length === 0
                ? "Немає перевезень у цій вкладці"
                : "Немає перевезень з обраним статусом"}
          </div>
        ) : (
          listItems.map((item) => (
            <TransportationCard
              key={item.kod_zay}
              item={item}
              showStatus={isSearch || activeTab === "unloaded"}
              onClick={() => router.push(`/dashboard/cabinet/transportations/${item.kod_zay}`)}
            />
          ))
        )}
      </div>

      {/* Bottom Controls */}
      {(() => {
        if (isSearch) {
          if (!hasSearched) return null;
          // Якщо процедура віддала total — рахуємо точно; інакше даємо «наступну»,
          // поки сторінка заповнена вщент.
          const pageCount =
            searchTotal > 0
              ? Math.ceil(searchTotal / currentLimit)
              : searchResults.length === currentLimit
                ? searchPage + 1
                : searchPage;
          if (pageCount > 1) {
            return (
              <div className="pb-8">
                <Pagination
                  page={searchPage}
                  pageCount={pageCount}
                  onChange={(p) => runSearch(p)}
                />
              </div>
            );
          }
          return null;
        }

        const totalItems = tabs.find((t) => t.id === activeTab)?.count || 0;
        const pageCount = Math.ceil(totalItems / currentLimit);
        if (pageCount > 1) {
          return (
            <div className="pb-8">
              <Pagination
                page={page}
                pageCount={pageCount}
                onChange={handlePageChange}
              />
            </div>
          );
        }
        return null;
      })()}
    </div>
  );
}
