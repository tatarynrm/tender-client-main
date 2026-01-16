"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

import { loadService } from "../services/load.service";
import { useAuth } from "@/shared/providers/AuthCheckProvider";
import { useSockets } from "@/shared/providers/SocketProvider";
import { LoadApiItem } from "../types/load.type";
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

export const useLoads = (filters: TenderListFilters) => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { load } = useSockets();

  /** Формуємо params */
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

  /** Динамічний queryKey */
  const queryKey = useMemo(
    () => ["loads", params.toString()],
    [params.toString()]
  );

  /** Основний запит */
  const { data, isLoading, error, refetch } = useQuery<
    IApiResponse<LoadApiItem[]>
  >({
    queryKey,
    queryFn: () => loadService.getLoads(params),
    staleTime: 1000 * 60,
  });

  const loads = data?.content ?? [];
  const pagination = data?.props?.pagination;

  /** Socket-оновлення */
  useEffect(() => {
    if (!profile?.id || !load) return;

    const handleNewLoad = () => {
      queryClient.invalidateQueries({ queryKey });
    };

    const handleUpdateLoad = (updatedLoad: LoadApiItem) => {
      queryClient.setQueryData<IApiResponse<LoadApiItem[]>>(queryKey, (old) => {
        if (!old) return old;

        return {
          ...old,
          content: old.content.map((l) =>
            l.id === updatedLoad.id ? updatedLoad : l
          ),
        };
      });

      queryClient.setQueryData(["load", updatedLoad.id], updatedLoad);
    };

    load.on("new_load", handleNewLoad);
    load.on("update_load", handleUpdateLoad);

    return () => {
      load.off("new_load", handleNewLoad);
      load.off("update_load", handleUpdateLoad);
    };
  }, [profile?.id, load, queryClient, queryKey]);

  return { loads, pagination, isLoading, error, refetch };
};
