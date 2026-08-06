"use client";

import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { localAiService } from "../services/local-ai.service";
import {
  ILocalAiAnswer,
  ILocalAiSessionPage,
} from "../ai/types/local-ai.types";

const SESSIONS_KEY = ["local-ai", "sessions"];
const messagesKey = (sessionId?: string) => [
  "local-ai",
  "messages",
  sessionId ?? "none",
];

/** Стан моделі — індикатор у шапці чату. */
export const useLocalAiHealth = () =>
  useQuery({
    queryKey: ["local-ai", "health"],
    queryFn: localAiService.getHealth,
    // Провайдер може відвалитися посеред роботи (ключ, квота, зупинений LM Studio),
    // тому індикатор періодично перепитує стан
    refetchInterval: 60_000,
    retry: false,
  });

/** Скільки розмов тягнемо за раз при скролі списку. */
export const SESSIONS_PAGE_SIZE = 20;

/**
 * Список розмов сторінками.
 *
 * Стеля зберігання — 50 розмов, і тягнути їх усі одним запитом заради панелі,
 * у яку влазить десяток рядків, немає сенсу: беремо перші 20, решта
 * довантажується при скролі вниз.
 */
export const useLocalAiSessions = () =>
  useInfiniteQuery({
    queryKey: SESSIONS_KEY,
    queryFn: ({ pageParam }) =>
      localAiService.getSessions({
        limit: SESSIONS_PAGE_SIZE,
        offset: pageParam,
      }),
    initialPageParam: 0,
    // Наступний offset — це все, що вже завантажено: сторінки не перекриваються
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore
        ? pages.reduce((sum, p) => sum + p.sessions.length, 0)
        : undefined,
  });

/** Скільки повідомлень тягнемо за раз. Одна відповідь може везти таблицю на 50 рядків. */
export const MESSAGES_PAGE_SIZE = 30;

/**
 * Історія розмови сторінками, від кінця.
 *
 * Стара версія тягнула всю переписку одним запитом: у довгій розмові це
 * мегабайти JSON (у кожній відповіді збережена таблиця даних) і секунди
 * очікування перед тим, як користувач побачить хоч щось. Тепер приходить
 * останнє вікно, а старіше довантажується при скролі вгору.
 *
 * `fetchNextPage` тут означає «сторінка СТАРІШИХ повідомлень».
 */
export const useLocalAiMessages = (sessionId?: string) =>
  useInfiniteQuery({
    queryKey: messagesKey(sessionId),
    queryFn: ({ pageParam }) =>
      localAiService.getMessages(sessionId!, {
        limit: MESSAGES_PAGE_SIZE,
        offset: pageParam,
      }),
    initialPageParam: 0,
    // Наступний offset — це все, що вже завантажено: сторінки не перекриваються
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore
        ? pages.reduce((sum, p) => sum + p.messages.length, 0)
        : undefined,
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
        "Не вдалося отримати відповідь від моделі";
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

/**
 * Видалення однієї розмови.
 *
 * Рядок зникає одразу, ще до відповіді сервера: інвалідація списку перемалювала
 * б усі завантажені сторінки й дала б помітну паузу з мигтінням. Якщо запит
 * упаде — повертаємо попередній кеш і кажемо про це.
 */
export const useDeleteLocalAiSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => localAiService.deleteSession(sessionId),

    onMutate: async (sessionId: string) => {
      await queryClient.cancelQueries({ queryKey: SESSIONS_KEY });
      const previous = queryClient.getQueryData<
        InfiniteData<ILocalAiSessionPage>
      >(SESSIONS_KEY);

      queryClient.setQueryData<InfiniteData<ILocalAiSessionPage>>(
        SESSIONS_KEY,
        (data) =>
          data && {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              total: Math.max(0, page.total - 1),
              sessions: page.sessions.filter((s) => s.id !== sessionId),
            })),
          },
      );

      return { previous };
    },

    onSuccess: () => toast.success("Розмову видалено"),

    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(SESSIONS_KEY, context.previous);
      }
      toast.error("Не вдалося видалити розмову");
    },

    // Звіряємося з сервером у будь-якому випадку: видалення могло зсунути
    // межу сторінок, і в списку зʼявиться розмова, яка доти не влазила
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: SESSIONS_KEY });
    },
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
