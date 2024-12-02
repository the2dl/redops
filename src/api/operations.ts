import { Operation } from '@/lib/types';
import { apiRequest } from './client';

export interface CreateOperationData {
  name: string;
  target: string;
  status: string;
  startDate: string;
  team?: { id: number }[];
  techniques?: string[];
}

export interface UpdateOperationStatusData {
  status: string;
  endDate?: string;
  successRate?: number;
}

export const operationsApi = {
  // Get all operations
  getAll: () => apiRequest<Operation[]>('/operations'),

  // Get single operation
  getById: (id: number) => apiRequest<Operation>(`/operations/${id}`),

  // Create new operation
  create: (data: CreateOperationData) => 
    apiRequest<Operation>('/operations', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Update operation status
  updateStatus: (id: number, data: UpdateOperationStatusData) => 
    apiRequest<Operation>(`/operations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
}; 