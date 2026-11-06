"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Check, CheckCheck, Gavel, MapPin, Package } from "lucide-react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { cn } from "@/shared/utils";
import {
  useLogNotifications,
  type LogNotification,
} from "./useLogNotifications";

// Короткий відносний час українською.
const timeAgo = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso).getTime();
  if (isNaN(d)) return "";
  const diff = Math.floor((Date.now() - d) / 1000);
  if (diff < 60) return "щойно";
  if (diff < 3600) return `${Math.floor(diff / 60)} хв тому`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} год тому`;
  if (diff < 172800) return "вчора";
  return new Date(iso).toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const typeMeta = (type: string) => {
  if (type === "TENDER_RATE_CARRIER" || type === "TENDER_RATE_MANAGER") {
    return { Icon: Gavel, color: "text-indigo-600", bg: "bg-indigo-100 dark:bg-indigo-500/15" };
  }
  return { Icon: Bell, color: "text-slate-500", bg: "bg-slate-100 dark:bg-white/10" };
};

const NotificationItem = ({
  n,
  onSeen,
}: {
  n: LogNotification;
  onSeen: (id: number) => void;
}) => {
  const c = n.content || {};
  const { Icon, color, bg } = typeMeta(n.ids_notify_type);
  const isUnread = !n.time_seen;

  const price =
    c.price_proposed != null
      ? `${Number(c.price_proposed)} ${c.valut_name || c.ids_valut || ""}`.trim()
      : null;

  const inner = (
    <div
      className={cn(
        "relative flex gap-3 p-3 rounded-2xl transition-colors",
        isUnread
          ? "bg-indigo-50/70 dark:bg-indigo-500/10"
          : "",
      )}
    >
      {isUnread && (
        <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-500" />
      )}
      <div
        className={cn(
          "shrink-0 w-9 h-9 rounded-xl flex items-center justify-center",
          bg,
          color,
        )}
      >
        <Icon className="w-[18px] h-[18px]" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[12.5px] font-bold text-slate-800 dark:text-slate-100 leading-tight">
            {n.value || "Нове сповіщення"}
          </p>
          <span className="shrink-0 text-[10px] font-medium text-slate-400 whitespace-nowrap mt-0.5">
            {timeAgo(n.created_at)}
          </span>
        </div>

        <div className="mt-1 space-y-0.5 text-[11px] text-slate-500 dark:text-slate-400">
          {(c.docnum ?? c.id_tender) && (
            <div className="font-semibold text-slate-600 dark:text-slate-300">
              Тендер №{c.docnum ?? c.id_tender}
            </div>
          )}
          {c.route && (
            <div className="flex items-center gap-1">
              <MapPin size={11} className="shrink-0 text-slate-400" />
              <span className="truncate">{c.route}</span>
            </div>
          )}
          {(price || c.car_count != null) && (
            <div className="flex items-center gap-2">
              {price && (
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  {price}
                </span>
              )}
              {c.car_count != null && (
                <span className="flex items-center gap-1">
                  <Package size={11} className="text-slate-400" />
                  {c.car_count} авто
                </span>
              )}
            </div>
          )}
          {c.author && (
            <div className="text-slate-400">{c.author}</div>
          )}
        </div>

        {isUnread && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSeen(n.id);
            }}
            className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            <Check size={12} /> Прочитано
          </button>
        )}
      </div>
    </div>
  );

  // Перехід на тендер прибрано — з сповіщення можна лише позначити прочитаним.
  return inner;
};

export default function LogNotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { list, unreadCount, markSeen, markAll, isLoading, ping } =
    useLogNotifications();
  const bellControls = useAnimationControls();

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Поки є непрочитані — дзвіночок безперервно гойдається вправо-вліво.
  // Коли все прочитано — зупиняється й вирівнюється.
  // `ping` у залежностях, щоб нове сповіщення перезапускало анімацію акцентом.
  useEffect(() => {
    if (unreadCount > 0) {
      bellControls.start({
        rotate: [0, -16, 16, -13, 13, -8, 8, -4, 4, 0],
        transition: {
          duration: 1,
          ease: "easeInOut",
          repeat: Infinity,
          repeatDelay: 0.6,
        },
      });
    } else {
      bellControls.stop();
      bellControls.start({ rotate: 0, transition: { duration: 0.2 } });
    }
  }, [unreadCount, ping, bellControls]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        title="Сповіщення"
        className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 hover:text-blue-500 transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10"
      >
        <motion.span
          animate={bellControls}
          style={{ display: "inline-flex", transformOrigin: "50% 10%" }}
        >
          <Bell className="w-5 h-5" />
        </motion.span>
        {unreadCount > 0 && (
          <motion.span
            key={unreadCount}
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-black leading-none shadow"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-[min(22rem,calc(100vw-2rem))] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl z-50 overflow-hidden"
          >
            {/* Шапка */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2">
                <h3 className="text-[13px] font-black uppercase tracking-wide text-slate-700 dark:text-slate-200">
                  Сповіщення
                </h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAll.mutate()}
                  disabled={markAll.isPending}
                  className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 disabled:opacity-50"
                >
                  <CheckCheck size={13} /> Прочитати всі
                </button>
              )}
            </div>

            {/* Список */}
            <div className="max-h-[70vh] sm:max-h-[26rem] overflow-y-auto custom-scrollbar p-2 space-y-1">
              {isLoading ? (
                <div className="py-10 text-center text-[12px] text-slate-400">
                  Завантаження…
                </div>
              ) : list.length === 0 ? (
                <div className="py-12 flex flex-col items-center gap-2 text-slate-400">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                    <Bell className="w-6 h-6" />
                  </div>
                  <p className="text-[12px] font-medium">Сповіщень немає</p>
                </div>
              ) : (
                list.map((n) => (
                  <NotificationItem
                    key={n.id}
                    n={n}
                    onSeen={(id) => markSeen.mutate(id)}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
