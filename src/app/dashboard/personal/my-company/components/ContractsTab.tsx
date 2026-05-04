"use client";

import React from "react";
import {
  Building,
  FileText,
  Download,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  History,
} from "lucide-react";
import { Button, Input, Label, Switch, Skeleton } from "@/shared/components/ui";
import { Loader2 } from "lucide-react";
import { useMyCompany } from "../hooks/useMyCompany";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { cn } from "@/shared/utils";
import { useProfile } from "@/shared/hooks";

export function ContractsTab() {
  const { profile } = useProfile();
  const { company, isLoading } = useMyCompany(
    profile?.company?.migrate_id as number,
  );

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      return format(new Date(dateStr), "dd.MM.yyyy", { locale: uk });
    } catch (e) {
      return dateStr;
    }
  };

  const currentYear = new Date().getFullYear();
  const isYearActive = (dateStr: string) => {
    if (!dateStr) return false;
    try {
      return new Date(dateStr).getFullYear() >= currentYear;
    } catch (e) {
      return false;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      {/* SECTION: ORGANIZATION REQUISITES */}
      <section className="p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-zinc-200/60 dark:border-white/10 bg-white dark:bg-zinc-950/40 shadow-sm space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
          <Building className="w-64 h-64 -mr-20 -mt-20" />
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
            <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-base font-black uppercase tracking-[0.2em] text-zinc-800 dark:text-zinc-100">
              Реквізити організації
            </h2>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
              Офіційні дані для документообігу
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-zinc-500 ml-1 tracking-wider">Повна назва організації</Label>
              <div className="p-4 rounded-2xl bg-zinc-50/50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 font-bold text-zinc-800 dark:text-zinc-200 text-sm leading-relaxed">
                {company?.company_name_full || company?.company_name || "-"}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-zinc-500 ml-1 tracking-wider">ЄДРПОУ</Label>
                <div className="p-4 rounded-2xl bg-zinc-50/50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 font-mono text-zinc-800 dark:text-zinc-200">
                  {company?.edrpou || "-"}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-zinc-500 ml-1 tracking-wider">ІПН</Label>
                <div className="p-4 rounded-2xl bg-zinc-50/50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 font-mono text-zinc-800 dark:text-zinc-200">
                  {company?.ipn || "-"}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-zinc-500 ml-1 tracking-wider">Скорочена назва</Label>
              <div className="p-4 rounded-2xl bg-zinc-50/50 dark:bg-white/5 border border-zinc-100 dark:border-white/5 font-bold text-zinc-800 dark:text-zinc-200">
                {company?.company_name || "-"}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-zinc-500 ml-1 tracking-wider">Статус платника ПДВ</Label>
              <div className={cn(
                "flex items-center gap-4 p-4 rounded-2xl border transition-colors",
                company?.pdv_status 
                  ? "bg-emerald-50/30 dark:bg-emerald-500/5 border-emerald-100/50 dark:border-emerald-500/20"
                  : "bg-zinc-50/50 dark:bg-white/5 border-zinc-100 dark:border-white/5"
              )}>
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm",
                  company?.pdv_status ? "bg-emerald-100 dark:bg-emerald-500/20" : "bg-zinc-100 dark:bg-zinc-800"
                )}>
                  <CreditCard className={cn("w-5 h-5", company?.pdv_status ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400")} />
                </div>
                <div>
                  <p className={cn(
                    "text-xs font-bold",
                    company?.pdv_status ? "text-emerald-700 dark:text-emerald-400" : "text-zinc-500"
                  )}>
                    {company?.pdv_status || "Невідомо"}
                  </p>
                  <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mt-0.5">Податковий статус</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* E-DOCS FLOW */}
        <div className="pt-8 border-t border-zinc-100 dark:border-white/5 grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <div className="flex items-center justify-between p-6 rounded-[2rem] bg-zinc-50/30 dark:bg-white/5 border border-zinc-100 dark:border-white/5 hover:bg-zinc-50/50 dark:hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm flex items-center justify-center border border-zinc-100 dark:border-white/5">
                <span className="text-blue-500 font-black text-sm">M</span>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-zinc-800 dark:text-zinc-200">EDO "M.E.Doc"</p>
                <p className="text-[10px] font-bold text-zinc-400 uppercase mt-1 tracking-wider">Автоматичне отримання</p>
              </div>
            </div>
            <Switch checked={!!company?.use_medoc} className="data-[state=checked]:bg-blue-500" />
          </div>

          <div className="flex items-center justify-between p-6 rounded-[2rem] bg-zinc-50/30 dark:bg-white/5 border border-zinc-100 dark:border-white/5 hover:bg-zinc-50/50 dark:hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm flex items-center justify-center border border-zinc-100 dark:border-white/5">
                <span className="text-purple-500 font-black text-sm">V</span>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-zinc-800 dark:text-zinc-200">EDO "Вчасно"</p>
                <p className="text-[10px] font-bold text-zinc-400 uppercase mt-1 tracking-wider">Цифровий підпис та архів</p>
              </div>
            </div>
            <Switch checked={!!company?.use_vchasno} className="data-[state=checked]:bg-purple-500" />
          </div>
        </div>
      </section>

      {/* SECTION: CARRIER CONTRACTS */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-[0.2em] text-zinc-800 dark:text-zinc-100">
                Договори з ICT
              </h2>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Перелік активних та архівних угод</p>
            </div>
          </div>
          {company?.contract && (
            <div className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-white/5 text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-tighter">
              Всього: {company.contract.length}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6">
          {isLoading ? (
            <div className="p-20 border border-zinc-100 dark:border-white/5 rounded-[3rem] bg-white dark:bg-zinc-950/40 flex flex-col items-center gap-5">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Завантаження договорів...</span>
            </div>
          ) : !company?.contract || company.contract.length === 0 ? (
            <div className="p-20 border border-zinc-200 border-dashed rounded-[3rem] flex flex-col items-center gap-5 text-center">
              <div className="w-20 h-20 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center border border-zinc-100 dark:border-white/5 shadow-inner">
                <History className="w-10 h-10 text-zinc-300" />
              </div>
              <div>
                <p className="text-sm font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">Договори не знайдені</p>
                <p className="text-xs font-bold text-zinc-400 mt-1">Зверніться до менеджера для укладання договору</p>
              </div>
            </div>
          ) : (
            company.contract.map((contract: any, idx: number) => {
              const active = isYearActive(contract.termin);
              return (
                <div key={idx} className="group relative">
                  <div className={cn(
                    "absolute -inset-0.5 rounded-[2rem] blur opacity-[0.05] group-hover:opacity-[0.12] transition duration-1000",
                    active ? "bg-gradient-to-r from-indigo-500 to-emerald-500" : "bg-zinc-500"
                  )}></div>
                  <div className="relative p-6 sm:p-8 rounded-[2rem] border border-zinc-200/60 dark:border-white/10 bg-white dark:bg-zinc-950/40 shadow-sm transition-all hover:translate-y-[-2px]">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                      <div className={cn(
                        "w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center border shadow-inner transition-colors",
                        active 
                          ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20" 
                          : "bg-zinc-50 dark:bg-white/5 border-zinc-100 dark:border-white/5"
                      )}>
                        <FileText className={cn("w-8 h-8", active ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400")} />
                      </div>
                      
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Фірма</p>
                          <p className="text-sm font-black text-zinc-800 dark:text-zinc-100 leading-tight">{contract.firma}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Номер договору</p>
                          <p className="text-sm font-black text-zinc-800 dark:text-zinc-100">{contract.number}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Дата укладання</p>
                          <p className="text-sm font-black text-zinc-800 dark:text-zinc-100">{formatDate(contract.date)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Термін дії</p>
                          <p className={cn(
                            "text-sm font-black", 
                            active ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-500"
                          )}>
                            {formatDate(contract.termin)}
                          </p>
                        </div>
                      </div>

                      {active && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 w-fit shrink-0 self-start lg:self-center animate-in zoom-in duration-500">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-[10px] font-black uppercase tracking-[0.1em] text-emerald-700 dark:text-emerald-400">Діючий договір</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
