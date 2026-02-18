"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useCallback } from "react";
import { useSockets } from "@/shared/providers/SocketProvider";
import { IApiResponse } from "@/shared/api/api.type";
import { adminUserService } from "../services/admin.user.service"; // Перевірте назву файлу (. або _)
import { toast } from "sonner";
import { IUserAccount } from "../types/user.types";
import axios from "axios";

export interface UserFilters {
  search?: string;
  id_company?: number;
  is_admin?: boolean;
  is_blocked?: boolean;
  page?: number;
  per_page?: number;
}

// Використовуємо ваш реальний тип IUserAccount
export const useUserById = (id?: number | string | null) => {
  return useQuery<IUserAccount>({
    queryKey: ["user", id],
    queryFn: () => adminUserService.getOneUser(Number(id)),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
};

export const useAdminUsers = (filters: UserFilters = {}) => {
  const queryClient = useQueryClient();
  const { user: socket } = useSockets();

  // 1. Формування URL параметрів
  const params = useMemo(() => {
    const p = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "" && val !== "all") {
        p.set(key, String(val));
      }
    });
    return p;
  }, [filters]);

  const queryKey = useMemo(() => ["admin-users", params.toString()], [params]);

  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // 2. Логіка валідації об'єкта під поточні фільтри (для Socket-оновлень)
  const matchesFilters = useCallback((item: IUserAccount, f: UserFilters) => {
    if (!item) return false;

    // Фільтр по компанії
    if (f.id_company && Number(item.id_company) !== Number(f.id_company))
      return false;

    // Фільтр по блокуванню
    if (f.is_blocked !== undefined && item.is_blocked !== f.is_blocked)
      return false;

    // Фільтр по ролі (is_admin) через вкладений person_role
    if (
      f.is_admin !== undefined &&
      item.person?.person_role?.is_admin !== f.is_admin
    )
      return false;

    // Пошук (ПІБ або Email)
    if (f.search) {
      const s = f.search.toLowerCase();
      const p = item.person;
      const fullName = `${p?.surname} ${p?.name} ${p?.last_name}`.toLowerCase();
      const emailMatch = item.email.toLowerCase().includes(s);
      if (!fullName.includes(s) && !emailMatch) return false;
    }

    return true;
  }, []);

  // 3. Оновлення локального кешу (без перезавантаження всієї сторінки)
  const updateLocalCache = useCallback(
    (newItem: IUserAccount) => {
      if (!newItem?.id) return;

      queryClient.setQueryData<IApiResponse<IUserAccount[]>>(
        queryKey,
        (old) => {
          if (!old?.content) return old;

          const isMatch = matchesFilters(newItem, filtersRef.current);
          const otherItems = old.content.filter((u) => u.id !== newItem.id);

          return {
            ...old,
            content: isMatch ? [newItem, ...otherItems] : otherItems,
          };
        },
      );

      // Оновлюємо також кеш окремого користувача
      queryClient.setQueryData(["user", newItem.id], newItem);
    },
    [queryClient, queryKey, matchesFilters],
  );

  // 4. Запит даних
  const { data, isLoading, error, refetch } = useQuery<
    IApiResponse<IUserAccount[]>
  >({
    queryKey,
    queryFn: () => adminUserService.getUsers(params),
    staleTime: 1000 * 60 * 5,
  });

  // 5. Мутація створення
  const { mutateAsync: saveUser, isPending: isSaving } = useMutation({
    mutationFn: adminUserService.createUser,
    onSuccess: (res) => {
      // res зазвичай повертає створений об'єкт або { status: 'ok', content: {...} }
      // адаптуйте під ваш backend API
      const newUser = res?.content || res;
      toast.success("Користувача успішно створено");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      if (newUser?.id) updateLocalCache(newUser);
    },
    onError: (err: any) => {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message
        : err.message;
      toast.error(msg || "Помилка при створенні");
    },
  });

  // 6. Мутація оновлення


  // 7. Обробка сокетів
  useEffect(() => {
    if (!socket) return;

    const handleSocketUpdate = (user: IUserAccount) => {
      // Тут можна додати перевірку, чи не ми самі зробили цей запит (за бажанням)
      updateLocalCache(user);
    };

    socket.on("user_created", handleSocketUpdate);
    socket.on("user_updated", handleSocketUpdate);
    socket.on("user_status_changed", handleSocketUpdate);

    return () => {
      socket.off("user_created", handleSocketUpdate);
      socket.off("user_updated", handleSocketUpdate);
      socket.off("user_status_changed", handleSocketUpdate);
    };
  }, [socket, updateLocalCache]);

  return {
    users: data?.content ?? [],
    pagination: data?.props?.pagination,
    isLoading,
    isSaving,
  
    error,
    refetch,
    saveUser,
   
    queryKey,
  };
};
