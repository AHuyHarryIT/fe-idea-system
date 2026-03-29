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
  thumbStatus?: number
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
  text?: string
  content?: string
  isAnonymous: boolean
  createdBy?: string
  authorName?: string
  createdAt?: string
  createdDate?: string
}

export interface CommentCreateRequest {
  content: string
  isAnonymous: boolean
}

export interface VoteRequest {
  isThumbsUp?: boolean
}

export interface ReviewIdeaRequest {
  isApproved: boolean
  rejectionReason?: string
}

function getIdeasFromListResponse(data?: IdeaListResponse): Array<Idea> {
  if (!data) {
    return []
  }

  if (Array.isArray(data.items)) {
    return data.items
  }

  if (Array.isArray(data.ideas)) {
    return data.ideas
  }

  return []
}

async function findIdeaByIdFromPagedList(
  id: string,
): Promise<ApiResponse<Idea>> {
  const pageSize = 100
  const firstPageResponse = await apiClient.get<IdeaListResponse>(
    `/ideas?PageNumber=1&PageSize=${pageSize}`,
  )

  if (!firstPageResponse.success) {
    return { success: false, error: firstPageResponse.error }
  }

  const firstPageIdeas = getIdeasFromListResponse(firstPageResponse.data)
  const firstMatch = firstPageIdeas.find((idea) => idea.id === id)

  if (firstMatch) {
    return { success: true, data: firstMatch } satisfies ApiResponse<Idea>
  }

  const totalPages =
    firstPageResponse.data?.totalPages ??
    Math.max(
      1,
      Math.ceil((firstPageResponse.data?.totalCount ?? firstPageIdeas.length) / pageSize),
    )

  for (let pageNumber = 2; pageNumber <= totalPages; pageNumber += 1) {
    const pageResponse = await apiClient.get<IdeaListResponse>(
      `/ideas?PageNumber=${pageNumber}&PageSize=${pageSize}`,
    )

    if (!pageResponse.success) {
      return { success: false, error: pageResponse.error }
    }

    const pageIdeas = getIdeasFromListResponse(pageResponse.data)
    const match = pageIdeas.find((idea) => idea.id === id)

    if (match) {
      return { success: true, data: match } satisfies ApiResponse<Idea>
    }
  }

  return {
    success: false,
    error: 'Idea not found in the current idea list.',
  } satisfies ApiResponse<Idea>
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
      `/ideas?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    ),

  getIdeaById: async (id: string): Promise<ApiResponse<Idea>> => {
    const directResponse = await apiClient.get<Idea>(`/ideas/${id}`)

    if (directResponse.success || directResponse.error !== 'HTTP 404') {
      return directResponse
    }

    return findIdeaByIdFromPagedList(id)
  },

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

  reviewIdea: (
    ideaId: string,
    request: ReviewIdeaRequest,
  ): Promise<ApiResponse<void>> =>
    apiClient.put<void>(`/ideas/${ideaId}/review`, request),

  // QA Manager endpoints
  getIdeasWithoutComments: (): Promise<ApiResponse<IdeaListResponse>> =>
    apiClient.get<IdeaListResponse>('/Stats/ideas-without-comments'),
}
