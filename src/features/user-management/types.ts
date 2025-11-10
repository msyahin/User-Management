import { z } from 'zod';

export enum IUserRole {
  ADMIN = 'Admin',
  USER = 'User',
  GUEST = 'Guest'
}

export enum IUserStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

export type IUserManagement = {
  id: string;
  createdAt: string;
  name: string;
  phoneNumber: string;
  email: string;
  avatar: string;
  active: boolean;
  role: IUserRole;
  bio: string;
};

export const UserFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email('Invalid email format').min(1, 'Email is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  avatar: z.url('Must be a valid URL').optional().or(z.literal('')),
  role: z.enum(IUserRole),
  status: z.enum(IUserStatus),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
});

export type IAddUserReq = z.infer<typeof UserFormSchema>;

export type IListUserReq = {
  search?: string;
  role?: IUserRole | '';
  createdAt?: Date | null;
  sortBy?: string;
  order?: 'asc' | 'desc';
};

export type IListUserRes = {
  data: IUserManagement[];
  totalSize: number;
};
