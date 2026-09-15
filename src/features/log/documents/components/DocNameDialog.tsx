"use client";

import { useEffect, useRef, useState } from "react";
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

interface Props {
  open: boolean;
  title: string;
  description?: string;
  initialValue: string;
  submitLabel: string;
  pending: boolean;
  /** Для файлу виділяємо лише назву без розширення */
  selectStemOnly?: boolean;
  onSubmit: (value: string) => void;
  onClose: () => void;
}

export function DocNameDialog({
  open, title, description, initialValue, submitLabel, pending, selectStemOnly, onSubmit, onClose,
}: Props) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setValue(initialValue);
    const timer = setTimeout(() => {
      const input = inputRef.current;
      if (!input) return;
      input.focus();
      const dot = initialValue.lastIndexOf(".");
      input.setSelectionRange(0, selectStemOnly && dot > 0 ? dot : initialValue.length);
    }, 50);
    return () => clearTimeout(timer);
  }, [open, initialValue, selectStemOnly]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || trimmed === initialValue) {
      if (trimmed === initialValue && initialValue) onClose();
      return;
    }
    onSubmit(trimmed);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !pending && onClose()}>
      <DialogContent className="p-6">
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={200}
            disabled={pending}
            placeholder="Назва"
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
              Скасувати
            </Button>
            <Button type="submit" disabled={pending || !value.trim()}>
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
