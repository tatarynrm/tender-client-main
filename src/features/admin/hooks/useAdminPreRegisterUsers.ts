"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useCallback } from "react";
import { useSockets } from "@/shared/providers/SocketProvider";
import { IApiResponse } from "@/shared/api/api.type";
import { adminPreRegisterService } from "../services/admin.users-pre-register.service";

/* =======================
    TYPES & INTERFACES
======================= */
export interface IPreRegisterCompany {
  id: number;
  edrpou: string;
  company_name: string;
}

export interface IPreRegisterUser {
  id: number;
  name: string;
  surname: string;
  last_name: string | null;
  email: string;
  phone: string;
  id_usr: number | null;
  company: IPreRegisterCompany | null;
  company_name: string;
  company_form: string;
  company_edrpou: string;
  company_address: string | null;
  company_edrpou_idx: string;
  company_client: boolean;
  company_carrier: boolean;
  company_freighter: boolean;
  company_expedition: boolean;
  company_vat_payer: boolean;
  ids_country: string;
  country_name: string;
  verified: boolean;
  two_factor_enabled: boolean;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export interface PreRegisterFilters {
  search?: string;
  country?: string;
  user_exist?: "all" | "yes" | "no";
  company_exist?: "all" | "yes" | "no";
  page?: number;
  per_page?: number;
}

/* =======================
    HOOK
======================= */
export const useAdminPreRegisterUsers = (filters: PreRegisterFilters = {}) => {
  const queryClient = useQueryClient();
  const { user: socket } = useSockets();

  // 1. Формування параметрів для запиту
  const cleanFilters = useMemo(() => {
    const f: Record<string, any> = {};
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "" && val !== "all") {
        f[key] = val;
      }
    });
    return f;
  }, [filters]);

  const queryKey = useMemo(() => ["admin-pre-register", cleanFilters], [cleanFilters]);

  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // 2. Валідація фільтрів для Socket-оновлень
  const matchesFilters = useCallback((item: IPreRegisterUser, f: PreRegisterFilters) => {
    if (!item) return false;

    if (f.country && item.country_name !== f.country) return false;

    // Перевірка на існування юзера в системі
    if (f.user_exist === "yes" && !item.id_usr) return false;
    if (f.user_exist === "no" && !!item.id_usr) return false;

    // Перевірка на існування компанії (використовуємо вкладений об'єкт)
    if (f.company_exist === "yes" && !item.company?.id) return false;
    if (f.company_exist === "no" && !!item.company?.id) return false;

    if (f.search) {
      const s = f.search.toLowerCase();
      const match =
        item.name?.toLowerCase().includes(s) ||
        item.surname?.toLowerCase().includes(s) || // Додано прізвище до пошуку
        item.email?.toLowerCase().includes(s) ||
        item.company_name?.toLowerCase().includes(s) ||
        (item.last_name?.toLowerCase() || "").includes(s);
      if (!match) return false;
    }

    return true;
  }, []);

  // 3. Оновлення локального кешу (Optimistic UI / Real-time)
  const updateLocalCache = useCallback(
    (newItem: IPreRegisterUser) => {
      if (!newItem?.id) return;

      queryClient.setQueryData<IApiResponse<IPreRegisterUser[]>>(queryKey, (old) => {
        if (!old?.content) return old;

        const isMatch = matchesFilters(newItem, filtersRef.current);
        const otherItems = old.content.filter((u) => u.id !== newItem.id);

        return {
          ...old,
          content: isMatch ? [newItem, ...otherItems] : otherItems,
        };
      });
    },
    [queryClient, queryKey, matchesFilters]
  );

  // 4. Основний запит
  const { data, isLoading, isPlaceholderData, error, refetch } = useQuery({
    queryKey,
    queryFn: () => adminPreRegisterService.getUsers(cleanFilters),
    staleTime: 1000 * 60 * 5, // 5 хвилин
  });

  // 5. Socket listeners
  useEffect(() => {
    if (!socket) return;

    const onUpdate = (user: IPreRegisterUser) => updateLocalCache(user);
    const onDelete = (data: { id: number }) => {
        queryClient.setQueryData<IApiResponse<IPreRegisterUser[]>>(queryKey, (old) => {
            if (!old?.content) return old;
            return { ...old, content: old.content.filter(u => u.id !== data.id) };
        });
    };

    socket.on("pre_register_created", onUpdate);
    socket.on("pre_register_updated", onUpdate);
    socket.on("pre_register_deleted", onDelete);

    return () => {
      socket.off("pre_register_created", onUpdate);
      socket.off("pre_register_updated", onUpdate);
      socket.off("pre_register_deleted", onDelete);
    };
  }, [socket, updateLocalCache, queryClient, queryKey]);

  // 6. Країни для фільтру (тільки унікальні назви)
  const countries = useMemo(() => {
    const list = data?.content || [];
    return Array.from(new Set(list.map((u) => u.country_name))).sort();
  }, [data?.content]);

  return {
    users: data?.content ?? [],
    pagination: data?.props?.pagination,
    countries,
    isLoading,
    isPlaceholderData,
    error,
    refetch,
    queryKey,
  };
};