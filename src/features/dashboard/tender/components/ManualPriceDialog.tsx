// components/ManualPriceDialog.tsx
import { useState, useEffect } from "react";
import { Coins, AlertTriangle, ArrowRight, ShieldCheck, Banknote, Info, ArrowLeft } from "lucide-react";
import { Button, Input } from "@/shared/components/ui";
import { cn } from "@/shared/utils";
import { useModalStore } from "@/shared/stores/useModalStore";
import { motion, AnimatePresence } from "framer-motion";

export function ManualPriceDialog({
  onConfirm,
  currentPrice,
  currentValut,
}: any) {
  const [price, setPrice] = useState<string | number>(currentPrice || "");
  const [showConfirmStep, setShowConfirmStep] = useState(false);
  const { closeModal } = useModalStore();

  useEffect(() => {
    setPrice(currentPrice || "");
    setShowConfirmStep(false);
  }, [currentPrice]);

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
    closeModal();
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
    <div className="relative overflow-hidden bg-white dark:bg-[#09090b] rounded-[2rem]">
      {/* 🔮 DECORATIVE ELEMENTS */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
      
      <div className="p-6 sm:p-8 pt-10">
        <AnimatePresence mode="wait">
          {!showConfirmStep ? (
            <motion.div
              key="input-step"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* HEADER */}
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-[2rem] bg-indigo-600 shadow-2xl shadow-indigo-500/30 flex items-center justify-center mb-6">
                  <Banknote className="h-10 w-10 text-white" strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight uppercase">
                  Ваша <span className="text-indigo-600">Пропозиція</span>
                </h3>
                <div className="mt-2 flex items-center gap-2 px-3 py-1 bg-zinc-100 dark:bg-white/5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Secure Bid System</span>
                </div>
              </div>

              {/* INPUT SECTION */}
              <div className="space-y-4">
                <div className="flex justify-between items-end px-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                    Сума ставки
                  </label>
                  {hasLimit && (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400">
                      <span>Ліміт:</span>
                      <span className="text-zinc-900 dark:text-zinc-200">{currentPrice} {currencySymbol}</span>
                    </div>
                  )}
                </div>

                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-zinc-300 dark:text-zinc-700 transition-colors group-focus-within:text-indigo-500/50">
                    {currencySymbol}
                  </div>
                  <Input
                    type="number"
                    value={price}
                    autoFocus
                    className={cn(
                      "h-20 pl-12 pr-6 text-3xl font-black rounded-3xl border-2 transition-all duration-500",
                      "bg-zinc-50 dark:bg-[#121214] text-zinc-900 dark:text-white",
                      isPriceTooHigh 
                        ? "border-red-500 focus-visible:ring-red-500/10" 
                        : "border-zinc-100 dark:border-zinc-800 focus-visible:ring-indigo-500/10 focus-visible:border-indigo-600"
                    )}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPrice(val === "" ? "" : Number(val));
                    }}
                    placeholder="0.00"
                  />
                  {isPriceTooHigh && (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="absolute -bottom-6 left-1 flex items-center gap-2 text-[10px] text-red-500 font-bold"
                    >
                      <AlertTriangle className="h-3 w-3" />
                      <span>Ставка занадто висока</span>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* FOOTER BUTTONS */}
              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <Button
                  variant="ghost"
                  onClick={closeModal}
                  className="flex-1 h-14 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] text-zinc-400 hover:text-red-500 transition-all border border-transparent hover:border-red-100"
                >
                  Скасувати
                </Button>
                <Button
                  disabled={isPriceInvalid}
                  onClick={handleConfirmClick}
                  className={cn(
                    "flex-[1.5] h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xl shadow-indigo-500/30",
                    "font-black uppercase tracking-[0.15em] text-[11px] flex gap-3 group transition-all active:scale-95"
                  )}
                >
                  Подати ставку
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="confirm-step"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-8"
            >
              {/* WARNING HEADER */}
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-[2rem] bg-amber-500 shadow-2xl shadow-amber-500/30 flex items-center justify-center mb-6 animate-pulse">
                  <AlertTriangle className="h-10 w-10 text-white" strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight uppercase">
                  Дуже низька <span className="text-amber-600">Ціна!</span>
                </h3>
                <p className="mt-3 text-sm font-medium text-zinc-500 dark:text-zinc-400 px-4">
                  Ваша ставка менше половини початкової вартості. Ви впевнені?
                </p>
              </div>

              {/* BID PREVIEW */}
              <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-500/5 border-2 border-dashed border-amber-200 dark:border-amber-500/20 text-center">
                <div className="text-[10px] font-black uppercase tracking-widest text-amber-600/60 dark:text-amber-400/60 mb-1">Ваша пропозиція</div>
                <div className="text-5xl font-black text-amber-700 dark:text-amber-300 tracking-tighter">
                  {price}<span className="text-2xl ml-1">{currencySymbol}</span>
                </div>
              </div>

              {/* WARNING FOOTER BUTTONS */}
              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setShowConfirmStep(false)}
                  className="flex-1 h-14 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] text-zinc-400 flex gap-2 items-center justify-center border border-transparent hover:border-zinc-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Назад
                </Button>
                <Button
                  onClick={handleConfirmClick}
                  className={cn(
                    "flex-[1.5] h-14 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white shadow-2xl shadow-amber-500/30",
                    "font-black uppercase tracking-[0.15em] text-[11px] flex gap-3 group transition-all active:scale-95"
                  )}
                >
                  Так, надіслати
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SECURE BLOCK */}
        <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800/50 flex items-center justify-center gap-6 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700">
           <div className="flex items-center gap-2">
             <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
               <ShieldCheck className="w-3 h-3" />
             </div>
             <span className="text-[8px] font-black uppercase tracking-widest">Validated</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
               <Info className="w-3 h-3" />
             </div>
             <span className="text-[8px] font-black uppercase tracking-widest">Protected</span>
           </div>
        </div>
      </div>
    </div>
  );
}
