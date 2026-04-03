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

export interface UserListPagination {
  totalCount?: number
  pageNumber?: number
  pageSize?: number
  totalPages?: number
  hasPreviousPage?: boolean
  hasNextPage?: boolean
}

export interface UserListResponse {
  users: User[]
  availableRoles?: string[]
  pagination?: UserListPagination
}

export interface UserListQueryParams {
  pageNumber?: number
  pageSize?: number
  searchTerm?: string
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
