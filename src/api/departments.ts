import { apiClient } from './client'
import type {
  ApiResponse,
  CreateDepartmentPayload,
  Department,
  DepartmentListQueryParams,
  DepartmentListResponse,
  UpdateDepartmentPayload,
} from '@/types'

export const departmentService = {
  getDepartments: (
    params?: DepartmentListQueryParams,
  ): Promise<ApiResponse<DepartmentListResponse>> =>
    apiClient.get<DepartmentListResponse, DepartmentListQueryParams>(
      '/departments',
      { params },
    ),

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
