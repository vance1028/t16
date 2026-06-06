import request from './request';
import type { InspectionTask, InspectionRecord, TaskStatus, CheckResult } from '@/types';

export interface TaskQuery {
  status?: TaskStatus;
  inspectorId?: number;
}

export const getInspectionTasks = (params?: TaskQuery): Promise<InspectionTask[]> => {
  return request.get('/inspection-tasks', { params });
};

export const getInspectionTask = (id: number): Promise<InspectionTask> => {
  return request.get(`/inspection-tasks/${id}`);
};

export const createInspectionTask = (data: Partial<InspectionTask>): Promise<InspectionTask> => {
  return request.post('/inspection-tasks', data);
};

export const updateInspectionTask = (id: number, data: Partial<InspectionTask>): Promise<InspectionTask> => {
  return request.put(`/inspection-tasks/${id}`, data);
};

export const startTask = (id: number): Promise<InspectionTask> => {
  return request.post(`/inspection-tasks/${id}/start`);
};

export interface SubmitRecordParams {
  hazardPointId: number;
  checkResults: CheckResult[];
  photos: string[];
  overallConclusion: string;
  weatherCondition?: string;
  remark?: string;
}

export const submitRecord = (id: number, data: SubmitRecordParams): Promise<InspectionRecord> => {
  return request.post(`/inspection-tasks/${id}/submit-record`, data);
};

export const getTaskRecords = (id: number): Promise<InspectionRecord[]> => {
  return request.get(`/inspection-tasks/${id}/records`);
};
