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
  
  // Зберігаємо ID останнього прочитаного повідомлення, щоб не дублювати запити
  const lastReadIdRef = useRef<number | null>(null);

  const markAsRead = useCallback(async () => {
    if (!cargoId || !isOpen) return;
    try {
      await loadService.markAsRead(cargoId);
      // Важливо: invalidateQueries тільки для списку, щоб оновити лічильник/крапку
      // Використовуємо refetchType: 'none', щоб не викликати миттєве перевантаження всього списку
      queryClient.invalidateQueries({ queryKey: ["loads"], exact: false, refetchType: 'none' });
    } catch (error) {
      console.error("Помилка прочитання:", error);
    }
  }, [cargoId, isOpen, queryClient]);

  // 1. Отримання коментарів (тільки коли isOpen: true)
  const { data: comments = [], isLoading: isFetching } = useQuery({
    queryKey,
    queryFn: () => loadService.getComments(cargoId),
    enabled: !!cargoId && isOpen,
    staleTime: 1000 * 30, // 30 секунд дані вважаються свіжими
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
    onSuccess: (newComment) => {
      // Оптимістично додаємо або просто інвалідуємо чат
      queryClient.invalidateQueries({ queryKey });
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
        // Просто кажемо React Query, що дані застаріли
        queryClient.invalidateQueries({ queryKey });
        playSound("/sounds/chat-new.mp3");
      }
    };

    load.on("edit_load_comment", handleNewComment);
    return () => {
      load.off("edit_load_comment", handleNewComment);
    };
  }, [load, cargoId, isOpen, queryClient, queryKey]);

  return { comments, isFetching, isSending, sendComment };
};