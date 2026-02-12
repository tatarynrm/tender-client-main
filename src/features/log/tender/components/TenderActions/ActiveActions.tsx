import { Eye, Copy, Archive } from "lucide-react";
import { cn } from "@/shared/utils";

interface ActionsProps {
  tender: any;
  itemClass: string;
  textClass: string;
  config: any;
  onClose: () => void;
}

export const ActiveActions = ({ tender, itemClass, textClass, config, onClose }: ActionsProps) => {
  return (
    <>
      <button onClick={() => onClose()} className={itemClass}>
        <Eye size={config.icon - 2} className="opacity-70" />
        <span className={textClass}>Переглянути пропозиції</span>
      </button>
      
      <button onClick={() => onClose()} className={itemClass}>
        <Copy size={config.icon - 2} className="opacity-70" />
        <span className={textClass}>Копіювати</span>
      </button>
      
      <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800 my-0.5 mx-1" />
      
      <button onClick={() => onClose()} className={cn(itemClass, "hover:text-orange-600")}>
        <Archive size={config.icon - 2} className="text-orange-500" />
        <span className={textClass}>В архів</span>
      </button>
    </>
  );
};