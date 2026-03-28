import { apiClient } from './client'
import type { ApiResponse } from './client'

export interface User {
  id: string
  email: string
  name: string
  role: string
  departmentName?: string
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

export interface UpdateUserRequest {
  name?: string
  department?: string
  role?: string
  // avatar?: string
}

export const userService = {
  // Admin endpoints
  getUsers: (): Promise<ApiResponse<UserListResponse>> =>
    apiClient.get<UserListResponse>('/users'),

  createUser: (request: CreateUserRequest): Promise<ApiResponse<User>> =>
    apiClient.post<User>('/users', request),

  updateUser: (
    userId: string,
    request: UpdateUserRequest,
  ): Promise<ApiResponse<User>> =>
    apiClient.put<User>(`/users/${userId}`, request),

  updateUserRole: (
    userId: string,
    request: UpdateUserRequest,
  ): Promise<ApiResponse<User>> =>
    apiClient.put<User>(`/users/${userId}/role`, request),

  deleteUser: (userId: string): Promise<ApiResponse<void>> =>
    apiClient.delete<void>(`/users/${userId}`),
}
