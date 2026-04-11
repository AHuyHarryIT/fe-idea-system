import { apiClient } from "./client"
import type {
  ApiResponse,
  CreateIdeaCategoryRequest,
  IdeaCategory,
  IdeaCategoryListQueryParams,
  IdeaCategoryListResponse,
} from "@/types"

export const categoryService = {
  getIdeaCategories: (
    params?: IdeaCategoryListQueryParams,
  ): Promise<ApiResponse<IdeaCategoryListResponse>> =>
    apiClient.get<IdeaCategoryListResponse, IdeaCategoryListQueryParams>(
      "/categories",
      { params },
    ),

  createIdeaCategory: (
    request: CreateIdeaCategoryRequest,
  ): Promise<ApiResponse<IdeaCategory>> =>
    apiClient.post<IdeaCategory>("/categories", request),

  updateIdeaCategory: (
    id: string,
    request: CreateIdeaCategoryRequest,
  ): Promise<ApiResponse<IdeaCategory>> =>
    apiClient.put<IdeaCategory>(`/categories/${id}`, request),

  deleteIdeaCategory: (id: string): Promise<ApiResponse<void>> =>
    apiClient.delete(`/categories/${id}`),
}
