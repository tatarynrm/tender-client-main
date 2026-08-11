"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useProfile } from "@/shared/hooks/useProfile";
import { carrierStatisticService, IActiveTransport } from "@/features/dashboard/main/services/carrier-statistic.service";
import Loader from "@/shared/components/Loaders/MainLoader";
import { User, Phone, Truck, Mail, ChevronLeft, Calendar, Weight, Box } from "lucide-react";
import Flag from "react-flagkit";
import { Pagination } from "@/shared/components/Pagination/Pagination";
import { ItemsPerPage } from "@/shared/components/Pagination/ItemsPerPage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

function formatLocation(town?: string, country?: string, obl?: string | null) {
  if (!town) return "Невідомо";
  if (country?.toUpperCase() === "UA" && obl) {
    const cleanObl = obl.replace(/\s*(обл\.?|область)\s*/gi, "").trim();
    return `${town} (${cleanObl} обл.)`;
  }
  return town;
}

function formatNumber(value?: number | null) {
  if (value == null) return "";
  return new Intl.NumberFormat("uk-UA").format(value);
}

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

  const tabs = [
    { id: "plan", label: "Заплановані", count: stats?.zay_count_plan || 0 },
    { id: "in_progress", label: "В роботі", count: stats?.zay_count_active || 0 },
    { id: "unloaded", label: "Розвантажені", count: stats?.zay_count_unloaded || 0 },
    // { id: "doc_wait", label: "Очікуються документи", count: stats?.zay_count_doc_wait || 0 },
    // { id: "problem", label: "Потребують додаткового опрацювання", count: stats?.zay_count_problem || 0 },
    // { id: "pay_wait", label: "Очікують оплати", count: stats?.zay_count_opl_wait || 0 },
    { id: "closed", label: "Завершені", count: stats?.zay_count_closed || 0 },
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
                {tab.label}
                <span className={`text-xs ml-1 font-bold ${activeTab === tab.id ? "text-blue-200" : "text-blue-300"}`}>
                  {tab.count}
                </span>
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

      {/* Transports List */}
      <div className="flex flex-col gap-3 sm:gap-4 mt-4">
        {loadingTransports ? (
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
        ) : visibleTransports.length === 0 ? (
          <div className="flex justify-center py-8 text-gray-500 font-medium">
            {transports.length === 0
              ? "Немає перевезень у цій вкладці"
              : "Немає перевезень з обраним статусом"}
          </div>
        ) : (
          visibleTransports.map((item) => {
            const formatDate = (dateStr: string) => {
              if (!dateStr) return "";
              const date = new Date(dateStr);
              return date
                .toLocaleDateString("uk-UA", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
                .replace(/\./g, ".");
            };

            let paymentStatus = item.status_opl || "ОЧІКУЄ ОПЛАТИ";
            if (item.code_status_opl === "DOC_OCH") paymentStatus = "ОЧІКУЮТЬСЯ ДОКУМЕНТИ";
            else if (item.code_status_opl === "OPL_PLAN") paymentStatus = "ЗАПЛАНОВАНО";
            else if (item.code_status_opl === "OPL") paymentStatus = "ОПЛАЧЕНО";

            let paymentColor = "bg-orange-100 text-orange-600";
            if (paymentStatus === "ЗАПЛАНОВАНО") paymentColor = "bg-blue-100 text-blue-600";
            if (paymentStatus === "ОПЛАЧЕНО") paymentColor = "bg-indigo-100 text-indigo-600";
            if (paymentStatus === "ОЧІКУЮТЬСЯ ДОКУМЕНТИ") paymentColor = "bg-gray-100 text-gray-600";

            const tripStatus = item.status_detail_name || item.status_name || "В ДОРОЗІ";
            let tripColor = "bg-teal-100 text-teal-600";
            if (item.code_status_detail === "ACTIVE") tripColor = "bg-emerald-100 text-emerald-600";
            if (item.code_status_detail === "PLAN") tripColor = "bg-blue-100 text-blue-600";
            if (item.code_status_detail === "CLOSED") tripColor = "bg-gray-100 text-gray-600";

            let statusColor = "bg-amber-100 text-amber-700";
            if (item.code_status === "ZAMOVL") statusColor = "bg-slate-100 text-slate-600";
            else if (item.code_status === "PLAN") statusColor = "bg-blue-100 text-blue-600";
            else if (item.code_status === "ACTIVE") statusColor = "bg-emerald-100 text-emerald-600";
            else if (item.code_status === "DOC_WAIT") statusColor = "bg-indigo-100 text-blue-600";
            else if (item.code_status === "DOC_WAIT_20") statusColor = "bg-yellow-100 text-yellow-700";
            else if (item.code_status === "DOC_NO_SET") statusColor = "bg-red-100 text-red-600";
            else if (item.code_status === "DOC_ACT") statusColor = "bg-rose-100 text-rose-700";
            else if (item.code_status === "DOC_OPR") statusColor = "bg-indigo-100 text-indigo-600";
            else if (item.code_status === "OPL_GRAFIK") statusColor = "bg-purple-100 text-purple-600";
            else if (item.code_status === "CLOSED") statusColor = "bg-gray-100 text-gray-600";

            return (
              <div
                key={item.kod_zay}
                onClick={() => router.push(`/dashboard/cabinet/transportations/${item.kod_zay}`)}
                className="bg-white rounded-2xl border border-blue-100 shadow-sm flex flex-col overflow-hidden cursor-pointer hover:shadow-md hover:border-blue-200 transition"
              >
                {/* Top row */}
                <div className="flex flex-col gap-4 p-4 sm:p-5 lg:p-6 md:flex-row md:items-start md:justify-between lg:gap-6">
                  <div className="flex flex-col gap-1 min-w-0 md:w-[55%] lg:w-[60%]">
                    <div className="text-[10px] font-bold text-[#8BA6EB] uppercase tracking-wider">
                      Заявка № {item.zay_num} {item.zav_date && `від ${formatDate(item.zav_date)}`}
                    </div>
                    <div className="text-[15px] text-slate-800 font-extrabold flex flex-wrap items-center gap-x-2 gap-y-1 uppercase tracking-wide break-words">
                      <span className="flex items-center gap-1.5">
                        {item.zav_country && (
                          <span className="flex items-center gap-1 text-slate-400 text-[11px] font-bold">
                            <Flag country={item.zav_country} size={14} className="rounded-[2px] shadow-sm" />
                            {item.zav_country}
                          </span>
                        )}
                        <span className="text-[#3B52B4]">
                          {formatLocation(item.zav_town?.split(",")[0], item.zav_country, item.zav_obl)}
                        </span>
                      </span>
                      <span className="text-[#8BA6EB] font-light text-sm">➔</span>
                      <span className="flex items-center gap-1.5">
                        {item.rozv_country && (
                          <span className="flex items-center gap-1 text-slate-400 text-[11px] font-bold">
                            <Flag country={item.rozv_country} size={14} className="rounded-[2px] shadow-sm" />
                            {item.rozv_country}
                          </span>
                        )}
                        <span className="text-[#3B52B4]">
                          {formatLocation(item.rozv_town?.split(",")[0], item.rozv_country, item.rozv_obl)}
                        </span>
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 text-[11px] font-bold text-[#7C93B8] uppercase tracking-wider mt-1">
                      {item.zav_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 opacity-70 shrink-0" />
                          <span>Дата завантаження: {formatDate(item.zav_date)}</span>
                        </div>
                      )}
                      {item.rozv_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 opacity-70 shrink-0" />
                          <span>Дата розвантаження: {formatDate(item.rozv_date)}</span>
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        {item.vant_ton != null && (
                          <div className="flex items-center gap-1">
                            <Weight className="w-3.5 h-3.5 opacity-70 shrink-0" />
                            <span>Вага: {item.vant_ton} Т</span>
                          </div>
                        )}
                        {item.vant_name && (
                          <div className="flex items-center gap-1">
                            <Box className="w-3.5 h-3.5 opacity-70 shrink-0" />
                            <span>Вантаж: {item.vant_name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  <div className="flex flex-col gap-1 shrink-0 items-start md:items-end md:text-right">
                    <span className="text-[10px] font-bold text-[#8BA6EB] uppercase tracking-widest whitespace-nowrap">Сума фрахту</span>
                    <span className="text-lg sm:text-xl font-bold text-[#3B52B4] leading-tight whitespace-nowrap">
                      {formatNumber(item.fraht)} {item.valut}
                    </span>
                  </div>
                </div>

                {/* Middle row — статус перевезення по центру картки (тільки для вкладки "Розвантажені") */}
                {activeTab === "unloaded" && item.status_name && (
                  <div className="border-t border-blue-50 bg-blue-50/40 px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
                    <span className="text-[10px] font-semibold text-blue-300 uppercase tracking-widest whitespace-nowrap">Статус</span>
                    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide ring-1 ring-inset ring-black/5 ${statusColor}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {item.status_name}
                    </span>
                    {item.code_status === "DOC_WAIT_20" && (
                      <span className="text-[12px] font-semibold text-yellow-600 whitespace-nowrap">
                        більше 20 днів
                      </span>
                    )}
                  </div>
                )}

                {/* Bottom row (Driver info & Manager) */}
                <div className="border-t border-blue-50 px-4 py-2.5 sm:px-5 lg:px-6 flex flex-wrap items-center justify-between gap-y-2 text-xs text-blue-400">
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6 min-w-0">
                    <div className="flex items-center gap-1.5 font-medium min-w-0">
                      <Truck size={14} className="text-gray-400 shrink-0" />
                      <span className="uppercase text-gray-700 truncate">{item.am}</span>
                      {item.pr && <span className="uppercase text-gray-500 truncate">/ {item.pr}</span>}
                    </div>
                    <div className="flex items-center gap-1.5 font-medium min-w-0">
                      <User size={14} className="text-gray-400 shrink-0" /> <span className="truncate">{item.driver}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium min-w-0">
                      <Phone size={14} className="text-blue-300 shrink-0" /> <span className="truncate">{item.driver_phone}</span>
                    </div>
                  </div>

                  <div className="flex items-center shrink-0 ml-4" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-blue-100 hover:bg-blue-50 transition outline-none">
                          <div className="p-1 border border-blue-100 rounded-full">
                            <User size={12} className="text-blue-300" />
                          </div>
                          <span className="text-[12px] font-medium text-blue-500 hidden sm:block">
                            {item.manager?.imja} {item.manager?.prizv}
                          </span>
                          <span className="text-[12px] font-medium text-blue-500 sm:hidden">
                            Менеджер
                          </span>
                          <ChevronLeft size={14} className="text-blue-300 -rotate-90" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 rounded-xl border-blue-100 shadow-sm p-1 bg-white">
                        <DropdownMenuItem
                          className="flex items-center gap-3 py-2 px-3 rounded-lg cursor-pointer hover:bg-blue-50 focus:bg-blue-50 text-gray-600"
                          onClick={(e) => { e.stopPropagation(); if (item.manager?.email) window.location.href = `mailto:${item.manager.email}`; }}
                        >
                          <Mail size={16} className="text-blue-300" />
                          <span className="text-xs font-medium truncate">{item.manager?.email || "Немає email"}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-3 py-2 px-3 rounded-lg cursor-pointer hover:bg-blue-50 focus:bg-blue-50 text-gray-600"
                          onClick={(e) => { e.stopPropagation(); if (item.manager?.phone) window.location.href = `tel:${item.manager.phone.replace(/[^0-9+]/g, '')}`; }}
                        >
                          <Phone size={16} className="text-blue-300" />
                          <span className="text-xs font-medium">{item.manager?.phone || "Немає телефону"}</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Controls */}
      {(() => {
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
