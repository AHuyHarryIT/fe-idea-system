import { apiClient } from './client'
import type { ApiResponse } from './client'

export interface IdeaCategory {
  id: string
  name: string
}

export interface CreateIdeaCategoryRequest {
  name: string
}

export const categoryService = {
  getIdeaCategories: (): Promise<ApiResponse<IdeaCategory[]>> =>
    apiClient.get<IdeaCategory[]>('/categories'),

  createIdeaCategory: (
    request: CreateIdeaCategoryRequest,
  ): Promise<ApiResponse<IdeaCategory>> =>
    apiClient.post<IdeaCategory>('/categories', request),

  updateIdeaCategory: (
    id: string,
    request: CreateIdeaCategoryRequest,
  ): Promise<ApiResponse<IdeaCategory>> =>
    apiClient.put<IdeaCategory>(`/categories/${id}`, request),

  deleteIdeaCategory: (id: string): Promise<ApiResponse<void>> =>
    apiClient.delete(`/categories/${id}`),
}
