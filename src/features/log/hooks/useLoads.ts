"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryKey,
} from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";
import api from "@/shared/api/instance.api";
import { loadService } from "../services/load.service";
import { useAuth } from "@/shared/providers/AuthCheckProvider";
import { useSockets } from "@/shared/providers/SocketProvider";
import { playSound } from "@/shared/helpers/play-sound";
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

/**
 * Окрема логіка для мутації збереження вантажу
 */
const useSaveLoadMutation = (queryKey: QueryKey) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post("/crm/load/save", payload);
      return data;
    },
    onSuccess: (data) => {
      // Інвалідуємо списки, щоб підтягнути актуальні дані з сервера
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["loads"], exact: false });

      // Оновлюємо кеш конкретного вантажу (для сторінки деталей)
      if (data?.id) {
        queryClient.setQueryData(["load", data.id], data);
      }
    },
  });
};

export const useLoads = (filters: TenderListFilters = {}) => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { load: socket } = useSockets();

  // Ref для доступу до актуальних фільтрів всередині сокет-обробників
  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Формування Query Key та параметрів запиту
  const params = useMemo(() => {
    const p = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (
        val !== undefined &&
        val !== null &&
        val !== "" &&
        !(Array.isArray(val) && val.length === 0)
      ) {
        p.set(key, String(val));
      }
    });
    return p;
  }, [filters]);

  const queryKey = useMemo(
    () => ["loads", params.toString()],
    [params.toString()],
  );

  // Основний запит даних списку
  const { data, isLoading, error, refetch } = useQuery<
    IApiResponse<LoadApiItem[]>
  >({
    queryKey,
    queryFn: () => loadService.getLoads(params),
    staleTime: 1000 * 60,
  });

  // Мутація збереження (isSaving)
  const { mutateAsync: saveCargo, isPending: isSaving } =
    useSaveLoadMutation(queryKey);

  const { mutateAsync: refreshLoadTime, isPending: isRefreshing } = useMutation(
    {
      mutationFn: async (id: number) => {
        // Викликаємо ваш API метод (crm_load_update на бекенді)
        // Передаємо id, щоб сервер оновив updated_at для цього запису
        console.log(id);

        const { data } = await api.post("/crm/load/load-update", { id: id });
        return data;
      },
      onSuccess: (updatedItem) => {
        // Оновлюємо локальний кеш, щоб вантаж одразу стрибнув вгору
        // (Хоча сокет "edit_load" або "update_load" теж це зробить,
        // ручне оновлення зробить інтерфейс миттєвим)
        updateLocalCache(updatedItem);

        // Інвалідуємо список, щоб синхронізуватись з сервером (опціонально)
        queryClient.invalidateQueries({ queryKey });
      },
    },
  );
  /**
   * Перевірка, чи підходить об'єкт під поточні фільтри клієнта
   */
  const matchesFilters = (item: LoadApiItem, f: TenderListFilters) => {
    const routeFrom = item.crm_load_route_from || [];

    if (f.status && item.status !== f.status) return false;
    if (
      f.country_from &&
      !routeFrom.some((r) => r.ids_country === f.country_from)
    )
      return false;
    if (
      f.city_from &&
      !routeFrom.some((r) =>
        r.city?.toLowerCase().includes(f.city_from!.toLowerCase()),
      )
    )
      return false;
    if (
      f.regionId &&
      !routeFrom.some((r) => Number(r.ids_region) === Number(f.regionId))
    )
      return false;

    if (f.search) {
      const s = f.search.toLowerCase();
      const matchId = item.id.toString().includes(s);
      const matchCity = item.crm_load_route_to?.some((r) =>
        r.city?.toLowerCase().includes(s),
      );
      if (!matchId && !matchCity) return false;
    }
    return true;
  };

  /**
   * Розумне оновлення локального кешу (Optimistic Update)
   */
  const updateLocalCache = (newItem: LoadApiItem) => {
    queryClient.setQueryData<IApiResponse<LoadApiItem[]>>(queryKey, (old) => {
      if (!old) return old;

      const isMatch = matchesFilters(newItem, filtersRef.current);
      const exists = old.content.some((l) => l.id === newItem.id);

      let newContent = [...old.content];

      if (exists) {
        // Оновлюємо або видаляємо, якщо після змін не підходить під фільтри
        newContent = isMatch
          ? newContent.map((l) => (l.id === newItem.id ? newItem : l))
          : newContent.filter((l) => l.id !== newItem.id);
      } else if (isMatch) {
        // Додаємо новий вантаж, якщо він підходить
        newContent = [newItem, ...newContent];
      }

      return {
        ...old,
        content: newContent
          .sort(
            (a, b) =>
              new Date(b.updated_at).getTime() -
              new Date(a.updated_at).getTime(),
          )
          .slice(0, 50),
      };
    });

    queryClient.setQueryData(["load", newItem.id], newItem);
  };

  // Підписка на сокети
  useEffect(() => {
    if (!profile?.id || !socket) return;

    const handlers = {
      new_load: (data: LoadApiItem) => {
        updateLocalCache(data);
        playSound("/sounds/load/new-load-sound.mp3");
      },
      update_load: updateLocalCache,
      edit_load: (data: LoadApiItem) => {
        updateLocalCache(data);
        window.dispatchEvent(
          new CustomEvent("cargo_shake", { detail: data.id }),
        );
      },
    };

    Object.entries(handlers).forEach(([event, fn]) => socket.on(event, fn));

    return () => {
      Object.entries(handlers).forEach(([event, fn]) => socket.off(event, fn));
    };
  }, [profile?.id, socket, queryKey]);

  return {
    loads: data?.content ?? [],
    pagination: data?.props?.pagination,
    isLoading,
    isSaving,
    error,
    refetch,
    saveCargo,
    refreshLoadTime,
    isRefreshing,
  };
};
