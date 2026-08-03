import {
  CircleDashed,
  CircleDotDashed,
  Eye,
  CheckCircle2,
  PauseCircle,
  LucideIcon,
} from "lucide-react";
import { TaskPriority, TaskStatus } from "../types/task.type";

interface StatusMeta {
  id: TaskStatus;
  label: string;
  icon: LucideIcon;
  /** Класи для бейджа статусу */
  chip: string;
  /** Колір смужки-акценту зліва в рядку */
  bar: string;
  /** Колір для стат-плитки */
  accent: string;
}

export const TASK_STATUSES: StatusMeta[] = [
  {
    id: "not_started",
    label: "Не розпочато",
    icon: CircleDashed,
    chip: "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20",
    bar: "bg-slate-300 dark:bg-slate-600",
    accent: "text-slate-500",
  },
  {
    id: "in_progress",
    label: "В роботі",
    icon: CircleDotDashed,
    chip: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    bar: "bg-blue-500",
    accent: "text-blue-500",
  },
  {
    id: "review",
    label: "На перевірці",
    icon: Eye,
    chip: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    bar: "bg-violet-500",
    accent: "text-violet-500",
  },
  {
    id: "done",
    label: "Виконано",
    icon: CheckCircle2,
    chip: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    bar: "bg-emerald-500",
    accent: "text-emerald-500",
  },
  {
    id: "postponed",
    label: "Відкладено",
    icon: PauseCircle,
    chip: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    bar: "bg-amber-500",
    accent: "text-amber-500",
  },
];

export const getStatusMeta = (status: TaskStatus): StatusMeta =>
  TASK_STATUSES.find((s) => s.id === status) ?? TASK_STATUSES[0];

interface PriorityMeta {
  id: TaskPriority;
  label: string;
  hint: string;
  chip: string;
}

export const TASK_PRIORITIES: PriorityMeta[] = [
  {
    id: "A",
    label: "A",
    hint: "Високий",
    chip: "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30",
  },
  {
    id: "B",
    label: "B",
    hint: "Середній",
    chip: "bg-amber-500 text-white shadow-sm shadow-amber-500/30",
  },
  {
    id: "C",
    label: "C",
    hint: "Низький",
    chip: "bg-slate-400 text-white shadow-sm shadow-slate-400/30",
  },
];

export const getPriorityMeta = (priority: TaskPriority): PriorityMeta =>
  TASK_PRIORITIES.find((p) => p.id === priority) ?? TASK_PRIORITIES[0];

/**
 * Розділи проєкту. Список відкритий — у формі можна ввести власний,
 * ці лише пропонуються як швидкий вибір.
 */
export const TASK_SECTIONS = [
  "Головна сторінка",
  "Кабінет перевізника",
  "Тендери",
  "Перевезення",
  "Документи",
  "Фінанси",
  "Адмін-панель",
  "Telegram",
  "Інше",
];

/** Палітра для аватарів — колір детермінований від імені */
const AVATAR_COLORS = [
  "bg-indigo-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-sky-500",
  "bg-violet-500",
  "bg-teal-500",
];

export const getAvatarColor = (name: string) => {
  const sum = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
};

export const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
