import type { ComponentProps } from 'react';

import type { Dialog } from 'src/components/ui/dialog';

export type DialogProps = ComponentProps<typeof Dialog>;

export interface ContextModalProps<T extends Record<string, any>> {
  id: string;
  innerProps: T;
  context: ModalContextType;
}

export type ContextModalComponent<T extends Record<string, any>> = React.FC<ContextModalProps<T>>;

export interface ModalMap {}

export type ModalNames = keyof ModalMap extends never ? string : keyof ModalMap;

export type ModalInnerProps<K extends ModalNames> = K extends keyof ModalMap
  ? Parameters<ModalMap[K]>[0] extends { innerProps: infer P }
    ? P
    : any
  : any;

export type OpenContextModalProps<K extends ModalNames> = {
  modal: K;
  title?: React.ReactNode;
  innerProps: ModalInnerProps<K>;
  dialogProps?: Partial<DialogProps>;
  withCloseButton?: boolean;
  closeOnClickOutside?: boolean;
};
export interface AlertModalProps {
  title: string;
  description?: React.ReactNode;
  onCancel?: () => void;
  onConfirm?: () => void;
  cancelText?: string;
  confirmText?: string;
  confirmVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export interface ModalContextType {
  openContextModal: <K extends ModalNames>(props: OpenContextModalProps<K>) => string;
  openAlertModal: (props: AlertModalProps) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
}
