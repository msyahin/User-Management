import type { ReactNode } from 'react';

import { useMemo, useState, useContext, createContext } from 'react';

interface ModalContextType {
  open: boolean;
  contents?: any;
  openModal: (content?: any) => void;
  closeModal: () => void;
}

interface ModalProviderProps {
  children: ReactNode;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: ModalProviderProps) => {
  const [open, setOpen] = useState(false);
  const [contents, setContents] = useState(null);

  const openModal = (content?: any) => {
    if (content) {
      setContents(content);
    } else {
      setContents(null);
    }
    setOpen(true);
  };
  const closeModal = () => {
    setContents(null);
    setOpen(false);
  };

  const contextValue = useMemo(
    () => ({ open, contents, openModal, closeModal }),
    [open, contents] // Only recompute when `open` changes
  );

  return <ModalContext.Provider value={contextValue}>{children}</ModalContext.Provider>;
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};