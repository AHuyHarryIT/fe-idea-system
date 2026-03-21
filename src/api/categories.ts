import { apiClient } from './client'
import type { ApiResponse } from './client'

// Represents a thematic category used to classify ideas.
export interface IdeaCategory {
  id: string
  name: string
}

// Represents the payload required to create a new idea category.
export interface CreateIdeaCategoryRequest {
  name: string
}

// Provides API operations for retrieving and managing idea categories.
export const categoryService = {
  getIdeaCategories: (): Promise<ApiResponse<Array<IdeaCategory>>> =>
    apiClient.get<Array<IdeaCategory>>('/Categories'),

  createIdeaCategory: (
    request: CreateIdeaCategoryRequest,
  ): Promise<ApiResponse<IdeaCategory>> =>
    apiClient.post<IdeaCategory>('/Categories', request),

  deleteIdeaCategory: (id: string): Promise<ApiResponse<void>> =>
    apiClient.delete(`/Categories/${id}`),
}
