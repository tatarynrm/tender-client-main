"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useCallback } from "react";

import { useSockets } from "@/shared/providers/SocketProvider";
import { IApiResponse } from "@/shared/api/api.type";
import { adminUserService } from "../services/admin.user.service";
import { toast } from "sonner";

export interface UserFilters {
  search?: string;
  id_company?: number;
  isAdmin?: boolean;
  isBlocked?: boolean;
  page?: number;
}

export type UserItem = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  surname: string;
  isBlocked: boolean;
  isAdmin: boolean;
  id_company: number;
  // додайте інші поля з вашої схеми
};

export const useUserById = (id?: number | string | null) => {
  return useQuery<UserItem>({
    queryKey: ["user", id],
    queryFn: () => adminUserService.getOneUser(Number(id)),
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 хвилин
  });
};

export const useAdminUsers = (filters: UserFilters = {}) => {
  const queryClient = useQueryClient();
  const { user: socket } = useSockets(); // Припускаємо наявність сокету для юзерів

  // 1. Формування параметрів та ключа
  const params = useMemo(() => {
    const p = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        p.set(key, String(val));
      }
    });
    return p;
  }, [filters]);

  const queryKey = useMemo(() => ["users", params.toString()], [params]);

  // Ref для доступу до актуальних фільтрів у сокетах
  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // 2. Логіка відповідності фільтрам для "живого" оновлення
  const matchesFilters = useCallback((item: UserItem, f: UserFilters) => {
    if (!item) return false;
    if (f.id_company && Number(item.id_company) !== Number(f.id_company))
      return false;
    if (f.isBlocked !== undefined && item.isBlocked !== f.isBlocked)
      return false;

    if (f.search) {
      const s = f.search.toLowerCase();
      const fullName =
        `${item.lastName} ${item.firstName} ${item.surname}`.toLowerCase();
      if (!fullName.includes(s) && !item.email.toLowerCase().includes(s))
        return false;
    }
    return true;
  }, []);

  // 3. Оновлення локального кешу
  const updateLocalCache = useCallback(
    (newItem: UserItem) => {
      if (!newItem?.id) return;

      queryClient.setQueryData<IApiResponse<UserItem[]>>(queryKey, (old) => {
        if (!old?.content) return old;

        const isMatch = matchesFilters(newItem, filtersRef.current);
        const filtered = old.content.filter((u) => u.id !== newItem.id);

        return {
          ...old,
          content: isMatch ? [newItem, ...filtered] : filtered,
        };
      });

      queryClient.setQueryData(["user", newItem.id], newItem);
    },
    [queryClient, queryKey, matchesFilters],
  );

  // 4. Запити та мутації
  const { data, isLoading, error, refetch } = useQuery<
    IApiResponse<UserItem[]>
  >({
    queryKey,
    queryFn: () => adminUserService.getUsers(params),
    staleTime: 1000 * 60 * 5,
  });

  const { mutateAsync: createUser, isPending: isCreating } = useMutation({
    mutationFn: adminUserService.createUser,
    onSuccess: (res) => {
      // 1. Перевіряємо внутрішній статус вашого API
      if (res?.status === "ok" || res?.id) {
        toast.success("Користувача успішно створено");

        // Оновлюємо кеш
        queryClient.invalidateQueries({ queryKey: ["users"] });
        if (res?.id) updateLocalCache(res);
      } else {
        // Якщо сервер повернув 200, але в тілі повідомлення помилка (наприклад, {status: 'error'})
        toast.error(res?.message || "Помилка при створенні");
      }
    },
    onError: (error: any) => {
      // 2. Отримуємо повідомлення про помилку з Axios (або іншого клієнта)
      // Зазвичай помилка лежить в error.response.data.message
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Сталася непередбачувана помилка";

      toast.error(errorMessage);
      console.error("Create User Error:", error);
    },
  });

  const { mutateAsync: updateUser, isPending: isUpdating } = useMutation({
    mutationFn: adminUserService.updateUser,
    onSuccess: (res) => updateLocalCache(res),
  });

  // 5. Обробка сокетів
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = (user: UserItem) => updateLocalCache(user);

    socket.on("user_created", handleUpdate);
    socket.on("user_updated", handleUpdate);
    socket.on("user_status_changed", handleUpdate);

    return () => {
      socket.off("user_created", handleUpdate);
      socket.off("user_updated", handleUpdate);
      socket.off("user_status_changed", handleUpdate);
    };
  }, [socket, updateLocalCache]);

  return {
    users: data?.content ?? [],
    pagination: data?.props?.pagination,
    isLoading,
    isCreating,
    isUpdating,
    error,
    refetch,
    createUser,
    updateUser,
    queryKey,
  };
};
