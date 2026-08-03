"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  DollarSign,
  Calendar,
  Clock,
  CheckCircle2,
  User,
  Phone,
  Mail,
  ChevronDown,
  Copy,
  Check,
  FileText,
  ArrowRight,
  Info,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useProfile } from "@/shared/hooks/useProfile";
import {
  financeService,
  transportationToInvoice,
  IFinanceStatistic,
  IInvoice,
  IContactPerson,
} from "./services/finance.service";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

import { Pagination } from "@/shared/components/Pagination/Pagination";
import { ItemsPerPage } from "@/shared/components/Pagination/ItemsPerPage";

type TabType = "GRAFIK" | "OPL_CURR_MONTH" | "OPL_PREV_MONTH" | "PROBLEM" | "DOC_WAIT";

// Custom date formatter: ISO string -> dd.mm.yyyy
const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  } catch (e) {
    return dateStr || "";
  }
};

// Formatter for currency
const formatCurrency = (val?: number) => {
  if (val === undefined || val === null) return "0 грн";
  return `${Math.round(val).toLocaleString("uk-UA")} грн`;
};

// Action Dropdown for contact person (phone/email/copy)
const ContactDropdown = ({
  economist,
}: {
  economist?: IContactPerson | null;
}) => {
  const economistName = economist?.imja
    ? `${economist.imja} ${economist.prizv || ""}`.trim()
    : "Економіст";

  const economistEmail = economist?.email || "Немає email";
  const economistPhone = economist?.phone || "Немає телефону";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-700 rounded-full border border-[#D9E2F2] dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition outline-none cursor-pointer">
          <div className="p-1 border border-[#D9E2F2] dark:border-slate-500 rounded-full">
            <User size={12} className="text-[#51648B] dark:text-slate-300" />
          </div>
          <span className="text-[13px] font-medium text-[#51648B] dark:text-slate-200 truncate max-w-[140px] sm:max-w-[200px]">
            {economistName}
          </span>
          <ChevronLeft size={14} className="text-[#8B9EC7] -rotate-90 ml-0.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-xl border-[#D9E2F2] dark:border-slate-700 shadow-sm p-1 bg-white dark:bg-slate-800">
        <DropdownMenuItem
          className="flex items-center gap-3 py-2 px-3 rounded-lg cursor-pointer hover:bg-[#F4F7FB] dark:hover:bg-slate-700 focus:bg-[#F4F7FB] dark:focus:bg-slate-700 text-[#51648B] dark:text-slate-200"
          onClick={(e) => {
            e.stopPropagation();
            if (economistEmail && economistEmail !== "Немає email") {
              window.location.href = `mailto:${economistEmail}`;
            }
          }}
        >
          <Mail size={16} className="text-[#8B9EC7]" />
          <span className="text-xs font-medium truncate">{economistEmail}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-3 py-2 px-3 rounded-lg cursor-pointer hover:bg-[#F4F7FB] dark:hover:bg-slate-700 focus:bg-[#F4F7FB] dark:focus:bg-slate-700 text-[#51648B] dark:text-slate-200"
          onClick={(e) => {
            e.stopPropagation();
            if (economistPhone && economistPhone !== "Немає телефону") {
              window.location.href = `tel:${economistPhone.replace(/[^0-9+]/g, "")}`;
            }
          }}
        >
          <Phone size={16} className="text-[#8B9EC7]" />
          <span className="text-xs font-medium">{economistPhone}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Skeleton item for loading states
const SkeletonInvoice = () => (
  <div className="w-full bg-white dark:bg-slate-900 border border-[#C7D2FE]/60 dark:border-slate-800 rounded-3xl p-4 sm:p-6 flex flex-col md:flex-row justify-between gap-4 animate-pulse">
    <div className="space-y-3 flex-1">
      <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-2/3" />
      <div className="flex gap-2">
        <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-full w-20" />
        <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-full w-28" />
      </div>
    </div>
    <div className="flex flex-col items-end justify-between md:min-w-[180px] gap-4">
      <div className="space-y-2 text-right w-full flex flex-col items-end">
        <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded w-24" />
        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-32" />
      </div>
      <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-full w-36" />
    </div>
  </div>
);

export const CarrierFinances = () => {
  const { profile, isProfileLoading } = useProfile();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const tabParam = searchParams.get("tab") || searchParams.get("status");
  const initialTab: TabType = (
    ["GRAFIK", "OPL_CURR_MONTH", "OPL_PREV_MONTH", "PROBLEM", "DOC_WAIT"].includes(tabParam || "")
      ? tabParam
      : "GRAFIK"
  ) as TabType;

  const initialPaidPeriod: "CUR" | "PREV" = initialTab === "OPL_PREV_MONTH" ? "PREV" : "CUR";
  const initialPage = Number(searchParams.get("page")) || 1;

  const [statistic, setStatistic] = useState<IFinanceStatistic | null>(null);
  const [invoices, setInvoices] = useState<IInvoice[]>([]);
  const [loadingStat, setLoadingStat] = useState(true);
  const [loadingList, setLoadingList] = useState(true);

  // Tabs management
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  // Sub-status for paid tab to toggle between current month and previous month
  const [paidPeriod, setPaidPeriod] = useState<"CUR" | "PREV">(initialPaidPeriod);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(10);

  // Helper to sync state to URL
  const updateUrlParams = useCallback((newTab: TabType, newPage: number = 1) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", newTab);
    if (newPage > 1) {
      params.set("page", String(newPage));
    } else {
      params.delete("page");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  // Sync state when URL searchParams change externally (e.g. back/forward navigation or shared link)
  useEffect(() => {
    const currentTabInUrl = searchParams.get("tab") || searchParams.get("status");
    if (currentTabInUrl && ["GRAFIK", "OPL_CURR_MONTH", "OPL_PREV_MONTH", "PROBLEM", "DOC_WAIT"].includes(currentTabInUrl)) {
      setActiveTab(currentTabInUrl as TabType);
      if (currentTabInUrl === "OPL_PREV_MONTH") setPaidPeriod("PREV");
      if (currentTabInUrl === "OPL_CURR_MONTH") setPaidPeriod("CUR");
    }
    const pageInUrl = Number(searchParams.get("page"));
    if (pageInUrl && pageInUrl > 0) {
      setCurrentPage(pageInUrl);
    }
  }, [searchParams]);

  const handleLimitChange = (newLimit: number) => {
    setPerPage(newLimit);
    setCurrentPage(1);
  };

  const mid = profile?.company?.migrate_id;

  // Fetch Statistics
  useEffect(() => {
    const fetchStat = async () => {
      if (!mid) return;
      try {
        setLoadingStat(true);
        const statData = await financeService.getFinanceStatistic(mid);
        if (statData) {
          setStatistic(statData);
        }
      } catch (err) {
        console.error("Failed to load finance stats:", err);
      } finally {
        setLoadingStat(false);
      }
    };
    if (mid) fetchStat();
  }, [mid]);

  // Fetch Invoice List based on Active Tab, Sub-period, and Page
  useEffect(() => {
    const fetchList = async () => {
      if (!mid) return;
      try {
        setLoadingList(true);
        // Map UI paidPeriod selection to the correct status string
        let targetStatus: TabType = activeTab;
        if (activeTab === "OPL_CURR_MONTH" || activeTab === "OPL_PREV_MONTH") {
          targetStatus = paidPeriod === "CUR" ? "OPL_CURR_MONTH" : "OPL_PREV_MONTH";
        }

        // «Невиставлені рахунки» живуть у перевезеннях (func: perev_list),
        // бо рахунку ще не існує. Решта вкладок — у рахунках (func: rah_list).
        const listData =
          targetStatus === "DOC_WAIT"
            ? await financeService
                .getTransportationList(mid, targetStatus, currentPage, perPage)
                .then((res) =>
                  res
                    ? { ...res, content: (res.content || []).map(transportationToInvoice) }
                    : null
                )
            : await financeService.getFinanceList(mid, targetStatus, currentPage, perPage);

        if (listData && listData.content) {
          setInvoices(listData.content);
          if (listData.props?.pagination) {
            setTotalPages(listData.props.pagination.page_count || 1);
            setTotalRows(listData.props.pagination.rows_all || 0);
          } else {
            setTotalPages(1);
            setTotalRows(listData.content.length);
          }
        } else {
          setInvoices([]);
          setTotalPages(1);
          setTotalRows(0);
        }
      } catch (err) {
        console.error("Failed to load invoice list:", err);
        setInvoices([]);
      } finally {
        setLoadingList(false);
      }
    };

    if (mid) fetchList();
  }, [mid, activeTab, paidPeriod, currentPage, perPage]);

  // When active tab changes, reset to page 1 and update URL
  const handleTabChange = (tab: TabType) => {
    if (tab === "OPL_CURR_MONTH" || tab === "OPL_PREV_MONTH") {
      setPaidPeriod(tab === "OPL_CURR_MONTH" ? "CUR" : "PREV");
    }
    setActiveTab(tab);
    setCurrentPage(1);
    updateUrlParams(tab, 1);
  };

  const handlePaidPeriodChange = (period: "OPL_CURR_MONTH" | "OPL_PREV_MONTH" | "CUR" | "PREV") => {
    const isCur = period === "OPL_CURR_MONTH" || period === "CUR";
    const targetTab: TabType = isCur ? "OPL_CURR_MONTH" : "OPL_PREV_MONTH";
    setPaidPeriod(isCur ? "CUR" : "PREV");
    setActiveTab(targetTab);
    setCurrentPage(1);
    updateUrlParams(targetTab, 1);
  };

  // Helper info text depending on active tab
  const getHelperText = () => {
    switch (activeTab) {
      case "GRAFIK":
        return "Заплановані виплати у графіку";
      case "PROBLEM":
        return "Протерміновані виплати з виявленими затримками або проблемами";
      case "OPL_CURR_MONTH":
      case "OPL_PREV_MONTH":
        return `Оплачені замовлення за ${paidPeriod === "CUR" ? "поточний" : "попередній"} місяць`;
      case "DOC_WAIT":
        return "Загальний список діючої заборгованості за перевезення";
      default:
        return "";
    }
  };

  // Check if profile is loading
  if (isProfileLoading || (loadingStat && !statistic)) {
    return (
      <div className="w-full space-y-6 mt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl animate-pulse" />
          ))}
        </div>
        <div className="h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full animate-pulse w-full max-w-lg" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <SkeletonInvoice key={i} />)}
        </div>
      </div>
    );
  }

  if (!mid) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl mt-4">
        <AlertTriangle className="w-12 h-12 text-[#8BA6EB] mb-3 animate-bounce" />
        <span className="font-bold text-lg text-slate-700 dark:text-slate-300">Кабінет не підключено</span>
        <span className="text-sm text-slate-400 mt-1">Не знайдено ідентифікатор компанії (Migrate ID) у вашому профілі.</span>
      </div>
    );
  }

  return (
    <div className="w-full  pb-10">

      {/* 4 Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-4">

        {/* Total Debt (BORG) Card */}
        <div
          className="bg-white dark:bg-slate-900 border border-blue-200/80 dark:border-slate-800 rounded-[24px] p-5 flex flex-col items-center justify-center transition-all shadow-sm"
        >
          <div className="flex items-baseline justify-center gap-1.5 select-none w-full pb-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#3B52B4] dark:text-blue-400">
              {Math.round(statistic?.borg_all || 0).toLocaleString("uk-UA")}
            </span>
            <span className="text-sm font-bold text-[#3B52B4] dark:text-blue-400">
              грн
            </span>
          </div>
          <div className="w-full border-t border-slate-100 dark:border-slate-800/80" />
          <span className="text-xs sm:text-sm text-[#3B52B4] dark:text-blue-400/90 font-bold mt-2 text-center select-none">
            Усього до оплати по виставлених рахунках
          </span>
        </div>

        {/* Overdue (PROTERM) Card */}
        {/* <div
          className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-950/30 rounded-[24px] p-5 flex flex-col items-center justify-center transition-all shadow-sm"
        >
          <div className="flex items-baseline justify-center gap-1.5 select-none w-full pb-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#E53E3E] dark:text-red-400">
              {Math.round(statistic?.proterm_borg || 0).toLocaleString("uk-UA")}
            </span>
            <span className="text-sm font-bold text-[#E53E3E] dark:text-red-400">
              грн
            </span>
          </div>
          <div className="w-full border-t border-slate-100 dark:border-slate-800/80" />
          <span className="text-xs sm:text-sm text-[#E53E3E] dark:text-red-400 font-bold mt-2 text-center select-none">
            Протермінована
          </span>
        </div> */}

        {/* Planned (PLAN) Card */}
        <div
          className="bg-white dark:bg-slate-900 border border-blue-200/80 dark:border-slate-800 rounded-[24px] p-5 flex flex-col items-center justify-center transition-all shadow-sm"
        >
          <div className="flex items-baseline justify-center gap-1.5 select-none w-full pb-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#3B52B4] dark:text-blue-400">
              {Math.round(statistic?.plan_curr_month || 0).toLocaleString("uk-UA")}
            </span>
            <span className="text-sm font-bold text-[#3B52B4] dark:text-blue-400">
              грн
            </span>
          </div>
          <div className="w-full border-t border-slate-100 dark:border-slate-800/80" />
          <span className="text-xs sm:text-sm text-[#3B52B4] dark:text-blue-400/90 font-bold mt-2 text-center select-none">
            Плановано до оплати в поточному місяці
          </span>
        </div>

        {/* Paid (OPL_CUR) Card */}
        <div
          className="bg-white dark:bg-slate-900 border border-blue-200/80 dark:border-slate-800 rounded-[24px] p-5 flex flex-col items-center justify-center transition-all shadow-sm"
        >
          <div className="flex items-baseline justify-center gap-1.5 select-none w-full pb-2">
            <span className="text-2xl sm:text-3xl font-black text-[#3B52B4] dark:text-blue-400">
              {Math.round(statistic?.opl_curr_month || 0).toLocaleString("uk-UA")}
            </span>
            <span className="text-sm font-bold text-[#3B52B4] dark:text-blue-400">
              грн
            </span>
          </div>
          <div className="w-full border-t border-slate-100 dark:border-slate-800/80" />
          <span className="text-xs sm:text-sm text-[#3B52B4] dark:text-blue-400/90 font-bold mt-2 text-center select-none">
            Оплачено у поточному місяці
          </span>
        </div>

      </div>

      {/* Tabs Container */}
      <div className="flex flex-col gap-2 mt-2">
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-2">
          Статус рахунків
        </span>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">

            {/* Planned Payments Tab */}
            <button
              onClick={() => handleTabChange("GRAFIK")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors flex items-center gap-1 cursor-pointer select-none ${activeTab === "GRAFIK"
                ? "bg-[#3B52B4] text-white border-[#3B52B4]"
                : "bg-white dark:bg-slate-900 text-[#3B52B4] dark:text-blue-400 border-blue-200 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-slate-800"
                }`}
            >
              <span>У графіку оплат</span>
              <span className={`text-xs ml-1 font-bold ${activeTab === "GRAFIK" ? "text-blue-200" : "text-blue-300 dark:text-blue-500"}`}>
                {statistic?.grafik_rah_count || 0}
              </span>
            </button>

            {/* Paid Orders Tab */}
            <button
              onClick={() => handleTabChange("OPL_CURR_MONTH")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors flex items-center gap-1 cursor-pointer select-none ${activeTab === "OPL_CURR_MONTH" || activeTab === "OPL_PREV_MONTH"
                ? "bg-[#3B52B4] text-white border-[#3B52B4]"
                : "bg-white dark:bg-slate-900 text-[#3B52B4] dark:text-blue-400 border-blue-200 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-slate-800"
                }`}
            >
              <span>Оплачені ({statistic?.opl_two_month_rah_count || 0})</span>
            </button>

            {/* Overdue Flights / Problems Tab */}
            <button
              onClick={() => handleTabChange("PROBLEM")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors flex items-center gap-1 cursor-pointer select-none ${activeTab === "PROBLEM"
                ? "bg-[#E53E3E] text-white border-[#E53E3E]"
                : "bg-white dark:bg-slate-900 text-[#E53E3E] dark:text-red-400 border-red-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-slate-800"
                }`}
            >
              <span>Рахунки до врегулювання</span>
              <span className={`text-xs ml-1 font-bold ${activeTab === "PROBLEM" ? "text-red-200" : "text-red-300 dark:text-red-500"}`}>
                {statistic?.problem_rah_count || 0}
              </span>
            </button>
            {/* Overdue Flights / Problems Tab */}
            <button
              onClick={() => handleTabChange("DOC_WAIT")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors flex items-center gap-1 cursor-pointer select-none ${activeTab === "DOC_WAIT"
                ? "bg-[#E53E3E] text-white border-[#E53E3E]"
                : "bg-white dark:bg-slate-900 text-[#E53E3E] dark:text-red-400 border-red-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-slate-800"
                }`}
            >
              <span>Невиставлені рахунки</span>
              <span className={`text-xs ml-1 font-bold ${activeTab === "DOC_WAIT" ? "text-red-200" : "text-red-300 dark:text-red-500"}`}>
                {statistic?.all_zay_count || statistic?.all_rah_count || statistic?.all_borg || 0}
              </span>
            </button>


          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-bold select-none">Відображати по:</span>
            <div className="flex items-center bg-white dark:bg-slate-800 rounded-xl text-[#415A88] dark:text-white">
              <ItemsPerPage
                options={[10, 20, 50, 100]}
                defaultValue={perPage}
                onChange={handleLimitChange}
              />
            </div>
          </div>
        </div>

        {/* Small descriptive text below active tab */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-2 mt-1 select-none">
          {/* <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold">
            {getHelperText()}
          </span> */}

          {/* Month Switcher visible only when Paid tab is active */}
          {(activeTab === "OPL_CURR_MONTH" || activeTab === "OPL_PREV_MONTH") && (
            <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0.5 rounded-lg shadow-sm gap-1">
              <button
                onClick={() => handlePaidPeriodChange("OPL_CURR_MONTH")}
                className={`px-3 py-1 rounded-md text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${activeTab === "OPL_CURR_MONTH" || paidPeriod === "CUR"
                  ? "bg-[#3B52B4] text-white"
                  : "text-slate-400 hover:text-slate-600"
                  }`}
              >
                Поточний місяць ({statistic?.opl_curr_month_rah_count || 0})
              </button>
              <button
                onClick={() => handlePaidPeriodChange("OPL_PREV_MONTH")}
                className={`px-3 py-1 rounded-md text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${activeTab === "OPL_PREV_MONTH" || paidPeriod === "PREV"
                  ? "bg-[#3B52B4] text-white"
                  : "text-slate-400 hover:text-slate-600"
                  }`}
              >
                Попередній місяць ({statistic?.opl_prev_month_rah_count || 0})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bills / Invoices List */}
      <div className="flex flex-col gap-4 mt-2">
        {loadingList ? (
          // Skeletons
          [...Array(3)].map((_, i) => <SkeletonInvoice key={i} />)
        ) : invoices.length > 0 ? (
          invoices.map((invoice, idx) => {
            // Currency & sum totals calculation directly from invoice object
            const totalSum = invoice.suma ?? (invoice.perev_list?.reduce((sum, item) => sum + (item.fraht || 0), 0) || 0);
            const paidSum = invoice.sumaopl ?? 0;
            const debtSum = invoice.borg ?? 0;
            const currencyLabel = (invoice.valut || invoice.valut_code || invoice.perev_list?.[0]?.valut || "ГРН").toUpperCase();

            // Grab first transport route to display
            const firstPerev = invoice.perev_list?.[0];
            const routeText = firstPerev
              ? `${firstPerev.zav_country} ${firstPerev.zav_town} ➔ ${firstPerev.rozv_country} ${firstPerev.rozv_town}`
              : "Напрямок не вказано";

            // Status dates
            const actualPaidDate = invoice.dat_opl;
            const isPaid = Boolean(actualPaidDate);
            // Рахунок ще не виставлений — рядок прийшов із перевезень
            const isNotInvoiced = !invoice.rah_num;

            const statusDateText = isPaid
              ? `Оплачено ${formatDate(actualPaidDate)}`
              : isNotInvoiced
                ? "Очікуються документи для виставлення рахунку"
                : `Планова оплата з ${formatDate(invoice.dat_opl_plan || firstPerev?.opl_plan_date || invoice.rah_dat)}\nПлатіжний день - четвер`;

            // Badges
            // Check document completeness
            const docCompleteness = invoice.doc_otrim
              ? { text: "Комплект", style: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30" }
              : { text: "Некомплект", style: "bg-[#FFF2E6] text-[#D35400] border border-orange-200/50" };

            // Tax invoice registration (ПН)
            const taxInvoiceRegistered = {
              text: "ПН зареєстрована",
              style: "bg-[#E6F9F5] text-[#1ABC9C] border border-[#1ABC9C]/20"
            };

            return (
              <motion.div
                key={invoice.kod_rah || idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
                className="w-full bg-white dark:bg-slate-900 border border-[#C7D2FE]/70 dark:border-slate-800 rounded-[28px] shadow-sm hover:shadow-md hover:border-[#3B52B4]/40 dark:hover:border-slate-700 transition-all flex flex-col lg:flex-row overflow-hidden"
              >

                {/* Left Side: Invoice Details */}
                <div className="flex-1 p-6 flex flex-col gap-3 min-w-0">
                  {/* Bill title */}
                  <h3 className="text-[#3B52B4] dark:text-blue-400 text-lg font-black tracking-tight leading-tight select-all">
                    {isNotInvoiced
                      ? `Заявка №${firstPerev?.zay_num || ""} від ${formatDate(invoice.rah_dat)}`
                      : `Рахунок №${invoice.rah_num} від ${formatDate(invoice.rah_dat)}`}
                  </h3>

                  {/* Route & order numbers */}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-extrabold text-[#8BA6EB] dark:text-blue-400/80 uppercase tracking-wide">
                      {isNotInvoiced
                        ? routeText
                        : <>Заявка № {firstPerev?.zay_num ? `#${firstPerev.zay_num} ` : ""}{routeText}</>}
                    </span>
                  </div>

                  {/* Date details */}
                  <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-xs font-semibold">
                    {invoice.doc_otrim && (
                      <span className="text-[#8BA6EB]">
                        Документи отримано{" "}
                        <strong className="text-slate-600 dark:text-slate-300 font-bold ml-1">
                          {formatDate(invoice.doc_otrim)}
                        </strong>
                      </span>
                    )}

                  </div>

                  {/* Legal entity info */}
                  <div className="text-xs font-semibold text-[#8BA6EB]">
                    Юрособа :{" "}
                    <strong className="text-slate-600 dark:text-slate-300 font-bold ml-1">
                      {invoice.firma}
                    </strong>
                  </div>

                  {/* Problem Info Banner */}
                  {invoice.problem_info && (
                    <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-xs font-medium mt-1">
                      <AlertTriangle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                      <div className="flex flex-col gap-0.5">
                        <span className="font-extrabold text-[11px] uppercase tracking-wide text-rose-600 dark:text-rose-400">
                          Причина врегулювання:
                        </span>
                        <span className="text-slate-700 dark:text-slate-200 font-semibold">
                          {typeof invoice.problem_info === "string"
                            ? invoice.problem_info
                            : JSON.stringify(invoice.problem_info)}
                        </span>
                      </div>
                    </div>
                  )}

                </div>

                {/* Right Side: Money & Actions */}
                <div className="w-full lg:w-64 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 p-6 flex flex-col items-center lg:items-end justify-between gap-4 shrink-0">

                  {/* Amount / Paid / Dates / Borg */}
                  <div className="space-y-1 w-full text-center lg:text-right flex flex-col lg:items-end">
                    <span className="text-xl sm:text-2xl font-black text-[#3B52B4] dark:text-blue-400 select-all">
                      {Math.round(totalSum).toLocaleString("uk-UA")} {currencyLabel}
                    </span>
                    {/* Partial payment details if not fully paid */}
                    {debtSum > 0 && paidSum > 0 && (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 select-all">
                        Оплачено: {Math.round(paidSum).toLocaleString("uk-UA")} {currencyLabel}
                      </span>
                    )}
                    <span className={`text-xs font-bold flex items-center justify-center lg:justify-end gap-1.5 ${isPaid ? "text-emerald-600 dark:text-emerald-400" : activeTab === "PROBLEM" ? "text-red-500" : "text-[#8BA6EB]"
                      }`}>
                      {statusDateText}
                    </span>
                    {/* Debt at the very bottom */}
                    {debtSum > 0 && (
                      <span className="text-xs font-bold text-red-500 dark:text-red-400 select-all">
                        Борг: {Math.round(debtSum).toLocaleString("uk-UA")} {currencyLabel}
                      </span>
                    )}
                  </div>

                  {/* Dropdown for Contacts */}
                  <ContactDropdown
                    economist={invoice.economist}
                  />

                </div>

              </motion.div>
            );
          })
        ) : (
          // Empty State
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[28px] mt-2 text-center text-slate-500">
            <FileText className="w-12 h-12 text-[#8BA6EB] dark:text-slate-700 mb-3" />
            <span className="font-bold text-base text-slate-700 dark:text-slate-300">
              {activeTab === "DOC_WAIT" ? "Невиставлених рахунків немає" : "Рахунки відсутні"}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-[280px]">
              {activeTab === "DOC_WAIT"
                ? "Немає перевезень, за якими очікуються документи для виставлення рахунку."
                : "Не знайдено жодного рахунку для вибраного статусу фінансування."}
            </span>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center border-t border-slate-200 dark:border-slate-800 pt-4 mt-4 px-2">
          <Pagination
            page={currentPage}
            pageCount={totalPages}
            onChange={(newPage: number) => {
              setCurrentPage(newPage);
              updateUrlParams(activeTab, newPage);
            }}
          />
        </div>
      )}

    </div>
  );
};
