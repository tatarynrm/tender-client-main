// @/shared/components/Charts/Charts.tsx
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

const ChartDefs = () => (
  <svg style={{ height: 0, width: 0, position: "absolute" }}>
    <defs>
      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
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
    <div className="bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 rounded-[2.5rem] shadow-sm transition-all duration-300">
      <ChartDefs />
      {/* Динамічний клас для заголовка */}
      <h3
        className={`${config.label} text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-6 font-bold`}
      >
        {label || "Графік"}
      </h3>
      <ResponsiveContainer
        width="100%"
        height={300}
        className="focus:outline-none"
      >
        <AreaChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-800"
          />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            dy={10}
            // Передаємо динамічний розмір шрифту в пікселях
            tick={{ fill: "#94a3b8", fontSize: config.icon * 0.75 }}
          />
          <YAxis hide />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{
              stroke: "#3b82f6",
              // strokeWidth: 2,
              // strokeDasharray: "5",
              fill: "transparent", // для BarChart можна додати легкий fill
            }}
          />

          <Area
            type="monotone"
            dataKey="count"
            stroke="#3b82f6"
            strokeWidth={4}
            fill="url(#areaGradient)"
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
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
  console.log(data, "DATA");

  return (
    <div className="bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 rounded-[2.5rem] shadow-sm transition-all duration-300">
      <h3
        className={`${config.label} text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-6 font-bold`}
      >
        {label || "Графік"}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            dy={10}
            // Передаємо динамічний розмір шрифту
            tick={{ fill: "#94a3b8", fontSize: config.icon * 0.75 }}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{
              fill: "transparent", // для BarChart можна додати легкий fill
            }}
          />
          <Bar
            dataKey="value"
            // fill="#8b5cf6"
            fill="#048c7f"
            radius={[12, 12, 12, 12]}
            barSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
