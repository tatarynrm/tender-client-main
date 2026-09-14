"use client";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { useDeleteTraining } from "../hooks/useDeleteTraining";
import { ITrainingVideo } from "../types/training.type";

interface Props {
  video: ITrainingVideo | null;
  onClose: () => void;
  onDeleted?: (id: string) => void;
}

export function TrainingDeleteDialog({ video, onClose, onDeleted }: Props) {
  const remove = useDeleteTraining();

  const handleDelete = () => {
    if (!video) return;
    remove.mutate(video.id, {
      onSuccess: () => {
        onDeleted?.(video.id);
        onClose();
      },
    });
  };

  return (
    <Dialog open={!!video} onOpenChange={(open) => !open && !remove.isPending && onClose()}>
      <DialogContent className="p-6">
        <DialogHeader>
          <DialogTitle>Видалити відео?</DialogTitle>
          <DialogDescription>
            «{video?.title}» буде видалено разом із файлом на сервері. Цю дію не можна скасувати.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={remove.isPending}>
            Скасувати
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={remove.isPending}>
            Видалити
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
