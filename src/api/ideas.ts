import { apiClient } from './client'
import type { ApiResponse } from './client'

export interface Idea {
  id: string
  text?: string // Frontend field
  title?: string // API field (backend sometimes returns this instead of text)
  description?: string
  categoryId?: string
  categoryName: string
  submissionId?: string
  submissionName?: string
  votes?: number
  commentsCount?: number
  thumbsUpCount?: number
  thumbsDownCount?: number
  commentCount?: number
  isAnonymous: boolean
  createdBy?: string
  authorName?: string
  createdAt?: string
  createdDate?: string
  status?: string
  viewCount?: number
  canComment?: boolean
  departmentName?: string
  comments?: Comment[]
}

export interface IdeaListResponse {
  items?: Array<Idea>
  ideas?: Array<Idea>
  totalCount?: number
  total?: number
  pageNumber: number
  pageSize: number
  totalPages?: number
}

export interface IdeaCreateRequest {
  text: string
  description?: string
  categoryId: string
  submissionId?: string
  isAnonymous?: boolean
}

export interface Comment {
  id: string
  text: string
  isAnonymous: boolean
  createdBy?: string
  authorName?: string
  createdAt: string
}

export interface CommentCreateRequest {
  text: string
  isAnonymous: boolean
}

export interface VoteRequest {
  isThumbsUp?: boolean
  isThumbsDown?: boolean
}

export const ideaService = {
  // Common endpoints
  getMyIdeas: (): Promise<ApiResponse<IdeaListResponse>> =>
    apiClient.get<IdeaListResponse>('/ideas/my-ideas'),

  getAllIdeas: (): Promise<ApiResponse<IdeaListResponse>> =>
    apiClient.get<IdeaListResponse>('/ideas'),

  getPagedIdeas: (
    pageNumber: number = 1,
    pageSize: number = 10,
  ): Promise<ApiResponse<IdeaListResponse>> =>
    apiClient.get<IdeaListResponse>(
      `/ideas/paged?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    ),

  getIdeaById: (id: string): Promise<ApiResponse<Idea>> =>
    apiClient.get<Idea>(`/ideas/${id}`),

  createIdea: (request: IdeaCreateRequest): Promise<ApiResponse<Idea>> =>
    apiClient.post<Idea>('/ideas', request),

  submitIdea: (formData: FormData): Promise<ApiResponse<Idea>> =>
    apiClient.uploadFiles<Idea>('/ideas', formData),

  voteOnIdea: (
    ideaId: string,
    request: VoteRequest,
  ): Promise<ApiResponse<void>> =>
    apiClient.post<void>(`/ideas/${ideaId}/vote`, request),

  addComment: (
    ideaId: string,
    request: CommentCreateRequest,
  ): Promise<ApiResponse<Comment>> =>
    apiClient.post<Comment>(`/ideas/${ideaId}/comments`, request),

  // QA Manager endpoints
  getIdeasWithoutComments: (): Promise<ApiResponse<IdeaListResponse>> =>
    apiClient.get<IdeaListResponse>('/Stats/ideas-without-comments'),
}
