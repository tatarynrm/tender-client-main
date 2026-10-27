import { useState } from "react";
import { Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/shared/utils";
import { StatusPickerModal } from "./TenderActionsModals/StatusPickerModal";
import { ProlongationModal } from "./TenderActionsModals/ProlongationModal";

interface ActionsProps {
  tender: any;
  itemClass: string;
  textClass: string;
  config: any;
  onClose: () => void;
}

export const AnalyzeActions = ({
  tender,
  itemClass,
  textClass,
  config,
  onClose,
}: ActionsProps) => {
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isProlongModalOpen, setIsProlongModalOpen] = useState(false);

  return (
    <>
      {/* Пролонгація доступна лише в розділі «Аналіз». Часових рамок немає. */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsProlongModalOpen(true);
          // НЕ викликаємо onClose() тут, інакше модалка зникне разом з меню.
        }}
        className={cn(itemClass, "text-indigo-600")}
      >
        <Clock size={config.icon - 2} />
        <span className={textClass}>Продовжити</span>
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

      {isProlongModalOpen && (
        <ProlongationModal
          tender={tender}
          onClose={() => {
            setIsProlongModalOpen(false);
            setTimeout(() => {
              onClose();
            }, 100);
          }}
        />
      )}

      {isStatusModalOpen && (
        <StatusPickerModal
          tenderId={tender.id}
          tender={tender}
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
