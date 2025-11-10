import React, {
  useRef,
  useMemo,
  useState,
  useEffect,
  useContext,
  useCallback,
  createContext,
} from 'react';

import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
} from 'src/components/ui/dialog';
import { AlertModal } from './alert-modal';

import type {
  ModalNames,
  AlertModalProps,
  ModalContextType,
  OpenContextModalProps,
} from './types';

let modalManagerRef: ModalContextType | null = null;

const ModalsContext = createContext<ModalContextType | null>(null);

export const ModalManagerProvider = ({
  children,
  modals,
  withCloseButton = true,
  closeOnClickOutside = false,
}: {
  children: React.ReactNode;
  modals: Record<string, React.ComponentType<any>>;
  withCloseButton?: boolean;
  closeOnClickOutside?: boolean;
}) => {
  const [modalsState, setModalsState] = useState<Array<any>>([]);
  const idRef = useRef(0);

  const openContextModal = useCallback(
    <K extends ModalNames>({
      modal,
      title,
      innerProps,
      dialogProps,
      withCloseButton: modalCloseButton,
      closeOnClickOutside: modalClickOutside,
    }: OpenContextModalProps<K> & {
      title?: React.ReactNode;
      withCloseButton?: boolean;
      closeOnClickOutside?: boolean;
    }): string => {
      idRef.current += 1;
      const id = `modal-${idRef.current}`;
      setModalsState((prev) => [
        ...prev,
        {
          id,
          modal,
          title,
          innerProps,
          dialogProps,
          withCloseButton: modalCloseButton ?? withCloseButton,
          closeOnClickOutside: modalClickOutside ?? closeOnClickOutside,
        },
      ]);
      return id;
    },
    [withCloseButton, closeOnClickOutside]
  );

  const openAlertModal = useCallback(
    ({
      title,
      description,
      onCancel,
      onConfirm,
      cancelText,
      confirmText,
      confirmVariant,
    }: AlertModalProps): string => {
      idRef.current += 1;
      const id = `alert-modal-${idRef.current}`;
      setModalsState((prev) => [
        ...prev,
        {
          id,
          modal: '__alert__',
          title,
          innerProps: {
            title,
            description,
            onCancel,
            onConfirm,
            cancelText,
            confirmText,
            confirmVariant,
          },
          dialogProps: {},
          withCloseButton: true, // Alert modals should have close button
          closeOnClickOutside: false, // Alert modals shouldn't close on outside click
        },
      ]);
      return id;
    },
    []
  );

  const closeModal = useCallback((id: string) => {
    setModalsState((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const closeAllModals = useCallback(() => setModalsState([]), []);

  const contextValue = useMemo<ModalContextType>(
    () => ({ openContextModal, openAlertModal, closeModal, closeAllModals }),
    [openContextModal, openAlertModal, closeModal, closeAllModals]
  );

  const allModals: Record<string, React.ComponentType<any>> = {
    ...modals,
    __alert__: AlertModal,
  };

  useEffect(() => {
    modalManagerRef = contextValue;
  }, [contextValue]);

  return (
    <ModalsContext.Provider value={contextValue}>
      {children}
      {modalsState.map(
        ({
          id,
          modal,
          title,
          innerProps,
          dialogProps,
          withCloseButton: modalCloseButton,
          closeOnClickOutside: modalClickOutside,
        }) => {
          const ModalComponent = allModals[modal as string];
          if (!ModalComponent || typeof ModalComponent !== 'function') return null;

          const handleClose = () => closeModal(id);
          const shouldShowCloseButton = modalCloseButton ?? withCloseButton;
          const shouldCloseOnClickOutside = modalClickOutside ?? closeOnClickOutside;

          return (
            <Dialog
              key={id}
              open
              onOpenChange={(open) => {
                if (!open) {
                  if (shouldCloseOnClickOutside) {
                    handleClose();
                  }
                }
              }}
              {...dialogProps}
            >
              <DialogContent
                showCloseButton={shouldShowCloseButton}
                onEscapeKeyDown={(e) => {
                  if (!shouldCloseOnClickOutside) {
                    e.preventDefault();
                  }
                }}
                onPointerDownOutside={(e) => {
                  if (!shouldCloseOnClickOutside) {
                    e.preventDefault();
                  }
                }}
              >
                {title && (
                  <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                  </DialogHeader>
                )}
                <ModalComponent id={id} innerProps={innerProps} context={contextValue} />
              </DialogContent>
            </Dialog>
          );
        }
      )}
    </ModalsContext.Provider>
  );
};

export const useModalManager = () => {
  const ctx = useContext(ModalsContext);
  if (!ctx) throw new Error('useContextModals must be used within ModalsProvider');
  return ctx;
};

export const getModalManager = (): ModalContextType => {
  if (!modalManagerRef) {
    throw new Error('ModalManager is not initialized yet.');
  }
  return modalManagerRef;
};
