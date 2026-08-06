"use client";

import { cn } from "@/shared/utils/index";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, MessageSquare, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useId, useRef } from "react";
import { ILocalAiSession } from "../types/local-ai.types";

interface Props {
  sessions: ILocalAiSession[];
  /** Скільки розмов у користувача всього — для лічильника «N з 50». */
  total: number;
  activeId?: string;
  isLoading: boolean;
  /** Стеля розмов із сервера — понад неї найстаріші видаляються самі. */
  maxSessions?: number;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  onSelect: (id: string) => void;
  onCreate: () => void;
  /** Підтвердження живе на рівні сторінки — див. коментар нижче. */
  onDelete: (session: ILocalAiSession) => void;
  onDeleteAll: () => void;
}

/** За скільки пікселів до низу починаємо тягнути наступну сторінку розмов. */
const LOAD_MORE_THRESHOLD = 120;

/** Від скількох розмов має сенс писати «це всі» — на трьох рядках це шум. */
const SHOW_END_FROM = 8;

/**
 * Бічний список розмов: створення, перемикання, видалення по одній і повне
 * очищення. Список приходить сторінками — старіші розмови довантажуються,
 * коли скрол доходить до низу.
 *
 * Діалогів підтвердження тут навмисно немає. Компонент рендериться двічі —
 * у бічній панелі й у мобільній шторці (Sheet), — а Sheet сам є модалкою з
 * пасткою фокуса: вкладений у нього Dialog перехоплював фокус у батька, і
 * кнопки підтвердження ставали неклікабельними. Тому список лише повідомляє
 * про намір, а вікно показує сторінка, поза шторкою.
 */
export function AiSessionList({
  sessions,
  total,
  activeId,
  isLoading,
  maxSessions,
  hasMore,
  isLoadingMore,
  onLoadMore,
  onSelect,
  onCreate,
  onDelete,
  onDeleteAll,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  /**
   * Підсвітка активного рядка їде між панелями через layoutId, а він мусить
   * бути унікальним на кожен екземпляр списку: інакше desktop-панель і шторка
   * ділять один id, і смужка перестрибує між ними.
   */
  const layoutId = useId();

  const atLimit = Boolean(maxSessions && total >= maxSessions);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !hasMore || isLoadingMore) return;

    if (el.scrollHeight - el.scrollTop - el.clientHeight < LOAD_MORE_THRESHOLD) {
      onLoadMore();
    }
  }, [hasMore, isLoadingMore, onLoadMore]);

  /**
   * Перша сторінка може не заповнити панель на високому екрані — тоді скрол
   * не зʼявиться і довантаження ніколи не спрацює. Перевіряємо це щоразу,
   * коли список змінився.
   */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !hasMore || isLoadingMore) return;

    if (el.scrollHeight <= el.clientHeight) onLoadMore();
  }, [sessions.length, hasMore, isLoadingMore, onLoadMore]);

  return (
    <div className="flex h-full w-full flex-col gap-3 rounded-xl border border-slate-200/70 bg-white/75 p-3 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
      <button
        type="button"
        onClick={onCreate}
        className="group flex w-full items-center gap-2 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-blue-700 active:scale-[0.99]"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/20 transition-transform duration-300 group-hover:rotate-90">
          <Plus className="h-3.5 w-3.5" />
        </span>
        Нова розмова
      </button>

      {total > 0 && (
        <div className="flex items-center justify-between gap-2 px-0.5">
          <span
            className={cn(
              "text-[11px] tabular-nums",
              atLimit
                ? "text-amber-600 dark:text-amber-400"
                : "text-slate-400 dark:text-slate-500",
            )}
            title={
              maxSessions
                ? `Зберігаються останні ${maxSessions} розмов — старіші видаляються автоматично`
                : undefined
            }
          >
            {maxSessions
              ? `${total} з ${maxSessions} розмов`
              : `Розмов: ${total}`}
          </span>

          <button
            type="button"
            onClick={onDeleteAll}
            className="text-[11px] text-slate-400 transition-colors hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400"
          >
            Очистити все
          </button>
        </div>
      )}

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="ai-thin-scroll flex-1 overflow-y-auto"
      >
        <div className="flex flex-col gap-0.5 pr-1">
          {isLoading && (
            <div className="flex flex-col gap-1.5 px-1 py-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-8 animate-pulse rounded-lg bg-slate-100 dark:bg-white/5"
                />
              ))}
            </div>
          )}

          {!isLoading && sessions.length === 0 && (
            <p className="px-2 py-4 text-xs text-slate-400 dark:text-slate-500">
              Розмов ще немає
            </p>
          )}

          <AnimatePresence initial={false}>
            {sessions.map((session) => {
              const isActive = session.id === activeId;

              return (
                <motion.div
                  key={session.id}
                  layout="position"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  // Рядок згортається на місці — сусіди підтягуються плавно,
                  // а не стрибають одразу після натискання «Видалити»
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className={cn(
                    "group relative flex items-center gap-1 overflow-hidden rounded-lg px-2.5 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-blue-50/70 font-medium dark:bg-blue-500/10"
                      : "hover:bg-slate-50 dark:hover:bg-white/5",
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId={layoutId}
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 32,
                      }}
                      className="absolute top-1.5 bottom-1.5 left-0 w-[2px] rounded-full bg-blue-500"
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => onSelect(session.id)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <MessageSquare
                      className={cn(
                        "h-3.5 w-3.5 shrink-0 transition-colors",
                        isActive
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-slate-400 dark:text-slate-500",
                      )}
                    />
                    <span
                      className={cn(
                        "truncate",
                        isActive
                          ? "text-blue-700 dark:text-blue-300"
                          : "text-slate-600 dark:text-slate-300",
                      )}
                    >
                      {session.title}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(session)}
                    aria-label={`Видалити розмову «${session.title}»`}
                    title="Видалити розмову"
                    className="shrink-0 rounded-md p-1 opacity-0 transition-opacity hover:bg-red-50 focus-visible:opacity-100 group-hover:opacity-100 dark:hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {isLoadingMore && (
            <div className="flex items-center justify-center gap-2 py-3 text-[11px] text-slate-400 dark:text-slate-500">
              <Loader2 className="h-3 w-3 animate-spin" />
              Завантажуємо ще
            </div>
          )}

          {!hasMore && sessions.length > SHOW_END_FROM && (
            <p className="py-3 text-center text-[11px] text-slate-300 dark:text-slate-600">
              Це всі розмови
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
