import { apiClient } from './client'
import type { ApiResponse } from './client'

export interface User {
  id: string
  email: string
  name: string
  role: string
  department?: string
}

export interface UpdateRoleRequest {
  role: string
}

export const userService = {
  // Admin endpoints
  getUsers: (): Promise<ApiResponse<Array<User>>> =>
    apiClient.get<Array<User>>('/User'),

  updateUserRole: (
    userId: string,
    request: UpdateRoleRequest
  ): Promise<ApiResponse<User>> =>
    apiClient.put<User>(`/User/${userId}/role`, request),

  deleteUser: (userId: string): Promise<ApiResponse<void>> =>
    apiClient.delete(`/User/${userId}`),
}
