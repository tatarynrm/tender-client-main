"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User as UserIcon, Search, X } from "lucide-react";
import { useOnlineUsers } from "@/shared/hooks/useOnlineUsers";
import { UserListItem } from "@/features/admin/users/components/UserListItem";

import { Button, Input } from "@/shared/components/ui";
import LinkButton from "@/shared/components/Buttons/LinkButton";
import { useAdminUsers } from "@/features/admin/hooks/useAdminUsers";
import { useRouter } from "next/navigation";

// Схема з чіткими типами
const userFilterSchema = z.object({
  email: z.string(),
  company: z.string(),
  page: z.number(),
  limit: z.number(),
});

type UserFilterValues = z.infer<typeof userFilterSchema>;

export default function UsersPage() {
  const router = useRouter();

  const [filters, setFilters] = useState<UserFilterValues>(() => {
    let savedLimit = 20;
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("admin_users_per_page");
      if (stored) savedLimit = parseInt(stored, 10);
    }
    return {
      email: "",
      company: "",
      page: 1,
      limit: savedLimit,
    };
  });

  const { register, watch, setValue, reset } = useForm<UserFilterValues>({
    resolver: zodResolver(userFilterSchema) as any,
    defaultValues: {
      email: "",
      company: "",
      page: 1,
      limit: filters.limit,
    },
  });

  const emailValue = watch("email");
  const companyValue = watch("company");

  const { users, pagination, isLoading } = useAdminUsers(filters);

  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        email: emailValue || "",
        company: companyValue || "",
        page: 1,
      }));
    }, 500);

    return () => clearTimeout(handler);
  }, [emailValue, companyValue]);

  const handlePageChange = useCallback((newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  }, []);

  const handlePerPageChange = useCallback((newSize: number) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_users_per_page", newSize.toString());
    }
    setFilters((prev) => ({ ...prev, page: 1, limit: newSize }));
  }, []);

  const clearFilters = () => {
    let savedLimit = 20;
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("admin_users_per_page");
      if (stored) savedLimit = parseInt(stored, 10);
    }
    const defaults = { email: "", company: "", page: 1, limit: savedLimit };
    reset(defaults);
    setFilters(defaults);
  };

  const onlineUsers = useOnlineUsers();



  return (
    <div className="space-y-4 p-4 w-full">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold text-gray-800">
            Управління користувачами
          </h2>
          <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Зараз онлайн: <span className="font-bold text-emerald-600">{onlineUsers.size}</span>
          </p>
        </div>
        <LinkButton
          title="Додати користувача"
          href="/admin/users/save"
          icon={<UserIcon size={18} />}
        />
      </div>

      <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative w-full max-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            {...register("email")}
            placeholder="Пошук за email..."
            className="pl-9 pr-9"
          />
          {emailValue && (
            <button
              type="button"
              onClick={() => setValue("email", "")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="relative w-full max-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            {...register("company")}
            placeholder="EDRPOU / Назва компанії..."
            className="pl-9 pr-9"
          />
          {companyValue && (
            <button
              type="button"
              onClick={() => setValue("company", "")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          disabled={!emailValue && !companyValue}
        >
          Скинути фільтри
        </Button>
      </div>

      <div className="flex flex-col gap-3 mt-6">
        {isLoading ? (
          Array.from({ length: filters.limit }).map((_, i) => (
            <div key={i} className="h-[80px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-pulse rounded-xl" />
          ))
        ) : users?.length > 0 ? (
          users.map((user: any) => (
            <UserListItem 
              key={user.id} 
              user={user} 
              isOnline={onlineUsers.has(String(user.id_person))} 
            />
          ))
        ) : (
          <div className="py-16 flex flex-col items-center justify-center text-zinc-500 bg-white dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 border-dashed">
            <UserIcon className="w-12 h-12 text-zinc-300 mb-3" />
            <p className="text-lg font-medium text-zinc-600 dark:text-zinc-400">Немає користувачів</p>
            <p className="text-sm">Спробуйте змінити параметри пошуку або додайте нового користувача.</p>
          </div>
        )}
      </div>

      {pagination && (pagination.page_count > 1 || users?.length > 0) && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl mt-6 shadow-sm">
          <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400 font-medium">
            <span>Відображати:</span>
            <select
              value={filters.limit}
              onChange={(e) => handlePerPageChange(Number(e.target.value))}
              className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-shadow cursor-pointer font-semibold"
            >
              {[10, 20, 50, 100].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="font-semibold"
              disabled={filters.page <= 1}
              onClick={() => handlePageChange(filters.page - 1)}
            >
              Попередня
            </Button>
            <span className="text-sm font-semibold flex items-center justify-center min-w-[120px] text-zinc-700 dark:text-zinc-300">
              Сторінка <span className="text-indigo-600 dark:text-indigo-400 mx-1.5">{filters.page}</span> з {pagination.page_count}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="font-semibold"
              disabled={filters.page >= pagination.page_count}
              onClick={() => handlePageChange(filters.page + 1)}
            >
              Наступна
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
