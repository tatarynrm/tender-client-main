"use client";

import { useSearchParams } from "next/navigation";
import { AppTabs, TabOption } from "@/shared/components/Tabs/AppTabs";
import {
  Building2,
  Contact,
  Wallet,
  Truck,
  Map,
  Tag,
  FileText,
  Pickaxe,
} from "lucide-react";

import { GeneralTab } from "./components/GeneralTab";
import { ContractsTab } from "./components/ContractsTab";
import { InformationTab } from "./components/InformationTab";
import { AnimatePresence } from "framer-motion";
import { useMyCompany } from "./hooks/useMyCompany";
import { Skeleton } from "@/shared/components/ui";
import { useProfile } from "@/shared/hooks";

const companyTabs: TabOption[] = [
  { id: "general", label: "Місцезнаходження та контакти" },
  { id: "contracts", label: "Реквізити та договори" },
  { id: "information", label: "Інформація про організацію" },
];

export default function MyCompanyPage() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "general";
  const { profile } = useProfile();
  const { company, isLoading } = useMyCompany(profile?.company?.migrate_id as number);

  return (
    <div className="w-full space-y-8  animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 dark:bg-white flex items-center justify-center shadow-lg">
            <Building2 className="w-6 h-6 text-white dark:text-zinc-900" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">
              Дані компанії
            </h1>
            {isLoading ? (
              <Skeleton className="h-4 w-48 mt-1" />
            ) : (
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">
                  {company?.company_name || "Завантаження..."}
                </p>
                <div className="flex items-center gap-1.5 ml-2 border-l border-zinc-200 dark:border-white/10 pl-3">
                  {company?.is_client === 1 && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[8px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-500/20">
                      Клієнт
                    </span>
                  )}
                  {company?.is_carrier === 1 && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[8px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-500/20">
                      Перевізник
                    </span>
                  )}
                  {company?.is_expedition === 1 && (
                    <span className="px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[8px] font-black uppercase tracking-widest border border-purple-100 dark:border-purple-500/20">
                      Експедиція
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 bg-zinc-100/50 dark:bg-white/5 p-1 rounded-2xl border border-zinc-200/50 dark:border-white/10 overflow-x-auto custom-scrollbar">
        <AppTabs tabs={companyTabs} queryParam="tab" />
      </div>
      <div className="min-h-[500px]">
        <AnimatePresence mode="wait">
          {activeTab === "general" && (
            <TabContentWrapper key="general">
              <GeneralTab />
            </TabContentWrapper>
          )}
          {activeTab === "contracts" && (
            <TabContentWrapper key="contracts">
              <ContractsTab />
            </TabContentWrapper>
          )}
          {activeTab === "information" && (
            <TabContentWrapper key="information">
              <InformationTab />
            </TabContentWrapper>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const TabContentWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
    {children}
  </div>
);
