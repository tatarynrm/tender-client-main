"use client";

import { useSearchParams } from "next/navigation";
import { AppTabs, TabOption } from "@/shared/components/Tabs/AppTabs";
import { FileStack } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { CompanyDocsTab } from "./components/CompanyDocsTab";
import { LicensesTab } from "./components/LicensesTab";
import { ContractsDocsTab } from "./components/ContractsDocsTab";

const documentsTabs: TabOption[] = [
  { id: "company_docs", label: "Документи компанії" },
  { id: "licenses", label: "Ліцензії" },
  { id: "contracts", label: "Договори" },
];

export default function MyDocumentsPage() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "company_docs";

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center gap-3 mb-2">
        <FileStack className="w-6 h-6 text-zinc-800 dark:text-zinc-200" />
        <h1 className="text-xl lg:text-2xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">
          Документи
        </h1>
      </div>

      <div className="flex items-center gap-2 bg-zinc-100/50 dark:bg-white/5 p-1 rounded-2xl border border-zinc-200/50 dark:border-white/10">
        <AppTabs tabs={documentsTabs} queryParam="tab" />
      </div>

      <div className="min-h-[500px]">
        <AnimatePresence mode="wait">
          {activeTab === "company_docs" && (
            <TabContentWrapper key="company_docs">
              <CompanyDocsTab />
            </TabContentWrapper>
          )}
          {activeTab === "licenses" && (
            <TabContentWrapper key="licenses">
              <LicensesTab />
            </TabContentWrapper>
          )}
          {activeTab === "contracts" && (
            <TabContentWrapper key="contracts">
              <ContractsDocsTab />
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
