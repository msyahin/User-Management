import type { AxiosError, AxiosResponse } from 'axios';
import axios from 'axios';
import type { IAddUserReq, IListUserReq, IListUserRes } from './types';
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

export const uploadToImgBb = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('key', CONFIG.APP_IMGBB_API_KEY);

  try {
    const response = await axios.post('https://api.imgbb.com/1/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (response.data && response.data.data && response.data.data.url) {
      return response.data.data.url;
    }
    throw new Error('Invalid response from ImgBB');
  } catch (error) {
    console.error('ImgBB upload failed:', error);
    throw new Error('Image upload failed');
  }
};

export const fetchUsers = async (params: IListUserReq): Promise<IListUserRes> => {
  const cleanParams: Record<string, string | number | boolean> = {};

  if (params.search) {
    cleanParams.search = params.search;
  }
  if (params.role) {
    cleanParams.role = params.role;
  }
  if (params.sortBy) {
    cleanParams.sortBy = params.sortBy; 
  }
  if (params.order) {
    cleanParams.order = params.order; 
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
  await axiosInstance.post('/api/v1/user', payload);
};

export const updateUser = async (
  userId: string, // MockAPI uses string ID
  payload: Partial<IAddUserReq>
): Promise<void> => {
  await axiosInstance.put(`/api/v1/user/${userId}`, payload);
};

export const deleteUser = async (userId: string): Promise<void> => {
  await axiosInstance.delete(`/api/v1/user/${userId}`);
};