"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ClipboardList, Info, ListTodo, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui";
import { useFontSize } from "@/shared/providers/FontSizeProvider";
import { useProfile } from "@/shared/hooks/useProfile";
import { cn } from "@/shared/utils";
import { ITask, TaskStatus } from "./types/task.type";
import { useDeleteTask, useTasks, useUpdateTask } from "./hooks/useTasks";
import { TaskStats } from "./components/TaskStats";
import { TaskFilters, TaskFiltersValue } from "./components/TaskFilters";
import { ROW_GRID, TaskRow } from "./components/TaskRow";
import { TaskFormDialog } from "./components/TaskFormDialog";

const INITIAL_FILTERS: TaskFiltersValue = {
  search: "",
  status: "ALL",
  assignee: "ALL",
  section: "ALL",
};

export default function TasksPage() {
  const { config } = useFontSize();
  const { profile } = useProfile();
  const { data, isLoading } = useTasks();

  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [filters, setFilters] = useState<TaskFiltersValue>(INITIAL_FILTERS);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ITask | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ITask | null>(null);

  const tasks = data?.tasks ?? [];

  const currentUser = profile?.person
    ? `${profile.person.name?.[0] ?? ""}. ${profile.person.surname ?? ""}`.trim()
    : "Адміністратор";

  const assignees = useMemo(
    () => [...new Set(tasks.map((t) => t.assignee).filter(Boolean))].sort(),
    [tasks],
  );

  const sections = useMemo(
    () => [...new Set(tasks.map((t) => t.section).filter(Boolean))].sort(),
    [tasks],
  );

  const counts = useMemo(() => {
    const result: Record<string, number> = { ALL: tasks.length };
    for (const task of tasks) {
      result[task.status] = (result[task.status] ?? 0) + 1;
    }
    return result;
  }, [tasks]);

  const filtered = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return tasks.filter((task) => {
      if (filters.status !== "ALL" && task.status !== filters.status) return false;
      if (filters.assignee !== "ALL" && task.assignee !== filters.assignee) return false;
      if (filters.section !== "ALL" && task.section !== filters.section) return false;

      if (!search) return true;

      const haystack = [
        task.title,
        task.assignee,
        task.section,
        ...task.comments.map((c) => `${c.author} ${c.text}`),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(search);
    });
  }, [tasks, filters]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (task: ITask) => {
    setEditing(task);
    setFormOpen(true);
  };

  const changeStatus = (task: ITask, status: TaskStatus) => {
    if (status === task.status) return;
    updateTask.mutate({ id: task.id, patch: { status } });
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteTask.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) });
  };

  return (
    <div className="mx-auto max-w-[1600px] animate-in fade-in slide-in-from-bottom-4 space-y-8 p-1 pb-16 duration-700">
      {/* Шапка */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl border border-indigo-100 bg-indigo-500/10 p-3 dark:border-indigo-400/20 dark:bg-indigo-400/10">
            <ClipboardList className="text-indigo-600 dark:text-indigo-400" size={28} />
          </div>
          <div>
            <h1
              className={cn(
                "font-black tracking-tight text-slate-900 dark:text-white",
                config.title,
              )}
            >
              Завдання проєкту
            </h1>
            <p className={cn("font-medium text-slate-500", config.label)}>
              Робочий список змін по платформі — зберігається локально, без бази даних
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 self-start rounded-2xl bg-indigo-600 px-5 py-3 text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 hover:shadow-indigo-600/30 md:self-auto"
        >
          <Plus size={16} />
          Нове завдання
        </button>
      </div>

      <TaskStats tasks={tasks} />

      {data?.meta?.legend && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white/40 px-5 py-3 text-[11px] font-bold text-slate-500 backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/30">
          <Info size={14} className="shrink-0 text-slate-400" />
          {data.meta.legend}
        </div>
      )}

      <TaskFilters
        value={filters}
        onChange={setFilters}
        assignees={assignees}
        sections={sections}
        counts={counts}
      />

      {/* Заголовки колонок */}
      <div
        className={cn(
          "hidden gap-x-4 px-6 pb-1 lg:grid",
          ROW_GRID,
          "text-[9px] font-black uppercase tracking-widest text-slate-400",
        )}
      >
        <span>№</span>
        <span>Завдання</span>
        <span className="justify-self-center">Пріор.</span>
        <span>Статус</span>
        <span>Виконавець</span>
        <span>Дати</span>
        <span />
      </div>

      {/* Список */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-[1.75rem] border border-slate-200 bg-white/50 dark:border-white/10 dark:bg-slate-900/40"
            />
          ))
        ) : filtered.length > 0 ? (
          <AnimatePresence initial={false}>
            {filtered.map((task, index) => (
              <TaskRow
                key={task.id}
                task={task}
                index={index}
                currentUser={currentUser}
                expanded={expandedId === task.id}
                onToggle={() => setExpandedId(expandedId === task.id ? null : task.id)}
                onEdit={() => openEdit(task)}
                onDelete={() => setPendingDelete(task)}
                onStatusChange={(status) => changeStatus(task, status)}
              />
            ))}
          </AnimatePresence>
        ) : (
          <div className="rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-white/30 py-28 text-center backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/20">
            <div className="mb-6 inline-flex rounded-full bg-slate-100 p-6 dark:bg-slate-800">
              <ListTodo className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight text-slate-500">
              {tasks.length ? "Нічого не знайдено" : "Завдань поки немає"}
            </h3>
            <p className="mt-2 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
              {tasks.length
                ? "Спробуйте змінити фільтри або пошуковий запит"
                : "Створіть перше завдання кнопкою «Нове завдання»"}
            </p>
          </div>
        )}
      </div>

      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        task={editing}
        assignees={assignees}
      />

      {/* Підтвердження видалення */}
      <Dialog open={Boolean(pendingDelete)} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent className="rounded-[2rem] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-black tracking-tight">
              Видалити завдання?
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              {pendingDelete?.title}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={() => setPendingDelete(null)}
              className="rounded-2xl px-5 py-3 text-[11px] font-black uppercase tracking-widest text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-white/5"
            >
              Скасувати
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={deleteTask.isPending}
              className="rounded-2xl bg-rose-600 px-6 py-3 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-rose-700 disabled:opacity-40"
            >
              Видалити
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
