"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

import { loadService } from "../services/load.service";
import { useAuth } from "@/shared/providers/AuthCheckProvider";
import { useSockets } from "@/shared/providers/SocketProvider";
import { LoadApiItem } from "../types/load.type";
import { IApiResponse } from "@/shared/api/api.type";
import api from "@/shared/api/instance.api";
import { playSound } from "@/shared/helpers/play-sound";

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

export const useLoads = (filters: TenderListFilters = {}) => {
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
    [params.toString()],
  );

  /** 1. Запит на отримання даних */
  const { data, isLoading, error, refetch } = useQuery<
    IApiResponse<LoadApiItem[]>
  >({
    queryKey,
    queryFn: () => loadService.getLoads(params),
    staleTime: 1000 * 60,
  });

  /** 2. Мутація для створення/редагування */
  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post("/crm/load/save", payload);
      return data;
    },
    onSuccess: () => {
      // Інвалідуємо всі запити, що починаються на "loads"
      // Це гарантує, що при переході на сторінку список буде свіжим
      queryClient.invalidateQueries({
        queryKey: ["loads"],
        exact: false,
      });
    },
  });

  const loads = data?.content ?? [];
  const pagination = data?.props?.pagination;

  /** Socket-оновлення */
  useEffect(() => {
    if (!profile?.id || !load) return;

    const handleNewLoad = () => {
      queryClient.invalidateQueries({ queryKey, exact: false });
      playSound("/sounds/load/new-load-sound.mp3");
    };

    const handleUpdateLoad = (updatedLoad: LoadApiItem) => {
      queryClient.setQueryData<IApiResponse<LoadApiItem[]>>(queryKey, (old) => {
        if (!old) return old;

        return {
          ...old,
          content: old.content.map((l) =>
            l.id === updatedLoad.id ? updatedLoad : l,
          ),
        };
      });

      queryClient.setQueryData(["load", updatedLoad.id], updatedLoad);
    };

    load.on("edit_load", (updatedId: number) => {
      queryClient.invalidateQueries({ queryKey });
      window.dispatchEvent(
        new CustomEvent("cargo_shake", { detail: updatedId }),
      );
    });
    load.on("edit_load_car", (updatedId: number) => {
      queryClient.invalidateQueries({ queryKey });
      window.dispatchEvent(
        new CustomEvent("cargo_shake_car_count", { detail: updatedId }),
      );
    });
    load.on("edit_load_car_close_by_manager", (updatedId: number) => {
      queryClient.invalidateQueries({ queryKey });
      // window.dispatchEvent(
      //   new CustomEvent("cargo_shake_car_count", { detail: updatedId }),
      // );
    });

    load.on("new_load", handleNewLoad);
    load.on("update_load", handleUpdateLoad);

    return () => {
      load.off("new_load");
      load.off("update_load");
      load.off("edit_load");
      load.off("edit_load_car");
      load.off("edit_load_car_close_by_manager");
    };
    // Прибираємо queryKey з залежностей, щоб не перепідписувати сокети постійно
    // Використовуємо посилання на актуальний queryKey через refs або залишаємо так,
    // якщо invalidateAllLoads нам достатньо (що краще для архітектури).
  }, [profile?.id, load, queryClient]);

  return {
    loads,
    pagination,
    isLoading,
    error,
    refetch,
    // Повертаємо методи мутації
    saveCargo: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  };
};
