"use client";

import React from "react";
import { 
  Building, 
  FileText, 
  Download, 
  ChevronRight,
  ShieldCheck,
  CreditCard,
  History
} from "lucide-react";
import { Button, Input, Label, Switch } from "@/shared/components/ui";

export function ContractsTab() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* SECTION: ORGANIZATION REQUISITES */}
      <section className="p-8 rounded-[2.5rem] border border-zinc-200/60 dark:border-white/10 bg-white dark:bg-zinc-950/40 shadow-sm space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
          <Building className="w-64 h-64 -mr-20 -mt-20" />
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-800 dark:text-zinc-200">
              Реквізити організації
            </h2>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
              Офіційні дані для документообігу
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 relative z-10">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-zinc-500 ml-1 tracking-wider">Повна назва організації</Label>
              <Input defaultValue="ТОВАРИСТВО З ОБМЕЖЕНОЮ ВІДПОВІДАЛЬНІСТЮ 'ЛОГІТРАНС-ЗАХІД'" className="rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-white/5 font-bold text-zinc-700 dark:text-zinc-300 h-12" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-zinc-500 ml-1 tracking-wider">ЄДРПОУ</Label>
                <Input defaultValue="12345678" className="rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-white/5 font-mono h-12" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-zinc-500 ml-1 tracking-wider">ІПН</Label>
                <Input defaultValue="1234567890123" className="rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-white/5 font-mono h-12" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-zinc-500 ml-1 tracking-wider">Скорочена назва</Label>
              <Input defaultValue="ТОВ 'ЛТ-ЗАХІД'" className="rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-white/5 font-bold text-zinc-700 dark:text-zinc-300 h-12" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase text-zinc-500 ml-1 tracking-wider">Статус платника ПДВ</Label>
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/20">
                <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                  <CreditCard className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Платник ПДВ 20%</span>
              </div>
            </div>
          </div>
        </div>

        {/* E-DOCS FLOW */}
        <div className="pt-6 border-t border-zinc-100 dark:border-white/5 grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <div className="flex items-center justify-between p-5 rounded-3xl bg-zinc-50/30 dark:bg-white/5 border border-zinc-100 dark:border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm flex items-center justify-center border border-zinc-100 dark:border-white/5">
                <span className="text-blue-500 font-black text-xs">M</span>
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-zinc-700 dark:text-zinc-200">Компанія використовує ЕДО "M.E.Doc"</p>
                <p className="text-[9px] font-bold text-zinc-400 uppercase mt-0.5 tracking-wider">Автоматичне отримання документів</p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between p-5 rounded-3xl bg-zinc-50/30 dark:bg-white/5 border border-zinc-100 dark:border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm flex items-center justify-center border border-zinc-100 dark:border-white/5">
                <span className="text-purple-500 font-black text-xs">V</span>
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-zinc-700 dark:text-zinc-200">Компанія використовує ЕДО "Вчасно"</p>
                <p className="text-[9px] font-bold text-zinc-400 uppercase mt-0.5 tracking-wider">Цифровий підпис та архів</p>
              </div>
            </div>
            <Switch />
          </div>
        </div>
      </section>

      {/* SECTION: CARRIER CONTRACT */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <FileText className="w-5 h-5 text-indigo-600" />
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-800 dark:text-zinc-200">
            Договір з перевізником
          </h2>
        </div>

        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-[2.5rem] blur opacity-[0.08] group-hover:opacity-[0.15] transition duration-1000"></div>
          <div className="relative p-8 rounded-[2.5rem] border border-zinc-200/60 dark:border-white/10 bg-white dark:bg-zinc-950/40 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[1.5rem] bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center border border-zinc-100 dark:border-white/5 shadow-inner">
                <FileText className="w-8 h-8 text-indigo-500" />
              </div>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-x-8 gap-y-2">
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Номер договору</p>
                    <p className="text-sm font-black text-zinc-800 dark:text-zinc-100">0124/2024-ІСТ-З</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Дата укладання</p>
                    <p className="text-sm font-black text-zinc-800 dark:text-zinc-100">01.04.2024</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Термін дії</p>
                    <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">До 01.04.2025 (Безстроковий)</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 w-fit">
                  <History className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">Діючий договір</span>
                </div>
              </div>
            </div>

            <Button className="h-16 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[11px] flex items-center gap-3 shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
              <Download className="w-5 h-5" />
              Скачати договір
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
