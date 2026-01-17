// @/app/dashboard/page.tsx

import DashboardContainer from "@/features/dashboard/main/DashboardMainPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Панель керування",
  description: "Статистика тендерів та користувачів системи",
};

export default function DashboardPage() {
  return (
    <main className="px-0 py-0 w-full  mx-auto">
      <DashboardContainer />
    </main>
  );
}
