"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useCallback, useRef } from "react";
import { loadService } from "../services/load.service";
import { useSockets } from "@/shared/providers/SocketProvider";
import { playSound } from "@/shared/helpers/play-sound";
import { LoadApiItem } from "../types/load.type";
import { useAuth } from "@/shared/providers/AuthCheckProvider";

export const useCargoChat = (cargoId: number, isOpen: boolean) => {
  const queryClient = useQueryClient();
  const { load: socket } = useSockets();
  const { profile } = useAuth();
  const chatQueryKey = ["cargo-comments", cargoId];
  const justSentRef = useRef<boolean>(false);

  // Функція для ручного оновлення кешу списку вантажів
  const updateCache = useCallback(
    (newData: Partial<LoadApiItem>) => {
      const futureTime = new Date(Date.now() + 10000).toISOString();
      const optimisticData = { ...newData, comment_read_time: futureTime };

      // Знаходимо всі активні запити списків (пошук, фільтри і т.д.)
      const cacheKeys = queryClient
        .getQueryCache()
        .findAll({ queryKey: ["loads"] });

      cacheKeys.forEach((query) => {
        queryClient.setQueryData(query.queryKey, (old: any) => {
          if (!old?.content) return old;
          return {
            ...old,
            content: old.content.map((i: any) =>
              i.id === cargoId ? { ...i, ...optimisticData } : i,
            ),
          };
        });
      });

      // Оновлюємо кеш детальної сторінки/картки вантажу
      queryClient.setQueryData(["load", cargoId], (old: any) =>
        old ? { ...old, ...optimisticData } : old,
      );
    },
    [queryClient, cargoId],
  );

  const { data: comments = [], isLoading: isFetching } = useQuery({
    queryKey: chatQueryKey,
    queryFn: () => loadService.getComments(cargoId),
    enabled: !!cargoId && isOpen,
  });

  const { mutateAsync: saveComment, isPending: isSaving } = useMutation({
    mutationFn: (payload: { notes: string; id?: number }) =>
      loadService.saveComment({
        id_crm_load: cargoId,
        notes: payload.notes,
        id: payload?.id,
      }),
    onMutate: () => {
      justSentRef.current = true;
    },
    onSuccess: (responseData) => {
      queryClient.invalidateQueries({ queryKey: chatQueryKey });
      // Оновлюємо стан картки відразу після нашої дії
      if (responseData) updateCache(responseData);
      setTimeout(() => {
        justSentRef.current = false;
      }, 2000);
    },
  });

  const { mutateAsync: deleteComment, isPending: isDeleting } = useMutation({
    mutationFn: (commentId: number) =>
      loadService.deleteComment(commentId, cargoId),
    onSuccess: (responseData) => {
      queryClient.invalidateQueries({ queryKey: chatQueryKey });
      if (responseData) updateCache(responseData);
    },
  });

  useEffect(() => {
    if (!socket || !cargoId || !isOpen) return;

    // Обробник подій чату
    const handleCommentEvent = (data: any) => {
      const targetLoadId =
        data.id_crm_load || (typeof data === "object" ? data.id : data);

      if (Number(targetLoadId) === cargoId) {
        if (justSentRef.current) return;
        queryClient.invalidateQueries({ queryKey: chatQueryKey });

        // Якщо прийшло повідомлення від іншого користувача — звук
        if (data.sender_id !== profile?.id) playSound("notification");
      }
    };

    // НОВИЙ ОБРОБНИК: оновлення картки через сокет
    const handleLoadUpdate = (data: any) => {
      // Перевіряємо, чи це наш вантаж
      if (Number(data.id) === cargoId) {
        // Якщо це оновлення прийшло не від нас, оновлюємо кеш лічильників
        if (data.sender_id !== profile?.id) {
          updateCache(data);
        }
      }
    };

    // Слухаємо події чату
    socket.on("new_load_comment", handleCommentEvent);
    socket.on("load_comment_updated", handleCommentEvent);
    socket.on("comment_deleted", handleCommentEvent);

    // СЛУХАЄМО ПОДІЮ ОНОВЛЕННЯ ВАНТАЖУ (лічильники)
    socket.on("load_updated", handleLoadUpdate);

    return () => {
      socket.off("new_load_comment", handleCommentEvent);
      socket.off("load_comment_updated", handleCommentEvent);
      socket.off("comment_deleted", handleCommentEvent);
      socket.off("load_updated", handleLoadUpdate);
    };
  }, [
    socket,
    cargoId,
    isOpen,
    queryClient,
    chatQueryKey,
    profile?.id,
    updateCache,
  ]);

  return {
    comments,
    isFetching,
    isSaving,
    saveComment,
    deleteComment,
    isDeleting,
  };
};
