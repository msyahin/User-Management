import type { AxiosError, AxiosResponse } from 'axios';

import axios from 'axios';
import type { IAddUserReq, IListUserReq, IListUserRes, IUserManagement } from './types';
import { CONFIG } from '@/config-global';

const axiosInstance = axios.create({
  baseURL: CONFIG.APP_SERVER_URL,
  paramsSerializer: {
    indexes: null,
  },
});

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError): Promise<AxiosError> => {
    throw error;
  }
);

export const fetchUsers = async (params: IListUserReq): Promise<IListUserRes> => {
  const cleanParams: Record<string, string | number | boolean> = {};

  if (params.search) {
    cleanParams.search = params.search; // General search [cite: 37]
  }
  if (params.role) {
    cleanParams.role = params.role; // Role filter [cite: 38]
  }
  if (params.createdAt) {
    // This is tricky with MockAPI. We'll assume it can filter by a date string.
    cleanParams.createdAt = params.createdAt.toISOString().split('T')[0]; // [cite: 38]
  }

  if (params.sortBy) {
    cleanParams.sortBy = params.sortBy; // [cite: 41]
  }
  if (params.order) {
    cleanParams.order = params.order; // [cite: 42]
  }
  const res = await axiosInstance.get('/api/v1/user', { params: cleanParams });
  const data = res.data;
  const totalSize = data.length; // Faking total size
  return{
    data: data,
    totalSize: totalSize
  }
};

export const createUser = async (payload: IAddUserReq): Promise<void> => {
  // [cite: 157]
  await axiosInstance.post('/api/v1/user', payload);
};

export const updateUser = async (
  userId: string, // MockAPI uses string ID
  payload: Partial<IAddUserReq>
): Promise<void> => {
  // [cite: 157]
  await axiosInstance.put(`/api/v1/user/${userId}`, payload);
};

export const deleteUser = async (userId: string): Promise<void> => {
  // [cite: 157]
  await axiosInstance.delete(`/api/v1/user/${userId}`);
};
