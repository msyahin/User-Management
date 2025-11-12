import type { AxiosError, AxiosResponse } from 'axios';
import axios from 'axios';
import type { IAddUserReq, IListUserReq, IListUserRes } from './types';
import { CONFIG } from '@/config-global';
import dayjs from 'dayjs';
import { formatStr } from '@/utils/format-time';

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
  const formattedStartDate = dayjs(params?.startDate).startOf('day').format(formatStr.tz);
  const formattedEndDate = dayjs(params?.endDate).endOf('day').format(formatStr.tz);

  const res = await axiosInstance.get('/api/v1/user',
    {
      params: {
        ...params,
        startDate: formattedStartDate,
        endDate: formattedEndDate
      }
    });
  const data = res.data;
  const totalSize = data.length; // Faking total size
  return {
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