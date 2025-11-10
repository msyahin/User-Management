import type { AxiosError, AxiosResponse } from 'axios';

import axios from 'axios';
import type { IListUserReq, IUserManagement } from './types';
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

export const fetchUsers = async (params: IListUserReq): Promise<IUserManagement[]> => {
  const res = await axiosInstance.get('/api/v1/user', { params });
  return res.data;
};
