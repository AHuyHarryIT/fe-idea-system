import { apiClient } from './client'
import type { ApiResponse } from './client'

export interface Idea {
  id: string
  text: string
  description: string
  categoryId: string
  categoryName: string
  submissionId: string
  submissionName: string
  votes: number
  commentsCount: number
  isAnonymous: boolean
  createdBy: string
  createdAt: string
  status: string
}

export interface IdeaListResponse {
  ideas: Array<Idea>
  total: number
  pageNumber: number
  pageSize: number
}

export interface Comment {
  id: string
  text: string
  isAnonymous: boolean
  createdBy: string
  createdAt: string
}

export interface CommentCreateRequest {
  text: string
  isAnonymous: boolean
}

export interface VoteRequest {
  isThumbsUp: boolean
}

export const ideaService = {
  // Staff endpoints
  getMyIdeas: (): Promise<ApiResponse<IdeaListResponse>> =>
    apiClient.get<IdeaListResponse>('/Idea/my-ideas'),

  getAllIdeas: (): Promise<ApiResponse<IdeaListResponse>> =>
    apiClient.get<IdeaListResponse>('/Idea'),

  submitIdea: (
    formData: FormData
  ): Promise<ApiResponse<Idea>> =>
    apiClient.uploadFiles<Idea>('/Idea', formData),

  getIdeaById: (id: string): Promise<ApiResponse<Idea>> =>
    apiClient.get<Idea>(`/Idea/${id}`),

  voteOnIdea: (
    ideaId: string,
    request: VoteRequest
  ): Promise<ApiResponse<void>> =>
    apiClient.post(`/Idea/${ideaId}/vote`, request),

  addComment: (
    ideaId: string,
    request: CommentCreateRequest
  ): Promise<ApiResponse<Comment>> =>
    apiClient.post(`/Idea/${ideaId}/comments`, request),

  // QA Coordinator endpoints
  getQACoordinatorIdeas: (): Promise<ApiResponse<IdeaListResponse>> =>
    apiClient.get<IdeaListResponse>('/Idea'),

  voteOnIdeaAsQACoordinator: (
    ideaId: number,
    request: VoteRequest
  ): Promise<ApiResponse<void>> =>
    apiClient.post(`/Idea/${ideaId}/vote`, request),

  // Admin endpoints
  getAllIdeasAsAdmin: (): Promise<ApiResponse<IdeaListResponse>> =>
    apiClient.get<IdeaListResponse>('/Idea'),

  // QA Manager endpoints
  getQAManagerIdeas: (): Promise<ApiResponse<IdeaListResponse>> =>
    apiClient.get<IdeaListResponse>('/Idea'),

  getIdeasWithoutComments: (): Promise<ApiResponse<IdeaListResponse>> =>
    apiClient.get<IdeaListResponse>('/Stats/ideas-without-comments'),
}
