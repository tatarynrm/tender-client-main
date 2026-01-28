"use client";
import React, { useEffect, useRef } from "react";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
  closeOnBackdropClick?: boolean;
  variant?: "center" | "right";
  className?: string; // Додано пропс
}

export function AppBaseModal({
  isOpen,
  onClose,
  children,
  maxWidth = "max-w-sm",
  closeOnBackdropClick = true,
  variant = "center",
  className = "", // Значення за замовчуванням
}: BaseModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (isOpen) {
      dialog?.showModal();
      document.body.style.overflow = "hidden";
    } else {
      dialog?.close();
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (closeOnBackdropClick && e.target === dialogRef.current) {
      onClose();
    }
  };

  const handleCancel = (e: React.SyntheticEvent) => {
    if (!closeOnBackdropClick) {
      e.preventDefault();
    }
  };

  const isRight = variant === "right";

  const dialogClasses = isRight
    ? "fixed inset-0 z-[100] bg-transparent p-0 m-0 ml-auto h-screen max-h-screen border-none outline-none backdrop:bg-slate-950/30"
    : "fixed inset-0 z-[100] bg-transparent p-0 m-auto border-none outline-none backdrop:bg-slate-950/40 backdrop:backdrop-blur-sm";

  // Об'єднуємо maxWidth та className для контенту
  const contentClasses = isRight
    ? `h-full w-full ${maxWidth} ${className} bg-white dark:bg-slate-900 border-l border-zinc-200 dark:border-white/10 shadow-2xl relative`
    : `modal-content w-[calc(100vw-2rem)] ${maxWidth} ${className} bg-white dark:bg-slate-900 border border-zinc-200 dark:border-white/10 rounded-2xl overflow-hidden relative shadow-2xl`;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      className={dialogClasses}
    >
      <div className={contentClasses}>{children}</div>

      <style jsx>{`
        dialog[open]:not(.ml-auto) {
          animation: modal-appear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        dialog[open].ml-auto {
          animation: sheet-slide 0.3s ease-out;
        }
        dialog::backdrop {
          animation: backdrop-fade 0.2s ease-out;
        }
        @keyframes modal-appear {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes sheet-slide {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        @keyframes backdrop-fade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </dialog>
  );
}
