"use client";

import { Card } from "@/shared/components/ui";
import { cn } from "@/shared/utils";
import { UserCircle2, Mail, Building2, ShieldAlert, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { IUserAccount } from "../../types/user.types";

interface UserCardProps {
  user: IUserAccount;
  isOnline: boolean;
}

export function UserCard({ user, isOnline }: UserCardProps) {
  const router = useRouter();

  const fullName =
    `${user.person?.surname || ""} ${user.person?.name || ""} ${user.person?.last_name || ""}`.trim() ||
    "Без імені";
  const companyName = user.company?.company_name || user.migrate_company || "Немає компанії";
  const role = user.person?.person_role;
  const isAdmin = role?.is_admin;
  const isManager = role?.is_manager;

  const roleText = isAdmin ? "Адмін" : isManager ? "Менеджер" : "Користувач";
  const roleColor = isAdmin
    ? "bg-rose-500/10 text-rose-600 border-rose-200 dark:border-rose-900"
    : isManager
    ? "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900"
    : "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700";

  return (
    <Card
      onClick={() => router.push(`/admin/users/edit/${user.id}`)}
      className={cn(
        "group relative flex flex-col rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 transition-all hover:ring-1 hover:ring-indigo-500/30 hover:shadow-lg cursor-pointer overflow-hidden active:scale-[0.98]",
        user.is_blocked && "opacity-75 grayscale-[0.2]"
      )}
    >
      {/* 🔹 Status Line */}
      <div
        className={cn(
          "absolute top-0 left-0 bottom-0 w-1.5",
          user.is_blocked ? "bg-red-500" : isAdmin ? "bg-red-500" : isManager ? "bg-blue-500" : "bg-emerald-500"
        )}
      />

      <div className="flex flex-col p-5 pl-6 gap-4 relative z-10">
        {/* Header: Avatar, Name & Role */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 group-hover:text-indigo-600 transition-colors">
                <UserCircle2 size={24} strokeWidth={2.5} />
              </div>
              {/* Online Indicator */}
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center">
                {isOnline && (
                  <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span
                  className={cn(
                    "relative inline-flex rounded-full h-3 w-3 border-2 border-white dark:border-zinc-950",
                    isOnline ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-600"
                  )}
                ></span>
              </span>
            </div>

            <div className="flex flex-col min-w-0 pr-2">
              <h4 className="text-[15px] font-bold text-slate-900 dark:text-slate-100 leading-snug truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {fullName}
              </h4>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">#{user.id}</span>
            </div>
          </div>
        </div>

        {/* Role Badge (absolute top right, moved below edit icon slightly or replacing it visually) */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <div
            className={cn("px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider shrink-0", roleColor)}
          >
            {roleText}
          </div>
        </div>

        {/* Info Rows */}
        <div className="flex flex-col gap-2.5 mt-2">
          <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400">
            <Mail size={15} className="opacity-70 shrink-0" />
            <span className="text-sm font-medium truncate">{user.email}</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400">
            <Building2 size={15} className="opacity-70 shrink-0" />
            <span className="text-sm font-medium truncate">{companyName}</span>
          </div>
        </div>

        {/* Blocked Badge / Edit Footer */}
        <div className="mt-1 flex items-center justify-between">
          {user.is_blocked ? (
            <div className="flex items-center gap-1.5 text-red-500 bg-red-500/10 px-2 py-1 rounded-lg w-fit">
              <ShieldAlert size={14} />
              <span className="text-[11px] font-bold uppercase tracking-wider">Заблоковано</span>
            </div>
          ) : (
            <div className="flex-1" />
          )}

          <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
              <Edit size={14} />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
