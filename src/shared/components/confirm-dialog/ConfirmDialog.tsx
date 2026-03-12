"use client";

import { ReactNode } from "react";
import { AlertCircle, HelpCircle, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui";
import { Button } from "@/shared/components/ui";
import { cn } from "@/shared/utils";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string | ReactNode;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "danger" | "success" | "warning";
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title = "Підтвердіть дію",
  description,
  onConfirm,
  confirmText = "Підтвердити",
  cancelText = "Скасувати",
  variant = "default",
}: ConfirmDialogProps) {
  const getIcon = () => {
    switch (variant) {
      case "danger":
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      case "success":
        return <CheckCircle2 className="h-6 w-6 text-emerald-500" />;
      case "warning":
        return <AlertCircle className="h-6 w-6 text-amber-500" />;
      default:
        return <HelpCircle className="h-6 w-6 text-blue-500" />;
    }
  };

  const getButtonVariant = () => {
    switch (variant) {
      case "danger":
        return "destructive";
      case "success":
        return "default"; // Or variant specialized for success if exists
      default:
        return "default";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-none bg-white dark:bg-zinc-950 shadow-2xl">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={cn(
              "p-3 rounded-full shrink-0",
              variant === "danger" && "bg-red-50 dark:bg-red-500/10",
              variant === "success" && "bg-emerald-50 dark:bg-emerald-500/10",
              variant === "warning" && "bg-amber-50 dark:bg-amber-500/10",
              variant === "default" && "bg-blue-50 dark:bg-blue-500/10"
            )}>
              {getIcon()}
            </div>
            <div className="flex-1 pt-1">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                {title}
              </h3>
              {description && (
                <div className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                  {description}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-zinc-50/80 dark:bg-white/5 px-6 py-4 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800/50">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="font-bold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            {cancelText}
          </Button>
          <Button
            variant={getButtonVariant()}
            onClick={() => {
              onConfirm();
            }}
            className={cn(
              "font-black uppercase tracking-wider text-[11px] px-6 h-10 shadow-lg transition-all active:scale-95",
              variant === "default" && "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20",
              variant === "success" && "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20",
            )}
          >
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
