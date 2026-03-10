"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { useModalStore } from "@/shared/stores/useModalStore";
import { cn } from "@/shared/utils";

export const ModalProvider = () => {
  const { isOpen, view, config, closeModal } = useModalStore();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeModal();
    }
  };

  // Вирішуємо ширину на основі конфігурації
  const getWidthClass = (size?: string) => {
    switch (size) {
      case "sm":
        return "sm:max-w-sm";
      case "md":
        return "sm:max-w-md";
      case "lg":
        return "sm:max-w-lg";
      case "xl":
        return "sm:max-w-xl";
      case "full":
        return "sm:max-w-[95vw]";
      default:
        return "sm:max-w-lg";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className={cn(getWidthClass(config.size), config.className)}>
        {(config.title || config.description) && (
          <DialogHeader>
            {config.title && <DialogTitle>{config.title}</DialogTitle>}
            {config.description && (
              <DialogDescription>{config.description}</DialogDescription>
            )}
          </DialogHeader>
        )}
        <div className="flex flex-col gap-4">
          {view}
        </div>
      </DialogContent>
    </Dialog>
  );
};
