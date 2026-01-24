import React from "react";
import { Metadata } from "next";

import { fetchServer } from "@/shared/server/fetchServer";
import { DashboardStats } from "@/features/log/types/crm.types";
import LogDashboardClientPage from "@/features/log/main/LogDashboardClientPage";

export const metadata: Metadata = {
  title: "Dashboard CRM",
  description: "Огляд активності користувачів CRM системи",
};

// Типізуємо відповідь API, яка містить об'єкт content
interface ApiResponse {
  count_all: DashboardStats;
  count_my: DashboardStats;
}

const LogDashboardPage = async () => {
  const response = await fetchServer.get<ApiResponse>("/crm/statistic/stats");

  const allStats = response?.count_all;
  const myStats = response?.count_my;

  if (!allStats || !myStats) {
    return (
      <div className="p-8 text-center text-slate-500">
        Помилка завантаження даних

        
      </div>
    );
  }

  return <LogDashboardClientPage allData={allStats} myData={myStats} />;
};

export default LogDashboardPage;
