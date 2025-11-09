import { z } from 'zod';

export type User = {
  id: string;
  createdAt: string;
  name: string;
  phoneNumber: string;
  email: string;
  avatar: string;
  active: boolean;
  role: 'Admin' | 'User' | 'Guest';
  bio: string;
};
