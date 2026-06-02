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
    <div className="w-full space-y-2  animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="">
            <Building2 className="w-[38px] h-[38px] text-black dark:text-zinc-900" />
          </div>
          <div>
            <h1 className="text-xl lg:text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white uppercase ">
              Дані компанії
            </h1>
            {isLoading ? (
              <Skeleton className="h-4 w-48 mt-1" />
            ) : (
              <div className="flex flex-wrap items-center gap-2 mt-1">


              </div>
            )}
          </div>
        </div>
      </div>

      <AppTabs tabs={companyTabs} queryParam="tab" />

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
              <InformationTab
                transport={company?.transport}
                directions={company?.directions}
                isLoading={isLoading}
              />
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
