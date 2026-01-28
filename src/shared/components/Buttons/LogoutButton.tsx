"use client";

import React, { useState, useRef, useEffect } from "react";
import { LogOut, X, AlertCircle } from "lucide-react";
import { useProfileLogoutMutation } from "@/features/dashboard/profile/main/hooks";
import { LogoutModal } from "../Modals/SystemModals/LogoutModal";
import { useSockets } from "@/shared/providers/SocketProvider";

interface LogoutButtonProps {
  onBeforeOpen?: () => void;
}

export function LogoutButton({ onBeforeOpen }: LogoutButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { logout } = useProfileLogoutMutation();
  const { user: userSocket, chat, tender, load } = useSockets();

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
      const allSockets = [userSocket, chat, tender, load];
      allSockets.forEach(socket => {
      if (socket && typeof socket.disconnect === 'function') {
        socket.disconnect(); 
      }
    });
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

      <LogoutModal
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
}
