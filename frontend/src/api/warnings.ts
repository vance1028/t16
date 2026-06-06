import request from './request';
import type { Warning, WarningStatus, ResponseAction, RiskLevel } from '@/types';

export interface WarningQuery {
  status?: WarningStatus;
  hazardPointId?: number;
}

export const getWarnings = (params?: WarningQuery): Promise<Warning[]> => {
  return request.get('/warnings', { params });
};

export const getWarning = (id: number): Promise<Warning> => {
  return request.get(`/warnings/${id}`);
};

export const confirmWarning = (id: number): Promise<Warning> => {
  return request.put(`/warnings/${id}/confirm`);
};

export const startResponse = (
  id: number,
  data: { responseActions: ResponseAction[]; responseDescription: string }
): Promise<Warning> => {
  return request.put(`/warnings/${id}/start-response`, data);
};

export const closeWarning = (id: number, data: { closeRemark: string }): Promise<Warning> => {
  return request.put(`/warnings/${id}/close`, data);
};

export const generateWarning = (data: {
  hazardPointId: number;
  riskLevel: RiskLevel;
  triggerReason: string;
}): Promise<Warning> => {
  return request.post('/warnings/generate', data);
};
