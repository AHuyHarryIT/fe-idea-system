import { apiClient } from './client'
import type { ApiResponse } from './client'

export interface Department {
  id: string
  name: string
  description?: string
  ideas?: { id: string; text: string }[]
}

export interface DepartmentListResponse {
  departments?: Department[]
}

export interface CreateDepartmentPayload {
  name: string
  description?: string
}

export interface UpdateDepartmentPayload {
  name: string
  description?: string
}

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
