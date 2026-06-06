import request from './request';
import type { DashboardStats, HazardPoint, Warning } from '@/types';

export const getDashboardStats = (): Promise<DashboardStats> => {
  return request.get('/dashboard/stats');
};

export const getMapPoints = (): Promise<HazardPoint[]> => {
  return request.get('/dashboard/hazard-points-map');
};

export const getRecentWarnings = (): Promise<Warning[]> => {
  return request.get('/dashboard/recent-warnings');
};

export interface MiningAreaCompletion {
  miningArea: string;
  total: number;
  completed: number;
  completionRate: number;
}

export const getMiningAreaCompletion = (): Promise<MiningAreaCompletion[]> => {
  return request.get('/dashboard/mining-area-completion');
};
