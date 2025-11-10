import type { ReactNode } from 'react';

import { Dialog, DialogContent } from '@/components/ui/dialog';

import { useModal } from './use-modal';

interface ModalProps {
  children: ReactNode;
}

export default function CustomModal({ children }: ModalProps) {
  const { open, closeModal } = useModal();

  return (
    <Dialog open={open} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
}