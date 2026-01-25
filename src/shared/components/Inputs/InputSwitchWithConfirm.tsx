"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/shared/utils";
import { AppButton } from "@/shared/components/Buttons/AppButton";
import { AlertCircle, X, LucideIcon } from "lucide-react"; // Імпортуємо тип для іконок

interface Props {
  field: {
    value: boolean;
    onChange: (val: boolean) => void;
  };
  text?: string;
  label?: string;
  id?: string;
  icon?: LucideIcon; // Новий пропс: передаємо саму іконку як компонент
}

export function InputSwitchWithConfirm({
  field,
  text,
  label,
  id,
  icon: Icon, // Деструктуризація з перейменуванням для використання як компонента
}: Props) {
  const [openDialog, setOpenDialog] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = () => {
    const newValue = !field.value;
    if (newValue) {
      setOpenDialog(true);
    } else {
      field.onChange(false);
    }
  };

  const confirmEnable = () => {
    field.onChange(true);
    setOpenDialog(false);
  };

  if (label) {
    return (
      <>
        <div
          onClick={handleChange}
          className={cn(
            "flex items-center justify-between cursor-pointer select-none transition-all",
            "p-2 px-3 rounded-xl border w-full max-w-[220px]",
            "bg-blue-50/40 dark:bg-blue-500/5 border-blue-100 dark:border-blue-500/20",
            "hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:border-blue-300",
            field.value &&
              "border-teal-500/40 bg-teal-50/30 dark:bg-teal-500/10",
          )}
        >
          <div className="flex items-center gap-2.5">
            {/* Рендеримо іконку ТІЛЬКИ якщо вона передана в пропсах */}
            {Icon && (
              <div
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  field.value
                    ? "bg-teal-500/20 text-teal-600"
                    : "bg-blue-500/20 text-blue-600",
                )}
              >
                <Icon size={14} />
              </div>
            )}
            <span className="text-[10px] font-black uppercase tracking-tight ">
              {label}
            </span>
          </div>

          <div
            className={cn(
              "relative inline-flex h-4 w-7 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200",
              field.value ? "bg-teal-600" : "bg-slate-300 dark:bg-slate-700",
            )}
          >
            <span
              className={cn(
                "inline-block h-3 w-3 transform rounded-full bg-white transition duration-200",
                field.value ? "translate-x-3" : "translate-x-0",
              )}
            />
          </div>
        </div>
        {mounted && openDialog && createPortal(<ConfirmModal />, document.body)}
      </>
    );
  }

  // Дефолтний варіант без картки
  return (
    <>
      <button
        type="button"
        id={id}
        onClick={handleChange}
        className={cn(
          "relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
          field.value ? "bg-teal-600" : "bg-slate-200 dark:bg-slate-700",
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200",
            field.value ? "translate-x-4" : "translate-x-0",
          )}
        />
      </button>
      {mounted && openDialog && createPortal(<ConfirmModal />, document.body)}
    </>
  );

  function ConfirmModal() {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setOpenDialog(false)}
        />
        <div className="relative bg-white dark:bg-slate-900 w-full max-w-[360px] rounded-[1.5rem] shadow-2xl border border-slate-200 dark:border-white/10 p-6 animate-in zoom-in-95 duration-200">
          <button
            onClick={() => setOpenDialog(false)}
            className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X size={18} />
          </button>
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center mb-3">
              <AlertCircle className="text-teal-600" size={24} />
            </div>
            <h3 className="text-md font-bold mb-1">Підтвердіть дію</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              {text || "Ви впевнені, що хочете змінити статус?"}
            </p>
            <div className="flex w-full gap-3">
              <AppButton
                variant="ghost"
                className="flex-1 text-xs"
                onClick={() => setOpenDialog(false)}
              >
                Відмінити
              </AppButton>
              <AppButton
                className="flex-1 bg-teal-600 text-white text-xs"
                onClick={confirmEnable}
              >
                Підтвердити
              </AppButton>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
