"use client";

import { useFontSize } from "@/shared/providers/FontSizeProvider";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import { CustomTooltip } from "./CustomTooltip";
import { cn } from "@/shared/utils";

const ChartDefs = () => (
  <svg style={{ height: 0, width: 0, position: "absolute" }}>
    <defs>
      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
      </linearGradient>
    </defs>
  </svg>
);

export const TendersAreaChart = ({
  data,
  label,
}: {
  data: any[];
  label?: string;
}) => {
  const { config } = useFontSize();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-4 rounded-xl shadow-sm">
      <ChartDefs />
      <h3 className={cn(config.label, "text-[10px] text-slate-400 uppercase tracking-wider mb-4 font-bold")}>
        {label || "Динаміка тендерів"}
      </h3>
      <div className="h-[180px] w-full"> {/* Зменшено висоту з 300 до 180 */}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="currentColor"
              className="text-slate-100 dark:text-slate-800/50"
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 10 }}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#3b82f6", strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#areaGradient)"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const DistributionBarChart = ({
  data,
  label,
}: {
  data: any[];
  label?: string;
}) => {
  const { config } = useFontSize();

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-4 rounded-xl shadow-sm">
      <h3 className={cn(config.label, "text-[10px] text-slate-400 uppercase tracking-wider mb-4 font-bold")}>
        {label || "Розподіл перевезень"}
      </h3>
      <div className="h-[180px] w-full"> {/* Зменшено висоту */}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 10 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
            <Bar
              dataKey="value"
              fill="#048c7f"
              radius={[4, 4, 4, 4]} // Менший радіус для менших барів
              barSize={20} // Вужчі стовпчики
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};