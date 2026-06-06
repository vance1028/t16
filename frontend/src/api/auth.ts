import request from './request';
import type { User } from '@/types';

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export const login = (params: LoginParams): Promise<LoginResponse> => {
  return request.post('/auth/login', params);
};

export const getProfile = (): Promise<User> => {
  return request.get('/auth/profile');
};
