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
      className:
        "p-0 rounded-3xl border-0 overflow-hidden shadow-[0_0_50px_-12px_rgba(79,70,229,0.3)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] bg-white/80 dark:bg-zinc-900/90 backdrop-blur-3xl ",
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleOpenModal}
      className={cn(
        "gap-2 border-indigo-200/50 bg-indigo-50/50 text-indigo-700 hover:bg-indigo-100/80 hover:text-indigo-800 dark:bg-indigo-900/10 dark:border-indigo-900/20 dark:text-indigo-400 font-bold transition-all px-3 py-2 md:px-6 md:py-5 rounded-xl shadow-sm hover:shadow-indigo-500/10",
        className,
      )}
    >
      <Sparkles className="w-4 h-4 text-indigo-500" />
      <span className="hidden md:inline">Відгуки</span>
    </Button>
  );
};
