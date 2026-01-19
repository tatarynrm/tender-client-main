"use client";

import { useState, useRef, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { useFontSize } from "@/shared/providers/FontSizeProvider";
import { SendHorizontal, X } from "lucide-react";

type ChatMessage = {
  id: number;
  user: string;
  text: string;
  time: string;
};

interface CargoChatProps {
  cargoId: number;
  open: boolean;
  onClose: () => void;
}

export default function CargoChat({ cargoId, open, onClose }: CargoChatProps) {
  const { config } = useFontSize();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, user: "Менеджер", text: "Привіт! Вантаж готовий?", time: "09:10" },
    { id: 2, user: "Водій", text: "Так, виїжджаю", time: "09:12" },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMessage: ChatMessage = {
      id: messages.length + 1,
      user: "Я",
      text: input,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages([...messages, newMessage]);
    setInput("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        className="flex flex-col h-[90vh] sm:h-full 
                   bg-white/80 dark:bg-slate-900/90 backdrop-blur-2xl 
                   border-l border-slate-200 dark:border-white/10 
                   p-0 sm:max-w-md md:max-w-lg shadow-2xl transition-all duration-500"
      >
        {/* Header */}
        <SheetHeader className="p-6 border-b border-slate-200 dark:border-white/5 flex flex-row justify-between items-center">
          <div>
            <span
              className={`${config.label} text-slate-400 uppercase tracking-widest block mb-1`}
            >
              Логістика
            </span>
            <SheetTitle
              className={`${config.title} text-slate-800 dark:text-slate-100 font-bold`}
            >
              Чат вантажу #{cargoId}
            </SheetTitle>
          </div>

        </SheetHeader>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.user === "Я" ? "items-end" : "items-start"}`}
            >
              <div
                className={`px-5 py-3 rounded-[1.5rem] max-w-[85%] break-words shadow-sm transition-all
                  ${
                    msg.user === "Я"
                      ? "bg-blue-600 text-white rounded-tr-none shadow-blue-200/50 dark:shadow-none"
                      : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-800 dark:text-slate-200 rounded-tl-none"
                  }`}
              >
                <p className={config.label}>{msg.text}</p>
              </div>
              <span className="text-[10px] text-slate-400 mt-2 uppercase tracking-tighter px-1">
                {msg.user} • {msg.time}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-slate-50/50 dark:bg-white/5 border-t border-slate-200 dark:border-white/5">
          <div className="relative flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 p-2 rounded-[2rem] shadow-inner focus-within:ring-2 ring-blue-500/20 transition-all">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Написати повідомлення..."
              className={`flex-1 bg-transparent px-4 py-2 focus:outline-none text-slate-800 dark:text-slate-200 ${config.label}`}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center active:scale-95"
            >
              <SendHorizontal size={config.icon * 0.8} />
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
