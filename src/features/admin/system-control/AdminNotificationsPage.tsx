"use client";

import React, { useState } from "react";
import { 
  Send, 
  AlertTriangle, 
  Lightbulb, 
  Info, 
  Bell,
  CheckCircle2,
  Trash2,
  Users
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/shared/utils";
import axios from "axios";
import { toast } from "sonner";

const NOTIFICATION_TYPES = [
  { 
    id: "warning", 
    label: "Застереження", 
    icon: AlertTriangle, 
    color: "text-red-500", 
    bg: "bg-red-50 dark:bg-red-500/10",
    border: "border-red-200 dark:border-red-500/20"
  },
  { 
    id: "advice", 
    label: "Порада", 
    icon: Lightbulb, 
    color: "text-amber-500", 
    bg: "bg-amber-50 dark:bg-amber-500/10",
    border: "border-amber-200 dark:border-amber-500/20"
  },
  { 
    id: "request", 
    label: "Прохання", 
    icon: Info, 
    color: "text-blue-500", 
    bg: "bg-blue-50 dark:bg-blue-500/10",
    border: "border-blue-200 dark:border-blue-500/20"
  },
];

export default function AdminNotificationsPage() {
  const [message, setMessage] = useState("");
  const [type, setType] = useState<any>("request");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Будь ласка, введіть повідомлення");
      return;
    }

    setIsSending(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/admin/notification`, {
        message,
        type
      });
      toast.success("Сповіщення надіслано успішно");
      setMessage("");
    } catch (error) {
      console.error(error);
      toast.error("Помилка при відправці сповіщення");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6 pb-20">
      {/* Header section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                Керування сповіщеннями
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                Відправляйте миттєві повідомлення всім менеджерам у системі
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main form column */}
        <div className="lg:col-span-8 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-zinc-950 rounded-[32px] border border-zinc-200 dark:border-white/5 p-8 shadow-sm"
          >
            <div className="space-y-8">
              {/* Type selector */}
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-400 px-1">
                  Тип повідомлення
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {NOTIFICATION_TYPES.map((t) => {
                    const Icon = t.icon;
                    const isSelected = type === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setType(t.id)}
                        className={cn(
                          "relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300",
                          isSelected 
                            ? cn("border-zinc-900 dark:border-white", t.bg) 
                            : "border-transparent bg-zinc-50 dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/[0.08]"
                        )}
                      >
                        <Icon className={cn("w-6 h-6 mb-2", t.color)} />
                        <span className={cn(
                          "text-xs font-bold",
                          isSelected ? "text-zinc-900 dark:text-white" : "text-zinc-500"
                        )}>
                          {t.label}
                        </span>
                        {isSelected && (
                          <motion.div 
                            layoutId="active-type"
                            className="absolute -top-1 -right-1"
                          >
                            <div className="bg-zinc-900 dark:bg-white rounded-full p-0.5">
                              <CheckCircle2 className="w-3 h-3 text-white dark:text-zinc-900" />
                            </div>
                          </motion.div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message content */}
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-400 px-1">
                  Текст повідомлення
                </label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Введіть текст, який побачать усі менеджери..."
                  className="min-h-[160px] rounded-2xl bg-zinc-50 dark:bg-white/5 border-zinc-100 dark:border-white/5 focus:ring-zinc-900 dark:focus:ring-white transition-all text-lg font-medium p-6"
                />
              </div>

              {/* Action button */}
              <Button
                onClick={handleSend}
                disabled={isSending || !message.trim()}
                className="w-full h-16 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-black uppercase tracking-wider shadow-xl transition-all active:scale-95 flex gap-2 group"
              >
                {isSending ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Відправка...
                  </span>
                ) : (
                  <>
                    Надіслати всім
                    <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Sidebar/Info column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-blue-600 rounded-[32px] p-8 text-white shadow-xl shadow-blue-500/20">
            <Users className="w-10 h-10 mb-4 opacity-80" />
            <h3 className="text-xl font-black mb-2 leading-tight">Охоплення</h3>
            <p className="text-blue-100 text-sm font-medium leading-relaxed">
              Ваше повідомлення миттєво з'явиться у вигляді модального вікна на екранах усіх менеджерів, які зараз знаходяться онлайн у системі.
            </p>
          </div>

          <div className="bg-zinc-100 dark:bg-white/5 rounded-[32px] p-6 border border-zinc-200 dark:border-white/5">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 px-2">Поради</h4>
            <ul className="space-y-4">
              <li className="flex gap-3 text-sm font-bold text-zinc-600 dark:text-zinc-400">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                Будьте лаконічними — занадто довгі тексти важко сприймати миттєво.
              </li>
              <li className="flex gap-3 text-sm font-bold text-zinc-600 dark:text-zinc-400">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                Використовуйте "Застереження" тільки для критичних ситуацій.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
