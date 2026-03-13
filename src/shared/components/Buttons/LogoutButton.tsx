"use client";

import React from "react";
import { LogOut } from "lucide-react";
import { useProfileLogoutMutation } from "@/features/dashboard/profile/main/hooks";
import { useModalStore } from "@/shared/stores/useModalStore";
import { useSockets } from "@/shared/providers/SocketProvider";

interface LogoutButtonProps {
  onBeforeOpen?: () => void;
}

export function LogoutButton({ onBeforeOpen }: LogoutButtonProps) {
  const { logout } = useProfileLogoutMutation();
  const { confirm } = useModalStore();
  const { user: userSocket, chat, tender, load } = useSockets();

  const handleConfirmLogout = () => {
    const allSockets = [userSocket, chat, tender, load];
    allSockets.forEach(socket => {
      if (socket && typeof socket.disconnect === 'function') {
        socket.disconnect(); 
      }
    });
    logout();
  };

  const handleOpenClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onBeforeOpen?.();
    
    confirm({
      title: "Вихід",
      description: "Ви впевнені, що хочете вийти з системи?",
      variant: "danger",
      confirmText: "Так, вийти",
      onConfirm: handleConfirmLogout
    });
  };

  return (
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
  );
}
