import { create } from 'zustand';
import { ReactNode } from 'react';

export type ModalType = 'default' | 'confirm' | 'sheet';

interface ModalConfig {
  title?: string;
  description?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  side?: 'top' | 'bottom' | 'left' | 'right'; // For sheets
  variant?: 'default' | 'danger' | 'success' | 'warning'; // For confirm
  confirmText?: string;
  cancelText?: string;
  showComment?: boolean;
  commentPlaceholder?: string;
  onConfirm?: (comment?: string) => void;
  onCancel?: () => void;
  onClose?: () => void;
  closeOnOutsideClick?: boolean;
  showCloseButton?: boolean;
  preventCloseOnOutsideClick?: boolean;
}

interface ModalStore {
  isOpen: boolean;
  type: ModalType;
  view: ReactNode | null;
  config: ModalConfig;
  data: any;
  
  // Standard modal
  openModal: (view: ReactNode, config?: ModalConfig, data?: any) => void;
  
  // Confirmation dialog
  confirm: (config: Omit<ModalConfig, 'side'>) => void;
  
  // Side sheet
  openSheet: (view: ReactNode, config?: ModalConfig, data?: any) => void;
  
  closeModal: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  isOpen: false,
  type: 'default',
  view: null,
  config: {},
  data: null,

  openModal: (view, config = {}, data = null) =>
    set({
      isOpen: true,
      type: 'default',
      view,
      config: {
        size: 'md',
        showCloseButton: true,
        closeOnOutsideClick: true,
        ...config
      },
      data
    }),

  confirm: (config) =>
    set({
      isOpen: true,
      type: 'confirm',
      view: null,
      config: {
        variant: 'default',
        confirmText: 'Підтвердити',
        cancelText: 'Скасувати',
        ...config
      },
      data: null
    }),

  openSheet: (view, config = {}, data = null) =>
    set({
      isOpen: true,
      type: 'sheet',
      view,
      config: {
        side: 'right',
        size: 'md',
        ...config
      },
      data
    }),

  closeModal: () => set({ isOpen: false, view: null, config: {}, data: null }),
}));

