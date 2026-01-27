"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useCallback, useRef, useMemo } from "react";
import { loadService } from "../services/load.service";
import { useSockets } from "@/shared/providers/SocketProvider";
import { playSound } from "@/shared/helpers/play-sound";
import { LoadApiItem } from "../types/load.type";
import { useAuth } from "@/shared/providers/AuthCheckProvider";

export const useCargoChat = (cargoId: number, isOpen: boolean) => {
  const queryClient = useQueryClient();
  const { load: socket } = useSockets();
  const { profile } = useAuth();
  
  const chatQueryKey = useMemo(() => ["cargo-comments", cargoId], [cargoId]);
  const justSentRef = useRef<boolean>(false);
  const isOpenRef = useRef(isOpen);

  // Оновлюємо реф, щоб сокети завжди бачили актуальний стан без перепідписки
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  const updateCache = useCallback((newData: Partial<LoadApiItem>) => {
    const optimisticData = { 
      ...newData, 
      comment_read_time: new Date(Date.now() + 10000).toISOString() 
    };

    // Оновлюємо списки
    queryClient.setQueriesData({ queryKey: ["loads"] }, (old: any) => {
      if (!old?.content) return old;
      return {
        ...old,
        content: old.content.map((i: any) =>
          i.id === cargoId ? { ...i, ...optimisticData } : i
        ),
      };
    });

    // Оновлюємо деталку
    queryClient.setQueryData(["load", cargoId], (old: any) => 
      old ? { ...old, ...optimisticData } : old
    );
  }, [queryClient, cargoId]);

  const { data: comments = [], isLoading: isFetching } = useQuery({
    queryKey: chatQueryKey,
    queryFn: () => loadService.getComments(cargoId),
    enabled: !!cargoId && isOpen,
  });

  const { mutate: markRead } = useMutation({
    mutationFn: () => loadService.markAsRead(cargoId),
    onSuccess: (res) => res && updateCache(res),
  });

  const { mutateAsync: saveComment, isPending: isSaving } = useMutation({
    mutationFn: (payload: { notes: string; id?: number }) =>
      loadService.saveComment({ id_crm_load: cargoId, notes: payload.notes, id: payload?.id }),
    onMutate: () => { justSentRef.current = true; },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: chatQueryKey });
      if (res) updateCache(res);
      setTimeout(() => { justSentRef.current = false; }, 2000);
    },
  });

  const { mutateAsync: deleteComment, isPending: isDeleting } = useMutation({
    mutationFn: (commentId: number) => loadService.deleteComment(commentId, cargoId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: chatQueryKey });
      if (res) updateCache(res);
    },
  });

  // Ефект для позначення прочитаним при відкритті
  useEffect(() => {
    if (isOpen && cargoId) {
      const timer = setTimeout(() => markRead(), 300); // Невеликий debounce
      return () => clearTimeout(timer);
    }
  }, [isOpen, cargoId, markRead]);

  // Єдиний ефект для сокетів
  useEffect(() => {
    if (!socket || !cargoId) return;

    const handleEvent = (data: any) => {
      const targetLoadId = data.id_crm_load || data.id;
      if (Number(targetLoadId) !== cargoId) return;

      // Оновлюємо дані чату
      if (!justSentRef.current) {
        queryClient.invalidateQueries({ queryKey: chatQueryKey });
      }

      // Логіка сповіщень та "прочитання"
      if (data.sender_id !== profile?.id) {
        if (isOpenRef.current) {
          markRead();
        } else {
          playSound("notification");
          // Якщо це просто update (лічильники), оновлюємо кеш
          if (data.id) updateCache(data); 
        }
      }
    };

    socket.on("new_load_comment", handleEvent);
    socket.on("load_comment_updated", handleEvent);
    socket.on("comment_deleted", handleEvent);
    socket.on("load_updated", handleEvent);

    return () => {
      socket.off("new_load_comment", handleEvent);
      socket.off("load_comment_updated", handleEvent);
      socket.off("comment_deleted", handleEvent);
      socket.off("load_updated", handleEvent);
    };
  }, [socket, cargoId, queryClient, chatQueryKey, profile?.id, markRead, updateCache]);

  return { comments, isFetching, isSaving, saveComment, deleteComment, isDeleting };
};