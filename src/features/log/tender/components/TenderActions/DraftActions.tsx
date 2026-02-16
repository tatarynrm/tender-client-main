import { useState } from "react"; // Додаємо стан
import { Edit3, CheckCircle2 } from "lucide-react";
import { cn } from "@/shared/utils";
import { useRouter } from "next/navigation";
import { StatusPickerModal } from "./TenderActionsModals/StatusPickerModal";
// Припустимо, у вас є компонент модалки, або ми створимо його нижче

interface ActionsProps {
  tender: any;
  itemClass: string;
  textClass: string;
  config: any;
  onClose: () => void;
}

export const DraftActions = ({
  tender,
  itemClass,
  textClass,
  config,
  onClose,
}: ActionsProps) => {
  const router = useRouter();
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

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
        <span className={textClass}>Редагувати чернетку</span>
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
