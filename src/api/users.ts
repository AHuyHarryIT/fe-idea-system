import { apiClient } from './client'
import type {
  ApiResponse,
  CreateUserRequest,
  UpdateUserRequest,
  User,
  UserListResponse,
} from '@/types'

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
