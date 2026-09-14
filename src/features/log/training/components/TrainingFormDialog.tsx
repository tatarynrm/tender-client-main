"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FileVideo, UploadCloud } from "lucide-react";
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
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  TRAINING_ALLOWED_EXT,
  TRAINING_MAX_FILE_SIZE,
} from "../../services/training.service";
import { useUploadTraining } from "../hooks/useUploadTraining";
import { useUpdateTraining } from "../hooks/useUpdateTraining";
import { ITrainingVideo } from "../types/training.type";
import { formatFileSize } from "../utils/training.utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Якщо передано — редагування, інакше завантаження нового відео. */
  video?: ITrainingVideo | null;
  topics: string[];
  onCreated?: (id: string) => void;
}

export function TrainingFormDialog({ open, onOpenChange, video, topics, onCreated }: Props) {
  const isEdit = !!video;

  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);

  const upload = useUploadTraining(setProgress);
  const update = useUpdateTraining();
  const isPending = upload.isPending || update.isPending;

  useEffect(() => {
    if (!open) return;
    setTitle(video?.title ?? "");
    setTopic(video?.topic ?? "");
    setDescription(video?.description ?? "");
    setOrder(video ? String(video.order) : "");
    setFile(null);
    setProgress(0);
  }, [open, video]);

  const handleOpenChange = (next: boolean) => {
    if (isPending) return; // не закриваємо посеред завантаження
    onOpenChange(next);
  };

  const handleFile = (selected: File | null) => {
    if (!selected) return setFile(null);
    const ext = selected.name.slice(selected.name.lastIndexOf(".")).toLowerCase();
    if (!TRAINING_ALLOWED_EXT.includes(ext)) {
      toast.error("Дозволені формати: mp4, webm, mov");
      return;
    }
    if (selected.size > TRAINING_MAX_FILE_SIZE) {
      toast.error("Файл завеликий (максимум 2 ГБ)");
      return;
    }
    setFile(selected);
    if (!title) setTitle(selected.name.replace(/\.[^.]+$/, ""));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !topic.trim()) {
      toast.error("Заповніть назву і тему");
      return;
    }
    const payload = { title: title.trim(), topic: topic.trim(), description: description.trim() };

    if (isEdit && video) {
      const orderNumber = Number(order);
      update.mutate(
        {
          id: video.id,
          payload: { ...payload, ...(order !== "" && Number.isFinite(orderNumber) ? { order: orderNumber } : {}) },
        },
        { onSuccess: () => onOpenChange(false) },
      );
      return;
    }

    if (!file) {
      toast.error("Оберіть файл відео");
      return;
    }
    upload.mutate(
      { ...payload, file },
      {
        onSuccess: (created) => {
          onOpenChange(false);
          onCreated?.(created.id);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="p-6" showCloseButton={!isPending}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Редагування уроку" : "Нове навчальне відео"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Змініть назву, тему, опис або порядок у темі."
                : "Відео зберігається на сервері й доступне лише для перегляду працівникам ICT."}
            </DialogDescription>
          </DialogHeader>

          {!isEdit && (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 p-5 text-center transition-colors hover:border-blue-400 dark:border-white/15">
              {file ? (
                <>
                  <FileVideo className="h-7 w-7 text-blue-500" />
                  <span className="max-w-full truncate text-sm font-medium">{file.name}</span>
                  <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
                </>
              ) : (
                <>
                  <UploadCloud className="h-7 w-7 text-muted-foreground" />
                  <span className="text-sm font-medium">Оберіть файл відео</span>
                  <span className="text-xs text-muted-foreground">mp4, webm, mov · до 2 ГБ</span>
                </>
              )}
              <input
                type="file"
                accept={TRAINING_ALLOWED_EXT.join(",")}
                className="hidden"
                disabled={isPending}
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />
            </label>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="training-topic">Тема</Label>
            <Input
              id="training-topic"
              list="training-topics"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Наприклад: Заявки"
              maxLength={100}
              disabled={isPending}
            />
            <datalist id="training-topics">
              {topics.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="training-title">Назва уроку</Label>
            <Input
              id="training-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Наприклад: Як створити заявку"
              maxLength={200}
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="training-description">Опис</Label>
            <Textarea
              id="training-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Коротко, про що урок (необов'язково)"
              maxLength={3000}
              rows={3}
              disabled={isPending}
            />
          </div>

          {isEdit && (
            <div className="space-y-1.5">
              <Label htmlFor="training-order">Порядок у темі</Label>
              <Input
                id="training-order"
                type="number"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                disabled={isPending}
              />
            </div>
          )}

          {upload.isPending && (
            <div className="space-y-1">
              <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-right text-xs text-muted-foreground">
                {progress < 100 ? `Завантаження… ${progress}%` : "Обробка на сервері…"}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Скасувати
            </Button>
            <Button type="submit" disabled={isPending}>
              {isEdit ? "Зберегти" : "Завантажити"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
