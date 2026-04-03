import { apiClient } from './client'
import type {
  ApiResponse,
  CreateDepartmentPayload,
  Department,
  UpdateDepartmentPayload,
} from '@/types'

export const departmentService = {
  getDepartments: async (): Promise<ApiResponse<Department[]>> =>
    await apiClient.get<Department[]>('/departments'),

  createDepartment: (
    payload: CreateDepartmentPayload,
  ): Promise<ApiResponse<Department>> =>
    apiClient.post<Department>('/departments', payload),

  updateDepartment: (
    id: string,
    payload: UpdateDepartmentPayload,
  ): Promise<ApiResponse<Department>> =>
    apiClient.put<Department>(`/departments/${id}`, payload),

  deleteDepartment: (id: string): Promise<ApiResponse<void>> =>
    apiClient.delete<void>(`/departments/${id}`),
}
