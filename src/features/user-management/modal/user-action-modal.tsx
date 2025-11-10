import type { ContextModalProps } from '@/components/modal/types';

export const UserActionModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  type: 'create' | 'edit';
  // user?: IUserManagement;
  onSuccess: () => void;
}>) => {
  const { type, onSuccess } = innerProps;

  return <div>User Action Modal</div>;
};
