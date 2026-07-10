"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useProfile } from "@/shared/hooks/useProfile";
import { carrierStatisticService, IActiveTransport } from "@/features/dashboard/main/services/carrier-statistic.service";
import Loader from "@/shared/components/Loaders/MainLoader";
import { User, Phone } from "lucide-react";
import { Pagination } from "@/shared/components/Pagination/Pagination";
import { ItemsPerPage } from "@/shared/components/Pagination/ItemsPerPage";

interface TransportationStats {
  zay_count_all: number;
  zay_count_month: number;
  zay_count_closed: number;
  zay_count_plan: number;
  zay_count_active: number;
  zay_count_doc_wait: number;
  zay_count_problem: number;
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
        closed: "CLOSED",
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

  if (isProfileLoading || loading) return <Loader />;

  const tabs = [
    { id: "plan", label: "Заплановані", count: stats?.zay_count_plan || 0 },
    { id: "in_progress", label: "В роботі", count: stats?.zay_count_active || 0 },
    { id: "doc_wait", label: "Очікуються документи", count: stats?.zay_count_doc_wait || 0 },
    { id: "problem", label: "Потребують додаткового опрацювання", count: stats?.zay_count_problem || 0 },
    { id: "pay_wait", label: "Очікують оплати", count: 3 }, // Placeholder based on design
    { id: "closed", label: "Завершені", count: stats?.zay_count_closed || 0 },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm flex flex-col items-center justify-center p-6 py-8">
          <div className="text-5xl font-bold text-[#3B52B4] mb-2">{stats?.zay_count_all || 0}</div>
          <div className="text-sm font-semibold text-[#3B52B4] border-t border-blue-100 w-full text-center pt-2">Всього рейсів за весь час</div>
        </div>
        
        {/* Card 2 */}
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm flex flex-col items-center justify-center p-6 py-8">
          <div className="text-5xl font-bold text-[#3B52B4] mb-2">{stats?.zay_count_month || 0}</div>
          <div className="text-sm font-semibold text-[#3B52B4] border-t border-blue-100 w-full text-center pt-2">Цього місяця</div>
        </div>

        {/* Card 3 (Empty) */}
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6 py-8">
          {/* Future use */}
        </div>
      </div>

      {/* Tabs and Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 mt-6">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2">Статус рейсів</span>
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors flex items-center gap-1 ${
                  activeTab === tab.id
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

        <div className="flex items-center bg-white rounded-xl text-[#415A88] border border-blue-100 shadow-sm p-1 px-2 shrink-0">
          <span className="text-xs font-semibold text-gray-500 mr-2 ml-1">Відображати:</span>
          <ItemsPerPage
            options={[10, 20, 50, 100]}
            defaultValue={currentLimit}
            onChange={handleLimitChange}
          />
        </div>
      </div>

      {/* Transports List */}
      <div className="flex flex-col gap-3 mt-4">
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
                <div className="border-t border-blue-50 px-5 py-3 flex items-center gap-6">
                  <div className="h-4 bg-gray-100 rounded w-32"></div>
                  <div className="h-4 bg-gray-100 rounded w-24"></div>
                </div>
              </div>
            ))}
          </>
        ) : transports.length === 0 ? (
          <div className="flex justify-center py-8 text-gray-500 font-medium">
            Немає перевезень у цій вкладці
          </div>
        ) : (
          transports.map((item) => {
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

            return (
              <div
                key={item.kod_zay}
                onClick={() => router.push(`/dashboard/cabinet/transportations/${item.kod_zay}`)}
                className="bg-white rounded-2xl border border-blue-100 shadow-sm flex flex-col overflow-hidden cursor-pointer hover:shadow-md hover:border-blue-200 transition"
              >
                {/* Top row */}
                <div className="flex flex-col md:flex-row justify-between p-4 px-5">
                  <div className="flex flex-col gap-2 md:w-[40%]">
                    <div className="font-bold text-base text-gray-800">
                      {item.zav_town?.split(",")[0]} → {item.rozv_town?.split(",")[0]}
                    </div>
                    <div className="text-xs text-blue-400 font-medium">#{item.zay_num}</div>

                    <div className="flex items-center gap-4 text-xs text-gray-500 font-medium mt-1">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400">📅</span> {formatDate(item.zav_date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400">⚖️</span> {item.vant_ton} Т{" "}
                        <span className="ml-1">{item.vant_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400">📍</span> {item.zav_country} → {item.rozv_country}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row md:w-[60%] justify-between items-center mt-4 md:mt-0">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-blue-300 mb-1">Статус оплати</span>
                      <span
                        className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${paymentColor}`}
                      >
                        {paymentStatus}
                      </span>
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-blue-300 mb-1">Статус рейсу</span>
                      <span
                        className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${tripColor}`}
                      >
                        {tripStatus}
                      </span>
                    </div>

                    <div className="flex flex-col items-end pr-2">
                      <span className="text-[10px] font-bold text-gray-800 tracking-widest">ФРАХТ</span>
                      <span className="text-lg font-bold text-gray-800 leading-tight mt-1">
                        {item.fraht} {item.valut}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom row (Driver info) */}
                <div className="border-t border-blue-50 px-5 py-2.5 flex items-center gap-6 text-xs text-blue-400">
                  <div className="flex items-center gap-1.5 font-medium">
                    <User size={14} className="text-gray-400" /> {item.driver}
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <Phone size={14} className="text-blue-300" /> {item.driver_phone}
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
