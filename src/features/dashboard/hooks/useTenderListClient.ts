"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

import { ITender } from "@/features/log/types/tender.type";
import { tenderClientsService } from "../services/tender.clients.service";
import { useAuth } from "@/shared/providers/AuthCheckProvider";
import { useSockets } from "@/shared/providers/SocketProvider";
import { IApiResponse } from "@/shared/api/api.type";

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

export const useTenderListClient = (filters: TenderListFilters) => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { tender } = useSockets();

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
    queryFn: () => tenderClientsService.getTenders(params),
    staleTime: 1000 * 60, // 1 хвилина
  });

  const tenders = data?.content ?? [];
  const pagination = data?.props?.pagination;
  const add_data = data?.props?.add_data;

  const handleRefresh = () => {
    // Invalidate оновлює дані з сервера, щоб у клієнта був актуальний список
    queryClient.invalidateQueries({ queryKey });
  };
  // Сокети для live-оновлення
  useEffect(() => {
    if (!profile?.person?.id || !tender) return;

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
            t.id === updatedTender.id ? { ...t, ...updatedTender } : t,
          ),
        };
      });
      queryClient.setQueryData(["tender", updatedTender.id], (old: any) =>
        old ? { ...old, ...updatedTender } : updatedTender,
      );
    };

    tender.on("new_tender", handleRefresh);
    tender.on("new_bid", handleNewBid);
    tender.on("tender_status_updated", handleRefresh);

    return () => {
      tender.off("new_tender", handleRefresh);
      tender.off("new_bid", handleNewBid);
      tender.off("tender_status_updated", handleRefresh);
    };
  }, [profile?.person?.id, queryClient, tender, queryKey]);

  return { tenders, pagination, add_data, isLoading, error };
};
