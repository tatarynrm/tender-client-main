import { useState } from "react";
import { MessageSquare, AlertTriangle, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/shared/components/ui";
import { cn } from "@/shared/utils";
import { motion, AnimatePresence } from "framer-motion";

export function SendNotificationModal({
  onConfirm,
  onClose,
}: {
  onConfirm: (message: string) => void;
  onClose: () => void;
}) {
  const [message, setMessage] = useState("");
  const [showConfirmStep, setShowConfirmStep] = useState(false);

  const handleNextClick = () => {
    if (!message.trim()) return;
    setShowConfirmStep(true);
  };

  const handleConfirmClick = () => {
    onConfirm(message);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* OVERLAY */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* MODAL */}
      <div 
        className="relative overflow-hidden bg-white dark:bg-[#09090b] rounded-[2rem] w-full max-w-md shadow-2xl z-[10001]"
        onClick={(e) => e.stopPropagation()}
      >
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
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-600 shadow-xl shadow-indigo-500/30 flex items-center justify-center mb-4">
                    <MessageSquare className="h-8 w-8 text-white" strokeWidth={1.8} />
                  </div>
                  <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight uppercase">
                    Надіслати <span className="text-indigo-600">Сповіщення</span>
                  </h3>
                  <p className="mt-2 text-xs font-medium text-zinc-500">
                    Це повідомлення отримають усі компанії, що беруть участь у даному тендері.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 px-1">
                    Текст повідомлення
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Введіть текст сповіщення для підписантів..."
                    className={cn(
                      "w-full h-32 p-4 text-sm font-medium rounded-2xl border-2 transition-all duration-500 resize-none outline-none",
                      "bg-zinc-50 dark:bg-[#121214] text-zinc-900 dark:text-white border-zinc-100 dark:border-zinc-800",
                      "focus:border-indigo-600/50 focus:ring-4 focus:ring-indigo-500/5"
                    )}
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="ghost"
                    onClick={onClose}
                    className="flex-1 h-12 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] text-zinc-400 hover:text-red-500 transition-all border border-transparent hover:border-red-100"
                  >
                    Скасувати
                  </Button>
                  <Button
                    disabled={!message.trim()}
                    onClick={handleNextClick}
                    className={cn(
                      "flex-[1.5] h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/30",
                      "font-black uppercase tracking-[0.15em] text-[11px] flex gap-3 group transition-all active:scale-95"
                    )}
                  >
                    Далі
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
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-500 shadow-xl shadow-indigo-500/30 flex items-center justify-center mb-4">
                    <AlertTriangle className="h-8 w-8 text-white" strokeWidth={1.8} />
                  </div>
                  <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight uppercase">
                    Підтвердіть <span className="text-indigo-600">Відправку</span>
                  </h3>
                  <p className="mt-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 px-2">
                    Будь ласка, обережно перевірте текст. Повідомлення буде миттєво надіслано підписантам.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border-2 border-dashed border-zinc-200 dark:border-zinc-700 text-left">
                  <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Ваше повідомлення</div>
                  <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap break-words">
                    {message}
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => setShowConfirmStep(false)}
                    className="flex-1 h-12 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] text-zinc-400 flex gap-2 items-center justify-center border border-transparent hover:border-zinc-200"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Назад
                  </Button>
                  <Button
                    onClick={handleConfirmClick}
                    className={cn(
                      "flex-[1.5] h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-500/30",
                      "font-black uppercase tracking-[0.15em] text-[11px] flex gap-3 group transition-all active:scale-95"
                    )}
                  >
                    Підтвердити
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
