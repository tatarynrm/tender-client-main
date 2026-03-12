// components/ManualPriceDialog.tsx
import { useState, useEffect } from "react";
import { Coins, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/shared/components/ui/dialog";
import { Button, Input } from "@/shared/components/ui";
import { cn } from "@/shared/utils";

export function ManualPriceDialog({
  open,
  onOpenChange,
  onConfirm,
  currentPrice,
}: any) {
  const [price, setPrice] = useState<string | number>(currentPrice || "");

  useEffect(() => {
    if (open) {
      setPrice(currentPrice || "");
    }
  }, [open, currentPrice]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border-none bg-white dark:bg-zinc-950 shadow-2xl">
        <div className="p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500">
              <Coins className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
              Ваша пропозиція
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1 font-medium">
              Вкажіть суму, за яку ви готові виконати цей рейс
            </p>
          </div>

          <div className="relative group">
            <Input
              type="number"
              value={price}
              autoFocus
              className={cn(
                "h-16 text-2xl font-black rounded-2xl border-2 transition-all duration-300",
                "bg-zinc-50 dark:bg-white/[0.02] text-center",
                "border-zinc-100 dark:border-zinc-800 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500"
              )}
              onChange={(e) => {
                const val = e.target.value;
                setPrice(val === "" ? "" : Number(val));
              }}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="bg-zinc-50/80 dark:bg-white/5 p-4 sm:p-6 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800/50">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="font-bold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Скасувати
          </Button>
          <Button
            disabled={!price || Number(price) <= 0}
            onClick={() => onConfirm(price, "Користувацька ціна")}
            className={cn(
              "font-black uppercase tracking-wider text-[11px] px-8 h-12 shadow-xl bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20 flex gap-2 group transition-all active:scale-95"
            )}
          >
            Надіслати пропозицію
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
