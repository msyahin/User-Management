import type { Dayjs } from 'dayjs';

export type IDateValue = string | number | null;

export type IDatePickerControl = Dayjs | null;

export type ISocialLink = {
  facebook: string;
  instagram: string;
  linkedin: string;
  twitter: string;
};

export type IErrorResponse = {
  code: string;
  message?: string;
};

export type IPaginationParams = {
  paginationToken?: string;
  limit?: number;
};

export type IPaginationResponse<T> = {
  data: T[];
  totalSize: number;
  previous: string | null;
  next: string | null;
};
