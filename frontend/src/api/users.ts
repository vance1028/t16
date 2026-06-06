import request from './request';
import type { User, UserRole } from '@/types';

export interface UserQuery {
  role?: UserRole;
}

export const getUsers = (params?: UserQuery): Promise<User[]> => {
  return request.get('/users', { params });
};

export const getInspectors = (): Promise<User[]> => {
  return request.get('/users/inspectors');
};

export const createUser = (data: Partial<User & { password: string }>): Promise<User> => {
  return request.post('/users', data);
};

export const updateUser = (id: number, data: Partial<User & { password?: string }>): Promise<User> => {
  return request.put(`/users/${id}`, data);
};

export const deleteUser = (id: number): Promise<any> => {
  return request.delete(`/users/${id}`);
};
