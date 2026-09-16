"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/shared/providers/AuthCheckProvider";
import { useOnlineUsers } from "@/shared/hooks/useOnlineUsers";
import { eventBus, AppEventType } from "@/shared/lib/event-bus";

import { LoadApiItem } from "../../types/load.type";
import { useAddCars } from "../../hooks/useAddLoadCars";
import { useRemoveCars } from "../../hooks/useRemoveLoadCars";
import { useCloseCargoByManager } from "../../hooks/useCloseByManager";

export const EVENT_LABELS: Record<string, string> = {
  cargo_shake: "Оновлено",
  update_comment: "Новий коментар",
  update_load_date: "Заявку оновлено",
  load_add_car: "Додано авто",
  load_remove_car: "Видалено авто",
};

const TRACKED_EVENTS: AppEventType[] = [
  "cargo_shake",
  "update_comment",
  "update_load_date",
  "load_add_car",
  "load_remove_car",
];

/**
 * Спільна логіка заявки для обох виглядів списку — плитки (CargoCard)
 * і полоски (CargoRow): точки маршруту, стан модалок, підсвітка подій,
 * копіювання та маршрут у Google Maps.
 */
export function useCargoCard(load: LoadApiItem) {
  const { profile } = useAuth();
  const onlineUsers = useOnlineUsers();

  const [isJustCreated, setIsJustCreated] = useState(false);
  const [lastEvent, setLastEvent] = useState<string | null>(null);
  const [localReadTime, setLocalReadTime] = useState<string | null>(
    load.comment_read_time || null,
  );

  // ── Модалки ────────────────────────────────────────────────────────────────
  const [selectedCargo, setSelectedCargo] = useState<LoadApiItem | null>(null);
  const [chatCargo, setChatCargo] = useState<LoadApiItem | null>(null);
  const [openAddCars, setOpenAddCars] = useState(false);
  const [openRemoveCars, setOpenRemoveCars] = useState(false);
  const [openCloseCargoByManager, setOpenCloseCargoByManager] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);

  const { mutateAsync: addCarsMutate, isLoading: isLoadingAddCars } =
    useAddCars();
  const { removeCarsMutate, isLoadingRemove } = useRemoveCars();
  const { closeCargoMutate, isLoadingCloseCargo } = useCloseCargoByManager();

  const isOnline = onlineUsers.has(String(load.id_author));

  useEffect(() => {
    if (!load.created_at) return;
    const diff = Date.now() - new Date(load.created_at).getTime();
    setIsJustCreated(diff / 1000 / 60 < 1);
  }, [load.created_at]);

  // ── Підсвітка подій по цій заявці ──────────────────────────────────────────
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    const handler = (e: Event) => {
      const custom = e as CustomEvent;
      if (custom.detail !== load.id) return;
      setLastEvent(custom.type);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setLastEvent(null), 3000);
    };

    TRACKED_EVENTS.forEach((event) => eventBus.on(event, handler as any));

    return () => {
      if (timer) clearTimeout(timer);
      TRACKED_EVENTS.forEach((event) => eventBus.off(event, handler as any));
    };
  }, [load.id]);

  // ── Точки маршруту ─────────────────────────────────────────────────────────
  const allPoints = useMemo(
    () => [...load.crm_load_route_from, ...load.crm_load_route_to],
    [load.crm_load_route_from, load.crm_load_route_to],
  );
  const firstPoint = allPoints[0];
  const lastPoint = allPoints[allPoints.length - 1];
  const middlePoints = useMemo(() => allPoints.slice(1, -1), [allPoints]);

  const canDelete = load.created_at
    ? Date.now() - new Date(load.created_at).getTime() < 3600000
    : false;

  const hasUnreadMessages = useMemo(() => {
    const lastTime = load?.comment_last_time;
    const readTime = localReadTime || load?.comment_read_time;
    if (!lastTime || !load?.comment_count) return false;
    if (!readTime) return true;
    return new Date(lastTime).getTime() > new Date(readTime).getTime() + 1000;
  }, [
    load.comment_last_time,
    load.comment_count,
    load.comment_read_time,
    localReadTime,
  ]);

  // ── Копіювання заявки ──────────────────────────────────────────────────────
  const handleCopyLoad = useCallback(() => {
    const getFlag = (code?: string) =>
      code === "UA" ? "🇺🇦" : code === "DE" ? "🇩🇪" : code === "PL" ? "🇵🇱" : "🏳️";

    const formatRoute = (points: any[]) =>
      points
        .map(
          (p) =>
            `${getFlag(p.ids_country)} ${p.city}${p.region ? ` (${p.region})` : ""}`,
        )
        .join(" — ");

    const fromPoints = formatRoute(load.crm_load_route_from);
    const toPoints = formatRoute(load.crm_load_route_to);

    const trailers =
      load.crm_load_trailer?.map((t: any) => t.trailer_type_name).join(", ") ||
      "Не вказано";

    const getPriceDisplay = () => {
      if (load.is_price_request) return "Запит ціни";
      if (!load.price || load.price === 0) return "—";
      return `${load.price.toLocaleString()} ${load.valut_name}${load.is_collective ? " (Збірний)" : ""}`;
    };

    const dateInfo = `📅 ${load.date_load}${load.date_unload ? ` — ${load.date_unload}` : ""}`;

    const textToCopy = [
      `📎 ЗАЯВКА ${load.id}`,
      `--------------------------`,
      `📍 ЗВІДКИ: ${fromPoints}`,
      `🏁 КУДИ: ${toPoints}`,
      `🗓️ ДАТА: ${dateInfo}`,
      `🚛 ТИП: ${trailers} (${load.transit_type})`,
      `🔢 К-СТЬ АВТО: ${load.car_count_actual}`,
      `💰 СТАВКА: ${getPriceDisplay()}`,
      `--------------------------`,
      `👤 Менеджер: ${load.author}`,
    ].join("\n");

    navigator.clipboard.writeText(textToCopy).then(() => {
      toast.success("Деталі заявки скопійовано", {
        icon: <Copy className="w-4 h-4 text-blue-500" />,
      });
    });
  }, [load]);

  // ── Маршрут у Google Maps ──────────────────────────────────────────────────
  const handleOpenGoogleMaps = useCallback(() => {
    if (allPoints.length < 2) {
      toast.error("Недостатньо точок для маршруту");
      return;
    }

    const origin = encodeURIComponent(
      `${firstPoint.city}, ${firstPoint.ids_country}`,
    );
    const destination = encodeURIComponent(
      `${lastPoint.city}, ${lastPoint.ids_country}`,
    );
    const waypoints = allPoints
      .slice(1, -1)
      .map((p) => encodeURIComponent(`${p.city}, ${p.ids_country}`))
      .join("|");

    const baseUrl = "https://www.google.com/maps/dir/?api=1";
    const url = `${baseUrl}&origin=${origin}&destination=${destination}${
      waypoints ? `&waypoints=${waypoints}` : ""
    }&travelmode=driving`;

    window.open(url, "_blank");
  }, [allPoints, firstPoint, lastPoint]);

  return {
    profile,
    isOnline,
    isJustCreated,
    lastEvent,
    isShaking: !!lastEvent,

    allPoints,
    firstPoint,
    lastPoint,
    middlePoints,

    canDelete,
    hasUnreadMessages,
    setLocalReadTime,

    handleCopyLoad,
    handleOpenGoogleMaps,

    selectedCargo,
    setSelectedCargo,
    chatCargo,
    setChatCargo,
    openAddCars,
    setOpenAddCars,
    openRemoveCars,
    setOpenRemoveCars,
    openCloseCargoByManager,
    setOpenCloseCargoByManager,
    openHistory,
    setOpenHistory,

    addCarsMutate,
    isLoadingAddCars,
    removeCarsMutate,
    isLoadingRemove,
    closeCargoMutate,
    isLoadingCloseCargo,
  };
}

export type CargoCardController = ReturnType<typeof useCargoCard>;
