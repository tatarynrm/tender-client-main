// components/ManualPriceDialog.tsx
import { useState, useEffect } from "react";
import { Coins, AlertTriangle, ArrowRight, DollarSign } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button, Input } from "@/shared/components/ui";
import { cn } from "@/shared/utils";

export function ManualPriceDialog({
  open,
  onOpenChange,
  onConfirm,
  currentPrice,
  currentValut,
}: any) {
  const [price, setPrice] = useState<string | number>(currentPrice || "");
  const [showConfirmStep, setShowConfirmStep] = useState(false);

  useEffect(() => {
    if (open) {
      setPrice(currentPrice || "");
      setShowConfirmStep(false);
    }
  }, [open, currentPrice]);

  const hasLimit =
    currentPrice !== undefined && currentPrice !== null && currentPrice > 0;

  const isPriceTooHigh = hasLimit && Number(price) > currentPrice;
  const isPriceInvalid = !price || Number(price) <= 0 || isPriceTooHigh;

  const handleConfirmClick = () => {
    const isHalfPrice = hasLimit && Number(price) <= currentPrice * 0.5;

    if (isHalfPrice && !showConfirmStep) {
      setShowConfirmStep(true);
      return;
    }

    onConfirm(price, "Користувацька ціна");
    setShowConfirmStep(false);
  };

  const getCurrencySymbol = (valut: string) => {
    switch (valut) {
      case "UAH": return "₴";
      case "USD": return "$";
      case "EUR": return "€";
      case "PLN": return "zł";
      default: return valut || "";
    }
  };

  const currencySymbol = getCurrencySymbol(currentValut);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border-none bg-white dark:bg-zinc-950 shadow-2xl">
        <div className="p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-500",
              showConfirmStep 
                ? "bg-amber-50 dark:bg-amber-500/10 text-amber-500" 
                : "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500"
            )}>
              {showConfirmStep ? (
                <AlertTriangle className="h-8 w-8 animate-pulse" />
              ) : (
                <Coins className="h-8 w-8" />
              )}
            </div>
            <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
              {showConfirmStep ? "Низька ціна!" : "Ваша ціна"}
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1 font-medium">
              {showConfirmStep 
                ? "Ви впевнені, що хочете запропонувати настільки низьку ставку?" 
                : "Вкажіть суму, за яку ви готові виконати цей рейс"}
            </p>
          </div>

          {!showConfirmStep ? (
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-indigo-500 transition-colors">
                <span className="text-xl font-bold">{currencySymbol}</span>
              </div>
              <Input
                type="number"
                value={price}
                autoFocus
                className={cn(
                  "h-16 pl-12 text-2xl font-black rounded-2xl border-2 transition-all duration-300",
                  "bg-zinc-50 dark:bg-white/[0.02]",
                  isPriceTooHigh
                    ? "border-red-500 focus-visible:ring-red-500/20"
                    : "border-zinc-100 dark:border-zinc-800 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500"
                )}
                onChange={(e) => {
                  const val = e.target.value;
                  setPrice(val === "" ? "" : Number(val));
                }}
                placeholder="0.00"
              />
              
              <div className="mt-4 flex flex-col gap-2">
                {hasLimit && (
                  <div className={cn(
                    "flex justify-between items-center p-3 rounded-xl border text-xs font-bold transition-colors",
                    isPriceTooHigh 
                      ? "bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400"
                      : "bg-zinc-50 dark:bg-white/5 border-zinc-100 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400"
                  )}>
                    <span>МАКСИМАЛЬНИЙ ЛІМІТ:</span>
                    <span className="text-sm">{currentPrice} {currencySymbol}</span>
                  </div>
                )}
                {isPriceTooHigh && (
                  <div className="flex items-center gap-2 text-[11px] text-red-500 font-bold px-1 animate-in fade-in slide-in-from-top-1">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Ціна не може перевищувати поточну ставку</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-500/5 border-2 border-amber-100 dark:border-amber-500/20 text-center">
              <div className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-2">Ваша пропозиція</div>
              <div className="text-4xl font-black text-amber-700 dark:text-amber-300 flex items-center justify-center gap-1">
                {price} <span className="text-2xl">{currencySymbol}</span>
              </div>
              <div className="mt-4 text-xs font-bold text-amber-600/80 dark:text-amber-400/80">
                Це менше 50% від початкової ціни
              </div>
            </div>
          )}
        </div>

        <div className="bg-zinc-50/80 dark:bg-white/5 p-4 sm:p-6 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800/50">
          <Button
            variant="ghost"
            onClick={() => showConfirmStep ? setShowConfirmStep(false) : onOpenChange(false)}
            className="font-bold text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            {showConfirmStep ? "Назад" : "Скасувати"}
          </Button>
          <Button
            disabled={!showConfirmStep && isPriceInvalid}
            onClick={handleConfirmClick}
            className={cn(
              "font-black uppercase tracking-wider text-[11px] px-8 h-12 shadow-xl transition-all active:scale-95 flex gap-2 group",
              showConfirmStep
                ? "bg-amber-600 hover:bg-amber-700 shadow-amber-500/20"
                : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20"
            )}
          >
            {showConfirmStep ? "Так, підтверджую" : "Надіслати ставку"}
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
