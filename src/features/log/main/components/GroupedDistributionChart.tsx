"use client";

import React, { useRef } from "react";
import { useFontSize } from "@/shared/providers/FontSizeProvider";
import {
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
} from "recharts";
import { cn } from "@/shared/utils";
import { CustomTooltip } from "@/shared/components/Charts/CustomTooltip";

const CHART_COLORS = {
  added: "#0ea5e9",
  closed: "#10b981",
  canceled: "#f43f5e",
  pending: "#f59e0b",
};

export const GroupedDistributionChart = ({
  data,
  label,
}: {
  data: any[];
  label?: string;
}) => {
  const { config } = useFontSize();
  const scrollRef = useRef<HTMLDivElement>(null);

  const chartWidth = Math.max(data.length * 180, 800);

  const handleWheel = (e: React.WheelEvent) => {
    if (scrollRef.current) {
      if (e.deltaY !== 0) {
        scrollRef.current.scrollLeft += e.deltaY;
      }
    }
  };

  return (
    <div className="bg-white dark:bg-slate-950 border border-zinc-200 dark:border-white/5 p-6 rounded-[2.5rem] shadow-xl shadow-zinc-200/50 dark:shadow-none mb-6 overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <h3
          className={cn(
            config.label,
            "text-[12px] text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em] font-black",
          )}
        >
          {label}
        </h3>
        <span className="text-[9px] text-zinc-400 dark:text-zinc-600 uppercase font-bold tracking-widest hidden sm:block">
          Scroll ↔ to explore
        </span>
      </div>

      <div
        ref={scrollRef}
        onWheel={handleWheel}
        className={cn(
          "w-full overflow-x-auto pb-4 cursor-grab active:cursor-grabbing",
          "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800",
        )}
      >
        <div style={{ width: chartWidth }}>
          <BarChart
            width={chartWidth}
            height={400} // Збільшено загальну висоту, щоб вмістити назви
            data={data}
            barGap={8}
            barCategoryGap="35%"
            // Збільшено margin bottom до 60, щоб текст не обрізався
            margin={{ top: 10, right: 30, left: -20, bottom: 60 }}
          >
            <defs>
              {Object.entries(CHART_COLORS).map(([key, color]) => (
                <linearGradient
                  key={key}
                  id={`grad-${key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={color} stopOpacity={1} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.8} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              strokeDasharray="8 8"
              vertical={false}
              stroke="currentColor"
              className="text-zinc-100 dark:text-zinc-900"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              // Додаємо висоту для XAxis
              height={80}
              interval={0}
              // Налаштовуємо текст: додаємо width та перенос (break-all)
              tick={(props) => {
                const { x, y, payload } = props;
                return (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      x={0}
                      y={0}
                      dy={16}
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize={11}
                      fontWeight={700}
                      className="fill-zinc-500 dark:fill-zinc-400"
                    >
                      {/* Якщо назва дуже довга, можна її обрізати або залишити як є */}
                      {payload.value.length > 25
                        ? `${payload.value.substring(0, 22)}...`
                        : payload.value}
                    </text>
                  </g>
                );
              }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 500 }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(20, 184, 166, 0.03)" }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              iconSize={6}
              wrapperStyle={{
                fontSize: "10px",
                fontWeight: "800",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                paddingBottom: "40px",
              }}
            />
            // У вашому файлі з чартом змініть бари так:
            <Bar
              name="Додано"
              dataKey="Додано"
              fill="url(#grad-added)"
              stroke={CHART_COLORS.added} // Додайте це
              radius={[6, 6, 2, 2]}
              barSize={12}
            />
            <Bar
              name="Закрито"
              dataKey="Закрито"
              fill="url(#grad-closed)"
              stroke={CHART_COLORS.closed} // Додайте це
              radius={[6, 6, 2, 2]}
              barSize={12}
            />
            <Bar
              name="Скасовано"
              dataKey="Скасовано"
              fill="url(#grad-canceled)"
              stroke={CHART_COLORS.canceled} // Додайте це
              radius={[6, 6, 2, 2]}
              barSize={12}
            />
            <Bar
              name="В роботі"
              dataKey="В роботі"
              fill="url(#grad-pending)"
              stroke={CHART_COLORS.pending} // Додайте це
              radius={[6, 6, 2, 2]}
              barSize={12}
            />
          </BarChart>
        </div>
      </div>
    </div>
  );
};
