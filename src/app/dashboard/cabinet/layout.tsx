import React from "react";

export default function CabinetLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="text-center bg-white dark:bg-slate-900 p-10 rounded-2xl border shadow-sm max-w-lg w-full">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">Кабінет перевізника</h2>
        <p className="text-slate-600 dark:text-slate-400">На даний момент знаходиться в розробці</p>
      </div>
    </div>
  );
}
