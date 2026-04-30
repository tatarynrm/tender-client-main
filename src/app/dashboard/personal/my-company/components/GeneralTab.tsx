"use client";

import React from "react";
import { 
  MapPin, 
  Plus, 
  UserPlus, 
  MessageSquare, 
  Mail, 
  Phone,
  ShieldCheck,
  ExternalLink
} from "lucide-react";
import { Button, Input, Label, Switch } from "@/shared/components/ui";
import { cn } from "@/shared/utils";

const USERS_DATA = [
  {
    id: 1,
    name: "Роман Скочилис",
    role: "Логіст",
    phone: "+380675305913",
    email: "kjf@gmail.com",
    access: "Адміністратор",
    avatar: "РС"
  },
  {
    id: 2,
    name: "Роман Татарин",
    role: "Адміністратор",
    phone: "+380957140147",
    email: "dfghfgb@gmail.com",
    access: "Користувач",
    avatar: "РТ"
  }
];

export function GeneralTab() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* SECTION: ADDRESSES */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-800 dark:text-zinc-200">
              Адреси
            </h2>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-full border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-[10px] font-black uppercase tracking-widest h-9"
          >
            <Plus className="w-3.5 h-3.5 mr-2" />
            Додати адресу
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* LEGAL ADDRESS */}
          <div className="md:col-span-4 p-6 rounded-[2rem] border border-zinc-200/60 dark:border-white/10 bg-white dark:bg-zinc-950/40 shadow-sm space-y-5">
            <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400">
              Юридична адреса
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-zinc-500 ml-1">Країна</Label>
                <Input defaultValue="Україна" className="rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-white/5" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-zinc-500 ml-1">Область</Label>
                <Input defaultValue="Київська область" className="rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-white/5" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-zinc-500 ml-1">Місто</Label>
                <Input defaultValue="Київ" className="rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-white/5" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-zinc-500 ml-1">Вулиця та номер</Label>
                <Input defaultValue="вул. Промислова, 10" className="rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-white/5" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-zinc-500 ml-1">Поштовий індекс</Label>
                  <Input defaultValue="01001" className="rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-white/5" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-zinc-500 ml-1">Сайт</Label>
                  <div className="relative">
                    <Input defaultValue="https://logitrans.ua" className="rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-white/5 pr-8" />
                    <ExternalLink className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PHYSICAL ADDRESS TOGGLE */}
          <div className="md:col-span-4 p-6 rounded-[2rem] border border-zinc-200/60 dark:border-white/10 bg-white dark:bg-zinc-950/40 shadow-sm flex flex-col justify-between">
            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400">
                Фактична адреса
              </h3>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100/50 dark:border-indigo-500/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <Label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer">
                    Співпадає з юридичною адресою
                  </Label>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
            
            <div className="mt-8 p-6 rounded-[1.5rem] bg-zinc-50/50 dark:bg-zinc-900/50 border border-dashed border-zinc-200 dark:border-white/10 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center">
                <MapPin className="w-5 h-5 text-zinc-400" />
              </div>
              <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 max-w-[200px]">
                Фізична адреса співпадає з юридичною адресою компанії
              </p>
            </div>
          </div>

          {/* DOCUMENT ADDRESS */}
          <div className="md:col-span-4 p-6 rounded-[2rem] border border-zinc-200/60 dark:border-white/10 bg-white dark:bg-zinc-950/40 shadow-sm space-y-5">
            <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400">
              Адреса для документів
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-zinc-500 ml-1">Країна</Label>
                <Input defaultValue="Україна" className="rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-white/5" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-zinc-500 ml-1">Область</Label>
                <Input defaultValue="Львівська область" className="rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-white/5" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-zinc-500 ml-1">Місто</Label>
                <Input defaultValue="Львів" className="rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-white/5" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-zinc-500 ml-1">Вулиця та номер</Label>
                <Input defaultValue="вул. Франка, 3" className="rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-white/5" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-zinc-500 ml-1">Поштовий індекс</Label>
                <Input defaultValue="79000" className="rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-white/5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: USERS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-800 dark:text-zinc-200">
              Користувачі
            </h2>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-full border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-[10px] font-black uppercase tracking-widest h-9"
          >
            <Plus className="w-3.5 h-3.5 mr-2" />
            Додати користувача
          </Button>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-zinc-200/60 dark:border-white/10 bg-white dark:bg-zinc-950/40 shadow-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/30">
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Ім'я</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Роль</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Телефон</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Email</th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Права доступу</th>
                <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-zinc-400">Месенджери</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
              {USERS_DATA.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-50/50 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-indigo-500/20">
                        {user.avatar}
                      </div>
                      <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[13px] font-medium text-zinc-600 dark:text-zinc-400">{user.role}</td>
                  <td className="px-6 py-4 text-[13px] font-medium text-zinc-600 dark:text-zinc-400">{user.phone}</td>
                  <td className="px-6 py-4 text-[13px] font-medium text-zinc-600 dark:text-zinc-400">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      user.access === "Адміністратор" 
                        ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700"
                    )}>
                      {user.access}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors">
                        <Mail className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors">
                        <Phone className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
