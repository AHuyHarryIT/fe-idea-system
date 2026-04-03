export interface Submission {
  id: string
  name: string
  description?: string | null
  academicYear?: number | null
  closureDate: string
  finalClosureDate: string
  ideaCount?: number
  isActive?: boolean
}

export interface SubmissionCreateRequest {
  name: string
  description?: string
  academicYear?: number
  closureDate: string
  finalClosureDate: string
}

export interface SubmissionListResponse {
  submissions?: Submission[]
  pagination?: SubmissionListPagination
}

export interface SubmissionListPagination {
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface SubmissionListQueryParams {
  pageNumber?: number
  pageSize?: number
  searchTerm?: string
  fetchAll?: boolean
}
