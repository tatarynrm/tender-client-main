"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useCallback, useRef } from "react";
import { loadService } from "../services/load.service";
import { useSockets } from "@/shared/providers/SocketProvider";
import { toast } from "sonner";
import { playSound } from "@/shared/helpers/play-sound";
import { LoadApiItem } from "../types/load.type";
import { IApiResponse } from "@/shared/api/api.type";

export const useCargoChat = (cargoId: number, isOpen: boolean) => {
  const queryClient = useQueryClient();
  const { load: socket } = useSockets();
  const chatQueryKey = ["cargo-comments", cargoId];

  const justSentRef = useRef<boolean>(false);

  const updateCache = useCallback(
    (newData: Partial<LoadApiItem>) => {
      const futureTime = new Date(Date.now() + 10000).toISOString();

      // 1. Створюємо ДАНІ для оновлення
      const optimisticData = {
        ...newData,
        comment_read_time: futureTime,
      };

      // 2. Знаходимо всі запити ["loads", ...]
      const cacheKeys = queryClient
        .getQueryCache()
        .findAll({ queryKey: ["loads"] });

      cacheKeys.forEach((query) => {
        queryClient.setQueryData(query.queryKey, (old: any) => {
          if (!old?.content) return old;

          // ВАЖЛИВО: Створюємо НОВИЙ масив content та НОВИЙ об'єкт i
          const newContent = old.content.map((i: any) => {
            if (i.id === cargoId) {
              // Повертаємо новий об'єкт, щоб React Card побачив зміну посилання
              return { ...i, ...optimisticData };
            }
            return i;
          });

          // Повертаємо новий об'єкт відповіді
          return {
            ...old,
            content: newContent,
          };
        });
      });

      // 3. Оновлюємо індивідуальний об'єкт (useLoadById)
      queryClient.setQueryData(["load", cargoId], (old: any) =>
        old ? { ...old, ...optimisticData } : old,
      );

      // 4. ПРИМУСОВИЙ сигнал React-у: "Дані змінено, перемалюй підписників"
      queryClient.invalidateQueries({
        queryKey: ["loads"],
        exact: false,
        refetchType: "none",
      });
    },
    [queryClient, cargoId],
  );
  const markAsRead = useCallback(async () => {
    if (!cargoId || !isOpen) return;
    try {
      await loadService.markAsRead(cargoId);
      updateCache({});
    } catch (e) {
      console.error("Mark read error:", e);
    }
  }, [cargoId, isOpen, updateCache]);

  useEffect(() => {
    // if (isOpen && cargoId) {
    //   markAsRead();
    // }
    if (isOpen) {
      markAsRead();
    }
  }, [isOpen, cargoId, markAsRead]);

  const { data: comments = [], isLoading: isFetching } = useQuery({
    queryKey: chatQueryKey,
    queryFn: () => loadService.getComments(cargoId),
    enabled: !!cargoId && isOpen,
  });

  const { mutateAsync: sendComment, isPending: isSending } = useMutation({
    mutationFn: (notes: string) =>
      loadService.saveComment({ id_crm_load: cargoId, notes }),
    onMutate: () => {
      justSentRef.current = true;
      updateCache({});
    },
    onSuccess: (responseData) => {
      if (responseData) updateCache(responseData);
      queryClient.invalidateQueries({ queryKey: chatQueryKey });
      // markAsRead();

      setTimeout(() => {
        justSentRef.current = false;
      }, 2000);
    },
  });

  useEffect(() => {
    if (!socket || !cargoId || !isOpen) return;

    const onCommentUpdate = (data: any) => {
      const incomingId = typeof data === "object" ? data.id : data;

      if (Number(incomingId) === cargoId) {
        // 1. Якщо ми самі щойно відправили повідомлення — ігноруємо
        if (justSentRef.current) return;

        queryClient.invalidateQueries({ queryKey: chatQueryKey });

        // 2. Оновлюємо кеш списку вантажів
        if (typeof data === "object") {
          queryClient.setQueriesData<IApiResponse<LoadApiItem[]>>(
            { queryKey: ["loads"], exact: false },
            (old) => {
              if (!old?.content) return old;
              return {
                ...old,
                content: old.content.map((i) =>
                  i.id === cargoId ? { ...i, ...data } : i,
                ),
              };
            },
          );
        }

        // 3. ПЕРЕВІРКА ЗВУКУ:
        // Граємо звук тільки якщо ЧАТ ЗАКРИТИЙ (isOpen === false)
        // Але оскільки цей хук викликається ТІЛЬКИ коли чат відкритий,
        // то звук тут взагалі не потрібен, бо користувач і так бачить нове повідомлення.
        // Звук для нових повідомлень має бути в загальному хуку useLoads.

        // Якщо ви все ж хочете звук тут, але не хочете щоб він "пікав" при відкритті:
        // playSound("/sounds/chat-new.mp3"); // <--- ВИДАЛІТЬ АБО ЗАКОМЕНТУЙТЕ ЦЕ ТУТ
      }
    };

    socket.on("new_load_comment", onCommentUpdate);
    return () => {
      socket.off("new_load_comment", onCommentUpdate);
    };
  }, [socket, cargoId, isOpen, queryClient, chatQueryKey]);
  return { comments, isFetching, isSending, sendComment };
};
