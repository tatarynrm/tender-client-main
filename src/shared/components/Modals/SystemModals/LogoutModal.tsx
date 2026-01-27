import { AlertCircle } from "lucide-react";
import { AppBaseModal } from "../AppBaseModal";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
  return (
    <AppBaseModal isOpen={isOpen} onClose={onClose} >
      {/* Акцентна лінія */}
      <div className="h-2 bg-rose-500" />

      {/* Контент */}
      <div className="flex flex-col items-center p-8 text-center">
        <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-500/10 rounded-full text-rose-500">
          <AlertCircle size={32} />
        </div>
        <h3 className="text-[14px] uppercase tracking-widest font-black mb-2">
          Вихід
        </h3>
        <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
          Ви впевнені?
        </p>
      </div>

      {/* Кнопки дії */}
      <div className="flex border-t border-zinc-100 dark:border-white/5">
        <button
          onClick={onClose}
          className="flex-1 py-4 text-[10px] uppercase font-bold text-zinc-500 hover:bg-zinc-50"
        >
          Скасувати
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-4 bg-rose-500 text-white text-[10px] uppercase font-bold"
        >
          Так, вийти
        </button>
      </div>
    </AppBaseModal>
  );
}
