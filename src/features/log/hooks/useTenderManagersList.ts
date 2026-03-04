"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

import { ITender } from "@/features/log/types/tender.type";

import { useAuth } from "@/shared/providers/AuthCheckProvider";
import { useSockets } from "@/shared/providers/SocketProvider";
import { IApiResponse } from "@/shared/api/api.type";
import { tenderManagerService } from "../services/tender.manager.service";

export interface TenderListFilters {
  search?: string;
  status?: string;
  regionId?: number;
  countryId?: string;
  country_from?: string;
  city_to?: string;
  city_from?: string;
  page?: number;
}

export const useTenderListManagers = (filters: TenderListFilters) => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { tender, load } = useSockets();

  // Формуємо URLSearchParams для запиту на сервер
  const params = useMemo(() => {
    const p = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        !(Array.isArray(value) && value.length === 0)
      ) {
        p.set(key, String(value));
      }
    });
    return p;
  }, [filters]);

  // Використовуємо єдиний ключ для React Query
  const queryKey = useMemo(
    () => ["tenders", params.toString()],
    [params.toString()],
  );

  // Основний запит
  const { data, isLoading, error } = useQuery<IApiResponse<ITender[]>>({
    queryKey,
    queryFn: () => tenderManagerService.getTenders(params),
    staleTime: 1000 * 60, // 1 хвилина
  });

  const tenders = data?.content ?? [];
  const pagination = data?.props?.pagination;

  // Сокети для live-оновлення
  useEffect(() => {
    // 1. ВИПРАВЛЕНО: Перевіряємо лише наявність об'єкта (не .connected)
    // Якщо юзера немає або сокет `load` ще не ініціалізовано в провайдері — чекаємо
    if (!profile?.person?.id || !load) return;

    const handleNewLoad = () => {
      // console.log("Оновлюємо список тендерів...");
      queryClient.invalidateQueries({ queryKey });
    };
    const handleRefresh = () => {
      console.log("Отримано нову подію, оновлюємо список...");
      queryClient.invalidateQueries({ queryKey });
    };
    const handleNewBid = (updatedTender: ITender) => {
      queryClient.setQueryData<IApiResponse<ITender[]>>(queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          content: old.content.map((t) =>
            t.id === updatedTender.id ? updatedTender : t,
          ),
        };
      });
      // Також оновлюємо кеш конкретного тендера
      queryClient.setQueryData(["tender", updatedTender.id], updatedTender);
    };

    // Підписуємось на неймспейс load
    load.on("new_tender", handleNewLoad);
    load.on("new_bid", handleNewBid);

    // Відписуємось
    return () => {
      load.off("new_tender", handleNewLoad);
      load.off("new_bid", handleNewBid);
    };

    // 2. ВИПРАВЛЕНО: Додано load у залежності замість tender, і правильний ID юзера
  }, [profile?.person?.id, queryClient, load, queryKey]);
  return { tenders, pagination, isLoading, error };
};
