"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  User,
  Phone,
  Mail,
  FileText,
  ChevronLeft,
  AlertTriangle,
  Search
} from "lucide-react";
import { parseISO } from "date-fns";
import { motion } from "framer-motion";
import { useProfile } from "@/shared/hooks/useProfile";
import {
  financeService,
  IFinanceStatistic,
  ICurrencySum,
  IInvoice,
  IContactPerson,
  ITransportationItem,
} from "./services/finance.service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

import { Pagination } from "@/shared/components/Pagination/Pagination";
import { ItemsPerPage } from "@/shared/components/Pagination/ItemsPerPage";
import { TransportationCard } from "@/shared/components/Transportation/TransportationCard";
import { DateField } from "@/shared/components/Inputs/DateField";
import { FilterHint } from "@/shared/components/Inputs/FilterHint";

type TabType = "PLAN" | "OPL" | "OPL_PREV_MONTH" | "PROBLEM" | "DOC_WAIT" | "SEARCH";

// Порожній фільтр вкладки «Пошук». За замовчуванням нічого не вантажимо —
// лише після заповнення й натискання «Шукати». Назви полів — як очікує
// Oracle-процедура rah_filter.
const EMPTY_FINANCE_SEARCH = {
  order_number: "",
  invoice_number: "",
  date_from: "",
  date_to: "",
};

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

// Кількість сторінок для пагінації: беремо page_count, а якщо процедура його
// не віддала — рахуємо з rows_all / per_page. Так пагінація працює на всіх табах.
const derivePageCount = (pagination: any, perPage: number): number => {
  if (!pagination) return 1;
  if (pagination.page_count && pagination.page_count > 0) return pagination.page_count;
  const per = pagination.per_page || perPage || 1;
  if (pagination.rows_all && per > 0) {
    return Math.max(1, Math.ceil(pagination.rows_all / per));
  }
  return 1;
};

