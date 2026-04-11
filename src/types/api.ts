export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Generic pagination metadata structure
 * Used across all list responses
 */
export interface Pagination {
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

/**
 * Generic list query parameters
 * Standard parameters for all list endpoints
 */
export interface ListQueryParams {
  pageNumber?: number
  pageSize?: number
  searchTerm?: string
  fetchAll?: boolean
}

/**
 * Generic list response structure
 * @template T - The type of items in the list
 * @template K - The key name for items (e.g., "data", "items", "categories")
 */
export interface ListResponse<T, K extends string = "data"> {
  [P in K]: T[]
} & {
  pagination?: Pagination
}
