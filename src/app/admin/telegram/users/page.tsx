"use client";

import React from "react";
import { 
  Send, 
  Users, 
  ShieldCheck, 
  Truck, 
  MessageCircle,
  Search,
  ExternalLink,
  User as UserIcon,
  Building2,
  Mail,
  ShieldAlert
} from "lucide-react";
import { useAdminTelegramUsers } from "@/features/admin/hooks/useAdminTelegramUsers";
import { Button, Input } from "@/shared/components/ui";
import { cn } from "@/shared/utils";

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
    <div className={cn("p-3 rounded-xl", color)}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-black text-zinc-900 dark:text-white">{value}</p>
    </div>
  </div>
);

const TelegramUserItem = ({ user }: { user: any }) => {
  const fullName = `${user.surname || ""} ${user.name || ""} ${user.last_name || ""}`.trim() || user.tg_first_name || "Без імені";
  
  return (
    <div className="group relative flex items-center gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 transition-all hover:shadow-md overflow-hidden">
      {/* Status indicator bar */}
      <div className={cn(
        "absolute top-0 left-0 bottom-0 w-1",
        user.company_name?.includes("ICT") ? "bg-indigo-500" : "bg-emerald-500"
      )} />

      {/* Avatar & TG Info */}
      <div className="relative flex-shrink-0">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 group-hover:text-blue-600 transition-colors">
          <MessageCircle size={24} strokeWidth={2.5} />
        </div>
      </div>

      {/* Info Grid */}
      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-4 min-w-0">
          <div className="flex flex-col">
            <h4 className="text-[15px] font-bold text-slate-900 dark:text-slate-100 truncate flex items-center gap-2">
              {fullName}
              {user.username && (
                <span className="text-[10px] bg-blue-500/10 text-blue-600 px-1.5 py-0.5 rounded font-mono">
                  @{user.username}
                </span>
              )}
            </h4>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span className="font-mono bg-zinc-50 dark:bg-zinc-800/50 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 text-[10px]">
                ID: {user.telegram_id}
              </span>
              <span className="flex items-center gap-1">
                <Mail size={12} className="opacity-70" />
                <span className="truncate">{user.email || "Email не вказано"}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="md:col-span-4 min-w-0">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Building2 size={14} className="opacity-70 shrink-0" />
              <span className="text-[13px] font-semibold truncate">{user.company_name || "Приватна особа"}</span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-5 uppercase font-bold tracking-tighter">
              Person ID: {user.person_id}
            </span>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="flex flex-col gap-1.5">
             <div className={cn(
               "px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider w-fit",
               user.is_blocked ? "bg-red-500/10 text-red-600 border-red-200" : "bg-emerald-500/10 text-emerald-600 border-emerald-200"
             )}>
               {user.is_blocked ? "Заблоковано" : "Активний"}
             </div>
          </div>
        </div>

        <div className="md:col-span-2 flex justify-end">
          <Button 
            variant="ghost" 
            size="sm" 
            className="rounded-lg h-9 w-9 p-0 hover:bg-blue-50 hover:text-blue-600"
            onClick={() => window.open(`https://t.me/${user.username || user.telegram_id}`, '_blank')}
            disabled={!user.username}
          >
            <ExternalLink size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

const AdminTelegramUsersPage = () => {
  const { users, stats, isLoading } = useAdminTelegramUsers();
  const [search, setSearch] = React.useState("");

  const filteredUsers = React.useMemo(() => {
    if (!search) return users;
    const s = search.toLowerCase();
    return users.filter((u: any) => 
      u.username?.toLowerCase().includes(s) ||
      u.name?.toLowerCase().includes(s) ||
      u.surname?.toLowerCase().includes(s) ||
      u.email?.toLowerCase().includes(s) ||
      String(u.telegram_id).includes(s)
    );
  }, [users, search]);

  return (
    <div className="p-4 lg:p-8 space-y-8 w-full max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500 rounded-2xl shadow-lg shadow-blue-500/20 text-white">
              <MessageCircle size={24} />
            </div>
            <h1 className="text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tight italic">
              Користувачі <span className="text-blue-500 italic">Telegram</span>
            </h1>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium ml-12">
            Керування підписками та перегляд статистики бота
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="rounded-xl font-bold gap-2"
            onClick={() => window.open('/admin/telegram/broadcast')}
          >
            <Send size={18} />
            Розсилка
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Всього підписників" 
          value={stats?.total || 0} 
          icon={Users} 
          color="bg-blue-500/10 text-blue-600" 
        />
        <StatCard 
          title="Співробітники ICT" 
          value={stats?.ict_count || 0} 
          icon={ShieldCheck} 
          color="bg-indigo-500/10 text-indigo-600" 
        />
        <StatCard 
          title="Перевізники" 
          value={stats?.carrier_count || 0} 
          icon={Truck} 
          color="bg-emerald-500/10 text-emerald-600" 
        />
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input 
            placeholder="Пошук за іменем, email, username або ID..." 
            className="pl-10 h-11 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="text-sm font-bold text-zinc-400 uppercase tracking-widest px-4 border-l border-zinc-100 dark:border-zinc-800 h-8 flex items-center">
          Знайдено: {filteredUsers.length}
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-pulse rounded-2xl" />
          ))
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map((user: any) => (
            <TelegramUserItem key={user.telegram_id} user={user} />
          ))
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-zinc-500 bg-white dark:bg-zinc-900/50 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 border-dashed">
            <MessageCircle className="w-16 h-16 text-zinc-200 dark:text-zinc-800 mb-4" />
            <p className="text-xl font-bold text-zinc-600 dark:text-zinc-400">Користувачів не знайдено</p>
            <p className="text-zinc-500">Спробуйте змінити параметри пошуку</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTelegramUsersPage;
