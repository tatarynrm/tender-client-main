import { Bell } from "lucide-react";
import { cn } from "@/shared/utils";
import { tenderManagerService } from "../../../services/tender.manager.service";
import { toast } from "sonner";
import { useState } from "react";
import { ConfirmResultModal } from "./TenderActionsModals/ConfirmResultModal";

interface ActionsProps {
  tender: any;
  itemClass: string;
  textClass: string;
  config: any;
  onClose: () => void;
}

export const ClosedActions = ({
  tender,
  itemClass,
  textClass,
  config,
  onClose,
}: ActionsProps) => {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleNotify = async () => {
    setIsLoading(true);
    try {
      await tenderManagerService.sendResultNotification(tender.id);
      toast.success("Результати успішно надіслано учасникам!");
      setIsConfirmModalOpen(false);
      onClose();
    } catch (error) {
      toast.error("Помилка при відправці результатів");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsConfirmModalOpen(true);
        }}
        className={cn(itemClass, "text-emerald-600")}
      >
        <Bell size={config.icon - 2} />
        <span className={textClass}>Сповістити про результати</span>
      </button>

      {isConfirmModalOpen && (
        <ConfirmResultModal
          tenderId={tender.id}
          isPending={isLoading}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={handleNotify}
        />
      )}
    </>
  );
};
