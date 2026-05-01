import { Eye, Copy, Archive, Edit3, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/shared/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { StatusPickerModal } from "./TenderActionsModals/StatusPickerModal";
import { ProlongationModal } from "./TenderActionsModals/ProlongationModal";

interface ActionsProps {
  tender: any;
  itemClass: string;
  textClass: string;
  config: any;
  onClose: () => void;
}

export const ActiveActions = ({
  tender,
  itemClass,
  textClass,
  config,
  onClose,
}: ActionsProps) => {
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isProlongModalOpen, setIsProlongModalOpen] = useState(false);
  const router = useRouter();
  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          router.push(`/log/tender/edit/${tender.id}`);
          onClose();
        }}
        className={itemClass}
      >
        <Edit3 size={config.icon - 2} className="opacity-70" />
        <span className={textClass}>Редагувати</span>
      </button>

      <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800 my-0.5 mx-1" />

      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsProlongModalOpen(true);
        }}
        className={cn(itemClass, "text-amber-600")}
      >
        <Clock size={config.icon - 2} />
        <span className={textClass}>Пролонгація тендеру</span>
      </button>

      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsStatusModalOpen(true);
        }}
        className={cn(itemClass, "text-blue-600")}
      >
        <CheckCircle2 size={config.icon - 2} />
        <span className={textClass}>Вказати статус</span>
      </button>

      {isStatusModalOpen && (
        <StatusPickerModal
          tenderId={tender.id}
          onClose={() => {
            setIsStatusModalOpen(false);
            setTimeout(() => {
              onClose();
            }, 100);
          }}
        />
      )}

      {isProlongModalOpen && (
        <ProlongationModal
          tenderId={tender.id}
          onClose={() => {
            setIsProlongModalOpen(false);
            setTimeout(() => {
              onClose();
            }, 100);
          }}
        />
      )}
    </>
  );
};
