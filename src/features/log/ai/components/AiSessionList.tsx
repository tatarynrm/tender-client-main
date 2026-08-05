"use client";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { cn } from "@/shared/utils/index";
import { motion } from "framer-motion";
import { Check, MessageSquare, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { ILocalAiSession } from "../types/local-ai.types";

interface Props {
  sessions: ILocalAiSession[];
  activeId?: string;
  isLoading: boolean;
  /** Стеля розмов із сервера — понад неї найстаріші видаляються самі. */
  maxSessions?: number;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onDeleteAll: () => void;
}

/** Бічний список розмов: створення, перемикання, видалення по одній і повне очищення. */
export function AiSessionList({
  sessions,
  activeId,
  isLoading,
  maxSessions,
  onSelect,
  onCreate,
  onDelete,
  onDeleteAll,
}: Props) {
  // Видалення незворотне, тому підтвердження просимо прямо в рядку —
  // окреме модальне вікно на кожну розмову було б надто важким
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [clearOpen, setClearOpen] = useState(false);

  const atLimit = Boolean(maxSessions && sessions.length >= maxSessions);

  const handleDelete = (id: string) => {
    setConfirmId(null);
    onDelete(id);
  };

  return (
    <div className="flex h-full w-full flex-col gap-3">
      <button
        type="button"
        onClick={onCreate}
        className="group flex w-full items-center gap-2 rounded-xl border border-violet-900/50 bg-white/[0.04] px-3 py-2.5 text-sm font-medium text-zinc-300 backdrop-blur-xl transition-all duration-300 hover:border-violet-500/50 hover:shadow-[0_0_0_3px_rgba(139,92,246,0.08)]"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white transition-transform duration-300 group-hover:rotate-90">
          <Plus className="h-3.5 w-3.5" />
        </span>
        Нова розмова
      </button>

      {sessions.length > 0 && (
        <div className="flex items-center justify-between gap-2 px-1">
          <span
            className={cn(
              "text-[11px] tabular-nums",
              atLimit ? "text-amber-400" : "text-zinc-600",
            )}
            title={
              maxSessions
                ? `Зберігаються останні ${maxSessions} розмов — старіші видаляються автоматично`
                : undefined
            }
          >
            {maxSessions
              ? `${sessions.length} з ${maxSessions} розмов`
              : `Розмов: ${sessions.length}`}
          </span>

          <button
            type="button"
            onClick={() => setClearOpen(true)}
            className="text-[11px] text-zinc-600 transition-colors hover:text-red-400"
          >
            Очистити все
          </button>
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-1 pr-2">
          {isLoading && (
            <div className="flex flex-col gap-1.5 px-1 py-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-8 animate-pulse rounded-lg bg-violet-900/20"
                />
              ))}
            </div>
          )}

          {!isLoading && sessions.length === 0 && (
            <p className="px-2 py-4 text-xs text-zinc-600">
              Розмов ще немає
            </p>
          )}

          {sessions.map((session) => {
            const isActive = session.id === activeId;
            const isConfirming = session.id === confirmId;

            return (
              <div
                key={session.id}
                className={cn(
                  "group relative flex items-center gap-1 rounded-xl px-2.5 py-2 text-sm transition-colors",
                  isConfirming
                    ? "bg-red-900/20"
                    : isActive
                      ? "bg-violet-900/30 font-medium"
                      : "hover:bg-violet-900/20",
                )}
              >
                {isActive && !isConfirming && (
                  <motion.span
                    layoutId="ai-session-active"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    className="absolute top-1.5 bottom-1.5 left-0 w-[2px] rounded-full bg-gradient-to-b from-violet-400 to-pink-500"
                  />
                )}

                {isConfirming ? (
                  <>
                    <span className="min-w-0 flex-1 truncate text-[12px] text-destructive">
                      Видалити розмову?
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(session.id)}
                      aria-label="Підтвердити видалення"
                      className="shrink-0 rounded-md p-0.5 hover:bg-destructive/10"
                    >
                      <Check className="h-3.5 w-3.5 text-destructive" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmId(null)}
                      aria-label="Скасувати"
                      className="shrink-0 rounded-md p-0.5 hover:bg-foreground/5"
                    >
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => onSelect(session.id)}
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                    >
                      <MessageSquare
                        className={cn(
                          "h-3.5 w-3.5 shrink-0 transition-colors",
                          isActive ? "text-sky-400" : "text-muted-foreground/60",
                        )}
                      />
                      <span className="truncate">{session.title}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfirmId(session.id)}
                      aria-label="Видалити розмову"
                      className="shrink-0 opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <Dialog open={clearOpen} onOpenChange={setClearOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Очистити всі розмови?</DialogTitle>
            <DialogDescription className="text-xs">
              Буде видалено {sessions.length} розмов разом з усіма
              повідомленнями й таблицями даних. Відновити їх неможливо.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setClearOpen(false)}
            >
              Скасувати
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => {
                setClearOpen(false);
                onDeleteAll();
              }}
            >
              Видалити все
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
