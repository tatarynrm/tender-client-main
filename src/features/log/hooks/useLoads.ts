"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useCallback } from "react";
import api from "@/shared/api/instance.api";
import { loadService } from "../services/load.service";
import { useAuth } from "@/shared/providers/AuthCheckProvider";
import { useSockets } from "@/shared/providers/SocketProvider";
import { LoadApiItem } from "../types/load.type";
import { IApiResponse } from "@/shared/api/api.type";
import { eventBus } from "@/shared/lib/event-bus";
import { SOCKET_EVENTS } from "@/shared/constants/socket-evenets";

// export interface TenderListFilters {
//   search?: string;
//   status?: string;
//   regionId?: number;
//   countryId?: string;
//   country_from?: string;
//   city_to?: string;
//   city_from?: string;
//   page?: number;
//   [key: string]: any; // Дозволить приймати додаткові параметри, якщо потрібно
// }
export interface TenderListFilters {
  active?: boolean;
  archive?: boolean;
  page?: number;
  limit?: number;
  [key: string]: any;
}
export const useLoadById = (id?: number | string | null) => {
  return useQuery<LoadApiItem>({
    queryKey: ["load", id],
    queryFn: () => loadService.getOneLoad(Number(id)),
    enabled: !!id,
  });
};

export const useLoads = (filters: TenderListFilters = {}) => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { load: socket } = useSockets();

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

  // ВИПРАВЛЕНО: Функція тепер приймає чистий об'єкт filters
  const matchesFilters = useCallback(
    (item: LoadApiItem, currentFilters: any) => {
      if (!item) return false;

      const checkRules: Record<string, (val: any) => boolean> = {
        status: (val) => String(item.status) === String(val),

        // Перевірка "Мої заявки"
        my: (val) => {
          if (val === "true" || val === true) {
            return Number(item.id_usr) === Number(profile?.id);
          }
          return true;
        },

        // Перевірка активності (якщо потрібно фільтрувати за внутрішнім станом)
        active: (val) => {
          if (val === true) {
            // Тут логіка залежить від вашої моделі даних, наприклад:
            return item.status !== "deleted" && item.status !== "closed";
          }
          return true;
        },

        // Країни та міста
        // КРАЇНИ (обробка списку через кому)
        country_from: (val) => {
          const selectedCountries = String(val).split(",");
          return (item.crm_load_route_from || []).some((r) =>
            selectedCountries.includes(String(r.ids_country)),
          );
        },
        country_to: (val) => {
          const selectedCountries = String(val).split(",");
          return (item.crm_load_route_to || []).some((r) =>
            selectedCountries.includes(String(r.ids_country)),
          );
        },

        city_from: (val) =>
          (item.crm_load_route_from || []).some((r) =>
            r.city?.toLowerCase().includes(String(val).toLowerCase()),
          ),
        city_to: (val) =>
          (item.crm_load_route_to || []).some((r) =>
            r.city?.toLowerCase().includes(String(val).toLowerCase()),
          ),

        // Регіони (підтримка обох назв ключів)
        region_from: (val) => {
          const selectedRegions = String(val).split(",").map(Number);
          return (item.crm_load_route_from || []).some((r) =>
            selectedRegions.includes(Number(r.ids_region)),
          );
        },
        regionId: (val) =>
          (item.crm_load_route_from || []).some(
            (r) => Number(r.ids_region) === Number(val),
          ),
        region_to: (val) => {
          const selectedRegions = String(val).split(",").map(Number);
          return (item.crm_load_route_to || []).some((r) =>
            selectedRegions.includes(Number(r.ids_region)),
          );
        },

        search: (val) => {
          const s = String(val).toLowerCase();
          return !!(
            item.id?.toString().includes(s) ||
            (item.crm_load_route_from || []).some((r) =>
              r.city?.toLowerCase().includes(s),
            ) ||
            (item.crm_load_route_to || []).some((r) =>
              r.city?.toLowerCase().includes(s),
            )
          );
        },
      };

      return Object.entries(currentFilters).every(([key, filterValue]) => {
        console.log(key, filterValue, "KEY FILTER VALUE 128");
        // Пропускаємо порожні значення, пагінацію та ліміти
        if (
          filterValue === undefined ||
          filterValue === null ||
          filterValue === "" ||
          ["page", "limit"].includes(key)
        ) {
          return true;
        }

        if (checkRules[key]) {
          console.log(checkRules[key], "CHECKRULES KEY");

          return checkRules[key](filterValue);
        }

        // Якщо прийшов фільтр, для якого ми не написали правило (наприклад, trailer_type),
        // поки що повертаємо true, щоб не зламати все, або додай правило вище.
        return true;
      });
    },
    [profile?.id], // Важливо додати profile?.id сюди
  );
  const updateLocalCache = useCallback(
    (newItem: LoadApiItem) => {
      if (!newItem || !newItem.id) return;

      queryClient.setQueryData<IApiResponse<LoadApiItem[]>>(queryKey, (old) => {
        if (!old?.content) return old;

        // ВИПРАВЛЕНО: передаємо актуальний об'єкт filters
        const isMatch = matchesFilters(newItem, filters);
        const hasCars = Number(newItem.car_count_actual) > 0;
        const shouldBeInList = isMatch && hasCars;

        const otherItems = old.content.filter((l) => l.id !== newItem.id);

        return {
          ...old,
          content: shouldBeInList
            ? [{ ...newItem }, ...otherItems].slice(0, 50)
            : otherItems,
        };
      });

      queryClient.setQueryData(["load", newItem.id], newItem);
    },
    [queryClient, queryKey, matchesFilters, filters], // filters додано в залежності
  );

  const updateItemOnly = useCallback(
    (newItem: LoadApiItem) => {
      queryClient.setQueryData<IApiResponse<LoadApiItem[]>>(queryKey, (old) => {
        if (!old?.content) return old;
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

  const removeFromCache = useCallback(
    (id: number) => {
      queryClient.setQueryData<IApiResponse<LoadApiItem[]>>(queryKey, (old) => {
        if (!old?.content) return old;
        return {
          ...old,
          content: old.content.filter((item) => Number(item.id) !== Number(id)),
        };
      });
      queryClient.removeQueries({ queryKey: ["load", id] });
    },
    [queryClient, queryKey],
  );

  const { mutateAsync: deleteCargo, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => loadService.deleteLoad(id),
    onSuccess: (_, id) => {
      removeFromCache(id);
      eventBus.emit("load_deleted", id);
    },
  });
  const hasRequiredParams =
    filters.active !== undefined || filters.archive !== undefined;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () => loadService.getLoads(params),
    enabled: hasRequiredParams, // Це КЛЮЧ до відміни першого порожнього запиту
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

  useEffect(() => {
    if (!profile?.id || !socket) return;

    // 1. Групуємо логіку обробників для чистоти
    const h = {
      cache: (d: LoadApiItem) => updateLocalCache(d),
      item: (d: LoadApiItem) => updateItemOnly(d),
      shake: (d: LoadApiItem) => {
        updateLocalCache(d);
        eventBus.emit("cargo_shake", d.id);
      },
      date: (d: LoadApiItem) => {
        updateLocalCache(d);
        eventBus.emit("update_load_date", d.id);
      },
      addCar: (d: LoadApiItem) => {
        updateLocalCache(d);
        eventBus.emit("load_add_car", d.id);
      },
      removeCar: (d: LoadApiItem) => {
        updateLocalCache(d);
        eventBus.emit("load_remove_car", d.id);
      },
      delete: (id: number) => removeFromCache(id),
    };

    // 2. Мапа подій (Socket Event -> Handler)
    const eventMap: Record<string, Function> = {
      // Події, що викликають "трясіння" картки (cargo_shake)
      [SOCKET_EVENTS.LOAD.UPDATE]: h.shake,
      [SOCKET_EVENTS.LOAD.EDIT]: h.shake,
      [SOCKET_EVENTS.LOAD.CLOSE_CAR_BY_MANAGER]: h.shake,

      // Події машин
      [SOCKET_EVENTS.LOAD.ADD_CAR]: h.addCar,
      [SOCKET_EVENTS.LOAD.REMOVE_CAR]: h.removeCar,

      // Інші
      [SOCKET_EVENTS.LOAD.NEW]: h.cache,
      [SOCKET_EVENTS.LOAD.DATE_UPDATE]: h.date,
      [SOCKET_EVENTS.LOAD.DELETE]: h.delete,

      // Тільки оновлення даних (без візуальних ефектів shake)
      [SOCKET_EVENTS.LOAD.COMMENT]: h.item,
      [SOCKET_EVENTS.LOAD.COMMENT_UPDATE]: h.item,
      [SOCKET_EVENTS.LOAD.CHAT_COUNT_UPDATE]: h.item,
    };

    // Масова підписка
    Object.entries(eventMap).forEach(([event, handler]) => {
      socket.on(event, handler as any);
    });

    return () => {
      Object.entries(eventMap).forEach(([event, handler]) => {
        socket.off(event, handler as any);
      });
    };
  }, [profile?.id, socket, updateLocalCache, updateItemOnly, removeFromCache]);
  const isReallyLoading = isLoading || (hasRequiredParams && !data);
  return {
    loads: data?.content ?? [],
    pagination: data?.props?.pagination,
    isLoading: isReallyLoading,
    isSaving,
    isRefreshing,
    error,
    refetch,
    saveCargo,
    refreshLoadTime,
    updateItemOnly,
    queryKey,
    deleteCargo,
    isDeleting,
    removeFromCache,
  };
};
