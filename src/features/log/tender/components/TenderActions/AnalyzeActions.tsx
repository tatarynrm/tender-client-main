import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/shared/utils";
import { StatusPickerModal } from "./TenderActionsModals/StatusPickerModal";

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

  return (
    <>
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
