"use client";
import React, { useEffect, useState } from "react";
import { Users, ShoppingBag, Globe, Zap } from "lucide-react";
import { StatsCard } from "./main-page-components/StatsCard";
import {
  DistributionBarChart,
  TendersAreaChart,
} from "@/shared/components/Charts/Charts";
import Loader from "@/shared/components/Loaders/MainLoader";

// Mock data (як у тебе була)
const mockData = {
  totalTenders: 24,
  totalEmployees: 15,
  totalClients: 8,
  totalCarriers: 6,
  monthlyTenders: [
    { month: "Січ", count: 2 },
    { month: "Лют", count: 5 },
    { month: "Бер", count: 3 },
    { month: "Квіт", count: 8 },
    { month: "Трав", count: 6 },
    { month: "Черв", count: 9 },
  ],
};

export default function DashboardContainer() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Імітація запиту
    setTimeout(() => setData(mockData), 500);
  }, []);

  if (!data) return <Loader />;

  return (
    <div className="space-y-1 animate-in fade-in duration-700">
      {/* Grid Картки */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Всього тендерів"
          value={data.totalTenders}
          icon={<ShoppingBag size={24} />}
          trend="12.5%"
          subValue="3 нові"
          description="2 активні зараз"
          targetProgress={75}
        />
        <StatsCard
          label="Працівники"
          value={data.totalEmployees}
          icon={<Users size={24} />}
          subValue="14 online"
          description="3 у відпустці"
          targetProgress={90}
        />
        <StatsCard
          label="Клієнти"
          value={data.totalClients}
          icon={<Globe size={24} />}
          trend="4.2%"
          description="LTV підвищено на 5%"
          targetProgress={45}
        />
        <StatsCard
          label="Перевізники"
          value={data.totalCarriers}
          icon={<Zap size={24} />}
          subValue="120 рейсів"
          description="98% успішних доставок"
          targetProgress={100}
        />
      </div>

      {/* Grid Графіки */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TendersAreaChart
          label="Активність ваших менеджерів"
          data={data.monthlyTenders}
        />
        <DistributionBarChart
          label="Загальна статистика по клієнтах"
          data={[
            { name: "Клієнти", value: data.totalClients },
            { name: "Перевізники", value: data.totalCarriers },
            { name: "Співробітники", value: data.totalEmployees },
          ]}
        />
      </div>
    </div>
  );
}
