"use client";

import {
  TendersAreaChart,
  DistributionBarChart,
} from "@/shared/components/Charts/Charts";
import { useFontSize } from "@/shared/providers/FontSizeProvider";
import { cn } from "@/shared/utils";
import {
  TrendingUp,
  Users,
  Building2,
  LayoutDashboard,
  UserCheck,
  Clock,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { CustomTooltip } from "@/shared/components/Charts/CustomTooltip";

export default function AdminDashboard() {
  const { config } = useFontSize();
  const { title, main, label, icon: iconSize } = config;

  // Дані для карток статистики
  const stats = [
    {
      label: "Очікують підтвердження",
      value: "12",
      description: "Нові користувачі",
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
    },
    {
      label: "Нові компанії",
      value: "8",
      description: "За останні 24 год",
      icon: Building2,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      label: "Активні сесії",
      value: "142",
      description: "Користувачі online",
      icon: UserCheck,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
    {
      label: "Тикети підтримки",
      value: "3",
      description: "Потребують уваги",
      icon: AlertCircle,
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
      borderColor: "border-rose-500/20",
    },
  ];

  // Дані для графіків (твої попередні)
  const usersGrowth = [
    { month: "Січ", count: 100 },
    { month: "Лют", count: 230 },
    { month: "Бер", count: 420 },
    { month: "Кві", count: 600 },
    { month: "Тра", count: 720 },
    { month: "Чер", count: 900 },
  ];

  const revenueStats = [
    { name: "Січ", value: 12000 },
    { name: "Лют", value: 15000 },
    { name: "Бер", value: 18000 },
    { name: "Кві", value: 21000 },
    { name: "Тра", value: 19000 },
    { name: "Чер", value: 25000 },
  ];

  return (
    <div className="p-1 pb-10 lg:p-1 lg:pb-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-[1600px] mx-auto">
      {/* Хедер */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-teal-500/10 dark:bg-teal-400/10 rounded-2xl border border-teal-100 dark:border-teal-400/20">
            <LayoutDashboard
              className="text-teal-600 dark:text-teal-400"
              size={iconSize + 6}
            />
          </div>
          <div>
            <h1
              className={cn(
                "font-black tracking-tight text-slate-900 dark:text-white",
                title
              )}
            >
              Адмін-панель
            </h1>
            <p className={cn("text-slate-500 font-medium", label)}>
              Системний моніторинг та керування запитами
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400">
          <ShieldCheck size={iconSize} />
          <span className={cn("font-bold", label)}>Система стабільна</span>
        </div>
      </div>

      {/* КАРТКИ СТАТИСТИКИ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, index) => (
          <div
            key={index}
            className={cn(
              "relative overflow-hidden p-6 rounded-[2rem] border transition-all duration-300 hover:scale-[1.02]",
              "bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl shadow-sm",
              item.borderColor
            )}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-3 rounded-2xl", item.bgColor, item.color)}>
                <item.icon size={iconSize + 4} />
              </div>
              <div
                className={cn(
                  "font-black text-slate-900 dark:text-white",
                  title
                )}
              >
                {item.value}
              </div>
            </div>
            <div>
              <p
                className={cn(
                  "font-bold text-slate-500 dark:text-slate-400",
                  label
                )}
              >
                {item.label}
              </p>
              <p
                className={cn(
                  "text-[10px] uppercase tracking-wider font-black opacity-50 dark:text-slate-500",
                  label
                )}
              >
                {item.description}
              </p>
            </div>
            {/* Фонова декоративна іконка */}
            <item.icon
              className="absolute -bottom-4 -right-4 opacity-[0.03] dark:opacity-[0.05]"
              size={100}
            />
          </div>
        ))}
      </div>

      {/* Графіки (Area та Bar) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <TendersAreaChart data={usersGrowth} label="Динаміка реєстрацій" />
        <DistributionBarChart
          data={revenueStats}
          label="Фінансова активність ($)"
        />
      </div>

      {/* Нижня секція з PieChart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <TendersAreaChart label="Тендерна активність" data={usersGrowth} />
        </div>
        <div className="lg:col-span-4 bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 rounded-[2.5rem] shadow-sm">
          <h3
            className={cn(
              "text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-6 font-bold",
              label
            )}
          >
            Розподіл компаній
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Перевізники", value: 300 },
                    { name: "Експедитори", value: 200 },
                    { name: "Вантажовідправники", value: 150 },
                  ]}
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {["#3b82f6", "#8b5cf6", "#f59e0b"].map((color, i) => (
                    <Cell key={i} fill={color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
