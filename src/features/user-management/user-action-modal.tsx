import type { AxiosError } from 'axios';
import type { IErrorResponse } from '@/features/common';
import type { ContextModalProps } from '@/components/modal/types';

import { toast } from 'sonner'
// import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';

// Shadcn UI Components
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
  FormDescription, // --- ADDED ---
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
import { Switch } from '@/components/ui/switch'; // --- ADDED ---

import { createUser, updateUser } from './api';
// --- UserStatus is removed ---
import { UserFormSchema, IUserRole } from './types';
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
      bio: user?.bio ?? '',
      // --- UPDATED: Use 'active' boolean ---
      active: user?.active ?? true,
    },
  });

  const {
    formState: { isDirty },
  } = form;

  const addMutation = useMutation({
    // Payload is now the correct IAddUserReq type
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
    // Payload is now the correct IAddUserReq type
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
    // data object now contains { ..., active: boolean }
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
            {/* ... other fields (name, email, etc.) ... */}
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

            {/* --- REPLACED flex div --- */}

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
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

            {/* --- REPLACED Status dropdown with Active Switch --- */}
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Active Status</FormLabel>
                    <FormDescription>
                      Set whether this user account is active or inactive.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

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