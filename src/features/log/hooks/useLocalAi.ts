"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { localAiService } from "../services/local-ai.service";
import { ILocalAiAnswer } from "../ai/types/local-ai.types";

const SESSIONS_KEY = ["local-ai", "sessions"];
const messagesKey = (sessionId?: string) => [
  "local-ai",
  "messages",
  sessionId ?? "none",
];

/** Стан локальної моделі — індикатор у шапці чату. */
export const useLocalAiHealth = () =>
  useQuery({
    queryKey: ["local-ai", "health"],
    queryFn: localAiService.getHealth,
    // LM Studio запускають вручну, тому періодично перевіряємо, чи він піднявся
    refetchInterval: 60_000,
    retry: false,
  });

export const useLocalAiSessions = () =>
  useQuery({
    queryKey: SESSIONS_KEY,
    queryFn: localAiService.getSessions,
  });

export const useLocalAiMessages = (sessionId?: string) =>
  useQuery({
    queryKey: messagesKey(sessionId),
    queryFn: () => localAiService.getMessages(sessionId!),
    enabled: Boolean(sessionId),
  });

/**
 * Надсилання повідомлення.
 *
 * Кеш повідомлень оновлюємо вручну відповіддю сервера, а не інвалідацією:
 * відповідь моделі вже містить збережене повідомлення, і зайвий GET
 * лише додав би мигання списку.
 */
export const useSendLocalAiMessage = (
  onSession?: (sessionId: string) => void,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ text, sessionId }: { text: string; sessionId?: string }) =>
      localAiService.sendMessage(text, sessionId),

    onSuccess: (answer: ILocalAiAnswer) => {
      onSession?.(answer.sessionId);

      // Розмову встиг витіснити ліміт або строк зберігання — мовчазна підміна
      // виглядала б так, ніби листування просто зникло
      if (answer.sessionReplaced) {
        toast.info("Попередню розмову вже видалено — відповідь у новій");
      }

      queryClient.invalidateQueries({
        queryKey: messagesKey(answer.sessionId),
      });
      queryClient.invalidateQueries({ queryKey: SESSIONS_KEY });
    },

    onError: (error: any) => {
      const message =
        error?.response?.data?.message ??
        "Не вдалося отримати відповідь від локальної моделі";
      toast.error(Array.isArray(message) ? message.join(", ") : message);
    },
  });
};

/*
 * Хука створення сесії тут навмисно немає: «Нова розмова» лише очищає екран,
 * а сесію заводить сервер разом із першим повідомленням. Так порожні розмови
 * не займають слоти в ліміті й не з'їдають памʼять Redis.
 * Ендпоінт POST /local-ai/sessions лишається доступним через localAiService.
 */

export const useDeleteLocalAiSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => localAiService.deleteSession(sessionId),
    onSuccess: () => {
      toast.success("Розмову видалено");
      queryClient.invalidateQueries({ queryKey: SESSIONS_KEY });
    },
    onError: () => toast.error("Не вдалося видалити розмову"),
  });
};

/** Очищення всієї історії — звільняє памʼять, яку займають збережені таблиці. */
export const useDeleteAllLocalAiSessions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: localAiService.deleteAllSessions,
    onSuccess: ({ deleted }) => {
      toast.success(
        deleted ? `Видалено розмов: ${deleted}` : "Розмов не було",
      );
      queryClient.invalidateQueries({ queryKey: SESSIONS_KEY });
    },
    onError: () => toast.error("Не вдалося очистити історію"),
  });
};
