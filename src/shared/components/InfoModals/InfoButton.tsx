"use client";

import React from "react";
import { Info } from "lucide-react";
import { useModalStore } from "@/shared/stores/useModalStore";
import { cn } from "@/shared/utils";

type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

interface InfoButtonProps {
  /** Вміст пояснювальної модалки */
  view: React.ReactNode;
  /** Заголовок модалки */
  title?: string;
  size?: ModalSize;
  className?: string;
  iconSize?: number;
  /** Необов'язковий підпис біля іконки */
  label?: string;
}

/**
 * Універсальна кнопка-значок "i" — відкриває передану пояснювальну модалку
 * через глобальний стор модалок. Самі модалки живуть у цій же папці
 * (shared/components/InfoModals), щоб усі пояснення були в одному місці.
 */
export const InfoButton = ({
  view,
  title,
  size = "lg",
  className,
  iconSize = 14,
  label,
}: InfoButtonProps) => {
  const { openModal } = useModalStore();

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        openModal(view, { size, title });
      }}
      title={title || "Як це працює?"}
      aria-label={title || "Інформація"}
      className={cn(
        "inline-flex items-center gap-1 text-slate-400 hover:text-blue-500 transition-colors",
        className,
      )}
    >
      <Info size={iconSize} />
      {label && <span className="text-[11px] font-semibold">{label}</span>}
    </button>
  );
};
