import type { ApiResponse, ListQueryParams, ListResponse, JsonValue } from "@/types"
import { apiClient } from "./client"

/**
 * Generic CRUD Service Factory
 * Reduces code duplication by auto-generating CRUD methods for any resource
 *
 * Usage:
 * ```
 * export const categoryService = createCrudService<IdeaCategory, CreateIdeaCategoryRequest>("categories", "categories")
 * ```
 */
export function createCrudService<
  TResource,
  TCreatePayload,
  TUpdatePayload = TCreatePayload,
  TListResponse = ListResponse<TResource, "data">,
  TQueryParams extends ListQueryParams = ListQueryParams,
>(
  endpoint: string,
) {
  return {
    /**
     * Get all resources with optional pagination and filtering
     */
    getAll: (
      params?: TQueryParams,
    ): Promise<ApiResponse<TListResponse>> =>
      apiClient.get<TListResponse, TQueryParams>(endpoint, {
        params,
      }),

    /**
     * Get a single resource by ID
     */
    getById: (id: string): Promise<ApiResponse<TResource>> =>
      apiClient.get<TResource>(`${endpoint}/${id}`),

    /**
     * Create a new resource
     */
    create: (
      payload: TCreatePayload,
    ): Promise<ApiResponse<TResource>> =>
      apiClient.post<TResource>(endpoint, payload as JsonValue),

    /**
     * Update an existing resource
     */
    update: (
      id: string,
      payload: TUpdatePayload,
    ): Promise<ApiResponse<TResource>> =>
      apiClient.put<TResource>(`${endpoint}/${id}`, payload as JsonValue),

    /**
     * Delete a resource
     */
    delete: (id: string): Promise<ApiResponse<void>> =>
      apiClient.delete<void>(`${endpoint}/${id}`),
  }
}

/**
 * Extended CRUD service for resources that need custom response normalization
 * Useful for resources with irregular API responses or complex data transformations
 */
export function createCrudServiceWithNormalizer<
  TResource,
  TCreatePayload,
  TUpdatePayload = TCreatePayload,
  TListResponse = ListResponse<TResource, "data">,
  TQueryParams extends ListQueryParams = ListQueryParams,
  TRawResponse extends object = Record<string, string | number | boolean | null>,
>(
  endpoint: string,
  normalizer: (data?: TRawResponse) => TListResponse,
) {
  const baseService = createCrudService<
    TResource,
    TCreatePayload,
    TUpdatePayload,
    TListResponse,
    TQueryParams
  >(endpoint)

  return {
    ...baseService,

    /**
     * Get all resources with normalization of irregular response format
     */
    getAll: async (
      params?: TQueryParams,
    ): Promise<ApiResponse<TListResponse>> => {
      const response = await apiClient.get<TRawResponse, TQueryParams>(endpoint, {
        params,
      })

      if (!response.success) {
        return {
          success: false,
          error: response.error,
        } as ApiResponse<TListResponse>
      }

      return {
        ...response,
        data: normalizer(response.data),
      } as ApiResponse<TListResponse>
    },
  }
}
