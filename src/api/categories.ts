import { apiClient } from './client'
import type { ApiResponse } from './client'

export interface Category {
  id: string
  name: string
}

export interface CreateCategoryRequest {
  name: string
}

export const categoryService = {
  // Staff endpoints
  getStaffCategories: (): Promise<ApiResponse<Array<Category>>> =>
    apiClient.get<Array<Category>>('/Categories'),

  // Admin endpoints
  getAdminCategories: (): Promise<ApiResponse<Array<Category>>> =>
    apiClient.get<Array<Category>>('/Categories'),

  createAdminCategory: (
    request: CreateCategoryRequest
  ): Promise<ApiResponse<Category>> =>
    apiClient.post<Category>('/Categories', request),

  deleteAdminCategory: (id: string): Promise<ApiResponse<void>> =>
    apiClient.delete(`/Categories/${id}`),

  // QA Manager endpoints
  getQAManagerCategories: (): Promise<ApiResponse<Array<Category>>> =>
    apiClient.get<Array<Category>>('/Categories'),

  createQAManagerCategory: (
    request: CreateCategoryRequest
  ): Promise<ApiResponse<Category>> =>
    apiClient.post<Category>('/Categories', request),

  deleteQAManagerCategory: (id: string): Promise<ApiResponse<void>> =>
    apiClient.delete(`/Categories/${id}`),

  // Public endpoints
  getCategories: (): Promise<ApiResponse<Array<Category>>> =>
    apiClient.get<Array<Category>>('/Categories'),

  createCategory: (
    request: CreateCategoryRequest
  ): Promise<ApiResponse<Category>> =>
    apiClient.post<Category>('/Categories', request),

  deleteCategory: (id: string): Promise<ApiResponse<void>> =>
    apiClient.delete(`/Categories/${id}`),
}
