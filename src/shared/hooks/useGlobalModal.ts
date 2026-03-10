import { useModalStore } from "@/shared/stores/useModalStore";
import { ReactNode } from "react";

export const useModal = () => {
  const { openModal, closeModal, isOpen, data, config } = useModalStore();

  const open = (
    view: ReactNode, 
    options?: { 
      title?: string; 
      description?: string; 
      size?: "sm" | "md" | "lg" | "xl" | "full";
      className?: string;
    },
    data?: any
  ) => {
    openModal(view, options, data);
  };

  return {
    open,
    close: closeModal,
    isOpen,
    data,
    config
  };
};
