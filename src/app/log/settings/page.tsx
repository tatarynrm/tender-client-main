"use client";

import { useSearchParams } from "next/navigation";
import { AppTabs, TabOption } from "@/shared/components/Tabs/AppTabs";
import { Settings, User, Bell, Shield } from "lucide-react";
import { NotificationsTab } from "@/features/dashboard/notifications/ui/NotificationTab";

const settingsTabs: TabOption[] = [
  { id: "profile", label: "Профіль" },
  { id: "notifications", label: "Сповіщення" },
  { id: "security", label: "Безпека" },
];

export default function LogSettingsPage() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "profile";

  return (
    <div className="w-full space-y-6 p-4 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
          <Settings className="w-6 h-6 text-zinc-800 dark:text-zinc-200" />
        </div>
        <h1 className="text-xl lg:text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
          Налаштування системи
        </h1>
      </div>

      <AppTabs tabs={settingsTabs} queryParam="tab" />

      <div className="mt-6">
        {activeTab === "notifications" ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
            <NotificationsTab />
          </div>
        ) : (
          <TabContentWrapper>
            <PlaceholderSection
              title={
                settingsTabs.find((t) => t.id === activeTab)?.label ||
                "Налаштування"
              }
              icon={getTabIcon(activeTab)}
            />
          </TabContentWrapper>
        )}
      </div>
    </div>
  );
}

const getTabIcon = (id: string) => {
  switch (id) {
    case "profile":
      return <User className="w-8 h-8 lg:w-10 lg:h-10" />;
    case "notifications":
      return <Bell className="w-8 h-8 lg:w-10 lg:h-10" />;
    case "security":
      return <Shield className="w-8 h-8 lg:w-10 lg:h-10" />;
    default:
      return <Settings className="w-8 h-8 lg:w-10 lg:h-10" />;
  }
};

const TabContentWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
    {children}
  </div>
);

const PlaceholderSection = ({
  title,
  icon,
}: {
  title: string;
  icon: React.ReactNode;
}) => (
  <div className="relative overflow-hidden flex flex-col items-center justify-center p-12 lg:p-24 border border-zinc-200 dark:border-white/10 rounded-3xl lg:rounded-[2rem] bg-white/50 dark:bg-zinc-950/40 backdrop-blur-2xl shadow-sm group">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

    <div className="relative z-10 flex flex-col items-center text-zinc-400 dark:text-zinc-500 gap-4 transition-transform duration-500 group-hover:scale-105 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
      <div className="p-4 bg-zinc-50 dark:bg-white/5 rounded-full shadow-inner border border-zinc-100 dark:border-white/5">
        {icon}
      </div>
      <div className="text-center space-y-1">
        <h2 className="text-lg lg:text-xl font-black uppercase tracking-tighter text-zinc-700 dark:text-zinc-200">
          {title}
        </h2>
        <p className="text-xs lg:text-sm font-medium max-w-sm text-zinc-500 dark:text-zinc-400">
          Цей розділ наразі перебуває в стадії розробки. Незабаром тут
          з'являться необхідні дані.
        </p>
      </div>

      <div className="mt-6 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 shadow-sm">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>
        <span className="text-[9px] lg:text-[10px] uppercase font-black tracking-widest leading-none mt-[1px]">
          У розробці
        </span>
      </div>
    </div>
  </div>
);
