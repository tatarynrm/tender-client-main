import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui"; // переконайтеся, що шлях правильний
import { MessageSquarePlus } from "lucide-react";
import { Button } from "@/shared/components/ui";

export const FeedbackButton = () => {
  const googleFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLSfqZ_3-EsfDTBZTTRpuB2M_ou7TNSlYe6Ls81o4PRj4OXDkJA/viewform?embedded=true";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800 dark:bg-amber-900/20 dark:border-amber-900/30 dark:text-amber-400"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>Фідбек</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-3xl h-[90vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>Зауваження та пропозиції</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 w-full bg-zinc-50">
          <iframe
            src={googleFormUrl}
            className="w-full h-full"
            frameBorder="0"
            marginHeight={0}
            marginWidth={0}
          >
            Завантаження...
          </iframe>
        </div>
      </DialogContent>
    </Dialog>
  );
};