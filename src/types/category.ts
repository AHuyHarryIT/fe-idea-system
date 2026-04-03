export interface IdeaCategory {
  id: string
  name: string
}

export interface IdeaCategoryListPagination {
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface IdeaCategoryListQueryParams {
  pageNumber?: number
  pageSize?: number
}

export interface IdeaCategoryListResponse {
  categories: IdeaCategory[]
  pagination?: IdeaCategoryListPagination
}

export interface CreateIdeaCategoryRequest {
  name: string
}
