"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useCallback } from "react";
import api from "@/shared/api/instance.api";
import { loadService } from "../services/load.service";
import { useAuth } from "@/shared/providers/AuthCheckProvider";
import { useSockets } from "@/shared/providers/SocketProvider";
import { LoadApiItem } from "../types/load.type";
import { IApiResponse } from "@/shared/api/api.type";
import { AppEventType, eventBus } from "@/shared/lib/event-bus";

// --- Types ---
export interface TenderListFilters {
  active?: boolean;
  archive?: boolean;
  page?: number;
  limit?: number;
  [key: string]: any;
}

// --- Constants & Helpers ---
const FILTER_RULES: Record<string, (item: LoadApiItem, val: any, profileId?: number) => boolean> = {
  status: (item, val) => String(item.status) === String(val),
  my: (item, val, profileId) => {
    if (val === "true" || val === true) return Number(item.id_usr) === profileId;
    return true;
  },
  active: (item, val) => {
    if (val === true) return item.status !== "deleted" && item.status !== "closed";
    return true;
  },
  country_from: (item, val) => {
    const selected = String(val).split(",");
    return (item.crm_load_route_from || []).some(r => selected.includes(String(r.ids_country)));
  },
  country_to: (item, val) => {
    const selected = String(val).split(",");
    return (item.crm_load_route_to || []).some(r => selected.includes(String(r.ids_country)));
  },
  city_from: (item, val) =>
    (item.crm_load_route_from || []).some(r => r.city?.toLowerCase().includes(String(val).toLowerCase())),
  city_to: (item, val) =>
    (item.crm_load_route_to || []).some(r => r.city?.toLowerCase().includes(String(val).toLowerCase())),
  region_from: (item, val) => {
    const selected = String(val).split(",").map(Number);
    return (item.crm_load_route_from || []).some(r => selected.includes(Number(r.ids_region)));
  },
  region_to: (item, val) => {
    const selected = String(val).split(",").map(Number);
    return (item.crm_load_route_to || []).some(r => selected.includes(Number(r.ids_region)));
  },
  regionId: (item, val) =>
    (item.crm_load_route_from || []).some(r => Number(r.ids_region) === Number(val)),
  search: (item, val) => {
    const s = String(val).toLowerCase();
    return !!(
      item.id?.toString().includes(s) ||
      item.crm_load_route_from?.some(r => r.city?.toLowerCase().includes(s)) ||
      item.crm_load_route_to?.some(r => r.city?.toLowerCase().includes(s))
    );
  },
};

// --- Hooks ---

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

  // 1. Params & Keys
  const params = useMemo(() => {
    const p = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "" && !(Array.isArray(val) && val.length === 0)) {
        p.set(key, String(val));
      }
    });
    return p;
  }, [filters]);

  const queryKey = useMemo(() => ["loads", params.toString()], [params]);
  const hasRequiredParams = filters.active !== undefined || filters.archive !== undefined;

  // 2. Fetch Data
  const { data, isLoading, error, refetch } = useQuery<IApiResponse<LoadApiItem[]>>({
    queryKey,
    queryFn: () => loadService.getLoads(params),
    enabled: hasRequiredParams,
    staleTime: 1000 * 60,
  });

  // 3. Cache Matcher Logic
  const matchesFilters = useCallback(
    (item: LoadApiItem, currentFilters: TenderListFilters) => {
      if (!item) return false;
      return Object.entries(currentFilters).every(([key, filterValue]) => {
        if (!filterValue || ["page", "limit"].includes(key)) return true;
        const rule = FILTER_RULES[key];
        return rule ? rule(item, filterValue, profile?.id) : true;
      });
    },
    [profile?.id]
  );

  // 4. Cache Update Actions
  const updateLocalCache = useCallback(
    (newItem: LoadApiItem) => {
      if (!newItem?.id) return;

      queryClient.setQueryData<IApiResponse<LoadApiItem[]>>(queryKey, (old) => {
        if (!old?.content) return old;

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
    [queryClient, queryKey, matchesFilters, filters]
  );

  const updateItemOnly = useCallback(
    (newItem: LoadApiItem) => {
      queryClient.setQueryData<IApiResponse<LoadApiItem[]>>(queryKey, (old) => {
        if (!old?.content) return old;
        return {
          ...old,
          content: old.content.map((item) => (item.id === newItem.id ? { ...item, ...newItem } : item)),
        };
      });
      queryClient.setQueryData(["load", newItem.id], newItem);
    },
    [queryClient, queryKey]
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
    [queryClient, queryKey]
  );

  // 5. Mutations
  const { mutateAsync: saveCargo, isPending: isSaving } = useMutation({
    mutationFn: (payload: any) => api.post("/crm/load/save", payload).then((r) => r.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["loads"], exact: false });
      if (data?.id) updateLocalCache(data);
    },
  });

  const { mutateAsync: deleteCargo, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => loadService.deleteLoad(id),
    onSuccess: (_, id) => {
      removeFromCache(id);
      eventBus.emit("load_deleted", id);
    },
  });

  const { mutateAsync: refreshLoadTime, isPending: isRefreshing } = useMutation({
    mutationFn: (id: number) => api.post("/crm/load/load-update", { id }).then((r) => r.data),
    onSuccess: (updatedItem) => updateLocalCache(updatedItem),
  });

  // 6. Socket Side-Effects
  useEffect(() => {
    if (!profile?.id || !socket) return;

    const handlers = {
      update: (data: LoadApiItem) => {
        updateLocalCache(data);
        eventBus.emit("cargo_shake", data.id);
      },
      date: (data: LoadApiItem) => {
        updateLocalCache(data);
        eventBus.emit("update_load_date", data.id);
      },
      cars: (data: LoadApiItem, event: string) => {
        updateLocalCache(data);
        eventBus.emit(event as AppEventType, data.id);
      },
      comment: (data: LoadApiItem) => updateItemOnly(data),
      delete: (id: number) => removeFromCache(id),
    };

    socket.on("new_load", updateLocalCache);
    socket.on("update_load", handlers.update);
    socket.on("edit_load", handlers.update);
    socket.on("update_load_date", handlers.date);
    socket.on("new_load_comment", handlers.comment);
    socket.on("update_chat_count_load", handlers.comment);
    socket.on("load_add_car", (d) => handlers.cars(d, "load_add_car"));
    socket.on("load_remove_car", (d) => handlers.cars(d, "load_remove_car"));
    socket.on("delete_load", handlers.delete);

    return () => {
      socket.off("new_load");
      socket.off("update_load");
      socket.off("edit_load");
      socket.off("update_load_date");
      socket.off("new_load_comment");
      socket.off("update_chat_count_load");
      socket.off("load_add_car");
      socket.off("load_remove_car");
      socket.off("delete_load");
    };
  }, [profile?.id, socket, updateLocalCache, updateItemOnly, removeFromCache]);

  return {
    loads: data?.content ?? [],
    pagination: data?.props?.pagination,
    isLoading: isLoading || (hasRequiredParams && !data),
    isSaving,
    isRefreshing,
    isDeleting,
    error,
    refetch,
    saveCargo,
    deleteCargo,
    refreshLoadTime,
    updateItemOnly,
    removeFromCache,
    queryKey,
  };
};