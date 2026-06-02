"use client";

import React from "react";
import { Handshake, ChevronDown, Download, BarChart2 } from "lucide-react";
import { useMyCompany } from "../hooks/useMyCompany";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { useProfile } from "@/shared/hooks";

const InfoField = ({
  label,
  value,
  isSelect = false,
  className = "",
}: {
  label: string;
  value: string | undefined | null;
  isSelect?: boolean;
  className?: string;
}) => {
  return (
    <div
      className={`relative border border-[#D0DDF0] dark:border-zinc-800 rounded-[8px] p-2.5 bg-white dark:bg-zinc-950 flex items-center justify-between min-h-[42px] ${className}`}
    >
      <span className="absolute -top-[9px] left-3 bg-white dark:bg-zinc-950 px-1 text-[8px] sm:text-[9px] font-bold text-[#8DA4D0] dark:text-zinc-500 uppercase tracking-wide">
        {label}
      </span>
      <span className="text-[14px] sm:text-[15px] font-medium text-slate-800 dark:text-zinc-200 ml-1">
        {value || ""}
      </span>
      {isSelect && <ChevronDown className="w-4 h-4 text-slate-500" />}
    </div>
  );
};

export function ContractsTab() {
  const { profile } = useProfile();
  const { company } = useMyCompany(profile?.company?.migrate_id as number);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      return format(new Date(dateStr), "dd.MM.yyyy", { locale: uk });
    } catch (e) {
      return dateStr;
    }
  };

  const contracts =
    company?.contracts && company.contracts.length > 0
      ? company.contracts
      : [{ number: "0124", date: "2026-04-01" }];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* SECTION: ORGANIZATION REQUISITES */}
      <section className="p-5 sm:p-6 rounded-2xl border border-[#D0DDF0] dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <BarChart2 className="w-5 h-5 text-slate-800 dark:text-zinc-200" />
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800 dark:text-zinc-100">
            Інформація про організацію
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
          <InfoField
            label="Повна назва організації"
            value={company?.company_name_full || company?.company_name || "ICT - Захід"}
          />
          <InfoField
            label="Організаційно правова форма"
            value={company?.opf || "ТДЕП"}
            isSelect
          />
          <InfoField
            label="Код ЄДРПОУ"
            value={company?.edrpou || "12345678"}
          />
          <InfoField
            label="Податковий статус"
            value={company?.pdv_status || "платник ПДВ"}
            isSelect
          />
          <div className="md:col-span-2">
            <InfoField
              label="Індивідуальний податковий номер (ЄДРПО)"
              value={company?.ipn || "123456789123"}
            />
          </div>
        </div>
      </section>

      {/* SECTION: CARRIER CONTRACTS */}
      {contracts.map((contract: any, idx: number) => (
        <section
          key={idx}
          className="p-5 sm:p-6 rounded-2xl border border-[#D0DDF0] dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm space-y-6"
        >
          <div className="flex items-center gap-3">
            <Handshake className="w-6 h-6 text-slate-800 dark:text-zinc-200" />
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800 dark:text-zinc-100">
              Договір з перевізником
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column - Contract Details */}
            <div className="flex flex-col gap-5">
              <InfoField
                label="№ договору"
                value={contract.number || "0124"}
              />
              <InfoField
                label="Дата"
                value={contract.date ? formatDate(contract.date) : "01.04.2026"}
              />
            </div>

            {/* Right Column - Download Button */}
            <div className="h-full">
              <button
                disabled
                className="w-full h-full min-h-[100px] rounded-[10px] border border-[#4863D4] bg-[#F8FAFF] dark:bg-zinc-900/50 flex flex-col items-center justify-center gap-2 text-[#4863D4] dark:text-blue-400 opacity-60 cursor-not-allowed transition-opacity"
              >
                <Download className="w-6 h-6" />
                <span className="text-[13px] font-bold uppercase tracking-wide">
                  Скачати договір
                </span>
              </button>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
