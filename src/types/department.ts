export interface DepartmentIdea {
  id: string
  text: string
}

export interface Department {
  id: string
  name: string
  description?: string
  ideas?: DepartmentIdea[]
}

export interface DepartmentListResponse {
  departments?: Department[]
  pagination?: DepartmentListPagination
}

export interface DepartmentListPagination {
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface DepartmentListQueryParams {
  pageNumber?: number
  pageSize?: number
  searchTerm?: string
  fetchAll?: boolean
}

export interface CreateDepartmentPayload {
  name: string
  description?: string
}

export interface UpdateDepartmentPayload {
  name: string
  description?: string
}
