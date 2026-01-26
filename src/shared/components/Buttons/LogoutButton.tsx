"use client";

import React, { useState, useRef, useEffect } from "react";
import { LogOut, X, AlertCircle } from "lucide-react";
import { useProfileLogoutMutation } from "@/features/dashboard/profile/main/hooks";

interface LogoutButtonProps {
  onBeforeOpen?: () => void;
}

export function LogoutButton({ onBeforeOpen }: LogoutButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { logout } = useProfileLogoutMutation();

  useEffect(() => {
    if (isDialogOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isDialogOpen]);

  const handleOpenClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onBeforeOpen?.();
    setIsDialogOpen(true);
  };

  const handleConfirmLogout = () => {
    logout();
    setIsDialogOpen(false);
  };

  return (
    <>
      <button
        onClick={handleOpenClick}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors text-left group/btn"
      >
        <LogOut
          size={16}
          strokeWidth={2.5}
          className="group-hover/btn:translate-x-0.5 transition-transform"
        />
        <span className="text-[11px] uppercase tracking-[0.15em] font-bold">
          Вийти
        </span>
      </button>

      {/* --- CONFIRMATION DIALOG --- */}
      <dialog
        ref={dialogRef}
        onClose={() => setIsDialogOpen(false)}
        className="fixed inset-0 z-[100] bg-transparent p-0 m-auto backdrop:bg-slate-950/40 backdrop:backdrop-blur-sm shadow-2xl"
      >
        <div className="modal-content w-[calc(100vw-2rem)] max-w-sm bg-white dark:bg-slate-900 border border-zinc-200 dark:border-white/10 rounded-2xl overflow-hidden">
          {/* Верхня частина з акцентом */}
          <div className="relative h-2 bg-rose-500" />

          <div className="flex flex-col items-center p-8 text-center">
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-500/10 rounded-full text-rose-500 animate-pulse-subtle">
              <AlertCircle size={32} strokeWidth={2} />
            </div>

            <h3 className="text-[14px] uppercase tracking-[0.2em] font-black text-slate-900 dark:text-white mb-2">
              Підтвердження
            </h3>
            <p className="text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
              Ви впевнені, що хочете вийти з облікового запису?
            </p>
          </div>

          <div className="flex border-t border-zinc-100 dark:border-white/5">
            <button
              onClick={() => setIsDialogOpen(false)}
              className="flex-1 px-4 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors border-r border-zinc-100 dark:border-white/5"
            >
              Скасувати
            </button>
            <button
              onClick={handleConfirmLogout}
              className="flex-1 px-4 py-4 bg-rose-500 hover:bg-rose-600 text-white text-[10px] uppercase tracking-[0.2em] font-bold transition-all active:opacity-90"
            >
              Так, вийти
            </button>
          </div>
        </div>

        <style jsx>{`
          dialog[open] {
            animation: modal-appear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          }

          dialog::backdrop {
            animation: backdrop-fade 0.3s ease-out;
            background: rgba(2, 6, 23, 0.6);
            backdrop-filter: blur(4px);
          }

          @keyframes modal-appear {
            from {
              opacity: 0;
              transform: scale(0.9) translateY(10px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          @keyframes backdrop-fade {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          .animate-pulse-subtle {
            animation: pulse 2s infinite;
          }

          @keyframes pulse {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
            100% {
              transform: scale(1);
            }
          }
        `}</style>
      </dialog>
    </>
  );
}
