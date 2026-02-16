import { Eye, Copy, Archive, Edit3, CheckCircle2 } from "lucide-react";
import { cn } from "@/shared/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { StatusPickerModal } from "./TenderActionsModals/StatusPickerModal";

interface ActionsProps {
  tender: any;
  itemClass: string;
  textClass: string;
  config: any;
  onClose: () => void;
}

export const PlanActions = ({
  tender,
  itemClass,
  textClass,
  config,
  onClose,
}: ActionsProps) => {
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const router = useRouter();
  return (
    <>
      <button onClick={() => onClose()} className={itemClass}>
        <Eye size={config.icon - 2} className="opacity-70" />
        <span className={textClass}>Переглянути пропозиції</span>
      </button>
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
      <button onClick={() => onClose()} className={itemClass}>
        <Copy size={config.icon - 2} className="opacity-70" />
        <span className={textClass}>Копіювати</span>
      </button>

      <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800 my-0.5 mx-1" />

      <button
        onClick={() => onClose()}
        className={cn(itemClass, "hover:text-orange-600")}
      >
        <Archive size={config.icon - 2} className="text-orange-500" />
        <span className={textClass}>В архів</span>
      </button>

      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsStatusModalOpen(true);
          // НЕ викликаємо тут onClose(), бо воно видалить кнопку разом з модалкою
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
            // Спершу закриваємо модалку в стейті цього компонента
            setIsStatusModalOpen(false);
            // А потім з невеликою затримкою закриваємо саме меню
            setTimeout(() => {
              onClose();
            }, 100);
          }}
        />
      )}
    </>
  );
};
