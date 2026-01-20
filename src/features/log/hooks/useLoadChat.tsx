"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useCallback, useRef } from "react";
import { loadService } from "../services/load.service";
import { useSockets } from "@/shared/providers/SocketProvider";
import { toast } from "sonner";
import { playSound } from "@/shared/helpers/play-sound";

export const useCargoChat = (cargoId: number, isOpen: boolean) => {
  const queryClient = useQueryClient();
  const { load } = useSockets();
  const queryKey = ["cargo-comments", cargoId];
  const loadsQueryKey = ["loads"]; // Ключ для списку вантажів

  const lastReadIdRef = useRef<number | null>(null);

  // Функція для оновлення стану списку (лічильників та часу прочитання)
  const invalidateLoadsList = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: loadsQueryKey,
      exact: false,
      // Використовуємо refetchType: 'none', щоб не викликати миттєве HTTP-запити для всіх сторінок,
      // але щоб при наступному рендері списку дані були свіжими.
      refetchType: "active",
    });
  }, [queryClient]);

  const markAsRead = useCallback(async () => {
    if (!cargoId || !isOpen) return;
    try {
      await loadService.markAsRead(cargoId);
      // Оновлюємо список вантажів, щоб прибрати "червону крапку" (unread status)
      invalidateLoadsList();
    } catch (error) {
      console.error("Помилка прочитання:", error);
    }
  }, [cargoId, isOpen, invalidateLoadsList]);

  // 1. Отримання коментарів
  const { data: comments = [], isLoading: isFetching } = useQuery({
    queryKey,
    queryFn: () => loadService.getComments(cargoId),
    enabled: !!cargoId && isOpen,
    staleTime: 1000 * 30,
  });

  // 2. Слідкуємо за новими повідомленнями для markAsRead
  useEffect(() => {
    if (isOpen && comments.length > 0) {
      const latestMsgId = comments[comments.length - 1].id;
      if (latestMsgId !== lastReadIdRef.current) {
        markAsRead();
        lastReadIdRef.current = latestMsgId;
      }
    }
  }, [comments, isOpen, markAsRead]);

  // 3. Мутація для відправки
  const { mutateAsync: sendComment, isPending: isSending } = useMutation({
    mutationFn: (notes: string) =>
      loadService.saveComment({ id_crm_load: cargoId, notes }),
    onSuccess: () => {
      // 1. Оновлюємо сам чат
      queryClient.invalidateQueries({ queryKey });
      // 2. Оновлюємо список вантажів (бо там змінився comment_count та comment_last_time)
      invalidateLoadsList();
      // 3. Одразу помічаємо як прочитане (своє ж повідомлення)
      markAsRead();
    },
    onError: () => {
      toast.error("Не вдалося відправити коментар ❌");
    },
  });

  // 4. Сокети
  useEffect(() => {
    if (!load || !cargoId || !isOpen) return;

    const handleNewComment = (updatedId: number) => {
      if (Number(updatedId) === cargoId) {
        queryClient.invalidateQueries({ queryKey });
        // Коли приходить сокет, список loads теж має дізнатися про нове повідомлення
        invalidateLoadsList();
        playSound("/sounds/chat-new.mp3");
      }
    };

    load.on("edit_load_comment", handleNewComment);
    return () => {
      load.off("edit_load_comment", handleNewComment);
    };
  }, [load, cargoId, isOpen, queryClient, queryKey, invalidateLoadsList]);

  return { comments, isFetching, isSending, sendComment };
};
