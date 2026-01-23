"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryKey,
} from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useCallback } from "react";
import api from "@/shared/api/instance.api";
import { loadService } from "../services/load.service";
import { useAuth } from "@/shared/providers/AuthCheckProvider";
import { useSockets } from "@/shared/providers/SocketProvider";
import { playSound } from "@/shared/helpers/play-sound";
import { LoadApiItem } from "../types/load.type";
import { IApiResponse } from "@/shared/api/api.type";
import { eventBus } from "@/shared/lib/event-bus";
import { SOCKET_EVENTS } from "@romannoris/tender-shared-types";
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
// Додаємо окремий експорт для useLoadById
export const useLoadById = (id?: number | string | null) => {
  return useQuery<LoadApiItem>({
    queryKey: ["load", id],
    queryFn: () => loadService.getOneLoad(Number(id)),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useLoads = (filters: TenderListFilters = {}) => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { load: socket } = useSockets();
  // 1. Формування Query Key та параметрів
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

  const queryKey = useMemo(() => ["loads", params.toString()], [params]);

  // Ref для доступу до актуальних фільтрів у колбеках сокетів
  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // 2. Перевірка відповідності фільтрам
  const matchesFilters = useCallback(
    (item: LoadApiItem, f: TenderListFilters) => {
      // 1. Захист: якщо item порожній - він не підходить
      if (!item) return false;

      const routeFrom = item.crm_load_route_from || [];
      const routeTo = item.crm_load_route_to || [];

      if (f.status && item.status !== f.status) return false;

      if (
        f.country_from &&
        !routeFrom.some((r) => r.ids_country === f.country_from)
      )
        return false;

      if (
        f.regionId &&
        !routeFrom.some((r) => Number(r.ids_region) === Number(f.regionId))
      )
        return false;

      if (
        f.city_from &&
        !routeFrom.some((r) =>
          r.city?.toLowerCase().includes(f.city_from!.toLowerCase()),
        )
      )
        return false;

      if (f.search) {
        const s = f.search.toLowerCase();
        const matchId = item.id?.toString().includes(s);
        const matchCityTo = routeTo.some((r) =>
          r.city?.toLowerCase().includes(s),
        );
        const matchCityFrom = routeFrom.some((r) =>
          r.city?.toLowerCase().includes(s),
        );

        if (!matchId && !matchCityTo && !matchCityFrom) return false;
      }
      return true;
    },
    [],
  );

  const updateLocalCache = useCallback(
    (newItem: LoadApiItem) => {
      if (!newItem || !newItem.id) return;

      queryClient.setQueryData<IApiResponse<LoadApiItem[]>>(queryKey, (old) => {
        if (!old?.content) return old;

        // 1. Перевіряємо відповідність фільтрам
        const matchesBaseFilters = matchesFilters(newItem, filtersRef.current);

        // 2. ДОДАТКОВА ПЕРЕВІРКА: якщо машин 0, то об'єкт НЕ підходить для списку
        // Припускаємо, що поле називається car_count_actual (як ви вказали)
        const hasCars = Number(newItem.car_count_actual) > 0;

        const isMatch = matchesBaseFilters && hasCars;

        // Створюємо новий масив без цього елемента
        const filteredContent = old.content.filter((l) => l.id !== newItem.id);

        // Якщо підходить (є машини + фільтри) - додаємо, якщо ні - просто лишаємо відфільтрований
        const newContent = isMatch
          ? [{ ...newItem }, ...filteredContent]
          : filteredContent;

        return {
          ...old,
          content: newContent.slice(0, 50),
        };
      });

      // Окремий кеш для одного вантажу теж можна оновити або видалити
      queryClient.setQueryData(["load", newItem.id], { ...newItem });
    },
    [queryClient, queryKey, matchesFilters],
  );
  // Додайте це всередину хука useLoads
  const updateItemOnly = useCallback(
    (newItem: LoadApiItem) => {
      queryClient.setQueryData<IApiResponse<LoadApiItem[]>>(queryKey, (old) => {
        if (!old) return old;

        // Перевіряємо, чи кількість коментарів дійсно змінилася,
        // щоб не тригерити рендер всього списку дарма
        const existingItem = old.content.find((i) => i.id === newItem.id);
        if (
          existingItem?.comment_count === newItem.comment_count &&
          existingItem?.comment_last_time === newItem.comment_last_time
        ) {
          return old;
        }

        return {
          ...old,
          content: old.content.map((item) =>
            item.id === newItem.id ? { ...item, ...newItem } : item,
          ),
        };
      });

      queryClient.setQueryData(["load", newItem.id], newItem);
    },
    [queryClient, queryKey],
  );
  // 4. Запити та мутації
  const { data, isLoading, error, refetch } = useQuery<
    IApiResponse<LoadApiItem[]>
  >({
    queryKey,
    queryFn: () => loadService.getLoads(params),
    staleTime: 1000 * 60,
  });

  const { mutateAsync: saveCargo, isPending: isSaving } = useMutation({
    mutationFn: (payload: any) =>
      api.post("/crm/load/save", payload).then((r) => r.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["loads"], exact: false });
      if (data?.id) updateLocalCache(data);
    },
  });

  const { mutateAsync: refreshLoadTime, isPending: isRefreshing } = useMutation(
    {
      mutationFn: (id: number) =>
        api.post("/crm/load/load-update", { id }).then((r) => r.data),
      onSuccess: (updatedItem) => updateLocalCache(updatedItem),
    },
  );

  // 5. Ефект сокетів
  useEffect(() => {
    if (!profile?.id || !socket) return;

    const onNewLoad = (data: LoadApiItem) => {
      const isMine = data.id_usr === profile?.id;

      if (!isMine) {
        playSound("/sounds/load/new-load-sound.mp3");
      }
      updateLocalCache(data);
    };

    const onUpdateLoad = (data: LoadApiItem) => {
      updateLocalCache(data);
      eventBus.emit("cargo_shake", data.id);
    };
    const onUpdateLoadDate = (data: LoadApiItem) => {
      updateLocalCache(data);
      eventBus.emit("update_load_date", data.id);
    };
    // Всередині useEffect для сокетів у useLoads
    const onUpdateComment = (data: LoadApiItem & { sender_id?: number }) => {
      const isMine = data.sender_id === profile?.id;

      if (!isMine) {
        playSound("/sounds/load/new-chat-message.mp3");
      }

      updateItemOnly(data);
    };
    const onUpdateCommentCount = (data: LoadApiItem) => {
      updateItemOnly(data);
    };
    const onUpdateLoadAddCar = (data: LoadApiItem) => {
      console.log(data, "ADD CAR");
      updateLocalCache(data);
      eventBus.emit("load_add_car", data.id);
    };
    const onUpdateLoadRemoveCar = (data: LoadApiItem) => {
      console.log(data, "DATA REMOVE CAR");

      updateLocalCache(data);
      eventBus.emit("load_remove_car", data.id);
    };
    socket.on("new_load", onNewLoad);
    socket.on("update_load", onUpdateLoad);
    socket.on("new_load_comment", onUpdateComment);
    socket.on("update_chat_count_load", onUpdateCommentCount);
    socket.on("edit_load", onUpdateLoad);
    socket.on("update_load_date", onUpdateLoadDate);
    socket.on("load_add_car", onUpdateLoadAddCar);
    socket.on("load_remove_car", onUpdateLoadRemoveCar);

    return () => {
      socket.off("new_load", onNewLoad);
      socket.off("update_load", onUpdateLoad);
      socket.off("new_load_comment", onUpdateComment);
      socket.off("update_chat_count_load", onUpdateCommentCount);
      socket.off("edit_load", onUpdateLoad);
      socket.off("update_load_date", onUpdateLoadDate); // ✅ виправлено
      socket.off("load_add_car", onUpdateLoadAddCar);
      socket.off("load_remove_car", onUpdateLoadRemoveCar);
    };
  }, [profile?.id, socket, updateLocalCache, updateItemOnly]);

  return {
    loads: data?.content ?? [],
    pagination: data?.props?.pagination,
    isLoading,
    isSaving,
    isRefreshing,
    error,
    refetch,
    saveCargo,
    refreshLoadTime,
    updateItemOnly, // Експортуємо цей метод
    queryKey, // Експортуємо ключ, щоб інші хуки могли до нього звертатися
  };
};
