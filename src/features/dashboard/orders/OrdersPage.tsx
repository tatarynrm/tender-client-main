"use client";

import React, { useEffect, useState } from "react";
import { Filter, Search } from "lucide-react";
import { ordersService } from "./services/orders.service";
import OrderCard from "./components/OrderCard";

export default function OrdersPage({ profile }: { profile: any }) {
  const [activeTab, setActiveTab] = useState("I");
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({ I: 46, E: 78, R: 256 });

  const mid = profile?.company?.id || profile?.id || 1;

  useEffect(() => {
    ordersService.getOrdersStatistic(mid).then((res) => {
      if (res) {
        // Handle array or object
        const s = Array.isArray(res) ? res[0] : res;
        if (s) {
          const I = s.zay_count_imp ?? s.import_count ?? 46;
          const E = s.zay_count_exp ?? s.export_count ?? 78;
          const R = s.zay_count_reg ?? s.regional_count ?? 256;
          setStats({ I, E, R });
        }
      }
    });
  }, [mid]);

  useEffect(() => {
    setLoading(true);
    ordersService.getOrdersList(mid, activeTab).then((res) => {
      let list = [];
      if (Array.isArray(res)) {
        list = res;
      } else if (res?.data && Array.isArray(res.data)) {
        list = res.data;
      } else if (res?.content && Array.isArray(res.content)) {
        list = res.content;
      }

      if (list.length === 0) {
        setOrders(
          Array(6).fill({
            zav_town: "ЛЬВІВ",
            rozv_town: "МЮНХЕН",
            zay_num: "25733",
            zav_date: "2026-07-03",
            vant_name: "ПОБУТОВА ТЕХНІКА",
            vant_ton: 22,
            km: 1240,
            pr_type: "РЕФРИЖЕРАТОР",
            driver: "Олександр Коваль",
            time_left: "3 год 56хв",
          })
        );
      } else {
        setOrders(list);
      }
    }).finally(() => {
      setLoading(false);
    });
  }, [mid, activeTab]);

  const tabs = [
    { id: "I", label: "Імпорт", count: stats.I },
    { id: "E", label: "Експорт", count: stats.E },
    { id: "R", label: "Регіональні", count: stats.R },
  ];

  const filteredOrders = orders.filter((o) => {
    const route = `${o.zav_town} ${o.rozv_town}`.toLowerCase();
    const num = String(o.zay_num || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    return route.includes(query) || num.includes(query);
  });
  console.log(stats)
  return (
    <div className="flex flex-col gap-5 w-full  mx-auto pb-10">
      <div className="flex items-center gap-4 pt-2">
        <button className="flex items-center gap-2 px-5 h-[42px] bg-white dark:bg-slate-800 text-[#5168D9] dark:text-[#849CC8] rounded-[15px] border border-[#C5D3F0] dark:border-slate-700 shadow-sm hover:bg-[#f4f7ff] dark:hover:bg-slate-700 transition-all font-semibold text-[14px]">
          <Filter className="w-4 h-4" />
          Фільтри
        </button>

        <div className="flex-1 relative h-[42px]">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-[#849CC8]" />
          </div>
          <input
            type="text"
            placeholder="Пошук за маршрутом чи номером замовлення . . ."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-full pl-11 pr-4 bg-[#EAF1FD] dark:bg-slate-800/60 border border-[#B8CCF0] dark:border-slate-700/80 rounded-[15px] text-[14px] font-medium focus:outline-none focus:border-[#5168D9] focus:ring-1 focus:ring-[#5168D9] transition-all text-[#5168D9] dark:text-slate-200 placeholder:text-[#849CC8] placeholder:underline"
          />
        </div>
      </div>

      <div className="flex items-center bg-[#DDE6F9] dark:bg-slate-800 p-1.5 rounded-full border border-[#C5D3F0] dark:border-slate-700 w-full gap-2 shadow-inner">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 text-center text-[14px] font-semibold rounded-full transition-all duration-300
                ${isActive
                  ? "bg-[#5168D9] text-white shadow-md"
                  : "bg-white dark:bg-slate-700 text-[#849CC8] dark:text-slate-300 border border-[#CDE0FA] dark:border-slate-600 hover:bg-[#f4f7ff] dark:hover:bg-slate-600"
                }`}
            >
              {tab.label} {tab.count}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-4 mt-2">
        {loading ? (
          <div className="flex justify-center p-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order, idx) => (
            <OrderCard key={order.kod_zay || idx} order={order} />
          ))
        ) : (
          <div className="text-center py-16 text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 font-medium">
            Замовлень не знайдено
          </div>
        )}
      </div>
    </div>
  );
}
