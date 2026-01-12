import { Filter } from "lucide-react";
import React from "react";
interface EmptyTendersProps {
  onReset?: () => void;
}
export const EmptyTenders = ({ onReset }: EmptyTendersProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
      <Filter className="w-10 h-10 mb-4 opacity-50" />
      <p className="text-lg font-medium">Нічого не знайдено</p>
      <p className="text-sm">Спробуйте змінити фільтри або скинути їх</p>
      {onReset && (
        <button
          onClick={onReset}
          className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
        >
          Очистити фільтри
        </button>
      )}
    </div>
  );
};
