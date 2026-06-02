"use client";

import React, { useState } from "react";
import {
  MapPin,
  Plus,
  Users,
  Send,
  Instagram,
  Facebook,
  Loader2,
} from "lucide-react";
import { Button } from "@/shared/components/ui";
import { useMyCompany } from "../hooks/useMyCompany";
import { useCompanyUsers } from "../hooks/useCompanyUsers";
import { UserCreateModal } from "./UserCreateModal";
import { useProfile } from "@/shared/hooks";
import { cn } from "@/shared/utils";

export function GeneralTab() {
  const { profile } = useProfile();
  const { users, isLoading: isUsersLoading } = useCompanyUsers();
  const { company, isLoading: isCompanyLoading } = useMyCompany(
    profile?.company?.migrate_id as number,
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | string | null>(null);

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingUserId(null);
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500 pb-10">
      {(isCreateModalOpen || editingUserId) && (
        <UserCreateModal
          onClose={handleCloseModal}
          userId={editingUserId || undefined}
        />
      )}
      
      {/* SECTION: ADDRESSES */}
      <section className="bg-white dark:bg-zinc-950 border border-[#D0DDF0] dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-slate-800 dark:text-zinc-200" />
            <h2 className="text-[13px] font-bold text-slate-800 dark:text-zinc-100 uppercase tracking-wide">
              Адреси
            </h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-[8px] border-[#4863D4] text-[#4863D4] hover:bg-blue-50 hover:text-[#4863D4] dark:border-blue-500/50 dark:text-blue-400 dark:hover:bg-blue-500/10 text-[12px] uppercase tracking-wide font-bold h-9 px-4 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Додати адресу
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEGAL ADDRESS CARD */}
          <div className="border border-[#D0DDF0] dark:border-zinc-800 rounded-[10px] p-6 flex flex-col bg-[#F8FAFF] dark:bg-zinc-900/50">
            <h3 className="text-[13px] font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wide mb-6">
              Юридична адреса
            </h3>
            <div className="relative">
              <div className="absolute -top-2 left-3 bg-[#F8FAFF] dark:bg-zinc-900 px-1 z-10">
                <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  Адреса
                </span>
              </div>
              <div className="border border-[#D0DDF0] dark:border-zinc-700 rounded-lg p-3.5 min-h-[50px] text-[14px] text-[#4863D4] dark:text-blue-400 font-medium bg-white dark:bg-zinc-950">
                {isCompanyLoading ? (
                  <Loader2 className="w-4 h-4 text-[#4863D4] animate-spin" />
                ) : (
                  company?.address_legal || "Дані відсутні"
                )}
              </div>
            </div>
          </div>

          {/* DOCUMENT ADDRESS CARD */}
          <div className="border border-[#D0DDF0] dark:border-zinc-800 rounded-[10px] p-6 flex flex-col bg-[#F8FAFF] dark:bg-zinc-900/50">
            <h3 className="text-[13px] font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wide mb-6">
              Адреса для документів
            </h3>
            <div className="relative">
              <div className="absolute -top-2 left-3 bg-[#F8FAFF] dark:bg-zinc-900 px-1 z-10">
                <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                  Адреса
                </span>
              </div>
              <div className="border border-[#D0DDF0] dark:border-zinc-700 rounded-lg p-3.5 min-h-[50px] text-[14px] text-[#4863D4] dark:text-blue-400 font-medium bg-white dark:bg-zinc-950">
                {isCompanyLoading ? (
                  <Loader2 className="w-4 h-4 text-[#4863D4] animate-spin" />
                ) : (
                  company?.address_fysical || company?.address_legal || "Дані відсутні"
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: USERS */}
      <section className="bg-white dark:bg-zinc-950 border border-[#D0DDF0] dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-800 dark:text-zinc-200" />
            <h2 className="text-[13px] font-bold text-slate-800 dark:text-zinc-100 uppercase tracking-wide">
              Користувачі
            </h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="rounded-[8px] border-[#4863D4] text-[#4863D4] hover:bg-blue-50 hover:text-[#4863D4] dark:border-blue-500/50 dark:text-blue-400 dark:hover:bg-blue-500/10 text-[12px] uppercase tracking-wide font-bold h-9 px-4 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Додати користувача
          </Button>
        </div>

        <div className="border border-[#D0DDF0] dark:border-zinc-800 rounded-[10px] overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-[#F8FAFF] dark:bg-zinc-900/50">
              <tr>
                <th className="py-4 px-6 text-[13px] font-bold text-slate-800 dark:text-zinc-200 border-b border-[#D0DDF0] dark:border-zinc-800">
                  Ім'я
                </th>
                <th className="py-4 px-6 text-[13px] font-bold text-slate-800 dark:text-zinc-200 border-b border-l border-[#D0DDF0] dark:border-zinc-800 text-center">
                  Роль
                </th>
                <th className="py-4 px-6 text-[13px] font-bold text-slate-800 dark:text-zinc-200 border-b border-l border-[#D0DDF0] dark:border-zinc-800 text-center">
                  Телефон
                </th>
                <th className="py-4 px-6 text-[13px] font-bold text-slate-800 dark:text-zinc-200 border-b border-l border-[#D0DDF0] dark:border-zinc-800 text-center">
                  Емейл
                </th>
                <th className="py-4 px-6 text-[13px] font-bold text-slate-800 dark:text-zinc-200 border-b border-l border-[#D0DDF0] dark:border-zinc-800 text-center">
                  Права Доступу
                </th>
                <th className="py-4 px-6 text-[13px] font-bold text-slate-800 dark:text-zinc-200 border-b border-l border-[#D0DDF0] dark:border-zinc-800 text-center">
                  Месенджери
                </th>
              </tr>
            </thead>
            <tbody>
              {isUsersLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-zinc-400">
                    Завантаження списку...
                  </td>
                </tr>
              ) : !users || users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-zinc-400">
                    Користувачі не знайдені
                  </td>
                </tr>
              ) : (
                users.map((user: any, idx: number) => {
                  const circleColors = [
                    "bg-[#4863D4]", // Blue
                    "bg-[#48D470]", // Green
                    "bg-[#F59E0B]", // Orange
                    "bg-[#8B5CF6]", // Purple
                  ];
                  const dotColor = circleColors[idx % circleColors.length];

                  return (
                    <tr
                      key={user.id}
                      className="border-b border-[#D0DDF0] dark:border-zinc-800 last:border-0 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                      onClick={() => setEditingUserId(user.id)}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <div className={cn("w-6 h-6 rounded-full shrink-0", dotColor)}></div>
                          <span className="text-[14px] text-[#4863D4] dark:text-blue-400 font-medium whitespace-nowrap">
                            {user.person?.surname} {user.person?.name} {user.person?.last_name}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-[14px] text-slate-500 dark:text-zinc-400 border-l border-[#D0DDF0] dark:border-zinc-800 text-center">
                        {user.role_name || "Користувач"}
                      </td>
                      <td className="py-4 px-6 text-[14px] text-slate-500 dark:text-zinc-400 border-l border-[#D0DDF0] dark:border-zinc-800 text-center whitespace-nowrap">
                        {user.person?.phone || "—"}
                      </td>
                      <td className="py-4 px-6 text-[14px] text-slate-500 dark:text-zinc-400 border-l border-[#D0DDF0] dark:border-zinc-800 text-center">
                        {user.email}
                      </td>
                      <td className="py-4 px-6 text-[14px] text-slate-500 dark:text-zinc-400 border-l border-[#D0DDF0] dark:border-zinc-800 text-center">
                        {user.is_admin ? "Адміністратор" : "Користувач"}
                      </td>
                      <td className="py-4 px-6 border-l border-[#D0DDF0] dark:border-zinc-800">
                        <div className="flex items-center justify-center gap-2.5">
                          {user.person?.person_telegram && (
                            <div className="w-[30px] h-[30px] rounded-[8px] bg-[#4863D4] flex items-center justify-center text-white shadow-sm hover:opacity-90 transition-opacity">
                              <Send size={15} className="-ml-0.5 mt-0.5" />
                            </div>
                          )}
                          <div className="w-[30px] h-[30px] rounded-[8px] bg-[#4863D4] flex items-center justify-center text-white shadow-sm hover:opacity-90 transition-opacity">
                            <Instagram size={16} />
                          </div>
                          <div className="w-[30px] h-[30px] rounded-[8px] bg-[#4863D4] flex items-center justify-center text-white shadow-sm hover:opacity-90 transition-opacity">
                            <Facebook size={16} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
