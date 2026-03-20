import { apiClient } from './client'
import type { ApiResponse } from './client'

export interface Department {
  id: string
  name: string
  description?: string
  ideas?: Array<{ id: string; text: string }>
}

export interface DepartmentListResponse {
  departments?: Array<Department>
}

export const departmentService = {
  getDepartments: (): Promise<ApiResponse<Array<Department>>> =>
    apiClient.get<Array<Department>>('/Department/departments'),
}
