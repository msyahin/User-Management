import { Button } from '@/components/ui/button';
import { DialogFooter, DialogDescription } from '@/components/ui/dialog';

import type { AlertModalProps, ModalContextType } from './types';

export const AlertModal = ({
  context,
  id,
  innerProps,
}: {
  context: ModalContextType;
  id: string;
  innerProps: AlertModalProps;
}) => {
  const {
    description,
    onCancel,
    onConfirm,
    cancelText = 'Cancel',
    confirmText = 'Confirm',
    confirmVariant = 'default',
    showCancel = true,
  } = innerProps;

  const handleCancel = () => {
    onCancel?.();
    context.closeModal(id);
  };

  const handleConfirm = () => {
    onConfirm?.();
  };

  return (
    <>
      {description && <DialogDescription>{description}</DialogDescription>}
      <DialogFooter className="pt-4">
        {showCancel && (
          <Button variant="outline" onClick={handleCancel}>
            {cancelText}
          </Button>
        )}
        <Button variant={confirmVariant} onClick={handleConfirm}>
          {confirmText}
        </Button>
      </DialogFooter>
    </>
  );
};