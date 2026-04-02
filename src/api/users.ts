import { apiClient } from './client'
import type { ApiResponse } from './client'

export interface User {
  id: string
  email: string
  name: string
  role: string
  departmentId?: string | null
  departmentName?: string
  avatar?: string
  createdAt?: string
}

export interface UserListResponse {
  users: User[]
  availableRoles?: string[]
}

export interface CreateUserRequest {
  email: string
  name: string
  password?: string
  role: string
  departmentId?: string | null
}

export interface UpdateUserRequest {
  name?: string
  departmentId?: string | null
  role?: string
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
    apiClient.put<User>(`/users/${userId}`, request),

  deleteUser: (userId: string): Promise<ApiResponse<void>> =>
    apiClient.delete<void>(`/users/${userId}`),
}
