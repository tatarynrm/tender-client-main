"use client";
import React, { useEffect, useState } from "react";
import { Users, ShoppingBag, Globe, Zap } from "lucide-react";
import { StatsCard } from "./main-page-components/StatsCard";
import {
  DistributionBarChart,
  TendersAreaChart,
} from "@/shared/components/Charts/Charts";
import Loader from "@/shared/components/Loaders/MainLoader";
import { HeaderWidgetContainer } from "@/features/log/main/widgets/HeaderWidgetContainer";

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
    <div className="space-y-4 animate-in fade-in duration-700">
      <HeaderWidgetContainer/>
    </div>
  );
}
