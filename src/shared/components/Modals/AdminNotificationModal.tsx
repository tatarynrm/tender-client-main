"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Lightbulb,
  Info,
  X,
  Bell
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils";

export type NotificationType = "warning" | "advice" | "request";

interface AdminNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  type: NotificationType;
}

const typeConfig = {
  warning: {
    icon: AlertTriangle,
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-500/10",
    border: "border-red-100 dark:border-red-500/20",
    title: "Адміністратор",
    shadow: "shadow-red-500/20",
    gradient: "from-red-500/10 to-transparent"
  },
  advice: {
    icon: Lightbulb,
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    border: "border-amber-100 dark:border-amber-500/20",
    title: "Адміністратор",
    shadow: "shadow-amber-500/20",
    gradient: "from-amber-500/10 to-transparent"
  },
  request: {
    icon: Info,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    border: "border-blue-100 dark:border-blue-500/20",
    title: "Адміністратор",
    shadow: "shadow-blue-500/20",
    gradient: "from-blue-500/10 to-transparent"
  }
};

export const AdminNotificationModal = ({
  isOpen,
  onClose,
  message,
  type = "request"
}: AdminNotificationModalProps) => {
  const config = typeConfig[type] || typeConfig.request;
  const Icon = config.icon;

  // Звукове сповіщення
  React.useEffect(() => {
    if (isOpen) {
      const audio = new Audio("/sounds/load/new-load-sound.mp3");
      audio.volume = 0.5
      audio.play().catch(err => console.error("Sound play failed:", err));
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={cn(
                "relative w-full max-w-lg pointer-events-auto overflow-hidden",
                "bg-white dark:bg-zinc-950 rounded-[32px] border-2",
                config.border,
                "shadow-[0_20px_50px_rgba(0,0,0,0.3)]",
                config.shadow
              )}
            >
              {/* Top Gradient Overlay */}
              <div className={cn("absolute inset-0 bg-gradient-to-b h-40 opacity-50", config.gradient)} />

              <div className="relative p-8">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute right-6 top-6 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="flex flex-col items-center text-center mb-8">
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className={cn(
                      "w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-xl",
                      config.bg,
                      config.color
                    )}
                  >
                    <Icon className="w-10 h-10" />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight mb-2">
                      {config.title}
                    </h3>
                    <div className="flex items-center justify-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                        Важливе сповіщення
                      </span>
                      <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                    </div>
                  </motion.div>
                </div>

                {/* Content */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-zinc-50 dark:bg-white/[0.03] rounded-2xl p-6 mb-8 border border-zinc-100 dark:border-white/5"
                >
                  <p className="text-zinc-700 dark:text-zinc-300 text-lg leading-relaxed font-medium text-center italic">
                    "{message}"
                  </p>
                </motion.div>

                {/* Footer Buttons */}
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={onClose}
                    className={cn(
                      "w-full h-14 rounded-2xl font-black uppercase tracking-wider text-sm shadow-lg transition-all active:scale-95",
                      type === "warning" && "bg-red-600 hover:bg-red-700 text-white shadow-red-500/20",
                      type === "advice" && "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20",
                      type === "request" && "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
                    )}
                  >
                    Зрозуміло, дякую
                  </Button>
                  <p className="text-center text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-2">
                    Адміністрація системи моніторингу
                  </p>
                </div>
              </div>

              {/* Decorative side accent */}
              <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", config.bg)} />
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
