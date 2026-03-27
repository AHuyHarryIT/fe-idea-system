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
  getIdeaCategories: (): Promise<ApiResponse<Array<IdeaCategory>>> =>
    apiClient.get<Array<IdeaCategory>>('/Categories'),

  createIdeaCategory: (
    request: CreateIdeaCategoryRequest,
  ): Promise<ApiResponse<IdeaCategory>> =>
    apiClient.post<IdeaCategory>('/Categories', request),

  updateIdeaCategory: (
    id: string,
    request: CreateIdeaCategoryRequest,
  ): Promise<ApiResponse<IdeaCategory>> =>
    apiClient.put<IdeaCategory>(`/Categories/${id}`, request),

  deleteIdeaCategory: (id: string): Promise<ApiResponse<void>> =>
    apiClient.delete(`/Categories/${id}`),
}
