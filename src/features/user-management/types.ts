export type IUserManagement = {
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

export type IListUserReq = {
  search?: string;
};
