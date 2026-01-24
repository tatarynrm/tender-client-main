"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useFontSize } from "@/shared/providers/FontSizeProvider";
import { cn } from "@/shared/utils";
import api from "@/shared/api/instance.api";
import { CustomTooltip } from "@/shared/components/Charts/CustomTooltip";
import { RotateCcw } from "lucide-react";
import { ManagerSelect } from "@/shared/ict_components/managers/ManagerList";

const BarChartCountry = ({ label }: { label?: string }) => {
  const [data, setData] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const defaultStartDate = new Date(
    new Date().setMonth(new Date().getMonth() - 1),
  )
    .toISOString()
    .split("T")[0];
  const defaultEndDate = new Date().toISOString().split("T")[0];

  const [startDate, setStartDate] = useState<string>(defaultStartDate);
  const [endDate, setEndDate] = useState<string>(defaultEndDate);

  // Змінюємо тип на number | null. null буде відповідати значенню "Всі"
  const [userId, setUserId] = useState<number | null>(null);

  const { config } = useFontSize();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get("/crm/users/managers");
        if (data && data.length > 0) {
          // Переконуємося, що ID менеджерів з бази — це числа
          setUsers(data);
        } else {
          throw new Error("Empty users list");
        }
      } catch (e) {
        console.warn("Менеджерів не завантажено, створюємо фейковий список");
        const fakeUsers = Array.from({ length: 20 }, (_, i) => ({
          id: i + 1, // Числове ID
          name: `Менеджер ${i + 1}`,
        }));
        setUsers(fakeUsers);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const { data: responseData } = await api.get(
          "/crm/statistic/stats-country",
          {
            params: {
              startDate,
              endDate,
              // Передаємо число або undefined, щоб параметр не йшов у запит взагалі
              id_usr: userId !== null ? userId : undefined,
            },
          },
        );

        if (responseData?.countries) {
          const formattedData = responseData.countries
            .map((item: any) => {
              const countryCode = Object.keys(item)[0];
              const stats = item[countryCode];
              return {
                name: stats.country_name,
                Додано: stats.add,
                Закрито: stats.close,
                Скасовано: stats.cancel,
              };
            })
            .sort((a: any, b: any) => b["Додано"] - a["Додано"]);
          setData(formattedData);
        }
      } catch (error) {
        console.error("Error fetching country stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [startDate, endDate, userId]);

  const handleReset = () => {
    setStartDate(defaultStartDate);
    setEndDate(defaultEndDate);
    setUserId(null); // Скидаємо до null
  };

  const dynamicHeight = Math.max(220, data.length * 50);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-4 rounded-xl shadow-sm">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center">
          <h3
            className={cn(
              config.label,
              "text-[10px] text-slate-400 uppercase tracking-wider font-bold",
            )}
          >
            {label || "Статистика по країнах"}
          </h3>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-600 transition-colors"
          >
            <RotateCcw size={12} />
            Скинути
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ManagerSelect
            value={userId}
            onChange={setUserId}
            className="text-[10px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded px-2 py-1 outline-none text-slate-600 dark:text-slate-300 min-w-[140px] cursor-pointer"
          />
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-[10px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded px-2 py-1 outline-none text-slate-600 dark:text-slate-300 cursor-pointer"
            />
            <span className="text-slate-400 text-[10px]">до</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-[10px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded px-2 py-1 outline-none text-slate-600 dark:text-slate-300 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm italic">
          Завантаження даних...
        </div>
      ) : data.length === 0 ? (
        <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">
          За цей період даних немає
        </div>
      ) : (
        <div className="w-full overflow-y-auto overflow-x-hidden max-h-[400px] pr-2 scrollbar-thin">
          <div style={{ height: `${dynamicHeight}px`, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                barGap={2}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal
                  vertical={false}
                  stroke="#e2e8f0"
                  opacity={0.3}
                />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  width={90}
                  tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(148, 163, 184, 0.05)" }}
                />

                <Bar
                  dataKey="Додано"
                  fill="#60a5fa"
                  radius={[0, 4, 4, 0]}
                  barSize={8}
                  background={{ fill: "rgba(148, 163, 184, 0.05)", radius: 4 }}
                />
                <Bar
                  dataKey="Закрито"
                  fill="#34d399"
                  radius={[0, 4, 4, 0]}
                  barSize={8}
                  background={{ fill: "rgba(148, 163, 184, 0.05)", radius: 4 }}
                />
                <Bar
                  dataKey="Скасовано"
                  fill="#f87171"
                  radius={[0, 4, 4, 0]}
                  barSize={8}
                  background={{ fill: "rgba(148, 163, 184, 0.05)", radius: 4 }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarChartCountry;