// Renders одну або декілька валютних сум окремо, без сумування (наприклад: 838 274 грн, 500 EUR)
const CurrencySumDisplay = ({
  sums,
  colorClass,
}: {
  sums?: ICurrencySum[];
  colorClass: string;
}) => {
  const items = sums && sums.length > 0 ? sums : [{ valut: "грн", valut_code: "UAH", suma: 0 }];
  const isSingle = items.length === 1;

  return (
    <div
      className={`flex w-full pb-2 select-none ${isSingle
        ? "items-baseline justify-center gap-1.5"
        : "flex-wrap items-baseline justify-center gap-x-3 gap-y-1"
        }`}
    >
      {items.map((item, i) => (
        <React.Fragment key={item.valut_code || item.valut || i}>
          {i > 0 && (
            <span className={`text-slate-300 dark:text-slate-700 ${isSingle ? "text-base" : "text-xs"}`}>•</span>
          )}
          <div className="flex items-baseline gap-1">
            <span className={`font-extrabold ${colorClass} ${isSingle ? "text-2xl sm:text-3xl" : "text-base sm:text-lg"}`}>
              {Math.round(item.suma || 0).toLocaleString("uk-UA")}
            </span>
            <span className={`font-bold ${colorClass} ${isSingle ? "text-sm" : "text-xs"}`}>
              {item.valut || item.valut_code || "грн"}
            </span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

// Action Dropdown for contact person (phone/email/copy)
const ContactDropdown = ({
  economist,
}: {
  economist?: IContactPerson | null;
}) => {
  // Порожній economist (null або обʼєкт без жодних даних) — не рендеримо взагалі.
  const isEmpty =
    !economist ||
    (!economist.kod_os &&
      !economist.imja &&
      !economist.prizv &&
      !economist.email &&
      !economist.phone);
  if (isEmpty) return null;

  const economistName = economist?.imja
    ? `${economist.imja} ${economist.prizv || ""}`.trim()
    : "Економіст";

  const economistEmail = economist?.email || "Немає email";
  const economistPhone = economist?.phone || "Немає телефону";

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
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
        </TooltipTrigger>
        <TooltipContent
          side="top"
          sideOffset={6}
          className="bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-slate-100 [&>span]:hidden"
        >
          {economist?.department}
        </TooltipContent>
      </Tooltip>
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
    ["PLAN", "OPL", "OPL_PREV_MONTH", "PROBLEM", "DOC_WAIT", "SEARCH"].includes(tabParam || "")
      ? tabParam
      : "PLAN"
  ) as TabType;

  const initialPaidPeriod: "CUR" | "PREV" = initialTab === "OPL_PREV_MONTH" ? "PREV" : "CUR";
  const initialPage = Number(searchParams.get("page")) || 1;

  const [statistic, setStatistic] = useState<IFinanceStatistic | null>(null);
  const [invoices, setInvoices] = useState<IInvoice[]>([]);
  // "Невиставлені рахунки" — рахунку ще нема, рендеримо в тому ж форматі,
  // що й /dashboard/cabinet/transportations, без перетворення в IInvoice
  const [transportItems, setTransportItems] = useState<ITransportationItem[]>([]);
  const [loadingStat, setLoadingStat] = useState(true);
  const [loadingList, setLoadingList] = useState(true);

  // Tabs management
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  // Sub-status for paid tab to toggle between current month and previous month
  const [paidPeriod, setPaidPeriod] = useState<"CUR" | "PREV">(initialPaidPeriod);
  // Активний тиждень у "Планові платежі" (GRAFIK). Ключ — ISO-дата week.
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);

  // Вкладка «Пошук»: власний стан. Нічого не вантажимо, доки не заповнено
  // фільтр і не натиснуто «Шукати».
  const [searchFilters, setSearchFilters] = useState({ ...EMPTY_FINANCE_SEARCH });
  const [searchResults, setSearchResults] = useState<IInvoice[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchPage, setSearchPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
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
    if (currentTabInUrl && ["PLAN", "OPL", "OPL_PREV_MONTH", "PROBLEM", "DOC_WAIT", "SEARCH"].includes(currentTabInUrl)) {
      setActiveTab(currentTabInUrl as TabType);
      if (currentTabInUrl === "OPL_PREV_MONTH") setPaidPeriod("PREV");
      if (currentTabInUrl === "OPL") setPaidPeriod("CUR");
    }
    const pageInUrl = Number(searchParams.get("page"));
    if (pageInUrl && pageInUrl > 0) {
      setCurrentPage(pageInUrl);
    }
  }, [searchParams]);

  const mid = profile?.company?.migrate_id;

  // Відновлюємо збережений вибір "Відображати по N" (як у перевезеннях).
  useEffect(() => {
    const saved =
      typeof window !== "undefined" ? localStorage.getItem("finance_limit") : null;
    if (saved) setPerPage(Number(saved));
  }, []);

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

  // Автовибір першого тижня у "Планові платежі". Якщо поточний вибір уже
  // валідний (є у списку) — не чіпаємо; інакше беремо перший тиждень.
  useEffect(() => {
    if (activeTab !== "PLAN") return;
    const weeks = statistic?.plan_week;
    if (weeks && weeks.length > 0) {
      const stillValid = selectedWeek && weeks.some((w) => w.week === selectedWeek);
      if (!stillValid) setSelectedWeek(weeks[0].week);
    } else {
      setSelectedWeek(null);
    }
  }, [activeTab, statistic, selectedWeek]);

  // Fetch Invoice List based on Active Tab, Sub-period, and Page
  useEffect(() => {
    const fetchList = async () => {
      if (!mid) return;
      // «Пошук» вантажиться вручну (кнопка «Шукати»), а не при зміні табу.
      if (activeTab === "SEARCH") {
        setLoadingList(false);
        return;
      }
      // Для "Планові платежі" чекаємо, поки завантажиться статистика і
      // визначиться активний тиждень — щоб не робити зайвий запит "усі тижні".
      if (activeTab === "PLAN") {
        if (!statistic) return;
        if ((statistic.plan_week?.length ?? 0) > 0 && !selectedWeek) return;
      }
      try {
        setLoadingList(true);
        // Map UI paidPeriod selection to the correct status string
        let targetStatus: TabType = activeTab;
        if (activeTab === "OPL" || activeTab === "OPL_PREV_MONTH") {
          targetStatus = paidPeriod === "CUR" ? "OPL" : "OPL_PREV_MONTH";
        }
        // Тиждень передаємо лише у вкладці "Планові платежі".
        const weekParam = activeTab === "PLAN" ? selectedWeek : undefined;

        // «Невиставлені рахунки» живуть у перевезеннях (func: perev_list),
        // бо рахунку ще не існує — рендеримо тим самим форматом картки,
        // що й /dashboard/cabinet/transportations. Решта вкладок — у
        // рахунках (func: rah_list), звична картка рахунку.
        if (targetStatus === "DOC_WAIT") {
          const res = await financeService.getTransportationList(mid, targetStatus, currentPage, perPage);
          setTransportItems(res?.content || []);
          setInvoices([]);
          setTotalPages(derivePageCount(res?.props?.pagination, perPage));
        } else {
          const listData = await financeService.getFinanceList(mid, targetStatus, currentPage, perPage, weekParam);
          setTransportItems([]);
          if (listData && listData.content) {
            setInvoices(listData.content);
            setTotalPages(derivePageCount(listData.props?.pagination, perPage));
          } else {
            setInvoices([]);
            setTotalPages(1);
          }
        }
      } catch (err) {
        console.error("Failed to load invoice list:", err);
        setInvoices([]);
        setTransportItems([]);
      } finally {
        setLoadingList(false);
      }
    };

    if (mid) fetchList();
  }, [mid, activeTab, paidPeriod, currentPage, perPage, selectedWeek, statistic]);

  // When active tab changes, reset to page 1 and update URL
  const handleTabChange = (tab: TabType) => {
    if (tab === "OPL" || tab === "OPL_PREV_MONTH") {
      setPaidPeriod(tab === "OPL" ? "CUR" : "PREV");
    }
    setActiveTab(tab);
    setCurrentPage(1);
    updateUrlParams(tab, 1);
  };

  // Клік по чипу тижня у "Планові платежі" — фільтруємо список за його датою.
  const handleWeekChange = (week: string) => {
    setSelectedWeek(week);
    setCurrentPage(1);
    updateUrlParams("PLAN", 1);
  };

  // Зміна "Відображати по N" — як у перевезеннях: запам'ятовуємо вибір,
  // скидаємо на першу сторінку, а perPage підставляється у запит списку.
  const handleLimitChange = (newLimit: number) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("finance_limit", String(newLimit));
    }
    setPerPage(newLimit);
    setCurrentPage(1);
    updateUrlParams(activeTab, 1);
    // У «Пошуку» список не перезавантажується автоматично — перезапитуємо вручну.
    if (activeTab === "SEARCH" && hasSearched) runSearch(1, newLimit);
  };

  // Чи є хоч один заповнений фільтр — без цього пошук не запускаємо.
  const hasAnyFilter = Object.values(searchFilters).some((v) => v.trim() !== "");

  // Пошук рахунків: збираємо лише непорожні поля (щоб не слати зайвого у
  // процедуру) і б'ємо в rah_filter. Дати — рядок "yyyy-MM-dd".
  const runSearch = async (pageArg = 1, perPageArg = perPage) => {
    if (!mid) return;
    const filter: Record<string, string | number> = {};
    Object.entries(searchFilters).forEach(([key, value]) => {
      const v = value.trim();
      if (v) filter[key] = v;
    });
    if (Object.keys(filter).length === 0) return;

    setSearchLoading(true);
    setHasSearched(true);
    setSearchPage(pageArg);
    try {
      const { content, total } = await financeService.searchInvoices(
        mid,
        filter,
        pageArg,
        perPageArg
      );
      setSearchResults(content);
      setSearchTotal(total);
    } catch (err) {
      console.error("Failed to search invoices:", err);
      setSearchResults([]);
      setSearchTotal(0);
    } finally {
      setSearchLoading(false);
    }
  };

  const resetSearch = () => {
    setSearchFilters({ ...EMPTY_FINANCE_SEARCH });
    setSearchResults([]);
    setSearchTotal(0);
    setSearchPage(1);
    setHasSearched(false);
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

  const emptyState = (
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
  );

  // Уніфікація рендера списку: у «Пошуку» показуємо searchResults з власними
  // лоадером/пагінацією, на інших табах — звичайний invoices.
  const isSearch = activeTab === "SEARCH";
  const listLoading = isSearch ? searchLoading : loadingList;
  const invoicesToRender = isSearch ? searchResults : invoices;
  const displayedTotalPages = isSearch
    ? Math.max(1, Math.ceil(searchTotal / (perPage || 1)))
    : totalPages;
  const displayedPage = isSearch ? searchPage : currentPage;

  // Порожній стан вкладки «Пошук»: до першого пошуку — підказка, після — «нічого».
  const searchEmpty = (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[28px] mt-2 text-center text-slate-500">
      <Search className="w-12 h-12 text-[#8BA6EB] dark:text-slate-700 mb-3" />
      <span className="font-bold text-base text-slate-700 dark:text-slate-300">
        {hasSearched ? "Нічого не знайдено" : "Введіть критерії пошуку"}
      </span>
      <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-[300px]">
        {hasSearched
          ? "За вказаними фільтрами рахунків немає. Спробуйте змінити критерії."
          : "Заповніть номер рахунку, номер заявки або період і натисніть «Шукати»."}
      </span>
    </div>
  );

  return (
    <div className="w-full  pb-10">

      {/* 4 Metric Cards Grid */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-4">

        <div
          className="bg-white dark:bg-slate-900 border border-blue-200/80 dark:border-slate-800 rounded-[24px] p-5 flex flex-col items-center justify-center transition-all shadow-sm"
        >
          <CurrencySumDisplay sums={statistic?.suma_borg_all} colorClass="text-[#3B52B4] dark:text-blue-400" />
          <div className="w-full border-t border-slate-100 dark:border-slate-800/80" />
          <span className="text-xs sm:text-sm text-[#3B52B4] dark:text-blue-400/90 font-bold mt-2 text-center select-none">
            Усього до оплати по виставлених рахунках
          </span>
        </div>

     
        <div
          className="bg-white dark:bg-slate-900 border border-blue-200/80 dark:border-slate-800 rounded-[24px] p-5 flex flex-col items-center justify-center transition-all shadow-sm"
        >
          <CurrencySumDisplay sums={statistic?.suma_borg_curr_month} colorClass="text-[#3B52B4] dark:text-blue-400" />
          <div className="w-full border-t border-slate-100 dark:border-slate-800/80" />
          <span className="text-xs sm:text-sm text-[#3B52B4] dark:text-blue-400/90 font-bold mt-2 text-center select-none">
            Плановано до оплати в поточному місяці
          </span>
        </div>

    
        <div
          className="bg-white dark:bg-slate-900 border border-blue-200/80 dark:border-slate-800 rounded-[24px] p-5 flex flex-col items-center justify-center transition-all shadow-sm"
        >
          <CurrencySumDisplay sums={statistic?.suma_OPL} colorClass="text-[#3B52B4] dark:text-blue-400" />
          <div className="w-full border-t border-slate-100 dark:border-slate-800/80" />
          <span className="text-xs sm:text-sm text-[#3B52B4] dark:text-blue-400/90 font-bold mt-2 text-center select-none">
            Оплачено у поточному місяці
          </span>
        </div>

      </div> */}

      {/* Tabs Container */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">

            {/* Planned Payments Tab */}
            <button
              onClick={() => handleTabChange("PLAN")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors flex items-center gap-1 cursor-pointer select-none ${activeTab === "PLAN"
                ? "bg-[#3B52B4] text-white border-[#3B52B4]"
                : "bg-white dark:bg-slate-900 text-[#3B52B4] dark:text-blue-400 border-blue-200 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-slate-800"
                }`}
            >
              <span>Планові платежі</span>
              <span className={`text-xs ml-1 font-bold ${activeTab === "PLAN" ? "text-blue-200" : "text-blue-300 dark:text-blue-500"}`}>
                {statistic?.plan || 0}
              </span>
            </button>

            {/* Paid Orders Tab */}


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
                {statistic?.problem || 0}
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
                {statistic?.norah || 0}
              </span>
            </button>
            <button
              onClick={() => handleTabChange("OPL")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors flex items-center gap-1 cursor-pointer select-none ${activeTab === "OPL" || activeTab === "OPL_PREV_MONTH"
                ? "bg-[#3B52B4] text-white border-[#3B52B4]"
                : "bg-white dark:bg-slate-900 text-[#3B52B4] dark:text-blue-400 border-blue-200 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-slate-800"
                }`}
            >
              <span>Оплачені ({statistic?.opl || 0})</span>
            </button>

            {/* Search Tab */}
            <button
              onClick={() => handleTabChange("SEARCH")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors flex items-center gap-1.5 cursor-pointer select-none ${activeTab === "SEARCH"
                ? "bg-[#3B52B4] text-white border-[#3B52B4]"
                : "bg-white dark:bg-slate-900 text-[#3B52B4] dark:text-blue-400 border-blue-200 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-slate-800"
                }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Пошук</span>
            </button>

          </div>

          {/* "Відображати по N" — той самий перемикач, що й у перевезеннях.
              Керує perPage, який підставляється у per_page запиту списку. */}
          <div className="flex items-center bg-white dark:bg-slate-900 rounded-xl text-[#415A88] dark:text-slate-300 border border-blue-100 dark:border-slate-800 shadow-sm p-1 px-2 shrink-0 self-start md:self-auto">
            <span className="text-xs font-semibold text-gray-500 mr-2 ml-1">Відображати:</span>
            <ItemsPerPage
              options={[10, 20, 50, 100]}
              defaultValue={perPage}
              onChange={handleLimitChange}
            />
          </div>
        </div>

        {/* Тижневі під-таби для "Планові платежі" (GRAFIK). Один чип на кожен
            запис plan_week; ключ фільтра — week (ISO-дата), назва — week_title. */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-2 mt-1 select-none">
          {activeTab === "PLAN" && (statistic?.plan_week?.length || 0) > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {statistic!.plan_week!.map((w, i) => (
                <button
                  key={`${w.week}-${i}`}
                  onClick={() => handleWeekChange(w.week)}
                  className={`px-3 py-1 rounded-lg text-[10px] sm:text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${selectedWeek === w.week
                    ? "bg-[#3B52B4] text-white border-[#3B52B4]"
                    : "bg-white dark:bg-slate-900 text-[#3B52B4] dark:text-blue-400 border-blue-200 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-slate-800"
                    }`}
                >
                  <span>{w.week_title}</span>
                  <span className={selectedWeek === w.week ? "text-blue-200" : "text-blue-300 dark:text-blue-500"}>
                    {w.rah_count}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Форма пошуку (лише на вкладці «Пошук») */}
      {isSearch && (
        <div
          className="bg-white dark:bg-slate-900 rounded-xl border border-blue-100 dark:border-slate-800 shadow-sm p-2.5 mt-2"
          onKeyDown={(e) => {
            if (e.key === "Enter" && hasAnyFilter && !searchLoading) runSearch(1);
          }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {/* Номер рахунку */}
            <div className="flex flex-col gap-0.5">
              <label className="flex items-center gap-1 text-[10px] font-semibold text-[#415A88] dark:text-slate-300">
                Номер рахунку
                <FilterHint title="Номер рахунку" examples={["8751", "617"]} note="Тільки цифри." />
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={searchFilters.invoice_number}
                placeholder="напр. 8751"
                onChange={(e) =>
                  setSearchFilters((f) => ({ ...f, invoice_number: e.target.value.replace(/\D/g, "") }))
                }
                className="h-8 rounded-md border border-blue-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-[12px] text-[#0a2540] dark:text-slate-100 outline-none placeholder:text-gray-400 focus:border-[#3B52B4] focus:ring-2 focus:ring-[#3B52B4]/20"
              />
            </div>
            {/* Номер заявки */}
            <div className="flex flex-col gap-0.5">
              <label className="flex items-center gap-1 text-[10px] font-semibold text-[#415A88] dark:text-slate-300">
                Номер заявки
                <FilterHint title="Номер заявки" examples={["4399-26Л", "3462-26І", "4399"]} note="Можна частково або повністю." />
              </label>
              <input
                type="text"
                value={searchFilters.order_number}
                placeholder="напр. 4399"
                onChange={(e) => setSearchFilters((f) => ({ ...f, order_number: e.target.value }))}
                className="h-8 rounded-md border border-blue-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-[12px] text-[#0a2540] dark:text-slate-100 outline-none placeholder:text-gray-400 focus:border-[#3B52B4] focus:ring-2 focus:ring-[#3B52B4]/20"
              />
            </div>
            {/* Період — від */}
            <div className="flex flex-col gap-0.5">
              <label className="text-[10px] font-semibold text-[#415A88] dark:text-slate-300">Період — від (по даті рахунку)</label>
              <DateField
                value={searchFilters.date_from}
                onChange={(v) => setSearchFilters((f) => ({ ...f, date_from: v }))}
              />
            </div>
            {/* Період — до */}
            <div className="flex flex-col gap-0.5">
              <label className="text-[10px] font-semibold text-[#415A88] dark:text-slate-300">Період — до (по даті рахунку)</label>
              <DateField
                value={searchFilters.date_to}
                onChange={(v) => setSearchFilters((f) => ({ ...f, date_to: v }))}
                minDate={searchFilters.date_from ? parseISO(searchFilters.date_from) : null}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-2.5">
            <button
              onClick={() => runSearch(1)}
              disabled={!hasAnyFilter || searchLoading}
              className="h-8 px-3 inline-flex items-center gap-1 rounded-md bg-[#3B52B4] hover:bg-[#2f429a] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[12px] font-semibold transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              {searchLoading ? "Пошук…" : "Шукати"}
            </button>
            <button
              onClick={resetSearch}
              className="h-8 px-3 rounded-md border border-blue-100 dark:border-slate-700 text-[#415A88] dark:text-slate-300 text-[12px] font-semibold hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
            >
              Скинути
            </button>
          </div>
        </div>
      )}

      {/* Bills / Invoices List */}
      <div className="flex flex-col gap-4 mt-2">
        {listLoading ? (
          // Skeletons
          [...Array(3)].map((_, i) => <SkeletonInvoice key={i} />)
        ) : activeTab === "DOC_WAIT" ? (
          // «Невиставлені рахунки» — той самий формат картки, що й у перевезеннях
          transportItems.length > 0 ? (
            transportItems.map((item) => (
              <TransportationCard
                key={item.kod_zay}
                item={item}
                onClick={() => router.push(`/dashboard/cabinet/transportations/${item.kod_zay}`)}
              />
            ))
          ) : (
            emptyState
          )
        ) : invoicesToRender.length > 0 ? (
          invoicesToRender.map((invoice, idx) => {
            // Currency & sum totals calculation directly from invoice object
            const totalSum = invoice.suma ?? (invoice.perev_list?.reduce((sum, item) => sum + (item.fraht || 0), 0) || 0);
            const paidSum = invoice.sumaopl ?? 0;
            const debtSum = invoice.borg ?? 0;
            const currencyLabel = (invoice.valut || invoice.valut_code || invoice.perev_list?.[0]?.valut || "ГРН").toUpperCase();

            const firstPerev = invoice.perev_list?.[0];
            const routeText = `Заявка ${firstPerev?.zay_num ? `#${firstPerev.zay_num} ` : ""}${firstPerev
              ? `${firstPerev.zav_country} ${firstPerev.zav_town} ➔ ${firstPerev.rozv_country} ${firstPerev.rozv_town}`
              : "Напрямок не вказано"
              }`;

            // Status dates
            const actualPaidDate = invoice.dat_opl;
            const isPaid = Boolean(actualPaidDate);

            const statusDateText = isPaid
              ? `Оплачено ${formatDate(actualPaidDate)}`
              : ''

            return (
              <motion.div
                key={invoice.kod_rah || idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
                className="w-full bg-white dark:bg-slate-900 border border-[#C7D2FE]/70 dark:border-slate-800 rounded-[28px] shadow-sm hover:shadow-md hover:border-[#3B52B4]/40 dark:hover:border-slate-700 transition-all flex flex-col overflow-hidden"
              >
                {/* Тіло рахунку — дві колонки */}
                <div className="flex flex-col lg:flex-row">

                  {/* Left Side: Invoice Details */}
                  <div className="flex-1 p-6 flex flex-col gap-3 min-w-0">
                    {/* Bill title */}
                    <h3 className="text-[#3B52B4] dark:text-blue-400 text-lg font-black tracking-tight leading-tight select-all">
                      Рахунок №{invoice.rah_num} від {formatDate(invoice.rah_dat)}
                    </h3>

                    {/* Route & order numbers */}
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-extrabold text-[#8BA6EB] dark:text-blue-400/80 uppercase tracking-wide">
                        {routeText}
                      </span>
                    </div>

                    {/* Date details */}
                    <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-xs font-semibold">
                      {invoice.doc_otrim && (
                        <span className="text-[#8BA6EB]">
                          Документи отримано
                          <strong className="text-slate-600 dark:text-slate-300 font-bold ml-1">
                            {formatDate(invoice.doc_otrim)}
                          </strong>
                        </span>
                      )}

                    </div>

                    {/* Legal entity info */}
                    <div className="text-xs font-semibold text-[#8BA6EB]">
                      Платник :{" "}
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
                    </div>

                    {/* Dropdown for Contacts */}
                    <ContactDropdown
                      economist={invoice.economist}
                    />

                  </div>

                </div>
                {/* Проблема — окрема смуга на всю ширину картки, по центру.
                    Джерело — perev_list[].status_name (напр. "Претензійний акт"),
                    а не problem_info. Лише у вкладці "Рахунки до врегулювання". */}
                {activeTab === "PROBLEM" && (invoice.perev_list?.length ?? 0) > 0 && (
                  <div className="border-t border-red-100 dark:border-red-900/40 bg-red-50/60 dark:bg-red-950/20 px-6 py-3 flex flex-col items-center gap-0.5 text-center">
                    {invoice.perev_list.map((p) => (
                      <span
                        key={p.kod_zay}
                        className="text-sm font-bold text-red-600 dark:text-red-400"
                      >
                        Заявка {p.zay_num} — {p.status_name}
                      </span>
                    ))}
                  </div>
                )}

              </motion.div>
            );
          })
        ) : isSearch ? (
          searchEmpty
        ) : (
          emptyState
        )}
      </div>

      {/* Pagination Controls */}
      {displayedTotalPages > 1 && (
        <div className="flex items-center justify-center border-t border-slate-200 dark:border-slate-800 pt-4 mt-4 px-2">
          <Pagination
            page={displayedPage}
            pageCount={displayedTotalPages}
            onChange={(newPage: number) => {
              if (isSearch) {
                runSearch(newPage);
              } else {
                setCurrentPage(newPage);
                updateUrlParams(activeTab, newPage);
              }
            }}
          />
        </div>
      )}

    </div>
  );
};
