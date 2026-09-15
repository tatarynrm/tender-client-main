"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/utils";
import { DELETE_CONFIRM_WORD, isDeleteConfirmed } from "../utils/documents.utils";

interface Props {
  open: boolean;
  title: string;
  message: string;
  pending: boolean;
  /** Отримує введене слово — воно ж іде на бекенд як confirm */
  onConfirm: (confirmWord: string) => void;
  onClose: () => void;
}

/** Видалення незворотне, тому кнопка активується лише після введення слова ICT. */
export function DocDeleteDialog({ open, title, message, pending, onConfirm, onClose }: Props) {
  const [word, setWord] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  // pending оновлюється не миттєво — подвійний Enter/клік інакше пошле два запити
  const sentRef = useRef(false);
  const confirmed = isDeleteConfirmed(word);

  useEffect(() => {
    if (!open) return;
    setWord("");
    sentRef.current = false;
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, [open]);

  // Помилка на бекенді (pending знову false, діалог відкритий) — дозволяємо повторити
  useEffect(() => {
    if (!pending) sentRef.current = false;
  }, [pending]);

  const confirm = () => {
    if (!confirmed || pending || sentRef.current) return;
    sentRef.current = true;
    onConfirm(word.trim());
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    confirm();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !pending && onClose()}>
      <DialogContent className="p-6">
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-500/10">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{message}</DialogDescription>
          </DialogHeader>

          <div className="space-y-2 rounded-2xl border border-red-100 bg-red-50/50 p-3 dark:border-red-500/20 dark:bg-red-500/5">
            <label htmlFor="doc-delete-confirm" className="block text-sm">
              Для підтвердження введіть{" "}
              <span className="rounded-md bg-white px-1.5 py-0.5 font-mono font-bold tracking-widest text-red-600 shadow-sm dark:bg-slate-900">
                {DELETE_CONFIRM_WORD}
              </span>
            </label>
            <div className="relative">
              <Input
                id="doc-delete-confirm"
                ref={inputRef}
                value={word}
                onChange={(e) => setWord(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  e.preventDefault();
                  confirm();
                }}
                placeholder={DELETE_CONFIRM_WORD}
                autoComplete="off"
                spellCheck={false}
                maxLength={10}
                disabled={pending}
                className={cn(
                  "h-10 pr-10 font-mono text-base tracking-widest",
                  confirmed && "border-emerald-500 focus-visible:border-emerald-500",
                )}
              />
              {confirmed && (
                <ShieldCheck className="pointer-events-none absolute right-3 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-emerald-500" />
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
              Скасувати
            </Button>
            <Button type="submit" variant="destructive" disabled={!confirmed || pending}>
              Видалити назавжди
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
