"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/shared/components/ui/sheet";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { useModalStore } from "@/shared/stores/useModalStore";
import { cn } from "@/shared/utils";
import { AlertCircle, HelpCircle, CheckCircle2, X } from "lucide-react";

export const ModalProvider = () => {
  const { isOpen, type, view, config, closeModal } = useModalStore();
  const [comment, setComment] = React.useState("");

  React.useEffect(() => {
    if (!isOpen) {
      setComment("");
    }
  }, [isOpen]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      config.onClose?.();
      closeModal();
    }
  };

  const onPointerDownOutside = (e: any) => {
    if (config.preventCloseOnOutsideClick) {
      e.preventDefault();
    }
  };

  const getWidthClass = (size?: string) => {
    switch (size) {
      case "sm": return "sm:max-w-sm";
      case "md": return "sm:max-w-md";
      case "lg": return "sm:max-w-lg";
      case "xl": return "sm:max-w-[1000px]";
      case "full": return "sm:max-w-[98vw] h-[96vh] rounded-[2.5rem]";
      case "viewport": return "max-w-full w-full h-full sm:rounded-none border-none";
      default: return "sm:max-w-lg";
    }
  };

  if (type === 'sheet') {
    return (
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetContent
          side={config.side || 'right'}
          className={cn("p-0 overflow-y-auto", getWidthClass(config.size), config.className)}
          onPointerDownOutside={onPointerDownOutside}
        >
          {(config.title || config.description) && (
            <SheetHeader className="p-6 border-b border-zinc-100 dark:border-white/5">
              {config.title && <SheetTitle>{config.title}</SheetTitle>}
              {config.description && (
                <SheetDescription>{config.description}</SheetDescription>
              )}
            </SheetHeader>
          )}
          <div className="p-6">
            {view}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (type === 'confirm') {
    const getIcon = () => {
      const iconSize = 40;
      switch (config.variant) {
        case "danger": return <AlertCircle size={iconSize} className="text-rose-500" strokeWidth={1.5} />;
        case "success": return <CheckCircle2 size={iconSize} className="text-emerald-500" strokeWidth={1.5} />;
        case "warning": return <AlertCircle size={iconSize} className="text-amber-500" strokeWidth={1.5} />;
        default: return <HelpCircle size={iconSize} className="text-indigo-500" strokeWidth={1.5} />;
      }
    };

    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent
          className="sm:max-w-[440px] p-0 overflow-hidden border-none bg-white dark:bg-[#09090b] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] dark:shadow-[0_32px_128px_-16px_rgba(0,0,0,1)] rounded-[2.5rem]"
          onPointerDownOutside={onPointerDownOutside}
        >
          <div className="relative pt-12 pb-8 px-8 flex flex-col items-center text-center overflow-hidden">
            {/* Background elements */}
            <div className={cn(
              "absolute top-0 left-0 w-full h-full opacity-[0.03] dark:opacity-[0.05] pointer-events-none",
              config.variant === "danger" && "bg-rose-500",
              config.variant === "success" && "bg-emerald-500",
              config.variant === "warning" && "bg-amber-500",
              config.variant === "default" && "bg-indigo-500"
            )} />

            <div className={cn(
              "w-24 h-24 rounded-[2.5rem] flex items-center justify-center mb-8 relative z-10",
              config.variant === "danger" && "bg-rose-50 dark:bg-rose-500/10",
              config.variant === "success" && "bg-emerald-50 dark:bg-emerald-500/10",
              config.variant === "warning" && "bg-amber-50 dark:bg-amber-500/10",
              config.variant === "default" && "bg-indigo-50 dark:bg-indigo-500/10"
            )}>
              {getIcon()}
            </div>

            <div className="relative z-10 w-full">
              <DialogTitle className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">
                {config.title || "Підтвердіть дію"}
              </DialogTitle>
              {config.description && (
                <DialogDescription className="mt-4 text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium px-4">
                  {config.description}
                </DialogDescription>
              )}
              {config.showComment && (
                <div className="mt-6 w-full text-left">
                  <Textarea
                    placeholder={config.commentPlaceholder || "Ваш коментар..."}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-[100px] bg-zinc-50 dark:bg-white/5 border-zinc-100 dark:border-white/5 rounded-2xl p-4 text-[13px] font-medium resize-none focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder:text-zinc-400"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-white/[0.02] p-8 flex flex-col sm:flex-row gap-4 border-t border-zinc-100 dark:border-zinc-800/50 relative z-20">
            <Button
              variant="ghost"
              onClick={() => {
                config.onCancel?.();
                closeModal();
              }}
              className="flex-1 h-14 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-white/5 transition-all"
            >
              {config.cancelText || "Скасувати"}
            </Button>
            <Button
              onClick={() => {
                config.onConfirm?.(comment);
                closeModal();
              }}
              className={cn(
                "flex-1 h-14 rounded-2xl font-black uppercase tracking-[0.15em] text-[11px] shadow-2xl transition-all active:scale-95 text-white",
                config.variant === "danger" && "bg-rose-600 hover:bg-rose-700 shadow-rose-500/30",
                config.variant === "success" && "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30",
                config.variant === "warning" && "bg-amber-600 hover:bg-amber-700 shadow-amber-500/30",
                (config.variant === "default" || !config.variant) && "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30"
              )}
            >
              {config.confirmText || "Підтвердити"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(getWidthClass(config.size), "p-0 overflow-hidden", config.className)}
        onPointerDownOutside={onPointerDownOutside}
      >
        {(config.title || config.description) && (
          <DialogHeader className="p-6 border-b border-zinc-100 dark:border-white/5">
            {config.title && <DialogTitle>{config.title}</DialogTitle>}
            {config.description && (
              <DialogDescription>{config.description}</DialogDescription>
            )}
          </DialogHeader>
        )}
        <div className={cn(
          "w-full h-full",
          config.title || config.description ? "p-6" : "p-0"
        )}>
          {view}
        </div>
      </DialogContent>
    </Dialog>
  );
};

