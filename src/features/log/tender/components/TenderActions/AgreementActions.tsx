"use client";

import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/shared/utils";
import { useModalStore } from "@/shared/stores/useModalStore";
import { useUpdateTenderCloseStatus } from "@/features/log/hooks/useUpdateTenderCloseStatus";

interface ActionsProps {
  tender: any;
  itemClass: string;
  textClass: string;
  config: any;
  onClose: () => void;
}

export const AgreementActions = ({
  tender,
  itemClass,
  textClass,
  config,
  onClose,
}: ActionsProps) => {
  const { confirm } = useModalStore();
  const { mutateAsync: updateCloseStatus, isPending } =
    useUpdateTenderCloseStatus();

  const handleApprove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    confirm({
      title: "Підтвердження погодження",
      description: `Ви впевнені, що хочете ПОГОДИТИ тендер #${tender.id}?`,
      showComment: true,
      commentPlaceholder: "Додайте коментар до погодження (опціонально)...",
      onConfirm: async (comment?: string) => {
        try {
          await updateCloseStatus({
            id_tender: tender.id,
            close_status: "ENABLE",
            notes: comment || "",
          });
          onClose();
        } catch (e) {}
      },
      variant: "success",
      confirmText: "Так, погодити",
    });
  };

  const handleReject = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    confirm({
      title: "Підтвердження відхилення",
      description: `Ви впевнені, що хочете ВІДХИЛИТИ тендер #${tender.id}?`,
      showComment: true,
      commentPlaceholder: "Вкажіть причину відхилення (опціонально)...",
      onConfirm: async (comment?: string) => {
        try {
          await updateCloseStatus({
            id_tender: tender.id,
            close_status: "DISABLE",
            notes: comment || "",
          });
          onClose();
        } catch (e) {}
      },
      variant: "danger",
      confirmText: "Так, відхилити",
    });
  };

  return (
    <>
      <button
        onClick={handleApprove}
        disabled={isPending}
        className={cn(
          itemClass,
          "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10",
        )}
      >
        <CheckCircle2 size={config.icon - 2} />
        <span className={textClass}>Погодити</span>
      </button>

      <button
        onClick={handleReject}
        disabled={isPending}
        className={cn(
          itemClass,
          "text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10",
        )}
      >
        <XCircle size={config.icon - 2} />
        <span className={textClass}>Відхилити</span>
      </button>
    </>
  );
};
