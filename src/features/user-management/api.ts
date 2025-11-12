import type { AxiosError, AxiosResponse } from 'axios';
import axios from 'axios';
import type { IAddUserReq, IListUserReq, IListUserRes, IUserManagement } from './types';
import { CONFIG } from '@/config-global';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

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
  const {
    search,
    role,
    page = 1,
    limit = 10,
    sortBy,
    order,
    startDate,
    endDate,
  } = params;

  const res = await axiosInstance.get('/api/v1/user');
  const allUsers: IUserManagement[] = res.data;

  const filteredUsers = allUsers.filter((user) => {
    if (search) {
      const lowerSearch = search.toLowerCase();
      const nameMatch = user.name.toLowerCase().includes(lowerSearch);
      const emailMatch = user.email.toLowerCase().includes(lowerSearch);
      if (!nameMatch && !emailMatch) {
        return false;
      }
    }

    if (role) {
      if (user.role !== role) {
        return false;
      }
    }

    if (startDate && endDate) {
      const userDate = dayjs(user.createdAt);
      if (
        !userDate.isBetween(
          dayjs(startDate).startOf('day'),
          dayjs(endDate).endOf('day'),
          null,
          '[]'
        )
      ) {
        return false;
      }
    }

    return true;
  });

  if (sortBy && order) {
    filteredUsers.sort((a, b) => {
      const valA = a[sortBy as keyof IUserManagement];
      const valB = b[sortBy as keyof IUserManagement];

      if (typeof valA === 'string' && typeof valB === 'string') {
        return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return order === 'asc' ? valA - valB : valB - valA;
      }
      // Fallback 
      return order === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }

  const totalSize = filteredUsers.length;
  const paginatedData = filteredUsers.slice(
    (page - 1) * limit,
    page * limit
  );

  return {
    data: paginatedData,
    totalSize: totalSize,
  };
};

export const createUser = async (payload: IAddUserReq): Promise<void> => {
  await axiosInstance.post('/api/v1/user', payload);
};

export const updateUser = async (
  userId: string,
  payload: Partial<IAddUserReq>
): Promise<void> => {
  await axiosInstance.put(`/api/v1/user/${userId}`, payload);
};

export const deleteUser = async (userId: string): Promise<void> => {
  await axiosInstance.delete(`/api/v1/user/${userId}`);
};