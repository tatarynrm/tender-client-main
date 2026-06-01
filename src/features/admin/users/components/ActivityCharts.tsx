"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { IUserActivity } from "@/shared/types/user.types";
import { translateActivityPath, translateAction } from "@/shared/utils/activity.utils";

const COLORS = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#10b981', '#3b82f6'];

interface ActivityChartsProps {
  activities: IUserActivity[];
}

export function ActivityCharts({ activities }: ActivityChartsProps) {
  const { pathData, actionData } = useMemo(() => {
    if (!activities || activities.length === 0) return { pathData: [], actionData: [] };

    const paths: Record<string, number> = {};
    const actions: Record<string, number> = {};

    activities.forEach((act) => {
      // For path distribution
      if (act.path) {
        const translated = translateActivityPath(act.path);
        paths[translated] = (paths[translated] || 0) + 1;
      }
      
      // For actions distribution
      const actionLabel = translateAction(act.action);
      actions[actionLabel] = (actions[actionLabel] || 0) + 1;
    });

    const pathData = Object.entries(paths)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // top 5

    const actionData = Object.entries(actions)
      .map(([name, value]) => ({ name, value }));

    return { pathData, actionData };
  }, [activities]);

  if (activities.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
      {pathData.length > 0 && (
        <div className="bg-white dark:bg-zinc-900/50 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            Популярні сторінки
          </h3>
          <div className="flex-1 flex flex-col items-center justify-center min-h-[220px]">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pathData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pathData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [value, "Кількість"]}
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#374151', fontSize: '13px', fontWeight: 600 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 justify-center w-full px-2">
              {pathData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="truncate max-w-[120px]" title={entry.name}>{entry.name}</span>
                  <span className="text-zinc-400 font-bold ml-0.5">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {actionData.length > 0 && (
        <div className="bg-white dark:bg-zinc-900/50 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pink-500" />
            Типи активності
          </h3>
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={actionData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.4} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 500 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 500 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  formatter={(value: number) => [value, "Кількість"]}
                  cursor={{ fill: '#f3f4f6', opacity: 0.5 }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#374151', fontSize: '13px', fontWeight: 600 }}
                />
                <Bar dataKey="value" fill="#ec4899" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
