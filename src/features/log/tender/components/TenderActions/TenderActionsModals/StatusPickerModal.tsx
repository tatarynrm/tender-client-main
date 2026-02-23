"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/shared/utils";
import { useTenderManagersFormData } from "@/features/log/hooks/useTenderManagersFormData";
import { Loader2 } from "lucide-react";
import { useUpdateTenderStatus } from "@/features/log/hooks/useUpdateTenderStatus"; // <-- Імпорт нового хука

export const StatusPickerModal = ({
  tenderId,
  onClose,
}: {
  tenderId: string;
  onClose: () => void;
}) => {
  const [mounted, setMounted] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<any>(null);

  const { tenderFilters } = useTenderManagersFormData();
  
  // Використовуємо наш новий хук
  const { mutateAsync: updateStatus, isPending } = useUpdateTenderStatus();

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  if (!mounted) return null;

  const handleConfirm = async (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!selectedStatus || isPending) return;

    try {
      // Викликаємо мутацію
      await updateStatus({
        id: tenderId,
        ids_status: selectedStatus.ids,
      });

      // Закриваємо модалку тільки після успішного виконання
      onClose(); 
    } catch (error) {
      // Помилка вже обробляється всередині onError в хуку (toast)
      console.error(error);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPending) onClose();
      }}
    >
      <div
        className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold mb-1 text-gray-900 text-center">
          Зміна статусу
        </h3>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Тендер <span className="font-bold text-gray-700">#{tenderId}</span>
        </p>

        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300">
          {tenderFilters?.tender_status_dropdown?.map((status: any) => (
            <button
              key={status.ids}
              type="button"
              disabled={isPending}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedStatus(status);
              }}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200",
                selectedStatus?.ids === status.ids
                  ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                  : "border-gray-100 hover:border-gray-300 bg-white",
                isPending && "opacity-50 cursor-not-allowed"
              )}
            >
              <span
                className={cn(
                  "font-medium",
                  selectedStatus?.ids === status.ids
                    ? "text-blue-700"
                    : "text-gray-700",
                )}
              >
                {status.value}
              </span>
              {selectedStatus?.ids === status.ids && (
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              )}
            </button>
          ))}
        </div>

        <div className="mt-8 space-y-3">
          <button
            type="button"
            disabled={!selectedStatus || isPending}
            onPointerDown={handleConfirm}
            className={cn(
              "w-full py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2",
              selectedStatus && !isPending
                ? "bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-100"
                : "bg-gray-200 cursor-not-allowed text-gray-400",
            )}
          >
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Підтвердити зміну"
            )}
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className={cn(
              "w-full py-2 text-sm font-semibold transition-colors",
              isPending ? "text-gray-300 cursor-not-allowed" : "text-gray-400 hover:text-gray-600"
            )}
          >
            Скасувати
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};