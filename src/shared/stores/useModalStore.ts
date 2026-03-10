import { create } from 'zustand';
import { ReactNode } from 'react';

interface ModalConfig {
  title?: string;
  description?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

interface ModalStore {
  isOpen: boolean;
  view: ReactNode | null;
  config: ModalConfig;
  data: any;
  openModal: (view: ReactNode, config?: ModalConfig, data?: any) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  isOpen: false,
  view: null,
  config: {},
  data: null,
  openModal: (view, config = {}, data = null) => 
    set({ 
      isOpen: true, 
      view, 
      config: {
        size: 'md',
        ...config
      }, 
      data 
    }),
  closeModal: () => set({ isOpen: false, view: null, config: {}, data: null }),
}));
