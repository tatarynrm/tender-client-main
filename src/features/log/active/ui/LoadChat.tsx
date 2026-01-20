"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { useFontSize } from "@/shared/providers/FontSizeProvider";
import {
  SendHorizontal,
  Loader2,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { format } from "date-fns";
import { useCargoChat } from "../../hooks/useLoadChat";
import { useAuth } from "@/shared/providers/AuthCheckProvider";
import { cn } from "@/shared/utils";

export default function LoadChat({
  cargoId,
  open,
  onClose,
}: {
  cargoId: number;
  open: boolean;
  onClose: () => void;
}) {
  const { config } = useFontSize();
  const { profile } = useAuth();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const { comments, isFetching, isSending, sendComment } = useCargoChat(
    cargoId,
    open,
  );

  const isMyComment = useCallback(
    (messageUserId: number | string) => {
      if (!profile?.id) return false;
      return Number(messageUserId) === Number(profile.id);
    },
    [profile?.id],
  );

  const handleSend = async () => {
    if (!input.trim() || isSending) return;
    const text = input.trim();
    setInput("");

    if (textAreaRef.current) textAreaRef.current.style.height = "inherit";

    try {
      await sendComment(text);
    } catch (e) {
      setInput(text);
    }
  };

  // Прокрутка вниз
  useEffect(() => {
    if (open && comments.length > 0) {
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [comments.length, open]);

  // Прокрутка при фокусі на поле вводу (для мобільних)
  const handleFocus = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      {/* h-[100dvh] адаптується під висоту екрана з урахуванням панелей браузера */}
      <SheetContent
        side="right"
        className="flex flex-col h-[100dvh] bg-slate-50 dark:bg-[#09090b] p-0 sm:max-w-md border-l border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden"
      >
        {/* --- HEADER (Зафіксований) --- */}
        <SheetHeader className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-zinc-950 rounded-full" />
            </div>
            <div className="flex flex-col">
              <SheetTitle
                className={cn(
                  config.title,
                  "font-black tracking-tight text-zinc-900 dark:text-zinc-100",
                )}
              >
                Чат вантажу
              </SheetTitle>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  #{cargoId}
                </span>
                <span className="text-[11px] text-zinc-400 font-medium italic">
                  Обговорення
                </span>
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* --- MESSAGES AREA (Стискається при відкритті клавіатури) --- */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2 custom-scrollbar scroll-smooth">
          {isFetching && comments.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-60">
              <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                Оновлення...
              </p>
            </div>
          ) : comments.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <MessageSquare className="w-10 h-10 text-zinc-300 mb-4" />
              <h3 className="text-zinc-900 dark:text-zinc-100 font-bold">
                Повідомлень немає
              </h3>
            </div>
          ) : (
            comments.map((msg: any, idx: number) => {
              const mine = isMyComment(msg.id_usr);
              const isLastInGroup =
                idx === comments.length - 1 ||
                comments[idx + 1].id_usr !== msg.id_usr;
              const isFirstInGroup =
                idx === 0 || comments[idx - 1].id_usr !== msg.id_usr;

              return (
                <div
                  key={idx}
                  className={cn(
                    "flex w-full animate-in fade-in slide-in-from-bottom-1",
                    mine ? "justify-end" : "justify-start",
                    isFirstInGroup ? "mt-4" : "mt-0.5",
                  )}
                >
                  <div
                    className={cn(
                      "flex flex-col max-w-[85%]",
                      mine ? "items-end" : "items-start",
                    )}
                  >
                    {isFirstInGroup && (
                      <div
                        className={cn(
                          "flex items-center gap-1.5 mb-1 px-1",
                          mine ? "flex-row-reverse" : "flex-row",
                        )}
                      >
                        <span className="text-[10px] font-black uppercase text-zinc-500">
                          {mine ? "Ви" : msg.manager || "Менеджер"}
                        </span>
                        {mine && (
                          <ShieldCheck className="w-3 h-3 text-blue-500" />
                        )}
                      </div>
                    )}
                    <div
                      className={cn(
                        "relative px-4 py-2.5 shadow-sm text-sm",
                        mine
                          ? "bg-blue-600 text-white rounded-2xl rounded-tr-none"
                          : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-2xl rounded-tl-none",
                        !isLastInGroup &&
                          (mine ? "rounded-br-none" : "rounded-bl-none"),
                      )}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap break-words">
                        {msg.notes}
                      </p>
                      <div
                        className={cn(
                          "text-[9px] mt-1.5 font-bold opacity-60 flex",
                          mine
                            ? "justify-end text-blue-100"
                            : "justify-start text-zinc-500",
                        )}
                      >
                        {msg.operation_time &&
                          format(
                            new Date(msg.operation_time),
                            "dd.MM.yyyy HH:mm",
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} className="h-2" />
        </div>

        {/* --- INPUT AREA (Зафіксована знизу) --- */}
        <div className="shrink-0 p-4 pb-[env(safe-area-inset-bottom,1rem)] bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800">
          <div className="relative flex items-end gap-2 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-2 rounded-[22px] focus-within:ring-2 ring-blue-500/20 focus-within:bg-white dark:focus-within:bg-zinc-900 transition-all">
            <textarea
              ref={textAreaRef}
              rows={1}
              onFocus={handleFocus}
              className="flex-1 bg-transparent px-3 py-2 outline-none text-sm resize-none max-h-32 custom-scrollbar text-zinc-900 dark:text-zinc-100"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "inherit";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              placeholder="Написати менеджеру..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button
              disabled={isSending || !input.trim()}
              onClick={handleSend}
              className={cn(
                "p-3 rounded-[18px] transition-all active:scale-90 flex items-center justify-center shadow-lg shrink-0",
                input.trim()
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400",
              )}
            >
              {isSending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <SendHorizontal size={18} strokeWidth={2.5} />
              )}
            </button>
          </div>
          <div className="flex justify-between items-center px-2 mt-2">
            <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest opacity-40">
              Enter — надіслати
            </p>
            {isSending && (
              <p className="text-[9px] text-blue-500 animate-pulse font-bold uppercase">
                Надсилаємо...
              </p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
