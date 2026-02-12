import { Edit3, CheckCircle2 } from "lucide-react";
import { cn } from "@/shared/utils";
import { useRouter } from "next/navigation";

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
  return (
    <>
      <button
        onClick={() => {
          // Ваша логіка
          router.push(`/log/tender/edit/${tender.id}`);
          onClose();
        }}
        className={itemClass}
      >
        <Edit3 size={config.icon - 2} className="opacity-70" />
        <span className={textClass}>Редагувати чернетку</span>
      </button>

      <button
        onClick={() => {
          onClose();
        }}
        className={cn(itemClass, "text-blue-600")}
      >
        <CheckCircle2 size={config.icon - 2} />
        <span className={textClass}>Опублікувати</span>
      </button>
    </>
  );
};
