"use client";

import { AppTabs, TabOption } from "@/shared/components/Tabs/AppTabs";
import { useSearchParams } from "next/navigation";


// Конфігурація табів винесена окремо для чистоти
const routeTabs: TabOption[] = [
  { id: "main", label: "Основні" },
  { id: "finance", label: "Фінанси" },
  { id: "directions", label: "Напрямки" },
];

export default function RouteDetailsPage() {
  const searchParams = useSearchParams();
  
  // Отримуємо активний таб з URL (якщо порожньо — дефолт "main")
  const activeTab = searchParams.get("tab") || "main";

  return (
    <div className="w-full space-y-6">
      {/* Твій новий універсальний компонент */}
      <AppTabs tabs={routeTabs} queryParam="tab" />

      {/* Контент сторінки */}
      <div className="min-h-[300px]">
        {activeTab === "main" && (
          <TabContentWrapper>
            <MainSection />
          </TabContentWrapper>
        )}

        {activeTab === "finance" && (
          <TabContentWrapper>
            <FinanceSection />
          </TabContentWrapper>
        )}

        {activeTab === "directions" && (
          <TabContentWrapper>
            <DirectionsSection />
          </TabContentWrapper>
        )}
      </div>
    </div>
  );
}

// Допоміжний компонент для анімації появи контенту
const TabContentWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out">
    {children}
  </div>
);

// Секції (можна винести в окремі файли)
const MainSection = () => (
  <div className="p-6 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-white dark:bg-zinc-950/50">
    <h2 className="text-sm font-bold uppercase tracking-tighter text-zinc-800 dark:text-zinc-200 mb-4">
      Загальна інформація
    </h2>
    {/* Твій контент: інпути, форми тощо */}
  </div>
);

const FinanceSection = () => (
  <div className="p-6 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-white dark:bg-zinc-950/50">
    <h2 className="text-sm font-bold uppercase tracking-tighter text-zinc-800 dark:text-zinc-200 mb-4">
      Розрахунки та ставки
    </h2>
  </div>
);

const DirectionsSection = () => (
  <div className="p-6 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-white dark:bg-zinc-950/50">
    <h2 className="text-sm font-bold uppercase tracking-tighter text-zinc-800 dark:text-zinc-200 mb-4">
      Маршрут прямування
    </h2>
  </div>
);