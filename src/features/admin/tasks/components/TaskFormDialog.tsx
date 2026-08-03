"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui";
import { cn } from "@/shared/utils";
import { ITask, TaskDraft, TaskPriority, TaskStatus } from "../types/task.type";
import {
  TASK_PRIORITIES,
  TASK_SECTIONS,
  TASK_STATUSES,
} from "../constants/task.constants";
import { useCreateTask, useUpdateTask } from "../hooks/useTasks";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null — режим створення */
  task: ITask | null;
  assignees: string[];
}

const EMPTY: TaskDraft = {
  section: "Головна сторінка",
  title: "",
  priority: "A",
  status: "not_started",
  assignee: "",
  startDate: null,
  endDate: null,
};

const fieldClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-slate-900";

const labelClass =
  "text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block";

export function TaskFormDialog({ open, onOpenChange, task, assignees }: Props) {
  const [draft, setDraft] = useState<TaskDraft>(EMPTY);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const isEdit = Boolean(task);
  const isPending = createTask.isPending || updateTask.isPending;

  useEffect(() => {
    if (!open) return;

    setDraft(
      task
        ? {
            section: task.section,
            title: task.title,
            priority: task.priority,
            status: task.status,
            assignee: task.assignee,
            startDate: task.startDate,
            endDate: task.endDate,
          }
        : EMPTY,
    );
  }, [open, task]);

  const set = <K extends keyof TaskDraft>(key: K, value: TaskDraft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const submit = () => {
    if (!draft.title.trim()) return;

    const onSuccess = () => onOpenChange(false);

    if (task) {
      updateTask.mutate({ id: task.id, patch: draft }, { onSuccess });
    } else {
      createTask.mutate(draft, { onSuccess });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-lg font-black tracking-tight">
            {isEdit ? "Редагувати завдання" : "Нове завдання"}
          </DialogTitle>
          <DialogDescription className="text-[11px] font-medium text-slate-500">
            Дані зберігаються у локальному файлі <code>data/tasks.json</code>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div>
            <label className={labelClass}>Завдання</label>
            <textarea
              rows={3}
              value={draft.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Опишіть, що потрібно зробити"
              className={cn(fieldClass, "resize-none")}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Розділ</label>
              <input
                list="task-sections"
                value={draft.section}
                onChange={(e) => set("section", e.target.value)}
                className={fieldClass}
              />
              <datalist id="task-sections">
                {TASK_SECTIONS.map((section) => (
                  <option key={section} value={section} />
                ))}
              </datalist>
            </div>

            <div>
              <label className={labelClass}>Виконавець</label>
              <input
                list="task-assignees"
                value={draft.assignee}
                onChange={(e) => set("assignee", e.target.value)}
                placeholder="Прізвище та імʼя"
                className={fieldClass}
              />
              <datalist id="task-assignees">
                {assignees.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </div>

            <div>
              <label className={labelClass}>Пріоритет</label>
              <select
                value={draft.priority}
                onChange={(e) => set("priority", e.target.value as TaskPriority)}
                className={fieldClass}
              >
                {TASK_PRIORITIES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label} — {p.hint}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Статус</label>
              <select
                value={draft.status}
                onChange={(e) => set("status", e.target.value as TaskStatus)}
                className={fieldClass}
              >
                {TASK_STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Дата початку</label>
              <input
                type="date"
                value={draft.startDate ?? ""}
                onChange={(e) => set("startDate", e.target.value || null)}
                className={fieldClass}
              />
            </div>

            <div>
              <label className={labelClass}>Дата завершення</label>
              <input
                type="date"
                value={draft.endDate ?? ""}
                onChange={(e) => set("endDate", e.target.value || null)}
                className={fieldClass}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-2xl px-5 py-3 text-[11px] font-black uppercase tracking-widest text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-white/5"
          >
            Скасувати
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!draft.title.trim() || isPending}
            className="rounded-2xl bg-indigo-600 px-6 py-3 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isEdit ? "Зберегти" : "Створити"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
