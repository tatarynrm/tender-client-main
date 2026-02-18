"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useCallback } from "react";
import { useSockets } from "@/shared/providers/SocketProvider";
import { IApiResponse } from "@/shared/api/api.type";
import { adminCompanyService } from "../services/admin.company.service";
import { toast } from "sonner";

import axios from "axios";
import { ICompany } from "../types/company.types";


export interface CompanyFilters {
  search?: string;
  page?: number;
  per_page?: number;
  is_blocked?: boolean;
}
export const useCompanyById = (id: number) => {
  return useQuery({
    queryKey: ["company", id],
    queryFn: () => adminCompanyService.getCompanyById(id), // Припускаємо, що метод є в сервісі
    enabled: !!id,
    select: (data) => data?.content || data, // Витягуємо дані з обгортки API
  });
};
export const useAdminCompanies = (filters: CompanyFilters = {}) => {
  const queryClient = useQueryClient();
  const { user: socket } = useSockets(); // Припускаємо, що є сокет для компаній

  // 1. Формування параметрів для запиту
  const params = useMemo(() => {
    const p = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        p.set(key, String(val));
      }
    });
    return p;
  }, [filters]);

  const queryKey = useMemo(() => ["admin-companies", params.toString()], [params]);

  // Зберігаємо актуальні фільтри в ref для сокетів
  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // 2. Валідація об'єкта під фільтри (для сокетів)
  const matchesFilters = useCallback((item: ICompany, f: CompanyFilters) => {
    if (!item) return false;

    // Пошук за назвою або ЄДРПОУ
    if (f.search) {
      const s = f.search.toLowerCase();
      const nameMatch = item.company_name?.toLowerCase().includes(s);
      const edrpouMatch = item.edrpou?.toLowerCase().includes(s);
      if (!nameMatch && !edrpouMatch) return false;
    }

    if (f.is_blocked !== undefined && item.is_blocked !== f.is_blocked) 
      return false;

    return true;
  }, []);

  // 3. Оновлення локального кешу
  const updateLocalCache = useCallback(
    (newItem: ICompany) => {
      if (!newItem?.id) return;

      queryClient.setQueryData<IApiResponse<ICompany[]>>(
        queryKey,
        (old) => {
          if (!old?.content) return old;

          const isMatch = matchesFilters(newItem, filtersRef.current);
          const otherItems = old.content.filter((c) => c.id !== newItem.id);

          return {
            ...old,
            content: isMatch ? [newItem, ...otherItems] : otherItems,
          };
        }
      );

      queryClient.setQueryData(["company", newItem.id], newItem);
    },
    [queryClient, queryKey, matchesFilters]
  );

  // 4. Запит даних
  const { data, isLoading, error, refetch } = useQuery<IApiResponse<ICompany[]>>({
    queryKey,
    queryFn: () => adminCompanyService.getCompanies(params),
    staleTime: 1000 * 60 * 5,
  });

  // 5. Мутація створення
  const { mutateAsync: createCompany, isPending: isCreating } = useMutation({
    mutationFn: adminCompanyService.createCompany,
    onSuccess: (res) => {
      const newCompany = res?.content || res;
      toast.success("Компанію успішно створено");
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      if (newCompany?.id) updateLocalCache(newCompany);
    },
    onError: (err: any) => {
      const msg = axios.isAxiosError(err) ? err.response?.data?.message : err.message;
      toast.error(msg || "Помилка при створенні");
    },
  });

  // 6. Сокети
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = (item: ICompany) => updateLocalCache(item);

    socket.on("company_created", handleUpdate);
    socket.on("company_updated", handleUpdate);
    socket.on("company_status_changed", handleUpdate);

    return () => {
      socket.off("company_created", handleUpdate);
      socket.off("company_updated", handleUpdate);
      socket.off("company_status_changed", handleUpdate);
    };
  }, [socket, updateLocalCache]);

  return {
    companies: data?.content ?? [],
    pagination: data?.props?.pagination,
    isLoading,
    isCreating,
    error,
    refetch,
    createCompany,
    queryKey,
  };
};