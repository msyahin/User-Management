import { UserActionModal } from '@/features/user-management/user-action-modal';

import type { ContextModalComponent } from './types';

// Modal map with correct types
export const modals = {
  userAction: UserActionModal,
} satisfies Record<string, ContextModalComponent<any>>;

export type ModalTypes = typeof modals;

declare module './types' {
  interface ModalMap extends ModalTypes {}
}