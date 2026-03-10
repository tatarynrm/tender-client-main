import { Sparkles } from "lucide-react";
import { Button } from "@/shared/components/ui";
import { useModal } from "@/shared/hooks/useGlobalModal";
import { ModernSuggestionForm } from "./ModernSuggestionForm";
import { cn } from "@/shared/utils";

interface FeedbackButtonProps {
  className?: string;
}

export const FeedbackButton = ({ className }: FeedbackButtonProps) => {
  const { open } = useModal();
  const isNew = className?.includes("new-feature");

  const handleOpenModal = () => {
    open(<ModernSuggestionForm />, {
      size: "lg",
      className: "p-0 rounded-3xl border-0 overflow-hidden shadow-[0_0_50px_-12px_rgba(79,70,229,0.3)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] bg-white/80 dark:bg-zinc-900/90 backdrop-blur-3xl ",
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleOpenModal}
      className={cn(
        "group relative gap-2 border-indigo-200/50 bg-indigo-50/50 text-indigo-700 hover:bg-indigo-100/80 hover:text-indigo-800 dark:bg-indigo-900/10 dark:border-indigo-900/20 dark:text-indigo-400 font-bold transition-all px-6 py-5 rounded-xl hover:scale-[1.03] active:scale-[0.98] shadow-sm hover:shadow-indigo-500/10",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

      {isNew && (
        <span className="absolute -top-1.5 -right-1.5 flex h-5 w-auto px-1.5 items-center justify-center">
          <span className="animate-ping absolute inline-flex h-[70%] w-[90%] rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full px-1.5 py-0.5 bg-red-500 text-[10px] font-black leading-none text-white shadow-sm ring-1 ring-white dark:ring-red-400/30">
            NEW
          </span>
        </span>
      )}

      <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
      <span>Стати кращими</span>
    </Button>
  );
};
