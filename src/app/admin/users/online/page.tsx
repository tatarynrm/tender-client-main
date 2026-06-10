"use client";

import { useState, useCallback } from "react";
import { User as UserIcon } from "lucide-react";
import { useOnlineUsers } from "@/shared/hooks/useOnlineUsers";
import { UserListItem } from "@/features/admin/users/components/UserListItem";
import { Button } from "@/shared/components/ui";
import { useAdminOnlineUsers } from "@/features/admin/hooks/useAdminUsers";

export default function OnlineUsersPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
  });

  const { users, pagination, isLoading } = useAdminOnlineUsers(filters);
  const onlineUsers = useOnlineUsers();

  const handlePageChange = useCallback((newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  }, []);

  const handlePerPageChange = useCallback((newSize: number) => {
    setFilters((prev) => ({ ...prev, page: 1, limit: newSize }));
  }, []);

  return (
    <div className="space-y-4 p-4 w-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold text-gray-800">
            Користувачі онлайн
          </h2>
          <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Зараз онлайн: <span className="font-bold text-emerald-600">{pagination?.rows_all || users?.length || 0}</span>
          </p>
        </div>
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
              isOnline={true}
            />
          ))
        ) : (
          <div className="py-16 flex flex-col items-center justify-center text-zinc-500 bg-white dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 border-dashed">
            <UserIcon className="w-12 h-12 text-zinc-300 mb-3" />
            <p className="text-lg font-medium text-zinc-600 dark:text-zinc-400">Наразі немає користувачів онлайн</p>
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
