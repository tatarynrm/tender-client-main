"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion"; // для плавності, або використовуйте чистий CSS
import { GlobalModalContainer } from "../components/Modals/GlobalModals/GlobalModalContainer";
import { RestTimerTracker } from "../components/Modals/GlobalModals/Trackers/RestTimerTracker";

type ModalType = "rest" | "confirm" | "custom" | "workEnd" | null;

interface ModalContextType {
  openModal: (type: ModalType, props?: any) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [modal, setModal] = useState<{ type: ModalType; props: any }>({
    type: null,
    props: {},
  });

  const openModal = (type: ModalType, props = {}) => setModal({ type, props });
  const closeModal = () => setModal({ type: null, props: {} });

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}

      {/* Рендеримо модалку, якщо тип вибрано */}
      <RestTimerTracker />
      <AnimatePresence>
        {modal.type && (
          <GlobalModalContainer
            type={modal.type}
            props={modal.props}
            close={closeModal}
          />
        )}
      </AnimatePresence>
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error("useModal must be used within ModalProvider");
  return context;
};
