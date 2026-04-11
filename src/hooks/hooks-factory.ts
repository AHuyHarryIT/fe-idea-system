import { useMutation, useQuery   } from "@tanstack/react-query"
import type {UseQueryOptions, UseMutationOptions} from "@tanstack/react-query";
import type { ApiResponse } from "@/types"

/**
 * Generic query hook creator with standardized error handling
 * Reduces boilerplate for useQuery hooks across hooks folder
 *
 * Usage:
 * ```
 * export const useCategories = createQueryHook(
 *   ["categories"],
 *   (params) => categoryService.getAll(params),
 *   { errorMessage: "Failed to load categories" }
 * )
 * ```
 */
export function createQueryHook<TData, TParams extends object = object>(
  queryKey: readonly (string | number)[],
  queryFn: (params?: TParams) => Promise<ApiResponse<TData>>,
  options?: {
    errorMessage?: string
    enabled?: boolean
  } & Omit<UseQueryOptions<TData>, "queryKey" | "queryFn">,
) {
  return (params?: TParams, queryOptions?: { enabled?: boolean }) => {
    const mergedOptions = {
      ...(typeof options?.enabled === "boolean"
        ? { enabled: options.enabled }
        : {}),
      ...(queryOptions?.enabled !== undefined && {
        enabled: queryOptions.enabled,
      }),
    }

    return useQuery({
      queryKey: [...queryKey, params],
      queryFn: async () => {
        const response = await queryFn(params)
        if (response.success && response.data !== undefined) return response.data
        throw new Error(
          response.error ?? options?.errorMessage ?? "Query failed",
        )
      },
      ...options,
      ...mergedOptions,
    })
  }
}

/**
 * Generic mutation hook creator with standardized error handling
 * Reduces boilerplate for useMutation hooks across hooks folder
 *
 * Usage:
 * ```
 * export const useCreateCategory = createMutationHook(
 *   (payload) => categoryService.create(payload),
 *   { errorMessage: "Failed to create category" }
 * )
 * ```
 */
export function createMutationHook<
  TData,
  TVariables,
  TContext = void | object,
>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  options?: {
    errorMessage?: string
  } & Omit<UseMutationOptions<TData, Error, TVariables, TContext>, "mutationFn">,
) {
  return () => {
    return useMutation({
      mutationFn: async (variables: TVariables) => {
        const response = await mutationFn(variables)
        if (response.success && response.data !== undefined) return response.data
        throw new Error(
          response.error ?? options?.errorMessage ?? "Mutation failed",
        )
      },
      ...options,
    })
  }
}

/**
 * Generic ID-based mutation hook (e.g., create, update, delete with ID)
 * Common pattern for CRUD mutations
 *
 * Usage:
 * ```
 * export const useUpdateCategory = createIdMutationHook(
 *   ({ id, data }) => categoryService.update(id, data)
 * )
 * ```
 */
export function createIdMutationHook<
  TData,
  TPayload,
  TContext = void | object,
>(
  mutationFn: (payload: {
    id: string
    data: TPayload
  }) => Promise<ApiResponse<TData>>,
  options?: {
    errorMessage?: string
  } & Omit<
    UseMutationOptions<TData, Error, { id: string; data: TPayload }, TContext>,
    "mutationFn"
  >,
) {
  return () => {
    return useMutation({
      mutationFn: async (payload: { id: string; data: TPayload }) => {
        const response = await mutationFn(payload)
        if (response.success && response.data !== undefined) return response.data
        throw new Error(
          response.error ?? options?.errorMessage ?? "Mutation failed",
        )
      },
      ...options,
    })
  }
}

/**
 * Creates list of hooks for a CRUD resource
 * Returns getAll, getById, create, update, delete hooks
 *
 * Usage:
 * ```
 * export const {
 *   useGetAll: useCategories,
 *   useCreate: useCreateCategory,
 *   useUpdate: useUpdateCategory,
 *   useDelete: useDeleteCategory,
 * } = createCrudHooks({
 *   resource: "categories",
 *   getAll: (params) => categoryService.getAll(params),
 *   getById: (id) => categoryService.getById(id),
 *   create: (data) => categoryService.create(data),
 *   update: ({ id, data }) => categoryService.update(id, data),
 *   delete: (id) => categoryService.delete(id),
 * })
 * ```
 */
export interface CrudHooksConfig<
  TData,
  TListResponse,
  TCreatePayload,
  TUpdatePayload = TCreatePayload,
  TListParams extends object = object,
> {
  resource: string
  getAll?: (
    params?: TListParams,
  ) => Promise<ApiResponse<TListResponse>>
  getById?: (id: string) => Promise<ApiResponse<TData>>
  create?: (payload: TCreatePayload) => Promise<ApiResponse<TData>>
  update?: (
    payload: { id: string; data: TUpdatePayload },
  ) => Promise<ApiResponse<TData>>
  delete?: (id: string) => Promise<ApiResponse<void>>
}

export function createCrudHooks<
  TData,
  TListResponse,
  TCreatePayload,
  TUpdatePayload = TCreatePayload,
  TListParams extends object = object,
>(
  config: CrudHooksConfig<
    TData,
    TListResponse,
    TCreatePayload,
    TUpdatePayload,
    TListParams
  >,
) {
  const hooks = {
    useGetAll: config.getAll
      ? createQueryHook<TListResponse, TListParams>(
          [config.resource],
          config.getAll,
          { errorMessage: `Failed to load ${config.resource}` },
        )
      : null,

    useGetById: config.getById
      ? (id: string) => {
          return useQuery({
            queryKey: [config.resource, id],
            queryFn: async () => {
              if (!id) throw new Error("No ID provided")
              const response = await config.getById!(id)
              if (response.success) return response.data
              throw new Error(
                response.error ?? `Failed to load ${config.resource}`,
              )
            },
          })
        }
      : null,

    useCreate: config.create
      ? createMutationHook(config.create, {
          errorMessage: `Failed to create ${config.resource}`,
        })
      : null,

    useUpdate: config.update
      ? createIdMutationHook(config.update, {
          errorMessage: `Failed to update ${config.resource}`,
        })
      : null,

    useDelete: config.delete
      ? createMutationHook(config.delete, {
          errorMessage: `Failed to delete ${config.resource}`,
        })
      : null,
  }

  return hooks
}
