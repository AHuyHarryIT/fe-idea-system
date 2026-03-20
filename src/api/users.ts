import { apiClient } from './client'
import type { ApiResponse } from './client'

export interface User {
  id: string
  email: string
  name: string
  role: string
  department?: string
  avatar?: string
  createdAt?: string
}

export interface UserListResponse {
  users: Array<User>
  availableRoles?: Array<string>
}

export interface CreateUserRequest {
  email: string
  name: string
  password?: string
  role: string
}

export interface UpdateRoleRequest {
  role: string
}

export const userService = {
  // Admin endpoints
  getUsers: (): Promise<ApiResponse<UserListResponse>> =>
    apiClient.get<UserListResponse>('/User'),

  createUser: (
    request: CreateUserRequest
  ): Promise<ApiResponse<User>> =>
    apiClient.post<User>('/User', request),

  updateUserRole: (
    userId: string,
    request: UpdateRoleRequest
  ): Promise<ApiResponse<User>> =>
    apiClient.put<User>(`/User/${userId}/role`, request),

  deleteUser: (userId: string): Promise<ApiResponse<void>> =>
    apiClient.delete<void>(`/User/${userId}`),
}
