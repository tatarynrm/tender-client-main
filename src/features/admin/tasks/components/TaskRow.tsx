"use client";

import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import {
  CalendarDays,
  ChevronDown,
  MessageSquare,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui";
import { cn } from "@/shared/utils";
import { ITask, TaskStatus } from "../types/task.type";
import {
  getAvatarColor,
  getInitials,
  getPriorityMeta,
  getStatusMeta,
  TASK_STATUSES,
} from "../constants/task.constants";
import { TaskComments } from "./TaskComments";

export const ROW_GRID =
  "lg:grid-cols-[2.5rem_minmax(0,1fr)_5rem_11rem_10rem_7.5rem_2.5rem]";

interface Props {
  task: ITask;
  index: number;
  expanded: boolean;
  currentUser: string;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: TaskStatus) => void;
}

const formatDate = (value: string | null) =>
  value ? format(new Date(value), "d MMM yyyy", { locale: uk }) : "—";

export function TaskRow({
  task,
  index,
  expanded,
  currentUser,
  onToggle,
  onEdit,
  onDelete,
  onStatusChange,
}: Props) {
  const status = getStatusMeta(task.status);
  const priority = getPriorityMeta(task.priority);
  const StatusIcon = status.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.02, 0.2) }}
      className={cn(
        "group relative overflow-hidden rounded-[1.75rem] border bg-white/60 backdrop-blur-xl transition-all dark:bg-slate-900/40",
        expanded
          ? "border-indigo-500/30 shadow-lg shadow-indigo-500/5"
          : "border-slate-200 hover:border-indigo-500/20 hover:shadow-md dark:border-white/10",
      )}
    >
      {/* Кольорова смужка статусу */}
      <div className={cn("absolute left-0 top-0 h-full w-1", status.bar)} />

      <div
        onClick={onToggle}
        className={cn(
          "grid cursor-pointer grid-cols-1 items-center gap-x-4 gap-y-3 py-4 pl-6 pr-4",
          ROW_GRID,
        )}
      >
        {/* № */}
        <div className="text-[11px] font-black tabular-nums text-slate-300 dark:text-slate-600">
          {String(task.order).padStart(2, "0")}
        </div>

        {/* Розділ + завдання */}
        <div className="min-w-0">
          <span className="mb-1.5 inline-block rounded-lg bg-indigo-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            {task.section}
          </span>
          <p
            className={cn(
              "text-sm font-medium leading-snug text-slate-800 dark:text-slate-200",
              !expanded && "line-clamp-2",
              task.status === "done" && "text-slate-400 line-through dark:text-slate-500",
            )}
          >
            {task.title}
          </p>
        </div>

        {/* Пріоритет */}
        <div className="lg:justify-self-center">
          <span
            title={priority.hint}
            className={cn(
              "inline-flex h-7 w-7 items-center justify-center rounded-xl text-[11px] font-black",
              priority.chip,
            )}
          >
            {priority.label}
          </span>
        </div>

        {/* Статус — змінюється прямо з рядка */}
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "inline-flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-wider transition-all hover:brightness-95",
                  status.chip,
                )}
              >
                <StatusIcon size={13} className="shrink-0" />
                <span className="truncate">{status.label}</span>
                <ChevronDown size={12} className="ml-auto shrink-0 opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="rounded-2xl">
              {TASK_STATUSES.map((item) => {
                const Icon = item.icon;
                return (
                  <DropdownMenuItem
                    key={item.id}
                    onClick={() => onStatusChange(item.id)}
                    className={cn(
                      "gap-2 rounded-xl text-[11px] font-bold",
                      item.id === task.status && "bg-slate-100 dark:bg-white/5",
                    )}
                  >
                    <Icon size={14} className={item.accent} />
                    {item.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Виконавець */}
        <div className="flex min-w-0 items-center gap-2">
          {task.assignee ? (
            <>
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[10px] font-black text-white",
                  getAvatarColor(task.assignee),
                )}
              >
                {getInitials(task.assignee)}
              </div>
              <span className="truncate text-[11px] font-bold text-slate-600 dark:text-slate-300">
                {task.assignee}
              </span>
            </>
          ) : (
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-600">
              Не призначено
            </span>
          )}
        </div>

        {/* Дати */}
        <div className="flex flex-col gap-1 text-[10px] font-bold text-slate-500">
          <span className="flex items-center gap-1.5">
            <CalendarDays size={12} className="text-slate-300 dark:text-slate-600" />
            {formatDate(task.startDate)}
          </span>
          <span className="pl-[18px] text-slate-400 dark:text-slate-500">
            {formatDate(task.endDate)}
          </span>
        </div>

        {/* Дії */}
        <div className="flex items-center gap-1 lg:justify-self-end">
          {task.comments.length > 0 && (
            <span className="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-500 dark:bg-white/5">
              <MessageSquare size={11} />
              {task.comments.length}
            </span>
          )}

          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5">
                  <MoreVertical size={15} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-2xl">
                <DropdownMenuItem onClick={onEdit} className="gap-2 rounded-xl text-[11px] font-bold">
                  <Pencil size={13} />
                  Редагувати
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onDelete}
                  className="gap-2 rounded-xl text-[11px] font-bold text-rose-600 focus:text-rose-600"
                >
                  <Trash2 size={13} />
                  Видалити
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <ChevronDown
            size={16}
            className={cn(
              "text-slate-300 transition-transform duration-300 dark:text-slate-600",
              expanded && "rotate-180 text-indigo-500",
            )}
          />
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 px-6 py-5 dark:border-white/5">
              <TaskComments task={task} currentUser={currentUser} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
