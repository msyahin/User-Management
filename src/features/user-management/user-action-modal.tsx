import type { AxiosError } from 'axios';
import type { IErrorResponse } from '@/features/common';
import type { ContextModalProps } from '@/components/modal/types';

import { useState } from 'react';
import { toast } from 'sonner';
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
  FormDescription,
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
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { createUser, updateUser, uploadToImgBb } from './api';
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
  const [preview, setPreview] = useState<string | null>(user?.avatar || null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<IAddUserReq>({
    resolver: zodResolver(UserFormSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      phoneNumber: user?.phoneNumber ?? '',
      avatar: user?.avatar ?? '',
      role: user?.role,
      bio: user?.bio ?? '',
      active: user?.active ?? true,
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
    setIsUploading(true);
    let submissionData = { ...data };
    let uploadToast: string | number | undefined;

    try {
      if (submissionData.avatar && typeof submissionData.avatar !== 'string') {
        uploadToast = toast.loading('Uploading avatar...');
        const imageUrl = await uploadToImgBb(submissionData.avatar);
        submissionData.avatar = imageUrl;
        toast.success('Avatar uploaded!', { id: uploadToast });
      }
      if (type === 'create') {
        addMutation.mutate(submissionData);
      }
      if (type === 'edit') {
        editMutation.mutate(submissionData);
      }
    } catch (error) {
      console.error('Submission error:', error);
      if (uploadToast) {
        toast.error('Avatar upload failed.', { id: uploadToast });
      } else {
        toast.error('Failed to save user.');
      }
    } finally {
      setIsUploading(false);
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
                        {/* --- REPLACED AVATAR FIELD --- */}
            <FormField
              control={form.control}
              name="avatar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar</FormLabel>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={preview || undefined} />
                      <AvatarFallback>
                        {form.getValues('name')?.substring(0, 2).toUpperCase() ||
                          '??'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="w-full space-y-2">
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          disabled={isUploading}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              field.onChange(file);
                              setPreview(URL.createObjectURL(file));
                            }
                          }}
                          className="file:text-primary file:font-semibold"
                        />
                      </FormControl>
                      <div className="relative flex items-center">
                        <div className="h-px w-full bg-border" />
                        <span className="absolute left-1/2 -translate-x-1/2 bg-background px-2 text-xs text-muted-foreground">
                          OR
                        </span>
                      </div>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter image URL"
                          disabled={isUploading}
                          value={typeof field.value === 'string' ? field.value : ''}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            setPreview(e.target.value);
                          }}
                        />
                      </FormControl>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* --- END REPLACED FIELD --- */}
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
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isUploading}
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
                      disabled={isUploading}
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
                      disabled={isUploading}
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
                disabled={
                  !isDirty ||
                  addMutation.isPending ||
                  editMutation.isPending ||
                  isUploading
                }
              >
                {isUploading
                  ? 'Uploading...'
                  : addMutation.isPending || editMutation.isPending
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