"use client";

import React, { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { suggestionService } from "@/shared/services/suggestion.service";
import { toast } from "sonner";
import { useModal } from "@/shared/hooks/useGlobalModal";
import { Loader2, Send } from "lucide-react";

export const SuggestionForm = () => {
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { close } = useModal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      toast.error("Будь ласка, введіть ваше повідомлення");
      return;
    }

    setIsLoading(true);
    try {
      await suggestionService.saveSuggestion(notes);
      toast.success("Дякуємо! Ваша пропозиція надіслана.");
      close();
    } catch (error) {
      console.error(error);
      toast.error("Не вдалося відправити повідомлення. Спробуйте пізніше.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-zinc-300">
          Ваші зауваження та пропозиції
        </label>
        <Textarea
          placeholder="Опишіть вашу ідею або повідомте про проблему..."
          className="min-h-[150px] resize-none focus-visible:ring-indigo-500/30 dark:bg-zinc-900/50 dark:border-zinc-800"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="flex justify-end gap-3 mt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={close}
          disabled={isLoading}
          className="dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          Скасувати
        </Button>
        <Button
          type="submit"
          disabled={isLoading || !notes.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 min-w-[120px] shadow-lg shadow-indigo-500/20"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Надіслати
        </Button>
      </div>
    </form>
  );
};
