import request from './request';
import type { HazardPoint, RiskLevel } from '@/types';

export interface HazardPointQuery {
  miningArea?: string;
  riskLevel?: RiskLevel;
  type?: string;
}

export const getHazardPoints = (params?: HazardPointQuery): Promise<HazardPoint[]> => {
  return request.get('/hazard-points', { params });
};

export const getHazardPoint = (id: number): Promise<HazardPoint> => {
  return request.get(`/hazard-points/${id}`);
};

export const createHazardPoint = (data: Partial<HazardPoint>): Promise<HazardPoint> => {
  return request.post('/hazard-points', data);
};

export const updateHazardPoint = (id: number, data: Partial<HazardPoint>): Promise<HazardPoint> => {
  return request.put(`/hazard-points/${id}`, data);
};

export const updateRiskLevel = (id: number, data: { newLevel: RiskLevel; reason: string }): Promise<any> => {
  return request.put(`/hazard-points/${id}/risk-level`, data);
};

export const deleteHazardPoint = (id: number): Promise<any> => {
  return request.delete(`/hazard-points/${id}`);
};
