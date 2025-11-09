import type { User } from './types';

export const getUsers = async (): Promise<User[]> => {
  const response = await fetch('https://68ff8c08e02b16d1753e6ed3.mockapi.io/maia/api/v1/user');
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return response.json();
};
