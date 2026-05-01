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
  ExternalLink,
  Edit2,
} from "lucide-react";
import { Button, Input, Label, Switch } from "@/shared/components/ui";
import { cn } from "@/shared/utils";
import { useCompanyUsers } from "../hooks/useCompanyUsers";
import { UserCreateModal } from "./UserCreateModal";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function GeneralTab() {
  const { users, isLoading } = useCompanyUsers();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | string | null>(
    null,
  );

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingUserId(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {(isCreateModalOpen || editingUserId) && (
        <UserCreateModal
          onClose={handleCloseModal}
          userId={editingUserId || undefined}
        />
      )}
      {/* SECTION: ADDRESSES */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-800 dark:text-zinc-200">
              Адреси
            </h2>
          </div>
          {/* <Button 
            variant="outline" 
            size="sm" 
            className="rounded-full border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-[10px] font-black uppercase tracking-widest h-9"
          >
            <Plus className="w-3.5 h-3.5 mr-2" />
            Додати адресу
          </Button> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6">
          {/* LEGAL ADDRESS */}
          <div className="md:col-span-4 p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-zinc-200/60 dark:border-white/10 bg-white dark:bg-zinc-950/40 shadow-sm space-y-5">
            <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400">
              Юридична адреса
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-zinc-500 ml-1">
                  Країна
                </Label>
                <Input
                  defaultValue="Україна"
                  className="rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-white/5"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-zinc-500 ml-1">
                  Область
                </Label>
                <Input
                  defaultValue="Київська область"
                  className="rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-white/5"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-zinc-500 ml-1">
                  Місто
                </Label>
                <Input
                  defaultValue="Київ"
                  className="rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-white/5"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-zinc-500 ml-1">
                  Вулиця та номер
                </Label>
                <Input
                  defaultValue="вул. Промислова, 10"
                  className="rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-white/5"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-zinc-500 ml-1">
                    Поштовий індекс
                  </Label>
                  <Input
                    defaultValue="01001"
                    className="rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-white/5"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase text-zinc-500 ml-1">
                    Сайт
                  </Label>
                  <div className="relative">
                    <Input
                      defaultValue="https://logitrans.ua"
                      className="rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-white/5 pr-8"
                    />
                    <ExternalLink className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PHYSICAL ADDRESS TOGGLE */}
          <div className="md:col-span-4 p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-zinc-200/60 dark:border-white/10 bg-white dark:bg-zinc-950/40 shadow-sm flex flex-col justify-between">
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
          <div className="md:col-span-4 p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-zinc-200/60 dark:border-white/10 bg-white dark:bg-zinc-950/40 shadow-sm space-y-5">
            <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400">
              Адреса для документів
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-zinc-500 ml-1">
                  Країна
                </Label>
                <Input
                  defaultValue="Україна"
                  className="rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-white/5"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-zinc-500 ml-1">
                  Область
                </Label>
                <Input
                  defaultValue="Львівська область"
                  className="rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-white/5"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-zinc-500 ml-1">
                  Місто
                </Label>
                <Input
                  defaultValue="Львів"
                  className="rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-white/5"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-zinc-500 ml-1">
                  Вулиця та номер
                </Label>
                <Input
                  defaultValue="вул. Франка, 3"
                  className="rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-white/5"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-zinc-500 ml-1">
                  Поштовий індекс
                </Label>
                <Input
                  defaultValue="79000"
                  className="rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-white/5"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: USERS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between flex-col gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-800 dark:text-zinc-200">
              Користувачі
            </h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="rounded-full border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-[10px] font-black uppercase tracking-widest h-9"
          >
            <Plus className="w-3.5 h-3.5 mr-2" />
            Додати користувача
          </Button>
        </div>

        <div className="overflow-x-auto rounded-[1.5rem] sm:rounded-[2rem] border border-zinc-200/60 dark:border-white/10 bg-white dark:bg-zinc-950/40 shadow-sm custom-scrollbar">
          <table className="w-full border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/30">
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Ім'я
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Роль
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Телефон
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Права доступу
                </th>
                <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Месенджери
                </th>
                <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Дії
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Завантаження списку...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : users?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      Користувачі не знайдені
                    </span>
                  </td>
                </tr>
              ) : (
                users?.map((user: any) => (
                  <tr
                    key={user.id}
                    className="hover:bg-zinc-50/50 dark:hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-indigo-500/20">
                          {user.person?.name?.substring(0, 1)}
                          {user.person?.surname?.substring(0, 1)}
                        </div>
                        <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                          {user.person?.surname} {user.person?.name}{" "}
                          {user.person?.last_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13px] font-medium text-zinc-600 dark:text-zinc-400">
                      {user.role_name || "Користувач"}
                    </td>
                    <td className="px-6 py-4 text-[13px] font-medium text-zinc-600 dark:text-zinc-400">
                      {user.person?.phone}
                    </td>
                    <td className="px-6 py-4 text-[13px] font-medium text-zinc-600 dark:text-zinc-400">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                          user.is_admin
                            ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700",
                        )}
                      >
                        {user.is_admin ? "Адміністратор" : "Користувач"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {user.person?.person_telegram ? (
                          <div
                            className="p-2 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-600"
                            title="Telegram підключено"
                          >
                            <MessageSquare size={14} />
                          </div>
                        ) : (
                          <div
                            className="p-2 rounded-lg bg-zinc-100 dark:bg-white/5 text-zinc-300"
                            title="Месенджери не підключені"
                          >
                            <MessageSquare size={14} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingUserId(user.id)}
                          className="h-8 w-8 p-0 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-zinc-400 hover:text-indigo-600 transition-colors"
                        >
                          <Edit2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
