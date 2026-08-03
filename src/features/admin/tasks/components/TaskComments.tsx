"use client";

import { useState } from "react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { Check, Pencil, Send, Trash2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui";
import { cn } from "@/shared/utils";
import { ITask, ITaskComment } from "../types/task.type";
import { getAvatarColor, getInitials } from "../constants/task.constants";
import { useAddComment, useDeleteComment, useEditComment } from "../hooks/useTasks";

interface Props {
  task: ITask;
  currentUser: string;
}

export function TaskComments({ task, currentUser }: Props) {
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [pendingDelete, setPendingDelete] = useState<ITaskComment | null>(null);

  const addComment = useAddComment();
  const editComment = useEditComment();
  const deleteComment = useDeleteComment();

  const submit = () => {
    const value = text.trim();
    if (!value) return;

    addComment.mutate(
      { id: task.id, author: currentUser, text: value },
      { onSuccess: () => setText("") },
    );
  };

  const startEdit = (comment: ITaskComment) => {
    setEditingId(comment.id);
    setEditingText(comment.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };

  const saveEdit = (commentId: string) => {
    const value = editingText.trim();
    if (!value) return;

    editComment.mutate(
      { id: task.id, commentId, text: value },
      { onSuccess: cancelEdit },
    );
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteComment.mutate(
      { id: task.id, commentId: pendingDelete.id },
      { onSuccess: () => setPendingDelete(null) },
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Коментарі
        </span>
        <span className="text-[10px] font-black text-slate-300 dark:text-slate-600">
          {task.comments.length}
        </span>
      </div>

      {task.comments.length > 0 && (
        <div className="space-y-3">
          {task.comments.map((comment) => {
            const isEditing = editingId === comment.id;

            return (
              <div
                key={comment.id}
                className="group/comment flex gap-3 rounded-2xl bg-white/70 dark:bg-slate-900/50 border border-slate-200/70 dark:border-white/5 p-4"
              >
                <div
                  className={cn(
                    "h-8 w-8 shrink-0 rounded-xl flex items-center justify-center text-[10px] font-black text-white",
                    getAvatarColor(comment.author),
                  )}
                >
                  {getInitials(comment.author)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-tight text-slate-900 dark:text-white">
                      {comment.author}
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                      {format(new Date(comment.createdAt), "d MMM, HH:mm", { locale: uk })}
                    </span>
                    {comment.editedAt && (
                      <span
                        title={format(new Date(comment.editedAt), "d MMM yyyy, HH:mm", {
                          locale: uk,
                        })}
                        className="text-[9px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-600"
                      >
                        ред.
                      </span>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="mt-2 space-y-2">
                      <textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) saveEdit(comment.id);
                          if (e.key === "Escape") cancelEdit();
                        }}
                        autoFocus
                        rows={2}
                        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-slate-900"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => saveEdit(comment.id)}
                          disabled={!editingText.trim() || editComment.isPending}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Check size={12} />
                          Зберегти
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-white/5"
                        >
                          <X size={12} />
                          Скасувати
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                      {comment.text}
                    </p>
                  )}
                </div>

                {!isEditing && (
                  <div className="flex shrink-0 items-start gap-1 opacity-0 transition-opacity group-hover/comment:opacity-100">
                    <button
                      type="button"
                      onClick={() => startEdit(comment)}
                      title="Редагувати коментар"
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 transition-all hover:bg-indigo-500/10 hover:text-indigo-500"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(comment)}
                      title="Видалити коментар"
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 transition-all hover:bg-rose-500/10 hover:text-rose-500"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-end gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) submit();
          }}
          rows={2}
          placeholder={`Коментар від імені «${currentUser}»… (Ctrl+Enter — надіслати)`}
          className="flex-1 resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-white/10 dark:bg-slate-900"
        />
        <button
          type="button"
          onClick={submit}
          disabled={!text.trim() || addComment.isPending}
          className="flex h-[46px] w-[46px] items-center justify-center rounded-2xl bg-indigo-600 text-white transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </div>

      {/* Підтвердження видалення коментаря */}
      <Dialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <DialogContent className="rounded-[2rem] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-black tracking-tight">
              Видалити коментар?
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              {pendingDelete
                ? `${pendingDelete.author}: «${
                    pendingDelete.text.length > 120
                      ? pendingDelete.text.slice(0, 120) + "…"
                      : pendingDelete.text
                  }»`
                : ""}
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
              disabled={deleteComment.isPending}
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
