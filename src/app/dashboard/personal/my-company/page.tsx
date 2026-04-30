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

const companyTabs: TabOption[] = [
  { id: "general", label: "Місцезнаходження та контакти" },
  { id: "contracts", label: "Реквізити та договори" },
  { id: "information", label: "Інформація про організацію" },
];

export default function MyCompanyPage() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "general";

  return (
    <div className="w-full space-y-8  animate-in fade-in duration-700">
      <div className="flex items-center gap-3 mb-2">
        <Building2 className="w-6 h-6 text-zinc-800 dark:text-zinc-200" />
        <h1 className="text-xl lg:text-2xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">
          Дані компанії
        </h1>
      </div>
      <div className="flex items-center gap-2 bg-zinc-100/50 dark:bg-white/5 p-1 rounded-2xl border border-zinc-200/50 dark:border-white/10">
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
