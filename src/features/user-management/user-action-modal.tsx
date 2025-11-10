import type { AxiosError } from 'axios';
import type { IErrorResponse } from '@/features/common'; // Assuming this global type
import type { ContextModalProps } from '@/components/modal/types'; // CORRECTED PATH

import { toast } from 'sonner';
// import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';

// Shadcn UI Form + Dialog Components - CORRECTED PATHS
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// Relative paths, no changes needed
import { createUser, updateUser } from './api';
import { UserFormSchema, IUserRole, IUserStatus } from './types';
import type { IAddUserReq, IUserManagement } from './types';

export const UserActionModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<{
  type: 'create' | 'edit';
  user?: IUserManagement;
  onSuccess: () => void;
}>) => {
  const { type, user, onSuccess } = innerProps;
//   const { t } = useTranslation();

  const form = useForm<IAddUserReq>({
    resolver: zodResolver(UserFormSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      phoneNumber: user?.phoneNumber ?? '',
      avatar: user?.avatar ?? '',
      role: user?.role,
      status: user?.active ? IUserStatus.ACTIVE : IUserStatus.INACTIVE,
      bio: user?.bio ?? '',
    },
  });

  const {
    formState: { isDirty },
  } = form;

  const addMutation = useMutation({
    mutationFn: async (values: IAddUserReq) => createUser(values),
    onSuccess: () => {
      toast.success('User added successfully.');
      onSuccess();
      context.closeModal(id);
    },
    onError: (error: AxiosError) => {
      const errorPayload = error?.response?.data as IErrorResponse;
      toast.error(errorPayload?.message ?? 'Failed to create new user');
    },
  });

  const editMutation = useMutation({
    mutationFn: async (values: IAddUserReq) =>
      updateUser(user?.id ?? '0', values),
    onSuccess: () => {
      toast.success('User updated successfully.');
      onSuccess();
      context.closeModal(id);
    },
    onError: (error: AxiosError) => {
      const errorPayload = error?.response?.data as IErrorResponse;
      toast.error(errorPayload?.message ?? 'Failed to update user');
    },
  });

  const onSubmit = async (data: IAddUserReq) => {
    if (type === 'create') {
      addMutation.mutate(data);
    }
    if (type === 'edit') {
      editMutation.mutate(data);
    }
  };

  return (
    <Dialog open onOpenChange={() => context.closeModal(id)}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>
            {type === 'create' ? 'Add User' : 'Update User'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="john.doe@example.com"
                      {...field}
                      disabled={type === 'edit'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 234 567 890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="avatar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(IUserRole).map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(IUserStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us a little bit about the user..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                {/* <Button variant="outline">{t('button.cancel')}</Button> */}
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={!isDirty || addMutation.isPending || editMutation.isPending}
              >
                {addMutation.isPending || editMutation.isPending
                  ? 'Saving...'
                  : type === 'create'
                    ? 'Create User'
                    : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};