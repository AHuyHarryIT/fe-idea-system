import { apiClient } from './client'
import type {
  ApiResponse,
  CreateDepartmentPayload,
  Department,
  DepartmentListResponse,
  UpdateDepartmentPayload,
} from '@/types'

function normalizeDepartmentsResponse(
  data?: Department[] | DepartmentListResponse,
): Department[] {
  if (Array.isArray(data)) {
    return data
  }

  if (data && Array.isArray(data.departments)) {
    return data.departments
  }

  return []
}

export const departmentService = {
  getDepartments: async (): Promise<ApiResponse<Department[]>> => {
    const response = await apiClient.get<Department[] | DepartmentListResponse>(
      '/departments',
    )

    if (!response.success) {
      return response as ApiResponse<Department[]>
    }

    return {
      ...response,
      data: normalizeDepartmentsResponse(response.data),
    }
  },

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
