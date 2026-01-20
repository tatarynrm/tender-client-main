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
  X, // Додано іконку закриття
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

    if (textAreaRef.current) {
      textAreaRef.current.style.height = "inherit";
    }

    try {
      await sendComment(text);
    } catch (e) {
      setInput(text);
    }
  };

  useEffect(() => {
    if (open && comments.length > 0) {
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [comments.length, open]);

  const handleFocus = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="flex flex-col h-[100dvh] w-full sm:max-w-[450px] bg-white dark:bg-[#09090b] p-0 border-none sm:border-l shadow-2xl overflow-hidden inset-y-0"
      >
        {/* --- HEADER --- */}
        <SheetHeader className="px-6 py-4 border-b bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl shrink-0 z-20 relative">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white dark:border-zinc-950"></span>
                  </span>
                </div>
              </div>
              <div className="flex flex-col min-w-0">
                <SheetTitle className={cn(config.title, "font-black tracking-tight text-zinc-900 dark:text-zinc-100 truncate text-lg")}>
                  Чат вантажу
                </SheetTitle>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-500/20">
                    ID: {cargoId}
                  </span>
                  <Circle className="w-1 h-1 fill-zinc-300 border-none" />
                  <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-tighter">В мережі</span>
                </div>
              </div>
            </div>

            {/* КНОПКА ЗАКРИТТЯ */}
            <button 
              onClick={onClose}
              className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all active:scale-90"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>
        </SheetHeader>

        {/* --- MESSAGES AREA --- */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6 space-y-4 bg-slate-50/50 dark:bg-transparent custom-scrollbar scroll-smooth">
          {isFetching && comments.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <div className="p-4 bg-white dark:bg-zinc-900 rounded-full shadow-sm">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Синхронізація...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
              <MessageSquare className="w-12 h-12 mb-4 text-zinc-300" />
              <p className="text-sm font-medium">Тут поки порожньо</p>
            </div>
          ) : (
            comments.map((msg: any, idx: number) => {
              const mine = isMyComment(msg.id_usr);
              const isFirstInGroup = idx === 0 || comments[idx - 1].id_usr !== msg.id_usr;

              return (
                <div 
                  key={idx} 
                  className={cn(
                    "flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300", 
                    mine ? "justify-end" : "justify-start",
                    isFirstInGroup ? "mt-6" : "mt-1"
                  )}
                >
                  <div className={cn("flex flex-col max-w-[85%]", mine ? "items-end" : "items-start")}>
                    {isFirstInGroup && (
                      <div className={cn("flex items-center gap-1.5 mb-1.5 px-2", mine ? "flex-row-reverse" : "flex-row")}>
                        <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-tight">
                          {mine ? "Ви" : msg.manager || "Менеджер"}
                        </span>
                        {mine && <ShieldCheck className="w-3 h-3 text-blue-500" />}
                      </div>
                    )}
                    
                    <div className={cn(
                      "relative px-4 py-3 shadow-sm group transition-all duration-200",
                      mine 
                        ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-[20px] rounded-tr-none" 
                        : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-[20px] rounded-tl-none",
                    )}>
                      <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap break-words font-medium">
                        {msg.notes}
                      </p>
                      
                      <div className={cn(
                        "text-[9px] mt-2 font-bold opacity-0 group-hover:opacity-60 transition-opacity flex items-center gap-1",
                        mine ? "justify-end text-blue-50" : "justify-start text-zinc-500"
                      )}>
                        {msg.operation_time && format(new Date(msg.operation_time), "HH:mm")}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* --- INPUT AREA --- */}
        <div className="shrink-0 p-4 pb-[env(safe-area-inset-bottom,1.5rem)] bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800/50 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
          <div className="relative flex items-end gap-2 group">
            <div className="relative flex-1">
              <Textarea
                ref={textAreaRef}
                value={input}
                onFocus={handleFocus}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "inherit";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ваше повідомлення..."
                className="min-h-[44px] max-h-[150px] w-full resize-none rounded-[22px] bg-zinc-100/80 dark:bg-zinc-900/80 border-none focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:bg-white dark:focus-visible:bg-zinc-900 pr-12 py-3 px-5 transition-all text-[14px] leading-tight"
              />
              <div className="absolute right-2 bottom-1.5 flex items-center justify-center">
                <button
                  disabled={isSending || !input.trim()}
                  onClick={handleSend}
                  className={cn(
                    "p-2.5 rounded-full transition-all duration-200 flex items-center justify-center",
                    input.trim() 
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 hover:scale-105 active:scale-95" 
                      : "text-zinc-400 opacity-50"
                  )}
                >
                  {isSending ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <SendHorizontal size={18} strokeWidth={2.5} />
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-3">
             <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest opacity-30">
                Shift + Enter для нового рядка
             </span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}