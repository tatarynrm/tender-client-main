"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { Textarea } from "@/shared/components/ui/textarea";
import { useFontSize } from "@/shared/providers/FontSizeProvider";
import {
  SendHorizontal,
  Loader2,
  MessageSquare,
  ShieldCheck,
  Circle,
  X,
  Trash2,
  Pencil,
  RotateCcw,
} from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { useCargoChat } from "../../hooks/useLoadChat";
import { useAuth } from "@/shared/providers/AuthCheckProvider";
import { cn } from "@/shared/utils";
import { usePathname } from "next/navigation";
import { uk } from "date-fns/locale";

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
  const [editingComment, setEditingComment] = useState<{
    id: number;
    notes: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const pathname = usePathname();
  const isArchive = pathname?.includes("archive");

  const {
    comments,
    isFetching,
    isSaving,
    saveComment,
    deleteComment,
    isDeleting,
  } = useCargoChat(cargoId, open);

  const isMyComment = useCallback(
    (uid: any) => Number(uid) === Number(profile?.person.id),
    [profile?.id],
  );
  const formatOperationTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const timeStr = format(date, "HH:mm");

    if (isToday(date)) {
      return `Сьогодні, ${timeStr}`;
    }
    if (isYesterday(date)) {
      return `Вчора, ${timeStr}`;
    }

    // Для всіх інших дат: "11 лют., 14:30"
    return format(date, "d MMM, HH:mm", { locale: uk });
  };
  const handleSend = async () => {
    if (!input.trim() || isSaving || isArchive) return;
    const text = input.trim();
    const editId = editingComment?.id;

    setInput("");
    setEditingComment(null);
    if (textAreaRef.current) textAreaRef.current.style.height = "inherit";

    try {
      await saveComment({ notes: text, id: editId });
    } catch (e) {
      setInput(text);
      if (editId) setEditingComment({ id: editId, notes: text });
    }
  };

  const startEdit = (msg: any) => {
    setEditingComment({ id: msg.id, notes: msg.notes });
    setInput(msg.notes);
    // Невеликий таймаут, щоб фокус спрацював після оновлення DOM
    setTimeout(() => textAreaRef.current?.focus(), 50);
  };
  const handleDeleteClick = (id: number) => {
    const isConfirmed = window.confirm(
      "Ви впевнені, що хочете видалити цей коментар?",
    );
    if (isConfirmed) {
      deleteComment(id);
    }
  };
  useEffect(() => {
    if (open && comments.length > 0) {
      setTimeout(
        () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    }
  }, [comments.length, open]);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="flex flex-col h-[100dvh] w-full sm:max-w-[450px] bg-white dark:bg-[#09090b] p-0 border-none sm:border-l shadow-2xl overflow-hidden"
      >
        {/* HEADER */}
        <SheetHeader className="px-6 py-4 border-b bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl shrink-0 z-20">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <SheetTitle
                  className={cn(
                    config.title,
                    "font-black text-zinc-900 dark:text-zinc-100",
                  )}
                >
                  Чат вантажу
                </SheetTitle>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-500/20">
                    ID: {cargoId}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-500 active:scale-90 transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </SheetHeader>

        {/* MESSAGES AREA */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-slate-50/50 dark:bg-transparent custom-scrollbar">
          {comments.map((msg: any, idx: number) => {
            const mine = isMyComment(msg.id_author);
            const isFirst =
              idx === 0 || comments[idx - 1].id_author !== msg.id_author;

            return (
              <div
                key={msg.id}
                className={cn(
                  "flex w-full animate-in fade-in slide-in-from-bottom-1",
                  mine ? "justify-end" : "justify-start",
                  isFirst ? "mt-6" : "mt-1",
                )}
              >
                <div
                  className={cn(
                    "flex flex-col max-w-[85%] group/msg",
                    mine ? "items-end" : "items-start",
                  )}
                >
                  {isFirst && (
                    <span className="text-[10px] font-bold text-zinc-400 mb-1 px-2 uppercase">
                      {mine ? "Ви" : msg.manager}
                    </span>
                  )}

                  <div
                    className={cn(
                      "flex items-center gap-1 group",
                      mine ? "flex-row" : "flex-row-reverse",
                    )}
                  >
                    {/* Кнопки для Desktop (збоку, видимі при hover) */}
                    {mine && !isArchive && (
                      <div className="hidden sm:flex flex-col opacity-0 group-hover/msg:opacity-100 transition-all">
                        <button
                          onClick={() => startEdit(msg)}
                          className="p-1.5 hover:text-blue-500 text-zinc-400 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        {/* Кнопки для Desktop */}
                        <button
                          onClick={() => handleDeleteClick(msg.id)} // ТУТ БУЛО deleteComment
                          className="p-1.5 hover:text-red-500 text-zinc-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}

                    <div className="flex flex-col">
                      {/* Message Bubble */}
                      <div
                        className={cn(
                          "px-4 py-2.5 shadow-sm rounded-[18px] relative",
                          // Встановлюємо максимальну ширину (наприклад, 280px для мобілок або 85% від ширини чату)
                          "max-w-full sm:max-w-[320px]",
                          mine
                            ? "bg-blue-600 text-white rounded-tr-none"
                            : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-tl-none",
                        )}
                      >
                        <p
                          className={cn(
                            "text-[13px] leading-relaxed whitespace-pre-wrap",
                            // break-words дозволяє переносити довгі слова
                            // overflow-hidden гарантує, що нічого не вилізе за межі
                            "break-words [word-break:break-word] overflow-wrap-anywhere",
                          )}
                        >
                          {msg.notes}
                        </p>

                        <div
                          className={cn(
                            "text-[8px] mt-1 opacity-70 font-bold flex items-center gap-1",
                            mine ? "justify-end" : "justify-start",
                          )}
                        >
                          {msg.operation_time &&
                            formatOperationTime(msg.operation_time)}
                        </div>
                      </div>

                      {/* Кнопки для Mobile (під баблом, видимі завжди) */}
                      {mine && !isArchive && (
                        <div className="flex sm:hidden items-center gap-4 mt-1 px-2">
                          <button
                            onClick={() => startEdit(msg)}
                            className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 active:text-blue-500"
                          >
                            <Pencil size={10} /> Редагувати
                          </button>
                          <button
                            onClick={() => handleDeleteClick(msg.id)} // ТУТ ПРАВИЛЬНО
                            className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 active:text-red-500"
                          >
                            <Trash2 size={10} /> Видалити
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* INPUT AREA */}
        <div
          className={cn(
            "p-4 border-t bg-white dark:bg-zinc-950",
            isArchive && "opacity-50 pointer-events-none",
          )}
        >
          {editingComment && (
            <div className="flex items-center justify-between mb-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Pencil size={12} className="animate-pulse" />
                <span className="text-[10px] font-black uppercase">
                  Редагування
                </span>
              </div>
              <button
                onClick={() => {
                  setEditingComment(null);
                  setInput("");
                }}
                className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 hover:text-red-500 transition-colors"
              >
                Скасувати <RotateCcw size={12} />
              </button>
            </div>
          )}
          <div className="relative flex items-end gap-2">
            <Textarea
              ref={textAreaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "inherit";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                !e.shiftKey &&
                (e.preventDefault(), handleSend())
              }
              placeholder={isArchive ? "Чат заблоковано" : "Повідомлення..."}
              className={cn(
                "min-h-[45px] max-h-[150px] rounded-2xl border-zinc-200 dark:border-zinc-800 resize-none pr-12 transition-all",
                editingComment && "border-blue-500 ring-1 ring-blue-500",
              )}
            />
            <div className="absolute right-1.5 bottom-1.5">
              <button
                disabled={isSaving || !input.trim()}
                onClick={handleSend}
                className={cn(
                  "p-2 rounded-xl transition-all active:scale-90",
                  input.trim()
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                    : "bg-zinc-100 dark:bg-zinc-900 text-zinc-400",
                )}
              >
                {isSaving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <SendHorizontal size={18} />
                )}
              </button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
